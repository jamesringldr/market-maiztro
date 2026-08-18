import { createContext, useContext } from 'react'
import type {
  AppState,
  Artifact,
  CommsEvent,
  EmailDraft,
  Meeting,
  Member,
  PostedTxn,
  Prospect,
  SubjectType,
  Touchpoint,
  Trade,
} from '../types'
import { uid } from './ids'
import { buildSeed, SEED_VERSION } from './seed'

const KEY = `market-maiztro.v${SEED_VERSION}`

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return buildSeed()
    const parsed = JSON.parse(raw) as AppState
    if (!parsed.members?.length) return buildSeed()
    parsed.meetings = (parsed.meetings ?? []).map((m) => ({ ...m, heard: m.heard ?? [] }))
    return parsed
  } catch {
    return buildSeed()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function resetState(): AppState {
  localStorage.removeItem(KEY)
  return buildSeed()
}

export type StoreApi = {
  state: AppState
  patch: (fn: (s: AppState) => void) => void
  reset: () => void
  personName: (type: SubjectType, id: string) => string
  findPerson: (type: SubjectType, id: string) => Member | Prospect | undefined
}

export const StoreContext = createContext<StoreApi | null>(null)

export function useStore(): StoreApi {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('Store missing')
  return ctx
}

export function addComms(s: AppState, event: Omit<CommsEvent, 'id'>): CommsEvent {
  const row: CommsEvent = { ...event, id: uid('c') }
  s.comms.unshift(row)
  return row
}

export function addTrade(s: AppState, trade: Omit<Trade, 'id'>): Trade {
  const row: Trade = { ...trade, id: uid('tr') }
  s.trades.unshift(row)
  return row
}

export function approveTrade(s: AppState, id: string): void {
  const t = s.trades.find((x) => x.id === id)
  if (!t || t.status !== 'pending') return
  t.status = 'approved'
  for (const f of t.fanout) {
    const txn: PostedTxn = {
      id: uid('txn'),
      tradeId: t.id,
      memberId: f.memberId,
      accountId: f.accountId,
      ticker: t.ticker,
      weight: t.newWeight,
      portfolioName: t.portfolioName,
      date: t.lastTradeDate,
    }
    s.posted.unshift(txn)
  }
}

export function assignFanout(s: AppState, tradeId: string, memberId: string, accountId: string): void {
  const t = s.trades.find((x) => x.id === tradeId)
  const m = s.members.find((x) => x.id === memberId)
  const a = m?.accounts.find((x) => x.id === accountId)
  if (!t || t.status !== 'pending' || !m || !a) return
  if (t.fanout.some((f) => f.accountId === a.id)) return
  t.fanout.push({ memberId: m.id, accountId: a.id, accountCode: a.code })
}

export function rejectTrade(s: AppState, id: string, reason: string): void {
  const t = s.trades.find((x) => x.id === id)
  if (!t || t.status !== 'pending') return
  t.status = 'rejected'
  t.reason = reason
}

export function upsertProspect(s: AppState, p: Prospect): void {
  const i = s.prospects.findIndex((x) => x.id === p.id)
  if (i >= 0) s.prospects[i] = p
  else s.prospects.unshift(p)
}

export function upsertMember(s: AppState, m: Member): void {
  const i = s.members.findIndex((x) => x.id === m.id)
  if (i >= 0) s.members[i] = m
  else s.members.unshift(m)
}

export function addTouch(s: AppState, t: Omit<Touchpoint, 'id'>): Touchpoint {
  const row: Touchpoint = { ...t, id: uid('t') }
  s.touchpoints.unshift(row)
  return row
}

export function addDraft(s: AppState, d: Omit<EmailDraft, 'id'>): EmailDraft {
  const row: EmailDraft = { ...d, id: uid('d') }
  s.drafts.unshift(row)
  return row
}

export function addArtifact(s: AppState, a: Omit<Artifact, 'id'>): Artifact {
  const row: Artifact = { ...a, id: uid('art') }
  s.artifacts.unshift(row)
  return row
}

export function updateMeeting(s: AppState, id: string, patch: Partial<Meeting>): Meeting | undefined {
  const m = s.meetings.find((x) => x.id === id)
  if (!m) return
  Object.assign(m, patch)
  return m
}
