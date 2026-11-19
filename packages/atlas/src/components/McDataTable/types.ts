/** Une colonne du tableau. */
export interface DataTableColumn<T> {
  /** Clé de la valeur dans la ligne ; nomme aussi le slot `cell-<key>`. */
  key: string
  /** En-tête de colonne. */
  label: string
  /** La colonne se trie au clic sur son en-tête. */
  sortable?: boolean
  /** Largeur CSS : « 160px », « 30% ». */
  width?: string
  /** Alignement : à droite pour les nombres. */
  align?: 'left' | 'center' | 'right'
  /** Texte long (description) : gris, tronqué, texte complet en infobulle. */
  muted?: boolean
  /** Mise en forme de la valeur, quand aucun slot `cell-<key>` n'est fourni. */
  format?: (value: unknown, row: T) => string
  /** Valeur utilisée pour trier, si elle diffère de la valeur affichée (date, ordre métier). */
  sortValue?: (row: T) => string | number | null | undefined
}

/** Tri courant. */
export interface DataTableSort {
  /** Clé de la colonne triée. */
  key: string
  /** asc : croissant (A → Z) ; desc : décroissant. */
  dir: 'asc' | 'desc'
}

/** Clé d'une ligne. */
export type RowKey = string | number
