import { useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/ui'
import { fmtDateTime, todayISO } from '../lib/ids'
import { useStore } from '../lib/store'

export function Meetings() {
  const { state } = useStore()
  const nav = useNavigate()
  const today = todayISO()
  const todays = state.meetings.filter((m) => m.when.startsWith(today))
  const later = state.meetings.filter((m) => !m.when.startsWith(today))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Daily prep</h2>
          <p className="lede">
            Every meeting gets an info sheet before you walk in: talking points, open to-dos,
            rapport, and the things you will not say.
          </p>
        </div>
      </div>
      <div className="grid g-2">
        <Card title="Today">
          {todays.map((m) => (
            <div key={m.id} className="row click" onClick={() => nav(`/meetings/${m.id}`)}>
              <div>
                <div className="title">{m.title}</div>
                <div className="sub">{fmtDateTime(m.when)} · {m.location} · {m.durationMin}m</div>
              </div>
              <Badge kind={m.kind === 'internal' ? 'mute' : 'info'}>{m.kind}</Badge>
            </div>
          ))}
        </Card>
        <Card title="Later this week">
          {later.map((m) => (
            <div key={m.id} className="row click" onClick={() => nav(`/meetings/${m.id}`)}>
              <div>
                <div className="title">{m.title}</div>
                <div className="sub">{fmtDateTime(m.when)} · {m.location}</div>
              </div>
              <Badge kind="mute">{m.kind}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
