import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Btn, Card, Field } from '../components/ui'
import { compact, nowISO, pct, uid } from '../lib/ids'
import { emailVariants } from '../lib/ai'
import { addDraft, addTouch, useStore } from '../lib/store'
import type { MemoryItem } from '../types'

export function MemberDetail() {
  const { id } = useParams()
  const { state, patch } = useStore()
  const nav = useNavigate()
  const m = state.members.find((x) => x.id === id)
  const [tab, setTab] = useState<'overview' | 'rolodex' | 'accounts' | 'plan'>('overview')
  const [memText, setMemText] = useState('')
  const [inbound, setInbound] = useState('')
  const [strategy, setStrategy] = useState(m?.strategy ?? '')

  if (!m) return <div className="page">No member on that id.</div>
  const member = m

  const txns = state.posted.filter((t) => t.memberId === member.id)
  const touches = state.touchpoints.filter((t) => t.subjectId === m.id)
  const comms = state.comms.filter((c) => c.subjectId === m.id)
  const drafts = state.drafts.filter((d) => d.subjectId === m.id)

  function addMemory() {
    if (!memText.trim()) return
    const item: MemoryItem = {
      id: uid('mem'),
      kind: 'personal',
      text: memText.trim(),
      createdAt: nowISO().slice(0, 10),
    }
    patch((s) => {
      const row = s.members.find((x) => x.id === member.id)
      if (row) row.memories.unshift(item)
    })
    setMemText('')
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>{m.name}</h2>
          <p className="lede">
            {m.title} · {m.company} · {m.city} · since {m.since}
          </p>
        </div>
        <div className="btn-row">
          <Badge kind="ok">{m.kind}</Badge>
          <Btn onClick={() => nav('/meetings')}>Prep a meeting</Btn>
        </div>
      </div>

      <div className="grid g-4" style={{ marginBottom: 14 }}>
        <div className="stat">
          <div className="k">AUM</div>
          <div className="v">{compact(m.aum)}</div>
          <div className="s">{m.accounts.length} accounts</div>
        </div>
        <div className="stat">
          <div className="k">Risk</div>
          <div className="v" style={{ fontSize: 18, paddingTop: 8 }}>{m.riskProfile.split('·')[0]}</div>
          <div className="s">{m.riskProfile}</div>
        </div>
        <div className="stat">
          <div className="k">Last / next</div>
          <div className="v" style={{ fontSize: 18, paddingTop: 8 }}>{m.lastTouch}</div>
          <div className="s">next {m.nextTouch}</div>
        </div>
        <div className="stat">
          <div className="k">Posted fills</div>
          <div className="v">{txns.length}</div>
          <div className="s">from approved trades</div>
        </div>
      </div>

      {txns[0] && (
        <div className="warn-strip">
          Latest approved fill: <b>{txns[0].ticker} · {pct(txns[0].weight)}</b>
          {' '}in {txns[0].portfolioName} on {txns[0].date}
        </div>
      )}

      <div className="filters">
        {(['overview', 'rolodex', 'accounts', 'plan'] as const).map((t) => (
          <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
            {t === 'rolodex' ? 'Rocko rolodex' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid g-main">
          <div className="grid">
            <Card
              title="Strategy"
              action={
                <Btn
                  kind="tiny"
                  onClick={() =>
                    patch((s) => {
                      const row = s.members.find((mm) => mm.id === member.id)
                      if (row) row.strategy = strategy
                    })
                  }
                >
                  Save
                </Btn>
              }
            >
              <textarea
                value={strategy}
                onChange={(e) => setStrategy(e.target.value)}
                style={{ width: '100%', minHeight: 120, fontFamily: 'var(--serif)', lineHeight: 1.5 }}
              />
              <div className="pills" style={{ marginTop: 12 }}>
                {m.products.map((p) => (
                  <span key={p} className="pill">{p}</span>
                ))}
              </div>
            </Card>
            <Card title="Missing information">
              {m.missingInfo.length === 0 && <div className="empty">File is complete.</div>}
              {m.missingInfo.map((x) => (
                <div key={x} className="row">
                  <div className="title">{x}</div>
                  <Btn
                    kind="tiny"
                    onClick={() =>
                      patch((s) => {
                        const row = s.members.find((mm) => mm.id === m.id)
                        if (row) row.missingInfo = row.missingInfo.filter((i) => i !== x)
                      })
                    }
                  >
                    Cleared
                  </Btn>
                </div>
              ))}
            </Card>
            <Card title="Transaction notifications">
              {txns.length === 0 && <div className="empty">No approved fills on this file yet.</div>}
              {txns.map((t) => (
                <div key={t.id} className="row">
                  <div>
                    <div className="title">
                      {t.ticker} · {pct(t.weight)}
                    </div>
                    <div className="sub">{t.portfolioName} · {t.date}</div>
                  </div>
                </div>
              ))}
            </Card>
          </div>
          <div className="grid">
            <div className="dont">
              <b>Do not touch</b>
              {m.dontTouch.map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <Card title="Comms presence">
              {comms.length === 0 && <div className="empty">No flags.</div>}
              {comms.map((c) => (
                <div key={c.id} className="row">
                  <div>
                    <div className="title">{c.summary}</div>
                    <div className="sub">{c.occurredAt.replace('T', ' ')}</div>
                  </div>
                  <Badge kind={c.seen ? 'mute' : 'warn'}>{c.channel}</Badge>
                </div>
              ))}
            </Card>
            <Card title="Notes">
              <p style={{ margin: 0 }}>{m.notes}</p>
            </Card>
          </div>
        </div>
      )}

      {tab === 'rolodex' && (
        <div className="grid g-2">
          <Card title="Family">
            {m.family.map((f) => (
              <div key={f.id} className="row">
                <div>
                  <div className="title">{f.name}</div>
                  <div className="sub">{f.relation} · {f.notes}</div>
                </div>
              </div>
            ))}
          </Card>
          <Card title="Favorites & interests">
            <p><b>Alcohol:</b> {m.favorites.alcohol || '—'}</p>
            <p><b>Restaurants:</b> {m.favorites.restaurants.join(', ') || '—'}</p>
            <div className="pills">
              {m.interests.concat(m.hobbies, m.favorites.other).map((x) => (
                <span key={x} className="pill">{x}</span>
              ))}
            </div>
          </Card>
          <Card title="Relationship memory">
            <Field label="Add a memory">
              <textarea value={memText} onChange={(e) => setMemText(e.target.value)} />
            </Field>
            <Btn kind="tiny" onClick={addMemory}>Remember</Btn>
            {m.memories.map((mem) => (
              <div key={mem.id} className="row">
                <div>
                  <div className="title">{mem.text}</div>
                  <div className="sub">{mem.kind} · {mem.createdAt}</div>
                </div>
                <Btn
                  kind="bad tiny"
                  onClick={() =>
                    patch((s) => {
                      const row = s.members.find((mm) => mm.id === m.id)
                      if (row) row.memories = row.memories.filter((x) => x.id !== mem.id)
                    })
                  }
                >
                  Forget
                </Btn>
              </div>
            ))}
          </Card>
          <Card title="Email reply assistant">
            <Field label="Paste inbound (demo — stays local)">
              <textarea value={inbound} onChange={(e) => setInbound(e.target.value)} placeholder="Paste a simulated inbound note…" />
            </Field>
            <Btn
              kind="tiny"
              onClick={() => {
                const variants = emailVariants(m.name, inbound || 'checking in', 'direct')
                patch((s) => {
                  for (const v of variants) {
                    addDraft(s, {
                      subjectId: m.id,
                      subjectType: 'member',
                      toName: m.name,
                      subject: v.subject,
                      body: v.body,
                      variant: v.label,
                      status: 'draft',
                      createdAt: nowISO(),
                    })
                  }
                })
              }}
            >
              Draft three versions
            </Btn>
            {drafts.map((d) => (
              <div key={d.id} className="row">
                <div>
                  <div className="title">{d.variant} · {d.subject}</div>
                  <div className="sub" style={{ whiteSpace: 'pre-wrap' }}>{d.body}</div>
                </div>
                <Btn
                  kind="tiny"
                  onClick={() => {
                    void navigator.clipboard?.writeText(d.body)
                    patch((s) => {
                      const row = s.drafts.find((x) => x.id === d.id)
                      if (row) row.status = 'copied'
                    })
                  }}
                >
                  Copy
                </Btn>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab === 'accounts' && (
        <Card title="Orion-style account list (simulated)">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>AUM</th>
              </tr>
            </thead>
            <tbody>
              {m.accounts.map((a) => (
                <tr key={a.id}>
                  <td className="num">{a.code}</td>
                  <td>{a.name}</td>
                  <td>{a.type}</td>
                  <td className="num">{compact(a.aum)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'plan' && (
        <Card
          title="Touchpoints"
          action={
            <Btn
              kind="tiny"
              onClick={() =>
                patch((s) =>
                  addTouch(s, {
                    subjectId: m.id,
                    subjectType: 'member',
                    kind: 'call',
                    title: `Check-in · ${m.name}`,
                    date: '2026-08-22',
                    status: 'planned',
                    notes: '',
                  }),
                )
              }
            >
              Add a call
            </Btn>
          }
        >
          {touches.map((t) => (
            <div key={t.id} className="row">
              <div>
                <div className="title">{t.title}</div>
                <div className="sub">{t.date} · {t.kind} · {t.notes}</div>
              </div>
              <Badge kind={t.status === 'due' ? 'warn' : t.status === 'done' ? 'ok' : 'mute'}>{t.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
