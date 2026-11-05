import type { Meta, StoryObj } from '@storybook/vue3-vite'
import EventCountdown from './EventCountdown.vue'

const inTenDays = new Date(Date.now() + 10 * 86400e3 + 5 * 3600e3).toISOString()

const meta = {
  title: 'Clients/EventCountdown',
  component: EventCountdown,
  tags: ['autodocs'],
  parameters: {
    ground: 'navy',
    docs: {
      description: {
        component:
          'Le compte à rebours du prochain événement, sur navy. Il bat chaque seconde à l’écran, mais un lecteur d’écran n’entend qu’une phrase calme (« Dans 10 jours et 5 heures »), sans annonce à chaque seconde.',
      },
    },
  },
  args: { to: inTenDays },
} satisfies Meta<typeof EventCountdown>

export default meta
export const CompteARebours: StoryObj<typeof meta> = {}
