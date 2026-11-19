import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McLifecycleDate from './McLifecycleDate.vue'

/** Date de référence fixe pour que les captures ne changent pas avec le temps. */
const today = '2026-11-19'

const meta = {
  title: 'Repères/LifecycleDate',
  component: McLifecycleDate,
  args: { date: '2027-04-30', warnMonths: 12, today },
  argTypes: {
    date: { control: 'text', description: 'Date ISO (AAAA-MM-JJ). Vide = non renseignée.' },
    today: { control: 'text', description: 'Date de référence ISO.' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Date de fin de support ou d’échéance, colorée selon sa proximité, toujours avec une icône : calendrier au-delà du seuil, triangle orange en dessous (12 mois par défaut, réglage du back-office), octogone rouge et « depuis le » une fois dépassée, « non renseignée » si inconnue.',
      },
    },
  },
} satisfies Meta<typeof McLifecycleDate>

export default meta
type Story = StoryObj<typeof meta>

/** Change la date (AAAA-MM-JJ) ou le seuil pour voir le niveau changer. Référence : 19/11/2026. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McLifecycleDate },
    setup: () => ({ today }),
    template: `<div style="display:grid;grid-template-columns:260px auto;gap:12px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>Plus de 12 mois (APOGEE)</span><McLifecycleDate date="2029-06-10" :today="today" />
      <span>Moins de 12 mois (CALCIUM)</span><McLifecycleDate date="2027-04-30" :today="today" />
      <span>Dépassée (Tomcat 5)</span><McLifecycleDate date="2012-09-30" :today="today" />
      <span>Inconnue (sophocle)</span><McLifecycleDate :today="today" />
      <span>Seuil à 6 mois</span><McLifecycleDate date="2027-04-30" :warn-months="6" :today="today" />
      <span>Échéance de contrat (CONT000015)</span><McLifecycleDate date="2027-03-12" :today="today" label="Expire le" past-label="Expiré depuis le" unknown-label="Échéance non renseignée" />
    </div>`,
  }),
}
