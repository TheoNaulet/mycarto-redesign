import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomePage, meta: { title: 'Plus jamais perdu dans votre SI' } },
    {
      path: '/fonctionnalites',
      name: 'features',
      component: () => import('./pages/FeaturesPage.vue'),
      meta: { title: 'Fonctionnalités' },
    },
    { path: '/demo', name: 'demo', component: () => import('./pages/DemoPage.vue'), meta: { title: 'Demander une démo' } },
    { path: '/contact', name: 'contact', component: () => import('./pages/ContactPage.vue'), meta: { title: 'Contact commercial' } },
    { path: '/clients', name: 'clients', component: () => import('./pages/ClientsPage.vue'), meta: { title: 'Nos clients' } },
    {
      path: '/ressources',
      name: 'resources',
      component: () => import('./pages/ResourcesPage.vue'),
      meta: { title: 'Articles et guides' },
    },
    {
      path: '/ressources/nis2',
      name: 'article',
      component: () => import('./pages/ArticlePage.vue'),
      meta: { title: 'NIS2 et cartographie du SI' },
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior(to, _from, saved) {
    if (saved) return saved
    if (to.hash) return { el: to.hash, top: 24, behavior: 'smooth' }
    return { top: 0 }
  },
})

router.afterEach((to) => {
  document.title = `${to.meta.title as string} | myCarto (concept)`
})
