import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Btn } from '../components/ui'
import { compact } from '../lib/ids'
import { useStore } from '../lib/store'
import type { MemberKind } from '../types'

export function Members() {
  const { state } = useStore()
  const nav = useNavigate()
  const [kind, setKind] = useState<'all' | MemberKind>('all')
  const rows = useMemo(
    () => state.members.filter((m) => kind === 'all' || m.kind === kind),
    [state.members, kind],
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Members</h2>
          <p className="lede">
            The book. Clients, LPs, family offices, portfolio chairs. This is the CRM for
            people who already write checks — prospects live next door.
          </p>
        </div>
        <Btn kind="primary" onClick={() => nav('/members/new')}>New member</Btn>
      </div>
      <div className="filters">
        {(['all', 'lp', 'family-office', 'portfolio', 'advisor-client'] as const).map((k) => (
          <button key={k} className={`chip ${kind === k ? 'on' : ''}`} onClick={() => setKind(k)}>
            {k}
          </button>
        ))}
      </div>
      <div className="card" style={{ padding: 0 }}>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Entity</th>
                <th>Kind</th>
                <th>AUM</th>
                <th>Risk</th>
                <th>Next touch</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => (
                <tr key={m.id} className="clickable" onClick={() => nav(`/members/${m.id}`)}>
                  <td>
                    <div className="title">{m.name}</div>
                    <div className="sub">{m.title} · {m.city}</div>
                  </td>
                  <td>{m.company}</td>
                  <td><Badge kind="mute">{m.kind}</Badge></td>
                  <td className="num">{compact(m.aum)}</td>
                  <td className="sub">{m.riskProfile}</td>
                  <td>{m.nextTouch}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
