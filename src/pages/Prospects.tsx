import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Btn, Card, Field } from '../components/ui'
import { uid } from '../lib/ids'
import { upsertProspect, useStore } from '../lib/store'
import type { Prospect, ProspectStage } from '../types'

const STAGES: ProspectStage[] = ['research', 'outreach', 'discovery', 'proposal', 'commit', 'nurture']

export function Prospects() {
  const { state, patch } = useStore()
  const nav = useNavigate()
  const [stage, setStage] = useState<'all' | ProspectStage>('all')
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [industry, setIndustry] = useState('')
  const [objective, setObjective] = useState('')

  const rows = useMemo(
    () => state.prospects.filter((p) => stage === 'all' || p.stage === stage),
    [state.prospects, stage],
  )

  function create() {
    if (!name.trim()) return
    const id = uid('p')
    const p: Prospect = {
      id,
      name: name.trim(),
      company: company.trim() || name.trim(),
      title: 'Principal',
      website: '',
      linkedin: '',
      industry: industry.trim() || 'Unspecified',
      email: '',
      phone: '',
      city: '',
      stage: 'research',
      relationshipStatus: 'cold',
      objective: objective.trim() || 'First conversation.',
      products: [],
      tone: 'Professional but conversational',
      notes: '',
      priorNotes: '',
      lastTouch: '2026-08-15',
      nextTouch: '2026-08-22',
      owner: 'James',
      source: 'Manual',
    }
    patch((s) => upsertProspect(s, p))
    nav(`/prospects/${id}`)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Prospects</h2>
          <p className="lede">
            This is Solyco’s CRM. There is no other one. Stages are a desk convention,
            not a Salesforce import.
          </p>
        </div>
        <Btn kind="primary" onClick={() => setOpen((v) => !v)}>{open ? 'Close' : 'New prospect'}</Btn>
      </div>

      {open && (
        <Card title="Add to the book" className=" " >
          <div className="form-grid">
            <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Company"><input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
            <Field label="Industry"><input value={industry} onChange={(e) => setIndustry(e.target.value)} /></Field>
            <Field label="Objective"><input value={objective} onChange={(e) => setObjective(e.target.value)} /></Field>
          </div>
          <Btn kind="primary" onClick={create}>Create file</Btn>
        </Card>
      )}

      <div className="filters">
        <button className={`chip ${stage === 'all' ? 'on' : ''}`} onClick={() => setStage('all')}>all</button>
        {STAGES.map((s) => (
          <button key={s} className={`chip ${stage === s ? 'on' : ''}`} onClick={() => setStage(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Stage</th>
              <th>Relationship</th>
              <th>Next</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="clickable" onClick={() => nav(`/prospects/${p.id}`)}>
                <td>
                  <div className="title">{p.name}</div>
                  <div className="sub">{p.title} · {p.city}</div>
                </td>
                <td>{p.company}</td>
                <td><Badge kind={p.stage === 'commit' ? 'ok' : p.stage === 'proposal' ? 'warn' : 'info'}>{p.stage}</Badge></td>
                <td>{p.relationshipStatus}</td>
                <td>{p.nextTouch}</td>
                <td className="sub">{p.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
