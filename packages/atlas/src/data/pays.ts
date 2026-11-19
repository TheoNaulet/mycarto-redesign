// Pays et sites (couche métier). Aucun pays n'est saisi au départ : la cartographie connaît 3 sites, tous en France.

export type Zone = 'Europe' | 'Afrique' | 'Amériques' | 'Asie' | 'Océanie'
export const zones: Zone[] = ['Europe', 'Afrique', 'Amériques', 'Asie', 'Océanie']

export interface PaysRef {
  code: string
  name: string
  zone: Zone
  /** Membre de l'Union européenne : un transfert de données vers ce pays reste dans l'UE. */
  ue: boolean
}

/** Pays proposés à la saisie. */
export const paysConnus: PaysRef[] = [
  { code: 'FR', name: 'France', zone: 'Europe', ue: true },
  { code: 'DE', name: 'Allemagne', zone: 'Europe', ue: true },
  { code: 'BE', name: 'Belgique', zone: 'Europe', ue: true },
  { code: 'ES', name: 'Espagne', zone: 'Europe', ue: true },
  { code: 'IT', name: 'Italie', zone: 'Europe', ue: true },
  { code: 'IE', name: 'Irlande', zone: 'Europe', ue: true },
  { code: 'LU', name: 'Luxembourg', zone: 'Europe', ue: true },
  { code: 'NL', name: 'Pays-Bas', zone: 'Europe', ue: true },
  { code: 'PT', name: 'Portugal', zone: 'Europe', ue: true },
  { code: 'CH', name: 'Suisse', zone: 'Europe', ue: false },
  { code: 'GB', name: 'Royaume-Uni', zone: 'Europe', ue: false },
  { code: 'MA', name: 'Maroc', zone: 'Afrique', ue: false },
  { code: 'SN', name: 'Sénégal', zone: 'Afrique', ue: false },
  { code: 'TN', name: 'Tunisie', zone: 'Afrique', ue: false },
  { code: 'CA', name: 'Canada', zone: 'Amériques', ue: false },
  { code: 'US', name: 'États-Unis', zone: 'Amériques', ue: false },
  { code: 'BR', name: 'Brésil', zone: 'Amériques', ue: false },
  { code: 'CN', name: 'Chine', zone: 'Asie', ue: false },
  { code: 'IN', name: 'Inde', zone: 'Asie', ue: false },
  { code: 'JP', name: 'Japon', zone: 'Asie', ue: false },
  { code: 'VN', name: 'Viêt Nam', zone: 'Asie', ue: false },
  { code: 'AU', name: 'Australie', zone: 'Océanie', ue: false },
  { code: 'NZ', name: 'Nouvelle-Zélande', zone: 'Océanie', ue: false },
]

/** Les sites déjà cartographiés (couche technique), à rattacher à leur pays. */
export const sitesCartographies: { pays: string; sites: string[] } = { pays: 'FR', sites: ['Lyon', 'Montpellier', 'Paris'] }
