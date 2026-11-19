import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import WidgetPicker from './WidgetPicker.vue'
import { widgetKinds, type WidgetType } from './widgets'
import McButton from '../../components/McButton/McButton.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'

const meta = {
  title: 'Écrans/Partagés/Ajout de widget',
  id: 'ecrans-partages-widgets',
  component: WidgetPicker,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Modale d’ajout d’un widget au tableau de bord : neuf types avec un aperçu (chiffre clé, jauge, barres, anneau, évolution, points d’attention, échéances, résultat de requête, aperçu de carte), recherche et filtre par famille. Un clic choisit, un double-clic ou Entrée ajoute ; les flèches passent d’une carte à l’autre. Les types déjà présents sont signalés. Props : `v-model:open`, `added`, `dashboard`. Événement : `add(type)`, puis la modale se ferme.',
      },
    },
  },
} satisfies Meta<typeof WidgetPicker>

export default meta
type Story = StoryObj<typeof meta>

export const AjoutDeWidget: Story = {
  name: 'Ajout de widget',
  render: () => ({
    components: { WidgetPicker, McButton, McToastHost },
    setup: () => {
      const open = ref(true)
      const added = ref<WidgetType[]>(['kpi', 'liste'])
      const toast = useToast()
      const labels = () => added.value.map((t) => widgetKinds.find((w) => w.type === t)?.label).join(', ')
      function onAdd(t: WidgetType) {
        added.value = [...added.value, t]
        toast.success(`Widget « ${widgetKinds.find((w) => w.type === t)?.label} » ajouté au tableau de bord`, {
          actionLabel: 'Annuler',
          onAction: () => (added.value = added.value.slice(0, -1)),
        })
      }
      return { open, added, onAdd, labels }
    },
    template: `<div style="min-height:100vh;padding:24px;box-sizing:border-box;background:var(--canvas);font-family:var(--font-sans);color:var(--ink);display:flex;gap:12px;align-items:flex-start">
  <McButton icon="plus" @click="open = true">Ajouter un widget</McButton>
  <span class="mc-cap" style="padding-top:8px">Sur le tableau de bord : {{ labels() }}</span>
  <WidgetPicker v-model:open="open" :added="added" dashboard="Pilotage du SI" @add="onAdd" />
  <McToastHost />
</div>`,
  }),
}
