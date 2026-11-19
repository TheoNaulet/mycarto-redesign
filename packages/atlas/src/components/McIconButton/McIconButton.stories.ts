import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McIconButton from './McIconButton.vue'

const meta = {
  title: 'Actions/IconButton',
  component: McIconButton,
  args: { icon: 'pencil', label: 'Modifier la carte', shortcut: 'E', variant: 'default', size: 'md', badge: false, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Bouton carré à icône seule, pour les barres d’outils et les actions de ligne. **Le libellé est obligatoire** : il sert d’infobulle et d’`aria-label`. `on` (jaune) = outil actif de la barre flottante ; `pressed` (accent) = panneau ou filtre ouvert.',
      },
    },
  },
  render: (args) => ({
    components: { McIconButton },
    setup: () => ({ args }),
    template: '<McIconButton v-bind="args" />',
  }),
} satisfies Meta<typeof McIconButton>

export default meta
type Story = StoryObj<typeof meta>

/** Joue avec les contrôles pour essayer chaque combinaison. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Repos, survol (classe is-hover), focus (Tab), désactivé, avec pastille : pour chaque variante. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McIconButton },
    setup: () => ({ variants: ['default', 'on', 'pressed', 'danger'], sizes: ['sm', 'md', 'lg'] }),
    template: `<div class="mc-col">
      <table style="border-collapse:separate;border-spacing:16px 10px;font-size:12px;color:var(--ink-muted)">
        <thead><tr><th></th><th>Repos</th><th>Survol</th><th>Focus</th><th>Pastille</th><th>Désactivé</th></tr></thead>
        <tbody><tr v-for="v in variants" :key="v">
          <th style="text-align:left">{{ v }}</th>
          <td><McIconButton :variant="v" icon="filter" label="Filtrer" /></td>
          <td><McIconButton :variant="v" icon="filter" label="Filtrer" class="is-hover" /></td>
          <td><McIconButton :variant="v" icon="filter" label="Filtrer" style="outline:2px solid var(--focus);outline-offset:2px" /></td>
          <td><McIconButton :variant="v" icon="filter" label="Filtrer, 2 filtres appliqués" badge /></td>
          <td><McIconButton :variant="v" icon="filter" label="Filtrer" disabled /></td>
        </tr></tbody>
      </table>
      <div class="mc-row lg">
        <McIconButton v-for="s in sizes" :key="s" :size="s" icon="cursor" :label="'Sélectionner · ' + s" />
      </div>
    </div>`,
  }),
}

/** Barre d'outils flottante : un seul outil actif à la fois (jaune). */
export const Barre_d_outils: Story = {
  name: 'Barre d’outils',
  render: () => ({
    components: { McIconButton },
    setup: () => {
      const tools = [
        { id: 'cursor', label: 'Sélectionner', key: 'V' },
        { id: 'hand', label: 'Déplacer la vue', key: 'H' },
        { id: 'sticky', label: 'Ajouter un post-it', key: 'N' },
        { id: 'comment', label: 'Commenter', key: 'C' },
      ] as const
      return { tools, active: ref('cursor') }
    },
    template: `<div class="mc-float mc-row" style="display:inline-flex;padding:4px;gap:4px">
      <McIconButton v-for="t in tools" :key="t.id" size="lg" :icon="t.id" :label="t.label" :shortcut="t.key"
        :variant="active === t.id ? 'on' : 'default'" @click="active = t.id" />
    </div>`,
  }),
}

/** Actions de ligne dans un tableau. */
export const Actions_de_ligne: Story = {
  name: 'Actions de ligne',
  render: () => ({
    components: { McIconButton },
    template: `<div class="mc-row" style="gap:2px">
      <McIconButton size="sm" icon="pencil" label="Modifier APOGEE" />
      <McIconButton size="sm" icon="copy" label="Dupliquer APOGEE" />
      <McIconButton size="sm" icon="trash" variant="danger" label="Supprimer APOGEE" />
    </div>`,
  }),
}
