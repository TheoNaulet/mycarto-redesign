// Pont de navigation : les écrans tournent soit dans l'application (routeur Vue), soit dans Storybook.
// L'application enregistre son routeur au démarrage ; sans lui, on reste sur la navigation Storybook.
import { getApplication, slugOf } from '../data/applications'

/** Identifiant de story → adresse dans l'application. Une entrée par écran. */
export const appRoutes: Record<string, string> = {
  'ecrans-accueil--accueil': '/',
  'ecrans-fiche-apogee--fiche': '/fiche/apogee',
  'ecrans-fiche-apogee--fiche-calcium': '/fiche/calcium',
  'ecrans-carte-des-flux--carte': '/carte',
  'ecrans-impact--impact': '/impact',
  'ecrans-explorateur--explorateur': '/explorateur',
  'ecrans-tableau-de-bord--tableau-de-bord': '/tableau-de-bord',
  'ecrans-infrastructure--infrastructure': '/infrastructure',
  'ecrans-pos--pos': '/pos',
  'ecrans-contrats--contrats': '/contrats',
  'ecrans-organigramme--organigramme': '/organigramme',
  'ecrans-processus--processus': '/processus',
  'ecrans-fournisseurs--fournisseurs': '/fournisseurs',
  'ecrans-editeur--editeur': '/editeur',
  'ecrans-historique--historique': '/historique',
  'ecrans-reglages--reglages': '/reglages',
  'ecrans-demarrage--demarrage': '/demarrage',
  'ecrans-sites--sites': '/sites',
  'ecrans-machines--machines': '/machines',
  'ecrans-logiciels--logiciels': '/logiciels',
  'ecrans-glossaire--glossaire': '/glossaire',
  'ecrans-criticite--criticite': '/criticite',
  'ecrans-applications-obsoletes--obsoletes': '/applications-obsoletes',
  'ecrans-liens-domaines--liens-domaines': '/liens-domaines',
  'ecrans-pays--pays': '/pays',
  'ecrans-traitements--traitements': '/traitements',
  'ecrans-donnees--donnees': '/donnees',
  'ecrans-projets--projets': '/projets',
  'ecrans-referents--referents': '/referents',
  'ecrans-definitions--definitions': '/definitions',
  'ecrans-tableaux-de-bord--tableaux-de-bord': '/tableaux-de-bord',
  'ecrans-dictionnaires--dictionnaires': '/dictionnaires',
  'ecrans-corbeille--corbeille': '/corbeille',
  'ecrans-types--types': '/types-objets',
  'ecrans-requetes--requetes': '/requetes',
  'ecrans-utilisateurs--utilisateurs': '/utilisateurs',
}

let appNavigate: ((path: string) => void) | null = null

/** Appelé par l'application au démarrage. */
export function registerAppNavigator(fn: (path: string) => void) {
  appNavigate = fn
}

/** Vrai quand les écrans tournent dans l'application. */
export const inApp = () => appNavigate !== null

/** Navigue dans l'application si possible ; renvoie faux pour laisser la navigation Storybook faire. */
export function navigateInApp(storyId: string): boolean {
  const plain = storyId.normalize('NFD').replace(/[̀-ͯ]/g, '')
  const path = appRoutes[plain]
  if (!appNavigate || !path) return false
  appNavigate(path)
  return true
}

/** Adresse à mettre dans un lien : la route de l'application, ou la story. */
export function hrefFor(storyId: string): string {
  return appNavigate && appRoutes[storyId] ? appRoutes[storyId] : `/?path=/story/${storyId}`
}

const storyForPath = (path: string) => Object.keys(appRoutes).find((id) => appRoutes[id] === path)

/** Story d'une fiche dans Storybook : celle d'APOGEE, avec l'application en argument d'adresse. */
function ficheStoryHref(slug: string): string {
  const own = storyForPath(`/fiche/${slug}`)
  if (own) return `/?path=/story/${own}`
  return `/?path=/story/ecrans-fiche-apogee--fiche${slug && slug !== 'apogee' ? `&args=id:${slug}` : ''}`
}
const FICHE_PATH = /^\/fiche\/([a-z0-9-]+)$/

/** Va à un écran par son adresse d'application (« /contrats »). Dans Storybook, ouvre la story correspondante. */
export function goPath(path: string) {
  if (appNavigate) return appNavigate(path)
  const href = pathHref(path)
  if (href !== '#') (window.top ?? window).location.href = href
}

/** Lien vers un écran par son adresse d'application. */
export function pathHref(path: string): string {
  if (appNavigate) return path
  const fiche = FICHE_PATH.exec(path)
  if (fiche) return ficheStoryHref(fiche[1])
  const id = storyForPath(path === '/fiche' ? '/fiche/apogee' : path)
  return id ? `/?path=/story/${id}` : '#'
}

/** Identifiant d'adresse d'une application : celui de sa fiche si le nom est un alias (« ESUP » → « esup-portail »). */
const ficheSlug = (nameOrSlug: string) => getApplication(nameOrSlug)?.slug ?? slugOf(nameOrSlug)

/** Adresse de la fiche d'une application, par son nom ou son identifiant (« APOGEE WEB », « apogee-web »). */
export function ficheHref(nameOrSlug: string): string {
  return pathHref(`/fiche/${ficheSlug(nameOrSlug)}`)
}

/** Ouvre la fiche d'une application, par son nom ou son identifiant. */
export function goFiche(nameOrSlug: string) {
  goPath(`/fiche/${ficheSlug(nameOrSlug)}`)
}

/** Copie dans le presse-papiers l'adresse d'un écran (par défaut, la page ouverte). Vrai si la copie a réussi. */
export async function copyLink(path?: string): Promise<boolean> {
  const url = path ? new URL(pathHref(path), window.location.origin).href : window.location.href
  try {
    await navigator.clipboard.writeText(url)
    return true
  } catch {
    return false
  }
}
