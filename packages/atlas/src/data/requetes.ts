// Modèles de requête de démonstration et leur évaluation sur les données : applications de l'inventaire,
// flux connus (plus trois flux sans sortie) et les 28 machines du parc (inventées, nombres alignés sur `catalogue`).
import { flows, hasApplication, inventory, missingFields } from './applications'
import { composants } from './infrastructure'

export type QueryType = 'application' | 'flux' | 'machine' | 'composant'
export type FieldKind = 'texte' | 'liste' | 'nombre' | 'booleen'
export type Operator = 'eq' | 'neq' | 'contains' | 'empty' | 'notEmpty' | 'lt' | 'gt' | 'true' | 'false'
export type Value = string | number | boolean | null

export interface QueryField {
  key: string
  label: string
  kind: FieldKind
  /** Valeurs proposées (liste). */
  options?: string[]
}

export interface QueryTypeInfo {
  id: QueryType
  label: string
  one: string
  many: string
  feminine: boolean
  fields: QueryField[]
  /** Colonnes du tableau de résultats (clés de champs). */
  columns: string[]
}

/** Une ligne de résultat : toutes les valeurs à plat, et où l'ouvrir. */
export interface QueryRow {
  id: string
  name: string
  open: { fiche: string } | { path: string }
  [key: string]: Value | QueryRow['open']
}

export interface Condition {
  id: number
  field: string
  op: Operator
  value: string
}
export interface QueryModel {
  id: string
  name: string
  type: QueryType
  match: 'all' | 'any'
  conditions: Condition[]
}

export const operatorLabels: Record<Operator, string> = {
  eq: 'est',
  neq: 'n’est pas',
  contains: 'contient',
  empty: 'est vide',
  notEmpty: 'n’est pas vide',
  lt: 'est inférieur à',
  gt: 'est supérieur à',
  true: 'est vrai',
  false: 'est faux',
}
export const operatorsByKind: Record<FieldKind, Operator[]> = {
  texte: ['eq', 'neq', 'contains', 'empty', 'notEmpty'],
  liste: ['eq', 'neq', 'empty', 'notEmpty'],
  nombre: ['eq', 'lt', 'gt', 'empty', 'notEmpty'],
  booleen: ['true', 'false'],
}
/** L'opérateur attend une valeur saisie. */
export const needsValue = (op: Operator) => !['empty', 'notEmpty', 'true', 'false'].includes(op)

/* ======================================================================
 * Applications
 * ==================================================================== */
/** Applications sans aucun composant technique (7, comme `catalogue.applicationsSansComposant`). */
const APPS_SANS_COMPOSANT = ['CIELL2', 'DVINT', 'FCPRO', 'NUXEO', 'RESEDA', 'SOGO', 'PATRIMMO']
const OBSOLESCENCE_LABEL = { ok: 'À jour', warn: 'Fin de support proche', critical: 'Obsolète', unknown: 'Non évaluée' } as const

const appRowsQ: QueryRow[] = inventory.map((a) => ({
  id: `a-${a.slug}`,
  name: a.name,
  open: { fiche: a.name },
  nom: a.name,
  statut: a.statut,
  nature: a.nature,
  hebergement: a.hebergement,
  domaine: a.domaines[0] ?? null,
  editeur: a.editeur ?? a.fournisseur,
  groupe: a.groupe,
  composants: APPS_SANS_COMPOSANT.includes(a.name) ? 0 : a.name === 'APOGEE' ? 9 : a.hebergement === 'SaaS' ? 1 : 1 + (a.id % 5),
  flux: a.flux,
  fluxSortants: flows.filter((f) => f.from === a.name).length,
  obsolescence: OBSOLESCENCE_LABEL[a.obsolescence?.status ?? 'unknown'],
  logiciel: a.obsolescence && a.obsolescence.status !== 'unknown' && a.obsolescence.status !== 'ok' ? a.obsolescence.label : null,
  valide: missingFields(a).length === 0,
}))
const uniq = (list: Value[]) => [...new Set(list.filter((v): v is string => typeof v === 'string' && !!v))].sort((x, y) => x.localeCompare(y, 'fr'))

/* ======================================================================
 * Flux : ceux des cartes, et trois flux dont la sortie n'est pas renseignée
 * ==================================================================== */
const FLUX_SANS_SORTIE = [
  { from: 'SIFAC', label: 'Export des écritures comptables', meta: 'Fichier plat · mensuelle' },
  { from: 'SIHAM', label: 'Export des éléments de paie', meta: 'Fichier plat · mensuelle' },
  { from: 'GLPI', label: 'Inventaire du parc', meta: 'Web service · quotidienne' },
]
const split = (s?: string) => {
  const [liaison, frequence] = (s ?? '').split(' · ')
  const cap = (x?: string) => (x ? x.charAt(0).toUpperCase() + x.slice(1) : null)
  return { liaison: cap(liaison), frequence: cap(frequence) }
}
const fluxRowsQ: QueryRow[] = [...flows.map((f) => ({ ...f, to: f.to as string | null })), ...FLUX_SANS_SORTIE.map((f) => ({ ...f, to: null }))].map((f, i) => {
  // Sans « meta », la liaison est écrite dans le libellé (« Web service · temps réel »).
  const lf = split(f.meta ?? (f.label.includes(' · ') ? f.label : undefined))
  const name = f.meta || !f.label.includes(' · ') ? f.label : `${f.from} vers ${f.to}`
  const app = hasApplication(f.from) ? f.from : f.to && hasApplication(f.to) ? f.to : null
  return {
    id: `f-${i + 1}`,
    name,
    open: app ? { fiche: app } : { path: '/carte' },
    nom: name,
    entree: f.from,
    sortie: f.to,
    liaison: lf.liaison,
    frequence: lf.frequence,
  }
})

/* ======================================================================
 * Machines : 28, dont 4 sans composant ; 58 composants en tout (`catalogue`)
 * ==================================================================== */
type MSeed = [name: string, os: string, env: string, site: string, virtuelle: boolean, composants: number]
const machineSeeds: MSeed[] = [
  ['sophocle', 'CentOS 6', 'Production', 'Campus Cité', false, 6],
  ['philosophe', 'Debian 12', 'Production', 'Campus Cité', true, 4],
  ['euripide', 'Debian 12', 'Production', 'Datacenter régional', true, 4],
  ['platon', 'Red Hat 8', 'Production', 'Datacenter régional', true, 3],
  ['aristote', 'Windows Server 2019', 'Production', 'Campus Cité', true, 3],
  ['socrate', 'Debian 11', 'Production', 'Campus Nord', true, 3],
  ['eschyle', 'Debian 12', 'Production', 'Datacenter régional', true, 2],
  ['homere', 'Ubuntu 22.04', 'Production', 'Datacenter régional', true, 2],
  ['pythagore', 'Red Hat 8', 'Production', 'Campus Cité', true, 2],
  ['thales', 'Windows Server 2012', 'Production', 'Campus Nord', false, 2],
  ['heraclite', 'Debian 11', 'Préproduction', 'Datacenter régional', true, 2],
  ['democrite', 'Debian 12', 'Préproduction', 'Datacenter régional', true, 2],
  ['epicure', 'Ubuntu 22.04', 'Recette', 'Campus Cité', true, 2],
  ['zenon', 'Debian 9', 'Production', 'Campus Nord', false, 2],
  ['diogene', 'Windows Server 2019', 'Production', 'Campus Cité', true, 2],
  ['parmenide', 'Red Hat 7', 'Production', 'Datacenter régional', true, 2],
  ['anaximandre', 'Debian 12', 'Recette', 'Datacenter régional', true, 2],
  ['empedocle', 'Debian 12', 'Développement', 'Campus Cité', true, 2],
  ['hippocrate', 'Ubuntu 20.04', 'Production', 'Campus Nord', true, 2],
  ['archimede', 'Windows Server 2016', 'Production', 'Datacenter régional', true, 2],
  ['euclide', 'Debian 11', 'Préproduction', 'Campus Cité', true, 2],
  ['ptolemee', 'Red Hat 8', 'Production', 'Datacenter régional', true, 2],
  ['herodote', 'Debian 12', 'Production', 'Campus Nord', true, 2],
  ['thucydide', 'CentOS 7', 'Recette', 'Campus Cité', true, 1],
  ['xenophon', 'Windows Server 2012', 'Recette', 'Campus Nord', false, 0],
  ['plotin', 'Debian 9', 'Développement', 'Campus Cité', true, 0],
  ['sappho', 'Ubuntu 18.04', 'Développement', 'Datacenter régional', true, 0],
  ['pindare', 'CentOS 6', 'Production', 'Campus Nord', false, 0],
]
const machineRowsQ: QueryRow[] = machineSeeds.map(([name, os, env, site, virtuelle, composants]) => ({
  id: `m-${name}`,
  name,
  open: { path: '/infrastructure' },
  nom: name,
  os,
  environnement: env,
  site,
  virtuelle,
  composants,
}))

/* ======================================================================
 * Composants : ceux de la couche technique (infrastructure.ts), avec leurs logiciels
 * ==================================================================== */
const composantRowsQ: QueryRow[] = composants.map((x, i) => ({
  id: `c-${i + 1}`,
  name: x.name,
  open: hasApplication(x.app) ? { fiche: x.app } : { path: '/machines' },
  nom: x.name,
  application: x.app,
  machine: x.machine,
  environnement: x.env === 'DEV' ? 'Développement' : 'Production',
  logiciels: x.logiciels.length,
  logicielsListe: x.logiciels.join(', ') || null,
}))

/* ======================================================================
 * Types interrogeables
 * ==================================================================== */
export const queryTypes: QueryTypeInfo[] = [
  {
    id: 'application', label: 'Applications', one: 'application', many: 'applications', feminine: true,
    fields: [
      { key: 'nom', label: 'Nom', kind: 'texte' },
      { key: 'statut', label: 'Statut', kind: 'liste', options: uniq(appRowsQ.map((r) => r.statut as Value)) },
      { key: 'nature', label: 'Nature', kind: 'liste', options: uniq(appRowsQ.map((r) => r.nature as Value)) },
      { key: 'hebergement', label: 'Hébergement', kind: 'liste', options: uniq(appRowsQ.map((r) => r.hebergement as Value)) },
      { key: 'domaine', label: 'Domaine', kind: 'liste', options: uniq(appRowsQ.map((r) => r.domaine as Value)) },
      { key: 'groupe', label: 'Groupe propriétaire', kind: 'liste', options: uniq(appRowsQ.map((r) => r.groupe as Value)) },
      { key: 'editeur', label: 'Éditeur', kind: 'texte' },
      { key: 'composants', label: 'Nombre de composants', kind: 'nombre' },
      { key: 'flux', label: 'Nombre de flux', kind: 'nombre' },
      { key: 'fluxSortants', label: 'Flux sortants connus', kind: 'nombre' },
      { key: 'obsolescence', label: 'Obsolescence', kind: 'liste', options: Object.values(OBSOLESCENCE_LABEL) },
      { key: 'logiciel', label: 'Logiciel à surveiller', kind: 'texte' },
      { key: 'valide', label: 'Fiche valide', kind: 'booleen' },
    ],
    columns: ['nom', 'statut', 'hebergement', 'domaine', 'composants', 'obsolescence'],
  },
  {
    id: 'flux', label: 'Flux', one: 'flux', many: 'flux', feminine: false,
    fields: [
      { key: 'nom', label: 'Nom', kind: 'texte' },
      { key: 'entree', label: 'Entrée (application de départ)', kind: 'texte' },
      { key: 'sortie', label: 'Sortie (application d’arrivée)', kind: 'texte' },
      { key: 'liaison', label: 'Type de liaison', kind: 'liste', options: uniq(fluxRowsQ.map((r) => r.liaison as Value)) },
      { key: 'frequence', label: 'Fréquence', kind: 'liste', options: uniq(fluxRowsQ.map((r) => r.frequence as Value)) },
    ],
    columns: ['nom', 'entree', 'sortie', 'liaison', 'frequence'],
  },
  {
    id: 'machine', label: 'Machines', one: 'machine', many: 'machines', feminine: true,
    fields: [
      { key: 'nom', label: 'Nom', kind: 'texte' },
      { key: 'os', label: 'Système d’exploitation', kind: 'texte' },
      { key: 'environnement', label: 'Environnement', kind: 'liste', options: ['Production', 'Préproduction', 'Recette', 'Développement'] },
      { key: 'site', label: 'Site', kind: 'liste', options: uniq(machineRowsQ.map((r) => r.site as Value)) },
      { key: 'virtuelle', label: 'Machine virtuelle', kind: 'booleen' },
      { key: 'composants', label: 'Nombre de composants', kind: 'nombre' },
    ],
    columns: ['nom', 'os', 'environnement', 'site', 'composants'],
  },
  {
    id: 'composant', label: 'Composants', one: 'composant', many: 'composants', feminine: false,
    fields: [
      { key: 'nom', label: 'Nom', kind: 'texte' },
      { key: 'application', label: 'Application', kind: 'texte' },
      { key: 'machine', label: 'Machine', kind: 'texte' },
      { key: 'environnement', label: 'Environnement', kind: 'liste', options: ['Production', 'Développement'] },
      { key: 'logiciels', label: 'Nombre de logiciels', kind: 'nombre' },
      { key: 'logicielsListe', label: 'Logiciels employés', kind: 'texte' },
    ],
    columns: ['nom', 'application', 'machine', 'environnement', 'logiciels'],
  },
]
export const queryType = (id: QueryType) => queryTypes.find((t) => t.id === id)!
export const datasets: Record<QueryType, QueryRow[]> = { application: appRowsQ, flux: fluxRowsQ, machine: machineRowsQ, composant: composantRowsQ }

/* ======================================================================
 * Évaluation
 * ==================================================================== */
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const isEmpty = (v: unknown) => v === null || v === undefined || v === ''
const num = (s: string) => Number(s.replace(',', '.').replace(/\s/g, ''))

/** Message d'erreur d'une condition, ou rien. */
export function conditionError(c: Condition, type: QueryType): string | undefined {
  const f = queryType(type).fields.find((x) => x.key === c.field)
  if (!f) return 'Choisissez un champ.'
  if (!needsValue(c.op)) return undefined
  if (!c.value.trim()) return f.kind === 'liste' ? 'Choisissez une valeur.' : 'Saisissez une valeur.'
  if (f.kind === 'nombre' && !Number.isFinite(num(c.value))) return 'Saisissez un nombre.'
  return undefined
}

function test(row: QueryRow, c: Condition, type: QueryType): boolean {
  const f = queryType(type).fields.find((x) => x.key === c.field)
  if (!f) return false
  const v = row[c.field] as Value
  switch (c.op) {
    case 'empty':
      return isEmpty(v)
    case 'notEmpty':
      return !isEmpty(v)
    case 'true':
      return v === true
    case 'false':
      return v === false
  }
  if (isEmpty(v)) return c.op === 'neq'
  if (f.kind === 'nombre') {
    const n = Number(v)
    const t = num(c.value)
    return c.op === 'eq' ? n === t : c.op === 'lt' ? n < t : c.op === 'gt' ? n > t : false
  }
  const a = norm(String(v))
  const b = norm(c.value)
  return c.op === 'eq' ? a === b : c.op === 'neq' ? a !== b : c.op === 'contains' ? a.includes(b) : false
}

/** Lignes qui répondent à la requête. */
export function runQuery(q: QueryModel): QueryRow[] {
  const rows = datasets[q.type]
  if (!q.conditions.length) return rows
  return rows.filter((r) => (q.match === 'all' ? q.conditions.every((c) => test(r, c, q.type)) : q.conditions.some((c) => test(r, c, q.type))))
}

/* ======================================================================
 * Modèles enregistrés
 * ==================================================================== */
let seq = 0
export const cond = (field: string, op: Operator, value = ''): Condition => ({ id: ++seq, field, op, value })

export const savedQueries: QueryModel[] = [
  { id: 'applications-sans-composant', name: 'Applications sans composant', type: 'application', match: 'all', conditions: [cond('composants', 'eq', '0')] },
  { id: 'flux-sans-sortie', name: 'Flux sans sortie', type: 'flux', match: 'all', conditions: [cond('sortie', 'empty')] },
  { id: 'machines-sans-composant', name: 'Machines sans composant', type: 'machine', match: 'all', conditions: [cond('composants', 'eq', '0')] },
  { id: 'applications-non-valides', name: 'Applications non valides', type: 'application', match: 'all', conditions: [cond('valide', 'false')] },
  { id: 'apps-saas-actives', name: 'Applications SaaS actives', type: 'application', match: 'all', conditions: [cond('hebergement', 'eq', 'SaaS'), cond('statut', 'eq', 'Active')] },
  { id: 'apps-infra-obsolete', name: 'Applications sur une infra obsolète', type: 'application', match: 'all', conditions: [cond('obsolescence', 'eq', 'Obsolète')] },
  { id: 'composants-sans-logiciel', name: 'Composants sans logiciel', type: 'composant', match: 'all', conditions: [cond('logiciels', 'eq', '0')] },
  { id: 'machines-anciens-systemes', name: 'Machines sous un ancien système', type: 'machine', match: 'any', conditions: [cond('os', 'contains', 'CentOS 6'), cond('os', 'contains', 'Debian 9'), cond('os', 'contains', '2012')] },
]
