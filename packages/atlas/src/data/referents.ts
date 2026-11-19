// Référents des applications : métier, fonctionnels et techniques.
// Les référents saisis sur une fiche (APOGEE) font foi ; les autres applications de l'inventaire reçoivent
// les référents de leur domaine. Les applications prévues n'ont pas encore de référent technique.
import { applications, type Referent } from './applications'

export type TypeReferent = 'metier' | 'fonctionnel' | 'technique'
export const TYPES_REFERENT: Record<TypeReferent, { role: Referent['role']; label: string; plural: string; layer: 'metier' | 'fonctionnel' | 'technique' }> = {
  metier: { role: 'Métier', label: 'Référent métier', plural: 'Référents métier', layer: 'metier' },
  fonctionnel: { role: 'Fonctionnel', label: 'Référent fonctionnel', plural: 'Référents fonctionnels', layer: 'fonctionnel' },
  technique: { role: 'Technique', label: 'Référent technique', plural: 'Référents techniques', layer: 'technique' },
}
const typeOfRole = (r: Referent['role']): TypeReferent => (r === 'Métier' ? 'metier' : r === 'Fonctionnel' ? 'fonctionnel' : 'technique')

export interface Personne {
  name: string
  fonction: string
  service: string
}

export const personnes: Personne[] = [
  { name: 'Antoine Ramo', fonction: 'Directeur de la scolarité', service: 'Scolarité centrale' },
  { name: 'Claire Morel', fonction: 'Directrice des ressources humaines adjointe', service: 'Direction des ressources humaines' },
  { name: 'Isabelle Roux', fonction: 'Agente comptable', service: 'Agence comptable' },
  { name: 'Thomas Girard', fonction: 'Directeur du service de la documentation', service: 'Service commun de la documentation' },
  { name: 'Émilie Fontaine', fonction: 'Directrice de la recherche', service: 'Direction de la recherche' },
  { name: 'Marc Lefèvre', fonction: 'Directeur du patrimoine', service: 'Direction du patrimoine' },
  { name: 'Valérie Chevalier', fonction: 'Directrice du numérique', service: 'DSI' },
  { name: 'Pierre Gérard', fonction: 'Chargé de mission scolarité', service: 'Scolarité centrale' },
  { name: 'Hélène Dupuis', fonction: 'Responsable des inscriptions', service: 'Scolarité centrale' },
  { name: 'Sophie Laurent', fonction: 'Responsable des applications de gestion', service: 'Agence comptable' },
  { name: 'Nadia Benali', fonction: 'Chargée des outils documentaires', service: 'Service commun de la documentation' },
  { name: 'Julie Marchand', fonction: 'Administratrice fonctionnelle des référentiels', service: 'DSI' },
  { name: 'Lionel Fabian', fonction: 'Ingénieur d’exploitation', service: 'DSI · Pôle applications' },
  { name: 'Julien Besson', fonction: 'Ingénieur systèmes', service: 'DSI · Pôle infrastructures' },
  { name: 'Karim Haddad', fonction: 'Responsable identités et accès', service: 'DSI · Pôle infrastructures' },
  { name: 'Romain Perrin', fonction: 'Administrateur systèmes', service: 'DSI · Pôle infrastructures' },
]

/** Adresse de messagerie : prenom.nom@exemple.fr, sans accents. */
export function emailOf(name: string): string {
  const plain = name.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
  return `${plain.replace(/\s+/g, '.').replace(/[^a-z.-]/g, '')}@exemple.fr`
}

/** Référents de chaque domaine : un ou deux noms par type, répartis à tour de rôle. */
const PAR_DOMAINE: Record<string, Record<TypeReferent, string[]>> = {
  Scolarité: { metier: ['Antoine Ramo'], fonctionnel: ['Pierre Gérard', 'Hélène Dupuis'], technique: ['Lionel Fabian'] },
  'Ressources humaines': { metier: ['Claire Morel'], fonctionnel: ['Sophie Laurent'], technique: ['Julien Besson'] },
  Finances: { metier: ['Isabelle Roux'], fonctionnel: ['Sophie Laurent'], technique: ['Julien Besson'] },
  Documentation: { metier: ['Thomas Girard'], fonctionnel: ['Nadia Benali'], technique: ['Romain Perrin'] },
  Recherche: { metier: ['Émilie Fontaine'], fonctionnel: ['Nadia Benali'], technique: ['Lionel Fabian'] },
  Patrimoine: { metier: ['Marc Lefèvre'], fonctionnel: ['Julie Marchand'], technique: ['Romain Perrin'] },
  Référentiel: { metier: ['Valérie Chevalier'], fonctionnel: ['Julie Marchand'], technique: ['Karim Haddad', 'Julien Besson'] },
}

export interface Affectation {
  personne: string
  application: string
  type: TypeReferent
}

function build(): Affectation[] {
  const out: Affectation[] = []
  const turn: Record<string, number> = {}
  for (const a of applications.filter((x) => x.inventaire)) {
    if (a.referents.length) {
      for (const r of a.referents) out.push({ personne: r.name, application: a.name, type: typeOfRole(r.role) })
      continue
    }
    const domaine = PAR_DOMAINE[a.domaines[0] ?? '']
    if (!domaine) continue
    for (const type of ['metier', 'fonctionnel', 'technique'] as TypeReferent[]) {
      if (type === 'technique' && a.statut === 'Prévue') continue
      const names = domaine[type]
      const k = `${a.domaines[0]}-${type}`
      const i = turn[k] ?? 0
      turn[k] = i + 1
      out.push({ personne: names[i % names.length], application: a.name, type })
    }
  }
  return out
}

export const affectations: Affectation[] = build()

/** Applications de l'inventaire sans référent d'un type. */
export function sansReferent(type: TypeReferent): string[] {
  const covered = new Set(affectations.filter((x) => x.type === type).map((x) => x.application))
  return applications.filter((a) => a.inventaire && !covered.has(a.name)).map((a) => a.name)
}
