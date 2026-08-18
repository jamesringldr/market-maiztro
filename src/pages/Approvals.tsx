import { useNavigate } from 'react-router-dom'
import { Badge, Btn, Card } from '../components/ui'
import { pct, todayISO } from '../lib/ids'
import { isTodayTrade } from '../lib/portfolio'
import { approveTrade, rejectTrade, useStore } from '../lib/store'

export function Approvals() {
  const { state, patch } = useStore()
  const nav = useNavigate()
  const trades = state.trades.filter((t) => t.status === 'pending' && isTodayTrade(t.lastTradeDate, todayISO()))
  const edge = state.approvals.filter((a) => a.status === 'pending')

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Approvals</h2>
          <p className="lede">
            Two queues, one desk. Today’s LastTradeDate rows from the 2am file post to every
            member in that sleeve after you accept them. Edge Tech items are operational, not market.
          </p>
        </div>
        <Btn kind="primary" onClick={() => nav('/trades')}>Open trades desk</Btn>
      </div>

      <div className="grid g-2">
        <Card title={`Today’s trades awaiting you · ${trades.length}`}>
          {trades.length === 0 && <div className="empty">Morning book is clear.</div>}
          {trades.map((t) => (
            <div key={t.id} className="row">
              <div>
                <div className="title">
                  {t.ticker} · {pct(t.newWeight)}
                </div>
                <div className="sub">
                  {t.portfolioName}
                  {t.fanout.length === 0
                    ? ' · no sleeve match'
                    : ` · ${new Set(t.fanout.map((f) => f.memberId)).size} members`}
                </div>
              </div>
              <div className="btn-row">
                <Btn kind="good tiny" onClick={() => patch((s) => approveTrade(s, t.id))}>Approve</Btn>
                <Btn kind="bad tiny" onClick={() => patch((s) => rejectTrade(s, t.id, 'Held from approvals'))}>Hold</Btn>
              </div>
            </div>
          ))}
        </Card>

        <Card title={`Edge Tech · ${edge.length}`}>
          {edge.length === 0 && <div className="empty">No Edge items.</div>}
          {edge.map((a) => (
            <div key={a.id} className="row">
              <div>
                <div className="title">{a.title}</div>
                <div className="sub">{a.detail}</div>
              </div>
              <div className="btn-row">
                <Btn
                  kind="good tiny"
                  onClick={() =>
                    patch((s) => {
                      const row = s.approvals.find((x) => x.id === a.id)
                      if (row) row.status = 'approved'
                    })
                  }
                >
                  Approve
                </Btn>
                <Btn
                  kind="bad tiny"
                  onClick={() =>
                    patch((s) => {
                      const row = s.approvals.find((x) => x.id === a.id)
                      if (row) row.status = 'rejected'
                    })
                  }
                >
                  Reject
                </Btn>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div style={{ marginTop: 14 }}>
        <Card title="Already decided">
          {state.approvals
            .filter((a) => a.status !== 'pending')
            .map((a) => (
              <div key={a.id} className="row">
                <div>
                  <div className="title">{a.title}</div>
                  <div className="sub">{a.detail}</div>
                </div>
                <Badge kind={a.status === 'approved' ? 'ok' : 'danger'}>{a.status}</Badge>
              </div>
            ))}
        </Card>
      </div>
    </div>
  )
}
