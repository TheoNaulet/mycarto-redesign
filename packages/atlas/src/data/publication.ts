// Versions de la carte « Applications et flux de Scolarité » créées pendant la session :
// publiées depuis l'éditeur, ou restaurées depuis l'historique. L'éditeur repart de la dernière version publiée ;
// l'historique ajoute chaque version à sa frise.
import { reactive, ref } from 'vue'

/** Contenu publié depuis l'éditeur (objets, flux, post-its), tel que l'éditeur l'a enregistré. */
export interface PublishedMap {
  /** État complet de l'éditeur, sérialisable. */
  state: unknown
  /** Horodatage de la publication. */
  at: number
  nodes: number
  flows: number
  notes: number
}

/** Dernière version publiée depuis l'éditeur pendant la session, ou rien. */
export const publishedMapEdits = ref<PublishedMap | null>(null)

/** Un point ajouté à la frise de l'historique. */
export interface MapVersion {
  id: number
  kind: 'publication' | 'restauration'
  /** Libellé court sur la frise. */
  short: string
  /** Libellé long (titre de jour dans le panneau). */
  long: string
  /** Ce qui s'est passé. */
  text: string
  /** « Théo · 14:32 ». */
  who: string
  at: number
}

/** Versions de la session, dans l'ordre. */
export const mapVersions = reactive<MapVersion[]>([])

let seq = 0
const hhmm = (t: number) => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

/** Ajoute une version à la frise ; renvoie son identifiant. */
export function addMapVersion(kind: MapVersion['kind'], text: string, title?: string): number {
  const at = Date.now()
  const id = ++seq
  const short = kind === 'publication' ? `Publiée ${hhmm(at)}` : 'Restauration'
  const long = title ? `${title}, aujourd’hui à ${hhmm(at)}` : `Aujourd’hui à ${hhmm(at)}`
  mapVersions.push({ id, kind, short, long, text, who: `Théo · ${hhmm(at)}`, at })
  return id
}

/** Retire une version (annulation). */
export function removeMapVersion(id: number) {
  const i = mapVersions.findIndex((v) => v.id === id)
  if (i >= 0) mapVersions.splice(i, 1)
}

/** Publie l'état de l'éditeur : il devient la version publiée, et un point s'ajoute à l'historique. */
export function publishMap(state: unknown, counts: { nodes: number; flows: number; notes: number }): number {
  const at = Date.now()
  publishedMapEdits.value = { state: JSON.parse(JSON.stringify(state)), at, ...counts }
  const parts = [`${counts.nodes} objets`, `${counts.flows} flux`]
  if (counts.notes) parts.push(`${counts.notes} post-it${counts.notes > 1 ? 's' : ''}`)
  return addMapVersion('publication', `Version publiée depuis l’éditeur : ${parts.join(', ')}`)
}
