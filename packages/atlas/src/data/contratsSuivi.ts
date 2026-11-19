// Suivi des contrats pendant la session : modifications et renouvellements faits sur l'écran Contrats.
// Les contrats restent ceux de src/data/applications.ts (mêmes objets) : la fiche d'une application voit la nouvelle échéance.
import { reactive } from 'vue'
import { contracts, type Contract, type ContractLevel } from './applications'

/** Les contrats, réactifs : un changement d'échéance recolore la carte. */
export const contratsSuivis = reactive(contracts) as Contract[]

/** Ce que l'écran Contrats ajoute à un contrat : montant, durée de reconduction, notes. */
export interface ContractExtra {
  /** Montant annuel en euros, saisi librement : « 12 400 ». */
  montant: string
  /** Durée d'une reconduction, en mois. */
  dureeMois: number
  notes: string
}
const extras = reactive<Record<string, ContractExtra>>({})
export function extraOf(ref: string): ContractExtra {
  if (!extras[ref]) extras[ref] = { montant: '', dureeMois: 36, notes: '' }
  return extras[ref]
}

/** « 31/08/2026 » → Date (midi, pour éviter les décalages d'heure). */
export function parseFr(d: string): Date {
  const [j, m, a] = d.split('/').map(Number)
  return new Date(a, (m || 1) - 1, j || 1, 12)
}
const pad = (n: number) => String(n).padStart(2, '0')
export const formatFr = (d: Date) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
/** « 31/08/2026 » ↔ « 2026-08-31 » (champ date). */
export const frToIso = (d: string) => d.split('/').reverse().join('-')
export const isoToFr = (d: string) => d.split('-').reverse().join('/')

/** Ajoute des mois à une date jj/mm/aaaa en gardant la fin de mois (31/08 + 12 mois → 31/08). */
export function addMonths(d: string, months: number): string {
  const x = parseFr(d)
  const day = x.getDate()
  const target = new Date(x.getFullYear(), x.getMonth() + months, 1, 12)
  const last = new Date(target.getFullYear(), target.getMonth() + 1, 0, 12).getDate()
  target.setDate(Math.min(day, last))
  return formatFr(target)
}

/** Échéance d'une date de fin, vue d'aujourd'hui. */
export function levelOf(end: string, today = new Date()): ContractLevel {
  if (!end) return 'inconnue'
  const e = parseFr(end)
  if (Number.isNaN(e.getTime())) return 'inconnue'
  const months = (e.getFullYear() - today.getFullYear()) * 12 + (e.getMonth() - today.getMonth()) + (e.getDate() - today.getDate()) / 31
  if (e.getTime() < today.getTime()) return 'expire'
  if (months < 6) return 'moins6'
  if (months < 12) return 'de6a12'
  return 'plus1an'
}

/** Nouvelle date de fin après renouvellement : la fin + la durée ; un contrat déjà échu repart d'aujourd'hui. */
export function renewedEnd(c: Contract, dureeMois: number, today = new Date()): string {
  const next = addMonths(c.end, dureeMois)
  return parseFr(next).getTime() > today.getTime() ? next : addMonths(formatFr(today), dureeMois)
}
