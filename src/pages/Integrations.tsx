import { Badge, Btn, Card } from '../components/ui'
import { addComms, useStore } from '../lib/store'
import { fmtDateTime, nowISO } from '../lib/ids'

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
    })
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
            {(i.id === 'i-outlook' || i.id === 'i-phone') && (
              <Btn kind="tiny" onClick={() => pulse(i.id)}>
                Simulate inbound
              </Btn>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
