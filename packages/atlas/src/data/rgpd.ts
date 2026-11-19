// Registre des traitements (RGPD) de l'université de démonstration.
// Les catégories de données renvoient aux objets de données (src/data/donnees.ts), les applications à leurs fiches.
import { objetsDonnees, type Sensibilite } from './donnees'

export type BaseLegale = 'Mission d’intérêt public' | 'Obligation légale' | 'Contrat' | 'Consentement' | 'Intérêt légitime'
export const basesLegales: BaseLegale[] = ['Mission d’intérêt public', 'Obligation légale', 'Contrat', 'Consentement', 'Intérêt légitime']

export interface Traitement {
  id: string
  /** Numéro au registre. */
  ref: string
  name: string
  finalite: string
  baseLegale: BaseLegale
  /** Personnes concernées. */
  personnes: string
  /** Noms des objets de données traités (src/data/donnees.ts). */
  categories: string[]
  duree: string
  applications: string[]
  /** Responsable opérationnel du traitement. */
  responsable: string
  service: string
  /** Analyse d'impact (AIPD) réalisée. */
  aipd: boolean
  /** Données transférées hors de l'Union européenne. */
  horsUE: boolean
  miseAJour: string
}

export const traitements: Traitement[] = [
  {
    id: 'scolarite',
    ref: 'RT-001',
    name: 'Gestion de la scolarité',
    finalite: 'Inscrire les étudiants, suivre leur cursus, organiser les examens et délivrer les diplômes.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Étudiants, anciens étudiants',
    categories: ['Données étudiantes', 'Notes', 'Diplômes', 'Données boursiers'],
    duree: 'Durée des études, puis archivage définitif des diplômes',
    applications: ['APOGEE', 'APOGEE WEB', 'PEGASE', 'NOTES'],
    responsable: 'Antoine Ramo',
    service: 'Scolarité centrale',
    aipd: false,
    horsUE: false,
    miseAJour: '12/09/2026',
  },
  {
    id: 'admissions',
    ref: 'RT-002',
    name: 'Admissions et candidatures',
    finalite: 'Recevoir et instruire les candidatures aux formations, de la licence au master.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Candidats',
    categories: ['Données de candidature', 'Données étudiantes'],
    duree: '1 an après la campagne de candidature',
    applications: ['ECANDIDAT', 'PARCOURSUP', 'DIEGO'],
    responsable: 'Hélène Dupuis',
    service: 'Scolarité centrale',
    aipd: false,
    horsUE: false,
    miseAJour: '03/02/2026',
  },
  {
    id: 'pedagogie',
    ref: 'RT-003',
    name: 'Plateforme pédagogique en ligne',
    finalite: 'Mettre les cours en ligne, recevoir les devoirs, détecter le plagiat et publier les résultats.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Étudiants, enseignants',
    categories: ['Données étudiantes', 'Notes', 'Informations de connexion'],
    duree: 'Année universitaire, plus 1 an',
    applications: ['MOODLE', 'COMPILATIO'],
    responsable: 'Pierre Gérard',
    service: 'Service des usages numériques',
    aipd: false,
    horsUE: false,
    miseAJour: '21/06/2026',
  },
  {
    id: 'sante',
    ref: 'RT-004',
    name: 'Santé universitaire',
    finalite: 'Assurer les visites de prévention, les consultations et les aménagements d’études pour raison médicale.',
    baseLegale: 'Obligation légale',
    personnes: 'Étudiants',
    categories: ['Données de santé', 'Données étudiantes'],
    duree: '20 ans après la dernière consultation',
    applications: ['SIS Accueil'],
    responsable: 'Nadia Benali',
    service: 'Service de santé universitaire',
    aipd: true,
    horsUE: false,
    miseAJour: '14/10/2026',
  },
  {
    id: 'paie',
    ref: 'RT-005',
    name: 'Paie des personnels',
    finalite: 'Calculer et verser les rémunérations, établir les déclarations sociales.',
    baseLegale: 'Obligation légale',
    personnes: 'Personnels titulaires et contractuels',
    categories: ['Données personnelles RH', 'Coordonnées bancaires', 'Données de santé'],
    duree: '5 ans ; bulletins de paie jusqu’à la retraite de l’agent',
    applications: ['SIHAM', 'CEGAPE Paie', 'HARPEGE'],
    responsable: 'Claire Morel',
    service: 'Direction des ressources humaines',
    aipd: true,
    horsUE: false,
    miseAJour: '30/04/2026',
  },
  {
    id: 'recrutement',
    ref: 'RT-006',
    name: 'Recrutement',
    finalite: 'Publier les postes, recevoir les candidatures et organiser les comités de sélection.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Candidats à un poste',
    categories: ['Données de candidature'],
    duree: '2 ans après le dernier contact',
    applications: ['ASTRE RH', 'SIHAM'],
    responsable: 'Claire Morel',
    service: 'Direction des ressources humaines',
    aipd: false,
    horsUE: false,
    miseAJour: '08/01/2026',
  },
  {
    id: 'comptes',
    ref: 'RT-007',
    name: 'Comptes informatiques et authentification',
    finalite: 'Créer les comptes, authentifier les utilisateurs et tracer les connexions aux services numériques.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Étudiants, personnels, invités',
    categories: ['Informations de connexion', 'Photos d’identité'],
    duree: 'Journaux : 1 an ; comptes : 6 mois après le départ',
    applications: ['CAS', 'OpenLDAP', 'ACTIVE DIRECTORY', 'SUPANN-SYNC', 'SHIBBOLETH'],
    responsable: 'Karim Haddad',
    service: 'DSI',
    aipd: false,
    horsUE: false,
    miseAJour: '19/09/2026',
  },
  {
    id: 'messagerie',
    ref: 'RT-008',
    name: 'Messagerie et agenda',
    finalite: 'Fournir une messagerie, des agendas partagés et des listes de diffusion.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Étudiants, personnels',
    categories: ['Informations de connexion'],
    duree: 'Durée du compte, plus 6 mois',
    applications: ['SOGO', 'ZIMBRA', 'CALCIUM', 'Office 365', 'SYMPA'],
    responsable: 'Karim Haddad',
    service: 'DSI',
    aipd: false,
    horsUE: true,
    miseAJour: '02/07/2025',
  },
  {
    id: 'bibliotheque',
    ref: 'RT-009',
    name: 'Bibliothèque',
    finalite: 'Gérer les inscriptions des lecteurs, les prêts, les retours et les réservations d’ouvrages.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Lecteurs : étudiants, personnels, extérieurs',
    categories: ['Informations de connexion', 'Données étudiantes'],
    duree: '1 an après la fin de l’inscription ; historique des prêts : 4 mois',
    applications: ['KOHA', 'BCDI'],
    responsable: 'Thomas Girard',
    service: 'Service commun de la documentation',
    aipd: false,
    horsUE: false,
    miseAJour: '25/03/2026',
  },
  {
    id: 'restauration',
    ref: 'RT-010',
    name: 'Restauration et paiement sans contact',
    finalite: 'Permettre le paiement des repas et le rechargement du compte avec la carte d’étudiant.',
    baseLegale: 'Contrat',
    personnes: 'Étudiants, personnels',
    categories: ['Données de paiement', 'Photos d’identité'],
    duree: '13 mois après la dernière opération',
    applications: ['Izly', 'Monecarte'],
    responsable: 'Isabelle Roux',
    service: 'Agence comptable',
    aipd: false,
    horsUE: false,
    miseAJour: '11/11/2025',
  },
  {
    id: 'video',
    ref: 'RT-011',
    name: 'Vidéoprotection',
    finalite: 'Protéger les personnes et les biens aux entrées des campus, dans les parkings et les salles serveurs.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Usagers et visiteurs des campus',
    categories: ['Images de vidéoprotection'],
    duree: '30 jours au plus',
    applications: [],
    responsable: 'Marc Lefèvre',
    service: 'Direction du patrimoine',
    aipd: true,
    horsUE: false,
    miseAJour: '06/05/2026',
  },
  {
    id: 'finances',
    ref: 'RT-012',
    name: 'Gestion financière et facturation',
    finalite: 'Engager les dépenses, payer les fournisseurs, rembourser les missions et facturer les prestations.',
    baseLegale: 'Obligation légale',
    personnes: 'Fournisseurs, personnels en mission, clients',
    categories: ['Données factures', 'Coordonnées bancaires'],
    duree: '10 ans après la clôture de l’exercice',
    applications: ['SIFAC', 'GFC', 'CARAMBOLE', 'AMANDE'],
    responsable: 'Sophie Laurent',
    service: 'Agence comptable',
    aipd: false,
    horsUE: false,
    miseAJour: '17/02/2026',
  },
  {
    id: 'stages',
    ref: 'RT-013',
    name: 'Stages et insertion professionnelle',
    finalite: 'Publier les offres de stage, établir les conventions et suivre l’insertion des diplômés.',
    baseLegale: 'Mission d’intérêt public',
    personnes: 'Étudiants, tuteurs en entreprise',
    categories: ['Conventions de stage', 'Données étudiantes'],
    duree: '5 ans après la fin du stage',
    applications: ['PSTAGE', 'LIMESURVEY'],
    responsable: 'Hélène Dupuis',
    service: 'Bureau d’aide à l’insertion professionnelle',
    aipd: false,
    horsUE: false,
    miseAJour: '09/12/2025',
  },
]

/** Sensibilité la plus forte des données d'un traitement. */
export function sensibiliteOf(t: Traitement): Sensibilite {
  const levels = t.categories.map((c) => objetsDonnees.find((d) => d.name === c)?.sensibilite ?? 'personnelle')
  return levels.includes('sensible') ? 'sensible' : levels.includes('personnelle') ? 'personnelle' : 'interne'
}

/** Traitements qui utilisent un objet de données. */
export const traitementsOfDonnee = (name: string) => traitements.filter((t) => t.categories.includes(name))
