import type { Meta, StoryObj } from '@storybook/vue3-vite'
import TableauDeBordScreen from './TableauDeBord.vue'

const meta = {
  title: 'Écrans/Tableau de bord',
  id: 'ecrans-tableau-de-bord',
  component: TableauDeBordScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Tableau de bord « Santé du SI » : quatre contrôles à traiter (chaque carte ouvre l’explorateur), contrôles sans anomalie, cycle de vie des applications selon la période, applications les plus connectées et répartition DICP (hachures : non renseigné).',
      },
    },
  },
} satisfies Meta<typeof TableauDeBordScreen>

export default meta
type Story = StoryObj<typeof meta>

export const TableauDeBord: Story = { name: 'Tableau de bord' }
