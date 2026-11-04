// One source for the header menus, the footer columns and the site map.

export interface NavItem {
  label: string
  line: string
  /** Internal route, or an absolute URL for the few pages that stay on their side. */
  to: string
  icon: string
  external?: boolean
}

export interface NavGroup {
  id: string
  label: string
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    id: 'produit',
    label: 'Produit',
    items: [
      { label: 'myCarto', line: 'Le logiciel de cartographie du SI', to: '/logiciel', icon: 'default' },
      { label: 'Fonctionnalités', line: 'Les 5 fonctionnalités clés', to: '/fonctionnalites', icon: 'fonctionnalites' },
      { label: 'Intégration', line: 'Une méthode éprouvée pour déployer', to: '/integration', icon: 'integration' },
      { label: 'Tarifs', line: 'Une offre selon votre maturité', to: '/tarifs', icon: 'tarifs' },
      { label: 'Solu-QIQ', line: 'Notre ancienne solution, devenue myCarto', to: '/solu-qiq', icon: 'solu-qiq' },
    ],
  },
  {
    id: 'pour-qui',
    label: 'Pour qui ?',
    items: [
      { label: 'Votre métier', line: 'DSI, architecte, RSSI, DPO…', to: '/metiers', icon: 'metier' },
      { label: 'Votre secteur', line: 'Santé, industrie, BTP, public…', to: '/secteurs', icon: 'secteur' },
      { label: 'Notre méthode', line: 'Réussir sa démarche de cartographie', to: '/methode', icon: 'methode' },
    ],
  },
  {
    id: 'clients',
    label: 'Clients',
    items: [
      { label: 'Nos clients', line: 'Plus de 200 organisations, dix cas clients', to: '/clients', icon: 'clients' },
      { label: 'Club utilisateurs', line: 'Trois rencontres par an entre clients', to: '/club-utilisateurs', icon: 'club' },
      {
        label: 'Espace client',
        line: 'Vos ressources et services dédiés',
        to: 'https://client.abplussoftware.fr/login',
        icon: 'temoignages',
        external: true,
      },
    ],
  },
  {
    id: 'ressources',
    label: 'Ressources',
    items: [
      { label: 'Articles et guides', line: 'Méthode, réglementation, retours terrain', to: '/ressources', icon: 'articles' },
      { label: 'Événements', line: 'Webinaires, club, journées thématiques', to: '/evenements', icon: 'evenements' },
      { label: 'FAQ', line: 'Les questions qu’on nous pose le plus', to: '/faq', icon: 'faq' },
    ],
  },
]

/** Company pages: a direct header link for the first, the rest in the footer. */
export const companyLinks = [
  { label: 'À propos', to: '/a-propos' },
  { label: 'Recrutement', to: '/recrutement' },
  { label: 'Contact commercial', to: '/contact' },
  { label: 'Demander une démo', to: '/demo' },
]

export const legalLinks = [
  { label: 'Mentions légales', to: '/mentions-legales' },
  { label: 'Politique RGPD', to: '/confidentialite' },
  { label: 'Plan du site', to: '/plan-du-site' },
]
