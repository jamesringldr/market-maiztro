import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Card, Field } from '../components/ui'
import { uid } from '../lib/ids'
import { upsertMember, useStore } from '../lib/store'
import type { Member, MemberKind } from '../types'

export function MemberNew() {
  const { patch } = useStore()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [title, setTitle] = useState('')
  const [kind, setKind] = useState<MemberKind>('advisor-client')
  const [city, setCity] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [aum, setAum] = useState('0')
  const [strategy, setStrategy] = useState('')

  function save() {
    if (!name.trim()) return
    const id = uid('m')
    const member: Member = {
      id,
      name: name.trim(),
      kind,
      company: company.trim() || name.trim(),
      title: title.trim() || 'Client',
      email: email.trim(),
      phone: phone.trim(),
      city: city.trim(),
      since: '2026-08-15',
      aum: Number(aum) || 0,
      riskProfile: 'Unscored · Nitrogen pending',
      strategy: strategy.trim() || 'Onboarding. Strategy not yet written.',
      missingInfo: ['Risk questionnaire', 'Government ID', 'Trusted contact'],
      interests: [],
      hobbies: [],
      favorites: { alcohol: '', restaurants: [], other: [] },
      dontTouch: [],
      family: [],
      accounts: [
        {
          id: uid('a'),
          code: `${name.slice(0, 4).toUpperCase()}-NEW-01`,
          name: `${name} — onboarding`,
          type: 'taxable',
          aum: Number(aum) || 0,
        },
      ],
      products: [],
      notes: '',
      memories: [],
      lastTouch: '2026-08-15',
      nextTouch: '2026-08-22',
    }
    patch((s) => upsertMember(s, member))
    nav(`/members/${id}`)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h2>New member</h2>
          <p className="lede">Registration is local to this demo. Nothing leaves the browser.</p>
        </div>
      </div>
      <Card>
        <div className="form-grid">
          <Field label="Name"><input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Entity"><input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
          <Field label="Title"><input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
          <Field label="Kind">
            <select value={kind} onChange={(e) => setKind(e.target.value as MemberKind)}>
              <option value="advisor-client">Advisor client</option>
              <option value="lp">LP</option>
              <option value="family-office">Family office</option>
              <option value="portfolio">Portfolio</option>
            </select>
          </Field>
          <Field label="City"><input value={city} onChange={(e) => setCity(e.target.value)} /></Field>
          <Field label="Email"><input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <Field label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
          <Field label="AUM (USD)"><input value={aum} onChange={(e) => setAum(e.target.value)} /></Field>
        </div>
        <Field label="Opening strategy">
          <textarea value={strategy} onChange={(e) => setStrategy(e.target.value)} />
        </Field>
        <Btn kind="primary" onClick={save}>Open the file</Btn>
      </Card>
    </div>
  )
}
