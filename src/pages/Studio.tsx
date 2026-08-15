import { useState } from 'react'
import { Btn, Card, Field } from '../components/ui'
import { callScript, emailVariants, interactionPlan, prospectBrief } from '../lib/ai'
import { nowISO } from '../lib/ids'
import { addArtifact, addDraft, useStore } from '../lib/store'

export function Studio() {
  const { state, patch } = useStore()
  const [pid, setPid] = useState(state.prospects[0]?.id ?? '')
  const [callType, setCallType] = useState('meeting prep')
  const [horizon, setHorizon] = useState('30-day')
  const [inbound, setInbound] = useState('')
  const [out, setOut] = useState('')
  const p = state.prospects.find((x) => x.id === pid)

  function run(kind: 'brief' | 'script' | 'plan', title: string, body: string) {
    setOut(body)
    patch((s) => addArtifact(s, { kind, title, subjectId: pid, body, createdAt: nowISO() }))
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Studio</h2>
          <p className="lede">
            Briefs, scripts, plans, and reply drafts. All generated from the file you already
            have — templates with judgment, not a model on the other side of a wire.
          </p>
        </div>
      </div>

      <div className="grid g-main">
        <div className="grid">
          <Card title="Subject">
            <Field label="Prospect">
              <select value={pid} onChange={(e) => setPid(e.target.value)}>
                {state.prospects.map((x) => (
                  <option key={x.id} value={x.id}>{x.name} · {x.company}</option>
                ))}
              </select>
            </Field>
            {p && <p className="sub">{p.objective}</p>}
          </Card>
          <Card title="Outputs">
            <div className="btn-row">
              <Btn
                kind="primary"
                onClick={() => p && run('brief', `Brief — ${p.name}`, prospectBrief(p))}
              >
                Intelligence brief
              </Btn>
              <Btn
                onClick={() => p && run('script', `Script — ${p.name}`, callScript(p, callType))}
              >
                Call script
              </Btn>
              <Btn
                onClick={() =>
                  p && run('plan', `Plan — ${p.name}`, interactionPlan(p.name, p.company, horizon, p.objective, {
                    lastTouch: p.lastTouch,
                    nextTouch: p.nextTouch,
                    products: p.products,
                    stage: p.stage,
                    notes: p.notes,
                    priorNotes: p.priorNotes,
                    source: p.source,
                    city: p.city,
                    relationship: p.relationshipStatus,
                  }))
                }
              >
                Interaction plan
              </Btn>
            </div>
            <div className="form-grid" style={{ marginTop: 12 }}>
              <Field label="Call type">
                <select value={callType} onChange={(e) => setCallType(e.target.value)}>
                  <option>cold call</option>
                  <option>warm call</option>
                  <option>follow-up</option>
                  <option>referral intro</option>
                  <option>meeting prep</option>
                </select>
              </Field>
              <Field label="Plan horizon">
                <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                  <option>7-day</option>
                  <option>30-day</option>
                  <option>60-day</option>
                  <option>90-day</option>
                  <option>annual</option>
                </select>
              </Field>
            </div>
          </Card>
          <Card title="Email reply assistant">
            <Field label="Paste inbound">
              <textarea value={inbound} onChange={(e) => setInbound(e.target.value)} />
            </Field>
            <Btn
              onClick={() => {
                if (!p) return
                const variants = emailVariants(p.name, inbound || p.notes, p.tone)
                setOut(variants.map((v) => `## ${v.label}\nSubject: ${v.subject}\n\n${v.body}`).join('\n\n'))
                patch((s) => {
                  for (const v of variants) {
                    addDraft(s, {
                      subjectId: p.id,
                      subjectType: 'prospect',
                      toName: p.name,
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
              Draft replies
            </Btn>
          </Card>
        </div>
        <Card title="Preview" action={out ? <Btn kind="tiny" onClick={() => void navigator.clipboard?.writeText(out)}>Copy</Btn> : null}>
          {out ? <div className="prose-box prose">{out}</div> : <div className="empty">Pick a person. Generate something.</div>}
        </Card>
      </div>
    </div>
  )
}
