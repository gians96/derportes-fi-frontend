// Tipos de dominio compartidos del frontend

export type Role = 'OWNER_SYSTEM' | 'ADMIN_SYSTEM' | 'STUDENT' | 'OTHER'

export type Gender = 'M' | 'F' | 'O'

export type DisciplineModality = 'TEAM' | 'INDIVIDUAL'

export type GenderPolicy = 'MALE' | 'FEMALE' | 'MIXED' | 'FREE'

export type CompetitionFormat = 'ELIMINATION' | 'POINTS'

export type ParticipantType = 'STUDENT' | 'OTHER'

export type RegistrationStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export type VoucherStatus = 'PENDING' | 'VALIDATED' | 'REJECTED'

export type MatchStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PLAYED'
  | 'CANCELLED'
  | 'POSTPONED'

export interface AuthUser {
  id: number
  email: string
  fullName: string
  role: Role
  isActive?: boolean
  studentCode?: string | null
  dni?: string | null
  facultyId?: number | null
  schoolId?: number | null
  avatarUrl?: string | null
}

export interface ProfessionalSchool {
  id: number
  name: string
  facultyId: number
}

export interface Faculty {
  id: number
  name: string
  acronym?: string | null
  schools?: ProfessionalSchool[]
}

export interface SportEvent {
  id: number
  name: string
  description?: string | null
  facultyId: number
  schoolId?: number | null
  startDate: string
  endDate: string
  isOpen: boolean
  disciplinesCount?: number
}

export interface Discipline {
  id: number
  eventId: number
  name: string
  modality: DisciplineModality
  genderPolicy: GenderPolicy
  format: CompetitionFormat
  participantType: ParticipantType
  minPlayers: number
  maxPlayers: number
  maxTeams: number
  isPaid: boolean
  cost: number
  rulesText?: string | null
  extraInfo?: string | null
  registrationDeadline: string
  teamsCount?: number
  event?: { id: number; name: string }
  teams?: DisciplineTeamSummary[]
}

export interface DisciplineTeamSummary {
  id: number
  name: string
  status: RegistrationStatus
  cycle?: string | null
  section?: string | null
  createdAt: string
}

export interface Participant {
  id?: number
  fullName: string
  studentCode?: string | null
  dni?: string | null
  gender: Gender
  isDelegate: boolean
  countsAsPlayer: boolean
  userId?: number | null
}

export interface TeamDisciplineEvent {
  id: number
  name: string
  faculty?: { id: number; name: string } | null
  school?: { id: number; name: string } | null
}

export interface TeamDiscipline {
  id: number
  name: string
  isPaid: boolean
  cost: number
  participantType?: ParticipantType
  minPlayers: number
  maxPlayers: number
  genderPolicy: GenderPolicy
  event: TeamDisciplineEvent
}

export interface Team {
  id: number
  name: string
  disciplineId: number
  disciplineName?: string
  discipline?: TeamDiscipline
  delegateId: number
  delegate?: Pick<AuthUser, 'id' | 'fullName' | 'email' | 'studentCode' | 'dni'>
  cycle?: string | null
  section?: string | null
  phone?: string | null
  status: RegistrationStatus
  rejectionReason?: string | null
  participants: Participant[]
  voucher?: Voucher | null
  createdAt: string
}

export interface Voucher {
  id: number
  teamId: number
  teamName?: string
  cycle?: string | null
  section?: string | null
  phone?: string | null
  operationNumber: string
  amount: number
  imageUrl: string
  status: VoucherStatus
  rejectionReason?: string | null
  uploadedAt: string
  disciplineName?: string
  participantType?: ParticipantType
  minPlayers?: number
  maxPlayers?: number
  genderPolicy?: GenderPolicy
  eventName?: string
  facultyName?: string
  schoolName?: string
  participantsCount?: number
  participants?: Participant[]
}

export interface StandingRow {
  position: number
  teamId: number
  teamName: string
  played: number
  won: number
  lost: number
  drawn: number
  points: number
}

export interface AcademicStudent {
  fullName: string
  studentCode: string | null
  dni: string | null
}
