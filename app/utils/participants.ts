import type { AuthUser, Participant, ParticipantType } from '~/types/domain'

export function participantTypeLabel(type?: ParticipantType | null) {
  return type === 'OTHER' ? 'Otros' : 'Solo estudiantes'
}

export function userParticipantType(user?: AuthUser | null): ParticipantType {
  if (!user) return 'OTHER'
  return user.studentCode || /^\d+@/.test(user.email) ? 'STUDENT' : 'OTHER'
}

export function userParticipantTypes(user?: AuthUser | null): ParticipantType[] {
  if (!user) return ['STUDENT', 'OTHER']
  if (user.role === 'OWNER_SYSTEM' || user.role === 'ADMIN_SYSTEM' || user.role === 'OTHER') {
    return ['STUDENT', 'OTHER']
  }
  return ['STUDENT']
}

export function canUseParticipantType(
  user: AuthUser | null | undefined,
  type?: ParticipantType | null,
) {
  if (!type) return false
  return userParticipantTypes(user).includes(type)
}

export function countedParticipants(
  _participantType: ParticipantType | undefined,
  participants: Pick<Participant, 'countsAsPlayer'>[] = [],
) {
  return participants.length
}
