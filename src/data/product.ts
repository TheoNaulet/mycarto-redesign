// Content of the Produit pages (myCarto, Intégration, Tarifs, Solu-QIQ),
// taken from my-carto.com (November 2026) and condensed. No figure here is invented.

/* ---------- /logiciel ---------- */

/** The layered approach they recommend: stratégie, métier, fonctionnelle, applicative, infra. */
export const layers = ['Stratégie', 'Métier', 'Fonctionnel', 'Applicatif', 'Infrastructure']

export const whyMap = [
  {
    name: 'Aligner le SI sur la stratégie',
    line: 'Voir les liens entre objectifs, processus et applications.',
  },
  {
    name: 'Renforcer la sécurité et la conformité',
    line: 'Repérer actifs critiques, dépendances et flux de données.',
  },
  {
    name: 'Sécuriser les transformations',
    line: 'Cloud, rationalisation, fusion : anticiper chaque impact.',
  },
  {
    name: 'Partager une vision commune',
    line: 'DSI, RSSI, architectes et métiers sur une seule source.',
  },
]

/** The seven governance verbs, each with its own folded-map icon. */
export const verbs = [
  { id: 'transformer', name: 'Transformer', line: 'Imaginer l’évolution du SI et anticiper les besoins numériques.' },
  { id: 'concevoir', name: 'Concevoir', line: 'Mesurer l’impact d’un nouveau service sur l’existant.' },
  { id: 'optimiser', name: 'Optimiser', line: 'Repérer redondances et dépendances, réduire le coût du SI.' },
  { id: 'securiser', name: 'Sécuriser', line: 'Localiser vulnérabilités et obsolescence, préparer vos PRA.' },
  { id: 'auditer', name: 'Auditer', line: 'Contrôler process, flux et données pour vos conformités.' },
  { id: 'piloter', name: 'Piloter', line: 'Des tableaux de bord nourris par la cartographie, à 360°.' },
  { id: 'communiquer', name: 'Communiquer', line: 'Réunir métiers, direction générale et DSI autour des cartes.' },
]

/** What a new platform is initialised with. */
export const starterKit = [
  { figure: '1', unit: 'méta-modèle', line: 'parmi 5 structures types' },
  { figure: '30', unit: 'tableaux de bord', line: 'prêts à l’emploi' },
  { figure: '50', unit: 'modèles de requête', line: 'pour interroger le référentiel' },
  { figure: '50', unit: 'modèles de carte', line: 'pour démarrer sans page blanche' },
]

export const productFeatures = [
  {
    id: 'meta-modele',
    name: 'Méta-modèle 100 % évolutif',
    line: 'Application, flux, donnée, POS… Compatible TOGAF, Zachman et ArchiMate.',
  },
  {
    id: 'cartes',
    name: 'Designer de cartes',
    line: 'Cartes illimitées, mises à jour dès que les données changent.',
  },
  {
    id: 'bpmn',
    name: 'Modélisation des process',
    line: 'Du métier à la technique, avec simulation d’impact.',
  },
  {
    id: 'tableaux-de-bord',
    name: 'Tableaux de bord',
    line: 'Les indicateurs du référentiel, sans outil de BI tiers.',
  },
  {
    id: 'interoperabilite',
    name: 'Intégration',
    line: 'API vers CMDB, ITSM, PPM, BI et SI Finances, droits compris.',
  },
]

export const productFaq = [
  {
    q: 'Comment est calculé le tarif ?',
    a: 'Au nombre d’utilisateurs, selon trois profils : administrateur, contributeur, visualisateur. Trois formules : Starter, Advanced, Premium.',
    link: { to: '/tarifs', label: 'Voir les tarifs' },
  },
  {
    q: 'Combien de temps pour démarrer ?',
    a: 'Installation, reprise de vos données et formation des administrateurs : une plateforme opérationnelle en moins de 4 semaines.',
    link: { to: '/integration', label: 'Voir la méthode' },
  },
  {
    q: 'SaaS ou On Premise ?',
    a: 'Les deux. Le SaaS est hébergé en Union européenne, certifié PAS et HDS. L’On Premise s’installe chez vous selon nos préconisations.',
  },
  {
    q: 'Compatible TOGAF, Zachman ou ArchiMate ?',
    a: 'Oui. Les méta-modèles fournis s’appuient sur ces trois standards, et vous les ajustez à votre stratégie.',
  },
  {
    q: 'Et pour la sécurité du SI ?',
    a: 'myCarto fait partie des dispositifs exigés par l’ANSSI pour les OIV, et porte la cartographie des risques et vos PRA / PCA.',
  },
  {
    q: 'Puis-je importer mes données ?',
    a: 'Oui : Excel (xlsx), CSV et BPMN.',
  },
  {
    q: 'Quelle différence avec Solu-QIQ ?',
    a: 'myCarto est sa nouvelle version : une refonte complète, un nouveau méta-modèle et un nouveau moteur graphique.',
    link: { to: '/solu-qiq', label: 'Ce qui change' },
  },
]

/* ---------- /integration ---------- */

export const services = [
  { icon: 'installation', name: 'Installation', line: 'Chez vous en On Premise, ou mise à disposition en SaaS.' },
  { icon: 'parametrage', name: 'Initialisation', line: 'Votre référentiel chargé avec vos données.' },
  { icon: 'formation', name: 'Formation', line: 'Vos équipes autonomes, en usage comme en administration.' },
  { icon: 'expertise', name: 'Consulting', line: 'Des ateliers méthodologiques pour dynamiser le projet.' },
]

export const smart = [
  { letter: 'S', name: 'Spécifique', line: 'Vos objectifs et vos moyens, pour le projet comme pour le run.' },
  { letter: 'M', name: 'Mesurable', line: 'Des cycles courts, chacun avec un résultat concret.' },
  { letter: 'A', name: 'Atteignable', line: 'Des phases et des jalons qui gardent l’élan.' },
  { letter: 'R', name: 'Réaliste', line: 'L’expérience de centaines de projets pour calibrer le vôtre.' },
  { letter: 'T', name: 'Temporel', line: 'Un rétroplanning calé sur le temps que vous pouvez y consacrer.' },
]

export const projectSteps = [
  { name: 'Environnements', line: 'Instances SaaS activées ou installation chez vous : production, qualification, formation.' },
  { name: 'Paramétrage itératif', line: 'Ateliers méta-modèle, reprise des données, cartes, tableaux de bord, droits, API en option.' },
  { name: 'Recette', line: 'Homologation de la plateforme.' },
  { name: 'Transfert de compétences', line: 'Formation des administrateurs.' },
  { name: 'Organisation du run', line: 'Support, compte client, club utilisateurs, ressources avancées.' },
  { name: 'Clôture', line: 'Présentation aux équipes et bonnes pratiques pour faire vivre le référentiel.' },
]

export const practices = [
  { name: 'Embarquer tout le monde', line: 'Un lancement avec les métiers, les projets et l’infra, un copil à chaque itération.' },
  { name: 'Les bons interlocuteurs', line: 'Un responsable projet à la vision transverse, des rôles clairs.' },
  { name: 'Un budget tenu', line: 'Des charges évaluées au plus juste et suivies régulièrement.' },
  { name: 'Une qualité vérifiée', line: 'Des critères de succès définis d’avance, une recette avant la clôture.' },
]

/* ---------- /tarifs ---------- */

export interface Plan {
  id: string
  name: string
  forWhom: string
  intro: string
  points: string[]
  options?: string[]
  note?: string
  featured?: boolean
}

export const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    forWhom: 'Les DSI de moins de 15 personnes, ou qui se lancent dans l’urbanisation.',
    intro: 'Les fonctions essentielles :',
    points: [
      'Couches métier, fonctionnelle, applicative, technique et data',
      'Modélisation RGPD',
      'Contribution par formulaire ou sur la carte',
      'Tableaux de bord et reporting',
      'Utilisateurs et habilitations',
      'Import et export de fichiers plats',
    ],
    note: 'Disponible uniquement en SaaS.',
  },
  {
    id: 'advanced',
    name: 'Advanced',
    forWhom: 'Les DSI jusqu’à 100 personnes, pour renforcer la maîtrise du SI.',
    intro: 'Tout Starter, plus :',
    points: [
      'Méta-modèle personnalisable sans limite',
      'Couche stratégique',
      'Navigation hors ligne',
      'Environnement de test',
      'SaaS ou On Premise',
    ],
    options: ['BPMN', 'API REST', 'Planification'],
  },
  {
    id: 'premium',
    name: 'Premium',
    forWhom: 'Les DSI de plus de 100 personnes, avec une modélisation métier.',
    intro: 'Tout Advanced, sans option :',
    points: [
      'Modélisation de processus BPMN',
      'Interfaces par API REST',
      'Planification de tâches',
      'Groupes propriétaires',
      'Environnement de recette',
      'SaaS ou On Premise',
    ],
    featured: true,
  },
]

export const pricingPrinciple = [
  {
    icon: 'metier',
    name: 'Licences flottantes',
    line: 'Trois profils : consultation, mise à jour, administration.',
  },
  {
    icon: 'fonctionnalites',
    name: 'Trois formules',
    line: 'Starter, Advanced ou Premium, et des options si besoin.',
  },
  {
    icon: 'default',
    name: 'SaaS ou On Premise',
    line: 'Abonnement ou investissement, selon votre modèle.',
  },
]

export const alwaysIncluded = [
  'Les nouvelles versions, trois par an',
  'Le support, avec des niveaux de service contractuels',
  'La documentation, les événements et le club utilisateurs',
]

export const extraServices = [
  { name: 'Accompagnement', line: 'Nos experts produit pour la mise en œuvre, l’installation et l’intégration.', to: '/integration' },
  { name: 'Formation certifiée', line: 'Un dispositif adapté à votre configuration, certifié Datadock.' },
  { name: 'Support avancé', line: 'Un carnet d’expertise pour vos questions fonctionnelles.' },
  { name: 'Montée de version', line: 'Une assistance quand vous changez de version.' },
  { name: 'Opérations à la demande', line: 'Sur vos environnements de test et de recette (Advanced et Premium).' },
]

export const purchasingCentres = [
  { file: 'ugap', name: 'UGAP' },
  { file: 'canut', name: 'CANUT' },
  { file: 'resah', name: 'RESAH' },
  { file: 'caih', name: 'CAIH' },
  { file: 'groupe-logiciel', name: 'Groupe Logiciel' },
]

/* ---------- /solu-qiq ---------- */

/** From their "Qui sommes-nous" timeline, only the Solu-QIQ to myCarto story. */
export const soluQiqStory = [
  { year: '2006', line: 'AB+ Software commence à développer Solu-QIQ pour ses missions de conseil.' },
  { year: '2019', line: 'Lancement du programme de R&D myCarto.' },
  { year: '2023', line: 'La première version de myCarto est déployée.' },
  { year: '2024', line: 'Les clients historiques de Solu-QIQ passent à myCarto.' },
]

export const soluQiqChanges = [
  { name: 'Plus simple à utiliser', line: 'Une prise en main immédiate, même sans profil technique.' },
  { name: 'Propagation instantanée', line: 'Le moteur graphique recalcule toutes les cartes en temps réel.' },
  { name: 'Plus de données', line: 'De nouveaux algorithmes pour de grands volumes, dans de nombreuses cartes.' },
  { name: 'Une interface à votre image', line: 'Entièrement personnalisable, elle s’intègre à votre organisation.' },
  { name: 'Administration full web', line: 'Administrer, contribuer, consulter : tout dans le navigateur, sans code.' },
  { name: 'Bibliothèque de tableaux de bord', line: 'Les chiffres clés du SI, et la liberté d’en ajouter.' },
]
