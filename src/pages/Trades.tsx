import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Btn, Card } from '../components/ui'
import { EXTRA_CSV, parseTradesCsv } from '../lib/csv'
import { pct, sheetDate, signedPct, todayISO } from '../lib/ids'
import { isTodayTrade, resolvePortfolioFanout } from '../lib/portfolio'
import { addTrade, approveTrade, assignFanout, rejectTrade, useStore } from '../lib/store'
import type { Trade } from '../types'

export function Trades() {
  const { state, patch } = useStore()
  const nav = useNavigate()
  const [errors, setErrors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [view, setView] = useState<'today' | 'file'>('today')
  const [roster, setRoster] = useState<Trade | null>(null)
  const day = todayISO()

  const todayRows = useMemo(
    () => state.trades.filter((t) => isTodayTrade(t.lastTradeDate, day)),
    [state.trades, day],
  )
  const pendingToday = todayRows.filter((t) => t.status === 'pending')
  const visible = view === 'today' ? todayRows : state.trades
  const booked = state.trades.filter((t) => t.status !== 'pending' && isTodayTrade(t.lastTradeDate, day))

  function ingest(text: string) {
    const { rows, errors: errs } = parseTradesCsv(text)
    setErrors(errs)
    if (!rows.length) return
    let added = 0
    patch((s) => {
      for (const r of rows) {
        const dup = s.trades.some(
          (t) =>
            t.ticker === r.ticker &&
            t.portfolioName === r.portfolioName &&
            t.lastTradeDate === r.lastTradeDate,
        )
        if (dup) continue
        addTrade(s, {
          portfolioName: r.portfolioName,
          newWeight: r.newWeight,
          ticker: r.ticker,
          lastTradeDate: r.lastTradeDate,
          nextCheckDate: r.nextCheckDate,
          signal: r.signal,
          performance: r.performance,
          status: isTodayTrade(r.lastTradeDate, day) ? 'pending' : 'approved',
          fanout: resolvePortfolioFanout(s.members, r.portfolioName),
        })
        added += 1
      }
    })
    setNote(
      added
        ? `Ingested ${added} row${added === 1 ? '' : 's'}. Today’s LastTradeDate lines still need approval before the open.`
        : 'No new rows — already on the blotter.',
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Morning positions</h2>
          <p className="lede">
            File lands at 2:00am. New = LastTradeDate is today. Approve once and the weight
            posts to every member in that portfolio sleeve — not keyed account by account.
          </p>
        </div>
        <div className="btn-row">
          <Btn onClick={() => ingest(EXTRA_CSV)}>Load extra demo file</Btn>
          <label className="btn">
            Upload CSV
            <input
              type="file"
              accept=".csv,text/csv"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                ingest(await f.text())
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </div>

      {note && <div className="warn-strip">{note}</div>}
      {errors.map((e) => (
        <div key={e} className="dont" style={{ marginBottom: 8 }}>{e}</div>
      ))}

      <div className="filters" style={{ marginBottom: 12 }}>
        <button className={`chip ${view === 'today' ? 'on' : ''}`} onClick={() => setView('today')}>
          Today’s trades · {todayRows.length}
        </button>
        <button className={`chip ${view === 'file' ? 'on' : ''}`} onClick={() => setView('file')}>
          Full morning file · {state.trades.length}
        </button>
      </div>

      <Card title={view === 'today' ? `Need booking before the open · ${pendingToday.length} of ${todayRows.length}` : `Solyco${day.replace(/-/g, '')}020000`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Portfolio</th>
                <th>Ticker</th>
                <th>New Weight</th>
                <th>Performance</th>
                <th>Last trade</th>
                <th>Next check</th>
                <th>Signal</th>
                <th>Members</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 && (
                <tr>
                  <td colSpan={9}><div className="empty">Nothing on this cut.</div></td>
                </tr>
              )}
              {visible.map((t) => {
                const today = isTodayTrade(t.lastTradeDate, day)
                const memberIds = [...new Set(t.fanout.map((f) => f.memberId))]
                return (
                  <tr key={t.id} className={today && t.status === 'pending' ? 'today-row' : undefined}>
                    <td>
                      <div>{t.portfolioName}</div>
                      {today && t.status === 'pending' && <div className="sub">new today</div>}
                    </td>
                    <td><b>{t.ticker}</b></td>
                    <td className="num">{pct(t.newWeight)}</td>
                    <td className={`num ${t.performance > 0 ? 'buy' : t.performance < 0 ? 'sell' : ''}`}>
                      {signedPct(t.performance)}
                    </td>
                    <td>{sheetDate(t.lastTradeDate)}</td>
                    <td>{t.nextCheckDate ? sheetDate(t.nextCheckDate) : '—'}</td>
                    <td className="num">{t.signal}</td>
                    <td>
                      {t.fanout.length === 0 && (
                        <div>
                          <Badge kind="danger">No sleeve match</Badge>
                          <select
                            style={{ display: 'block', marginTop: 6, maxWidth: 220 }}
                            defaultValue=""
                            onChange={(e) => {
                              const [memberId, accountId] = e.target.value.split(':')
                              if (memberId && accountId) patch((s) => assignFanout(s, t.id, memberId, accountId))
                            }}
                          >
                            <option value="" disabled>Assign account…</option>
                            {state.members.flatMap((m) =>
                              m.accounts.map((a) => (
                                <option key={a.id} value={`${m.id}:${a.id}`}>
                                  {m.name} · {a.code}
                                </option>
                              )),
                            )}
                          </select>
                        </div>
                      )}
                      {memberIds.length > 0 && (
                        <Btn kind="tiny" onClick={() => setRoster(t)}>
                          {memberIds.length}
                        </Btn>
                      )}
                    </td>
                    <td>
                      {t.status === 'pending' ? (
                        <div className="btn-row">
                          <Btn kind="good tiny" onClick={() => patch((s) => approveTrade(s, t.id))} disabled={t.fanout.length === 0}>
                            Approve
                          </Btn>
                          <Btn kind="bad tiny" onClick={() => patch((s) => rejectTrade(s, t.id, 'Held before the open'))}>
                            Hold
                          </Btn>
                        </div>
                      ) : (
                        <Badge kind={t.status === 'approved' ? 'ok' : 'danger'}>{t.status}</Badge>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {view === 'today' && (
        <div style={{ marginTop: 14 }}>
          <Card title="Booked this morning">
            {booked.length === 0 && <div className="empty">Nothing posted yet.</div>}
            {booked.map((t) => (
              <div key={t.id} className="row">
                <div>
                  <div className="title">
                    {t.ticker} · {pct(t.newWeight)} · {t.portfolioName}
                  </div>
                  <div className="sub">
                    {t.status === 'approved'
                      ? `posted to ${new Set(t.fanout.map((f) => f.memberId)).size} member(s)`
                      : t.reason ?? ''}
                  </div>
                </div>
                <Badge kind={t.status === 'approved' ? 'ok' : 'danger'}>{t.status}</Badge>
              </div>
            ))}
          </Card>
        </div>
      )}

      {roster && (
        <div className="modal-back" onClick={() => setRoster(null)}>
          <div
            className="modal"
            role="dialog"
            aria-labelledby="roster-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-head">
              <h3 id="roster-title">
                {roster.ticker} · {roster.portfolioName}
              </h3>
              <Btn kind="tiny" onClick={() => setRoster(null)}>Close</Btn>
            </div>
            <p className="sub" style={{ marginTop: 0 }}>
              {[...new Set(roster.fanout.map((f) => f.memberId))].length} members enrolled in this sleeve
            </p>
            {[...new Set(roster.fanout.map((f) => f.memberId))].map((id) => {
              const m = state.members.find((x) => x.id === id)
              const accounts = roster.fanout.filter((f) => f.memberId === id).map((f) => f.accountCode)
              return (
                <div
                  key={id}
                  className="row click"
                  onClick={() => {
                    setRoster(null)
                    nav(`/members/${id}`)
                  }}
                >
                  <div>
                    <div className="title">{m?.name ?? id}</div>
                    <div className="sub">{accounts.join(' · ')}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
