import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../components/ui'
import { useStore } from '../lib/store'

export function Knowledge() {
  const { state } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    const rows: { id: string; to: string; title: string; body: string; tag: string }[] = []
    for (const m of state.members) {
      const body = [
        m.strategy,
        m.notes,
        m.riskProfile,
        m.dontTouch.join(' '),
        m.memories.map((x) => x.text).join(' '),
        m.family.map((f) => `${f.name} ${f.notes}`).join(' '),
        m.missingInfo.join(' '),
      ].join(' \n ')
      if (!s || `${m.name} ${m.company} ${body}`.toLowerCase().includes(s)) {
        rows.push({ id: m.id, to: `/members/${m.id}`, title: m.name, body: m.strategy, tag: 'member' })
      }
    }
    for (const p of state.prospects) {
      const body = `${p.notes} ${p.priorNotes} ${p.objective}`
      if (!s || `${p.name} ${p.company} ${body}`.toLowerCase().includes(s)) {
        rows.push({ id: p.id, to: `/prospects/${p.id}`, title: p.name, body: p.objective, tag: 'prospect' })
      }
    }
    return rows
  }, [q, state.members, state.prospects])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Knowledge base</h2>
          <p className="lede">
            Client information in one searchable desk. Strategy, landmines, family, missing
            paperwork — not a second CRM, the same book read as a library.
          </p>
        </div>
      </div>
      <input
        className="search"
        style={{ maxWidth: '100%', marginBottom: 14 }}
        placeholder="Search names, landmines, family, strategy…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="grid g-2">
        {hits.map((h) => (
          <Card key={h.id} title={h.tag}>
            <div className="row click" onClick={() => nav(h.to)}>
              <div>
                <div className="title">{h.title}</div>
                <div className="sub">{h.body}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
