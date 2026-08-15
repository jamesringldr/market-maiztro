import { useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Btn, Card } from '../components/ui'
import { memberUpsells, talkingPoints } from '../lib/ai'
import { fmtDateTime } from '../lib/ids'
import { useStore } from '../lib/store'
import type { Member, Prospect } from '../types'

export function MeetingPrep() {
  const { id } = useParams()
  const { state, personName } = useStore()
  const nav = useNavigate()
  const meeting = state.meetings.find((m) => m.id === id)

  const people = useMemo(() => {
    if (!meeting) return []
    return meeting.attendeeIds
      .map((a) => {
        const p = a.type === 'member'
          ? state.members.find((m) => m.id === a.id)
          : state.prospects.find((x) => x.id === a.id)
        return p ? { type: a.type, person: p } : null
      })
      .filter((x): x is { type: 'member' | 'prospect'; person: Member | Prospect } => Boolean(x))
  }, [meeting, state.members, state.prospects])

  if (!meeting) return <div className="page">Meeting not on the book.</div>

  const member = people.find((p) => p.type === 'member')?.person as Member | undefined
  const prospect = people.find((p) => p.type === 'prospect')?.person as Prospect | undefined
  const openTodos = state.touchpoints.filter(
    (t) =>
      meeting.attendeeIds.some((a) => a.id === t.subjectId) &&
      t.status !== 'done' &&
      t.status !== 'skipped',
  )

  const extras = member
    ? [
        `Rapport: ${member.interests.slice(0, 2).join(', ') || 'see file'}.`,
        member.dontTouch[0] ? `Landmine: ${member.dontTouch[0]}` : '',
        member.missingInfo[0] ? `Missing: ${member.missingInfo[0]}` : '',
      ].filter(Boolean)
    : prospect
      ? [
          `Stage ${prospect.stage}. Source: ${prospect.source}.`,
          prospect.priorNotes || 'No prior notes — listen more than you talk.',
        ]
      : ['Internal. Decisions, not theater.']

  const points = talkingPoints(
    people[0] ? ('name' in people[0].person ? people[0].person.name : 'the room') : 'the room',
    meeting.objective,
    extras,
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>{meeting.title}</h2>
          <p className="lede">
            {fmtDateTime(meeting.when)} · {meeting.location} · {meeting.durationMin}m · {meeting.kind}
          </p>
        </div>
        <Btn kind="primary" onClick={() => nav(`/meetings/${meeting.id}/live`)}>
          Start in-meeting
        </Btn>
      </div>

      <div className="grid g-main">
        <div className="grid">
          <Card title="Objective">
            <p style={{ margin: 0, fontFamily: 'var(--serif)', fontSize: 18 }}>{meeting.objective}</p>
          </Card>
          <Card title="Agenda">
            {meeting.agenda.map((a) => (
              <div key={a} className="row">
                <div className="title">{a}</div>
              </div>
            ))}
          </Card>
          <Card title="Talking points">
            {points.map((p) => (
              <div key={p} className="row">
                <div>{p}</div>
              </div>
            ))}
          </Card>
        </div>
        <div className="grid">
          <Card title="Attendees">
            {people.length === 0 && <div className="empty">Internal only.</div>}
            {people.map(({ type, person }) => (
              <div key={person.id} className="row">
                <div>
                  <Link to={type === 'member' ? `/members/${person.id}` : `/prospects/${person.id}`}>
                    <div className="title">{person.name}</div>
                  </Link>
                  <div className="sub">{'company' in person ? person.company : ''} · {type}</div>
                </div>
                <Badge kind={type === 'member' ? 'ok' : 'info'}>{type}</Badge>
              </div>
            ))}
          </Card>
          <Card title="Open to-dos from prior touches">
            {openTodos.length === 0 && <div className="empty">Nothing hanging.</div>}
            {openTodos.map((t) => (
              <div key={t.id} className="row">
                <div>
                  <div className="title">{t.title}</div>
                  <div className="sub">{personName(t.subjectType, t.subjectId)} · {t.date} · {t.kind}</div>
                </div>
                <Badge kind={t.status === 'due' ? 'warn' : 'mute'}>{t.status}</Badge>
              </div>
            ))}
          </Card>
          {member && (
            <>
              <Card title="Rapport recon">
                <div className="sub">Family</div>
                {member.family.map((f) => (
                  <div key={f.id} className="row">
                    <div>
                      <div className="title">{f.name}</div>
                      <div className="sub">{f.relation} · {f.notes}</div>
                    </div>
                  </div>
                ))}
                <div className="pills" style={{ marginTop: 8 }}>
                  {member.interests.concat(member.hobbies).map((x) => (
                    <span key={x} className="pill">{x}</span>
                  ))}
                </div>
                <p className="sub" style={{ marginTop: 10 }}>
                  {member.favorites.alcohol} · {member.favorites.restaurants.join(', ')}
                </p>
              </Card>
              <div className="dont">
                <b>Do not touch.</b>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                  {member.dontTouch.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
              <Card title="Possible upsells (internal)">
                {memberUpsells(member).map((u) => (
                  <div key={u.title} className="row">
                    <div>
                      <div className="title">{u.title}</div>
                      <div className="sub">{u.why}</div>
                    </div>
                  </div>
                ))}
              </Card>
            </>
          )}
          {prospect && (
            <Card title="Prospect frame">
              <div className="title">{prospect.objective}</div>
              <p className="sub">{prospect.priorNotes || prospect.notes}</p>
              <div className="pills" style={{ marginTop: 8 }}>
                {prospect.products.map((p) => (
                  <span key={p} className="pill">{p}</span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
