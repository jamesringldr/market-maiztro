import { useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/ui'
import { compact, daysFrom, fmtTime, todayISO } from '../lib/ids'
import { useStore } from '../lib/store'

export function Dashboard() {
  const { state, personName } = useStore()
  const nav = useNavigate()
  const today = todayISO()
  const meetings = state.meetings.filter((m) => m.when.startsWith(today))
  const due = state.touchpoints.filter((t) => t.status === 'due' || (t.status === 'planned' && t.date <= today))
  const unseen = state.comms.filter((c) => !c.seen)
  const pendingTrades = state.trades.filter((t) => t.status === 'pending')
  const pendingEdge = state.approvals.filter((a) => a.status === 'pending')
  const aum = state.members.reduce((s, m) => s + m.aum, 0)
  const cold = state.prospects.filter((p) => daysFrom(p.lastTouch) <= -21)

  const priorities = [
    ...meetings.map((m) => ({
      key: m.id,
      title: m.title,
      sub: `${fmtTime(m.when)} · ${m.location}`,
      tag: 'Meeting',
      to: `/meetings/${m.id}`,
    })),
    ...due.slice(0, 4).map((t) => ({
      key: t.id,
      title: t.title,
      sub: `${personName(t.subjectType, t.subjectId)} · ${t.kind}`,
      tag: t.date === today ? 'Due today' : 'Overdue',
      to: '/touchpoints',
    })),
    ...pendingTrades.slice(0, 2).map((t) => ({
      key: t.id,
      title: `${t.side.toUpperCase()} ${t.quantity} ${t.symbol}`,
      sub: t.accountCode,
      tag: 'Trade',
      to: '/trades',
    })),
  ]

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Launch pad</h2>
          <p className="lede">
            Saturday desk. Four meetings, a trades file, and three people who already wrote you.
            This is the daily surface — not a pre-meeting toy.
          </p>
        </div>
      </div>

      <div className="grid g-4" style={{ marginBottom: 14 }}>
        <div className="stat">
          <div className="k">Book AUM</div>
          <div className="v">{compact(aum)}</div>
          <div className="s">{state.members.length} members</div>
        </div>
        <div className="stat">
          <div className="k">Today</div>
          <div className="v">{meetings.length}</div>
          <div className="s">meetings on the tape</div>
        </div>
        <div className="stat">
          <div className="k">Waiting on you</div>
          <div className="v">{pendingTrades.length + pendingEdge.length}</div>
          <div className="s">{pendingTrades.length} trades · {pendingEdge.length} Edge</div>
        </div>
        <div className="stat">
          <div className="k">Unseen comms</div>
          <div className="v">{unseen.length}</div>
          <div className="s">presence only — no bodies</div>
        </div>
      </div>

      <div className="grid g-main">
        <Card title="Today’s priorities">
          {priorities.map((p) => (
            <div key={p.key} className="row click" onClick={() => nav(p.to)}>
              <div>
                <div className="title">{p.title}</div>
                <div className="sub">{p.sub}</div>
              </div>
              <Badge kind="brass">{p.tag}</Badge>
            </div>
          ))}
        </Card>

        <div className="grid">
          <Card title="Comms pulse" action={<button className="btn tiny" onClick={() => nav('/comms')}>Open</button>}>
            {unseen.length === 0 && <div className="empty">Inbox is clear.</div>}
            {unseen.map((c) => (
              <div key={c.id} className="row">
                <div>
                  <div className="title">{c.summary}</div>
                  <div className="sub">{fmtTime(c.occurredAt)} · {c.channel} · {c.direction}</div>
                </div>
                <Badge kind="warn">New</Badge>
              </div>
            ))}
          </Card>
          <Card title="Market, one glance" action={<button className="btn tiny" onClick={() => nav('/market')}>Brief</button>}>
            <p style={{ margin: 0, fontFamily: 'var(--serif)', lineHeight: 1.45 }}>
              Quiet Saturday tape. Duration question is live for Shah and Voss.
              Owners want cash-conversion talk, not valuation. Brooks will ask about DPI on Tuesday.
            </p>
          </Card>
        </div>
      </div>

      <div className="grid g-2" style={{ marginTop: 14 }}>
        <Card title="Pipeline that needs a hand">
          {state.prospects
            .filter((p) => ['proposal', 'commit', 'discovery', 'outreach'].includes(p.stage))
            .slice(0, 6)
            .map((p) => (
              <div key={p.id} className="row click" onClick={() => nav(`/prospects/${p.id}`)}>
                <div>
                  <div className="title">{p.name}</div>
                  <div className="sub">{p.company} · {p.objective}</div>
                </div>
                <Badge kind={p.stage === 'commit' ? 'ok' : p.stage === 'proposal' ? 'warn' : 'info'}>{p.stage}</Badge>
              </div>
            ))}
        </Card>
        <Card title="Gone quiet">
          {cold.length === 0 && <div className="empty">No one has gone cold.</div>}
          {cold.map((p) => (
            <div key={p.id} className="row click" onClick={() => nav(`/prospects/${p.id}`)}>
              <div>
                <div className="title">{p.name}</div>
                <div className="sub">{p.company} · last touch {p.lastTouch}</div>
              </div>
              <Badge kind="danger">{p.stage}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
