// Source unique des applications du SI de démonstration (université).
// - Les 65 applications de l'inventaire (celles de l'explorateur), avec leurs lignes de tableau (`appRows`).
// - Les applications que d'autres écrans montrent sans qu'elles soient dans l'inventaire (cartes, contrats, fournisseurs,
//   organigramme, processus, POS) : elles ont aussi leur fiche, avec seulement ce que ces écrans en disent.
// - Les contrats (écran Contrats) et les fournisseurs (écran Fournisseurs), lus pour relier chaque application.
// Ce qu'aucun écran ne dit reste vide (null) : la fiche l'affiche « Non renseigné ».
import type { Criticity, Status } from '../utils/types'

/* ======================================================================
 * Types
 * ==================================================================== */
export type Nature = 'Application' | 'Module applicatif'
export type Statut = 'Active' | 'Prévue'
export type Hebergement = 'On-premise' | 'SaaS'
export type Domaine = 'Scolarité' | 'Référentiel' | 'Ressources humaines' | 'Finances' | 'Recherche' | 'Patrimoine' | 'Documentation'
export interface Dicp {
  d: Criticity
  i: Criticity
  c: Criticity
  p: Criticity
}

export interface Obsolescence {
  status: Status
  label: string
}

/** Une ligne de l'explorateur : une application de l'inventaire, tous champs à plat. */
export interface AppRow {
  id: number
  name: string
  nature: Nature
  statut: Statut
  obsolescence: Obsolescence | null
  hebergement: Hebergement
  description: string
  domaine: Domaine
  editeur: string | null
  groupe: string
  miseEnService: string
  finDeService: string
  machine: string
  cout: string
  dicp: Dicp
  flux: number
  creee: string
  modifiee: string
}

/* ======================================================================
 * Inventaire : les 65 applications de l'explorateur
 * ==================================================================== */
const OK: Obsolescence = { status: 'ok', label: 'À jour' }
const NC: Obsolescence = { status: 'unknown', label: 'NC' }
const ob = (status: Status, label: string): Obsolescence => ({ status, label })

type Seed = [
  name: string,
  nature: Nature,
  statut: Statut,
  obsolescence: Obsolescence | null,
  hebergement: Hebergement,
  description: string,
  domaine: Domaine,
  editeur: string | null,
  flux: number,
]

const A: Nature = 'Application'
const M: Nature = 'Module applicatif'

const seeds: Seed[] = [
  ['ABRICOT', M, 'Active', null, 'On-premise', 'Application de gestion de la scolarité des écoles doctorales', 'Scolarité', 'Cocktail', 3],
  ['ABYLA', A, 'Active', ob('critical', 'Apache 2.5'), 'On-premise', 'Gestion technique et graphique', 'Référentiel', 'Abyla', 2],
  ['ACTIVE DIRECTORY', A, 'Active', OK, 'On-premise', 'Gestion des comptes et des droits', 'Référentiel', 'Microsoft', 7],
  ['AGRHUM', M, 'Prévue', NC, 'On-premise', 'Administration du référentiel RH', 'Référentiel', null, 14],
  ['ALERTES-DIPLOMES', A, 'Active', OK, 'On-premise', 'Envoi des alertes de diplômes', 'Scolarité', 'Développement interne', 1],
  ['AMANDE', M, 'Active', OK, 'SaaS', 'Validation budgétaire des achats et suivi des engagements', 'Finances', 'Cocktail', 4],
  ['APOGEE', A, 'Active', ob('critical', 'Tomcat 5'), 'On-premise', 'Gestion des étudiants et des enseignements', 'Scolarité', 'AMUE', 24],
  ['APOGEE WEB', M, 'Active', ob('critical', 'Tomcat 5'), 'On-premise', 'Réinscriptions en ligne', 'Scolarité', 'AMUE', 5],
  ['APOIP', A, 'Active', ob('critical', 'Apache 2.5'), 'On-premise', 'Gestion des inscriptions pédagogiques', 'Scolarité', 'AMUE', 3],
  ['ASTRE RH', A, 'Prévue', NC, 'SaaS', 'Gestion des ressources humaines', 'Référentiel', null, 9],
  ['BIBASSE', M, 'Active', ob('warn', 'Apache 2.6'), 'On-premise', 'Gestion du budget', 'Référentiel', 'Cocktail', 2],
  ['C2I', A, 'Prévue', OK, 'On-premise', 'Gestion du C2I', 'Scolarité', 'Développement interne', 1],
  ['CALCIUM', A, 'Active', OK, 'On-premise', 'Agenda partagé des personnels', 'Référentiel', 'Esup-Portail', 6],
  ['CARAMBOLE', M, 'Active', ob('warn', 'PHP 7.2'), 'On-premise', 'Passation et suivi des commandes', 'Finances', 'Cocktail', 2],
  ['CELCAT', A, 'Active', OK, 'SaaS', 'Emplois du temps des formations', 'Scolarité', 'Celcat', 4],
  ['CIELL2', A, 'Active', NC, 'On-premise', 'Comptabilité des laboratoires', 'Recherche', 'Ciel', 1],
  ['COCOLIGHT', M, 'Active', ob('critical', 'Java 6'), 'On-premise', 'Suivi des contrats de recherche', 'Recherche', 'Cocktail', 2],
  ['CT SYNCHRO', A, 'Active', OK, 'On-premise', 'Synchronisation des annuaires', 'Référentiel', 'Développement interne', 5],
  ['DIEGO', A, 'Active', OK, 'SaaS', 'Gestion des dossiers de candidature', 'Scolarité', 'Diego', 3],
  ['DVINT', M, 'Prévue', NC, 'On-premise', 'Diffusion des vidéos internes', 'Documentation', null, 0],
  ['EGIMMO', A, 'Active', ob('warn', 'Oracle 11g'), 'On-premise', 'Gestion du patrimoine immobilier', 'Patrimoine', 'Egim', 2],
  ['ECANDIDAT', A, 'Active', OK, 'On-premise', 'Candidatures en ligne aux formations', 'Scolarité', 'Esup-Portail', 4],
  ['ESUP-PORTAIL', A, 'Active', ob('warn', 'uPortal 4'), 'On-premise', 'Environnement numérique de travail', 'Référentiel', 'Esup-Portail', 7],
  ['EVENTO', A, 'Active', OK, 'SaaS', 'Sondages et planification de réunions', 'Référentiel', 'Renater', 1],
  ['FCPRO', M, 'Active', NC, 'On-premise', 'Formation continue et apprentissage', 'Scolarité', 'Développement interne', 2],
  ['GFC', A, 'Active', ob('critical', 'Oracle 10g'), 'On-premise', 'Gestion financière et comptable', 'Finances', 'AMUE', 6],
  ['GLPI', A, 'Active', OK, 'On-premise', 'Inventaire du parc et assistance', 'Patrimoine', 'Teclib', 3],
  ['GRR', A, 'Active', ob('warn', 'PHP 7.4'), 'On-premise', 'Réservation des salles et du matériel', 'Patrimoine', 'Développement interne', 1],
  ['HAL', A, 'Active', OK, 'SaaS', 'Archive ouverte des publications', 'Recherche', 'CCSD', 2],
  ['HARPEGE', A, 'Active', ob('critical', 'Oracle 10g'), 'On-premise', 'Gestion des personnels', 'Ressources humaines', 'AMUE', 8],
  ['KOHA', A, 'Active', OK, 'On-premise', 'Système intégré de gestion de bibliothèque', 'Documentation', 'BibLibre', 3],
  ['LIMESURVEY', A, 'Active', OK, 'On-premise', 'Enquêtes en ligne', 'Scolarité', 'LimeSurvey', 1],
  ['MANGUE', M, 'Active', ob('warn', 'Java 8'), 'On-premise', 'Gestion administrative des personnels', 'Ressources humaines', 'Cocktail', 8],
  ['MOODLE', A, 'Active', OK, 'On-premise', 'Plateforme pédagogique en ligne', 'Scolarité', 'Moodle', 5],
  ['NUXEO', A, 'Active', NC, 'On-premise', 'Gestion électronique des documents', 'Documentation', 'Nuxeo', 2],
  ['OpenLDAP', A, 'Active', OK, 'On-premise', 'Annuaire des personnes et des groupes', 'Référentiel', 'OpenLDAP', 12],
  ['OSE', A, 'Active', OK, 'On-premise', 'Organisation des services d’enseignement', 'Scolarité', 'Université de Caen', 3],
  ['PEGASE', A, 'Prévue', NC, 'SaaS', 'Nouvelle gestion de la scolarité', 'Scolarité', 'PC-Scol', 6],
  ['PROFILER', A, 'Active', ob('warn', 'Tomcat 7'), 'On-premise', 'Gestion des profils et des habilitations', 'Référentiel', 'Développement interne', 10],
  ['QUICKCONNECT', A, 'Active', OK, 'SaaS', 'Connecteur des inscriptions administratives', 'Scolarité', 'Quick', 9],
  ['RESEDA', M, 'Prévue', NC, 'On-premise', 'Référentiel des structures et des adresses', 'Référentiel', null, 4],
  ['SIFAC', A, 'Active', ob('warn', 'SAP ECC 6'), 'On-premise', 'Système d’information financier', 'Finances', 'AMUE', 7],
  ['SIHAM', A, 'Active', OK, 'On-premise', 'Ressources humaines et paie', 'Ressources humaines', 'AMUE', 6],
  ['SINAPS', A, 'Active', OK, 'On-premise', 'Bus de synchronisation des référentiels', 'Référentiel', 'AMUE', 8],
  ['SOGO', A, 'Active', NC, 'On-premise', 'Messagerie collaborative', 'Référentiel', 'Alinto', 2],
  ['SYMPA', A, 'Active', OK, 'On-premise', 'Listes de diffusion', 'Référentiel', 'Renater', 3],
  ['THEMIS', M, 'Active', ob('critical', 'PHP 5.6'), 'On-premise', 'Suivi des thèses', 'Recherche', 'Développement interne', 2],
  ['UNICAMPUS', A, 'Active', OK, 'SaaS', 'Application mobile des étudiants', 'Scolarité', 'Unicampus', 8],
  ['ZIMBRA', A, 'Active', ob('warn', 'Zimbra 8.6'), 'On-premise', 'Messagerie des étudiants', 'Référentiel', 'Synacor', 3],
  ['ADE CAMPUS', A, 'Active', OK, 'SaaS', 'Planification des salles et des cours', 'Scolarité', 'Adesoft', 4],
  ['CAS', A, 'Active', OK, 'On-premise', 'Authentification unique', 'Référentiel', 'Apereo', 11],
  ['SHIBBOLETH', A, 'Active', OK, 'On-premise', 'Fédération d’identités', 'Référentiel', 'Shibboleth', 4],
  ['COCKTAIL GRH', M, 'Active', NC, 'On-premise', 'Gestion des emplois et des postes', 'Ressources humaines', 'Cocktail', 3],
  ['SCOLARIX', M, 'Prévue', NC, 'On-premise', 'Tableaux de bord de la scolarité', 'Scolarité', null, 2],
  ['SUPANN-SYNC', M, 'Active', OK, 'On-premise', 'Alimentation de l’annuaire SUPANN', 'Référentiel', 'Développement interne', 6],
  ['ANNUAIRE WEB', M, 'Active', ob('warn', 'PHP 7.2'), 'On-premise', 'Annuaire des personnels en ligne', 'Référentiel', 'Développement interne', 2],
  ['ORI-OAI', A, 'Active', ob('critical', 'Java 6'), 'On-premise', 'Indexation des ressources pédagogiques', 'Documentation', 'Esup-Portail', 1],
  ['PSTAGE', A, 'Active', OK, 'On-premise', 'Offres et conventions de stage', 'Scolarité', 'Esup-Portail', 3],
  ['REFERENS', M, 'Active', OK, 'On-premise', 'Référentiel des emplois types', 'Ressources humaines', 'Ministère', 1],
  ['DOCTORAT', A, 'Prévue', NC, 'SaaS', 'Inscriptions en doctorat', 'Recherche', null, 2],
  ['PATRIMMO', M, 'Active', NC, 'On-premise', 'Inventaire des équipements', 'Patrimoine', 'Développement interne', 1],
  ['GESTCONV', M, 'Active', OK, 'On-premise', 'Gestion des conventions de partenariat', 'Recherche', 'Développement interne', 2],
  ['BCDI', A, 'Active', ob('warn', 'BCDI 3'), 'On-premise', 'Catalogue des centres de documentation', 'Documentation', 'Réseau Canopé', 1],
  ['WEBDAV', M, 'Active', OK, 'On-premise', 'Espaces de fichiers partagés', 'Référentiel', 'Développement interne', 2],
  ['ZABBIX', A, 'Active', OK, 'On-premise', 'Supervision des serveurs et des services', 'Patrimoine', 'Zabbix', 5],
]

const crit = (n: number): Criticity => (n % 5) as Criticity
export const groupes = ['Groupe complet', 'DSI', 'Scolarité centrale', 'Direction des ressources humaines', 'Agence comptable']
export const machines = ['sophocle', 'philosophe', 'euripide', 'platon', 'aristote', 'socrate']
/** sophocle n'héberge que APOGEE et APOGEE WEB (écran Impact) : les autres applications sont réparties sur les autres machines. */
const SOPHOCLE_APPS = ['APOGEE', 'APOGEE WEB']
const pad = (n: number) => String(n).padStart(2, '0')

export const appRows: AppRow[] = seeds.map((s, i) => {
  const [name, nature, statut, obsolescence, hebergement, description, domaine, editeur, flux] = s
  const year = 2008 + (i % 15)
  return {
    id: i + 1,
    name,
    nature,
    statut,
    obsolescence,
    hebergement,
    description,
    domaine,
    editeur,
    groupe: groupes[i % groupes.length],
    miseEnService: statut === 'Prévue' ? `${pad(1 + (i % 28))}/${pad(1 + (i % 12))}/2026` : `${pad(1 + ((i * 7) % 28))}/${pad(1 + ((i * 5) % 12))}/${year}`,
    finDeService: obsolescence?.status === 'critical' ? `31/12/${2026 + (i % 3)}` : '',
    machine: hebergement === 'SaaS' ? '' : SOPHOCLE_APPS.includes(name) ? 'sophocle' : machines[1 + (i % (machines.length - 1))],
    cout: hebergement === 'SaaS' ? `${(8 + (i % 9) * 3) * 1000}` : '',
    dicp: { d: crit(i + 2), i: crit(i * 3 + 1), c: crit(i * 2 + 3), p: i % 9 === 0 ? 3 : 0 },
    flux,
    creee: `${pad(1 + (i % 28))}/${pad(1 + ((i * 3) % 12))}/2024`,
    modifiee: `${pad(1 + ((i * 5) % 28))}/${pad(1 + ((i * 2) % 12))}/2025`,
  }
})

// APOGEE et ASTRE RH alignées sur les maquettes (la fiche d'APOGEE fait foi).
Object.assign(appRows.find((a) => a.name === 'APOGEE')!, {
  groupe: 'Groupe complet',
  miseEnService: '14/03/2021',
  finDeService: '',
  machine: 'sophocle',
  dicp: { d: 2, i: 4, c: 3, p: 4 },
})
Object.assign(appRows.find((a) => a.name === 'ASTRE RH')!, {
  description: 'Gestion des ressources humaines : carrière, paie, temps',
  groupe: 'Groupe complet',
  miseEnService: '02/11/2025',
  dicp: { d: 3, i: 0, c: 0, p: 0 },
  creee: '18/12/2024',
  modifiee: '19/12/2024',
})

export const editeurs = [
  'Abyla', 'Adesoft', 'Alinto', 'AMUE', 'Apereo', 'BibLibre', 'CCSD', 'Celcat', 'Ciel', 'Cocktail', 'Développement interne', 'Diego', 'Egim',
  'Esup-Portail', 'LimeSurvey', 'Microsoft', 'Ministère', 'Moodle', 'Nuxeo', 'OpenLDAP', 'PC-Scol', 'Quick', 'Renater', 'Réseau Canopé',
  'Shibboleth', 'Synacor', 'Teclib', 'Unicampus', 'Université de Caen', 'Zabbix',
]

/* ======================================================================
 * Contrats (écran Contrats)
 * ==================================================================== */
/** Niveau d'échéance, du plus urgent au plus sûr. */
export type ContractLevel = 'expire' | 'moins6' | 'de6a12' | 'plus1an' | 'inconnue'
export interface Contract {
  ref: string
  supplier: string
  level: ContractLevel
  /** Date de fin, jj/mm/aaaa. */
  end: string
  renewal: 'Tacite' | 'Expresse'
  covers: string[]
}
const ct = (n: number, supplier: string, level: ContractLevel, end: string, covers: string[] = [], renewal: Contract['renewal'] = 'Expresse'): Contract => ({
  ref: `CONT${String(n).padStart(6, '0')}`,
  supplier,
  level,
  end,
  renewal,
  covers,
})
export const contracts: Contract[] = [
  ct(6, 'Application gratuite Nationale', 'expire', '31/12/2023', ['PARCOURSUP']),
  ct(7, 'Application Locale', 'expire', '31/08/2024', ['ALERTES-DIPLOMES']),
  ct(8, 'Logiciel Libre', 'expire', '30/06/2024', ['OpenLDAP']),
  ct(9, 'Microsoft', 'expire', '30/09/2026', ['Office 365', 'Exchange'], 'Tacite'),
  ct(10, 'Trésorerie Générale', 'expire', '31/12/2025', ['HELIOS']),
  ct(11, 'Monecarte', 'expire', '31/03/2026', ['Carte multiservice']),
  ct(12, 'NANCY', 'expire', '30/06/2025', ['CALCIUM']),
  ct(14, 'CILEX', 'expire', '31/12/2024', ['CILEX Courrier']),
  ct(16, 'DYNIX', 'expire', '31/12/2022', ['HORIZON']),
  ct(18, 'ESUP Portal', 'expire', '31/08/2025', ['ESUP-PORTAIL']),
  ct(32, 'Rennes', 'expire', '31/10/2026', ['DIEGO']),
  ct(33, 'SIS', 'expire', '30/04/2026', ['SIS Accueil']),
  ct(34, 'ZIMBRA', 'expire', '30/09/2025', ['ZIMBRA'], 'Tacite'),
  ct(35, 'AMUE', 'expire', '31/08/2026', ['APOGEE', 'APOGEE WEB']),
  ct(62, 'LABEO', 'expire', '31/01/2026', ['LIMS Labeo']),
  ct(1, 'CELCAT France', 'de6a12', '30/06/2027', ['CELCAT']),
  ct(19, 'ESUP Portal', 'de6a12', '31/08/2027', ['ESUP-PORTAIL']),
  ct(20, 'IUT Lille', 'de6a12', '30/09/2027', ['PRESENCES']),
  ct(21, 'LABEO', 'de6a12', '31/07/2027', ['LIMS Labeo']),
  ct(24, 'Oracle', 'de6a12', '31/10/2027', ['APOGEE'], 'Tacite'),
  ct(27, 'QuestSoftware', 'de6a12', '31/05/2027', ['Toad']),
  ct(2, 'Century Tech', 'plus1an', '31/12/2028', ['Century']),
  ct(4, 'Symantec', 'plus1an', '30/06/2028', ['NETBACKUP'], 'Tacite'),
  ct(15, 'Dokeos', 'plus1an', '31/08/2029', ['APOGEE']),
  ct(79, 'AB+ SOFTWARE', 'plus1an', '31/03/2028', ['AB+ Planning']),
]

/* ======================================================================
 * Fournisseurs (écran Fournisseurs) : qui fournit quoi
 * ==================================================================== */
export type SupplierState = 'expire' | 'bientot' | 'ok' | 'sans'
export interface SupplierContract {
  ref: string
  fin: string
}
const cocktail = [
  'MANGUE', 'JEFYADMIN', 'CARAMBOLE', 'SANGRIA', 'ABRICOT', 'FEVE', 'MARACUJA', 'AMANDE', 'CORAIL', 'GRHUM', 'KIWI', 'PAPAYE', 'PECHE',
  'COCONUT', 'COROSSOL', 'GIROFLE', 'BIBASSE', 'KAKI', 'AGRHUM', 'SCOLARIX', 'GIBRALTAR', 'ZAP', 'SUPERPLAN', 'EDTSCOL', 'CONVENTIONS', 'SAUT',
]
/** Qui fournit quoi. Les contrats et l'état de chaque fournisseur se déduisent des contrats ci-dessus. */
const supplierApps: [name: string, apps: string[]][] = [
  ['Association Cocktail', cocktail],
  ['Application Locale', ['QUICKCONNECT', 'FOAD', 'ALERTES-DIPLOMES', 'TROMBINOSCOPE', 'NOTES', 'UNICAMPUS', 'C2I', 'Gestion des salles']],
  ['AMUE', ['APOGEE', 'APOGEE WEB']],
  ['Application gratuite Nationale', ['PARCOURSUP']],
  ['Microsoft', ['Office 365', 'Exchange']],
  ['Monecarte', ['Monecarte', 'Izly']],
  ['AB+ SOFTWARE', ['AB+ Planning']],
  ['CEGAPE', ['CEGAPE Paie']],
  ['CELCAT France', ['CELCAT Timetabler']],
  ['Century Tech', ['Century']],
  ['CILEX', ['CILEX Courrier']],
  ['Dokeos', ['Dokeos LMS']],
  ['DYNIX', ['Horizon']],
  ['EFFI', ['EFFI Workflow']],
  ['ESUP Portal', ['ESUP']],
  ['IUT Lille', ['Scodoc', 'PRESENCES']],
  ['LABEO', ['LIMS Labeo']],
  ['Logiciel Libre', ['Koha', 'OpenLDAP']],
  ['NANCY', ['Annuaire Nancy', 'CALCIUM']],
  ['Oracle', ['Oracle Database']],
  ['QuestSoftware', ['Toad']],
  ['Rennes', ['DIEGO']],
  ['SIS', ['SIS Accueil']],
  ['Symantec', ['Endpoint Protection', 'NETBACKUP']],
  ['Trésorerie Générale', ['HELIOS']],
  ['VIRAGE GROUP', ['Virage Agenda']],
  ['ZIMBRA', ['Zimbra']],
]
const LEVEL_STATE: Record<ContractLevel, SupplierState> = { expire: 'expire', moins6: 'bientot', de6a12: 'bientot', plus1an: 'ok', inconnue: 'ok' }
/** jj/mm/aaaa → aaaammjj, pour comparer deux dates. */
const sortableDate = (d: string) => d.split('/').reverse().join('')
export const supplierSeeds: [name: string, apps: string[], state: SupplierState, contracts: SupplierContract[]][] = supplierApps.map(([name, apps]) => {
  const own = contracts.filter((c) => c.supplier === name).sort((a, b) => sortableDate(a.end).localeCompare(sortableDate(b.end)))
  // L'état est celui du contrat qui court le plus loin : un contrat renouvelé n'est plus « expiré ».
  const state: SupplierState = own.length ? LEVEL_STATE[own[own.length - 1].level] : 'sans'
  return [name, apps, state, own.map((c) => ({ ref: c.ref, fin: c.end }))]
})

/* ======================================================================
 * Applications hors inventaire : ce qu'en disent les autres écrans
 * ==================================================================== */
interface Extra {
  name: string
  description?: string
  domaines?: string[]
  nature?: Nature
  statut?: Statut
  obsolescence?: Obsolescence
  editeur?: string
  dicp?: Partial<Dicp>
  aliases?: string[]
}
const cocktailOnly = (name: string): Extra => ({ name, editeur: 'Cocktail' })
const extras: Extra[] = [
  // Carte des flux, Impact, Historique, Éditeur
  { name: 'NOTES', description: 'Saisie des notes par les enseignants et publication des résultats', domaines: ['Scolarité'], nature: A, statut: 'Active', obsolescence: ob('critical', 'Tomcat 5'), dicp: { d: 2, i: 4 } },
  { name: 'TROMBINOSCOPE', description: 'Photos d’identité des étudiants et des personnels', domaines: ['Référentiel'], nature: A, statut: 'Active', obsolescence: ob('warn', 'PHP 7.4'), dicp: { d: 1, c: 3 } },
  { name: 'ENT', description: 'Environnement numérique de travail : publication des notes', domaines: ['Services numériques'], nature: A, dicp: { d: 3 } },
  { name: 'HORIZON', domaines: ['Vie étudiante'], dicp: { d: 2 } },
  { name: 'PIX', description: 'Certification des compétences numériques', domaines: ['Pédagogie'], dicp: { d: 1 } },
  { name: 'COMPILATIO', description: 'Détection du plagiat', domaines: ['Pédagogie'], dicp: { d: 2 } },
  { name: 'EXTRACTIONS DEVU', description: 'Génération de suivi', domaines: ['Pilotage'], dicp: { d: 1 } },
  { name: 'Talend ESB', description: 'Bus d’intégration' },
  // Processus (diagramme « Achat de fournitures »)
  { name: 'MARACUJA', description: 'Comptabilité générale : mandats, titres et paiements', domaines: ['Finances'], nature: A, statut: 'Active', editeur: 'Cocktail' },
  // Organigramme, Historique
  { ...cocktailOnly('SANGRIA'), description: 'Inscriptions sportives' },
  // Contrats, POS
  { name: 'HELIOS' },
  { name: 'PRESENCES' },
  { name: 'NETBACKUP' },
  { name: 'RGRHUM' },
  { name: 'Office 365' },
  { name: 'Exchange' },
  { name: 'Monecarte', description: 'Carte multiservice', aliases: ['Carte multiservice'] },
  // Fournisseurs
  { name: 'Izly' },
  { name: 'PARCOURSUP' },
  { name: 'FOAD' },
  { name: 'Gestion des salles' },
  { name: 'AB+ Planning' },
  { name: 'CEGAPE Paie' },
  { name: 'Century' },
  { name: 'CILEX Courrier' },
  { name: 'Dokeos LMS' },
  { name: 'EFFI Workflow' },
  { name: 'Scodoc' },
  { name: 'LIMS Labeo' },
  { name: 'Annuaire Nancy' },
  { name: 'Oracle Database' },
  { name: 'Toad' },
  { name: 'SIS Accueil' },
  { name: 'Endpoint Protection' },
  { name: 'Virage Agenda' },
  ...['JEFYADMIN', 'FEVE', 'CORAIL', 'GRHUM', 'KIWI', 'PAPAYE', 'PECHE', 'COCONUT', 'COROSSOL', 'GIROFLE', 'KAKI', 'GIBRALTAR', 'ZAP', 'SUPERPLAN', 'EDTSCOL', 'CONVENTIONS', 'SAUT'].map(cocktailOnly),
]

/** Autres noms sous lesquels un écran cite une application de l'inventaire. */
const INVENTORY_ALIASES: Record<string, string[]> = {
  'ESUP-PORTAIL': ['ESUP'],
  CELCAT: ['CELCAT Timetabler'],
}

/* ======================================================================
 * Ce que les cartes savent : flux, domaines, POS, impact
 * ==================================================================== */
export interface AppFlow {
  from: string
  to: string
  label: string
  /** Liaison et fréquence : « Web service · quotidienne ». */
  meta?: string
}
/** Flux connus (cartes Applications et flux, Impact, Historique). CNOUS est un partenaire, pas une application. */
export const flows: AppFlow[] = [
  { from: 'CNOUS', to: 'APOGEE', label: 'Export données boursiers', meta: 'Fichier plat · quotidienne' },
  { from: 'APOGEE', to: 'OpenLDAP', label: 'Flux d’authentification', meta: 'LDAP · temps réel' },
  { from: 'APOGEE', to: 'TROMBINOSCOPE', label: 'Maj des données étudiantes', meta: 'Synchrone · semestrielle' },
  { from: 'APOGEE', to: 'C2I', label: 'Inscriptions au C2I', meta: 'Fichier plat · annuelle' },
  { from: 'APOGEE', to: 'NOTES', label: 'Mise à disposition des résultats', meta: 'Web service · quotidienne' },
  { from: 'APOGEE', to: 'CALCIUM', label: 'Maj des données étudiantes', meta: 'Synchrone · semestrielle' },
  { from: 'APOGEE WEB', to: 'DIEGO', label: 'Web service · temps réel' },
  { from: 'APOGEE WEB', to: 'ALERTES-DIPLOMES', label: 'Information des diplômés' },
  { from: 'APOGEE WEB', to: 'EXTRACTIONS DEVU', label: 'Génération de suivi' },
  { from: 'UNICAMPUS', to: 'ALERTES-DIPLOMES', label: 'Fichier plat · hebdomadaire' },
  { from: 'NOTES', to: 'DIEGO', label: 'Web service · quotidienne' },
  { from: 'NOTES', to: 'ENT', label: 'Publication des notes' },
  { from: 'TROMBINOSCOPE', to: 'HORIZON', label: 'Photos des cartes' },
  { from: 'OpenLDAP', to: 'MOODLE', label: 'Comptes des cours' },
  { from: 'HORIZON', to: 'PIX', label: 'Certification' },
  { from: 'MOODLE', to: 'COMPILATIO', label: 'Détection du plagiat' },
]
export const partners = ['CNOUS']

/** Domaines où une carte range une application, en plus de son domaine d'inventaire. */
const MAP_DOMAINS: Record<string, string[]> = {
  APOGEE: ['Référentiel'],
  CALCIUM: ['Scolarité'],
  C2I: ['Pédagogie'],
  MOODLE: ['Pédagogie'],
}
/** Applications dessinées sur la carte « Applications et flux de Scolarité ». */
const ON_FLOW_MAP = ['APOGEE', 'APOGEE WEB', 'UNICAMPUS', 'NOTES', 'CALCIUM', 'DIEGO', 'ALERTES-DIPLOMES', 'OpenLDAP', 'TROMBINOSCOPE', 'C2I', 'SIHAM', 'HARPEGE', 'KOHA']
/** Applications hébergées sur sophocle, et celles que son arrêt touche par les flux (écran Impact). */
const IMPACT_HOSTED = ['APOGEE', 'APOGEE WEB']
const IMPACT_TOUCHED = ['CALCIUM', 'NOTES', 'TROMBINOSCOPE', 'OpenLDAP', 'ALERTES-DIPLOMES', 'EXTRACTIONS DEVU', 'ENT', 'HORIZON', 'MOODLE', 'PIX', 'COMPILATIO']
/** Place dans le plan d'occupation des sols (écran POS) : zone, quartier, îlot. */
const POS_PLACES: Record<string, string> = {
  ...Object.fromEntries(
    ['APOGEE', 'APOGEE WEB', 'UNICAMPUS', 'NOTES', 'CALCIUM', 'DIEGO', 'ALERTES-DIPLOMES', 'C2I', 'TROMBINOSCOPE', 'CELCAT'].map((n) => [n, 'Opération · Enseignement supérieur · Scolarité']),
  ),
  GLPI: 'Support · Gestion des SI · Connaissance du parc',
  RGRHUM: 'Support · Gestion des SI · Production',
  NETBACKUP: 'Support · Gestion des SI · Sécurité des SI',
  QUICKCONNECT: 'Support · Gestion des SI · Quartier GSI',
  PRESENCES: 'Support · Gestion des SI · Quartier GSI',
  'CT SYNCHRO': 'Support · Gestion des SI · Quartier GSI',
}

/* ======================================================================
 * L'application, telle que la fiche la lit
 * ==================================================================== */
export interface Host {
  name: string
  kind: 'Machine' | 'VM'
  status?: Status
  statusLabel?: string
}
export interface Referent {
  name: string
  role: 'Métier' | 'Technique' | 'Fonctionnel'
}
export interface AppAlert {
  status: 'critical' | 'warn' | 'unknown'
  title: string
  text: string
}
export interface AppEvent {
  who: string
  initials: string
  color: 1 | 2 | 3 | 4 | 5 | 6
  text: string
  when: string
}
export interface AppMap {
  kind: 'flux' | 'infra' | 'pos' | 'impact'
  title: string
  sub: string
  /** Adresse de l'écran dans l'application ; absente : carte non maquettée. */
  path?: string
}

export interface Application {
  id: number
  slug: string
  name: string
  /** Fait partie des 65 applications de l'inventaire (explorateur). */
  inventaire: boolean
  aliases: string[]
  nature: Nature | null
  statut: Statut | null
  obsolescence: Obsolescence | null
  hebergement: Hebergement | null
  description: string | null
  domaines: string[]
  editeur: string | null
  /** Fournisseur (écran Fournisseurs). */
  fournisseur: string | null
  groupe: string | null
  miseEnService: string | null
  finDeService: string | null
  documentation: string | null
  /** Nombre d'utilisateurs. */
  utilisateurs: number | null
  /** Qui l'utilise. */
  publics: string | null
  hosts: Host[]
  composants: number | null
  /** Coût annuel en euros (SaaS). */
  cout: string | null
  dicp: Dicp
  /** Nombre de flux (inventaire) ; au moins les flux connus. */
  flux: number
  fluxEntrants: number | null
  /** Flux connus, dans les deux sens. */
  flows: AppFlow[]
  parent: string | null
  modules: string[]
  contrats: Contract[]
  referents: Referent[]
  pos: string | null
  maps: AppMap[]
  creee: string | null
  modifiee: string | null
  /** Points d'attention écrits à la main (détail des logiciels obsolètes), à la place du point calculé. */
  obsolescenceAlerts?: AppAlert[]
  events: AppEvent[]
}

/** « APOGEE WEB » → « apogee-web ». */
export function slugOf(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const supplierOf = (name: string): string | null => {
  const s = slugOf(name)
  return supplierSeeds.find(([, apps]) => apps.some((a) => slugOf(a) === s))?.[0] ?? null
}
const contractsOf = (names: string[]): Contract[] => {
  const s = names.map(slugOf)
  return contracts.filter((c) => c.covers.some((a) => s.includes(slugOf(a))))
}
const flowsOf = (name: string) => flows.filter((f) => f.from === name || f.to === name)

function mapsOf(name: string, hosts: Host[], pos: string | null): AppMap[] {
  const out: AppMap[] = []
  const known = flowsOf(name).length
  if (ON_FLOW_MAP.includes(name))
    out.push({ kind: 'flux', title: name === 'APOGEE' ? 'Flux de APOGEE' : 'Applications et flux de Scolarité', sub: name === 'APOGEE' ? '12 flux · 11 applications' : known ? `${known} flux dessiné${known > 1 ? 's' : ''}` : 'Sans flux dessiné', path: '/carte' })
  if (name === 'APOGEE') out.push({ kind: 'infra', title: 'Machines nécessaires', sub: '9 composants · 4 machines', path: '/infrastructure' })
  if (pos) out.push({ kind: 'pos', title: 'Place dans le POS', sub: name === 'APOGEE' ? 'Quartier Opération' : pos.split(' · ').slice(1).join(' · '), path: '/pos' })
  if (IMPACT_HOSTED.includes(name) || hosts.some((h) => h.name === 'sophocle')) out.push({ kind: 'impact', title: 'Impact d’un arrêt', sub: 'Sur sophocle', path: '/impact' })
  else if (IMPACT_TOUCHED.includes(name)) out.push({ kind: 'impact', title: 'Impact d’un arrêt', sub: 'Touchée si sophocle s’arrête', path: '/impact' })
  return out
}

const EMPTY_DICP: Dicp = { d: 0, i: 0, c: 0, p: 0 }

function fromRow(r: AppRow): Application {
  const name = r.name
  const hosts: Host[] = r.machine ? [{ name: r.machine, kind: 'Machine', ...(r.machine === 'sophocle' ? { status: 'critical' as const, statusLabel: 'Tomcat 5' } : {}) }] : []
  const pos = POS_PLACES[name] ?? null
  const fl = flowsOf(name)
  return {
    id: r.id,
    slug: slugOf(name),
    name,
    inventaire: true,
    aliases: INVENTORY_ALIASES[name] ?? [],
    nature: r.nature,
    statut: r.statut,
    obsolescence: r.obsolescence,
    hebergement: r.hebergement,
    description: r.description,
    domaines: [r.domaine, ...(MAP_DOMAINS[name] ?? []).filter((d) => d !== r.domaine)],
    editeur: r.editeur,
    fournisseur: [name, ...(INVENTORY_ALIASES[name] ?? [])].map(supplierOf).find((x) => x !== null) ?? null,
    groupe: r.groupe,
    miseEnService: r.miseEnService || null,
    finDeService: r.finDeService || null,
    documentation: null,
    utilisateurs: null,
    publics: null,
    hosts,
    composants: null,
    cout: r.cout || null,
    dicp: { ...r.dicp },
    flux: Math.max(r.flux, fl.length),
    fluxEntrants: null,
    flows: fl,
    parent: null,
    modules: [],
    contrats: contractsOf([name, ...(INVENTORY_ALIASES[name] ?? [])]),
    referents: [],
    pos,
    maps: mapsOf(name, hosts, pos),
    creee: r.creee,
    modifiee: r.modifiee,
    events: [
      { who: 'Théo Naulet', initials: 'TN', color: 1, text: 'Description modifiée', when: `${r.modifiee} · Théo` },
      { who: 'Laura Martin', initials: 'LM', color: 3, text: `Statut passé à « ${r.statut} »`, when: `${r.creee} · Laura` },
      { who: 'Théo Naulet', initials: 'TN', color: 1, text: `${name} créée par import Excel`, when: `${r.creee} · Théo` },
    ],
  }
}

function fromExtra(x: Extra, id: number): Application {
  const pos = POS_PLACES[x.name] ?? null
  const fl = flowsOf(x.name)
  return {
    id,
    slug: slugOf(x.name),
    name: x.name,
    inventaire: false,
    aliases: x.aliases ?? [],
    nature: x.nature ?? null,
    statut: x.statut ?? null,
    obsolescence: x.obsolescence ?? null,
    hebergement: null,
    description: x.description ?? null,
    domaines: x.domaines ?? [],
    editeur: x.editeur ?? null,
    fournisseur: supplierOf(x.name),
    groupe: null,
    miseEnService: null,
    finDeService: null,
    documentation: null,
    utilisateurs: null,
    publics: null,
    hosts: [],
    composants: null,
    cout: null,
    dicp: { ...EMPTY_DICP, ...x.dicp },
    flux: fl.length,
    fluxEntrants: null,
    flows: fl,
    parent: null,
    modules: [],
    contrats: contractsOf([x.name, ...(x.aliases ?? [])]),
    referents: [],
    pos,
    maps: mapsOf(x.name, [], pos),
    creee: null,
    modifiee: null,
    events: [],
  }
}

/** Toutes les applications : les 65 de l'inventaire d'abord, puis celles que citent les autres écrans. */
export const applications: Application[] = [
  ...appRows.map(fromRow),
  ...extras.map((x, i) => fromExtra(x, appRows.length + i + 1)),
]

/* ---------- APOGEE : la fiche de référence des maquettes ---------- */
const apogee = applications.find((a) => a.slug === 'apogee')!
Object.assign(apogee, {
  utilisateurs: 32,
  publics: 'Scolarité centrale, composantes, enseignants',
  hosts: [
    { name: 'sophocle', kind: 'Machine', status: 'critical', statusLabel: 'Tomcat 5' },
    { name: 'pythagore', kind: 'VM', status: 'warn', statusLabel: '2027' },
    { name: 'franklin', kind: 'VM' },
    { name: 'cupidon', kind: 'VM' },
  ],
  composants: 9,
  flux: 12,
  fluxEntrants: 2,
  modules: ['APOGEE WEB'],
  referents: [
    { name: 'Antoine Ramo', role: 'Métier' },
    { name: 'Lionel Fabian', role: 'Technique' },
    { name: 'Pierre Gérard', role: 'Fonctionnel' },
  ],
  obsolescenceAlerts: [
    { status: 'critical', title: 'Tomcat 5 n’est plus supporté', text: 'Depuis le 30/09/2012, sur le composant Serveur Web Forms (sophocle).' },
    { status: 'warn', title: 'Apache 2.6 en fin de support', text: 'Depuis le 11/09/2024, sur WS_APOGEE et l’API Étudiant.' },
  ],
  events: [
    { who: 'William Vidal', initials: 'WV', color: 4, text: 'Post-it ajouté sur la carte des flux : « Migration de Tomcat 5 prévue ? »', when: '07/07/2026 · William' },
    { who: 'ABP', initials: 'AB', color: 1, text: 'Flux « Maj des données étudiantes » passé en synchrone', when: '07/07/2026 · ABP' },
    { who: 'Samuel Faure', initials: 'SF', color: 5, text: 'Disponibilité passée de Forte à Modérée', when: '12/05/2026 · Samuel' },
    { who: 'Théo Naulet', initials: 'TN', color: 1, text: 'APOGEE créée par import du référentiel', when: '14/03/2021 · Théo' },
  ],
} satisfies Partial<Application>)
apogee.maps = mapsOf('APOGEE', apogee.hosts, apogee.pos)
Object.assign(applications.find((a) => a.slug === 'apogee-web')!, { parent: 'APOGEE' })

/* ======================================================================
 * Accès
 * ==================================================================== */
const bySlug = new Map<string, Application>()
for (const a of applications) {
  bySlug.set(a.slug, a)
  for (const al of a.aliases) if (!bySlug.has(slugOf(al))) bySlug.set(slugOf(al), a)
}

/** L'application d'un identifiant d'adresse ou d'un nom (« apogee-web », « APOGEE WEB », « Koha »), ou rien. */
export function getApplication(slugOrName: string | null | undefined): Application | undefined {
  return slugOrName ? bySlug.get(slugOf(slugOrName)) : undefined
}

/** Vrai si une fiche existe pour ce nom. */
export const hasApplication = (name: string) => !!getApplication(name)

/** Champs obligatoires d'une fiche valide, et ceux qui manquent. */
export function missingFields(a: Application): string[] {
  const out: string[] = []
  if (!a.statut) out.push('statut')
  if (!a.nature) out.push('nature')
  if (!a.description) out.push('description')
  if (!a.domaines.length) out.push('domaine')
  if (!a.editeur && !a.fournisseur) out.push('éditeur')
  if (!a.hebergement) out.push('hébergement')
  if (!a.miseEnService) out.push('mise en service')
  // La preuve (P) est facultative : seules la disponibilité, l'intégrité et la confidentialité sont obligatoires.
  const d = (['d', 'i', 'c'] as const).filter((k) => !a.dicp[k])
  if (d.length) out.push(`sécurité DICP (${d.map((k) => k.toUpperCase()).join(', ')})`)
  return out
}

const LEVEL_TEXT: Record<ContractLevel, string> = {
  expire: 'expiré',
  moins6: 'expire dans moins de 6 mois',
  de6a12: 'expire dans 6 à 12 mois',
  plus1an: 'expire dans plus d’un an',
  inconnue: 'sans date de fin',
}

/** Points d'attention d'une fiche : obsolescence, contrats, champs manquants. */
export function attentionPoints(a: Application): AppAlert[] {
  const out: AppAlert[] = []
  const where = a.hosts.length ? ` (${a.hosts.map((h) => h.name).join(', ')})` : ''
  if (a.obsolescenceAlerts) out.push(...a.obsolescenceAlerts)
  else if (a.obsolescence?.status === 'critical')
    out.push({ status: 'critical', title: `${a.obsolescence.label} n’est plus supporté`, text: `Sur l’infrastructure de ${a.name}${where}. À migrer avant la fin de service.` })
  else if (a.obsolescence?.status === 'warn')
    out.push({ status: 'warn', title: `${a.obsolescence.label} en fin de support`, text: `Sur l’infrastructure de ${a.name}${where}. Planifiez la montée de version.` })
  for (const c of a.contrats) {
    if (c.level === 'expire') out.push({ status: 'critical', title: `Contrat ${c.ref} expiré`, text: `Depuis le ${c.end}, avec ${c.supplier}. Reconduction ${c.renewal.toLowerCase()}.` })
    else if (c.level === 'moins6' || c.level === 'de6a12') out.push({ status: 'warn', title: `Contrat ${c.ref} à renouveler`, text: `Il ${LEVEL_TEXT[c.level]} (${c.end}), avec ${c.supplier}.` })
  }
  if (a.obsolescence?.status === 'unknown' || (!a.obsolescence && a.hebergement === 'On-premise'))
    out.push({ status: 'unknown', title: 'Obsolescence non évaluée', text: 'Les versions des logiciels de ses composants ne sont pas renseignées.' })
  if (a.statut === 'Active' && !a.finDeService)
    out.push({ status: 'unknown', title: 'Fin de service non renseignée', text: 'Nécessaire pour le cycle de vie des applications.' })
  const missing = missingFields(a)
  if (missing.length)
    out.push({ status: 'unknown', title: `${missing.length} champ${missing.length > 1 ? 's' : ''} obligatoire${missing.length > 1 ? 's' : ''} à compléter`, text: `${missing.join(', ').replace(/^./, (s) => s.toUpperCase())}.` })
  return out
}

/* ======================================================================
 * Chiffres partagés par les écrans (accueil, explorateur, tableau de bord, cartes)
 * ==================================================================== */
/** Les 65 applications de l'inventaire. */
export const inventory = applications.filter((a) => a.inventaire)
/** Applications de l'inventaire à qui il manque un champ obligatoire. */
export const invalidApplications = inventory.filter((a) => missingFields(a).length > 0)
/** Vrai si l'application est connue et que sa fiche est complète. */
export const isValid = (name: string) => {
  const a = getApplication(name)
  return !!a && missingFields(a).length === 0
}
export const expiredContracts = contracts.filter((c) => c.level === 'expire')
/** Tous les domaines où une application est rangée (inventaire et cartes). */
export const domainNames = [...new Set(applications.flatMap((a) => a.domaines))]
/** Nombre d'applications rangées dans un domaine. */
export const domainCount = (domain: string) => applications.filter((a) => a.domaines.includes(domain)).length
const labelsOf = (status: Status) => [...new Set(applications.filter((a) => a.obsolescence?.status === status).map((a) => a.obsolescence!.label))]
/** Logiciels plus supportés (Tomcat 5, Java 6…) et en fin de support, d'après l'obsolescence des applications. */
export const obsoleteSoftware = labelsOf('critical')
export const endOfSupportSoftware = labelsOf('warn')
/** Contrats d'un fournisseur. */
export const contractsOfSupplier = (supplier: string) => contracts.filter((c) => c.supplier === supplier)

/** Ce que la cartographie compte sans le détailler dans ce module : couches métier et technique. */
export const catalogue = {
  /** Écran Processus : 5 macro-processus, 22 processus. */
  processus: 22,
  /** Écran Organigramme : 11 directions. */
  unites: 11,
  /** Écran POS : 5 zones. */
  zonesPos: 5,
  sites: 3,
  logiciels: 40,
  machines: 28,
  composants: 58,
  composantsSansLogiciel: 13,
  applicationsSansComposant: 7,
  machinesSansComposant: 4,
} as const
