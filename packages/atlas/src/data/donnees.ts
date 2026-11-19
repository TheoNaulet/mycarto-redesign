// Objets de données du SI de démonstration (couche fonctionnelle) : ce que les flux transportent et ce que les applications gèrent.
// Les flux cités sont ceux de src/data/applications.ts (carte des flux) : seuls ceux qui existent sont reliés.
import { flows, type AppFlow } from './applications'

/** sensible : donnée particulière au sens du RGPD (article 9) ; personnelle : donnée à caractère personnel ; interne : sans donnée personnelle. */
export type Sensibilite = 'sensible' | 'personnelle' | 'interne'

export const SENSIBILITES: Record<Sensibilite, { label: string; status: 'critical' | 'warn' | 'neutral'; help: string }> = {
  sensible: { label: 'Sensible', status: 'critical', help: 'Donnée particulière (santé, opinions, biométrie…) : traitement encadré, analyse d’impact obligatoire.' },
  personnelle: { label: 'Personnelle', status: 'warn', help: 'Permet d’identifier une personne : inscrite au registre des traitements.' },
  interne: { label: 'Non personnelle', status: 'neutral', help: 'Ne concerne aucune personne identifiable.' },
}

export interface ObjetDonnee {
  id: string
  name: string
  description: string
  sensibilite: Sensibilite
  /** Famille : Scolarité, Ressources humaines, Finances… */
  famille: string
  /** Application qui fait foi (source de vérité). */
  source: string | null
  /** Applications qui la stockent ou la consultent. */
  applications: string[]
  /** Flux qui la transportent : source → cible, tels que la carte des flux les connaît. */
  flux: { from: string; to: string }[]
}

export const objetsDonnees: ObjetDonnee[] = [
  {
    id: 'sante',
    name: 'Données de santé',
    description: 'Aménagements d’études pour raison médicale, visites du service de santé universitaire, arrêts maladie des personnels.',
    sensibilite: 'sensible',
    famille: 'Santé',
    source: 'SIS Accueil',
    applications: ['SIS Accueil', 'APOGEE', 'CALCIUM', 'SIHAM'],
    flux: [{ from: 'APOGEE', to: 'CALCIUM' }],
  },
  {
    id: 'etudiantes',
    name: 'Données étudiantes',
    description: 'Identité, coordonnées, inscriptions administratives et pédagogiques des étudiants.',
    sensibilite: 'personnelle',
    famille: 'Scolarité',
    source: 'APOGEE',
    applications: ['APOGEE', 'APOGEE WEB', 'PEGASE', 'TROMBINOSCOPE', 'CALCIUM', 'MOODLE', 'UNICAMPUS'],
    flux: [
      { from: 'APOGEE', to: 'TROMBINOSCOPE' },
      { from: 'APOGEE', to: 'CALCIUM' },
      { from: 'APOGEE', to: 'C2I' },
    ],
  },
  {
    id: 'notes',
    name: 'Notes',
    description: 'Notes d’examens et de contrôle continu, résultats semestriels et annuels.',
    sensibilite: 'personnelle',
    famille: 'Scolarité',
    source: 'NOTES',
    applications: ['NOTES', 'APOGEE', 'ENT', 'DIEGO', 'MOODLE'],
    flux: [
      { from: 'APOGEE', to: 'NOTES' },
      { from: 'NOTES', to: 'DIEGO' },
      { from: 'NOTES', to: 'ENT' },
    ],
  },
  {
    id: 'diplomes',
    name: 'Diplômes',
    description: 'Diplômes délivrés, attestations de réussite et suppléments au diplôme.',
    sensibilite: 'personnelle',
    famille: 'Scolarité',
    source: 'APOGEE',
    applications: ['APOGEE', 'APOGEE WEB', 'ALERTES-DIPLOMES', 'UNICAMPUS'],
    flux: [
      { from: 'APOGEE WEB', to: 'ALERTES-DIPLOMES' },
      { from: 'UNICAMPUS', to: 'ALERTES-DIPLOMES' },
    ],
  },
  {
    id: 'boursiers',
    name: 'Données boursiers',
    description: 'Statut de boursier et échelon transmis par le CROUS pour l’exonération des droits d’inscription.',
    sensibilite: 'personnelle',
    famille: 'Scolarité',
    source: null,
    applications: ['APOGEE'],
    flux: [{ from: 'CNOUS', to: 'APOGEE' }],
  },
  {
    id: 'candidatures',
    name: 'Données de candidature',
    description: 'Dossiers de candidature aux formations et aux postes : CV, lettres, pièces justificatives.',
    sensibilite: 'personnelle',
    famille: 'Scolarité',
    source: 'ECANDIDAT',
    applications: ['ECANDIDAT', 'PARCOURSUP', 'DIEGO', 'ASTRE RH'],
    flux: [{ from: 'APOGEE WEB', to: 'DIEGO' }],
  },
  {
    id: 'photos',
    name: 'Photos d’identité',
    description: 'Photos des étudiants et des personnels pour les cartes et le trombinoscope.',
    sensibilite: 'personnelle',
    famille: 'Référentiel',
    source: 'TROMBINOSCOPE',
    applications: ['TROMBINOSCOPE', 'HORIZON', 'Monecarte'],
    flux: [{ from: 'TROMBINOSCOPE', to: 'HORIZON' }],
  },
  {
    id: 'connexion',
    name: 'Informations de connexion',
    description: 'Identifiants, comptes, groupes et journaux de connexion aux services numériques.',
    sensibilite: 'personnelle',
    famille: 'Référentiel',
    source: 'OpenLDAP',
    applications: ['OpenLDAP', 'CAS', 'ACTIVE DIRECTORY', 'SHIBBOLETH', 'MOODLE', 'KOHA'],
    flux: [
      { from: 'APOGEE', to: 'OpenLDAP' },
      { from: 'OpenLDAP', to: 'MOODLE' },
    ],
  },
  {
    id: 'rh',
    name: 'Données personnelles RH',
    description: 'Carrière, contrats, affectations et situation familiale des personnels.',
    sensibilite: 'personnelle',
    famille: 'Ressources humaines',
    source: 'SIHAM',
    applications: ['SIHAM', 'HARPEGE', 'MANGUE', 'ASTRE RH', 'CEGAPE Paie'],
    flux: [],
  },
  {
    id: 'bancaires',
    name: 'Coordonnées bancaires',
    description: 'RIB des personnels, des étudiants remboursés et des fournisseurs.',
    sensibilite: 'personnelle',
    famille: 'Finances',
    source: 'SIFAC',
    applications: ['SIFAC', 'SIHAM', 'CEGAPE Paie'],
    flux: [],
  },
  {
    id: 'paiement',
    name: 'Données de paiement',
    description: 'Rechargements et paiements sans contact au restaurant universitaire.',
    sensibilite: 'personnelle',
    famille: 'Vie étudiante',
    source: 'Izly',
    applications: ['Izly', 'Monecarte'],
    flux: [],
  },
  {
    id: 'video',
    name: 'Images de vidéoprotection',
    description: 'Enregistrements des caméras des entrées, parkings et salles serveurs.',
    sensibilite: 'personnelle',
    famille: 'Patrimoine',
    source: null,
    applications: [],
    flux: [],
  },
  {
    id: 'factures',
    name: 'Données factures',
    description: 'Factures fournisseurs, bons de commande et engagements budgétaires.',
    sensibilite: 'interne',
    famille: 'Finances',
    source: 'SIFAC',
    applications: ['SIFAC', 'GFC', 'CARAMBOLE', 'AMANDE'],
    flux: [],
  },
  {
    id: 'stages',
    name: 'Conventions de stage',
    description: 'Conventions signées entre l’étudiant, l’université et l’organisme d’accueil.',
    sensibilite: 'personnelle',
    famille: 'Scolarité',
    source: 'PSTAGE',
    applications: ['PSTAGE', 'APOGEE'],
    flux: [],
  },
  {
    id: 'salles',
    name: 'Réservations de salles',
    description: 'Occupation des salles et des amphithéâtres, sans nom de personne.',
    sensibilite: 'interne',
    famille: 'Patrimoine',
    source: 'ADE CAMPUS',
    applications: ['ADE CAMPUS', 'GRR', 'CELCAT'],
    flux: [],
  },
]

/** Le flux connu de la carte, avec son libellé. */
export function fluxOf(f: { from: string; to: string }): AppFlow | undefined {
  return flows.find((x) => x.from === f.from && x.to === f.to)
}

export const getObjetDonnee = (id: string | null | undefined) => objetsDonnees.find((d) => d.id === id || d.name === id)
