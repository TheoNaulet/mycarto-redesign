// Content of the « Pour qui ? » pages, taken from my-carto.com (November 2026) and condensed:
// cartographie-dsi, cartographie-architecture-entreprise, logiciel-metiers-numerique, secteurs,
// reussir-demarche-cartographie-si.

export interface Theme {
  id: string
  name: string
  line: string
  image: string
}

/** The two roles the site writes a whole page for, each with its own illustrated themes. */
export const dsi = {
  name: 'DSI',
  title: 'Le DSI voit enfin tout son SI',
  line: 'DSI, DSN, CIO ou DTN : quatre cartes pour piloter le territoire numérique dont vous avez la charge.',
  themes: [
    {
      id: 'vision',
      name: 'Une vision globale',
      line: 'Redondances, points de défaillance et ressources inutilisées repérés en quelques clics.',
      image: 'dsi-vision',
    },
    {
      id: 'decision',
      name: 'Des décisions alignées',
      line: 'Vos plans de transformation quittent les slides pour des cartes dynamiques.',
      image: 'dsi-decision',
    },
    {
      id: 'risque',
      name: 'Des risques anticipés',
      line: 'Vulnérabilités, obsolescence et flux de données sous surveillance.',
      image: 'dsi-risque',
    },
    {
      id: 'budget',
      name: 'Des coûts maîtrisés',
      line: 'Coûts cachés et ressources sous-exploitées mis au jour, ROI à l’appui.',
      image: 'dsi-budget',
    },
  ] satisfies Theme[],
}

export const architect = {
  name: 'Architecte d’entreprise et urbaniste',
  title: 'L’architecte garde le SI cohérent',
  line: 'Trois missions, un seul référentiel à jour.',
  themes: [
    {
      id: 'coherence',
      name: 'Structurer',
      line: 'Une vue centralisée, mise à jour en continu, par processus, domaine ou composant.',
      image: 'archi-optimisation',
    },
    {
      id: 'alignement',
      name: 'Aligner',
      line: 'Une roadmap visuelle que les non-techniciens comprennent du premier coup d’œil.',
      image: 'archi-strategie',
    },
    {
      id: 'rationalisation',
      name: 'Rationaliser',
      line: 'Doublons et applications sous-utilisées mis en évidence, legacy sous contrôle.',
      image: 'archi-rationaliser',
    },
  ] satisfies Theme[],
  quote: {
    figure: '+40\u00a0k€',
    figureLine: 'd’économies sur les abonnements cloud',
    text: 'En alignant les niveaux de service de notre infrastructure avec la criticité des applications, nous réalisons +40\u00a0k€ d’économies sur nos abonnements cloud.',
    name: 'Philippe Chiarbonello',
    role: 'Head of Urbanization & Enterprise Architecture',
  },
}

export interface TeamRole {
  id: string
  name: string
  short: string
  mission: string
  image: string
  benefits: string[]
}

/** Everyone else who runs the SI, shown in the role picker. */
export const teamRoles: TeamRole[] = [
  {
    id: 'rssi',
    name: 'RSSI',
    short: 'Exposition, conformité, incidents',
    mission: 'Repérer les zones critiques, tenir la conformité et répondre vite aux incidents.',
    image: 'rssi',
    benefits: [
      'Points d’exposition et vulnérabilités identifiés',
      'Mesures de sécurité visibles au même endroit',
      'Audits de sécurité documentés plus simplement',
      'Délais de réponse aux incidents réduits',
    ],
  },
  {
    id: 'dpo',
    name: 'DPO',
    short: 'Traitements et données personnelles',
    mission: 'Garantir la conformité RGPD et documenter chaque traitement de données personnelles.',
    image: 'dpo',
    benefits: [
      'Applications et flux de données personnelles visibles',
      'Documentation centralisée pour les audits',
      'Stockage des données RGPD maîtrisé dans le SI',
      'myCarto relié à vos outils RGPD et de PIA',
    ],
  },
  {
    id: 'exploitation',
    name: 'Exploitation et infrastructure',
    short: 'Dépendances, migrations, continuité',
    mission: 'Assurer la continuité de service, anticiper l’obsolescence et les migrations.',
    image: 'infra',
    benefits: [
      'myCarto interfacé avec la CMDB',
      'Dépendances entre applications et infrastructures visibles',
      'Impacts des migrations et mises à jour anticipés',
      'Moins de temps d’arrêt grâce à une meilleure planification',
    ],
  },
  {
    id: 'support',
    name: 'Support IT',
    short: 'Diagnostic rapide des incidents',
    mission: 'Répondre vite aux incidents et comprendre les causes qui reviennent.',
    image: 'help-desk',
    benefits: [
      'Diagnostic rapide grâce aux dépendances',
      'Une documentation qui sert vraiment le support',
      'Des flux d’escalade optimisés',
      'Moins d’interruptions pour les utilisateurs',
    ],
  },
  {
    id: 'responsables',
    name: 'Responsables métiers',
    short: 'Des processus reliés au SI',
    mission: 'Travailler avec la DSI et aligner les projets numériques sur les besoins du métier.',
    image: 'metier',
    benefits: [
      'Processus métiers reliés aux applications',
      'Opportunités de digitalisation repérées',
      'Moins de frictions entre IT et métiers',
      'Initiatives numériques priorisées selon les besoins',
    ],
  },
  {
    id: 'chef-de-projet',
    name: 'Chef de projet',
    short: 'Périmètre et impacts du projet',
    mission: 'Cadrer le projet, anticiper ses impacts et préparer le passage en Run.',
    image: 'chef-de-projet',
    benefits: [
      'Périmètre défini à partir des flux et dépendances',
      'Besoins formalisés depuis une vue centralisée',
      'Utilisateurs impactés identifiés pour la conduite du changement',
      'Documentation prête pour la phase Run',
    ],
  },
]

export interface Sector {
  id: string
  name: string
  line: string
  image: string
  maps: string[]
  /** Files in /brand/clients, only where the sector is obvious from the name. */
  clients: string[]
}

export const sectors: Sector[] = [
  {
    id: 'sante',
    name: 'Santé',
    line: 'CHU, GHT, cliniques, EHPAD, laboratoires : la donnée patient au centre de la carte.',
    image: 'sante',
    maps: ['Suivi des flux de données patients', 'Exploration à toutes les échelles des unités de soins'],
    clients: ['chu-lille'],
  },
  {
    id: 'industrie',
    name: 'Industrie',
    line: 'Un ERP au cœur, un legacy important et l’industrie 4.0 à intégrer.',
    image: 'industrie',
    maps: [
      'Flux de données entre le CRM et l’ERP',
      'Carte des échéances d’obsolescence',
      'Applications par site, BU ou corporate, avec des droits fins',
    ],
    clients: ['actia', 'nutrition-et-sante'],
  },
  {
    id: 'btp',
    name: 'BTP',
    line: 'De multiples filiales, autant de SI à relier et à optimiser.',
    image: 'btp',
    maps: ['Flux d’échange entre les organisations', 'Domaines métiers et redondances mis en évidence'],
    clients: ['bouygues-construction', 'vinci', 'colas'],
  },
  {
    id: 'collectivites',
    name: 'Collectivités',
    line: 'Jusqu’à 250 métiers dans une métropole, autant de services numériques à tenir.',
    image: 'collectivites',
    maps: [
      'Les cartes d’urbanisation : zones, quartiers, îlots',
      'Les cartes de gestion du legacy',
      'Les flux de données',
    ],
    clients: [
      'montpellier-metropole',
      'region-nouvelle-aquitaine',
      'region-auvergne-rhone-alpes',
      'euro-metropole',
      'rouen-metropole',
      'dijon-metropole',
      'departement-finistere',
      'finances-publique',
    ],
  },
  {
    id: 'enseignement',
    name: 'Enseignement',
    line: 'Étudiants, enseignants-chercheurs, administratifs : un SI aux accès innombrables.',
    image: 'enseignement',
    maps: [
      'Établissements et infrastructures',
      'Applications métiers : recherche, gestion de labo',
      'Applications support : RH, paie, vie universitaire',
    ],
    clients: ['universite-paris-saclay', 'arts-et-metiers'],
  },
]

export const otherSectors = {
  names: [
    'Banques',
    'Assurances',
    'Logistique',
    'SDIS',
    'Grande distribution',
    'Services à la personne',
    'Services aux entreprises',
  ],
  clients: ['credit-agricole', 'auchan', 'ratp', 'fm-logistic'],
}

export interface MethodStep {
  n: number
  icon: string
  name: string
  short: string
  line: string
}

export const methodSteps: MethodStep[] = [
  { n: 1, icon: 'objectif', name: 'Fixer les objectifs', short: 'Objectifs', line: 'Optimiser, migrer, se conformer, sécuriser : savoir pourquoi avant de commencer.' },
  { n: 2, icon: 'implicante', name: 'Impliquer les parties prenantes', short: 'Parties prenantes', line: 'DSI, métiers, architectes, projets, support, sécurité : chacun valide sa part.' },
  { n: 3, icon: 'centralisation', name: 'Recueillir les informations', short: 'Recueil', line: 'Applications, infrastructures, interfaces, données et processus, depuis vos CMDB et ITSM.' },
  { n: 4, icon: 'outils', name: 'Choisir le bon outil', short: 'Outil', line: 'Aligné sur le guide d’urbanisation de l’ANSSI, lisible sans formation.' },
  { n: 5, icon: 'modele', name: 'Avancer par périmètres', short: 'Périmètre', line: 'Un domaine métier ou un processus critique d’abord, puis on étend.' },
  { n: 6, icon: 'dependance', name: 'Relier dépendances et flux', short: 'Dépendances', line: 'Les liens révèlent l’impact d’une panne ou d’un changement.' },
  { n: 7, icon: 'analyse', name: 'Analyser les résultats', short: 'Analyse', line: 'Optimiser, rationaliser, sécuriser, se mettre en conformité.' },
  { n: 8, icon: 'mise-a-jour', name: 'Tenir la carte à jour', short: 'Mise à jour', line: 'Une gouvernance continue, nourrie par les API, sans double saisie.' },
  { n: 9, icon: 'communication', name: 'Communiquer', short: 'Communication', line: 'Le bon niveau de détail pour la direction, les métiers ou les équipes.' },
  { n: 10, icon: 'referentiel', name: 'S’appuyer sur les référentiels', short: 'Référentiels', line: 'Des cadres éprouvés, adoptés au rythme de votre maturité.' },
]

export const methodPhases = [
  { id: 'cadrer', name: 'Cadrer', line: 'Avant la première carte.', steps: [1, 2, 3, 4] },
  { id: 'construire', name: 'Construire', line: 'Une carte après l’autre.', steps: [5, 6, 7] },
  { id: 'faire-vivre', name: 'Faire vivre', line: 'Une cartographie qui dure.', steps: [8, 9, 10] },
]

export const frameworks = ['TOGAF', 'ArchiMate', 'Zachman', 'ITIL', 'COBIT', 'BPMN 2']
