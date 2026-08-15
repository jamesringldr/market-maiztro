import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Card } from '../components/ui'
import { useStore } from '../lib/store'

type Slice = 'all' | 'landmines' | 'missing' | 'family' | 'artifacts'

export function Knowledge() {
  const { state } = useStore()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [slice, setSlice] = useState<Slice>('all')

  const s = q.trim().toLowerCase()
  const match = (blob: string) => !s || blob.toLowerCase().includes(s)

  const landmines = useMemo(
    () =>
      state.members.flatMap((m) =>
        m.dontTouch
          .filter((d) => match(`${m.name} ${d}`))
          .map((d) => ({ id: `${m.id}-${d}`, to: `/members/${m.id}`, name: m.name, body: d })),
      ),
    [state.members, s],
  )

  const missing = useMemo(
    () =>
      state.members.flatMap((m) =>
        m.missingInfo
          .filter((d) => match(`${m.name} ${d}`))
          .map((d) => ({ id: `${m.id}-${d}`, to: `/members/${m.id}`, name: m.name, body: d })),
      ),
    [state.members, s],
  )

  const family = useMemo(
    () =>
      state.members.flatMap((m) =>
        m.family
          .filter((f) => match(`${m.name} ${f.name} ${f.relation} ${f.notes}`))
          .map((f) => ({
            id: f.id,
            to: `/members/${m.id}`,
            name: `${f.name} · ${m.name}`,
            body: `${f.relation} — ${f.notes}`,
          })),
      ),
    [state.members, s],
  )

  const artifacts = useMemo(
    () =>
      state.artifacts
        .filter((a) => match(`${a.title} ${a.body}`))
        .map((a) => ({ id: a.id, to: a.subjectId ? `/members/${a.subjectId}` : '/studio', name: a.title, body: a.body.slice(0, 180) })),
    [state.artifacts, s],
  )

  const files = useMemo(() => {
    const rows: { id: string; to: string; title: string; body: string; tag: string }[] = []
    for (const m of state.members) {
      const body = [m.strategy, m.notes, m.riskProfile, ...m.dontTouch, ...m.memories.map((x) => x.text), ...m.family.map((f) => `${f.name} ${f.notes}`), ...m.missingInfo].join(' ')
      if (match(`${m.name} ${m.company} ${body}`)) {
        rows.push({ id: m.id, to: `/members/${m.id}`, title: m.name, body: m.strategy, tag: 'member' })
      }
    }
    for (const p of state.prospects) {
      const body = `${p.notes} ${p.priorNotes} ${p.objective}`
      if (match(`${p.name} ${p.company} ${body}`)) {
        rows.push({ id: p.id, to: `/prospects/${p.id}`, title: p.name, body: p.objective, tag: 'prospect' })
      }
    }
    return rows
  }, [state.members, state.prospects, s])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Knowledge base</h2>
          <p className="lede">
            The same book, read as a library. Landmines, missing paper, family, and anything
            you generated — not a second CRM.
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
      <div className="filters">
        {([
          ['all', 'All files'],
          ['landmines', 'Landmines'],
          ['missing', 'Missing info'],
          ['family', 'Family'],
          ['artifacts', 'Generated'],
        ] as const).map(([k, label]) => (
          <button key={k} className={`chip ${slice === k ? 'on' : ''}`} onClick={() => setSlice(k)}>
            {label}
          </button>
        ))}
      </div>

      {slice === 'all' && (
        <div className="grid g-2">
          {files.map((h) => (
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
      )}

      {slice === 'landmines' && (
        <Card title="Do not touch">
          {landmines.length === 0 && <div className="empty">Nothing matches.</div>}
          {landmines.map((r) => (
            <div key={r.id} className="row click" onClick={() => nav(r.to)}>
              <div>
                <div className="title">{r.name}</div>
                <div className="sub">{r.body}</div>
              </div>
              <Badge kind="danger">landmine</Badge>
            </div>
          ))}
        </Card>
      )}

      {slice === 'missing' && (
        <Card title="Paper still out">
          {missing.length === 0 && <div className="empty">Nothing matches.</div>}
          {missing.map((r) => (
            <div key={r.id} className="row click" onClick={() => nav(r.to)}>
              <div>
                <div className="title">{r.name}</div>
                <div className="sub">{r.body}</div>
              </div>
              <Badge kind="warn">missing</Badge>
            </div>
          ))}
        </Card>
      )}

      {slice === 'family' && (
        <Card title="Household">
          {family.length === 0 && <div className="empty">Nothing matches.</div>}
          {family.map((r) => (
            <div key={r.id} className="row click" onClick={() => nav(r.to)}>
              <div>
                <div className="title">{r.name}</div>
                <div className="sub">{r.body}</div>
              </div>
            </div>
          ))}
        </Card>
      )}

      {slice === 'artifacts' && (
        <Card title="Generated on this desk">
          {artifacts.length === 0 && <div className="empty">Generate a brief, plan, or recap first.</div>}
          {artifacts.map((r) => (
            <div key={r.id} className="row click" onClick={() => nav(r.to)}>
              <div>
                <div className="title">{r.name}</div>
                <div className="sub">{r.body}</div>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
