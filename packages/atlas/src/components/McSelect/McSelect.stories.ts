import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McSelect, { type McSelectOption } from './McSelect.vue'

const groupes: McSelectOption[] = [
  { value: 'complet', label: 'Groupe complet' },
  { value: 'scolarite', label: 'Scolarité' },
  { value: 'rh', label: 'Ressources humaines' },
  { value: 'finances', label: 'Finances', disabled: true },
]

const disponibilite: McSelectOption[] = [
  { value: 1, label: 'Faible', criticity: 1 },
  { value: 2, label: 'Modérée', criticity: 2 },
  { value: 3, label: 'Forte', criticity: 3 },
  { value: 4, label: 'Très forte', criticity: 4 },
]

const etats: McSelectOption[] = [
  { value: 'actif', label: 'Non obsolète', status: 'ok' },
  { value: 'bientot', label: 'Fin de support proche', status: 'warn' },
  { value: 'obsolete', label: 'Obsolète', status: 'critical' },
  { value: 'nc', label: 'Non renseigné', status: 'unknown' },
]

const editeurs: McSelectOption[] = [
  'AMUE', 'Apache Software Foundation', 'Atos', 'Berger-Levrault', 'Cocktail', 'Esup-Portail', 'GFI Informatique',
  'Microsoft', 'Oracle', 'Red Hat', 'Sopra Steria', 'VMware',
].map((label) => ({ value: label, label }))

const meta = {
  title: 'Saisie/Select',
  component: McSelect,
  args: {
    options: editeurs,
    label: 'Éditeur',
    placeholder: 'Non renseigné',
    help: 'L’éditeur doit exister dans les fournisseurs.',
    required: false,
    disabled: false,
    clearable: true,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Choix d’une valeur dans une liste fermée : même boîte que TextField, chevron à droite, liste claire avec une coche sur la valeur choisie. Une recherche apparaît en tête de liste au-delà de 8 options. Au clavier : flèches, Entrée, Échap, et les premières lettres pour aller à une valeur. Les valeurs ordonnées (criticité, état) montrent leur puce.',
      },
    },
  },
  render: (args) => ({
    components: { McSelect },
    setup: () => ({ args, value: ref<string | number | null>('AMUE') }),
    template: `<div class="mc-col" style="max-width:320px;min-height:360px">
      <McSelect v-bind="args" v-model="value" />
      <span class="mc-cap">Valeur : {{ value ?? 'aucune' }}</span>
    </div>`,
  }),
} satisfies Meta<typeof McSelect>

export default meta
type Story = StoryObj<typeof meta>

/** Ouvre la liste au clic ou avec ↓, tape pour filtrer, Entrée pour choisir. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McSelect },
    setup: () => ({
      groupes, disponibilite, etats, editeurs,
      a: ref('complet'), b: ref(null), c: ref(3), d: ref('obsolete'), e: ref(null), f: ref('AMUE'), g: ref('scolarite'), h: ref(2),
    }),
    template: `<div style="display:grid;grid-template-columns:repeat(2,minmax(0,280px));gap:20px 24px;padding-bottom:280px">
      <McSelect label="Rempli" :options="groupes" v-model="a" />
      <McSelect label="Vide" :options="groupes" v-model="b" clearable help="« Non renseigné » vide la valeur." />
      <McSelect label="Disponibilité (criticité)" :options="disponibilite" v-model="c" clearable />
      <McSelect label="État (puce d’état)" :options="etats" v-model="d" />
      <McSelect label="Obligatoire, en erreur" :options="groupes" v-model="e" required error="Choisissez un groupe : la carte ne peut pas être enregistrée sans lui." />
      <McSelect label="Avec recherche (12 options)" :options="editeurs" v-model="f" help="Une recherche apparaît au-delà de 8 options." />
      <McSelect label="Modifié" :options="groupes" v-model="g" modified />
      <McSelect label="Désactivé" :options="disponibilite" v-model="h" disabled />
      <McSelect label="Petit" :options="groupes" v-model="a" size="sm" />
      <McSelect aria-label="Groupe" :options="groupes" v-model="b" />
    </div>`,
  }),
}

/** Liste ouverte au chargement, pour voir le panneau et ses options. */
export const Liste_ouverte: Story = {
  name: 'Liste ouverte',
  render: () => ({
    components: { McSelect },
    setup: () => ({ disponibilite, value: ref(3) }),
    mounted() {
      ;(this.$refs.sel as InstanceType<typeof McSelect>).open()
    },
    template: `<div style="max-width:240px;min-height:240px"><McSelect ref="sel" label="Disponibilité" :options="disponibilite" v-model="value" /></div>`,
  }),
}
