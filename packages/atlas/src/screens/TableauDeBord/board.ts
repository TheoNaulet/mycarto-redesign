// Widgets ajoutés au tableau de bord « Santé du SI » pendant la session (gardés d'une visite à l'autre),
// et les dates du cycle de vie des applications, lues dans l'inventaire.
import { ref } from 'vue'
import type { WidgetType } from '../shared/widgets'

export interface AddedWidget {
  id: number
  type: WidgetType
}
export const addedWidgets = ref<AddedWidget[]>([])
let seq = 0
export function addWidget(type: WidgetType): AddedWidget {
  const w = { id: ++seq, type }
  addedWidgets.value = [...addedWidgets.value, w]
  return w
}
export function removeWidget(id: number): () => void {
  const before = addedWidgets.value
  addedWidgets.value = before.filter((w) => w.id !== id)
  return () => (addedWidgets.value = before)
}

/** « Aujourd'hui » de la démonstration. */
export const TODAY = new Date(2026, 10, 19)
/** « 14/03/2021 » → date, ou rien. */
export function parseFr(s: string | null | undefined): Date | null {
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec((s ?? '').trim())
  return m ? new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1])) : null
}

/** Titre de chaque widget ajouté, fidèle à ce qu'il calcule. */
export const widgetTitles: Record<WidgetType, string> = {
  kpi: 'Applications de l’inventaire',
  jauge: 'Fiches valides',
  barres: 'Applications par domaine',
  anneau: 'Hébergement des applications',
  courbe: 'Mises en service par année',
  liste: 'Logiciels obsolètes ou en fin de support',
  echeances: 'Échéances des contrats',
  tableau: 'Requête : applications sans composant',
  carte: 'Applications et flux de Scolarité',
}
