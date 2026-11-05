import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import HomePage from './pages/HomePage.vue'

const page = (title: string, name: string, path: string, component: RouteRecordRaw['component']): RouteRecordRaw => ({
  path,
  name,
  component: component!,
  meta: { title },
})

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { title: 'Plus jamais perdu dans votre SI' } },

    // Produit
    page('Le logiciel myCarto', 'product', '/logiciel', () => import('./pages/ProductPage.vue')),
    page('Fonctionnalités', 'features', '/fonctionnalites', () => import('./pages/FeaturesPage.vue')),
    page('Intégration et déploiement', 'integration', '/integration', () => import('./pages/IntegrationPage.vue')),
    page('Tarifs', 'pricing', '/tarifs', () => import('./pages/PricingPage.vue')),
    page('Solu-QIQ devient myCarto', 'soluqiq', '/solu-qiq', () => import('./pages/SoluQiqPage.vue')),

    // Pour qui ?
    page('Votre métier', 'roles', '/metiers/:role?', () => import('./pages/RolesPage.vue')),
    page('Votre secteur', 'sectors', '/secteurs', () => import('./pages/SectorsPage.vue')),
    page('Notre méthode', 'method', '/methode', () => import('./pages/MethodPage.vue')),

    // Clients
    page('Nos clients', 'clients', '/clients', () => import('./pages/ClientsPage.vue')),
    page('Cas client', 'case', '/clients/:slug', () => import('./pages/CasePage.vue')),
    page('Club utilisateurs', 'club', '/club-utilisateurs', () => import('./pages/ClubPage.vue')),

    // Ressources
    page('Articles et guides', 'resources', '/ressources', () => import('./pages/ResourcesPage.vue')),
    page('Article', 'article', '/ressources/:slug', () => import('./pages/ArticlePage.vue')),
    page('Événements et webinaires', 'events', '/evenements', () => import('./pages/EventsPage.vue')),
    page('Questions fréquentes', 'faq', '/faq', () => import('./pages/FaqPage.vue')),

    // Entreprise
    page('À propos d’AB+ Software', 'about', '/a-propos', () => import('./pages/AboutPage.vue')),
    page('Recrutement', 'careers', '/recrutement', () => import('./pages/CareersPage.vue')),
    page('Demander une démo', 'demo', '/demo', () => import('./pages/DemoPage.vue')),
    page('Contact commercial', 'contact', '/contact', () => import('./pages/ContactPage.vue')),

    // Légal
    {
      path: '/mentions-legales',
      name: 'legal',
      component: () => import('./pages/LegalPage.vue'),
      meta: { title: 'Mentions légales' },
      props: { doc: 'mentions' },
    },
    {
      path: '/confidentialite',
      name: 'privacy',
      component: () => import('./pages/LegalPage.vue'),
      meta: { title: 'Politique RGPD' },
      props: { doc: 'rgpd' },
    },
    page('Plan du site', 'sitemap', '/plan-du-site', () => import('./pages/SitemapPage.vue')),

    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('./pages/NotFoundPage.vue'), meta: { title: 'Page introuvable' } },
  ],
  scrollBehavior(to, from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 24, behavior: 'smooth' }
    // Switching between tabs of the same page (e.g. /metiers/dsi → /metiers/rssi) keeps the scroll.
    if (to.name === from.name && to.name === 'roles') return false
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title as string} | myCarto (concept)`
})

/** Pages with a dynamic subject (an article, a case) set their own title once loaded. */
/** Shows the 404 page in place, keeping the address as typed. */
export function showNotFound(path: string) {
  router.replace({ name: 'not-found', params: { pathMatch: path.slice(1).split('/') } })
}

export function setPageTitle(title: string) {
  document.title = `${title} | myCarto (concept)`
}
