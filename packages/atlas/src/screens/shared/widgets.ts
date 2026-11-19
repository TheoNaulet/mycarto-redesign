// Les types de widgets qu'un tableau de bord peut recevoir, pour la modale d'ajout (WidgetPicker).
import type { IconName } from '../../icons/icons'

export type WidgetType = 'kpi' | 'barres' | 'anneau' | 'courbe' | 'jauge' | 'liste' | 'echeances' | 'tableau' | 'carte'
export type WidgetCategory = 'Chiffres' | 'Graphiques' | 'Listes' | 'Cartes'

export interface WidgetKind {
  type: WidgetType
  label: string
  /** Ce que montre le widget, en une phrase. */
  description: string
  /** Exemple de contenu, sous l'aperçu. */
  example: string
  category: WidgetCategory
  icon: IconName
  /** Largeur sur la grille du tableau de bord (colonnes sur 4). */
  span: 1 | 2
}

export const widgetKinds: WidgetKind[] = [
  { type: 'kpi', label: 'Chiffre clé', description: 'Un nombre, sa tendance et un lien vers la liste filtrée.', example: '65 applications · +3 ce mois', category: 'Chiffres', icon: 'star', span: 1 },
  { type: 'jauge', label: 'Jauge de qualité', description: 'Part des objets complets, avec un seuil à atteindre.', example: '82 % des fiches valides', category: 'Chiffres', icon: 'check-circle', span: 1 },
  { type: 'barres', label: 'Répartition en barres', description: 'Nombre d’objets par valeur d’un attribut.', example: 'Applications par domaine', category: 'Graphiques', icon: 'dashboard', span: 2 },
  { type: 'anneau', label: 'Anneau', description: 'Parts d’un tout, cinq valeurs au plus.', example: 'Hébergement : on-premise ou SaaS', category: 'Graphiques', icon: 'lens', span: 1 },
  { type: 'courbe', label: 'Évolution', description: 'Une valeur suivie dans le temps.', example: 'Fiches modifiées par semaine', category: 'Graphiques', icon: 'history', span: 2 },
  { type: 'liste', label: 'Points d’attention', description: 'Les objets à traiter, du plus urgent au moins urgent.', example: '6 logiciels obsolètes', category: 'Listes', icon: 'alert-triangle', span: 1 },
  { type: 'echeances', label: 'Échéances', description: 'Contrats et fins de service à venir, sur une frise.', example: 'Contrats à renouveler sous 12 mois', category: 'Listes', icon: 'calendar', span: 2 },
  { type: 'tableau', label: 'Résultat de requête', description: 'Les lignes d’une requête enregistrée, mises à jour à l’ouverture.', example: 'Applications sans composant', category: 'Listes', icon: 'list', span: 2 },
  { type: 'carte', label: 'Aperçu de carte', description: 'Une carte en miniature, qui s’ouvre au clic.', example: 'Applications et flux de Scolarité', category: 'Cartes', icon: 'map', span: 2 },
]

export const widgetCategories: WidgetCategory[] = ['Chiffres', 'Graphiques', 'Listes', 'Cartes']
