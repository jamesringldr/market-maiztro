import type { Account, Member, TradeFanout } from '../types'

export type Sleeve = 'qualified' | 'nonqualified' | 'unknown'

export function sleeveOf(portfolioName: string): Sleeve {
  const n = portfolioName.toLowerCase()
  if (/non[-\s]?qualified/.test(n)) return 'nonqualified'
  if (n.includes('qualified')) return 'qualified'
  return 'unknown'
}

export function accountFitsSleeve(type: Account['type'], sleeve: Sleeve): boolean {
  if (sleeve === 'qualified') return type === 'ira' || type === 'trust'
  if (sleeve === 'nonqualified') return type === 'taxable' || type === 'entity'
  return false
}

export function resolvePortfolioFanout(members: Member[], portfolioName: string): TradeFanout[] {
  const sleeve = sleeveOf(portfolioName)
  const hits: TradeFanout[] = []
  for (const m of members) {
    for (const a of m.accounts) {
      if (accountFitsSleeve(a.type, sleeve)) {
        hits.push({ memberId: m.id, accountId: a.id, accountCode: a.code })
      }
    }
  }
  return hits
}

export function isTodayTrade(lastTradeDate: string, day: string): boolean {
  return lastTradeDate.slice(0, 10) === day
}
