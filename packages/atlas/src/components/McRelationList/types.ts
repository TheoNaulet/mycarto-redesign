import type { IconName } from '../../icons/icons'
import type { LogoName } from '../../logos/logos'
import type { Layer, Status } from '../../utils/types'

/** Un objet lié, montré comme un mini-nœud. */
export interface RelationItem {
  /** Identifiant stable (sinon le nom sert de clé). */
  id?: string | number
  /** Nom de l'objet lié, casse saisie. */
  name: string
  /** Couche de son type : couleur de la tuile. */
  layer: Layer
  /** Pictogramme de son type. */
  icon: IconName
  /** Logo de marque à la place du pictogramme. */
  logo?: LogoName
  /** État éventuel, montré en puce à droite. */
  status?: Status | 'neutral'
  /** Libellé de la puce d'état : « Tomcat 5 », « Fin de support 2027 ». */
  statusLabel?: string
  /** Fait court en gris après le nom : « Production », « 3 flux ». */
  meta?: string
}

/** Un groupe de relations, lu depuis l'objet courant : « APOGEE · appartient à · Scolarité ». */
export interface RelationGroup {
  /** Verbe de la relation : « Appartient à », « Hébergée sur », « Échange avec ». */
  verb: string
  /** Objets liés. */
  items: RelationItem[]
  /** Libellé du bouton d'ajout : « Ajouter une machine ». Absent : pas d'ajout possible. */
  addLabel?: string
  /** Nombre maximal d'objets (cardinalité). Une fois atteint, le bouton d'ajout disparaît. */
  max?: number
  /** Phrase quand le groupe est vide : « Aucune machine liée ». */
  emptyLabel?: string
}
