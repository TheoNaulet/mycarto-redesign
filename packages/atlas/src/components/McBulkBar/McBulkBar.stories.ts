import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McBulkBar from './McBulkBar.vue'
import McButton from '../McButton/McButton.vue'

const meta = {
  title: 'Données/BulkBar',
  component: McBulkBar,
  args: { count: 2, clearLabel: 'Tout désélectionner', floating: false },
  parameters: {
    docs: {
      description: {
        component:
          'Barre d’actions groupées, sombre, qui apparaît en bas au centre quand des lignes sont cochées. Elle remplace les icônes grisées toujours visibles : les actions n’apparaissent que quand elles sont possibles. Le nombre est accordé (`forms` : singulier et pluriel). L’action destructrice en dernier ; la croix vide la sélection (`clear`).',
      },
    },
  },
  render: (args) => ({
    components: { McBulkBar, McButton },
    setup: () => ({ args }),
    template: `<McBulkBar v-bind="args">
      <McButton variant="ghost" size="sm" icon="pencil">Modifier</McButton>
      <McButton variant="ghost" size="sm" icon="map">Ajouter à une carte</McButton>
      <McButton variant="ghost" size="sm" icon="export">Exporter</McButton>
      <McButton variant="ghost" size="sm" icon="trash">Supprimer</McButton>
    </McBulkBar>`,
  }),
} satisfies Meta<typeof McBulkBar>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Singulier, pluriel, autre type d’objet (accord au masculin), et 0 (la barre disparaît). */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McBulkBar, McButton },
    template: `<div class="mc-col" style="max-width:640px">
      <McBulkBar :count="1"><McButton variant="ghost" size="sm" icon="pencil">Modifier</McButton><McButton variant="ghost" size="sm" icon="export">Exporter</McButton></McBulkBar>
      <McBulkBar :count="65"><McButton variant="ghost" size="sm" icon="pencil">Modifier</McButton><McButton variant="ghost" size="sm" icon="export">Exporter</McButton></McBulkBar>
      <McBulkBar :count="3" :forms="{ one: 'logiciel sélectionné', other: 'logiciels sélectionnés' }"><McButton variant="ghost" size="sm" icon="export">Exporter</McButton></McBulkBar>
      <McBulkBar :count="1" :forms="{ one: 'machine sélectionnée', other: 'machines sélectionnées' }"><McButton variant="ghost" size="sm" icon="map">Voir sur la carte</McButton></McBulkBar>
      <span class="mc-cap">À 0, rien ne s’affiche :</span>
      <McBulkBar :count="0" />
    </div>`,
  }),
}

/** Flottante au-dessus d’un contenu ; la croix vide la sélection, « Sélectionner » la remplit. */
export const Flottante: Story = {
  parameters: { pad: false },
  render: () => ({
    components: { McBulkBar, McButton },
    setup: () => ({ n: ref(2) }),
    template: `<div style="position:relative;height:260px;padding:16px">
      <McButton variant="outline" size="sm" icon="plus" @click="n++">Sélectionner une application de plus</McButton>
      <McBulkBar :count="n" floating @clear="n = 0">
        <McButton variant="ghost" size="sm" icon="export">Exporter</McButton>
        <McButton variant="ghost" size="sm" icon="trash">Supprimer</McButton>
      </McBulkBar>
    </div>`,
  }),
}
