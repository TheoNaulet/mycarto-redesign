import type { IconName } from '../../icons/icons'
import type { Layer, Status } from '../../utils/types'

/** Une case d'une strate : un type d'objet et ce qui l'attend. */
export interface LayerStackCell {
  /** Pictogramme du type. */
  icon: IconName
  /** Nom du type, au pluriel : « Applications », « Unités organisationnelles ». */
  label: string
  /** Nombre d'objets, affiché en grand. Absent : `description` prend sa place. */
  count?: number
  /** Texte court à la place du nombre : « Registre RGPD », « Par application ». */
  description?: string
  /** Nombre de cartes de ce type : « 3 cartes ». */
  maps?: number
  /** Objets qui demandent une action : puce d'état « 25 non valides ». */
  alert?: { status: Status; label: string }
  /** Aucun objet saisi : case estompée. */
  empty?: boolean
  /** Lien vers la liste ou la carte. Sans lien, la case est un bouton (événement `open`). */
  href?: string
}

/** Une strate : une couche du SI et ses cases. */
export interface LayerStackLayer {
  /** Numéro de la couche, 1 (métier) à 4 (technique). */
  n: number
  /** Couche : couleur de l'onglet, du liseré et des pictogrammes. */
  layer: Layer
  /** Nom écrit dans l'onglet : « Couche métier ». */
  name: string
  /** Cases, de gauche à droite. */
  cells: LayerStackCell[]
}
