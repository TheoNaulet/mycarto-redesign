/** Les 4 couches du SI : elles donnent la couleur d'un type d'objet, jamais un état. */
export type Layer = 'metier' | 'fonctionnel' | 'applicatif' | 'technique'

/** Les niveaux d'état. Toujours affichés avec une icône et un mot. */
export type Status = 'ok' | 'warn' | 'critical' | 'unknown'

/** Icône associée à chaque état. */
export const statusIcon = {
  ok: 'check-circle',
  warn: 'alert-triangle',
  critical: 'alert-octagon',
  unknown: 'dashed-circle',
} as const

/** Niveau de criticité DICP : 1 faible à 4 très forte, 0 non renseigné. */
export type Criticity = 0 | 1 | 2 | 3 | 4
