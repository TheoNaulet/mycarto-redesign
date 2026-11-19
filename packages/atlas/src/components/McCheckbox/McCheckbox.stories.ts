import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McCheckbox from './McCheckbox.vue'

const meta = {
  title: 'Saisie/Checkbox',
  component: McCheckbox,
  args: { label: 'Afficher les applications', disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Case à cocher pour une sélection multiple : lignes de tableau, types d’objets à afficher. Toute la ligne est cliquable ; la case partielle (tiret) dit qu’une partie des éléments est cochée. Pour un réglage qui prend effet tout de suite, utiliser Switch.',
      },
    },
  },
  render: (args) => ({
    components: { McCheckbox },
    setup: () => ({ args, value: ref(true) }),
    template: '<div class="mc-col"><McCheckbox v-bind="args" v-model="value" /><span class="mc-cap">Valeur : {{ value }}</span></div>',
  }),
} satisfies Meta<typeof McCheckbox>

export default meta
type Story = StoryObj<typeof meta>

/** Clic ou Espace pour cocher. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McCheckbox },
    setup: () => ({ a: ref(false), b: ref(true), c: ref(false), mixed: ref(true) }),
    template: `<div class="mc-col">
      <div class="mc-row lg">
        <McCheckbox v-model="a" label="Non cochée" />
        <McCheckbox v-model="b" label="Cochée" />
        <McCheckbox v-model="c" v-model:indeterminate="mixed" label="Partielle" />
        <McCheckbox label="Désactivée" disabled />
        <McCheckbox :model-value="true" label="Cochée, désactivée" disabled />
      </div>
      <div class="mc-row lg">
        <McCheckbox label="Survol (passer la souris)" />
        <McCheckbox label="Focus (Tab)" />
        <McCheckbox aria-label="Sélectionner APOGEE" />
        <McCheckbox v-model="b">Libellé en <b>slot</b> : Scolarité</McCheckbox>
      </div>
    </div>`,
  }),
}

/** En-tête de tableau : la case du haut est partielle quand une partie des lignes est cochée. */
export const Selection_de_lignes: Story = {
  name: 'Sélection de lignes',
  render: () => ({
    components: { McCheckbox },
    setup: () => {
      const lignes = ref([
        { nom: 'APOGEE', on: true },
        { nom: 'CALCIUM', on: false },
        { nom: 'sophocle', on: true },
        { nom: 'Tomcat 5', on: false },
      ])
      const nb = computed(() => lignes.value.filter((l) => l.on).length)
      const tout = computed({
        get: () => nb.value === lignes.value.length,
        set: (v: boolean) => lignes.value.forEach((l) => (l.on = v)),
      })
      const partiel = computed({ get: () => nb.value > 0 && nb.value < lignes.value.length, set: () => {} })
      return { lignes, nb, tout, partiel }
    },
    template: `<div class="mc-col" style="max-width:280px">
      <McCheckbox v-model="tout" v-model:indeterminate="partiel">
        <b>{{ nb === 0 ? 'Aucune ligne sélectionnée' : nb === 1 ? '1 ligne sélectionnée' : nb + ' lignes sélectionnées' }}</b>
      </McCheckbox>
      <hr class="mc-hr" />
      <McCheckbox v-for="l in lignes" :key="l.nom" v-model="l.on" :label="l.nom" />
    </div>`,
  }),
}
