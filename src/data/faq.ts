// The 25 questions of their FAQ (my-carto.com/faq-cartographie-du-si, November 2026),
// each answer condensed to one or two sentences from their own text.

export interface FaqItem {
  q: string
  a: string
  /** Short list under the answer, ticked. */
  list?: string[]
  /** Names shown as pills (formats, standards, purchasing bodies). */
  pills?: string[]
  link?: { to: string; label: string }
}

export interface FaqTheme {
  id: string
  name: string
  icon: string
  items: FaqItem[]
}

export const faq: FaqTheme[] = [
  {
    id: 'decouvrir',
    name: 'Découvrir myCarto',
    icon: '/brand/product/concevoir.svg',
    items: [
      {
        q: 'Qu’est-ce que myCarto ?',
        a: 'Un logiciel de cartographie du SI : applications, infrastructures, données, flux et processus dans un référentiel unique et partagé, pour comprendre le SI, anticiper l’impact d’un changement et décider.',
        link: { to: '/logiciel', label: 'Découvrir le logiciel' },
      },
      {
        q: 'À qui s’adresse myCarto ?',
        a: 'Aux DSI, architectes d’entreprise, urbanistes, responsables applicatifs, équipes cybersécurité et métiers, dans les entreprises comme dans le secteur public.',
        link: { to: '/metiers', label: 'Voir par métier' },
      },
      {
        q: 'Quels sont les principaux cas d’usage de myCarto ?',
        a: 'Cartographie applicative, urbanisation, analyse d’impact, rationalisation du portefeuille, cybersécurité, PCA/PRA, schéma directeur et conformité réglementaire.',
        pills: ['RGPD', 'NIS2', 'PCA / PRA'],
      },
      {
        q: 'Pourquoi mettre en place une cartographie du SI ?',
        a: 'Parce qu’un SI se complexifie sans cesse. La cartographie rend sa connaissance claire et partagée, et devient un outil d’aide à la décision pour les projets, les risques et les audits.',
      },
      {
        q: 'Quels sont les bénéfices d’un logiciel de cartographie SI ?',
        a: 'Un référentiel fiable au lieu de fichiers Excel dispersés, des liens visibles entre applications, flux et processus, et des schémas générés automatiquement plutôt que redessinés.',
      },
    ],
  },
  {
    id: 'fonctionnalites',
    name: 'Fonctionnalités et cartographie',
    icon: '/brand/product/optimiser.svg',
    items: [
      {
        q: 'Est-ce que myCarto génère automatiquement des cartographies ?',
        a: 'Oui. Les cartes sont générées depuis le référentiel : quand une application, un flux ou un serveur change, toutes les vues concernées se mettent à jour.',
        link: { to: '/fonctionnalites#cartes', label: 'Le générateur de cartes' },
      },
      {
        q: 'Est-ce que le niveau de détail est configurable ?',
        a: 'Oui. Commencez par une vue macro, les applications principales et les flux critiques, puis descendez jusqu’aux infrastructures et aux données sans remettre en cause l’existant.',
      },
      {
        q: 'Peut-on personnaliser les modèles et les vues ?',
        a: 'Oui. Objets, relations et attributs du méta-modèle se personnalisent, et chaque public a sa vue : applicative, infrastructure, fonctionnelle ou processus.',
        link: { to: '/fonctionnalites#meta-modele', label: 'Le méta-modèle' },
      },
      {
        q: 'Comment maintenir une cartographie du SI à jour ?',
        a: 'En mettant la donnée à jour à la source, dans un référentiel unique. Imports, API et contributions des équipes alimentent toutes les vues, sans ressaisie.',
      },
    ],
  },
  {
    id: 'integration',
    name: 'Intégration et compatibilité',
    icon: '/brand/product/communiquer.svg',
    items: [
      {
        q: 'Peut-on connecter myCarto à une CMDB ou à d’autres outils ?',
        a: 'Oui, par API : CMDB, ITSM, gestion de parc et autres référentiels. Moins de double saisie, moins d’incohérences.',
        link: { to: '/fonctionnalites#interoperabilite', label: 'L’interopérabilité' },
      },
      {
        q: 'Peut-on importer des données existantes ?',
        a: 'Oui. Vos inventaires et fichiers existants servent de première base, puis le référentiel s’enrichit au fil des projets.',
      },
      {
        q: 'Quels formats d’import sont compatibles ?',
        a: 'Les formats que les organisations utilisent déjà, et le BPMN pour les processus.',
        pills: ['XLSX', 'CSV', 'XML', 'BPMN'],
      },
      {
        q: 'myCarto est-il compatible avec TOGAF, ArchiMate ou Zachman ?',
        a: 'Oui. Son méta-modèle permet de suivre ces cadres de référence tout en l’adaptant à vos pratiques.',
        pills: ['TOGAF', 'ArchiMate', 'Zachman'],
      },
      {
        q: 'myCarto est-il disponible en SaaS ou On Premise ?',
        a: 'Les deux, avec les mêmes fonctionnalités : en SaaS hébergé en zone européenne, ou On Premise sur votre infrastructure quand la souveraineté l’impose.',
      },
    ],
  },
  {
    id: 'securite',
    name: 'Sécurité et conformité',
    icon: '/brand/product/securiser.svg',
    items: [
      {
        q: 'Comment myCarto contribue-t-il à la cybersécurité ?',
        a: 'En rendant visibles les actifs, les flux et les dépendances : on repère les zones critiques, on suit la propagation d’un incident et on priorise les protections.',
        link: { to: '/ressources/cybersecurite', label: 'Lire l’article' },
      },
      {
        q: 'Comment myCarto aide-t-il à la conformité RGPD ?',
        a: 'En montrant où les données personnelles sont utilisées, stockées et échangées dans le SI, ce qui structure la documentation et facilite les audits.',
        link: { to: '/ressources/rgpd', label: 'Lire l’article' },
      },
      {
        q: 'myCarto répond-il aux enjeux NIS2 ?',
        a: 'NIS2 n’impose pas de logiciel, mais exige une cartographie à jour. myCarto vous aide à :',
        list: [
          'identifier les actifs critiques',
          'visualiser les dépendances entre applications et infrastructures',
          'documenter les composants, leur criticité et les prestataires',
          'faciliter les analyses d’impact et les audits',
        ],
        link: { to: '/ressources/nis2', label: 'NIS2 et cartographie du SI' },
      },
    ],
  },
  {
    id: 'deploiement',
    name: 'Déploiement et accompagnement',
    icon: '/brand/product/piloter.svg',
    items: [
      {
        q: 'Comment se déroule la mise en œuvre de myCarto ?',
        a: 'Après un cadrage de vos besoins, nos équipes vous accompagnent :',
        list: [
          'installation ou ouverture de l’environnement',
          'initialisation du référentiel et import de vos données',
          'formation et recommandations méthodologiques',
        ],
        link: { to: '/integration', label: 'La méthode d’intégration' },
      },
      {
        q: 'Combien de temps faut-il pour déployer myCarto ?',
        a: 'Cela dépend du périmètre et des données disponibles, mais une première plateforme opérationnelle se met généralement en place en quelques semaines.',
      },
      {
        q: 'Faut-il former tous les utilisateurs ?',
        a: 'Non. Ceux qui consultent les cartes prennent l’outil en main seuls. Ceux qui enrichissent le référentiel suivent des sessions courtes, en groupe, de quelques heures.',
      },
    ],
  },
  {
    id: 'tarifs',
    name: 'Tarifs et offres',
    icon: '/brand/product/auditer.svg',
    items: [
      {
        q: 'Quel est le tarif de myCarto ?',
        a: 'Il dépend du nombre et du profil des utilisateurs, de la formule et du mode de déploiement, sans limite d’applications ni d’objets. Support, mises à jour et club utilisateurs sont inclus ; le prix se fait sur devis.',
        link: { to: '/tarifs', label: 'Voir les tarifs' },
      },
      {
        q: 'Quelles sont les différences entre les offres Starter, Advanced et Premium ?',
        a: 'Chaque formule reprend la précédente :',
        list: [
          'Starter : les fonctionnalités essentielles, toutes les couches du SI, en SaaS uniquement',
          'Advanced : méta-modèle libre, environnement de test, On Premise, hors ligne, couche stratégique',
          'Premium : BPMN, API REST, planification de tâches, groupes propriétaires, recette dédiée',
        ],
      },
      {
        q: 'myCarto est-il disponible via les centrales d’achat publiques ?',
        a: 'Oui, ce qui simplifie l’achat pour les collectivités, les établissements publics et les organismes de santé.',
        pills: ['UGAP', 'CANUT', 'RESAH', 'CAIH', 'GCNL'],
      },
      {
        q: 'Quelle est la différence entre myCarto et Solu-QIQ ?',
        a: 'Solu-QIQ est la solution historique d’AB+ Software. myCarto en est la refonte complète, avec un méta-modèle plus souple et un moteur graphique repensé.',
        link: { to: '/solu-qiq', label: 'Solu-QIQ devient myCarto' },
      },
      {
        q: 'Comment demander une démonstration ?',
        a: 'Remplissez le formulaire. Un membre de l’équipe vous rappelle pour comprendre votre contexte, puis un expert vous montre myCarto sur vos cas d’usage.',
        link: { to: '/demo', label: 'Demander une démo' },
      },
    ],
  },
]
