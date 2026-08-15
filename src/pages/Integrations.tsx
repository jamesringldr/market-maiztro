import { Badge, Btn, Card } from '../components/ui'
import { addArtifact, addComms, addTrade, resolveFanout, useStore } from '../lib/store'
import { DEMO_CSV, parseTradesCsv } from '../lib/csv'
import { fmtDateTime, nowISO, uid } from '../lib/ids'

export function Integrations() {
  const { state, patch } = useStore()

  function pulse(id: string) {
    const at = nowISO()
    patch((s) => {
      const row = s.integrations.find((i) => i.id === id)
      if (row) {
        row.lastSync = at
        row.status = 'simulated'
      }
      if (id === 'i-outlook') {
        addComms(s, {
          channel: 'email',
          direction: 'in',
          subjectId: 'm-park',
          subjectType: 'member',
          occurredAt: at,
          summary: 'New email from Helen Park',
          seen: false,
        })
      }
      if (id === 'i-phone') {
        addComms(s, {
          channel: 'phone',
          direction: 'in',
          subjectId: 'p-smith',
          subjectType: 'prospect',
          occurredAt: at,
          summary: 'Missed call — John Smith',
          seen: false,
        })
      }
      if (id === 'i-cal') {
        addComms(s, {
          channel: 'email',
          direction: 'in',
          subjectId: 'p-brooks',
          subjectType: 'prospect',
          occurredAt: at,
          summary: 'Calendar: Natalie Brooks accepted Tuesday 10:00',
          seen: false,
        })
      }
      if (id === 'i-news') {
        addArtifact(s, {
          kind: 'market',
          title: 'News pulse — Saturday tape',
          body: 'Regional-bank CRE sleeve sale overnight. Talking point for anyone with a building and a floating rate. Do not turn it into a monologue.',
          createdAt: at,
        })
      }
      if (id === 'i-orion') {
        const voss = s.members.find((m) => m.id === 'm-voss')
        if (voss) voss.notes = `${voss.notes} Orion snapshot refreshed ${at.slice(0, 16)}.`
      }
      if (id === 'i-nitro') {
        const shah = s.members.find((m) => m.id === 'm-shah')
        if (shah) shah.riskProfile = 'Moderate · Nitrogen 55 · questionnaire re-scored (sim)'
      }
      if (id === 'i-edge') {
        s.approvals.unshift({
          id: uid('e'),
          title: 'Standing-letter update — Hale Partners',
          source: 'Edge Tech',
          detail: 'Robert Hale · feeder notice language. Simulated inbound from the approvals bus.',
          status: 'pending',
          createdAt: at,
        })
      }
      if (id === 'i-csv') {
        const { rows } = parseTradesCsv(DEMO_CSV)
        for (const r of rows) {
          addTrade(s, {
            date: r.date,
            symbol: r.symbol,
            side: r.side,
            quantity: r.quantity,
            price: r.price,
            accountCode: r.account_code,
            clientHint: r.client_hint,
            status: 'pending',
            fanout: resolveFanout(s, r.account_code, r.client_hint),
          })
        }
      }
      if (id === 'i-li') {
        addComms(s, {
          channel: 'text',
          direction: 'in',
          subjectId: 'p-brooks',
          subjectType: 'prospect',
          occurredAt: at,
          summary: 'LinkedIn: Natalie Brooks viewed your profile',
          seen: false,
        })
      }
    })
  }

  const actions: Record<string, string> = {
    'i-outlook': 'Simulate inbound email',
    'i-phone': 'Simulate missed call',
    'i-cal': 'Simulate accept',
    'i-news': 'Pulse the tape',
    'i-orion': 'Refresh snapshot',
    'i-nitro': 'Re-score (sim)',
    'i-edge': 'New approval',
    'i-csv': 'Ingest morning file',
    'i-li': 'Simulate profile view',
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Integration hub</h2>
          <p className="lede">
            Every tool Solyco already pays for, none of them talking to each other — except
            here, as a simulation. No OAuth, no vendor APIs, no message bodies.
          </p>
        </div>
      </div>
      <div className="grid g-3">
        {state.integrations.map((i) => (
          <Card key={i.id} className="int-card" title={i.category}>
            <div>
              <div className="title" style={{ fontSize: 18 }}>{i.name}</div>
              <div className="vendor">{i.vendor}</div>
            </div>
            <p>{i.detail}</p>
            <div className="row" style={{ border: 0, padding: 0 }}>
              <Badge kind={i.status === 'attention' ? 'warn' : i.status === 'idle' ? 'mute' : 'ok'}>
                {i.status}
              </Badge>
              <span className="sub">synced {fmtDateTime(i.lastSync)}</span>
            </div>
            <Btn kind="tiny" onClick={() => pulse(i.id)}>
              {actions[i.id] ?? 'Simulate'}
            </Btn>
          </Card>
        ))}
      </div>
    </div>
  )
}
