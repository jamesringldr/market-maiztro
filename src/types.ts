export type Id = string
export type SubjectType = 'member' | 'prospect'

export type RelationshipStatus =
  | 'cold'
  | 'warm'
  | 'referral'
  | 'active-dialogue'
  | 'meeting-set'
  | 'client'

export type ProspectStage =
  | 'research'
  | 'outreach'
  | 'discovery'
  | 'proposal'
  | 'commit'
  | 'nurture'

export type MemberKind = 'lp' | 'family-office' | 'portfolio' | 'advisor-client'

export type Account = {
  id: Id
  code: string
  name: string
  type: 'taxable' | 'ira' | 'trust' | 'entity'
  aum: number
}

export type FamilyPerson = {
  id: Id
  name: string
  relation: string
  notes: string
}

export type MemoryItem = {
  id: Id
  kind: 'preference' | 'personal' | 'business' | 'phrase' | 'timing'
  text: string
  createdAt: string
}

export type Member = {
  id: Id
  name: string
  kind: MemberKind
  company: string
  title: string
  email: string
  phone: string
  city: string
  since: string
  aum: number
  riskProfile: string
  strategy: string
  missingInfo: string[]
  interests: string[]
  hobbies: string[]
  favorites: { alcohol: string; restaurants: string[]; other: string[] }
  dontTouch: string[]
  family: FamilyPerson[]
  accounts: Account[]
  products: string[]
  notes: string
  memories: MemoryItem[]
  lastTouch: string
  nextTouch: string
}

export type Prospect = {
  id: Id
  name: string
  company: string
  title: string
  website: string
  linkedin: string
  industry: string
  email: string
  phone: string
  city: string
  stage: ProspectStage
  relationshipStatus: RelationshipStatus
  objective: string
  products: string[]
  tone: string
  notes: string
  priorNotes: string
  lastTouch: string
  nextTouch: string
  owner: string
  source: string
}

export type TouchKind =
  | 'call'
  | 'email'
  | 'meeting'
  | 'market-update'
  | 'personal'
  | 'referral'

export type Touchpoint = {
  id: Id
  subjectId: Id
  subjectType: SubjectType
  kind: TouchKind
  title: string
  date: string
  status: 'planned' | 'due' | 'done' | 'skipped'
  notes: string
}

export type TranscriptLine = {
  id: Id
  atSec: number
  speaker: string
  text: string
}

export type MeetingAttendee = { type: SubjectType; id: Id }

export type Meeting = {
  id: Id
  title: string
  when: string
  durationMin: number
  location: string
  kind: 'internal' | 'external'
  objective: string
  attendeeIds: MeetingAttendee[]
  agenda: string[]
  status: 'upcoming' | 'live' | 'done'
  script: TranscriptLine[]
  heard: TranscriptLine[]
  revealed: number
  internalNotes: string
  externalNotes: string
}

export type CommsEvent = {
  id: Id
  channel: 'email' | 'phone' | 'text'
  direction: 'in' | 'out'
  subjectId: Id
  subjectType: SubjectType
  occurredAt: string
  summary: string
  seen: boolean
}

export type TradeFanout = {
  memberId: Id
  accountId: Id
  accountCode: string
}

export type Trade = {
  id: Id
  date: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  accountCode: string
  clientHint: string
  status: 'pending' | 'approved' | 'rejected'
  fanout: TradeFanout[]
  reason?: string
}

export type Integration = {
  id: Id
  name: string
  vendor: string
  category:
    | 'comms'
    | 'calendar'
    | 'market'
    | 'custodian'
    | 'risk'
    | 'approvals'
    | 'file'
    | 'social'
  status: 'simulated' | 'attention' | 'idle'
  lastSync: string
  detail: string
}

export type EmailDraft = {
  id: Id
  subjectId: Id
  subjectType: SubjectType
  toName: string
  subject: string
  body: string
  variant: string
  status: 'draft' | 'copied'
  createdAt: string
}

export type Artifact = {
  id: Id
  kind: 'brief' | 'script' | 'plan' | 'notes' | 'market'
  title: string
  subjectId?: Id
  body: string
  createdAt: string
}

export type EdgeApproval = {
  id: Id
  title: string
  source: string
  detail: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export type PostedTxn = {
  id: Id
  tradeId: Id
  memberId: Id
  accountId: Id
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  date: string
}

export type AppState = {
  members: Member[]
  prospects: Prospect[]
  touchpoints: Touchpoint[]
  meetings: Meeting[]
  comms: CommsEvent[]
  trades: Trade[]
  integrations: Integration[]
  drafts: EmailDraft[]
  artifacts: Artifact[]
  approvals: EdgeApproval[]
  posted: PostedTxn[]
  liveMeetingId: Id | null
}

export type PersonRef = {
  type: SubjectType
  id: Id
  name: string
  subtitle: string
}
