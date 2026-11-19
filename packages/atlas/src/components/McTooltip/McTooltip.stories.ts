import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McTooltip from './McTooltip.vue'
import McIcon from '../../icons/McIcon.vue'

const meta = {
  title: 'Surfaces/Tooltip',
  component: McTooltip,
  args: { text: 'Lentille', shortcut: 'L', placement: 'top', delay: 400, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Infobulle sombre : le nom d’une icône, une valeur complète, un raccourci. Elle entoure son déclencheur (slot par défaut) et le relie par `aria-describedby`. **Apparaît après 400 ms de survol ou au focus clavier, disparaît tout de suite** (sortie, clic, Échap). Une ligne, 60 caractères au plus, sans lien ni bouton (sinon c’est un popover). Tout texte tronqué (« … ») a une infobulle avec le texte entier.',
      },
    },
  },
  render: (args) => ({
    components: { McTooltip, McIcon },
    setup: () => ({ args }),
    template: `<div style="padding:48px 0;display:flex;justify-content:center">
      <McTooltip v-bind="args"><button type="button" class="mc-ibtn" aria-label="Lentille"><McIcon name="lens" /></button></McTooltip>
    </div>`,
  }),
} satisfies Meta<typeof McTooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Visibles en permanence pour comparer : au-dessus, en dessous, avec raccourci, valeur complète d’un texte tronqué. Puis des déclencheurs réels à survoler ou à atteindre avec Tab. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McTooltip, McIcon },
    template: `<div class="mc-col" style="gap:40px;padding-top:40px">
      <div class="mc-row" style="gap:48px;align-items:flex-start;padding-bottom:40px">
        <McTooltip text="Lentille" shortcut="L" :open="true"><button type="button" class="mc-ibtn" aria-label="Lentille"><McIcon name="lens" /></button></McTooltip>
        <McTooltip text="Disponibilité : Forte" :open="true" placement="bottom"><span class="mc-dicp"><span class="c3">D</span></span></McTooltip>
        <McTooltip text="Machines sans composant logiciel" :open="true"><span style="display:inline-block;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:13px" tabindex="0">Machines sans composant logiciel</span></McTooltip>
        <McTooltip text="Rechercher" shortcut="⌘K" :open="true" placement="bottom"><button type="button" class="mc-ibtn" aria-label="Rechercher"><McIcon name="search" /></button></McTooltip>
      </div>
      <span class="mc-over">À survoler (400 ms) ou à atteindre avec Tab</span>
      <div class="mc-toolbar mc-float" style="align-self:flex-start">
        <McTooltip text="Sélectionner" shortcut="V"><button type="button" class="mc-ibtn" aria-label="Sélectionner"><McIcon name="cursor" /></button></McTooltip>
        <McTooltip text="Déplacer la vue" shortcut="H"><button type="button" class="mc-ibtn" aria-label="Déplacer la vue"><McIcon name="hand" /></button></McTooltip>
        <McTooltip text="Ajouter un post-it" shortcut="S"><button type="button" class="mc-ibtn" aria-label="Ajouter un post-it"><McIcon name="sticky" /></button></McTooltip>
        <McTooltip text="Ajuster à l’écran" shortcut="⇧1"><button type="button" class="mc-ibtn" aria-label="Ajuster à l’écran"><McIcon name="fit" /></button></McTooltip>
        <McTooltip text="Désactivée" disabled><button type="button" class="mc-ibtn" aria-label="Sans infobulle" disabled><McIcon name="lock" /></button></McTooltip>
      </div>
    </div>`,
  }),
}
