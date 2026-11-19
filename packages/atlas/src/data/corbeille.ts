// Corbeille de démonstration : les objets supprimés ces 30 derniers jours, effacés 30 jours après leur suppression.
import type { IconName } from '../icons/icons'
import type { Layer } from '../utils/types'

/** Un type d'objet, avec le genre de son nom pour accorder « restaurée » / « restauré ». */
export interface TrashType {
  label: string
  icon: IconName
  layer: Layer
  feminine: boolean
}

export const trashTypes: Record<string, TrashType> = {
  application: { label: 'Application', icon: 'app', layer: 'applicatif', feminine: true },
  flux: { label: 'Flux', icon: 'flow', layer: 'applicatif', feminine: false },
  domaine: { label: 'Domaine', icon: 'folder', layer: 'metier', feminine: false },
  processus: { label: 'Processus', icon: 'process', layer: 'metier', feminine: false },
  machine: { label: 'Machine', icon: 'server', layer: 'technique', feminine: true },
  logiciel: { label: 'Logiciel', icon: 'software', layer: 'technique', feminine: false },
  composant: { label: 'Composant', icon: 'chip', layer: 'technique', feminine: false },
  contrat: { label: 'Contrat', icon: 'contract', layer: 'applicatif', feminine: false },
  fournisseur: { label: 'Fournisseur', icon: 'building', layer: 'applicatif', feminine: false },
  projet: { label: 'Projet', icon: 'project', layer: 'applicatif', feminine: false },
  acteur: { label: 'Acteur', icon: 'user', layer: 'metier', feminine: false },
  carte: { label: 'Carte', icon: 'map', layer: 'fonctionnel', feminine: true },
}
export type TrashTypeId = keyof typeof trashTypes

export interface TrashItem {
  id: number
  type: TrashTypeId
  name: string
  deletedBy: string
  /** Date de suppression, ISO (AAAA-MM-JJ). */
  deletedAt: string
}

/** « Aujourd'hui » de la démonstration : 19/11/2026. */
export const TRASH_TODAY = '2026-11-19'
/** Durée de conservation dans la corbeille, en jours. */
export const TRASH_DAYS = 30

const DAY = 86_400_000
const t0 = Date.parse(`${TRASH_TODAY}T00:00:00Z`)
const ago = (days: number) => new Date(t0 - days * DAY).toISOString().slice(0, 10)

const seeds: [TrashTypeId, string, string, number][] = [
  ['application', 'GEST-STAGES', 'Théo Naulet', 1],
  ['flux', 'Export des notes vers ENT', 'William Vochelet', 2],
  ['machine', 'eschyle', 'Samuel Fourreau', 3],
  ['contrat', 'CONT000019', 'Laura Martin', 4],
  ['carte', 'Brouillon Scolarité 2025', 'Théo Naulet', 5],
  ['application', 'ANNUAIRE V1', 'Gwenaël Le Bihan', 6],
  ['logiciel', 'Tomcat 6', 'Samuel Fourreau', 8],
  ['composant', 'apogee-batch-old', 'Samuel Fourreau', 9],
  ['flux', 'Synchro HARPEGE vers LDAP', 'William Vochelet', 11],
  ['domaine', 'Vie étudiante (ancien)', 'Laura Martin', 12],
  ['fournisseur', 'Sigma Informatique', 'Théo Naulet', 14],
  ['processus', 'Gérer les bourses (doublon)', 'Gwenaël Le Bihan', 16],
  ['machine', 'thales-test', 'Samuel Fourreau', 18],
  ['projet', 'Migration Oracle 2024', 'William Vochelet', 20],
  ['acteur', 'Service des examens', 'Laura Martin', 22],
  ['application', 'WEBPROF', 'Théo Naulet', 25],
  ['carte', 'Copie de Machines nécessaires à APOGEE', 'Gwenaël Le Bihan', 27],
  ['contrat', 'CONT000003', 'Laura Martin', 29],
]

export const trashItems: TrashItem[] = seeds.map(([type, name, deletedBy, days], i) => ({ id: i + 1, type, name, deletedBy, deletedAt: ago(days) }))

/** Jours restants avant l'effacement définitif. */
export function daysLeft(item: TrashItem): number {
  return Math.max(0, TRASH_DAYS - Math.round((t0 - Date.parse(`${item.deletedAt}T00:00:00Z`)) / DAY))
}

/** « 18/11/2026 ». */
export const frDate = (iso: string) => iso.split('-').reverse().join('/')
