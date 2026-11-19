// Portefeuille de projets du SI de démonstration (couche applicative).
export type EtatProjet = 'etude' | 'cours' | 'termine'

export const ETATS_PROJET: Record<EtatProjet, { label: string; status: 'neutral' | 'warn' | 'ok' }> = {
  etude: { label: 'À l’étude', status: 'neutral' },
  cours: { label: 'En cours', status: 'warn' },
  termine: { label: 'Terminé', status: 'ok' },
}

export interface Projet {
  id: string
  name: string
  description: string
  etat: EtatProjet
  /** Chef de projet. */
  responsable: string
  debut: string
  fin: string
  /** Avancement en %, pour un projet en cours. */
  avancement?: number
  budget?: string
  applications: string[]
  /** Écrans utiles pour piloter le projet. */
  liens: ('impact' | 'contrats' | 'carte' | 'infrastructure')[]
}

export const projets: Projet[] = [
  {
    id: 'tomcat5',
    name: 'Migration Tomcat 5',
    description: 'Passer les serveurs web d’APOGEE de Tomcat 5 à Tomcat 9 et quitter la machine sophocle.',
    etat: 'cours',
    responsable: 'Lionel Fabian',
    debut: '05/01/2026',
    fin: '30/06/2027',
    avancement: 45,
    budget: '38 000 €',
    applications: ['APOGEE', 'APOGEE WEB', 'NOTES'],
    liens: ['impact', 'infrastructure'],
  },
  {
    id: 'astre',
    name: 'Remplacement par ASTRE RH',
    description: 'Déployer ASTRE RH en remplacement de HARPEGE et MANGUE pour la carrière, la paie et les temps.',
    etat: 'cours',
    responsable: 'Claire Morel',
    debut: '02/11/2025',
    fin: '31/12/2027',
    avancement: 20,
    budget: '240 000 €',
    applications: ['ASTRE RH', 'HARPEGE', 'MANGUE', 'SIHAM'],
    liens: ['impact', 'contrats'],
  },
  {
    id: 'pegase',
    name: 'Déploiement de PEGASE',
    description: 'Remplacer APOGEE par PEGASE pour la gestion de la scolarité, formation par formation.',
    etat: 'cours',
    responsable: 'Antoine Ramo',
    debut: '01/09/2025',
    fin: '31/08/2028',
    avancement: 30,
    budget: '410 000 €',
    applications: ['PEGASE', 'APOGEE', 'APOGEE WEB', 'APOIP'],
    liens: ['impact', 'carte'],
  },
  {
    id: 'amue',
    name: 'Renouvellement du contrat AMUE',
    description: 'Renégocier l’adhésion à l’AMUE avant l’échéance : périmètre, prix et engagements de support.',
    etat: 'etude',
    responsable: 'Isabelle Roux',
    debut: '01/02/2027',
    fin: '30/06/2027',
    applications: ['APOGEE', 'SIFAC', 'SIHAM', 'GFC', 'HARPEGE'],
    liens: ['contrats'],
  },
  {
    id: 'messagerie',
    name: 'Passage SaaS de la messagerie',
    description: 'Regrouper SOGO et ZIMBRA dans une messagerie hébergée, avec l’agenda partagé.',
    etat: 'etude',
    responsable: 'Karim Haddad',
    debut: '01/03/2027',
    fin: '31/12/2027',
    budget: '95 000 € par an',
    applications: ['SOGO', 'ZIMBRA', 'CALCIUM', 'Office 365'],
    liens: ['contrats', 'impact'],
  },
  {
    id: 'oracle',
    name: 'Sortie d’Oracle 10g',
    description: 'Migrer les bases de GFC et HARPEGE vers une version d’Oracle encore supportée.',
    etat: 'etude',
    responsable: 'Julien Besson',
    debut: '01/01/2027',
    fin: '30/09/2027',
    applications: ['GFC', 'HARPEGE'],
    liens: ['impact', 'infrastructure'],
  },
  {
    id: 'esup',
    name: 'Nouvelle version de l’ENT',
    description: 'Passer ESUP-PORTAIL d’uPortal 4 à la version 6 et revoir la page d’accueil des étudiants.',
    etat: 'etude',
    responsable: 'Julie Marchand',
    debut: '01/04/2027',
    fin: '31/10/2027',
    applications: ['ESUP-PORTAIL', 'ENT', 'CAS'],
    liens: ['impact'],
  },
  {
    id: 'ade',
    name: 'ADE Campus en SaaS',
    description: 'Confier l’hébergement d’ADE Campus à l’éditeur et arrêter le serveur local.',
    etat: 'termine',
    responsable: 'Lionel Fabian',
    debut: '06/01/2025',
    fin: '30/06/2025',
    budget: '18 000 € par an',
    applications: ['ADE CAMPUS', 'CELCAT'],
    liens: ['contrats'],
  },
  {
    id: 'shibboleth',
    name: 'Fédération d’identités',
    description: 'Ouvrir la connexion avec les comptes de l’université aux services de la fédération Renater.',
    etat: 'termine',
    responsable: 'Karim Haddad',
    debut: '02/09/2024',
    fin: '28/02/2025',
    applications: ['SHIBBOLETH', 'CAS', 'OpenLDAP'],
    liens: ['carte'],
  },
  {
    id: 'zabbix',
    name: 'Supervision des serveurs',
    description: 'Superviser toutes les machines et les services critiques avec Zabbix, alertes comprises.',
    etat: 'termine',
    responsable: 'Romain Perrin',
    debut: '03/03/2025',
    fin: '31/10/2025',
    applications: ['ZABBIX', 'GLPI'],
    liens: ['infrastructure'],
  },
]

/** Écran ouvert par chaque lien d'un projet. */
export const LIENS_PROJET: Record<Projet['liens'][number], { label: string; path: string; icon: 'impact' | 'contract' | 'map' | 'server' }> = {
  impact: { label: 'Voir l’impact', path: '/impact', icon: 'impact' },
  contrats: { label: 'Voir les contrats', path: '/contrats', icon: 'contract' },
  carte: { label: 'Voir la carte des flux', path: '/carte', icon: 'map' },
  infrastructure: { label: 'Voir l’infrastructure', path: '/infrastructure', icon: 'server' },
}
