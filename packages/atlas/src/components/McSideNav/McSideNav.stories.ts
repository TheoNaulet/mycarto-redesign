import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McSideNav, { type SideNavSection } from './McSideNav.vue'
import McIcon from '../../icons/McIcon.vue'

function admin(active = 'Explorateur'): SideNavSection[] {
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
        { label: 'Corbeille', icon: 'trash', active: a('Corbeille'), badge: 3, badgeTone: 'neutral' },
      ],
    },
    {
      title: 'Modélisation',
      items: [
        { label: "Types d'objets", icon: 'layers', active: a("Types d'objets") },
        { label: 'Modèles de carte', icon: 'map', active: a('Modèles de carte') },
        { label: 'Diagrammes BPMN', icon: 'process', active: a('Diagrammes BPMN') },
        { label: 'Règles de couleur', icon: 'lens', active: a('Règles de couleur') },
      ],
    },
    {
      title: 'Administration',
      items: [
        {
          label: 'Utilisateurs et groupes',
          icon: 'user',
          children: [
            { label: 'Utilisateurs', active: a('Utilisateurs') },
            { label: 'Groupes', active: a('Groupes') },
            { label: 'Droits par carte', active: a('Droits par carte') },
          ],
        },
        { label: 'Réglages', icon: 'settings', active: a('Réglages') },
      ],
    },
  ]
}

const footer = `<template #footer="{ collapsed }">
  <a href="#" :title="collapsed ? 'Notifications (1)' : undefined" :aria-label="collapsed ? 'Notifications (1)' : undefined" @click.prevent><McIcon name="bell" /><template v-if="!collapsed">Notifications<span class="end"><span class="mc-count alert">1</span></span></template></a>
  <a href="#" :title="collapsed ? 'Théo Naulet' : undefined" @click.prevent><span class="mc-avatar">TN</span><template v-if="!collapsed">Théo Naulet</template></a>
</template>`

const meta = {
  title: 'Navigation/SideNav',
  component: McSideNav,
  args: { sections: admin(), collapsed: false, ariaLabel: 'Administration' },
  parameters: {
    pad: false,
    docs: {
      description: {
        component:
          'Menu latéral de l’espace d’administration, repliable en rail d’icônes de 56px (`v-model:collapsed`). Sections titrées en surtitre, élément actif en `accent-soft`, sous-menus dépliables (chevron), pastilles de compteur. Slots `header` (logo) et `footer` (notifications, utilisateur). **Le visualiseur n’a pas de menu** : on y navigue par la carte, la recherche et le fil d’Ariane. Libellés métier : « Types d’objets », pas « Méta-modèle ».',
      },
    },
  },
  render: (args) => ({
    components: { McSideNav, McIcon },
    setup: () => {
      const active = ref('Explorateur')
      const sections = computed(() => admin(active.value))
      return { args, sections, active }
    },
    template: `<div style="display:flex;height:620px;background:var(--canvas)">
      <McSideNav v-bind="args" :sections="sections" @select="(it) => (active = it.label)">
        <template #header>
          <a href="#" style="margin-bottom:8px" @click.prevent><img src="/brand/logo-mycarto.svg" alt="myCarto" style="height:22px" /></a>
        </template>
        ${footer}
      </McSideNav>
      <div style="padding:24px" class="mc-cap">Page : {{ active }}</div>
    </div>`,
  }),
} satisfies Meta<typeof McSideNav>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Déplié avec sous-menu ouvert et sous-élément actif, puis rail replié (survoler une icône : infobulle). */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McSideNav, McIcon },
    setup: () => ({ open: admin('Groupes'), base: admin('Explorateur'), rail: ref(true) }),
    template: `<div style="display:flex;gap:24px;height:620px;background:var(--canvas)">
      <McSideNav :sections="base">${footer}</McSideNav>
      <McSideNav :sections="open">${footer}</McSideNav>
      <McSideNav :sections="base" v-model:collapsed="rail">${footer}</McSideNav>
      <div style="padding:16px"><button class="mc-btn outline sm" @click="rail = !rail">{{ rail ? 'Déplier' : 'Replier' }} le rail</button></div>
    </div>`,
  }),
}
