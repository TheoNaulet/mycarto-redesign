import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FicheScreen from './Fiche.vue'

const meta = {
  title: 'Écrans/Fiche APOGEE',
  id: 'ecrans-fiche-apogee',
  component: FicheScreen,
  args: { id: 'apogee' },
  argTypes: { id: { control: 'text', description: 'Identifiant de l’application (« apogee », « calcium », « apogee-web ») ou son nom.' } },
  parameters: {
    layout: 'fullscreen',
    pad: false,
    canvas: false,
    docs: {
      description: {
        component:
          'La fiche pleine page d’une application, lue dans la source unique `src/data/applications.ts` : identité, sécurité DICP, actions, vues (Fiche, Flux, Infrastructure, POS, Historique), chiffres clés, cartes, informations, relations, points d’attention (calculés depuis l’obsolescence, les contrats et les champs manquants) et activité. Dans l’application, l’adresse `/fiche/:id` choisit l’application ; ici, la propriété `id`. Un identifiant inconnu montre un état « fiche introuvable » avec un lien vers l’explorateur.',
      },
    },
  },
} satisfies Meta<typeof FicheScreen>

export default meta
type Story = StoryObj<typeof meta>

export const Fiche: Story = {}

/** Une application sans données de maquette : tout vient de l'inventaire, des contrats et des cartes ; le reste est « Non renseigné ». */
export const FicheCalcium: Story = {
  name: 'Fiche CALCIUM',
  args: { id: 'calcium' },
}
