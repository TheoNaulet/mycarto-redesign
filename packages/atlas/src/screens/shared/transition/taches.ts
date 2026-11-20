// « Comment faire… » : les tâches courantes de chaque écran, en visite pas à pas.
// Chaque étape peut éclairer un élément de la page : un sélecteur CSS, ou « text=Libellé » pour un bouton ou un lien
// qui contient ce texte (plus robuste qu'une classe quand le bouton n'en a pas de propre).

export interface Etape {
  texte: string
  /** Ce qu'on faisait avant, pour cette étape (facultatif). */
  avant?: string
  montrer?: string
}

export interface Tache {
  question: string
  etapes: Etape[]
}

const chercher: Tache = {
  question: 'Chercher une application, un flux, une machine…',
  etapes: [
    { texte: 'Cliquez sur « Rechercher », ou tapez ⌘K (Ctrl+K sur Windows) depuis n’importe quel écran.', avant: '« Rechercher une carte » ne trouvait que des cartes.', montrer: '.mc-appbar .mc-kbd' },
    { texte: 'Tapez quelques lettres : applications, flux, machines et cartes sortent ensemble. Entrée ouvre le premier résultat.' },
  ],
}

const remonter: Tache = {
  question: 'Revenir à la carte précédente',
  etapes: [
    { texte: 'Le fil d’Ariane, en haut, montre le chemin parcouru depuis l’accueil.', avant: 'Seule l’icône maison ramenait… tout au début.', montrer: '.mc-trail' },
    { texte: 'Cliquez sur n’importe quelle étape pour y revenir directement.', montrer: '.mc-trail' },
  ],
}

const carte: Tache[] = [
  {
    question: 'Voir les flux d’une application',
    etapes: [
      { texte: 'Cliquez sur une application de la carte, par exemple APOGEE.', avant: 'Il fallait suivre les liens gris à l’œil, en zoomant.', montrer: '.mc-node.is-selected, .mc-node' },
      { texte: 'Ses flux restent en couleur ; tout le reste s’estompe.' },
      { texte: 'Son détail s’affiche à droite, sans quitter la carte. Échap pour tout désélectionner.', montrer: '.mc-insp' },
    ],
  },
  {
    question: 'Colorer la carte selon l’obsolescence',
    etapes: [
      { texte: 'Ouvrez « Lentille » dans la barre d’outils, en bas.', avant: 'Des bordures rouges ou vertes, expliquées nulle part.', montrer: '.mc-lens-picker' },
      { texte: 'Choisissez « Obsolescence » : chaque objet prend la couleur de son état.', montrer: '.mc-lens-picker' },
      { texte: 'La légende s’ouvre avec la lentille. Le bouton Légende la referme.', montrer: '[aria-label="Légende"]' },
    ],
  },
  {
    question: 'Ouvrir la fiche d’une application',
    etapes: [
      { texte: 'Sélectionnez l’application d’un clic.', montrer: '.mc-node' },
      { texte: 'Dans l’inspecteur, cliquez sur « Ouvrir la fiche ». Un double-clic sur l’application fait pareil.', avant: '« Carte Principale » dans les onglets.', montrer: 'text=Ouvrir la fiche' },
    ],
  },
  {
    question: 'Laisser un commentaire à un collègue',
    etapes: [
      { texte: 'Cliquez sur l’outil Post-it de la barre d’outils (ou touche S).', avant: 'Ça n’existait pas : on passait par un mail.', montrer: '[aria-label="Post-it"]' },
      { texte: 'Cliquez sur la carte pour le poser, puis écrivez. Il reste épinglé à l’objet le plus proche.' },
    ],
  },
  {
    question: 'Exporter la carte',
    etapes: [{ texte: 'Bouton « Exporter » en haut à droite : PDF, image, ou la liste des objets.', avant: 'Même bouton, au même endroit.', montrer: 'text=Exporter' }],
  },
  remonter,
]

export const tachesPages: Record<string, Tache[]> = {
  '/': [
    {
      question: 'Voir ce qui demande mon attention',
      etapes: [
        { texte: 'La colonne « À traiter » liste ce qui ne va pas : applications non valides, contrats expirés, logiciels obsolètes.', avant: 'Il fallait ouvrir chaque carte pour le découvrir.', montrer: 'text=Contrats expirés' },
        { texte: 'Cliquez sur une ligne pour ouvrir la liste correspondante.', montrer: 'text=Contrats expirés' },
      ],
    },
    {
      question: 'Ouvrir la carte des domaines',
      etapes: [
        { texte: 'Repérez la couche fonctionnelle : les couches sont dans le même ordre qu’avant.', montrer: '.mc-lstack' },
        { texte: 'Cliquez sur « Domaines ». Le nombre de cartes associées est écrit sous la case : plus de menu caché.', avant: 'Le menu « Cartes et documents associés » n’apparaissait qu’au survol.', montrer: 'text=Domaines' },
      ],
    },
    {
      question: 'Trouver une application par son nom',
      etapes: [{ texte: 'Tapez son nom dans la grande recherche. Les suggestions dessous sont vos derniers objets consultés.', avant: '« Rechercher une carte », en haut à droite.', montrer: '.mc-hsearch' }],
    },
    chercher,
  ],
  '/carte': carte,
  '/infrastructure': [
    {
      question: 'Repérer les logiciels qui ne sont plus supportés',
      etapes: [
        { texte: 'La lentille Obsolescence est allumée d’entrée sur cet écran.', avant: 'Des dates en rouge ou en orange sous chaque logiciel, sans explication.', montrer: '.mc-lens-picker' },
        { texte: 'La légende dit ce que veut dire chaque couleur : dépassé, bientôt, à jour.', montrer: '[aria-label="Légende"]' },
      ],
    },
    {
      question: 'Voir ce qu’une machine héberge',
      etapes: [
        { texte: 'Cliquez sur une machine, par exemple sophocle.', avant: 'Un clic ouvrait la carte d’impact.', montrer: '.mc-node.is-selected, .mc-node' },
        { texte: 'Ses composants, son système et ses dates de support s’affichent à droite.', montrer: '.mc-insp' },
      ],
    },
    carte[5]!,
  ],
  '/pos': [
    {
      question: 'Repérer les trous du SI',
      etapes: [
        { texte: 'La lentille « Couverture applicative » teinte chaque îlot selon son nombre d’applications.', avant: 'Îlots blancs ou grisés, et un bord rouge jamais expliqué.', montrer: '.mc-lens-picker' },
        { texte: 'Les îlots les plus clairs n’ont aucune application : ce sont les trous du SI.' },
      ],
    },
    {
      question: 'Voir les applications d’un îlot',
      etapes: [
        { texte: 'Cliquez sur un îlot de la carte.', avant: 'Il fallait ouvrir une autre carte, « Les applications de… ».' },
        { texte: 'Ses applications s’affichent à droite, chacune vers sa fiche.', montrer: '.mc-insp' },
      ],
    },
    carte[5]!,
  ],
  '/contrats': [
    {
      question: 'Voir les contrats qui expirent bientôt',
      etapes: [
        { texte: 'Les contrats sont rangés par échéance, du plus urgent au plus sûr.', avant: 'Une grille dont seule la couleur de fond portait l’échéance.' },
        { texte: 'La lentille « Échéance des contrats » et sa légende disent ce que veut dire chaque couleur.', avant: 'Légende en « [Référence Contrat.Value] ».', montrer: '.mc-lens-picker' },
      ],
    },
    carte[4]!,
    carte[5]!,
  ],
  '/impact': [
    {
      question: 'Simuler l’arrêt d’une machine',
      etapes: [
        { texte: 'Le panneau de droite règle la simulation : profondeur et types de flux suivis.', avant: 'Une carte figée, sans réglage.', montrer: '.mc-insp' },
        { texte: 'Les applications touchées se colorent niveau par niveau, de gauche à droite.', montrer: '.mc-lens-picker' },
      ],
    },
    carte[5]!,
  ],
  '/fiche': [
    {
      question: 'Voir ce qui ne va pas sur cette application',
      etapes: [
        { texte: 'Le bloc « Points d’attention » rassemble les alertes : logiciel plus supporté, contrat expiré, champ manquant.', avant: 'Un badge rose « Obsolescence infrastructure », sans détail.', montrer: "text=Points d'attention" },
      ],
    },
    {
      question: 'Voir les flux ou l’infrastructure de l’application',
      etapes: [
        { texte: 'Utilisez les onglets sous le nom : Flux, Infrastructure, POS, Historique.', avant: 'Onglets Carte flux, Carte infra, Carte POS.', montrer: '.mc-tabs' },
        { texte: 'Ou cliquez sur une des vignettes du bloc « Cartes ».', montrer: 'text=Flux de APOGEE' },
      ],
    },
    {
      question: 'Modifier une information',
      etapes: [{ texte: 'Bouton « Modifier » : le formulaire s’ouvre sur place.', avant: '« Modifier » ouvrait le back-office dans un autre onglet.', montrer: 'text=Modifier' }],
    },
    remonter,
  ],
  '/explorateur': [
    {
      question: 'Filtrer la liste',
      etapes: [
        { texte: 'Cliquez sur « Filtrer » au-dessus du tableau.', avant: 'Une icône d’entonnoir parmi dix autres, sans libellé.', montrer: 'text=Filtrer' },
        { texte: 'Choisissez un filtre de départ (non valides, obsolètes…), ou cliquez sur un en-tête de colonne pour trier.', montrer: '.mc-table-wrap thead' },
      ],
    },
    {
      question: 'Modifier plusieurs objets d’un coup',
      etapes: [
        { texte: 'Cochez les lignes voulues, ou tout d’un coup avec la case de l’en-tête.', avant: 'Crayon et poubelle, une ligne à la fois.', montrer: '[aria-label="Tout sélectionner"]' },
        { texte: 'Une barre d’actions apparaît en bas : modifier, voir sur une carte, exporter, supprimer.' },
      ],
    },
    {
      question: 'Choisir les colonnes affichées',
      etapes: [{ texte: 'Bouton « Colonnes », à droite au-dessus du tableau. Le nom reste toujours affiché.', montrer: 'text=Colonnes' }],
    },
    {
      question: 'Passer à un autre type d’objet',
      etapes: [{ texte: 'L’arbre à gauche range les types par couche, avec leur nombre. Tapez pour filtrer.', avant: 'Onglets Objets / Typologies.', montrer: '.mc-tree, .mc-side' }],
    },
  ],
}

/** Tâches d'un écran : les siennes, sinon les deux communes à tous les écrans. */
export function tachesFor(key: string): Tache[] {
  return tachesPages[key] ?? [chercher, remonter]
}

/** Trouve l'élément à éclairer : sélecteur CSS (liste « a, b » : le premier visible), ou « text=… ». */
export function findTarget(sel?: string): HTMLElement | null {
  if (!sel) return null
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.height > 0 && !el.closest('.mc-tg')
  }
  if (sel.startsWith('text=')) {
    const label = sel.slice(5).replace(/'/g, '’').toLowerCase()
    const norm = (s: string) => s.replace(/'/g, '’').toLowerCase()
    const cands = [...document.querySelectorAll<HTMLElement>('button, a, [role="button"], [role="tab"], h2, h3, li')]
    // Le plus petit élément visible qui contient le texte : le bouton plutôt que sa barre.
    return cands.filter((el) => visible(el) && norm(el.textContent ?? '').includes(label))
      .sort((a, b) => (a.textContent?.length ?? 0) - (b.textContent?.length ?? 0))[0] ?? null
  }
  for (const s of sel.split(',')) {
    const el = [...document.querySelectorAll<HTMLElement>(s.trim())].find(visible)
    if (el) return el
  }
  return null
}
