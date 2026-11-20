import { navigateInApp } from '../bridge'
// Éléments partagés par les écrans d'administration : menu latéral, logo, navigation entre les stories.
import { reactive } from 'vue'
import type { SideNavSection } from '../../components/McSideNav/McSideNav.vue'
import type { IconName } from '../../icons/icons'
import { expiredContracts, invalidApplications, missingFields, obsoleteSoftware } from '../../data/applications'
import logoRaw from '../../../../../public/brand/logo-mycarto.svg?raw'

/** Identifiants des stories d'écrans, pour passer de l'une à l'autre dans Storybook. */
export const screenStories = {
  accueil: 'ecrans-accueil--accueil',
  fiche: 'ecrans-fiche-apogee--fiche',
  carte: 'ecrans-carte-des-flux--carte',
  impact: 'ecrans-impact--impact',
  explorateur: 'ecrans-explorateur--explorateur',
  tableauDeBord: 'ecrans-tableau-de-bord--tableau-de-bord',
} as const

export type ScreenStory = keyof typeof screenStories

/** Ouvre une autre story d'écran dans le gestionnaire Storybook. L'identifiant réel est retrouvé dans l'index
 * (« écrans-… » ou « ecrans-… » selon que la story fixe son id), sinon l'identifiant attendu est utilisé. */
export async function goToScreen(screen: ScreenStory) {
  const wanted = screenStories[screen]
  if (navigateInApp(wanted)) return
  const plain = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  let id: string = wanted
  try {
    const index = (await fetch('/index.json').then((r) => r.json())) as { entries?: Record<string, unknown> }
    id = Object.keys(index.entries ?? {}).find((k) => plain(k) === wanted) ?? wanted
  } catch {
    // Index indisponible : on garde l'identifiant attendu.
  }
  try {
    window.top!.location.href = '/?path=/story/' + id
  } catch {
    window.location.href = '/iframe.html?id=' + encodeURIComponent(id) + '&viewMode=story'
  }
}

/** Logo myCarto en SVG inline : le bleu marine suit la couleur du texte, pour rester lisible en sombre. */
export const logoSvg = logoRaw
  .replace(/fill="#25377C"/gi, 'fill="currentColor"')
  .replace(/width="\d+" height="\d+"/, 'height="22" aria-hidden="true" focusable="false"')

/** Le menu d'administration, avec la page courante. */
export function adminSections(active: string): SideNavSection[] {
  const a = (label: string) => label === active
  return [
    {
      items: [
        { label: 'Tableaux de bord', icon: 'dashboard', active: a('Tableaux de bord') },
        { label: 'Cartographie', icon: 'map', active: a('Cartographie') },
      ],
    },
    {
      title: 'Données',
      items: [
        { label: 'Explorateur', icon: 'list', active: a('Explorateur') },
        { label: 'Dictionnaires', icon: 'book', active: a('Dictionnaires') },
        { label: 'Historique', icon: 'history', active: a('Historique') },
        { label: 'Corbeille', icon: 'trash', active: a('Corbeille') },
      ],
    },
    {
      title: 'Modélisation',
      items: [
        { label: "Types d'objets", icon: 'layers', active: a("Types d'objets") },
        { label: 'Modèles de carte', icon: 'map', active: a('Modèles de carte') },
        { label: 'Diagrammes BPMN', icon: 'process', active: a('Diagrammes BPMN') },
        { label: 'Règles de couleur', icon: 'lens', active: a('Règles de couleur') },
        { label: 'Modèles de requête', icon: 'filter', active: a('Modèles de requête') },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Utilisateurs et groupes',
          icon: 'user',
          active: a('Utilisateurs et groupes'),
          children: [{ label: 'Utilisateurs' }, { label: 'Groupes' }, { label: 'Droits par carte' }],
        },
      ],
    },
  ]
}

/** Adresse de chaque entrée du menu d'administration. Toutes restent dans l'administration (menu visible),
 * sauf « Cartographie » : les canevas plein écran (éditeur, comparaison, BPMN) s'ouvrent depuis une liste. */
export const navPaths: Record<string, string> = {
  'Tableaux de bord': '/tableaux-de-bord',
  Cartographie: '/',
  Explorateur: '/explorateur',
  Dictionnaires: '/dictionnaires',
  Historique: '/journal',
  Corbeille: '/corbeille',
  "Types d'objets": '/types-objets',
  'Modèles de carte': '/modeles-carte',
  'Diagrammes BPMN': '/diagrammes',
  'Règles de couleur': '/reglages',
  'Modèles de requête': '/requetes',
  'Utilisateurs et groupes': '/utilisateurs',
  Utilisateurs: '/utilisateurs',
  Groupes: '/utilisateurs?onglet=groupes',
  'Droits par carte': '/utilisateurs?onglet=profils',
}

/* ---------- Notifications ---------- */
/** Une notification du centre de notifications, avec la page qu'elle ouvre. */
export interface Notification {
  id: string
  icon: IconName
  tone: 'critical' | 'warn' | 'info'
  title: string
  text: string
  when: string
  path: string
}
const firstInvalid = invalidApplications[0]
const firstExpired = expiredContracts[0]
const firstObsolete = obsoleteSoftware[0]
export const notifications: Notification[] = [
  ...(firstExpired
    ? [{ id: 'contrat', icon: 'contract' as const, tone: 'critical' as const, title: `Contrat ${firstExpired.ref} expiré`, text: `${firstExpired.supplier} · expiré le ${firstExpired.end}`, when: 'Aujourd’hui', path: '/contrats' }]
    : []),
  { id: 'carte', icon: 'map', tone: 'info', title: 'William a modifié une carte', text: 'Machines nécessaires à APOGEE', when: 'Hier', path: '/infrastructure' },
  ...(firstInvalid
    ? [{ id: 'invalide', icon: 'alert-octagon' as const, tone: 'warn' as const, title: `${firstInvalid.name} n’est pas valide`, text: `Il manque : ${missingFields(firstInvalid).slice(0, 2).join(', ')}`, when: 'Hier', path: `/fiche/${firstInvalid.slug}` }]
    : []),
  ...(firstObsolete
    ? [{ id: 'logiciel', icon: 'software' as const, tone: 'warn' as const, title: `${firstObsolete} n’est plus supporté`, text: 'Des applications en dépendent encore', when: 'Il y a 3 jours', path: `/logiciels?id=${encodeURIComponent(firstObsolete)}` }]
    : []),
  { id: 'corbeille', icon: 'trash', tone: 'info', title: 'Samuel a supprimé la machine eschyle', text: 'Restaurable pendant 30 jours', when: 'Il y a 3 jours', path: '/corbeille' },
]
/** Notifications lues, partagées par toutes les pages qui montrent le menu. */
export const readNotifications = reactive(new Set<string>(['corbeille', 'logiciel', 'carte']))
