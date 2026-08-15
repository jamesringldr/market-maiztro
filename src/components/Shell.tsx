import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { fmtDate, todayISO } from '../lib/ids'

const NAV = [
  { label: 'Launch pad', to: '/' },
  { label: 'Approvals', to: '/approvals' },
  { label: 'Comms', to: '/comms' },
  { label: 'Trades', to: '/trades' },
  { label: 'Daily prep', to: '/meetings' },
  { label: 'In meeting', to: '/live' },
]

const BOOK = [
  { label: 'Members', to: '/members' },
  { label: 'Prospects', to: '/prospects' },
  { label: 'Touchpoints', to: '/touchpoints' },
  { label: 'Knowledge', to: '/knowledge' },
]

const DESK = [
  { label: 'Market brief', to: '/market' },
  { label: 'Studio', to: '/studio' },
  { label: 'Integrations', to: '/integrations' },
]

export function Shell() {
  const { state, reset } = useStore()
  const loc = useLocation()
  const nav = useNavigate()
  const [q, setQ] = useState('')

  const pendingTrades = state.trades.filter((t) => t.status === 'pending').length
  const pendingEdge = state.approvals.filter((a) => a.status === 'pending').length
  const unseen = state.comms.filter((c) => !c.seen).length
  const todayMeetings = state.meetings.filter((m) => m.when.startsWith(todayISO())).length

  const counts: Record<string, number> = {
    '/approvals': pendingTrades + pendingEdge,
    '/comms': unseen,
    '/trades': pendingTrades,
    '/meetings': todayMeetings,
  }

  const hits = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (s.length < 2) return []
    const people = [
      ...state.members.map((m) => ({ to: `/members/${m.id}`, name: m.name, sub: m.company })),
      ...state.prospects.map((p) => ({ to: `/prospects/${p.id}`, name: p.name, sub: p.company })),
    ]
    return people.filter((p) => `${p.name} ${p.sub}`.toLowerCase().includes(s)).slice(0, 6)
  }, [q, state.members, state.prospects])

  const title =
    loc.pathname === '/' ? 'Launch pad' :
    loc.pathname.startsWith('/members/') ? 'Member' :
    loc.pathname.startsWith('/prospects/') ? 'Prospect' :
    loc.pathname.startsWith('/meetings/') ? 'Meeting' :
    loc.pathname.replace('/', '') || 'Launch pad'

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-kicker">Solyco</div>
          <h1>Market Maiztro</h1>
          <p>Internal desk · simulation</p>
        </div>
        <nav className="nav">
          <div className="nav-label">Command</div>
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'} className={({ isActive }) => (isActive ? 'active' : '')}>
              <span>{n.label}</span>
              {counts[n.to] ? <span className="count">{counts[n.to]}</span> : null}
            </NavLink>
          ))}
          <div className="nav-label">Book</div>
          {BOOK.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
          <div className="nav-label">Desk</div>
          {DESK.map((n) => (
            <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-foot">
          <div className="who">James · Partner</div>
          <div>Demo book · no live wires</div>
          <button
            className="ghost"
            onClick={() => {
              if (confirm('Reset the demo book to the original seed?')) reset()
            }}
          >
            Reset demo data
          </button>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="crumb">
            Solyco desk / <strong>{title}</strong>
          </div>
          <div style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
            <input
              className="search"
              style={{ width: '100%', maxWidth: 'none' }}
              placeholder="Find a member or prospect…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && hits[0]) {
                  nav(hits[0].to)
                  setQ('')
                }
              }}
            />
            {hits.length > 0 && (
              <div className="card" style={{ position: 'absolute', top: 40, left: 0, right: 0, zIndex: 8 }}>
                {hits.map((h) => (
                  <div
                    key={h.to}
                    className="row click"
                    onClick={() => {
                      nav(h.to)
                      setQ('')
                    }}
                  >
                    <div>
                      <div className="title">{h.name}</div>
                      <div className="sub">{h.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="top-meta">
            <b>{fmtDate(`${todayISO()}T12:00:00`)}</b>
            Desk date locked to the demo tape
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  )
}
