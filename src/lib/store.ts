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
      symbol: t.symbol,
      side: t.side,
      quantity: t.quantity,
      price: t.price,
      date: t.date,
    }
    s.posted.unshift(txn)
  }
}

export function assignFanout(s: AppState, tradeId: string, memberId: string, accountId: string): void {
  const t = s.trades.find((x) => x.id === tradeId)
  const m = s.members.find((x) => x.id === memberId)
  const a = m?.accounts.find((x) => x.id === accountId)
  if (!t || t.status !== 'pending' || !m || !a) return
  t.fanout = [{ memberId: m.id, accountId: a.id, accountCode: a.code }]
  t.accountCode = a.code
  t.clientHint = m.name
}

export function rejectTrade(s: AppState, id: string, reason: string): void {
  const t = s.trades.find((x) => x.id === id)
  if (!t || t.status !== 'pending') return
  t.status = 'rejected'
  t.reason = reason
}

export function resolveFanout(s: AppState, accountCode: string, clientHint: string) {
  const code = accountCode.trim().toUpperCase()
  const hint = clientHint.trim().toLowerCase()
  const hits: Trade['fanout'] = []
  for (const m of s.members) {
    for (const a of m.accounts) {
      if (a.code.toUpperCase() === code) {
        hits.push({ memberId: m.id, accountId: a.id, accountCode: a.code })
      }
    }
  }
  if (hits.length) return hits
  if (hint) {
    for (const m of s.members) {
      const blob = `${m.name} ${m.company}`.toLowerCase()
      if (blob.includes(hint) || hint.includes(m.name.split(' ').pop()!.toLowerCase())) {
        const a = m.accounts[0]
        if (a) hits.push({ memberId: m.id, accountId: a.id, accountCode: a.code })
      }
    }
  }
  return hits
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
