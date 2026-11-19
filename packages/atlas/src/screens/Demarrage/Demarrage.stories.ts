import type { Meta, StoryObj } from '@storybook/vue3-vite'
import DemarrageScreen from './Demarrage.vue'

const meta = {
  title: 'Écrans/Démarrage',
  id: 'ecrans-demarrage',
  component: DemarrageScreen,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: true,
    docs: {
      description: {
        component:
          'Démarrage d’une cartographie vide : trois étapes, qui servent d’onglets au panneau de droite. Étape 1 : déposez un fichier .xlsx ou .csv (glisser-déposer ou parcourir ; les autres formats sont refusés), ou partez de l’exemple « applications.xlsx ». Chaque colonne est associée à un champ myCarto ; « Domaine fonctionnel » reste à associer, une alerte le signale. « Importer 65 applications » montre la progression puis le succès, marque l’étape 1 terminée et propose « Voir la cartographie ». « Plus tard » reporte une étape.',
      },
    },
  },
} satisfies Meta<typeof DemarrageScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Demarrage: Story = {}
