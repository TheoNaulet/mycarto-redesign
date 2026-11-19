import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McPagination from './McPagination.vue'

const applications = { one: 'application', many: 'applications' }

const meta = {
  title: 'Navigation/Pagination',
  component: McPagination,
  args: { total: 65, noun: applications, pageSizes: [25, 50, 100], siblings: 1, hidePageSize: false },
  parameters: {
    docs: {
      description: {
        component:
          'Pagination d’un tableau : le total nommé et accordé à gauche (« 65 applications », **jamais « 1 de 3 pages (65 occurrences) »**), les pages au centre (courante en `navy`), la taille de page à droite (liste native). Au-delà de 7 pages : 1 … 4 5 6 … 12. `v-model:page` et `v-model:page-size` ; changer la taille garde le premier élément visible.',
      },
    },
  },
  render: (args) => ({
    components: { McPagination },
    setup: () => ({ args, page: ref(1), size: ref(25) }),
    template: `<div class="mc-col" style="max-width:720px">
      <McPagination v-bind="args" v-model:page="page" v-model:page-size="size" />
      <span class="mc-cap">Page {{ page }}, {{ size }} par page.</span>
    </div>`,
  }),
} satisfies Meta<typeof McPagination>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Une seule page, peu de pages, début / milieu / fin d’une longue liste, un seul élément, aucun élément. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McPagination },
    setup: () => ({ applications, b: ref(2), c: ref(2), d: ref(5), e: ref(12), f: ref(1), g: ref(100) }),
    template: `<div class="mc-col" style="gap:20px;max-width:720px">
      <span class="mc-over">Une seule page</span><McPagination :total="18" :noun="applications" />
      <span class="mc-over">Trois pages, la deuxième</span><McPagination :total="65" :noun="applications" v-model:page="b" />
      <span class="mc-over">Longue liste, début</span><McPagination :total="296" :noun="{ one: 'flux', many: 'flux' }" v-model:page="c" />
      <span class="mc-over">Longue liste, milieu</span><McPagination :total="296" :noun="{ one: 'flux', many: 'flux' }" v-model:page="d" />
      <span class="mc-over">Longue liste, fin</span><McPagination :total="296" :noun="{ one: 'flux', many: 'flux' }" v-model:page="e" />
      <span class="mc-over">Un élément</span><McPagination :total="1" :noun="{ one: 'contrat', many: 'contrats' }" />
      <span class="mc-over">Aucun élément, sans taille de page</span><McPagination :total="0" :noun="{ one: 'machine', many: 'machines' }" hide-page-size />
      <span class="mc-over">Milliers</span><McPagination :total="12480" :noun="{ one: 'objet', many: 'objets' }" v-model:page="f" v-model:page-size="g" />
    </div>`,
  }),
}
