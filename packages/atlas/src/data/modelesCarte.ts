// Modèles de carte : la structure réutilisable d'une carte (types d'objets montrés, disposition).
// Chaque carte de la cartographie part d'un modèle. « Applis et flux d'un domaine » s'ouvre dans l'éditeur.
import type { IconName } from '../icons/icons'
import type { Layer } from '../utils/types'

/** Disposition de la vignette. */
export type ModeleDisposition = 'domaine' | 'infra' | 'processus' | 'organigramme' | 'sites'

export interface ModeleCarte {
  id: string
  name: string
  description: string
  disposition: ModeleDisposition
  /** Types d'objets que le modèle montre. */
  types: { label: string; icon: IconName; layer: Layer }[]
  /** Cartes construites sur ce modèle. */
  cartes: number
  auteur: string
  /** Date ISO (AAAA-MM-JJ). */
  modifie: string
}

const T = {
  domaine: { label: 'Domaine', icon: 'folder', layer: 'metier' },
  application: { label: 'Application', icon: 'app', layer: 'applicatif' },
  flux: { label: 'Flux', icon: 'flow', layer: 'applicatif' },
  partenaire: { label: 'Partenaire', icon: 'building', layer: 'applicatif' },
  composant: { label: 'Composant', icon: 'chip', layer: 'technique' },
  machine: { label: 'Machine', icon: 'server', layer: 'technique' },
  logiciel: { label: 'Logiciel', icon: 'software', layer: 'technique' },
  processus: { label: 'Processus', icon: 'process', layer: 'metier' },
  acteur: { label: 'Acteur', icon: 'user', layer: 'metier' },
  site: { label: 'Site', icon: 'pin', layer: 'technique' },
} as const satisfies Record<string, ModeleCarte['types'][number]>

export const modelesCarte: ModeleCarte[] = [
  {
    id: 'applis-flux',
    name: 'Applis et flux d’un domaine',
    description: 'Les applications d’un domaine fonctionnel, leurs flux entre elles et avec les partenaires extérieurs.',
    disposition: 'domaine',
    types: [T.domaine, T.application, T.flux, T.partenaire],
    cartes: 7,
    auteur: 'Théo Naulet',
    modifie: '2026-11-12',
  },
  {
    id: 'infra-appli',
    name: 'Machines d’une application',
    description: 'Une application, ses composants et les machines et logiciels qui les font tourner.',
    disposition: 'infra',
    types: [T.application, T.composant, T.machine, T.logiciel],
    cartes: 14,
    auteur: 'William Vidal',
    modifie: '2026-11-18',
  },
  {
    id: 'macro-processus',
    name: 'Macro-processus',
    description: 'Les processus de l’établissement rangés en pilotage, réalisation et support.',
    disposition: 'processus',
    types: [T.processus],
    cartes: 1,
    auteur: 'Isabelle Roux',
    modifie: '2026-09-30',
  },
  {
    id: 'organigramme',
    name: 'Organigramme',
    description: 'Les services et les personnes, avec les applications dont ils sont référents.',
    disposition: 'organigramme',
    types: [T.acteur, T.application],
    cartes: 2,
    auteur: 'Laura Martin',
    modifie: '2026-10-14',
  },
  {
    id: 'sites',
    name: 'Sites et machines',
    description: 'Les salles et sites d’hébergement, et les machines qu’ils accueillent.',
    disposition: 'sites',
    types: [T.site, T.machine],
    cartes: 3,
    auteur: 'Samuel Faure',
    modifie: '2026-08-21',
  },
]
