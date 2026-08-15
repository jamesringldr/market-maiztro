import { useState } from 'react'
import { Btn, Card } from '../components/ui'
import { marketBrief } from '../lib/ai'
import { nowISO } from '../lib/ids'
import { addArtifact, useStore } from '../lib/store'

export function Market() {
  const { state, patch } = useStore()
  const existing = state.artifacts.find((a) => a.kind === 'market')
  const [text, setText] = useState(existing?.body ?? marketBrief())

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>Daily market brief</h2>
          <p className="lede">
            Saturday, 15 August 2026. Written for conversations, not for a Bloomberg window.
            Simulated desk copy — no market-data vendor on the wire.
          </p>
        </div>
        <Btn
          kind="primary"
          onClick={() => {
            const body = marketBrief()
            setText(body)
            patch((s) => addArtifact(s, { kind: 'market', title: 'Daily market brief', body, createdAt: nowISO() }))
          }}
        >
          Refresh brief
        </Btn>
      </div>
      <Card>
        <div className="prose-box prose">{text}</div>
      </Card>
    </div>
  )
}
