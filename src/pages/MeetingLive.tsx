import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Badge, Btn, Card } from '../components/ui'
import { meetingNotes, memberUpsells } from '../lib/ai'
import { addArtifact, updateMeeting, useStore } from '../lib/store'
import { nowISO, uid } from '../lib/ids'
import type { Member } from '../types'

export function LiveRedirect() {
  const { state } = useStore()
  const live = state.liveMeetingId && state.meetings.find((m) => m.id === state.liveMeetingId)
  const next = live ?? state.meetings.find((m) => m.status === 'live') ?? state.meetings[0]
  if (!next) return <div className="page">No meetings on the book.</div>
  return <Navigate to={`/meetings/${next.id}/live`} replace />
}

export function MeetingLive() {
  const { id } = useParams()
  const { state, patch } = useStore()
  const nav = useNavigate()
  const meeting = state.meetings.find((m) => m.id === id)
  const [running, setRunning] = useState(false)
  const [listening, setListening] = useState(false)
  const [speechNote, setSpeechNote] = useState('')
  const recRef = useRef<SpeechRecognitionLike | null>(null)

  const attendee = useMemo(() => {
    if (!meeting) return null
    const a = meeting.attendeeIds[0]
    if (!a) return null
    if (a.type === 'member') {
      const m = state.members.find((x) => x.id === a.id)
      return m ? { type: 'member' as const, person: m } : null
    }
    const p = state.prospects.find((x) => x.id === a.id)
    return p ? { type: 'prospect' as const, person: p } : null
  }, [meeting, state.members, state.prospects])

  useEffect(() => {
    if (!running || !meeting) return
    if (meeting.revealed >= meeting.script.length) {
      setRunning(false)
      return
    }
    const t = window.setTimeout(() => {
      patch((s) => {
        const m = s.meetings.find((x) => x.id === meeting.id)
        if (m) m.revealed = Math.min(m.script.length, m.revealed + 1)
      })
    }, 1600)
    return () => window.clearTimeout(t)
  }, [running, meeting, patch])

  useEffect(() => {
    return () => {
      recRef.current?.stop()
      recRef.current = null
    }
  }, [])

  if (!meeting) return <div className="page">Meeting not on the book.</div>
  const mtg = meeting

  const shown = mtg.script.slice(0, mtg.revealed)
  const heard = mtg.heard ?? []
  const member = attendee?.type === 'member' ? (attendee.person as Member) : undefined
  const liveText = [...shown, ...heard].map((l) => `${l.speaker}: ${l.text}`).join('\n')
  const Ctor = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : undefined

  const keywordUpsells: { title: string; why: string }[] = []
  const blob = liveText.toLowerCase()
  if (blob.includes('fund iv') || blob.includes('three million') || blob.includes('commitment')) {
    keywordUpsells.push({ title: 'Fund IV', why: 'They put a number on a commitment in the room.' })
  }
  if (blob.includes('working capital') || blob.includes('bank line') || blob.includes('receivable')) {
    keywordUpsells.push({ title: 'Corporate cash-management sleeve', why: 'This is a cash-conversion problem, not a sale.' })
  }
  if (blob.includes('signer') || blob.includes('succession') || blob.includes('brother')) {
    keywordUpsells.push({ title: 'Continuity / succession memo', why: 'Key-person gap was volunteered.' })
  }
  if (blob.includes('donor-advised') || blob.includes('daf')) {
    keywordUpsells.push({ title: 'DAF for Henry', why: 'Named, small, veto stays with Eleanor.' })
  }
  if (member) {
    for (const u of memberUpsells(member)) {
      if (!keywordUpsells.some((x) => x.title === u.title)) keywordUpsells.push(u)
    }
  }

  function start() {
    patch((s) => {
      updateMeeting(s, mtg.id, { status: 'live' })
      s.liveMeetingId = mtg.id
    })
    setRunning(true)
  }

  function stopListen() {
    recRef.current?.stop()
    recRef.current = null
    setListening(false)
  }

  function startListen() {
    if (!Ctor) {
      setSpeechNote('This browser has no Web Speech API. The scripted tape still runs. Try Chrome or Safari.')
      return
    }
    const rec = new Ctor()
    rec.continuous = true
    rec.interimResults = false
    rec.lang = 'en-US'
    rec.onresult = (ev) => {
      let chunk = ''
      for (let i = ev.resultIndex; i < ev.results.length; i++) {
        const row = ev.results[i]
        if (row.isFinal) chunk += row[0].transcript
      }
      const text = chunk.trim()
      if (!text) return
      patch((s) => {
        const m = s.meetings.find((x) => x.id === mtg.id)
        if (!m) return
        m.heard = m.heard ?? []
        m.heard.push({ id: uid('live'), atSec: 0, speaker: 'Room', text })
      })
    }
    rec.onerror = () => {
      setSpeechNote('Mic was blocked or failed. The tape still works.')
      setListening(false)
    }
    rec.onend = () => setListening(false)
    recRef.current = rec
    rec.start()
    setListening(true)
    setSpeechNote('Listening in this browser. Nothing leaves the machine.')
    patch((s) => {
      updateMeeting(s, mtg.id, { status: 'live' })
      s.liveMeetingId = mtg.id
    })
  }

  function generate() {
    const who = attendee?.person.name ?? mtg.title
    const notes = meetingNotes(who, mtg.kind, liveText, mtg.objective, {
      landmines: member?.dontTouch,
      products: member?.products ?? (attendee?.type === 'prospect' ? attendee.person.products : []),
    })
    patch((s) => {
      updateMeeting(s, mtg.id, {
        internalNotes: notes.internal,
        externalNotes: notes.external,
        status: 'done',
      })
      addArtifact(s, {
        kind: 'notes',
        title: `Recap — ${mtg.title}`,
        subjectId: attendee?.person.id,
        body: notes.internal,
        createdAt: nowISO(),
      })
    })
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>
            {running && <span className="live-dot" />}
            {meeting.title}
          </h2>
          <p className="lede">
            Scripted tape for the demo room, plus this browser’s own speech recognizer if you
            want a live line. No vendor STT. Internal recap stays in the room; the member
            version is the letter you would actually send.
          </p>
        </div>
        <div className="btn-row">
          {!running && meeting.revealed < meeting.script.length && (
            <Btn kind="primary" onClick={start}>
              {meeting.revealed ? 'Resume tape' : 'Start live tape'}
            </Btn>
          )}
          {running && <Btn onClick={() => setRunning(false)}>Pause</Btn>}
          {!listening ? (
            <Btn onClick={startListen}>Listen</Btn>
          ) : (
            <Btn kind="bad" onClick={stopListen}>Stop mic</Btn>
          )}
          <Btn onClick={() => nav(`/meetings/${meeting.id}`)}>Back to prep</Btn>
        </div>
      </div>

      <div className="grid g-live">
        <div className="grid">
          {speechNote && <div className="warn-strip">{speechNote}</div>}
          <div className="transcript">
            {shown.length === 0 && heard.length === 0 && (
              <div style={{ color: '#8a968b' }}>Press start, or listen. The room is quiet.</div>
            )}
            {shown.map((l) => (
              <div key={l.id} className="line">
                <div className="who">{l.speaker}</div>
                <div className="txt">{l.text}</div>
              </div>
            ))}
            {heard.map((l) => (
              <div key={l.id} className="line">
                <div className="who">{l.speaker} · live</div>
                <div className="txt">{l.text}</div>
              </div>
            ))}
          </div>
          <Card title="Agenda in the room">
            {meeting.agenda.map((a) => (
              <div key={a} className="row"><div>{a}</div></div>
            ))}
          </Card>
        </div>

        <div className="grid">
          {member && (
            <>
              <Card title="Rapport recon">
                <div className="pills">
                  {member.interests.concat(member.hobbies).map((x) => (
                    <span className="pill" key={x}>{x}</span>
                  ))}
                </div>
                <p className="sub" style={{ marginTop: 8 }}>
                  {member.favorites.alcohol}
                </p>
              </Card>
              <div className="dont">
                {member.dontTouch.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>
            </>
          )}
          <Card title="Live upsells">
            {keywordUpsells.length === 0 && <div className="empty">Nothing earned yet.</div>}
            {keywordUpsells.map((u) => (
              <div key={u.title} className="row">
                <div>
                  <div className="title">{u.title}</div>
                  <div className="sub">{u.why}</div>
                </div>
                <Badge kind="brass">internal</Badge>
              </div>
            ))}
          </Card>
          <Card
            title="Auto recap"
            action={<Btn kind="tiny" onClick={generate}>Generate both versions</Btn>}
          >
            {meeting.internalNotes ? (
              <>
                <h3 style={{ marginTop: 0 }}>Internal</h3>
                <div className="prose-box prose">{meeting.internalNotes}</div>
                {meeting.externalNotes && (
                  <>
                    <h3>Member / prospect version</h3>
                    <div className="prose-box prose">{meeting.externalNotes}</div>
                  </>
                )}
              </>
            ) : (
              <div className="empty">Generate after you have some tape.</div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
