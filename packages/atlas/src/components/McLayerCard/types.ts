import type { IconName } from '../../icons/icons'
import type { Layer, Status } from '../../utils/types'

/** Une tuile de type d'objet sur l'accueil. */
export interface ObjectTileItem {
  /** Nom du type : « Applications », « Pays ». */
  label: string
  /** Pictogramme du type. */
  icon: IconName
  /** Couche du type, si la tuile n'est pas dans une `McLayerCard` (qui la donne). */
  layer?: Layer
  /** Nombre de cartes de ce type : icône carte + nombre, en haut à gauche. */
  maps?: number
  /** Objets qui demandent une action : puce en haut à droite. `title` est lu et montré en infobulle. */
  alert?: { status: Status; label: string; title?: string }
  /** Aucun objet de ce type : tuile estompée et grise. */
  empty?: boolean
  /** Infobulle de la tuile vide : « Aucun pays saisi ». */
  emptyHint?: string
  /** Lien de la tuile. Sans lien, la tuile est un bouton (événement `open`). */
  href?: string
}
