import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McTag from './McTag.vue'

const meta = {
  title: 'Repères/Tag',
  component: McTag,
  args: { variant: 'tag', size: 'md', default: 'Carte principale' },
  argTypes: { default: { control: 'text', description: 'Libellé (slot par défaut).' } },
  parameters: {
    docs: {
      description: {
        component:
          'Étiquette neutre qui qualifie un nœud sans être un état. `tag` (contour plein) dit un rôle dans la carte ; `member` (pointillé) dit l’appartenance à un regroupement qui n’est pas dessiné. Une étiquette au plus par nœud, les autres passent dans l’inspecteur.',
      },
    },
  },
  render: (args) => ({
    components: { McTag },
    setup: () => ({ args }),
    template: '<McTag v-bind="args">{{ args.default }}</McTag>',
  }),
} satisfies Meta<typeof McTag>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McTag },
    template: `<div style="display:grid;grid-template-columns:160px auto;gap:12px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>tag</span><div class="mc-row"><McTag>Carte principale</McTag><McTag>Module de APOGEE</McTag><McTag icon="star">Favori</McTag></div>
      <span>member</span><div class="mc-row"><McTag variant="member" icon="server">Cluster philosophe</McTag><McTag variant="member">Environnement PROD</McTag></div>
      <span>Petit (sous un nœud)</span><div class="mc-row"><McTag size="sm">Module de APOGEE</McTag><McTag variant="member" size="sm" icon="server">Cluster philosophe</McTag></div>
    </div>`,
  }),
}
