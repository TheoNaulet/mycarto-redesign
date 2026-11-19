// Logiciels du SI de démonstration : les 40 de la vue « Obsolescence » de myCarto, rangés comme elle les range
// (non obsolète, obsolète, en voie d'obsolescence), avec leur date de fin de support.
// Les déploiements (où chaque logiciel tourne) se lisent dans infrastructure.ts : composants et systèmes des machines.
import type { Status } from '../utils/types'

/** Rang d'obsolescence d'un logiciel, tel que myCarto le range. */
export type Obsolescence = 'ok' | 'obsolete' | 'bientot'

export interface Logiciel {
  /** Identifiant d'adresse : « oracle-11r2 ». */
  id: string
  /** Nom saisi, casse comprise. */
  name: string
  /** Famille : « Serveur web », « Base de données »… */
  famille: string
  obsolescence: Obsolescence
  /** Fin du support standard, ISO (aaaa-mm-jj). Absente : non renseignée. */
  fin: string | null
  /** Fin du support étendu, ISO, quand l'éditeur en propose un (logiciel en voie d'obsolescence). */
  finEtendue?: string
  /** Éditeur ou communauté. */
  editeur: string | null
}

export const OBSOLESCENCE: Record<Obsolescence, { label: string; status: Status; rank: number }> = {
  obsolete: { label: 'Obsolète', status: 'critical', rank: 0 },
  bientot: { label: 'En voie d’obsolescence', status: 'warn', rank: 1 },
  ok: { label: 'Non obsolète', status: 'ok', rank: 2 },
}

/** « Oracle 11R2 » → « oracle-11r2 ». */
export const logicielId = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

type Seed = [name: string, famille: string, fin: string | null, editeur: string | null, finEtendue?: string]

// Dates : celles des éditeurs quand elles sont publiques ; celles déjà dites par les autres écrans (Tomcat 5, Apache 2.6,
// WebObjects 5.3, Ubuntu 22.04) ; sinon non renseignées, comme dans l'outil d'origine.
const NON_OBSOLETES: Seed[] = [
  ['Active Directory', 'Annuaire', '2031-10-14', 'Microsoft'],
  ['Celcat', 'Progiciel', null, 'Celcat'],
  ['Debian 12', 'Système d’exploitation', '2028-06-30', 'Debian'],
  ['Directory Server', 'Annuaire', '2029-05-31', 'Red Hat'],
  ['Dirsync', 'Synchronisation d’annuaires', null, 'Microsoft'],
  ['Esup Portal', 'Portail', null, 'Esup-Portail'],
  ['fichier plat', 'Format d’échange', null, null],
  ['Horizon', 'Progiciel', null, 'DYNIX'],
  ['IIS 10.0', 'Serveur web', '2031-10-14', 'Microsoft'],
  ['IIS 8.0', 'Serveur web', null, 'Microsoft'],
  ['Mysql 8.4', 'Base de données', '2032-04-30', 'Oracle'],
  ['Net HASP', 'Gestion de licences', null, 'Thales'],
  ['Oracle 11R2', 'Base de données', null, 'Oracle'],
  ['QuickConnect', 'Connecteur', null, 'Quick'],
  ['Red Hat Enterprise Linux 9', 'Système d’exploitation', '2032-05-31', 'Red Hat'],
  ['Saut', 'Progiciel', null, 'Cocktail'],
  ['Six', 'Progiciel', null, null],
  ['SQL SERVER 2019 EXPRESS', 'Base de données', '2030-01-08', 'Microsoft'],
  ['Sybase', 'Base de données', null, 'SAP'],
  ['Sysmarché', 'Progiciel', null, null],
  ['Tomcat 9', 'Serveur d’applications', null, 'Apache'],
  ['Ubuntu Server 22.04 LTS', 'Système d’exploitation', '2027-04-30', 'Canonical'],
  ['WebObjects 5.4', 'Serveur d’applications', null, 'Apple'],
  ['Windows Server 2019', 'Système d’exploitation', '2029-01-09', 'Microsoft'],
  ['Windows Server 2022', 'Système d’exploitation', '2031-10-14', 'Microsoft'],
  ['Winpaie', 'Progiciel', null, null],
]
const OBSOLETES: Seed[] = [
  ['Apache 2.5', 'Serveur web', '2023-06-30', 'Apache'],
  ['Debian 10', 'Système d’exploitation', '2024-06-30', 'Debian'],
  ['IIS 6.0', 'Serveur web', '2015-07-14', 'Microsoft'],
  ['Oracle 10G BIP', 'Éditique', '2013-07-31', 'Oracle'],
  ['Oracle 10G', 'Base de données', '2013-07-31', 'Oracle'],
  ['Red Hat Enterprise Linux 7', 'Système d’exploitation', '2024-06-30', 'Red Hat'],
  ['SQLserver 2008', 'Base de données', '2019-07-09', 'Microsoft'],
  ['Tomcat 5', 'Serveur d’applications', '2012-09-30', 'Apache'],
  ['Tomcat 6', 'Serveur d’applications', '2016-12-31', 'Apache'],
  ['Tomcat 7', 'Serveur d’applications', '2021-03-31', 'Apache'],
  ['Ubuntu 18.04 LTS', 'Système d’exploitation', '2023-05-31', 'Canonical'],
]
const EN_VOIE: Seed[] = [
  ['Apache 2.6', 'Serveur web', '2024-09-11', 'Apache', '2027-06-30'],
  ['PostgreSQL 14', 'Base de données', '2026-11-12', 'PostgreSQL', '2027-06-30'],
  ['WebObjects 5.3', 'Serveur d’applications', '2027-03-31', 'Apple'],
]

const make = (obsolescence: Obsolescence) => ([name, famille, fin, editeur, finEtendue]: Seed): Logiciel => ({
  id: logicielId(name),
  name,
  famille,
  obsolescence,
  fin,
  ...(finEtendue ? { finEtendue } : {}),
  editeur,
})

/** Les 40 logiciels référencés. */
export const logiciels: Logiciel[] = [...NON_OBSOLETES.map(make('ok')), ...OBSOLETES.map(make('obsolete')), ...EN_VOIE.map(make('bientot'))]

const byKey = new Map<string, Logiciel>()
for (const l of logiciels) byKey.set(l.id, l)
// Autres noms sous lesquels l'inventaire des applications cite un logiciel.
const ALIASES: Record<string, string> = { 'ubuntu-22-04': 'ubuntu-server-22-04-lts', 'red-hat-7': 'red-hat-enterprise-linux-7', 'red-hat-9': 'red-hat-enterprise-linux-9' }

/** Un logiciel par son nom ou son identifiant (« Tomcat 5 », « tomcat-5 »), ou rien. */
export function getLogiciel(nameOrId: string | null | undefined): Logiciel | undefined {
  if (!nameOrId) return undefined
  const k = logicielId(nameOrId)
  return byKey.get(k) ?? byKey.get(ALIASES[k] ?? '')
}

/** « 2012-09-30 » → « 30/09/2012 ». */
export const frDate = (iso: string | null | undefined) => (iso ? iso.split('-').reverse().join('/') : '')

/** Date qui fait foi pour l'alerte : le support étendu s'il existe, sinon le support standard. */
export const echeanceOf = (l: Logiciel) => l.finEtendue ?? l.fin
