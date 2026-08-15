export type CsvRow = {
  date: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  account_code: string
  client_hint: string
}

function splitLine(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      q = !q
      continue
    }
    if (ch === ',' && !q) {
      out.push(cur.trim())
      cur = ''
      continue
    }
    cur += ch
  }
  out.push(cur.trim())
  return out
}

export function parseTradesCsv(text: string): { rows: CsvRow[]; errors: string[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
  const errors: string[] = []
  if (!lines.length) return { rows: [], errors: ['Empty file'] }

  const header = splitLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'))
  const idx = (name: string) => header.indexOf(name)
  const need = ['date', 'symbol', 'side', 'quantity', 'price', 'account_code', 'client_hint']
  for (const n of need) {
    if (idx(n) < 0) errors.push(`Missing column: ${n}`)
  }
  if (errors.length) return { rows: [], errors }

  const rows: CsvRow[] = []
  lines.slice(1).forEach((line, i) => {
    const cols = splitLine(line)
    const sideRaw = (cols[idx('side')] || '').toLowerCase()
    const side = sideRaw === 'sell' ? 'sell' : sideRaw === 'buy' ? 'buy' : null
    const quantity = Number(cols[idx('quantity')])
    const price = Number(cols[idx('price')])
    if (!side) {
      errors.push(`Row ${i + 2}: side must be buy or sell`)
      return
    }
    if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
      errors.push(`Row ${i + 2}: quantity/price not numeric`)
      return
    }
    rows.push({
      date: cols[idx('date')] || '',
      symbol: (cols[idx('symbol')] || '').toUpperCase(),
      side,
      quantity,
      price,
      account_code: cols[idx('account_code')] || '',
      client_hint: cols[idx('client_hint')] || '',
    })
  })
  return { rows, errors }
}

export const DEMO_CSV = `date,symbol,side,quantity,price,account_code,client_hint
2026-08-15,BIL,buy,2500,91.64,VOSS-IRA-8841,Voss IRA
2026-08-15,VCIT,buy,1800,82.10,SHAH-TX-092,Shah taxable
2026-08-15,MSFT,sell,120,428.55,CHEN-TX-330,Chen
2026-08-15,JEPI,buy,3000,56.22,ALVA-IRA-56,Alvarez IRA
2026-08-15,BRK.B,buy,40,412.00,HALE-TX-04,Hale
`
