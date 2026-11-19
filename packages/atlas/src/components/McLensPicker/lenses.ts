import type { IconName } from '../../icons/icons'

/** Teinte de la vignette d'une lentille. */
export type McLensTone = 'neutral' | 'ok' | 'warn' | 'critical' | 'unknown' | 'dicp'

/** Une lecture de la carte proposée dans le sélecteur. */
export interface McLens {
  /** Identifiant stable : « obsolescence ». */
  id: string
  /** Nom court : « Obsolescence ». */
  label: string
  /** Critère, en une ligne : « Fin de support logiciels et infra ». */
  description: string
  /** Pictogramme de la vignette. */
  icon: IconName
  /** Teinte de la vignette. */
  tone: McLensTone
}

/** Identifiant de la lentille « Aucune ». */
export const NO_LENS = 'aucune'

/** Les lentilles de myCarto, « Aucune » en premier. */
export const MC_LENSES: McLens[] = [
  { id: NO_LENS, label: 'Aucune', description: 'Couleurs de couche seules', icon: 'layers', tone: 'neutral' },
  { id: 'obsolescence', label: 'Obsolescence', description: 'Fin de support logiciels et infra', icon: 'hourglass', tone: 'critical' },
  { id: 'contrats', label: 'Échéance des contrats', description: "Date d'expiration", icon: 'contract', tone: 'warn' },
  { id: 'dicp', label: 'Criticité DICP', description: 'Niveau le plus élevé', icon: 'shield', tone: 'dicp' },
  { id: 'statut', label: 'Statut', description: "Statut de l'application", icon: 'app', tone: 'unknown' },
  { id: 'qualite', label: 'Qualité des données', description: 'Champs obligatoires remplis', icon: 'check-circle', tone: 'ok' },
]
