// Guide de transition : pour chaque écran, ce qu'il était dans l'ancienne interface et où sont passées les choses.
// Le guide vit en bas à gauche de l'application (TransitionGuide.vue). Les vignettes « avant » sont recadrées
// depuis les captures de la démo du 07/07/2026 (~/Desktop/my-carto), sans la fenêtre Teams.

export interface TransitionTip {
  /** Ce que l'utilisateur faisait avant (ou ce qu'il voyait). */
  avant: string
  /** Comment on le fait maintenant. */
  maintenant: string
  /** Sélecteur CSS de l'élément à montrer à l'écran (clignote quand on clique « Montrer »). */
  montrer?: string
}

export interface TransitionPage {
  /** Nom de l'écran tel que l'utilisateur le connaît. */
  ecran: string
  /** Où il était avant. */
  ancien: string
  /** Vignette de l'ancien écran (nom du fichier dans ./avant). */
  capture?: string
  /** En une phrase : ce qui change. */
  resume: string
  tips: TransitionTip[]
}

const TRAIL = '.mc-trail'
const SEARCH = '.mc-appbar .mc-kbd'
const TOOLBAR = '.mc-toolbar'
const LENS = '.mc-lens-picker'
const MINIMAP = '.mc-minimap'
const INSPECTOR = '.mc-insp'
const TABS = '.mc-tabs'

/** Conseils communs à tous les écrans de carte. */
const carte: TransitionTip[] = [
  { avant: 'Rail de boutons vertical en bas à droite (légende, recentrer, zoom)', maintenant: 'Une barre d’outils en bas au centre, avec des libellés et des raccourcis', montrer: TOOLBAR },
  { avant: 'Légende fermée : bordures rouges ou vertes jamais expliquées', maintenant: 'Une lentille choisit ce que la couleur raconte, et sa légende s’ouvre avec elle', montrer: LENS },
  { avant: 'Un clic sur un objet ouvrait une autre carte', maintenant: 'Un clic l’affiche dans l’inspecteur à droite ; double-clic pour l’ouvrir', montrer: INSPECTOR },
]

/** Conseils communs à toutes les pages du visualiseur. */
const reperes: TransitionTip[] = [
  { avant: 'Seule l’icône maison permettait de remonter', maintenant: 'Le fil d’Ariane montre où vous êtes et ramène à chaque étape', montrer: TRAIL },
  { avant: '« Rechercher une carte » en haut à droite', maintenant: 'Une seule recherche, pour tout : ⌘K (Ctrl+K sur Windows)', montrer: SEARCH },
]

export const transitionPages: Record<string, TransitionPage> = {
  '/': {
    ecran: 'Accueil',
    ancien: 'Visualiseur · Accueil',
    capture: '7694',
    resume: 'Les mêmes 4 couches, dans le même ordre, mais chaque case dit maintenant combien elle contient et ce qui demande votre attention.',
    tips: [
      { avant: 'Une tuile avec un picto, sans chiffre', maintenant: 'Chaque case affiche son total et ses alertes (non valides, expirés, obsolètes)', montrer: '.mc-lstack' },
      { avant: 'Le menu « Cartes et documents associés » n’apparaissait qu’au survol', maintenant: 'Le nombre de cartes est écrit sous chaque case : plus rien de caché', montrer: '.mc-lstack' },
      { avant: 'Rien n’indiquait par où commencer', maintenant: '« À traiter » et « Récemment consultées » à droite' },
      reperes[1]!,
    ],
  },
  '/carte': {
    ecran: 'Applications et flux',
    ancien: 'Visualiseur · Les applications et flux de SCOLARITE',
    capture: '7699',
    resume: 'La même carte de flux, lisible sans zoomer : les flux d’un objet s’isolent au clic, le reste s’efface.',
    tips: [...carte, reperes[0]!, { avant: 'Minimap en bas à gauche', maintenant: 'Toujours là, repliable, avec le nombre d’objets et le zoom', montrer: MINIMAP }],
  },
  '/fiche': {
    ecran: 'Fiche application',
    ancien: 'Visualiseur · Fiche de APOGEE (rendue comme une carte)',
    capture: '7701',
    resume: 'La fiche n’est plus une carte à zoomer mais une vraie page, qui se lit et se défile comme un document.',
    tips: [
      { avant: 'Onglets Carte Principale, Carte flux, Carte infra, Carte POS', maintenant: 'Onglets Fiche, Flux, Infrastructure, POS et Historique', montrer: TABS },
      { avant: 'Pastilles D I C P sans légende', maintenant: 'Sécurité DICP écrite en clair, niveau par niveau' },
      { avant: '« Modifier » ouvrait le back-office dans un autre onglet', maintenant: 'Modifier ouvre le formulaire sur place' },
      reperes[0]!,
    ],
  },
  '/infrastructure': {
    ecran: 'Machines nécessaires',
    ancien: 'Visualiseur · Les machines nécessaires à APOGEE',
    capture: '7702',
    resume: 'Même lecture environnement → composant → machine, avec la lentille Obsolescence allumée d’entrée.',
    tips: [
      { avant: 'Dates de fin de support en rouge ou orange, sans explication', maintenant: 'Lentille Obsolescence : statut écrit, couleur et légende', montrer: LENS },
      ...carte.slice(0, 1),
      reperes[0]!,
    ],
  },
  '/impact': {
    ecran: 'Impact d’un arrêt',
    ancien: 'Visualiseur · L’impact applicatif d’un arrêt de sophocle',
    capture: '7704',
    resume: 'On ne regarde plus seulement l’impact : on le simule, niveau par niveau, et les liens ne se croisent plus.',
    tips: [
      { avant: 'Une carte figée de gauche à droite', maintenant: 'Un panneau de simulation à droite : profondeur et types de flux', montrer: INSPECTOR },
      ...carte.slice(0, 2),
    ],
  },
  '/pos': {
    ecran: 'POS complet',
    ancien: 'Visualiseur · POS Complet',
    capture: '7705',
    resume: 'Le plan d’occupation des sols garde ses zones, mais les îlots vides (les trous du SI) sautent aux yeux.',
    tips: [
      { avant: 'Îlot blanc ou grisé, bord rouge inexpliqué', maintenant: 'Lentille « Couverture applicative » : teinte selon le nombre d’applications', montrer: LENS },
      ...carte.slice(0, 1),
      { avant: 'Minimap couleur lavande', maintenant: 'Minimap repliable, aux couleurs des zones', montrer: MINIMAP },
    ],
  },
  '/glossaire': {
    ecran: 'Glossaire des applications',
    ancien: 'Visualiseur · Glossaire des applications',
    capture: '7709',
    resume: 'Les mêmes tuiles lettre, avec une recherche et les applications listées sans changer de page.',
    tips: [
      { avant: '« 1 Applications », « 0 Application »', maintenant: 'Accords corrigés partout' },
      { avant: 'Clic sur une lettre : une nouvelle carte', maintenant: 'Clic : la liste s’ouvre sur place ; clic sur une application : son résumé à droite' },
      reperes[1]!,
    ],
  },
  '/fournisseurs': {
    ecran: 'Fournisseurs',
    ancien: 'Visualiseur · Liste des fournisseurs',
    capture: '7710',
    resume: 'La grille de cartes devient un tableau triable : on compare les fournisseurs au lieu de les chercher.',
    tips: [
      { avant: '27 cartes en grille, sans ordre', maintenant: 'Un tableau qu’on trie par nombre d’applications ou de contrats', montrer: '.mc-table-wrap' },
      { avant: 'Clic : une nouvelle carte', maintenant: 'Clic : le détail à droite, sans quitter la liste', montrer: INSPECTOR },
      reperes[0]!,
    ],
  },
  '/contrats': {
    ecran: 'Contrats',
    ancien: 'Visualiseur · Les contrats',
    capture: '7711',
    resume: 'Les contrats sont rangés par échéance, du plus urgent au plus sûr, et l’échéance est écrite, plus seulement colorée.',
    tips: [
      { avant: 'Le fond coloré portait l’échéance ; légende en « [Référence Contrat.Value] »', maintenant: 'Lentille « Échéance des contrats » avec une vraie légende', montrer: LENS },
      { avant: 'Couleur seule (illisible pour un daltonien)', maintenant: 'Couleur + texte + icône, toujours' },
      ...carte.slice(0, 1),
    ],
  },
  '/sites': {
    ecran: 'Sites',
    ancien: 'Visualiseur · Les sites géographiques',
    capture: '7713',
    resume: 'Les sites, avec ce qu’ils hébergent, sans avoir à ouvrir une carte par ville.',
    tips: [reperes[0]!, reperes[1]!],
  },
  '/machines': {
    ecran: 'Machines',
    ancien: 'Visualiseur · Les machines situées à Paris',
    capture: '7714',
    resume: 'Un tableau de toutes les machines : plus de machine affichée deux fois, dans le rack et hors du rack.',
    tips: [
      { avant: 'Machines dans un conteneur Rack, parfois en double', maintenant: 'Une ligne par machine, filtrable par site, rack ou cluster', montrer: '.mc-table-wrap' },
      { avant: 'Clic : la carte d’impact', maintenant: 'Clic : le détail à droite, l’impact à un clic de plus', montrer: INSPECTOR },
    ],
  },
  '/logiciels': {
    ecran: 'Logiciels',
    ancien: 'Visualiseur · L’obsolescence',
    capture: '7715',
    resume: 'Les trois groupes (non obsolète, en voie, obsolète) deviennent un tableau trié par urgence.',
    tips: [
      { avant: 'Sablier vert, orange ou rouge', maintenant: 'Statut écrit en toutes lettres, avec la date de fin de support', montrer: '.mc-table-wrap' },
      { avant: 'Clic : un arbre en étoile', maintenant: 'Clic : les déploiements à droite', montrer: INSPECTOR },
    ],
  },
  '/organigramme': {
    ecran: 'Organigramme',
    ancien: 'Visualiseur · L’organigramme',
    capture: '7717',
    resume: 'Le même découpage directions → services, lisible au zoom par défaut.',
    tips: [...carte.slice(0, 1), carte[2]!, reperes[0]!],
  },
  '/processus': {
    ecran: 'Processus',
    ancien: 'Visualiseur · Les Macro Processus et Processus',
    capture: '7719',
    resume: 'Macro-processus et processus gardent leur codification (M, P, S) et leur couleur.',
    tips: [...carte.slice(0, 1), carte[2]!, reperes[0]!],
  },
  '/diagrammes': {
    ecran: 'Diagrammes BPMN',
    ancien: 'Back-office · Diagrammes BPMN',
    capture: '7720',
    resume: 'Les diagrammes BPMN sont listés dans un tableau, chacun s’ouvre en plein écran.',
    tips: [{ avant: 'Menu latéral bleu vif', maintenant: 'Même menu, mêmes rubriques, aux couleurs de myCarto', montrer: '.mc-side' }],
  },
  '/tableau-de-bord': {
    ecran: 'Tableau de bord',
    ancien: 'Back-office · Dashboard',
    capture: '7721',
    resume: 'Les mêmes indicateurs, avec des couleurs stables : « Forte » a la même couleur dans tous les graphiques.',
    tips: [
      { avant: 'Vert et rouge purs (#00FF00, #FF0000)', maintenant: 'Une palette sobre, une couleur par niveau, partout' },
      { avant: 'Couleurs DICP qui changent d’un camembert à l’autre', maintenant: 'Même niveau, même couleur, dans tout le logiciel' },
    ],
  },
  '/explorateur': {
    ecran: 'Explorateur',
    ancien: 'Back-office · Explorateur',
    capture: '7723',
    resume: 'Le même tableau d’objets, avec des boutons qui disent ce qu’ils font.',
    tips: [
      { avant: 'Une dizaine d’icônes sans libellé au-dessus du tableau', maintenant: 'Filtrer, Colonnes, Importer : écrits en toutes lettres' },
      { avant: 'Crayon et poubelle sur chaque ligne', maintenant: 'Clic sur la ligne : détail à droite ; cases à cocher pour agir sur plusieurs', montrer: '.mc-table-wrap' },
      { avant: 'Onglets Objets / Typologies', maintenant: 'Un arbre des types rangé par couche, avec un filtre', montrer: '.mc-tree' },
    ],
  },
  '/editeur': {
    ecran: 'Éditeur de carte',
    ancien: 'Back-office · Cartes',
    capture: '7727',
    resume: 'On modifie la carte telle qu’on la verra, en brouillon, et chaque action s’annule.',
    tips: [
      { avant: 'Barre d’icônes sans libellé', maintenant: 'Barre d’édition en bas, avec libellés' },
      { avant: 'Pas de retour arrière', maintenant: '⌘Z annule ; le brouillon s’enregistre seul, rien n’est publié sans vous' },
    ],
  },
  '/dictionnaires': {
    ecran: 'Dictionnaires',
    ancien: 'Back-office · Dictionnaires',
    capture: '7730',
    resume: 'Les mêmes listes de valeurs, avec l’endroit où chaque valeur est utilisée.',
    tips: [{ avant: 'Menu latéral bleu vif', maintenant: 'Même menu, mêmes rubriques, aux couleurs de myCarto', montrer: '.mc-side' }],
  },
}

/** Écran qui n'existait pas, ou qui n'a pas été vu dans la démo. */
export function transitionFor(path: string, title: string): TransitionPage {
  const key = path.startsWith('/fiche/') ? '/fiche' : path
  return (
    transitionPages[key] ?? {
      ecran: title,
      ancien: 'Nouvel écran',
      resume: 'Cet écran est nouveau ou regroupe des pages qui étaient dispersées. Les repères restent les mêmes partout.',
      tips: [reperes[0]!, reperes[1]!],
    }
  )
}

/** Images des anciens écrans, chargées par Vite. */
const images = import.meta.glob<string>('./avant/*.jpg', { eager: true, import: 'default' })
export const captureUrl = (id?: string) => (id ? images[`./avant/${id}.jpg`] : undefined)
