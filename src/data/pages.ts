// Content for the inner pages, taken from my-carto.com (November 2026) and condensed.

export const featureDetails = [
  {
    id: 'meta-modele',
    icon: 'meta-modele',
    name: 'Méta-modèle no code, 100 % administrable',
    why: 'Votre SI évolue en permanence. Sa modélisation doit suivre.',
    points: [
      'Compatible TOGAF, ArchiMate, Zachman, CIGREF et Club Urba',
      'Bibliothèque de méta-modèles préconfigurés',
      'Administration entièrement graphique, sans code',
      'Chaque changement se propage à toutes les cartes',
    ],
    usecase: 'Démarrez avec un méta-modèle simple, puis enrichissez-le au rythme de votre maturité.',
    quote: {
      text: 'Avec myCarto rien n’est définitif, je peux tout faire évoluer et cela se répercute automatiquement.',
      name: 'Dominique Fiquet',
      role: 'Architecte des Systèmes d’Information',
    },
  },
  {
    id: 'cartes',
    icon: 'cartes',
    name: 'Générateur de cartes',
    why: 'Quand un référentiel devient une carte, incohérences et vulnérabilités sautent aux yeux.',
    points: [
      'Plus de 50 modèles de cartes',
      'Un atlas de gouvernance illimité',
      'Affichage conditionnel, droits, vues datées',
      'Neuf structures : hiérarchique, organique, circulaire…',
    ],
    usecase: 'Avant un projet, le POS du domaine révèle une application obsolète à mutualiser.',
  },
  {
    id: 'tableaux-de-bord',
    icon: 'tableaux-de-bord',
    name: 'Tableaux de bord',
    why: 'Piloter un SI sans cockpit, c’est piloter à l’aveugle.',
    points: [
      'Bibliothèque intégrée, sans outil de BI tiers',
      'Graphiques cliquables jusqu’à la donnée',
      'Concepteur avec requêteur et 7 modèles de restitution',
      'Tableaux de bord illimités',
    ],
    usecase: 'En réunion DSI mensuelle, tous les KPI du référentiel en quelques minutes.',
  },
  {
    id: 'interoperabilite',
    icon: 'interoperabilite',
    name: 'Interopérabilité',
    why: 'Une seule source de vérité, et plus aucune double saisie.',
    points: [
      'API REST ouvertes',
      'CMDB, ITSM, PPM, Finances, base de connaissances',
      'Droits d’accès respectés jusque dans les API',
      'LDAP et authentification',
    ],
    usecase: 'Branché sur la supervision, l’ITSM et le PPM, du build au run.',
  },
  {
    id: 'bpmn',
    icon: 'bpmn',
    name: 'Modélisation BPMN 2',
    why: 'Le processus relie le métier à l’application, puis à l’infrastructure.',
    points: [
      'Designer natif compatible BPMN 2',
      'Le référentiel applicatif accessible depuis le designer',
      'Simulation d’impact : arrêt serveur, coupure de flux…',
      'Import de modèles BPMN 2',
    ],
    usecase: 'Le lieu de rencontre entre MOA, AMOA et MOE.',
  },
]

export const demoFormats = [
  {
    id: 'decouverte',
    name: 'Démo découverte',
    line: 'Un tour d’horizon pour valider la pertinence de l’offre.',
    duration: '20 min',
  },
  {
    id: 'personnalisee',
    name: 'Démo personnalisée',
    line: 'Une exploration ciblée pour projeter vos pratiques dans l’outil.',
    duration: '15 min d’échange + 30 min de démo',
  },
  {
    id: 'thematique',
    name: 'Démo thématique',
    line: 'La réponse de myCarto à un point clé de votre projet.',
    duration: '15 min d’échange + 30 min de démo',
  },
]

export const demoNext = [
  { name: 'Accusé de réception', line: 'Vous recevez une confirmation de votre demande.' },
  { name: 'Prise de rendez-vous', line: 'On vous contacte pour trouver un créneau.' },
  { name: 'La démo en visio', line: 'Avec un de nos experts produit.' },
  { name: 'Vos questions', line: 'Posées directement, sans filtre.' },
]

// Kept for the pages that imported it from here.
export { formatDate } from './articles'
