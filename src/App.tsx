import { useCallback, useMemo, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import { StoreContext, loadState, resetState, saveState, type StoreApi } from './lib/store'
import type { AppState } from './types'
import { Dashboard } from './pages/Dashboard'
import { Approvals } from './pages/Approvals'
import { Comms } from './pages/Comms'
import { Trades } from './pages/Trades'
import { Meetings } from './pages/Meetings'
import { MeetingPrep } from './pages/MeetingPrep'
import { MeetingLive, LiveRedirect } from './pages/MeetingLive'
import { Members } from './pages/Members'
import { MemberDetail } from './pages/MemberDetail'
import { MemberNew } from './pages/MemberNew'
import { Prospects } from './pages/Prospects'
import { ProspectDetail } from './pages/ProspectDetail'
import { Touchpoints } from './pages/Touchpoints'
import { Knowledge } from './pages/Knowledge'
import { Market } from './pages/Market'
import { Studio } from './pages/Studio'
import { Integrations } from './pages/Integrations'

export function App() {
  const [state, setState] = useState<AppState>(() => loadState())

  const patch = useCallback((fn: (s: AppState) => void) => {
    setState((prev) => {
      const next: AppState = structuredClone(prev)
      fn(next)
      saveState(next)
      return next
    })
  }, [])

  const reset = useCallback(() => {
    const next = resetState()
    setState(next)
  }, [])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      patch,
      reset,
      personName: (type, id) => {
        if (type === 'member') return state.members.find((m) => m.id === id)?.name ?? 'Unknown'
        return state.prospects.find((p) => p.id === id)?.name ?? 'Unknown'
      },
      findPerson: (type, id) =>
        type === 'member'
          ? state.members.find((m) => m.id === id)
          : state.prospects.find((p) => p.id === id),
    }),
    [state, patch, reset],
  )

  return (
    <StoreContext.Provider value={api}>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Dashboard />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="comms" element={<Comms />} />
          <Route path="trades" element={<Trades />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="meetings/:id" element={<MeetingPrep />} />
          <Route path="meetings/:id/live" element={<MeetingLive />} />
          <Route path="live" element={<LiveRedirect />} />
          <Route path="members" element={<Members />} />
          <Route path="members/new" element={<MemberNew />} />
          <Route path="members/:id" element={<MemberDetail />} />
          <Route path="prospects" element={<Prospects />} />
          <Route path="prospects/:id" element={<ProspectDetail />} />
          <Route path="touchpoints" element={<Touchpoints />} />
          <Route path="knowledge" element={<Knowledge />} />
          <Route path="market" element={<Market />} />
          <Route path="studio" element={<Studio />} />
          <Route path="integrations" element={<Integrations />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </StoreContext.Provider>
  )
}
