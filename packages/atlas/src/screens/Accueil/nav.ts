// Navigation entre les écrans (stories Storybook) et contenu de la recherche ⌘K, partagés par l'Accueil et la Fiche.
import { goFiche, goPath, hrefFor, navigateInApp } from '../bridge'
import type { PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import { applications, contractsOfSupplier, domainCount, getApplication, type Application } from '../../data/applications'

/** « de » élidé devant une voyelle ou un h muet : de('Antoine Ramo') → « d’Antoine Ramo », de('Lionel') → « de Lionel ».
 * Les sigles en capitales (« APOGEE ») s'élident aussi. Un h aspiré connu (« HARPEGE ») garde « de ». */
const H_ASPIRE = ['harpege', 'hache', 'haut', 'hibou', 'honte', 'hall']
export function de(nom: string): string {
  const plain = nom.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const first = plain.charAt(0)
  const voyelle = 'aeiouy'.includes(first)
  const hMuet = first === 'h' && !H_ASPIRE.some((w) => plain.startsWith(w))
  return voyelle || hMuet ? `d’${nom.trim()}` : `de ${nom.trim()}`
}

// Identifiants fixés sans accent par le champ `id` de chaque story d'écran.
export const screens = {
  accueil: 'ecrans-accueil--accueil',
  fiche: 'ecrans-fiche-apogee--fiche',
  carte: 'ecrans-carte-des-flux--carte',
  impact: 'ecrans-impact--impact',
  explorateur: 'ecrans-explorateur--explorateur',
  tableau: 'ecrans-tableau-de-bord--tableau-de-bord',
} as const

export type ScreenKey = keyof typeof screens

/** Adresse d'un écran dans le gestionnaire Storybook. */
export const screenHref = (key: ScreenKey) => hrefFor(screens[key])

/** Ouvre un écran : toute la fenêtre Storybook change de story. */
export function goTo(key: ScreenKey) {
  if (navigateInApp(screens[key])) return
  const w = window.top ?? window
  w.location.href = screenHref(key)
}

/** Une application dans la palette : son identifiant est celui de sa fiche. */
const appItem = (a: Application): PaletteItem => ({
  id: a.slug,
  group: 'Objets',
  label: a.name,
  detail: a.utilisateurs ? `${a.utilisateurs} utilisateurs` : a.parent ? `module de ${a.parent}` : (a.domaines[0] ?? a.fournisseur ?? undefined),
  type: 'Application',
  layer: 'applicatif',
  icon: 'app',
  ...(a.obsolescence?.status === 'critical' ? { status: 'critical' as const, statusLabel: 'Infra obsolète' } : {}),
})
// Les trois premières restent en tête (résultats proposés sans saisie), puis les autres objets, puis toutes les applications.
const FIRST = ['apogee', 'apogee-web', 'apoip']

export const paletteItems: PaletteItem[] = [
  ...FIRST.map((slug) => appItem(getApplication(slug)!)),
  { id: 'scolarite', group: 'Objets', label: 'Scolarité', detail: `${domainCount('Scolarité')} applications`, type: 'Domaine', layer: 'fonctionnel', icon: 'folder' },
  { id: 'tomcat5', group: 'Objets', label: 'Tomcat 5', detail: '1 déploiement', type: 'Logiciel', layer: 'technique', icon: 'software', status: 'critical', statusLabel: 'Obsolète' },
  { id: 'tomcat9', group: 'Objets', label: 'Tomcat 9', detail: '0 déploiement', type: 'Logiciel', layer: 'technique', icon: 'software', status: 'ok', statusLabel: 'Supporté' },
  { id: 'sophocle', group: 'Objets', label: 'sophocle', detail: 'héberge Tomcat 5', type: 'VM', layer: 'technique', icon: 'cloud' },
  { id: 'amue', group: 'Objets', label: 'AMUE', detail: `${contractsOfSupplier('AMUE').length} contrat${contractsOfSupplier('AMUE').length > 1 ? 's' : ''}`, type: 'Fournisseur', layer: 'applicatif', icon: 'building' },
  ...applications.filter((a) => !FIRST.includes(a.slug)).map(appItem),
  { id: 'c-scol', group: 'Cartes', label: 'Applications et flux de Scolarité', type: 'Flux', icon: 'map' },
  { id: 'c-flux-apogee', group: 'Cartes', label: 'Les flux de APOGEE', type: 'Flux', icon: 'flow' },
  { id: 'c-infra', group: 'Cartes', label: 'Machines nécessaires à APOGEE', type: 'Infrastructure', icon: 'server' },
  { id: 'c-impact', group: 'Cartes', label: "Impact d'un arrêt de sophocle", type: 'Impact', icon: 'impact' },
  { id: 'a-impact', group: 'Actions', label: "Voir l'impact d'un arrêt de Tomcat 5", icon: 'impact', shortcut: '⌘I' },
  { id: 'a-explorer', group: 'Actions', label: 'Lister les applications non valides', icon: 'list' },
  { id: 'a-dashboard', group: 'Actions', label: 'Ouvrir les tableaux de bord', icon: 'dashboard' },
  { id: 'a-new', group: 'Actions', label: 'Créer une carte', icon: 'plus', shortcut: 'N' },
]

/** Écran ouvert par chaque résultat de la palette qui n'est pas une application. */
export const paletteTarget: Record<string, string> = {
  scolarite: '/carte',
  sophocle: '/machines?id=sophocle',
  tomcat5: '/logiciels?id=tomcat-5',
  tomcat9: '/logiciels?id=tomcat-9',
  amue: '/fournisseurs',
  'c-scol': '/carte',
  'c-flux-apogee': '/carte',
  'c-infra': '/infrastructure',
  'c-impact': '/impact',
  'a-impact': '/impact',
  'a-explorer': '/explorateur?filtre=non-valides',
  'a-dashboard': '/tableaux-de-bord',
  'a-new': '/editeur',
}

/** Ouvre un résultat de la palette : la fiche d'une application, sinon l'écran associé ;
 * à défaut, l'explorateur avec le libellé en recherche. */
export function openPaletteItem(item: PaletteItem): boolean {
  if (item.type === 'Application' && getApplication(item.id)) {
    goFiche(item.id)
    return true
  }
  goPath(paletteTarget[item.id] ?? `/explorateur?q=${encodeURIComponent(item.label)}`)
  return true
}
