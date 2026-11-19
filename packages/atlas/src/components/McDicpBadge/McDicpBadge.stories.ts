import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McDicpBadge from './McDicpBadge.vue'

const levels = [0, 1, 2, 3, 4]

const meta = {
  title: 'Repères/DicpBadge',
  component: McDicpBadge,
  args: { d: 2, i: 4, c: 3, p: 4, numeric: false },
  argTypes: {
    d: { control: { type: 'inline-radio' }, options: levels },
    i: { control: { type: 'inline-radio' }, options: levels },
    c: { control: { type: 'inline-radio' }, options: levels },
    p: { control: { type: 'inline-radio' }, options: levels },
    only: { control: { type: 'inline-radio' }, options: [undefined, 'D', 'I', 'C', 'P'] },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Les 4 niveaux de sécurité d’un objet (Disponibilité, Intégrité, Confidentialité, Preuve) en carrés lettrés, toujours dans l’ordre D · I · C · P. L’échelle navy de 1 à 4 est une intensité, pas un état. Un niveau non renseigné est un carré pointillé ; l’infobulle de chaque lettre dit « Disponibilité : Forte ».',
      },
    },
  },
} satisfies Meta<typeof McDicpBadge>

export default meta
type Story = StoryObj<typeof meta>

/** Survole une lettre pour lire son infobulle. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McDicpBadge },
    template: `<div style="display:grid;grid-template-columns:200px auto;gap:14px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>APOGEE</span><McDicpBadge :d="2" :i="4" :c="3" :p="4" />
      <span>Partiellement renseigné</span><McDicpBadge :d="1" :i="1" :c="0" :p="2" />
      <span>Rien de renseigné</span><McDicpBadge />
      <span>Une lettre (Disponibilité)</span><div class="mc-row"><McDicpBadge only="D" :d="1" /><McDicpBadge only="D" :d="2" /><McDicpBadge only="D" :d="3" /><McDicpBadge only="D" :d="4" /><McDicpBadge only="D" :d="0" /></div>
      <span>Légende de l’échelle</span>
      <div class="mc-row">
        <McDicpBadge only="D" numeric :d="1" /><span class="mc-cap">Faible</span>
        <McDicpBadge only="D" numeric :d="2" /><span class="mc-cap">Modérée</span>
        <McDicpBadge only="D" numeric :d="3" /><span class="mc-cap">Forte</span>
        <McDicpBadge only="D" numeric :d="4" /><span class="mc-cap">Très forte</span>
        <McDicpBadge only="D" numeric :d="0" /><span class="mc-cap">NC</span>
      </div>
    </div>`,
  }),
}
