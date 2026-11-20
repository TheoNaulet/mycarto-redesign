// Application myCarto (concept) : les écrans d'Atlas, reliés par un vrai routeur.
import { createApp, nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import '../src/styles/atlas.css'
import './app.css'
import App from './App.vue'
import { registerAppNavigator, withoutBase } from '../src/screens/bridge'
import { getApplication } from '../src/data/applications'

const router = createRouter({
  // En ligne, l'application vit sous /app/ (le site vitrine occupe la racine) ; en local, à la racine.
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../src/screens/Accueil/Accueil.vue'), meta: { title: 'Accueil' } },
    { path: '/carte', component: () => import('../src/screens/Carte/Carte.vue'), meta: { title: 'Applications et flux de Scolarité' } },
    { path: '/fiche', redirect: '/fiche/apogee' },
    { path: '/fiche/:id', component: () => import('../src/screens/Fiche/Fiche.vue'), meta: { title: 'Fiche' } },
    { path: '/impact', component: () => import('../src/screens/Impact/Impact.vue'), meta: { title: 'Impact d’un arrêt de sophocle' } },
    { path: '/explorateur', component: () => import('../src/screens/Explorateur/Explorateur.vue'), meta: { title: 'Explorateur' } },
    { path: '/tableau-de-bord', component: () => import('../src/screens/TableauDeBord/TableauDeBord.vue'), meta: { title: 'Tableau de bord' } },
    { path: '/editeur', component: () => import('../src/screens/Editeur/Editeur.vue'), meta: { title: 'Éditeur de carte' } },
    { path: '/historique', component: () => import('../src/screens/Historique/Historique.vue'), meta: { title: 'Historique de la carte' } },
    { path: '/reglages', component: () => import('../src/screens/Reglages/Reglages.vue'), meta: { title: 'Règles de couleur' } },
    { path: '/demarrage', component: () => import('../src/screens/Demarrage/Demarrage.vue'), meta: { title: 'Premier démarrage' } },
    { path: '/organigramme', component: () => import('../src/screens/Organigramme/Organigramme.vue'), meta: { title: 'Organigramme' } },
    { path: '/processus', component: () => import('../src/screens/Processus/Processus.vue'), meta: { title: 'Processus' } },
    { path: '/fournisseurs', component: () => import('../src/screens/Fournisseurs/Fournisseurs.vue'), meta: { title: 'Fournisseurs' } },
    { path: '/infrastructure', component: () => import('../src/screens/Infrastructure/Infrastructure.vue'), meta: { title: 'Machines nécessaires à APOGEE' } },
    { path: '/pos', component: () => import('../src/screens/Pos/Pos.vue'), meta: { title: 'POS complet' } },
    { path: '/contrats', component: () => import('../src/screens/Contrats/Contrats.vue'), meta: { title: 'Les contrats' } },
    { path: '/sites', component: () => import('../src/screens/Sites/Sites.vue'), meta: { title: 'Sites' } },
    { path: '/machines', component: () => import('../src/screens/Machines/Machines.vue'), meta: { title: 'Machines' } },
    { path: '/logiciels', component: () => import('../src/screens/Logiciels/Logiciels.vue'), meta: { title: 'Logiciels' } },
    { path: '/glossaire', component: () => import('../src/screens/Glossaire/Glossaire.vue'), meta: { title: 'Glossaire des applications' } },
    { path: '/criticite', component: () => import('../src/screens/Criticite/Criticite.vue'), meta: { title: 'Applications par criticité' } },
    { path: '/applications-obsoletes', component: () => import('../src/screens/Obsoletes/Obsoletes.vue'), meta: { title: 'Applications obsolètes' } },
    { path: '/liens-domaines', component: () => import('../src/screens/LiensDomaines/LiensDomaines.vue'), meta: { title: 'Liens inter-domaines' } },
    { path: '/pays', component: () => import('../src/screens/Pays/Pays.vue'), meta: { title: 'Pays' } },
    { path: '/traitements', component: () => import('../src/screens/Traitements/Traitements.vue'), meta: { title: 'Registre des traitements' } },
    { path: '/donnees', component: () => import('../src/screens/Donnees/Donnees.vue'), meta: { title: 'Données' } },
    { path: '/projets', component: () => import('../src/screens/Projets/Projets.vue'), meta: { title: 'Projets' } },
    { path: '/referents', component: () => import('../src/screens/Referents/Referents.vue'), meta: { title: 'Référents' } },
    { path: '/definitions', component: () => import('../src/screens/Definitions/Definitions.vue'), meta: { title: 'Définitions' } },
    { path: '/tableaux-de-bord', component: () => import('../src/screens/TableauxDeBord/TableauxDeBord.vue'), meta: { title: 'Tableaux de bord' } },
    { path: '/dictionnaires', component: () => import('../src/screens/Dictionnaires/Dictionnaires.vue'), meta: { title: 'Dictionnaires' } },
    { path: '/corbeille', component: () => import('../src/screens/Corbeille/Corbeille.vue'), meta: { title: 'Corbeille' } },
    { path: '/types-objets', component: () => import('../src/screens/Types/Types.vue'), meta: { title: "Types d'objets" } },
    { path: '/requetes', component: () => import('../src/screens/Requetes/Requetes.vue'), meta: { title: 'Modèles de requête' } },
    { path: '/journal', component: () => import('../src/screens/Journal/Journal.vue'), meta: { title: 'Historique' } },
    { path: '/modeles-carte', component: () => import('../src/screens/ModelesCarte/ModelesCarte.vue'), meta: { title: 'Modèles de carte' } },
    { path: '/diagrammes', component: () => import('../src/screens/Diagrammes/Diagrammes.vue'), meta: { title: 'Diagrammes BPMN' } },
    { path: '/utilisateurs', component: () => import('../src/screens/Utilisateurs/Utilisateurs.vue'), meta: { title: 'Utilisateurs et groupes' } },
    { path: '/:any(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const app = to.path.startsWith('/fiche/') ? getApplication(String(to.params.id)) : undefined
  const title = to.path.startsWith('/fiche/') ? (app?.name ?? 'Fiche introuvable') : (to.meta.title as string)
  document.title = `${title} · myCarto`
})

// Passage carte ↔ administration : le logo reste en place, la barre s'efface et le menu glisse depuis la gauche
// (et inversement). L'API View Transitions fige l'ancien écran, le routeur affiche le nouveau, puis le navigateur
// joue les animations décrites dans app.css (barre « mc-bar », menu « mc-side », logo « mc-logo »).
// Sans l'API, ou animations réduites : changement direct, comme avant.
const ADMIN = ['/explorateur', '/tableau-de-bord', '/tableaux-de-bord', '/dictionnaires', '/journal', '/corbeille', '/types-objets', '/modeles-carte', '/diagrammes', '/reglages', '/requetes', '/utilisateurs']
const isAdmin = (path: string) => ADMIN.includes(path)
const calm = window.matchMedia('(prefers-reduced-motion: reduce)')
let pending: (() => void) | null = null

router.beforeResolve((to, from) => {
  if (!from.matched.length || isAdmin(to.path) === isAdmin(from.path)) return
  if (!('startViewTransition' in document) || calm.matches) return
  document.documentElement.dataset.navMorph = isAdmin(to.path) ? 'to-side' : 'to-top'
  return new Promise<void>((resolve) => {
    const vt = document.startViewTransition(() => {
      resolve()
      // Le nouvel écran est dessiné au prochain tour du routeur : on attend qu'il soit dans la page.
      return new Promise<void>((done) => { pending = done })
    })
    vt.finished.finally(() => delete document.documentElement.dataset.navMorph)
  })
})
router.afterEach(async () => {
  if (!pending) return
  const done = pending
  pending = null
  // L'écran (chargé à la demande) est déjà prêt à ce stade : un tour de Vue suffit pour qu'il soit dans la page.
  // Pas de requestAnimationFrame ici : le navigateur suspend le rendu pendant la transition, il ne viendrait jamais.
  await nextTick()
  done()
})

registerAppNavigator((path) => router.push(path))

// Les liens internes (<a href="/carte">) passent par le routeur, sans recharger la page.
document.addEventListener('click', (e) => {
  const a = (e.target as HTMLElement | null)?.closest?.('a')
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === '_blank') return
  const href = a.getAttribute('href')
  if (!href || !href.startsWith('/') || href.startsWith('//')) return
  const path = withoutBase(href)
  if (router.resolve(path).matched.length) {
    e.preventDefault()
    router.push(path)
  }
})

createApp(App).use(router).mount('#app')

// Aide au développeur : Alt + clic droit sur un élément → menu du composant (éditeur, story, test, copier).
// Chargée en développement seulement : le build ne la contient pas.
if (import.meta.env.DEV) {
  import('./dev/DevInspector.vue').then(({ default: DevInspector }) => {
    const host = document.body.appendChild(document.createElement('div'))
    createApp(DevInspector).mount(host)
  })
}
