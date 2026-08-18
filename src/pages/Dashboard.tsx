import { useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/ui'
import { fmtTime, todayISO } from '../lib/ids'
import { isTodayTrade } from '../lib/portfolio'
import { useStore } from '../lib/store'

export function Dashboard() {
  const { state } = useStore()
  const nav = useNavigate()
  const today = todayISO()
  const meetings = state.meetings
    .filter((m) => m.when.startsWith(today))
    .slice()
    .sort((a, b) => a.when.localeCompare(b.when))
  const unseen = state.comms.filter((c) => !c.seen)
  const todayTrades = state.trades.filter((t) => isTodayTrade(t.lastTradeDate, today))
  const pendingToday = todayTrades.filter((t) => t.status === 'pending')

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Launch pad</h2>
          <p className="lede">
            Saturday desk. Morning file landed at 2:00am — book today’s trades before the open.
            Four meetings and three people who already wrote you.
          </p>
        </div>
      </div>

      <div className="grid g-3" style={{ marginBottom: 14 }}>
        <div className="stat stat-action">
          <div>
            <div className="k">Today's Positions</div>
            <div className="v">
              {todayTrades.length} <span className="v-unit">New</span>
            </div>
            <div className="s">{state.trades.length} Positions · {pendingToday.length} Need Approval</div>
          </div>
          <button className="btn tiny" onClick={() => nav('/trades')}>Review</button>
        </div>
        <div className="stat">
          <div className="k">Today's Agenda</div>
          <div className="v">{meetings.length}</div>
          <div className="s">meetings on the tape</div>
        </div>
        <div className="stat">
          <div className="k">Member Messages</div>
          <div className="v">{unseen.length}</div>
          <div className="s">presence only — no bodies</div>
        </div>
      </div>

      <div className="grid g-main">
        <Card title="Today's Meetings">
          {meetings.length === 0 && <div className="empty">Nothing on the book today.</div>}
          {meetings.map((m) => (
            <div key={m.id} className="row click" onClick={() => nav(`/meetings/${m.id}`)}>
              <div>
                <div className="title">{m.title}</div>
                <div className="sub">{fmtTime(m.when)} · {m.location}</div>
              </div>
              <Badge kind="brass">{m.kind}</Badge>
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
    </div>
  )
}
