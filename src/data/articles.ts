// Generated from my-carto.com (November 2026): the 13 posts of their blog, bodies in ./articles/<slug>.json.

export type Topic = 'cyber' | 'urba' | 'terrain'

export const topics: { id: Topic; label: string }[] = [
  { id: 'cyber', label: 'Cybersécurité et conformité' },
  { id: 'urba', label: 'Urbanisation et méthode' },
  { id: 'terrain', label: 'Retours d’expérience' },
]

export interface Article {
  slug: string
  title: string
  excerpt: string
  topic: Topic
  date: string
  minutes: number
  /** The original post on my-carto.com. */
  href: string
}

export const articles: Article[] = [
  {
    slug: 'dette-technique',
    title: 'Dette technique : la piloter grâce à la cartographie du SI',
    excerpt: 'La visualiser, la prioriser, la réduire.',
    topic: 'urba',
    date: '2026-08-25',
    minutes: 6,
    href: 'https://my-carto.com/blog/dette-technique-cartographie-si/',
  },
  {
    slug: 'mapping-it',
    title: 'Mapping IT : définition et lien avec la cartographie SI',
    excerpt: 'Deux termes, une même démarche.',
    topic: 'urba',
    date: '2026-07-23',
    minutes: 7,
    href: 'https://my-carto.com/blog/ressources-mapping-it-definition/',
  },
  {
    slug: 'pos',
    title: 'Plan d’Occupation des Sols (POS) : urbanisation du SI',
    excerpt: 'Définition, méthode de construction et exemples.',
    topic: 'urba',
    date: '2026-07-16',
    minutes: 8,
    href: 'https://my-carto.com/blog/plan-occupation-sols-urbanisation-si/',
  },
  {
    slug: 'applicative',
    title: 'Cartographie applicative : méthode et exemples',
    excerpt: 'Une méthode en 6 étapes et un exemple concret.',
    topic: 'urba',
    date: '2026-03-20',
    minutes: 8,
    href: 'https://my-carto.com/blog/cartographie-applicative/',
  },
  {
    slug: 'anssi',
    title: 'Cartographie ANSSI : sécurisez votre SI efficacement',
    excerpt: 'Les recommandations de l’ANSSI, appliquées.',
    topic: 'cyber',
    date: '2026-02-04',
    minutes: 6,
    href: 'https://my-carto.com/blog/cartographie-anssi-cybersecurite/',
  },
  {
    slug: 'risques',
    title: 'Cartographie des risques IT : définition, enjeux et outils',
    excerpt: 'Anticiper les menaces avec une analyse claire.',
    topic: 'cyber',
    date: '2026-02-02',
    minutes: 5,
    href: 'https://my-carto.com/blog/cartographie-risques-it/',
  },
  {
    slug: 'nis2',
    title: 'NIS2 : garantir sa conformité avec la cartographie du SI',
    excerpt: 'Pourquoi la cartographie du SI est clé pour la conformité NIS2.',
    topic: 'cyber',
    date: '2025-12-02',
    minutes: 9,
    href: 'https://my-carto.com/blog/directive-nis2-cartographie-si-conformite/',
  },
  {
    slug: 'processus',
    title: 'Cartographie des processus : définition, exemples et guide',
    excerpt: 'Du BPMN au SI : qui fait quoi, quand et avec quoi.',
    topic: 'urba',
    date: '2025-10-22',
    minutes: 5,
    href: 'https://my-carto.com/blog/cartographie-des-processus/',
  },
  {
    slug: 'architecture-cyber',
    title: 'Cartographie et architecture : le socle de la cybersécurité',
    excerpt: 'Connaître son SI pour mieux le défendre.',
    topic: 'cyber',
    date: '2025-07-25',
    minutes: 11,
    href: 'https://my-carto.com/blog/architecture-dentreprise-et-cartographie-du-si-des-maillons-cles-de-la-strategie-de-cybersecurite/',
  },
  {
    slug: 'cybersecurite',
    title: 'Pourquoi la cartographie du SI renforce la cybersécurité',
    excerpt: 'Voir ses dépendances pour réduire son exposition.',
    topic: 'cyber',
    date: '2025-05-18',
    minutes: 9,
    href: 'https://my-carto.com/blog/pourquoi-la-cartographie-du-si-renforce-la-cybersecurite/',
  },
  {
    slug: 'rgpd',
    title: 'Cartographie du SI et RGPD : de l’inventaire à l’audit',
    excerpt: 'Les traitements de données, reliés au SI réel.',
    topic: 'cyber',
    date: '2024-07-31',
    minutes: 8,
    href: 'https://my-carto.com/blog/cartographie-du-si-et-rgpd-de-linventaire-a-laudit/',
  },
  {
    slug: 'complexite',
    title: 'Complexité de l’infrastructure IT : réduire et simplifier votre SI',
    excerpt: 'Moins de complexité, plus d’efficacité.',
    topic: 'urba',
    date: '2024-07-31',
    minutes: 7,
    href: 'https://my-carto.com/blog/gerer-la-complexite-du-systeme-dinformation-avec-une-cartographie-du-si/',
  },
  {
    slug: 'strasbourg',
    title: 'Strasbourg : cartographie du SI et PPM pour la gouvernance',
    excerpt: 'L’Eurométropole relie cartographie et portefeuille de projets.',
    topic: 'terrain',
    date: '2024-03-20',
    minutes: 1,
    href: 'https://my-carto.com/blog/strasbourg-cartographie-du-si-et-ppm-pour-la-gouvernance/',
  },
]

export type Block =
  | { type: 'p' | 'h2' | 'h3'; text: string }
  | { type: 'ul' | 'ol'; items: string[] }
  | { type: 'link'; text: string; href: string }

const bodies = import.meta.glob<Block[]>('./articles/*.json', { import: 'default' })

/** Loads one article body on demand, so the list page does not ship 13 articles. */
export function loadBody(slug: string): Promise<Block[]> | undefined {
  return bodies[`./articles/${slug}.json`]?.()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
