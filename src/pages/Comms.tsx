import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, Btn, Card } from '../components/ui'
import { fmtDateTime } from '../lib/ids'
import { useStore } from '../lib/store'

export function Comms() {
  const { state, patch, personName } = useStore()
  const nav = useNavigate()
  const [channel, setChannel] = useState<'all' | 'email' | 'phone' | 'text'>('all')
  const rows = state.comms.filter((c) => channel === 'all' || c.channel === channel)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Comms</h2>
          <p className="lede">
            Activity presence only. You can see that Eleanor wrote, not what she wrote.
            The point is not to become Outlook.
          </p>
        </div>
        <Btn
          onClick={() =>
            patch((s) => {
              s.comms.forEach((c) => {
                c.seen = true
              })
            })
          }
        >
          Mark all seen
        </Btn>
      </div>

      <div className="filters">
        {(['all', 'email', 'phone', 'text'] as const).map((c) => (
          <button key={c} className={`chip ${channel === c ? 'on' : ''}`} onClick={() => setChannel(c)}>
            {c}
          </button>
        ))}
      </div>

      <Card>
        {rows.map((c) => {
          const href = c.subjectType === 'member' ? `/members/${c.subjectId}` : `/prospects/${c.subjectId}`
          return (
            <div key={c.id} className="row click" onClick={() => nav(href)}>
              <div>
                <div className="title">{c.summary}</div>
                <div className="sub">
                  {fmtDateTime(c.occurredAt)} · {personName(c.subjectType, c.subjectId)} · {c.direction === 'in' ? 'inbound' : 'you'}
                </div>
              </div>
              <div className="btn-row">
                {!c.seen && <Badge kind="warn">Unseen</Badge>}
                <Badge kind="mute">{c.channel}</Badge>
                <Btn
                  kind="tiny"
                  onClick={() =>
                    patch((s) => {
                      const row = s.comms.find((x) => x.id === c.id)
                      if (row) row.seen = true
                    })
                  }
                >
                  Seen
                </Btn>
              </div>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
