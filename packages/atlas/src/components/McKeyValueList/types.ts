/** Une paire clé / valeur d'un objet. */
export interface KeyValueItem {
  /** Libellé de l'attribut, écrit en entier : « Coût total de possession ». */
  key: string
  /** Valeur affichée. Vide, nulle ou absente : « Non renseigné ». */
  value?: string | number | null
  /** Force l'affichage « Non renseigné » même si une valeur existe. */
  empty?: boolean
  /** Valeur technique (identifiant, version, adresse) en police à chasse fixe. */
  code?: boolean
  /** La valeur est un objet : lien qui ouvre son inspecteur. */
  href?: string
}
