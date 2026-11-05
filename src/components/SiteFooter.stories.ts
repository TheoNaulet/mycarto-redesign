import type { Meta, StoryObj } from '@storybook/vue3-vite'
import SiteFooter from './SiteFooter.vue'

const meta = {
  title: 'Navigation/SiteFooter',
  component: SiteFooter,
  parameters: {
    pad: false,
    docs: { description: { component: 'Le plan du site en colonnes, sur navy, lu dans `src/data/nav.ts`.' } },
  },
} satisfies Meta<typeof SiteFooter>

export default meta
export const PiedDePage: StoryObj<typeof meta> = {}
