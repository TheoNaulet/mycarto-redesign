import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

/** Une suggestion : un objet récemment consulté ou fréquent. */
export interface HomeSearchSuggestion {
  /** Nom de l'objet, casse saisie : « APOGEE », « sophocle ». */
  label: string
  /** Couche de son type : couleur de la pastille. */
  layer: Layer
  /** Pictogramme de son type. */
  icon: IconName
  /** Lien direct vers l'objet. Sans lien, la puce est un bouton (événement `pick`). */
  href?: string
}
