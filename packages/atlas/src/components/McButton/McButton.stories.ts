import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McButton from './McButton.vue'

const meta = {
  title: 'Actions/Button',
  component: McButton,
  args: { variant: 'primary', size: 'md', default: 'Modifier la carte', icon: 'pencil' },
  argTypes: { default: { control: 'text', description: 'Libellé (slot par défaut).' } },
  parameters: {
    docs: {
      description: {
        component:
          'Bouton texte. **Un seul `primary` (jaune) par vue** : c’est l’action principale. Libellé = verbe à l’infinitif + objet. Icône facultative, toujours la même pour la même action.',
      },
    },
  },
  render: (args) => ({
    components: { McButton },
    setup: () => ({ args }),
    template: '<McButton v-bind="args">{{ args.default }}</McButton>',
  }),
} satisfies Meta<typeof McButton>

export default meta
type Story = StoryObj<typeof meta>

/** Joue avec les contrôles pour essayer chaque combinaison. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Variantes: Story = {
  render: () => ({
    components: { McButton },
    template: `<div class="mc-row lg">
      <McButton variant="primary" icon="pencil">Modifier la carte</McButton>
      <McButton variant="secondary" icon="export">Exporter</McButton>
      <McButton variant="outline">Annuler</McButton>
      <McButton variant="ghost">Voir tout</McButton>
      <McButton variant="danger" icon="trash">Supprimer</McButton>
    </div>`,
  }),
}

export const Tailles: Story = {
  render: () => ({
    components: { McButton },
    template: `<div class="mc-row lg">
      <McButton size="sm">Petit · 28px</McButton>
      <McButton size="md">Moyen · 32px</McButton>
      <McButton size="lg">Grand · 40px</McButton>
    </div>`,
  }),
}

/** Repos, survol (passer la souris), focus (Tab), chargement, désactivé : pour chaque variante. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McButton },
    setup: () => ({ variants: ['primary', 'secondary', 'outline', 'ghost', 'danger'] }),
    template: `<table style="border-collapse:separate;border-spacing:16px 12px;font-size:12px;color:var(--ink-muted)">
      <thead><tr><th></th><th>Repos</th><th>Chargement</th><th>Désactivé</th></tr></thead>
      <tbody><tr v-for="v in variants" :key="v">
        <th style="text-align:left">{{ v }}</th>
        <td><McButton :variant="v" icon="export">Exporter</McButton></td>
        <td><McButton :variant="v" icon="export" loading>Exporter</McButton></td>
        <td><McButton :variant="v" icon="export" disabled>Exporter</McButton></td>
      </tr></tbody></table>`,
  }),
}

export const Lien: Story = {
  args: { href: '#', variant: 'outline', icon: 'arrow-right', default: 'Ouvrir la carte' },
}
