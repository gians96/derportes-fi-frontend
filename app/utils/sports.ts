import {
  Goal,
  Dribbble,
  Volleyball,
  Swords,
  Puzzle,
  Trophy,
  type Icon,
} from 'lucide-vue-next'

export interface SportMeta {
  /** Valor canónico usado como `name` de la disciplina. */
  label: string
  /** Componente de icono de lucide. */
  icon: Icon
  /** Clases de color para el icono. */
  color: string
  /** Clases de fondo (badge/avatar). */
  bg: string
}

/** Catálogo fijo de deportes disponibles para crear disciplinas. */
export const SPORTS: SportMeta[] = [
  {
    label: 'Futsal',
    icon: Goal,
    color: 'text-green-400',
    bg: 'bg-green-500/15',
  },
  {
    label: 'Básquet',
    icon: Dribbble,
    color: 'text-orange-400',
    bg: 'bg-orange-500/15',
  },
  {
    label: 'Vóley',
    icon: Volleyball,
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
  },
  {
    label: 'Ajedrez',
    icon: Swords,
    color: 'text-sky-400',
    bg: 'bg-sky-500/15',
  },
  {
    label: 'Gincana',
    icon: Puzzle,
    color: 'text-pink-400',
    bg: 'bg-pink-500/15',
  },
]

const FALLBACK: SportMeta = {
  label: '',
  icon: Trophy,
  color: 'text-oscuro-300',
  bg: 'bg-oscuro-700',
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/**
 * Resuelve el icono/color de un deporte a partir del nombre de la disciplina.
 * Hace coincidencia tolerante a tildes y mayúsculas; usa Trophy como respaldo.
 */
export function getSportMeta(name?: string | null): SportMeta {
  if (!name) return FALLBACK
  const n = normalize(name)
  const match = SPORTS.find((s) => {
    const sn = normalize(s.label)
    return n === sn || n.includes(sn) || sn.includes(n)
  })
  return match ?? { ...FALLBACK, label: name }
}
