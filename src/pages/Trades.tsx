import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Btn, Card } from '../components/ui'
import { DEMO_CSV, parseTradesCsv } from '../lib/csv'
import { moneyExact } from '../lib/ids'
import { addTrade, approveTrade, assignFanout, rejectTrade, resolveFanout, useStore } from '../lib/store'

export function Trades() {
  const { state, patch } = useStore()
  const nav = useNavigate()
  const [errors, setErrors] = useState<string[]>([])
  const [note, setNote] = useState('')
  const pending = state.trades.filter((t) => t.status === 'pending')
  const done = state.trades.filter((t) => t.status !== 'pending')

  function ingest(text: string) {
    const { rows, errors: errs } = parseTradesCsv(text)
    setErrors(errs)
    if (!rows.length) return
    patch((s) => {
      for (const r of rows) {
        const fanout = resolveFanout(s, r.account_code, r.client_hint)
        addTrade(s, {
          date: r.date,
          symbol: r.symbol,
          side: r.side,
          quantity: r.quantity,
          price: r.price,
          accountCode: r.account_code,
          clientHint: r.client_hint,
          status: 'pending',
          fanout,
        })
      }
    })
    setNote(`Ingested ${rows.length} row${rows.length === 1 ? '' : 's'}. Approve each before it posts.`)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Daily trades</h2>
          <p className="lede">
            Solyco used to key every fill into every account by hand. Here the morning CSV
            lands as a blotter. You approve per trade; the fill fans out to the matched book.
          </p>
        </div>
        <div className="btn-row">
          <Btn onClick={() => ingest(DEMO_CSV)}>Load extra demo file</Btn>
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

      <Card title={`Awaiting approval · ${pending.length}`}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Side</th>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Notional</th>
                <th>Account</th>
                <th>Fan-out</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pending.map((t) => (
                <tr key={t.id}>
                  <td className={t.side}>{t.side}</td>
                  <td>{t.symbol}</td>
                  <td className="num">{t.quantity.toLocaleString()}</td>
                  <td className="num">{moneyExact(t.price)}</td>
                  <td className="num">{moneyExact(t.quantity * t.price)}</td>
                  <td>
                    <div>{t.accountCode || '—'}</div>
                    <div className="sub">{t.clientHint}</div>
                  </td>
                  <td>
                    {t.fanout.length === 0 && (
                      <div>
                        <Badge kind="danger">Unmatched</Badge>
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
                    {t.fanout.map((f) => {
                      const m = state.members.find((x) => x.id === f.memberId)
                      return (
                        <div key={f.accountId}>
                          <button
                            className="btn tiny"
                            onClick={(e) => {
                              e.stopPropagation()
                              nav(`/members/${f.memberId}`)
                            }}
                          >
                            {m?.name ?? f.memberId}
                          </button>
                          <div className="sub">{f.accountCode}</div>
                        </div>
                      )
                    })}
                  </td>
                  <td>
                    <div className="btn-row">
                      <Btn kind="good tiny" onClick={() => patch((s) => approveTrade(s, t.id))} disabled={t.fanout.length === 0}>
                        Approve
                      </Btn>
                      <Btn kind="bad tiny" onClick={() => patch((s) => rejectTrade(s, t.id, 'Rejected on blotter'))}>
                        Reject
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div style={{ marginTop: 14 }}>
        <Card title="Posted / rejected">
          {done.length === 0 && <div className="empty">Nothing decided yet.</div>}
          {done.map((t) => (
            <div key={t.id} className="row">
              <div>
                <div className="title">
                  <span className={t.side}>{t.side.toUpperCase()}</span> {t.quantity.toLocaleString()} {t.symbol}
                </div>
                <div className="sub">
                  {t.accountCode} · {moneyExact(t.quantity * t.price)}
                  {t.status === 'approved' ? ` · posted to ${t.fanout.length} account(s)` : ` · ${t.reason ?? ''}`}
                </div>
              </div>
              <Badge kind={t.status === 'approved' ? 'ok' : 'danger'}>{t.status}</Badge>
            </div>
          ))}
        </Card>
      </div>
    </div>
  )
}
