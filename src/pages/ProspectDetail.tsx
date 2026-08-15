import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Badge, Btn, Card, Field } from '../components/ui'
import { callScript, interactionPlan, prospectBrief } from '../lib/ai'
import { nowISO } from '../lib/ids'
import { addArtifact, upsertProspect, useStore } from '../lib/store'
import type { Prospect, ProspectStage, RelationshipStatus } from '../types'

const STAGES: ProspectStage[] = ['research', 'outreach', 'discovery', 'proposal', 'commit', 'nurture']
const REL: RelationshipStatus[] = ['cold', 'warm', 'referral', 'active-dialogue', 'meeting-set', 'client']
const CALLS = ['cold call', 'warm call', 'follow-up', 'referral intro', 'meeting prep']

export function ProspectDetail() {
  const { id } = useParams()
  const { state, patch } = useStore()
  const p = state.prospects.find((x) => x.id === id)
  const [callType, setCallType] = useState('warm call')
  const [horizon, setHorizon] = useState('30-day')
  const [out, setOut] = useState('')

  if (!p) return <div className="page">No prospect on that id.</div>
  const prospect = p

  function save<K extends keyof Prospect>(key: K, value: Prospect[K]) {
    patch((s) => {
      const row = s.prospects.find((x) => x.id === prospect.id)
      if (row) {
        Object.assign(row, { [key]: value })
        upsertProspect(s, row)
      }
    })
  }

  function show(kind: 'brief' | 'script' | 'plan', title: string, body: string) {
    setOut(body)
    patch((s) =>
      addArtifact(s, { kind, title, subjectId: prospect.id, body, createdAt: nowISO() }),
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>{p.name}</h2>
          <p className="lede">
            {p.title} · {p.company} · {p.industry} · {p.city}
          </p>
        </div>
        <div className="btn-row">
          <Badge kind="info">{p.stage}</Badge>
          <Badge kind="brass">{p.relationshipStatus}</Badge>
        </div>
      </div>

      <div className="grid g-main">
        <div className="grid">
          <Card title="File">
            <div className="form-grid">
              <Field label="Stage">
                <select value={p.stage} onChange={(e) => save('stage', e.target.value as ProspectStage)}>
                  {STAGES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Relationship">
                <select
                  value={p.relationshipStatus}
                  onChange={(e) => save('relationshipStatus', e.target.value as RelationshipStatus)}
                >
                  {REL.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
              <Field label="Website"><input value={p.website} onChange={(e) => save('website', e.target.value)} /></Field>
              <Field label="LinkedIn"><input value={p.linkedin} onChange={(e) => save('linkedin', e.target.value)} /></Field>
            </div>
            <Field label="Objective">
              <textarea value={p.objective} onChange={(e) => save('objective', e.target.value)} />
            </Field>
            <Field label="Notes">
              <textarea value={p.notes} onChange={(e) => save('notes', e.target.value)} />
            </Field>
            <Field label="Prior conversation">
              <textarea value={p.priorNotes} onChange={(e) => save('priorNotes', e.target.value)} />
            </Field>
            <p className="sub">Owner {p.owner} · source {p.source} · last {p.lastTouch} · next {p.nextTouch}</p>
          </Card>

          {out && (
            <Card title="Generated (simulated)" action={<Btn kind="tiny" onClick={() => void navigator.clipboard?.writeText(out)}>Copy</Btn>}>
              <div className="prose-box prose">{out}</div>
            </Card>
          )}
        </div>

        <div className="grid">
          <Card title="Intelligence brief">
            <p className="sub">Who they are, why they matter, how to open. No live research wire.</p>
            <Btn kind="primary" onClick={() => show('brief', `Brief — ${p.name}`, prospectBrief(p))}>
              Generate brief
            </Btn>
          </Card>
          <Card title="Call script">
            <Field label="Call type">
              <select value={callType} onChange={(e) => setCallType(e.target.value)}>
                {CALLS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Btn onClick={() => show('script', `Script — ${p.name}`, callScript(p, callType))}>
              Build script
            </Btn>
          </Card>
          <Card title="Interaction plan">
            <Field label="Horizon">
              <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option>7-day</option>
                <option>30-day</option>
                <option>60-day</option>
                <option>90-day</option>
                <option>annual</option>
              </select>
            </Field>
            <Btn onClick={() => show('plan', `Plan — ${p.name}`, interactionPlan(p.name, p.company, horizon, p.objective, {
              lastTouch: p.lastTouch,
              nextTouch: p.nextTouch,
              products: p.products,
              stage: p.stage,
              notes: p.notes,
              priorNotes: p.priorNotes,
              source: p.source,
              city: p.city,
              relationship: p.relationshipStatus,
            }))}>
              Build plan
            </Btn>
          </Card>
          <Card title="Products in play">
            <div className="pills">
              {p.products.map((x) => (
                <span key={x} className="pill">{x}</span>
              ))}
            </div>
            <p className="sub" style={{ marginTop: 10 }}>Tone: {p.tone}</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
