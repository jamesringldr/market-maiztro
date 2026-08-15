import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function Badge({
  kind = 'mute',
  children,
}: {
  kind?: 'brass' | 'ok' | 'warn' | 'danger' | 'info' | 'mute'
  children: ReactNode
}) {
  return <span className={`badge b-${kind}`}>{children}</span>
}

export function Btn({
  children,
  onClick,
  kind = 'default',
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  kind?: 'default' | 'primary' | 'good' | 'bad' | 'tiny' | 'primary tiny' | 'good tiny' | 'bad tiny'
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  return (
    <button type={type} className={`btn ${kind}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  )
}

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <div className="card-head">
          {title ? <h3>{title}</h3> : <span />}
          {action}
        </div>
      )}
      {children}
    </section>
  )
}

export function PersonLink({
  to,
  name,
  sub,
}: {
  to: string
  name: string
  sub?: string
}) {
  return (
    <Link to={to}>
      <div className="title">{name}</div>
      {sub ? <div className="sub">{sub}</div> : null}
    </Link>
  )
}

export function stageKind(stage: string): 'brass' | 'ok' | 'warn' | 'danger' | 'info' | 'mute' {
  if (stage === 'commit' || stage === 'done' || stage === 'approved' || stage === 'client') return 'ok'
  if (stage === 'proposal' || stage === 'meeting-set' || stage === 'due' || stage === 'attention' || stage === 'live') return 'warn'
  if (stage === 'rejected' || stage === 'cold') return 'danger'
  if (stage === 'discovery' || stage === 'active-dialogue') return 'info'
  if (stage === 'pending' || stage === 'draft') return 'brass'
  return 'mute'
}
