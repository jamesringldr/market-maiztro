export function uid(prefix = 'id'): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`
}

export function money(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function moneyExact(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(n)
}

export function pct(n: number): string {
  return `${(n * 100).toFixed(2)}%`
}

export function signedPct(n: number): string {
  const body = `${(Math.abs(n) * 100).toFixed(2)}%`
  if (n > 0) return `+${body}`
  if (n < 0) return `−${body}`
  return body
}

export function sheetDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  return `${Number(m)}/${Number(d)}/${y}`
}

export function compact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return money(n)
}

export function fmtDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function fmtDateTime(iso: string): string {
  return `${fmtDate(iso)} · ${fmtTime(iso)}`
}

export function todayISO(): string {
  return '2026-08-15'
}

export function nowISO(): string {
  return '2026-08-15T12:10:00'
}

export function isSameDay(iso: string, day = todayISO()): boolean {
  return iso.slice(0, 10) === day
}

export function daysFrom(iso: string, day = todayISO()): number {
  const a = new Date(`${day}T00:00:00`)
  const b = new Date(`${iso.slice(0, 10)}T00:00:00`)
  return Math.round((b.getTime() - a.getTime()) / 86400000)
}
