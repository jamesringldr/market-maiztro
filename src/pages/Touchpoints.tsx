import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Btn, Card, Field } from '../components/ui'
import { addTouch, useStore } from '../lib/store'
import type { SubjectType, TouchKind } from '../types'

export function Touchpoints() {
  const { state, patch, personName } = useStore()
  const nav = useNavigate()
  const [filter, setFilter] = useState<'all' | 'due' | 'planned' | 'done'>('all')
  const [kind, setKind] = useState<TouchKind>('call')
  const [who, setWho] = useState('member:m-voss')
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('2026-08-22')

  const rows = useMemo(() => {
    return [...state.touchpoints]
      .filter((t) => filter === 'all' || t.status === filter)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [state.touchpoints, filter])

  const people = [
    ...state.members.map((m) => ({ value: `member:${m.id}`, label: `${m.name} (member)` })),
    ...state.prospects.map((p) => ({ value: `prospect:${p.id}`, label: `${p.name} (prospect)` })),
  ]

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Touchpoint planner</h2>
          <p className="lede">
            Who needs a call, a note, a market update, or a personal touch. Cadence lives here
            so it does not live in someone’s head.
          </p>
        </div>
      </div>

      <div className="grid g-main">
        <Card title="Book">
          <div className="filters">
            {(['all', 'due', 'planned', 'done'] as const).map((f) => (
              <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                {f}
              </button>
            ))}
          </div>
          {rows.map((t) => (
            <div
              key={t.id}
              className="row click"
              onClick={() =>
                nav(t.subjectType === 'member' ? `/members/${t.subjectId}` : `/prospects/${t.subjectId}`)
              }
            >
              <div>
                <div className="title">{t.title}</div>
                <div className="sub">
                  {t.date} · {personName(t.subjectType, t.subjectId)} · {t.kind}
                  {t.notes ? ` · ${t.notes}` : ''}
                </div>
              </div>
              <div className="btn-row">
                <Badge kind={t.status === 'due' ? 'warn' : t.status === 'done' ? 'ok' : 'mute'}>{t.status}</Badge>
                {t.status !== 'done' && (
                  <Btn
                    kind="tiny"
                    onClick={() =>
                      patch((s) => {
                        const row = s.touchpoints.find((x) => x.id === t.id)
                        if (row) row.status = 'done'
                      })
                    }
                  >
                    Done
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </Card>

        <Card title="Schedule one">
          <Field label="Who">
            <select value={who} onChange={(e) => setWho(e.target.value)}>
              {people.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Kind">
            <select value={kind} onChange={(e) => setKind(e.target.value as TouchKind)}>
              <option>call</option>
              <option>email</option>
              <option>meeting</option>
              <option>market-update</option>
              <option>personal</option>
              <option>referral</option>
            </select>
          </Field>
          <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Date"><input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></Field>
          <Btn
            kind="primary"
            onClick={() => {
              const [type, id] = who.split(':') as [SubjectType, string]
              if (!title.trim()) return
              patch((s) =>
                addTouch(s, {
                  subjectId: id,
                  subjectType: type,
                  kind,
                  title: title.trim(),
                  date,
                  status: date <= '2026-08-15' ? 'due' : 'planned',
                  notes: '',
                }),
              )
              setTitle('')
            }}
          >
            Add to the planner
          </Btn>
        </Card>
      </div>
    </div>
  )
}
