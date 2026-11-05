// The ten case studies of my-carto.com (November 2026), condensed into one structured read each.
// Figures and quotes are theirs; quotes are verbatim, sometimes cut at a sentence end.

const NB = ' '
const SOURCE = 'https://my-carto.com/cas-client/'

export interface CaseQuote {
  text: string
  name: string
  role: string
}

export interface CaseItem {
  name: string
  line: string
}

export interface CaseStudy {
  slug: string
  org: string
  sector: string
  /** Logo for the cards (white plate). */
  logo: string
  /** Their cover photo, which already carries the client's logo. */
  cover?: string
  /** Headline under the name, one sentence. */
  title: string
  /** Short figure and line for the case cards on /clients. */
  card: { figure: string; line: string }
  figures: { value: string; label: string }[]
  context: string
  challenge: CaseItem[]
  approach: CaseItem[]
  /** A real product screen (or their own illustration) shown under the approach. */
  screen?: { src: string; caption: string; wide?: boolean; illustration?: boolean; width: number; height: number }
  results: string[]
  quote: CaseQuote
  second?: CaseQuote
  tip: { title: string; text: string }
  source: string
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'chu-lille',
    org: 'CHU de Lille',
    sector: 'Santé',
    logo: '/brand/testimonials/chu-lille.png',
    cover: '/brand/cases/chu-lille.webp',
    title: 'Cartographier le SI pour mieux soigner et mieux résister aux cyberattaques.',
    card: {
      figure: `525${NB}applications`,
      line: 'Un patrimoine SI centralisé sur 10 établissements, et une résilience cyber renforcée.',
    },
    figures: [
      { value: '525', label: 'applications référencées' },
      { value: '10', label: 'établissements dans le GHT' },
      { value: '210', label: 'utilisateurs directs' },
    ],
    context: `Établissement support d’un GHT de dix établissements, le CHU devait tenir NIS2 et préparer la convergence des SI de son territoire.`,
    challenge: [
      { name: 'La directive NIS2', line: 'Entité essentielle, le CHU doit cartographier son SI selon le référentiel de l’ANSSI.' },
      { name: 'Des opérations lourdes', line: 'Deux refontes du cœur de réseau, et des dizaines d’acteurs pour recouper des données en silos.' },
      { name: 'Une cyberattaque dans le GHT', line: `En 2024, 95${NB}% du SI du CH d’Armentières chiffré et plus de six mois de reconstruction.` },
    ],
    approach: [
      { name: 'Montrer d’abord', line: 'Les équipes voient ce qu’elles y gagnent avant de saisir quoi que ce soit.' },
      { name: 'Les applications', line: 'Les 525 applications, avec interlocuteurs, contrats et flux de données.' },
      { name: 'L’infrastructure', line: 'La CMDB importée pour relier chaque application à ses machines.' },
      { name: 'Le POS du GHT', line: 'Les applications communes aux dix établissements, pour piloter la convergence.' },
    ],
    screen: {
      src: '/brand/cases/chu-lille-accueil.webp',
      caption: 'Vue d’ensemble du système d’information du CHU de Lille dans myCarto.',
      width: 1100,
      height: 593,
    },
    results: [
      'Un référentiel unique à la place de 50 fichiers Excel déphasés',
      'Des équipes autonomes pour trouver l’information',
      'Des maintenances préparées sans oublier d’application critique',
      'L’impact d’une panne simulé en un clic droit',
    ],
    quote: {
      text: 'Ce qui m’a convaincu dans myCarto, c’est le fait que les cartes se génèrent toutes seules. Vous avez une fiche applicative, et elle se génère pour toutes les applications sans avoir à les dessiner une par une. C’est très puissant.',
      name: 'Magali Verschelde-Delettrez',
      role: 'Urbaniste SI du CHU de Lille',
    },
    second: {
      text: 'Pour gérer du risque, il faut être en connaissance du risque. Et pour ça, il faut une cartographie de son système d’information. Un RSSI sans cartographie travaille à vue.',
      name: 'Thomas Aubin',
      role: 'RSSI du CHU de Lille et du GHT',
    },
    tip: {
      title: 'Leur conseil',
      text: `Commencez petit, puis enrichissez${NB}: mieux vaut peu d’information fiable que beaucoup d’information approximative.`,
    },
    source: `${SOURCE}chu-lille-cartographie-si-cybersecurite-nis2/`,
  },
  {
    slug: 'gifi',
    org: 'GIFI',
    sector: 'Retail',
    logo: '/brand/testimonials/gifi.png',
    cover: '/brand/cases/gifi.webp',
    title: 'Rendre la cartographie du SI accessible à toute l’entreprise.',
    card: {
      figure: '2 outils fusionnés',
      line: 'Processus, applications, flux et données dans une seule cartographie.',
    },
    figures: [
      { value: '104', label: 'applications cartographiées' },
      { value: '420', label: 'flux d’échange' },
      { value: `2 à 3${NB}×`, label: 'plus rapide qu’avant' },
    ],
    context: 'Plus de 500 magasins, une DSI de 80 personnes et deux outils de cartographie qui ne se parlaient pas.',
    challenge: [
      { name: 'Deux outils séparés', line: 'L’un pour les processus et l’urbanisation, l’autre pour les flux et la donnée.' },
      { name: 'Une adoption freinée', line: 'Trop complexes, les outils restaient ceux de l’équipe architecture.' },
      { name: 'Des cartes faites à la main', line: 'Chaque schéma et chaque étude d’impact se construisait manuellement.' },
    ],
    approach: [
      { name: 'Un seul outil', line: 'Les deux outils fusionnés dans myCarto, du processus jusqu’à la donnée.' },
      { name: 'Cinq couches', line: 'Métier, fonctionnelle, applicative, technique, puis infrastructure.' },
      { name: 'Un dictionnaire de données', line: 'Co-construit avec AB+ Software : attributs, propriétaires et lignage.' },
      { name: 'Des cartes autonomes', line: 'Partagées par lien à toute l’entreprise, sans se connecter à l’outil.' },
    ],
    screen: {
      src: '/brand/cases/gifi-vue-flux.webp',
      caption: 'Vue d’un flux de données dans myCarto, du système source à ses destinations.',
      wide: true,
      width: 1100,
      height: 262,
    },
    results: [
      'Un objet complet et sa vingtaine de flux cartographiés en moins d’une heure',
      'Deux outils consolidés en un, pour un budget réduit',
      'L’autonomie complète sur le méta-modèle',
      'Une « Bible IT » partagée par toute l’entreprise',
    ],
    quote: {
      text: 'Avec myCarto, toutes les cartes sont générées automatiquement, contrairement aux solutions précédentes où chaque schéma devait être construit manuellement. C’est un véritable changement de paradigme.',
      name: 'Stéphanie Marsalet',
      role: 'Architecte Data SI et Urbanisation, GIFI',
    },
    second: {
      text: 'L’arrêt de la maintenance de l’un des outils précédents a permis de financer intégralement un dispositif plus complet.',
      name: 'Stéphanie Marsalet',
      role: 'Architecte Data SI et Urbanisation, GIFI',
    },
    tip: {
      title: 'Leur conseil',
      text: 'La cartographie du SI ne doit pas rester l’outil des architectes.',
    },
    source: `${SOURCE}gifi-cartographie-si/`,
  },
  {
    slug: 'andra',
    org: 'Andra',
    sector: 'Nucléaire',
    logo: '/brand/testimonials/andra.png',
    cover: '/brand/cases/andra.webp',
    title: 'Maîtriser et urbaniser un SI complexe dans un contexte hautement réglementé.',
    card: {
      figure: `350${NB}applications`,
      line: 'Une cartographie fiable dans un contexte hautement réglementé.',
    },
    figures: [
      { value: '350', label: 'applications recensées' },
      { value: `60${NB}k€`, label: 'd’achat évité' },
      { value: '30', label: 'personnes au département SI' },
    ],
    context: 'Jusqu’en 2020, chaque direction gérait ses propres outils : un patrimoine morcelé, des audits fréquents, une réglementation nucléaire stricte.',
    challenge: [
      { name: 'La conformité', line: 'L’ANSSI et la réglementation nucléaire imposent une connaissance précise du SI.' },
      { name: 'Une vision fragmentée', line: 'Chaque direction avait ses outils, souvent développés localement.' },
      { name: 'Un ancien outil laborieux', line: 'Mises à jour lourdes, formations longues, publication manuelle sur l’intranet.' },
    ],
    approach: [
      { name: 'Les applications', line: 'Les 350 applications recensées et documentées.' },
      { name: 'L’infrastructure', line: 'La CMDB alimente la carte chaque soir, l’ITSM est synchronisé.' },
      { name: 'Les processus', line: 'Les business partners modélisent en BPMN directement dans myCarto.' },
      { name: 'Les flux, puis la donnée', line: 'Les échanges entre applications, puis la donnée sur des périmètres pilotes.' },
    ],
    screen: {
      src: '/brand/cases/andra-carto.webp',
      caption: 'La cartographie de l’Andra dans myCarto.',
      width: 945,
      height: 597,
    },
    results: [
      'Une preuve documentée à chaque audit réglementaire',
      'Un indicateur d’obsolescence calculé automatiquement',
      'Un nouvel infogérant opérationnel plus vite',
      `Un achat de plus de 60${NB}k€ évité grâce aux processus modélisés`,
    ],
    quote: {
      text: 'C’est une solution qui évolue bien. AB+ Software prend en compte les retours de leurs clients. Le support répond vite. L’arrivée de myCarto marque un gap technologique qui est vraiment notable.',
      name: 'Stéphane Delysse-Hofman',
      role: 'DSI de l’Andra',
    },
    second: {
      text: 'C’est vraiment le côté simple, il n’y a pas besoin d’être formé pendant 3 semaines pour commencer à utiliser myCarto.',
      name: 'Arnaud Marchesi',
      role: 'Architecte d’entreprise, Andra',
    },
    tip: {
      title: 'L’astuce en chemin',
      text: 'Automatiser autant que possible, ne pas faire confiance à l’humain.',
    },
    source: `${SOURCE}andra-cartographie-systeme-information/`,
  },
  {
    slug: 'bouygues-construction',
    org: 'Bouygues Construction',
    sector: 'BTP',
    logo: '/brand/testimonials/bouygues.png',
    cover: '/brand/cases/bouygues.webp',
    title: `Maîtriser 1${NB}500 applications et accélérer l’urbanisation du SI.`,
    card: {
      figure: `1${NB}500 applications`,
      line: `Un patrimoine rationalisé au service de 35${NB}600 collaborateurs.`,
    },
    figures: [
      { value: `1${NB}500`, label: 'applications' },
      { value: `35${NB}600`, label: 'collaborateurs' },
      { value: '70', label: 'relais architectes' },
    ],
    context: 'Dans le top 3 mondial du BTP, présent dans plus de 50 pays, avec une équipe d’architecture de quatre personnes.',
    challenge: [
      { name: 'Une documentation éparpillée', line: 'Des schémas Visio, des PowerPoint et des référentiels non maintenus.' },
      { name: 'Du shadow IT', line: 'Les métiers souscrivent des solutions SaaS sans contrôle.' },
      { name: 'Des flux en spaghetti', line: 'Du point-à-point généralisé, et très peu à jour.' },
    ],
    approach: [
      { name: 'Tout automatiser', line: 'Des API vers le référentiel d’applications et l’ITSM, à jour chaque jour.' },
      { name: 'Fonctionnel et applicatif', line: 'D’abord les couches qui apportent le plus de valeur immédiate.' },
      { name: 'La qualité des données', line: 'Des KPI dans Power BI et des « Jeux Olympiques de la qualité de données ».' },
      { name: 'Des relais', line: 'Une communauté interne de 70 collaborateurs aux missions d’architecte.' },
    ],
    screen: {
      src: '/brand/cases/bouygues-1.webp',
      caption: 'Cartographie générale du patrimoine applicatif du SI Corporate.',
      width: 1100,
      height: 602,
    },
    results: [
      'Des scénarios as-is / to-be montrés en quelques filtres',
      'La refonte de l’ERP Finance préparée sur la carte',
      'La dette technique visible par direction',
      'Un point d’entrée unique, sans PowerPoint ni Visio',
    ],
    quote: {
      text: 'Le point-à-point ne coûte pas cher en one-shot, mais à terme il coûte cher. myCarto permet de cibler et de proposer des scénarios d’optimisation.',
      name: 'Valérie Mercier',
      role: 'Architecte fonctionnelle, direction architecture',
    },
    second: {
      text: 'Avec myCarto, je peux travailler une cible. En appliquant des filtres, je travaille des scénarios type : si je décommissionne telle brique, si j’urbanise tel flux…',
      name: 'Valérie Mercier',
      role: 'Architecte fonctionnelle, direction architecture',
    },
    tip: {
      title: 'Leur méthode',
      text: 'Beaucoup de pédagogie : des cas d’usage concrets, des visuels avant / après et des quick wins.',
    },
    source: `${SOURCE}cas-client-cartographie-si-bouygues-construction/`,
  },
  {
    slug: 'lorient',
    org: 'Ville de Lorient',
    sector: 'Collectivité',
    logo: '/brand/testimonials/lorient.png',
    cover: '/brand/cases/lorient.webp',
    title: 'Structurer et partager la cartographie du SI d’une collectivité.',
    card: {
      figure: '230 flux suivis',
      line: 'Une vision consolidée des applications et des flux, au service de la cybersécurité.',
    },
    figures: [
      { value: '500', label: 'modules applicatifs' },
      { value: '230', label: 'flux interapplicatifs' },
      { value: `57${NB}000`, label: 'habitants servis' },
    ],
    context: 'Une DSI au service de toute la ville, avec un parc hétérogène, des applications historiques et une documentation dispersée.',
    challenge: [
      { name: 'Une documentation éclatée', line: 'Des schémas et des procédures non centralisés.' },
      { name: 'Peu de visibilité', line: 'Pas de vision globale et à jour du SI.' },
      { name: 'Des personnes clés', line: 'Certaines applications ne dépendaient que d’une personne.' },
    ],
    approach: [
      { name: 'Un inventaire partagé', line: 'Un parc applicatif fiable, connu de toute la DSI.' },
      { name: 'Les flux en API', line: 'Les 230 flux interapplicatifs documentés, en majorité des API.' },
      { name: 'Du processus à la machine', line: 'Processus, applications, composants techniques et machines reliés.' },
      { name: 'Le RGPD intégré', line: 'Les traitements de données sortent d’Excel pour entrer dans la carte.' },
    ],
    results: [
      'Une vision consolidée et centralisée du SI',
      'Du temps gagné dans les audits et les analyses d’impact',
      'Une cybersécurité mieux pilotée',
      'Une conformité RGPD simplifiée et centralisée',
    ],
    quote: {
      text: 'En associant le RSSI et les administrateurs systèmes, la DSI a souhaité dès le départ en faire un des outils de pilotage de la politique de sécurité des systèmes d’information.',
      name: 'Guillaume Lorho',
      role: 'Directeur adjoint de la DSI, Ville de Lorient',
    },
    second: {
      text: 'C’est beaucoup plus facile de parler de process à un directeur général plutôt que de lui parler de modules applicatifs avec des noms pas très parlants.',
      name: 'Mathilde Hurier',
      role: 'Déléguée à la protection des données',
    },
    tip: {
      title: 'Le contrôle qualité',
      text: 'Le graphe, généré en temps réel, sert à vérifier que chaque donnée saisie est conforme.',
    },
    source: `${SOURCE}cas-client-cartographie-si-ville-de-lorient/`,
  },
  {
    slug: 'actia',
    org: 'ACTIA Automotive',
    sector: 'Industrie',
    logo: '/brand/testimonials/actia.png',
    cover: '/brand/cases/actia.webp',
    title: 'Une architecture d’entreprise en couches, du processus métier à l’infrastructure.',
    card: {
      figure: `−30${NB}% de VM`,
      line: 'Une cartographie en couches qui facilite ITIL et le dialogue avec les métiers.',
    },
    figures: [
      { value: `−30${NB}%`, label: 'de machines virtuelles' },
      { value: '60', label: 'processus clés outillés' },
      { value: '700', label: 'salariés sur 4 sites' },
    ],
    context: 'Spécialiste de l’électronique embarquée, une DSI de culture ITIL face à un SI de plus en plus complexe, partagé entre IT et OT.',
    challenge: [
      { name: 'Une documentation fragmentée', line: 'Des schémas Visio éparpillés, des procédures Word non centralisées.' },
      { name: 'Des VM sans criticité connue', line: 'Un grand parc de machines virtuelles, sans vision des dépendances.' },
      { name: 'Une connaissance qui part', line: 'Quand celui qui a installé une application s’en va, on repart de zéro.' },
    ],
    approach: [
      { name: 'L’infrastructure', line: 'Import depuis la CMDB, et optimisation du parc.' },
      { name: 'Applications et flux', line: 'Les applications et leurs interactions cartographiées.' },
      { name: 'Les processus métier', line: 'Intégrés en BPMN, en lien avec la stratégie d’entreprise.' },
      { name: 'L’automatisation', line: 'ETL, API et synchronisation avec la CMDB, l’annuaire, le SIRH et la virtualisation.' },
    ],
    results: [
      `30${NB}% de machines virtuelles en moins`,
      'Un serveur LDAP redondant supprimé',
      'Des analyses d’impact simples à chaque changement',
      'Une documentation à jour pour les certifications ISO',
    ],
    quote: {
      text: 'Nous avons réduit de 30 % notre parc de machines virtuelles. Cela génère des économies substantielles en licences et en maintenance, et s’inscrit dans notre démarche RSE.',
      name: 'Thomas Delaux',
      role: 'Architecte SI, ACTIA Automotive',
    },
    second: {
      text: 'À la différence de la vision statique de notre CMDB, avec myCarto nous avons une vision dynamique des liens entre les couches du SI.',
      name: 'Thomas Delaux',
      role: 'Architecte SI, ACTIA Automotive',
    },
    tip: {
      title: 'L’astuce en chemin',
      text: 'Une seule application est maître sur une donnée.',
    },
    source: `${SOURCE}cas-client-cartographie-si-actia-automotive/`,
  },
  {
    slug: 'ministeres',
    org: 'Ministères Territoires, Écologie, Logement',
    sector: 'Administration',
    logo: '/brand/caselogos/ministeres.svg',
    cover: '/brand/cases/ministeres.webp',
    title: 'La gouvernance du SI d’un pôle de sept ministères.',
    card: {
      figure: `1${NB}500 applications`,
      line: 'L’initiative GUSI pour cartographier le SI de façon collaborative.',
    },
    figures: [
      { value: `1${NB}500`, label: 'applications' },
      { value: `37${NB}000`, label: 'agents' },
      { value: '30', label: 'référents dans le pôle' },
    ],
    context: 'La Direction du Numérique lance la démarche GUSI après un premier inventaire incomplet et difficile à maintenir.',
    challenge: [
      { name: 'Une échelle hors norme', line: 'Sept ministères, neuf directions générales et des centaines de services territoriaux.' },
      { name: 'Un inventaire incomplet', line: 'Esquissé par des projets comme Renoir RH, mais mal outillé.' },
      { name: 'Des organisations hétérogènes', line: 'Des pratiques et des attentes différentes d’un service à l’autre.' },
    ],
    approach: [
      { name: 'Un architecte dédié', line: 'Rattaché au pilotage de la transformation numérique de la DNum.' },
      { name: 'Une preuve de concept', line: 'Puis le choix de myCarto, pour la souplesse de son méta-modèle.' },
      { name: 'Un duo d’outils', line: 'Le Wiki-SI collecte la connaissance, myCarto la met en cartes.' },
      { name: 'Des groupes de travail', line: 'Plus de 30 référents remontent les besoins et priorisent les évolutions.' },
    ],
    screen: {
      src: '/brand/cases/ministeres-domaine.webp',
      caption: 'Cartographie du domaine Logement dans myCarto.',
      width: 853,
      height: 698,
    },
    results: [
      'L’arrivée des nouveaux agents accélérée',
      'Des feuilles de route nourries par une vision globale',
      'La feuille de route numérique 2023-2025 de l’IGEDD bâtie sur la carte',
      'Le périmètre d’un appel d’offres de la DGALN délimité grâce à la carte',
    ],
    quote: {
      text: 'Nous avions besoin d’une approche très souple au regard de l’hétérogénéité des organisations, des pratiques et des attentes. La simplicité, la capacité de paramétrage et la souplesse du méta-modèle ont été déterminantes dans le choix de myCarto.',
      name: 'Pierre-Louis Chamelot',
      role: 'Conseiller en urbanisation des SI de la DNum',
    },
    second: {
      text: 'Notre approche est très simple : nous proposons un service dont chacun est à la fois acteur et bénéficiaire. Libre à chacun d’y contribuer.',
      name: 'Pierre-Louis Chamelot',
      role: 'Conseiller en urbanisation des SI de la DNum',
    },
    tip: {
      title: 'L’astuce en chemin',
      text: `Une fois par an, l’opération nettoyage d’hiver${NB}: chaque responsable d’application met ses fiches à jour.`,
    },
    source: `${SOURCE}ministeres-territoires-ecologie-logement/`,
  },
  {
    slug: 'sesan',
    org: 'SESAN',
    sector: 'eSanté',
    logo: '/brand/caselogos/sesan.webp',
    cover: '/brand/cases/sesan.webp',
    title: 'La cartographie des services numériques de la santé en Île-de-France.',
    card: {
      figure: '400 établissements',
      line: 'La gouvernance du catalogue numérique des établissements de santé franciliens.',
    },
    figures: [
      { value: '400', label: 'établissements adhérents' },
      { value: '70', label: 'applications au SESAN Store' },
      { value: '300', label: 'serveurs' },
    ],
    context: 'Le groupement régional d’appui à l’eSanté cartographie son propre SI et les services qu’il propose aux établissements de santé franciliens.',
    challenge: [
      { name: 'Une vision partagée', line: 'Un SI connu de tous et facile à actualiser.' },
      { name: 'Les bonnes pratiques ANSSI', line: 'Les appliquer, et les suivre dans la durée.' },
      { name: 'La certification des comptes', line: 'Un audit du SI avec inventaire des applications, demandé aux établissements.' },
    ],
    approach: [
      { name: 'Deux cartographies', line: 'Le SI de SESAN, et les services numériques proposés au secteur.' },
      { name: 'Sans équipe dédiée', line: 'Tous les collaborateurs contribuent à la cartographie.' },
      { name: 'Un outil unique', line: 'Les informations de tous les départements, enfin rassemblées.' },
      { name: 'Pour les adhérents', line: 'myCarto proposé en mode hébergé, sur un serveur certifié HDS.' },
    ],
    screen: {
      src: '/brand/cases/sesan-carto.webp',
      caption: 'La cartographie des services SESAN dans myCarto.',
      width: 840,
      height: 773,
    },
    results: [
      'Les 400 établissements adhérents intégrés au référentiel',
      'L’impact d’une panne ou d’une attaque identifié sur le SESAN Store',
      'Un entrant indispensable pour le plan de continuité d’activité',
      'L’obsolescence anticipée',
    ],
    quote: {
      text: 'myCarto apporte des réponses impossibles à avoir avec des outils bureautiques. Pour l’exploitation, la relation avec les adhérents et la sécurisation du SI de SESAN, c’est devenu incontournable.',
      name: 'Rémi Tilly',
      role: 'Directeur du Département Sécurité des Systèmes d’Information',
    },
    second: {
      text: 'Chez SESAN, l’ensemble des collaborateurs participe à l’élaboration de la cartographie. Nous n’avons pas d’équipe dédiée.',
      name: 'Didier Demante',
      role: 'Consultant SSI',
    },
    tip: {
      title: 'L’astuce en chemin',
      text: 'Chaque trimestre, une liste d’applications à passer en revue et à mettre à jour.',
    },
    source: `${SOURCE}sesan-esante/`,
  },
  {
    slug: 'paris-saclay',
    org: 'Université Paris-Saclay',
    sector: 'Enseignement supérieur',
    logo: '/brand/caselogos/paris-saclay.svg',
    cover: '/brand/cases/paris-saclay.webp',
    title: 'Structurer et mutualiser les services numériques de sept établissements.',
    card: {
      figure: '674 services',
      line: 'La gouvernance des services numériques d’une université aux multiples SI.',
    },
    figures: [
      { value: '674', label: 'services numériques recensés' },
      { value: '7', label: 'établissements' },
      { value: `90${NB}%`, label: 'des candidatures en Master gérées en commun' },
    ],
    context: 'Née d’un regroupement d’universités, de grandes écoles et d’organismes de recherche, l’université mutualise peu à peu des SI morcelés.',
    challenge: [
      { name: 'Un SI en spaghetti', line: 'Chaque établissement avait son SI, ses interfaces et ses redondances.' },
      { name: 'Une documentation bureautique', line: 'Excel, PowerPoint et Visio, sans mise à jour ni interopérabilité.' },
      { name: 'Le SI de scolarité à changer', line: 'Le remplacement d’APOGEE dans trois universités a lancé la démarche.' },
    ],
    approach: [
      { name: 'Le recensement', line: 'Applications, infrastructures et flux de données de chaque établissement.' },
      { name: 'Un méta-modèle en couches', line: 'Organisationnelle, fonctionnelle, applicative et infrastructure.' },
      { name: 'L’automatisation', line: 'Active Directory pour les accès, des API vers RV Tools ou Technopedia.' },
      { name: 'La saisie décentralisée', line: 'Pour une information actualisée en continu.' },
    ],
    results: [
      'Un temps très important gagné sur les projets',
      'Un arrêt de serveur annoncé avec tous les flux impactés',
      'Des droits par établissement ou en commun, selon la donnée',
      `90${NB}% des candidatures en Master gérées de manière commune`,
    ],
    quote: {
      text: 'Ce que l’on a trouvé très fort, c’est le nouveau cœur : le moteur graphique dynamique de myCarto. Il nous permet de générer en temps réel les cartes et d’avoir une excellente exploitation des données.',
      name: 'Jean-Marc Roussel',
      role: 'Enseignant-chercheur, référent cartographie de l’ENS Paris-Saclay',
    },
    second: {
      text: 'La documentation dans des fichiers bureautiques n’est pas viable. Pour y voir clair, il est impératif de mettre en place une cartographie du SI globale et centralisée !',
      name: 'Dominique Fiquet',
      role: 'Urbaniste et cartographe du système d’information',
    },
    tip: {
      title: 'L’astuce en chemin',
      text: 'Dès qu’une acquisition de données peut être automatisée, elle l’est.',
    },
    source: `${SOURCE}universite-paris-saclay/`,
  },
  {
    slug: 'nutrition-sante',
    org: 'Nutrition & Santé',
    sector: 'Agroalimentaire',
    logo: '/brand/caselogos/nutrition-sante.svg',
    title: 'L’architecture d’entreprise au service de la performance numérique.',
    card: {
      figure: `40${NB}k€ par an`,
      line: 'Des outils fragmentés devenus une architecture d’entreprise lisible.',
    },
    figures: [
      { value: '200', label: 'applications référencées' },
      { value: `40${NB}k€`, label: 'économisés chaque année' },
      { value: `1${NB}500`, label: 'collaborateurs' },
    ],
    context: 'Gerblé, Isostar, Céréal Bio… Après des rachats et un projet ERP stoppé, la DSI devait retrouver la maîtrise de son SI.',
    challenge: [
      { name: 'Des outils fragmentés', line: 'Des outils et des processus non standardisés selon les entités.' },
      { name: 'Peu de visibilité', line: 'Pas de vue d’ensemble des processus et des applications.' },
      { name: 'Des projets à rallonge', line: 'Délais et budgets dépassés, faute de connaître les processus.' },
    ],
    approach: [
      { name: 'Un architecte d’entreprise', line: 'Un rôle inédit et transverse au sein de la DSI.' },
      { name: 'Des Business Process Owners', line: 'Un réseau qui référence les processus dans chaque direction.' },
      { name: 'D’Excel à myCarto', line: 'Les deux fichiers de référence repris pour initier la base.' },
      { name: 'Un outil d’entreprise', line: 'BPO, chefs de projet, helpdesk, CTO et DSI s’en servent.' },
    ],
    screen: {
      src: '/brand/cases/excel-to-mycarto.svg',
      caption: 'Des deux référentiels Excel à une cartographie dans myCarto.',
      illustration: true,
      width: 947,
      height: 301,
    },
    results: [
      'L’impact d’un arrêt de serveur connu à l’avance',
      'L’obsolescence et le legacy mieux maîtrisés',
      `40${NB}k€ économisés chaque année sur l’infrastructure`,
      'Plus aucun projet majeur lancé sans consulter les cartes',
    ],
    quote: {
      text: 'La cartographie des processus et des applications a transformé notre manière de gérer les projets et les infrastructures, permettant des économies significatives et une meilleure gestion des risques.',
      name: 'Philippe Chiarbonello',
      role: 'Head of Urbanization & Enterprise Architecture',
    },
    tip: {
      title: 'L’astuce en chemin',
      text: 'La matinale de l’architecture : une demi-journée pour présenter les cartes et partager la feuille de route.',
    },
    source: `${SOURCE}nutrition-sante/`,
  },
]

export function findCase(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug)
}

/** The two cases shown after a case: the next ones in the list. */
export function nextCases(slug: string, count = 2): CaseStudy[] {
  const i = caseStudies.findIndex((c) => c.slug === slug)
  return Array.from({ length: count }, (_, k) => caseStudies[(i + 1 + k) % caseStudies.length])
}
