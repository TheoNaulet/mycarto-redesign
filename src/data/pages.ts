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

const CASE = 'https://my-carto.com/cas-client/'

export const cases = [
  {
    org: 'CHU de Lille',
    logo: '/brand/testimonials/chu-lille.png',
    figure: '525 applications',
    line: 'Un patrimoine SI centralisé sur 10 établissements, et une résilience cyber renforcée.',
    href: `${CASE}chu-lille-cartographie-si-cybersecurite-nis2/`,
  },
  {
    org: 'Bouygues Construction',
    logo: '/brand/testimonials/bouygues.png',
    figure: '1 500 applications',
    line: 'Un patrimoine rationalisé au service de 35 600 collaborateurs.',
    href: `${CASE}cas-client-cartographie-si-bouygues-construction/`,
  },
  {
    org: 'GIFI',
    logo: '/brand/testimonials/gifi.png',
    figure: '2 outils fusionnés',
    line: 'Processus, applications, flux et données dans une seule cartographie.',
    href: `${CASE}gifi-cartographie-si/`,
  },
  {
    org: 'Andra',
    logo: '/brand/testimonials/andra.png',
    figure: '350 applications',
    line: 'Une cartographie fiable dans un contexte hautement réglementé.',
    href: `${CASE}andra-cartographie-systeme-information/`,
  },
  {
    org: 'Ville de Lorient',
    logo: '/brand/testimonials/lorient.png',
    figure: 'Toute la DSI',
    line: 'Une vision consolidée des applications et des flux, au service de la cybersécurité.',
    href: `${CASE}cas-client-cartographie-si-ville-de-lorient/`,
  },
  {
    org: 'ACTIA Automotive',
    logo: '/brand/testimonials/actia.png',
    figure: 'Du métier à l’infra',
    line: 'Une cartographie en couches qui facilite ITIL et le dialogue avec les métiers.',
    href: `${CASE}cas-client-cartographie-si-actia-automotive/`,
  },
  {
    org: 'Ministères Territoires, Écologie, Logement',
    figure: '1 500 applications',
    line: 'L’initiative GUSI pour cartographier le SI de façon collaborative.',
    href: `${CASE}ministeres-territoires-ecologie-logement/`,
  },
  {
    org: 'SESAN',
    figure: '400 établissements',
    line: 'La gouvernance du catalogue numérique des établissements de santé franciliens.',
    href: `${CASE}sesan-esante/`,
  },
  {
    org: 'Université Paris-Saclay',
    figure: 'Plusieurs SI',
    line: 'La gouvernance des services numériques d’une université aux multiples SI.',
    href: `${CASE}universite-paris-saclay/`,
  },
  {
    org: 'Nutrition & Santé',
    figure: 'Agro-industrie',
    line: 'Des outils fragmentés devenus une architecture d’entreprise lisible.',
    href: `${CASE}nutrition-sante/`,
  },
]

const BLOG = 'https://my-carto.com/blog/'

export interface Article {
  slug: string
  title: string
  excerpt: string
  image: string
  date: string
  href: string
}

export const articles: Article[] = [
  {
    slug: 'nis2',
    title: 'NIS2 : garantir sa conformité avec la cartographie du SI',
    excerpt: 'Pourquoi la cartographie du SI est clé pour la conformité NIS2.',
    image: 'nis2',
    date: '2025-12-02',
    href: `${BLOG}directive-nis2-cartographie-si-conformite/`,
  },
  {
    slug: 'dette-technique',
    title: 'Dette technique : la piloter grâce à la cartographie du SI',
    excerpt: 'La visualiser, la prioriser, la réduire.',
    image: 'dette-technique',
    date: '2026-08-25',
    href: `${BLOG}dette-technique-cartographie-si/`,
  },
  {
    slug: 'mapping-it',
    title: 'Mapping IT : définition et lien avec la cartographie SI',
    excerpt: 'Deux termes, une même démarche.',
    image: 'mapping-it',
    date: '2026-07-23',
    href: `${BLOG}ressources-mapping-it-definition/`,
  },
  {
    slug: 'pos',
    title: 'Plan d’Occupation des Sols (POS) : urbanisation du SI',
    excerpt: 'Définition, méthode de construction et exemples.',
    image: 'pos',
    date: '2026-07-16',
    href: `${BLOG}plan-occupation-sols-urbanisation-si/`,
  },
  {
    slug: 'applicative',
    title: 'Cartographie applicative : méthode et exemples',
    excerpt: 'Une méthode en 6 étapes et un exemple concret.',
    image: 'applicative',
    date: '2026-03-20',
    href: `${BLOG}cartographie-applicative/`,
  },
  {
    slug: 'anssi',
    title: 'Cartographie ANSSI : sécurisez votre SI efficacement',
    excerpt: 'Les recommandations de l’ANSSI, appliquées.',
    image: 'anssi',
    date: '2026-02-04',
    href: `${BLOG}cartographie-anssi-cybersecurite/`,
  },
  {
    slug: 'risques',
    title: 'Cartographie des risques IT : définition, enjeux et outils',
    excerpt: 'Anticiper les menaces avec une analyse claire.',
    image: 'risques',
    date: '2026-02-02',
    href: `${BLOG}cartographie-risques-it/`,
  },
  {
    slug: 'complexite',
    title: 'Complexité de l’infrastructure IT : réduire et simplifier votre SI',
    excerpt: 'Moins de complexité, plus d’efficacité.',
    image: 'complexite',
    date: '2024-07-31',
    href: `${BLOG}gerer-la-complexite-du-systeme-dinformation-avec-une-cartographie-du-si/`,
  },
]

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'ul'; items: string[] }

/** The one article rendered in full in this concept: NIS2, from my-carto.com, lists lightly shortened. */
export const nis2Body: Block[] = [
  { type: 'p', text: 'Alors que les cyberattaques se multiplient et que les exigences réglementaires se durcissent, la cybersécurité est devenue un enjeu stratégique pour toutes les organisations, publiques comme privées.' },
  { type: 'p', text: 'Avec l’entrée en vigueur de la directive européenne NIS2, la donne change radicalement : les entreprises et organismes doivent désormais disposer d’une gouvernance cyber robuste, d’une maîtrise complète de leurs actifs numériques et d’une capacité à réagir efficacement en cas d’incident.' },
  { type: 'p', text: 'Mais comment être conforme sans connaître précisément son système d’information ? Comment identifier les liens entre applications, serveurs, données et prestataires ?' },
  { type: 'h2', text: 'Comprendre NIS2 : un cadre plus strict, un périmètre élargi' },
  { type: 'p', text: 'Adoptée fin 2022 et entrée en application en octobre 2024, la directive NIS2 (Network and Information Systems) vise à renforcer la résilience cyber de l’Union européenne.' },
  { type: 'p', text: 'Elle remplace la première directive NIS de 2016 et élargit considérablement son champ d’application. Désormais, de nombreux secteurs sont concernés : santé, énergie, transport, administration publique, services numériques, gestion des déchets, infrastructures critiques, et bien d’autres.' },
  { type: 'p', text: 'Les organisations doivent notamment :' },
  {
    type: 'ul',
    items: [
      'Réaliser une analyse de risques documentée et continue, en identifiant toutes les vulnérabilités, les points de défaillance et les scénarios d’incident possibles.',
      'Assurer la sécurisation des chaînes d’approvisionnement et des prestataires, car un tiers mal sécurisé peut compromettre l’ensemble du SI.',
      'Notifier rapidement les incidents significatifs aux autorités compétentes, en France à l’ANSSI, avec une documentation précise et traçable.',
      'Démontrer l’implication de la direction dans la gouvernance cyber, avec des décisions validées, des plans d’action suivis et des preuves de conformité.',
    ],
  },
  { type: 'h2', text: 'Pourquoi la cartographie du SI est au cœur de la conformité NIS2' },
  { type: 'h3', text: 'Identifier les actifs critiques' },
  { type: 'p', text: 'Même si la directive NIS2 ne mentionne pas explicitement la cartographie du SI, elle rend cette démarche indispensable. En effet, chaque organisation doit connaître précisément ses actifs critiques. Applications, infrastructures, processus métiers et données sensibles doivent être identifiés et documentés.' },
  { type: 'h3', text: 'Comprendre les dépendances et les flux' },
  { type: 'p', text: 'Les échanges internes, les connexions avec des tiers et les dépendances techniques doivent être clairement visualisés. Ainsi, une panne chez un fournisseur cloud peut rapidement affecter la facturation ou la prise de rendez-vous. Une cartographie à jour permet d’anticiper ces impacts.' },
  { type: 'h3', text: 'Évaluer les risques et les prestataires' },
  { type: 'p', text: 'Un logiciel obsolète ou exposé à des vulnérabilités connues doit être identifié rapidement. De même, les prestataires critiques doivent être recensés et évalués. Cette visibilité constitue le socle d’une stratégie de cybersécurité conforme à NIS2.' },
  { type: 'h2', text: 'Les limites d’une cartographie manuelle' },
  {
    type: 'ul',
    items: [
      'Obsolescence rapide : dès qu’une application change ou qu’un serveur est ajouté, le schéma devient incomplet ou erroné.',
      'Manque de vision globale : les outils statiques ne relient pas les couches du SI (métier, application, infrastructure).',
      'Difficulté de collaboration : plusieurs équipes ne peuvent pas travailler sur le même document.',
      'Complexité pour les audits : il est difficile de prouver la maîtrise du SI avec des documents dispersés.',
    ],
  },
  { type: 'h2', text: 'Pourquoi un outil de cartographie SI dédié est indispensable' },
  { type: 'p', text: 'Un outil de cartographie SI dynamique et centralisé modélise les processus métiers, applications, flux de données, infrastructures et prestataires, en montrant leurs interactions et dépendances. Chaque modification est tracée, chaque actif documenté avec sa criticité, son propriétaire et son niveau de risque.' },
  { type: 'p', text: 'En résumé, un outil dédié transforme la cartographie du SI en référentiel vivant, clé pour une conformité NIS2 fiable et pérenne.' },
]

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
