// Real content, taken from my-carto.com (November 2026) and shortened.

export const site = {
  official: 'https://my-carto.com/',
  demo: 'https://my-carto.com/lp/demande-de-demo/',
  contact: 'https://my-carto.com/contact-cartographie-si/',
  linkedin: 'https://www.linkedin.com/company/ab-plus-software/',
  legal: 'https://my-carto.com/mentions-legales/',
  privacy: 'https://my-carto.com/politique-rgpd-ab-software/',
  email: 'contact@my-carto.com',
  phone: '04 67 50 56 11',
  phoneHref: 'tel:+33467505611',
}

// Shown in the notice bar and footer. Check the spelling before sending.
export const candidate = {
  name: 'Théo Naulet',
  role: 'Développeur front UI/UX',
}

export const clients = [
  { file: 'ratp', name: 'RATP' },
  { file: 'credit-agricole', name: 'Crédit Agricole' },
  { file: 'vinci', name: 'Vinci' },
  { file: 'auchan', name: 'Auchan' },
  { file: 'bouygues-construction', name: 'Bouygues Construction' },
  { file: 'chu-lille', name: 'CHU de Lille' },
  { file: 'montpellier-metropole', name: 'Montpellier Méditerranée Métropole' },
  { file: 'colas', name: 'Colas' },
  { file: 'finances-publique', name: 'Finances publiques' },
  { file: 'groupe-rocher', name: 'Groupe Rocher' },
  { file: 'region-nouvelle-aquitaine', name: 'Région Nouvelle-Aquitaine' },
  { file: 'socotec', name: 'Socotec' },
  { file: 'universite-paris-saclay', name: 'Université Paris-Saclay' },
  { file: 'fm-logistic', name: 'FM Logistic' },
  { file: 'actia', name: 'Actia' },
  { file: 'action-logement', name: 'Action Logement' },
  { file: 'arts-et-metiers', name: 'Arts et Métiers' },
  { file: 'region-auvergne-rhone-alpes', name: 'Région Auvergne-Rhône-Alpes' },
  { file: 'dijon-metropole', name: 'Dijon Métropole' },
  { file: 'euro-metropole', name: 'Eurométropole de Strasbourg' },
  { file: 'rouen-metropole', name: 'Métropole Rouen Normandie' },
  { file: 'departement-finistere', name: 'Département du Finistère' },
  { file: 'departement-seine-maritime', name: 'Département de Seine-Maritime' },
  { file: 'schmidt-groupe', name: 'Schmidt Groupe' },
  { file: 'locam', name: 'Locam' },
  { file: 'nutrition-et-sante', name: 'Nutrition et Santé' },
]

export const directions = [
  {
    id: 'transformation',
    name: 'Transformation numérique',
    points: [
      'Aligner stratégie et feuille de route numérique',
      "Mesurer l'impact d'une évolution avant de la lancer",
      "Intégrer l'IA à votre stratégie IT",
    ],
  },
  {
    id: 'technologies',
    name: 'Technologies du SI',
    points: [
      'Piloter projets, MCO et parc applicatif',
      'Préparer un décommissionnement ou un PRA',
      'Former les nouveaux arrivants et le support N2/N3',
    ],
  },
  {
    id: 'securite',
    name: 'Sécurité du SI',
    points: [
      'Repérer chaque flux de données',
      'Mesurer votre exposition et vos obsolescences',
      'Tenir la crise si vous êtes attaqué',
    ],
  },
]

export const features = [
  {
    icon: 'meta-modele',
    name: 'Méta-modèle 100\u00a0% configurable',
    line: 'Zéro ligne de code. Chaque changement se propage à tous vos référentiels.',
  },
  {
    icon: 'cartes',
    name: 'Cartes dynamiques',
    line: 'Générées depuis le référentiel, filtrées selon les droits de chacun.',
  },
  {
    icon: 'interoperabilite',
    name: 'Interopérabilité',
    line: 'API REST vers votre CMDB, ITSM, PPM, BI et SI Finances. Fini la double saisie.',
  },
  {
    icon: 'tableaux-de-bord',
    name: 'Tableaux de bord',
    line: 'Les indicateurs de pilotage, en temps réel.',
  },
  {
    icon: 'bpmn',
    name: 'Processus en BPMN 2',
    line: 'Un designer intégré pour décrire vos activités dans un standard commun.',
  },
]

export const voices = [
  {
    id: 'marsalet',
    name: 'Stéphanie Marsalet',
    role: 'Architecte Data SI',
    org: 'GIFI',
    quote:
      'Avec myCarto, toutes les cartes sont générées automatiquement, contrairement aux solutions précédentes où chaque schéma devait être construit manuellement. C’est un véritable changement de paradigme.',
  },
  {
    id: 'delaux',
    name: 'Thomas Delaux',
    role: 'Architecte d’Entreprise',
    org: 'Actia',
    quote:
      'A la différence de la vision statique de notre CMDB, avec myCarto nous avons une vision dynamique des liens entre les couches du SI.',
  },
  {
    id: 'verschelde',
    name: 'Magali Verschelde-Delettrez',
    role: 'Urbaniste SI',
    org: 'CHU de Lille',
    quote:
      'Le support est hyper réactif et répond précisément à la question. Ils cherchent à comprendre comment on fonctionne, pas à nous imposer quelque chose de préformaté.',
  },
  {
    id: 'lorho',
    name: 'Guillaume Lorho',
    role: 'Directeur adjoint',
    org: 'Ville de Lorient',
    quote: 'La DSI a souhaité dès le départ en faire un des outils de pilotage de la politique de sécurité du SI.',
  },
  {
    id: 'mercier',
    name: 'Valérie Mercier',
    role: 'Architecte fonctionnelle',
    org: 'Bouygues Construction',
    quote: 'myCarto est une porte d’entrée du patrimoine de l’entreprise avec une vision graphique et intuitive.',
  },
  {
    id: 'delysse',
    name: 'Stéphane Delysse Hofman',
    role: 'DSI',
    org: 'Andra',
    quote: 'L’arrivée de myCarto marque un gap technologique qui est vraiment notable.',
  },
]

export const route = [
  {
    id: 'choisir',
    name: 'Choisir',
    line: 'Nos avant-ventes vérifient avec vous la couverture, les conformités et le montage.',
  },
  {
    id: 'deployer',
    name: 'Déployer',
    line: 'Paramétrage, reprise de vos données, interfaces ITSM et formation de chaque profil.',
  },
  {
    id: 'faire-vivre',
    name: 'Faire vivre',
    line: 'Support noté 4,75/5, trois versions par an, et un club utilisateurs trois fois par an où vous choisissez les prochaines fonctionnalités.',
  },
]
