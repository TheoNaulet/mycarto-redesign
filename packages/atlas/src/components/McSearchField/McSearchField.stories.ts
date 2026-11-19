import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McSearchField from './McSearchField.vue'

const meta = {
  title: 'Saisie/SearchField',
  component: McSearchField,
  args: { placeholder: 'Rechercher dans la carte', shortcut: 'F', count: '2 sur 7', size: 'md', disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Recherche locale dans une carte, un panneau ou un tableau. Loupe à gauche, raccourci à droite, croix pour effacer dès qu’il y a une saisie et compteur « 2 sur 7 ». Entrée passe au résultat suivant, Maj + Entrée au précédent, Échap efface. La recherche globale de cartes passe par la CommandPalette (⌘K).',
      },
    },
  },
  render: (args) => ({
    components: { McSearchField },
    setup: () => ({ args, value: ref('') }),
    template: '<div style="max-width:360px"><McSearchField v-bind="args" v-model="value" /></div>',
  }),
} satisfies Meta<typeof McSearchField>

export default meta
type Story = StoryObj<typeof meta>

/** Écris quelque chose pour voir le compteur et la croix ; la touche F place le curseur dans le champ. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McSearchField },
    setup: () => ({ a: ref(''), b: ref('apogee'), c: ref('apogee'), d: ref('zzz'), e: ref('') }),
    template: `<div style="display:grid;grid-template-columns:140px minmax(0,320px);gap:14px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>Vide, raccourci</span><McSearchField v-model="a" placeholder="Rechercher dans la carte" shortcut="F" />
      <span>Rempli, compteur</span><McSearchField v-model="b" placeholder="Rechercher dans la carte" count="2 sur 7" />
      <span>Focus</span><McSearchField v-model="c" placeholder="Rechercher dans la carte" count="2 sur 7" class="is-focus" />
      <span>Aucun résultat</span><McSearchField v-model="d" placeholder="Rechercher dans la carte" count="Aucun résultat" />
      <span>Petit</span><McSearchField v-model="e" placeholder="Filtrer les applications" size="sm" />
      <span>Désactivé</span><McSearchField placeholder="Rechercher dans la carte" disabled />
    </div>`,
  }),
}

/** Recherche dans une carte : le compteur suit la saisie, Entrée passe au nœud suivant. */
export const Dans_une_carte: Story = {
  name: 'Dans une carte',
  render: () => ({
    components: { McSearchField },
    setup: () => {
      const noeuds = ['APOGEE', 'Apogée Web', 'CALCIUM', 'sophocle', 'Tomcat 5', 'Scolarité', 'APOGEE Batch', 'ASTRE RH']
      const q = ref('')
      const pos = ref(0)
      const trouves = computed(() => (q.value ? noeuds.filter((n) => n.toLowerCase().includes(q.value.toLowerCase())) : []))
      const count = computed(() => (!q.value ? undefined : trouves.value.length ? `${pos.value + 1} sur ${trouves.value.length}` : 'Aucun résultat'))
      const next = () => { if (trouves.value.length) pos.value = (pos.value + 1) % trouves.value.length }
      const previous = () => { if (trouves.value.length) pos.value = (pos.value - 1 + trouves.value.length) % trouves.value.length }
      return { noeuds, q, pos, trouves, count, next, previous, reset: () => (pos.value = 0) }
    },
    template: `<div class="mc-col" style="max-width:360px">
      <McSearchField v-model="q" placeholder="Rechercher dans la carte" shortcut="F" :count="count" @next="next" @previous="previous" @update:model-value="reset" />
      <div class="mc-row">
        <span v-for="n in noeuds" :key="n" class="mc-chip" :class="trouves.includes(n) ? (trouves[pos] === n ? 'filter' : 'tag') : 'neutral'"
          :style="q && !trouves.includes(n) ? 'opacity:.4' : ''">{{ n }}</span>
      </div>
    </div>`,
  }),
}
