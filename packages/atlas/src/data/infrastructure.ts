// Couche technique du SI de démonstration : sites, baies (racks), machines physiques et virtuelles, composants.
// - Les 3 sites et les 28 machines (le compte de `catalogue` dans applications.ts).
// - Paris reprend l'outil d'origine : Rack 1 avec sophocle, protagoras, ESX1 à ESX3 (cluster philosophe), einstein…
// - Les machines de l'écran Infrastructure (sophocle, franklin, pythagore, cupidon) gardent leurs systèmes et leurs composants.
// - Les machines citées par l'inventaire des applications (philosophe, euripide, platon, aristote, socrate) sont des VM du cluster.
// - Chaque composant dit sur quelle machine il tourne et quels logiciels il emploie : c'est là que se comptent les déploiements.
import { applications, flows, getApplication, type Application } from './applications'
import { echeanceOf, getLogiciel, OBSOLESCENCE, type Logiciel } from './logiciels'
import type { Status } from '../utils/types'

/* ======================================================================
 * Sites et baies
 * ==================================================================== */
export type SiteName = 'Paris' | 'Lyon' | 'Montpellier'
export interface Site {
  name: SiteName
  /** Ce qu'est le site, en une phrase. */
  description: string
  racks: string[]
}
export const sites: Site[] = [
  { name: 'Lyon', description: 'Salle serveurs du campus de la Doua.', racks: ['Rack 1'] },
  { name: 'Montpellier', description: 'Site de secours : sauvegardes et annuaire de repli.', racks: ['Rack 1'] },
  { name: 'Paris', description: 'Salle machine principale : production et cluster philosophe.', racks: ['Rack 1', 'Rack 2'] },
]

/* ======================================================================
 * Machines
 * ==================================================================== */
export type MachineKind = 'Machine' | 'VM'
export type MachineEtat = 'service' | 'maintenance' | 'arret'
export const ETAT_MACHINE: Record<MachineEtat, { label: string; status: Status | 'neutral' }> = {
  service: { label: 'En service', status: 'neutral' },
  maintenance: { label: 'En maintenance', status: 'warn' },
  arret: { label: 'Arrêtée', status: 'unknown' },
}

export interface Machine {
  name: string
  kind: MachineKind
  site: SiteName
  /** Baie d'une machine physique. */
  rack?: string
  /** Cluster dont la machine physique est un hôte : « philosophe ». */
  cluster?: string
  /** Ce qui fait tourner une VM : un cluster (« Cluster philosophe ») ou une machine physique (« apollon »). */
  hote?: string
  /** Système d'exploitation : un logiciel référencé, ou un système hors référentiel. */
  os: string
  /** Fin de support du système quand il n'est pas référencé dans les logiciels (ISO). */
  osFin?: string
  etat: MachineEtat
  description: string
}

const PHILO = 'Cluster philosophe'
const m = (name: string, kind: MachineKind, site: SiteName, os: string, description: string, extra: Partial<Machine> = {}): Machine => ({
  name,
  kind,
  site,
  os,
  etat: 'service',
  description,
  ...extra,
})

export const machines: Machine[] = [
  // Paris, Rack 1
  m('sophocle', 'Machine', 'Paris', 'Red Hat 5', 'Serveur des écrans Forms et des services web de APOGEE.', { rack: 'Rack 1', osFin: '2020-11-30' }),
  m('protagoras', 'Machine', 'Paris', 'Red Hat Enterprise Linux 7', 'Serveur du système de gestion de bibliothèque.', { rack: 'Rack 1' }),
  m('ESX1', 'Machine', 'Paris', 'VMware ESXi 8.0', 'Hôte du cluster philosophe.', { rack: 'Rack 1', cluster: 'philosophe', osFin: '2027-10-11' }),
  m('ESX2', 'Machine', 'Paris', 'VMware ESXi 8.0', 'Hôte du cluster philosophe.', { rack: 'Rack 1', cluster: 'philosophe', osFin: '2027-10-11' }),
  m('ESX3', 'Machine', 'Paris', 'VMware ESXi 8.0', 'Hôte du cluster philosophe.', { rack: 'Rack 1', cluster: 'philosophe', osFin: '2027-10-11' }),
  m('einstein', 'Machine', 'Paris', 'Windows Server 2022', 'Contrôleur de domaine principal.', { rack: 'Rack 1' }),
  m('confucius', 'Machine', 'Paris', 'Windows Server 2019', 'Serveur des emplois du temps.', { rack: 'Rack 1' }),
  m('bacchus', 'Machine', 'Paris', 'Windows Server 2019', 'Serveur de paie et de licences.', { rack: 'Rack 1' }),
  m('hera', 'Machine', 'Paris', 'Debian 10', 'Passerelles d’échange avec les partenaires.', { rack: 'Rack 1' }),
  // Paris, Rack 2
  m('newton', 'Machine', 'Paris', 'Red Hat Enterprise Linux 9', 'Frontal du système d’information financier.', { rack: 'Rack 2' }),
  m('curie', 'Machine', 'Paris', 'Ubuntu 18.04 LTS', 'Catalogue des centres de documentation.', { rack: 'Rack 2', etat: 'maintenance' }),
  // Paris, VM du cluster philosophe
  m('franklin', 'VM', 'Paris', 'Debian 12', 'Machine virtuelle du cluster philosophe.', { hote: PHILO }),
  m('pythagore', 'VM', 'Paris', 'Ubuntu Server 22.04 LTS', 'Machine virtuelle du cluster philosophe.', { hote: PHILO }),
  m('cupidon', 'VM', 'Paris', 'Debian 12', 'Machine virtuelle de développement.', { hote: PHILO }),
  m('philosophe', 'VM', 'Paris', 'Debian 12', 'Machine virtuelle mutualisée du cluster philosophe.', { hote: PHILO }),
  m('euripide', 'VM', 'Paris', 'Red Hat Enterprise Linux 9', 'Machine virtuelle des applications Cocktail.', { hote: PHILO }),
  m('platon', 'VM', 'Paris', 'Debian 10', 'Machine virtuelle des applications Cocktail.', { hote: PHILO }),
  m('aristote', 'VM', 'Paris', 'Ubuntu Server 22.04 LTS', 'Machine virtuelle mutualisée du cluster philosophe.', { hote: PHILO }),
  m('socrate', 'VM', 'Paris', 'Red Hat Enterprise Linux 7', 'Machine virtuelle mutualisée du cluster philosophe.', { hote: PHILO }),
  // Lyon
  m('zeus', 'Machine', 'Lyon', 'Windows Server 2022', 'Contrôleur de domaine du site de Lyon.', { rack: 'Rack 1' }),
  m('apollon', 'Machine', 'Lyon', 'Red Hat Enterprise Linux 9', 'Hyperviseur du site de Lyon.', { rack: 'Rack 1' }),
  m('athena', 'Machine', 'Lyon', 'Debian 12', 'Serveur des applications du patrimoine.', { rack: 'Rack 1' }),
  m('galilee', 'VM', 'Lyon', 'Ubuntu Server 22.04 LTS', 'Supervision des serveurs.', { hote: 'apollon' }),
  m('kepler', 'VM', 'Lyon', 'Debian 12', 'Formation continue.', { hote: 'apollon' }),
  // Montpellier
  m('hermes', 'Machine', 'Montpellier', 'Red Hat Enterprise Linux 9', 'Serveur de sauvegarde et hyperviseur du site de secours.', { rack: 'Rack 1' }),
  m('poseidon', 'Machine', 'Montpellier', 'Windows Server 2019', 'Contrôleur de domaine de repli.', { rack: 'Rack 1' }),
  m('demeter', 'VM', 'Montpellier', 'Debian 12', 'Supervision de secours.', { hote: 'hermes' }),
  m('artemis', 'VM', 'Montpellier', 'Ubuntu 18.04 LTS', 'Ancienne machine de recette, à supprimer.', { hote: 'hermes', etat: 'arret' }),
]

/* ======================================================================
 * Composants : une brique d'une application, sur une machine, avec ses logiciels
 * ==================================================================== */
export interface Composant {
  name: string
  app: string
  machine: string | null
  logiciels: string[]
  env: 'PROD' | 'DEV'
}
/** Machine par défaut d'un composant : la première qui héberge son application dans l'inventaire. */
const hostOf = (app: string, fallback: string) => getApplication(app)?.hosts[0]?.name ?? fallback
const c = (name: string, app: string, logiciels: string[], machine?: string, env: Composant['env'] = 'PROD'): Composant => ({
  name,
  app,
  machine: machine ?? hostOf(app, 'philosophe'),
  logiciels,
  env,
})

const COCKTAIL_WO = [
  'MANGUE', 'JEFYADMIN', 'CARAMBOLE', 'SANGRIA', 'ABRICOT', 'FEVE', 'MARACUJA', 'AMANDE', 'CORAIL', 'GRHUM', 'KIWI', 'PAPAYE',
  'PECHE', 'COCONUT', 'COROSSOL', 'GIROFLE', 'KAKI', 'GIBRALTAR', 'ZAP', 'SUPERPLAN', 'EDTSCOL', 'CONVENTIONS', 'COCKTAIL GRH',
]
/** Modules Cocktail sans base Oracle propre. */
const COCKTAIL_SANS_BASE = ['EDTSCOL', 'CONVENTIONS']

export const composants: Composant[] = [
  // APOGEE : l'écran Infrastructure fait foi.
  c('Oracle Forms', 'APOGEE', ['Oracle 11R2'], 'franklin'),
  c('Oracle Reports', 'APOGEE', ['Oracle 11R2'], 'franklin'),
  c('Serveur Web Forms', 'APOGEE', ['Tomcat 5'], 'sophocle'),
  c('Services Web Apogee', 'APOGEE', ['WebObjects 5.3'], 'franklin'),
  c('WS_APOGEE', 'APOGEE', ['Apache 2.6'], 'sophocle'),
  c('APOGEE_PROD', 'APOGEE', ['Oracle 11R2'], 'pythagore'),
  c('Serveur APP Apogee', 'APOGEE', [], 'pythagore'),
  c('API Étudiant APOGEE', 'APOGEE', ['Apache 2.6'], 'sophocle'),
  c('Batchs nocturnes', 'APOGEE', ['Oracle 11R2'], 'pythagore'),
  c('APOGEE_DEV', 'APOGEE', ['Oracle 11R2'], 'cupidon', 'DEV'),
  c('IA Web', 'APOGEE WEB', ['Apache 2.6'], 'sophocle'),
  // Applications Cocktail : WebObjects, et le plus souvent une base Oracle.
  ...COCKTAIL_WO.map((app, i) =>
    c(`WO_${app.replace(/ /g, '_')}`, app, COCKTAIL_SANS_BASE.includes(app) ? ['WebObjects 5.4'] : app === 'CARAMBOLE' ? ['WebObjects 5.4', 'Oracle 11R2', 'Apache 2.6'] : ['WebObjects 5.4', 'Oracle 11R2'], hostOf(app, i % 2 ? 'platon' : 'euripide')),
  ),
  c('GRHUM_PROD', 'GRHUM', ['Oracle 11R2'], 'euripide'),
  c('WO_BIBASSE', 'BIBASSE', ['WebObjects 5.3', 'Apache 2.6']),
  c('WO_COCOLIGHT', 'COCOLIGHT', ['WebObjects 5.3']),
  c('Passerelle Sysmarché', 'CARAMBOLE', ['Sysmarché']),
  c('Serveur SAUT', 'SAUT', ['Saut'], 'platon'),
  // Frontaux web
  c('Frontal ABYLA', 'ABYLA', ['Apache 2.5']),
  c('Frontal APOIP', 'APOIP', ['Apache 2.5']),
  c('Frontal ORI-OAI', 'ORI-OAI', ['Apache 2.5']),
  c('Frontal THEMIS', 'THEMIS', ['Apache 2.5']),
  c('Frontal GRR', 'GRR', ['Apache 2.5'], 'apollon'),
  c('Frontal ANNUAIRE WEB', 'ANNUAIRE WEB', ['Apache 2.5']),
  c('Frontal NUXEO', 'NUXEO', ['Apache 2.5']),
  c('Frontal SOGO', 'SOGO', ['Apache 2.5']),
  c('Frontal FCPRO', 'FCPRO', ['Apache 2.5'], 'kepler'),
  c('Frontal PATRIMMO', 'PATRIMMO', ['Apache 2.5'], 'athena'),
  c('Frontal ESUP', 'ESUP-PORTAIL', ['Apache 2.6', 'Esup Portal']),
  c('Frontal Zimbra', 'ZIMBRA', ['Apache 2.6']),
  c('Frontal TROMBINOSCOPE', 'TROMBINOSCOPE', ['Apache 2.6'], 'aristote'),
  c('Frontal SIFAC', 'SIFAC', ['Apache 2.6'], 'newton'),
  c('Frontal EGIMMO', 'EGIMMO', ['Apache 2.6'], 'athena'),
  // Serveurs d'applications et bases
  c('Serveur PROFILER', 'PROFILER', ['Tomcat 7']),
  c('GFC_PROD', 'GFC', ['Oracle 10G']),
  c('Éditions GFC', 'GFC', ['Oracle 10G BIP']),
  c('HARPEGE_PROD', 'HARPEGE', ['Oracle 10G']),
  c('Base CIEL', 'CIELL2', ['SQLserver 2008']),
  c('Serveur BCDI', 'BCDI', ['IIS 6.0'], 'curie'),
  c('Base GLPI', 'GLPI', ['Mysql 8.4']),
  c('Base MOODLE', 'MOODLE', ['Mysql 8.4']),
  c('Base LimeSurvey', 'LIMESURVEY', ['Mysql 8.4']),
  c('Base ECANDIDAT', 'ECANDIDAT', ['PostgreSQL 14']),
  c('Base PSTAGE', 'PSTAGE', ['PostgreSQL 14']),
  c('Base ZABBIX', 'ZABBIX', ['PostgreSQL 14'], 'galilee'),
  c('Supervision de secours', 'ZABBIX', ['PostgreSQL 14'], 'demeter'),
  c('Annuaire LDAP', 'OpenLDAP', ['Directory Server']),
  // Machines Windows et passerelles
  c('Contrôleur de domaine', 'ACTIVE DIRECTORY', ['Active Directory'], 'einstein'),
  c('Contrôleur de domaine de Lyon', 'ACTIVE DIRECTORY', ['Active Directory'], 'zeus'),
  c('Contrôleur de domaine de repli', 'ACTIVE DIRECTORY', ['Active Directory'], 'poseidon'),
  c('Synchronisation Office 365', 'CT SYNCHRO', ['Dirsync'], 'einstein'),
  c('Connecteur Celcat', 'CELCAT', ['Celcat', 'IIS 10.0'], 'confucius'),
  c('Base Celcat', 'CELCAT', ['SQL SERVER 2019 EXPRESS'], 'confucius'),
  c('Serveur de licences ABYLA', 'ABYLA', ['Net HASP', 'IIS 8.0'], 'bacchus'),
  c('Serveur de paie', 'CEGAPE Paie', ['Winpaie', 'SQL SERVER 2019 EXPRESS'], 'bacchus'),
  c('Passerelle QuickConnect', 'QUICKCONNECT', ['QuickConnect', 'fichier plat'], 'hera'),
  c('Passerelle Six', 'HELIOS', ['Six', 'fichier plat'], 'hera'),
  c('Serveur Horizon', 'HORIZON', ['Horizon', 'Sybase'], 'protagoras'),
  c('Serveur NETBACKUP', 'NETBACKUP', [], 'hermes'),
]

/* ======================================================================
 * Lectures
 * ==================================================================== */
const machineByName = new Map(machines.map((x) => [x.name.toLowerCase(), x]))
/** Une machine par son nom (casse indifférente), ou rien. */
export const getMachine = (name: string | null | undefined) => (name ? machineByName.get(name.toLowerCase()) : undefined)

export const machinesOfSite = (site: SiteName) => machines.filter((x) => x.site === site)
export const composantsOf = (machine: string) => composants.filter((x) => x.machine === machine)
/** VM que fait tourner une machine physique (ses VM propres, ou celles de son cluster). */
export const vmsOf = (x: Machine) => machines.filter((v) => v.kind === 'VM' && (v.hote === x.name || (x.cluster && v.hote === `Cluster ${x.cluster}`)))
export const vmsOfHote = (hote: string) => machines.filter((v) => v.hote === hote)
/** Hôtes d'un cluster. */
export const clusterHosts = (cluster: string) => machines.filter((x) => x.cluster === cluster)

/** Applications hébergées par une machine : celles de ses composants et celles que l'inventaire y place. */
export function appsOf(machine: string): Application[] {
  const names = new Set<string>()
  for (const x of composantsOf(machine)) names.add(x.app)
  for (const a of applications) if (a.hosts.some((h) => h.name === machine)) names.add(a.name)
  return [...names].map((n) => getApplication(n)).filter((a): a is Application => !!a)
}

/** Système d'une machine, avec sa fin de support : un logiciel référencé ou une date propre. */
export function osOf(x: Machine): { name: string; logiciel?: Logiciel; fin: string | null; status: Status } {
  const l = getLogiciel(x.os)
  const fin = l ? echeanceOf(l) : (x.osFin ?? null)
  // Une date connue fait foi (comme sur l'écran Infrastructure) ; sans date, le rang du logiciel.
  const status: Status = fin ? dateStatus(fin) : l ? OBSOLESCENCE[l.obsolescence].status : 'unknown'
  return { name: l?.name ?? x.os, logiciel: l, fin, status }
}

/** État d'une date de fin de support : dépassée, à moins de 12 mois, ou plus lointaine. */
export function dateStatus(iso: string): Status {
  const today = todayIso()
  if (iso < today) return 'critical'
  const d = new Date()
  const limit = `${d.getFullYear() + 1}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return iso < limit ? 'warn' : 'ok'
}

/** Date du jour, ISO. */
export function todayIso() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Un endroit où tourne un logiciel : un composant, ou le système d'une machine. */
export interface Deploiement {
  kind: 'composant' | 'systeme'
  /** Nom du composant (ou de la machine pour un système). */
  name: string
  app: string | null
  machine: string | null
}
export function deploiementsOf(logiciel: Logiciel): Deploiement[] {
  const out: Deploiement[] = []
  for (const x of composants) if (x.logiciels.some((n) => getLogiciel(n)?.id === logiciel.id)) out.push({ kind: 'composant', name: x.name, app: x.app, machine: x.machine })
  for (const x of machines) if (getLogiciel(x.os)?.id === logiciel.id) out.push({ kind: 'systeme', name: x.name, app: null, machine: x.name })
  return out
}

const STATUS_RANK: Record<Status, number> = { critical: 0, warn: 1, unknown: 2, ok: 3 }
export const worst = (list: Status[]): Status => list.reduce<Status>((w, s) => (STATUS_RANK[s] < STATUS_RANK[w] ? s : w), 'ok')

/** Obsolescence d'une machine : la pire de son système et des logiciels de ses composants, avec la raison. */
export function machineObsolescence(x: Machine): { status: Status; reason: string } {
  const os = osOf(x)
  const reasons: { status: Status; reason: string }[] = []
  if (os.status === 'critical') reasons.push({ status: 'critical', reason: `Système plus supporté : ${os.name}` })
  else if (os.status === 'warn') reasons.push({ status: 'warn', reason: `Système en fin de support : ${os.name}` })
  for (const comp of composantsOf(x.name))
    for (const n of comp.logiciels) {
      const l = getLogiciel(n)
      if (l?.obsolescence === 'obsolete') reasons.push({ status: 'critical', reason: `Plus supporté : ${l.name}` })
      else if (l?.obsolescence === 'bientot') reasons.push({ status: 'warn', reason: `En fin de support : ${l.name}` })
    }
  if (!reasons.length) return { status: os.status === 'unknown' ? 'unknown' : 'ok', reason: os.status === 'unknown' ? 'Fin de support du système non renseignée' : 'À jour' }
  reasons.sort((a, b) => STATUS_RANK[a.status] - STATUS_RANK[b.status])
  return reasons[0]
}

/** Ce que toucherait l'arrêt d'une machine : ses applications, celles des VM qu'elle fait tourner, et leurs voisines par les flux. */
export interface ImpactSummary {
  /** Applications qui s'arrêtent (hébergées, ou sur une VM arrêtée avec elle). */
  hosted: Application[]
  /** VM arrêtées avec la machine (hyperviseur seul ; un hôte de cluster laisse ses VM repartir ailleurs). */
  vms: Machine[]
  /** Autres hôtes du cluster qui reprennent les VM. */
  relais: Machine[]
  /** Applications touchées par les flux (premier niveau). */
  touched: string[]
}
export function impactOf(x: Machine): ImpactSummary {
  const relais = x.cluster ? clusterHosts(x.cluster).filter((h) => h.name !== x.name) : []
  const vms = x.cluster ? [] : vmsOf(x)
  const names = new Set<string>()
  for (const a of appsOf(x.name)) names.add(a.name)
  for (const v of vms) for (const a of appsOf(v.name)) names.add(a.name)
  const hosted = [...names].map((n) => getApplication(n)!).filter(Boolean)
  const touched = new Set<string>()
  for (const f of flows) {
    if (names.has(f.from) && !names.has(f.to)) touched.add(f.to)
    if (names.has(f.to) && !names.has(f.from) && getApplication(f.from)) touched.add(f.from)
  }
  return { hosted, vms, relais, touched: [...touched] }
}
