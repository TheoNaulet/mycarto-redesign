import type { Meta, StoryObj } from '@storybook/vue3-vite'
import FaqList from './FaqList.vue'
import { productFaq } from '../../data/product'

const meta = {
  title: 'Produit/FaqList',
  component: FaqList,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: 'Des questions dans une liste encadrée ; chacune s’ouvre sur place. C’est un `<details>` natif : il marche au clavier et sans JavaScript.' } },
  },
  args: { items: productFaq },
} satisfies Meta<typeof FaqList>

export default meta
export const Questions: StoryObj<typeof meta> = {}
