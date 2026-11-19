// Dictionnaires (listes de valeurs) de l'administration : chaque attribut « liste » d'un type d'objet lit l'un d'eux.
// Les décomptes d'usage viennent des données de démonstration (applications, flux) quand elles le disent ; sinon ils restent absents.
import { appRows, flows, partners } from './applications'

/** Une valeur de dictionnaire ; les dictionnaires en arborescence ont des sous-valeurs. */
export interface DictValue {
  id: string
  label: string
  /** Nombre d'objets qui portent cette valeur (absent : non calculé). */
  usage?: number
  children?: DictValue[]
}

export interface Dictionary {
  id: string
  name: string
  /** Ce que la liste range, en une phrase. */
  description: string
  /** Attributs qui lisent ce dictionnaire : « Application · Statut ». */
  usedBy: string[]
  /** Valeurs rangées sous une racine, sur plusieurs niveaux. */
  tree: boolean
  /** Ce que comptent les usages : « application » / « applications ». */
  noun: { one: string; many: string; feminine: boolean }
  values: DictValue[]
}

let seq = 0
const v = (label: string, usage?: number, children?: DictValue[]): DictValue => ({ id: `v${++seq}`, label, usage, ...(children ? { children } : {}) })
const count = <T>(list: T[], test: (x: T) => boolean) => list.filter(test).length

/* ---------- Contribution Flux : Racine > applications qui émettent ou reçoivent des flux (modules sous leur application) ---------- */
const flowCount = (name: string) => count(flows, (f) => f.from === name || f.to === name)
const MODULES: Record<string, string[]> = { APOGEE: ['APOGEE WEB'] }
const moduleNames = Object.values(MODULES).flat()
const flowApps = [...new Set(flows.flatMap((f) => [f.from, f.to]))]
  .filter((n) => !partners.includes(n) && !moduleNames.includes(n))
  .sort((a, b) => a.localeCompare(b, 'fr', { sensitivity: 'base' }))
const contributionFlux = [
  v(
    'Racine',
    undefined,
    flowApps.map((name) => v(name, flowCount(name), MODULES[name]?.map((m) => v(m, flowCount(m))))),
  ),
]

/* ---------- Listes plates, comptées sur l'inventaire ---------- */
const statuts = [
  v('Active', count(appRows, (a) => a.statut === 'Active')),
  v('Prévue', count(appRows, (a) => a.statut === 'Prévue')),
  v('En retrait', 0),
  v('Arrêtée', 0),
]
const hebergements = [
  v('On-premise', count(appRows, (a) => a.hebergement === 'On-premise')),
  v('SaaS', count(appRows, (a) => a.hebergement === 'SaaS')),
  v('Cloud privé', 0),
  v('Hébergement mutualisé', 0),
]
const natures = [
  v('Application', count(appRows, (a) => a.nature === 'Application')),
  v('Module applicatif', count(appRows, (a) => a.nature === 'Module applicatif')),
]
/** Applications qui ont au moins une lettre DICP à ce niveau. */
const dicpCount = (n: number) => count(appRows, (a) => [a.dicp.d, a.dicp.i, a.dicp.c, a.dicp.p].some((x) => x === n))
const niveaux = [v('Faible', dicpCount(1)), v('Modérée', dicpCount(2)), v('Forte', dicpCount(3)), v('Très forte', dicpCount(4))]

/** Flux dont la description (« Web service · quotidienne ») contient ce mot. */
const metaCount = (word: string) => count(flows, (f) => `${f.meta ?? ''} ${f.label}`.toLowerCase().includes(word.toLowerCase()))
const frequences = ['Temps réel', 'Quotidienne', 'Hebdomadaire', 'Mensuelle', 'Semestrielle', 'Annuelle'].map((f) => v(f, metaCount(f)))
const liaisons = ['Web service', 'Fichier plat', 'LDAP', 'Synchrone', 'Base de données partagée'].map((l) => v(l, metaCount(l)))

/* ---------- Arborescences inventées ---------- */
const environnements = [
  v('Production', 22),
  v('Hors production', undefined, [v('Préproduction', 3), v('Recette', 2), v('Développement', 1)]),
]
const roles = [v('Métier', 18), v('Technique', 24), v('Fonctionnel', 9)]
const sites = [
  v('Campus centre', undefined, [v('Bâtiment A · salle serveurs', 14), v('Bâtiment C · baie réseau', 3)]),
  v('Campus nord', undefined, [v('Datacenter mutualisé', 9)]),
  v('Externe', undefined, [v('Renater', 2)]),
]

export const dictionaries: Dictionary[] = [
  {
    id: 'contribution-flux',
    name: 'Contribution Flux',
    description: 'Applications qui émettent ou reçoivent des flux, rangées sous la racine ; les modules sous leur application.',
    usedBy: ['Flux · Application source', 'Flux · Application cible'],
    tree: true,
    noun: { one: 'flux', many: 'flux', feminine: false },
    values: contributionFlux,
  },
  {
    id: 'statuts',
    name: 'Statuts d’application',
    description: 'Où en est l’application dans son cycle de vie.',
    usedBy: ['Application · Statut'],
    tree: false,
    noun: { one: 'application', many: 'applications', feminine: true },
    values: statuts,
  },
  {
    id: 'hebergements',
    name: 'Types d’hébergement',
    description: 'Où tourne l’application : chez nous ou chez l’éditeur.',
    usedBy: ['Application · Mode d’hébergement'],
    tree: false,
    noun: { one: 'application', many: 'applications', feminine: true },
    values: hebergements,
  },
  {
    id: 'natures',
    name: 'Natures',
    description: 'Application autonome, ou module rattaché à une application.',
    usedBy: ['Application · Nature'],
    tree: false,
    noun: { one: 'application', many: 'applications', feminine: true },
    values: natures,
  },
  {
    id: 'dicp',
    name: 'Niveaux DICP',
    description: 'Niveaux de disponibilité, d’intégrité, de confidentialité et de preuve, du plus faible au plus fort.',
    usedBy: ['Application · Disponibilité', 'Application · Intégrité', 'Application · Confidentialité', 'Application · Preuve'],
    tree: false,
    noun: { one: 'application', many: 'applications', feminine: true },
    values: niveaux,
  },
  {
    id: 'frequences',
    name: 'Fréquences de flux',
    description: 'À quel rythme les données passent d’une application à l’autre.',
    usedBy: ['Flux · Fréquence'],
    tree: false,
    noun: { one: 'flux', many: 'flux', feminine: false },
    values: frequences,
  },
  {
    id: 'liaisons',
    name: 'Modes de liaison',
    description: 'Comment les données passent : service web, fichier, annuaire…',
    usedBy: ['Flux · Mode de liaison'],
    tree: false,
    noun: { one: 'flux', many: 'flux', feminine: false },
    values: liaisons,
  },
  {
    id: 'environnements',
    name: 'Environnements',
    description: 'Environnement d’une machine ou d’un composant.',
    usedBy: ['Machine · Environnement', 'Composant · Environnement'],
    tree: true,
    noun: { one: 'machine', many: 'machines', feminine: true },
    values: environnements,
  },
  {
    id: 'roles',
    name: 'Rôles des référents',
    description: 'Le rôle d’une personne référente sur une application.',
    usedBy: ['Application · Référents'],
    tree: false,
    noun: { one: 'référent', many: 'référents', feminine: false },
    values: roles,
  },
  {
    id: 'sites',
    name: 'Sites et salles',
    description: 'Où se trouvent physiquement les machines.',
    usedBy: ['Machine · Localisation'],
    tree: true,
    noun: { one: 'machine', many: 'machines', feminine: true },
    values: sites,
  },
]

/** Nombre de valeurs d'un dictionnaire, sous-valeurs comprises. */
export function valueCount(values: DictValue[]): number {
  return values.reduce((n, x) => n + 1 + valueCount(x.children ?? []), 0)
}
