import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McFormField from './McFormField.vue'
import McSelect from '../McSelect/McSelect.vue'
import McTextField from '../McTextField/McTextField.vue'
import McIconButton from '../McIconButton/McIconButton.vue'

const editeurs = ['AMUE', 'Apache Software Foundation', 'Cocktail', 'Esup-Portail', 'Oracle', 'Red Hat'].map((label) => ({ value: label, label }))
const disponibilite = [
  { value: 1, label: 'Faible', criticity: 1 as const },
  { value: 2, label: 'Modérée', criticity: 2 as const },
  { value: 3, label: 'Forte', criticity: 3 as const },
  { value: 4, label: 'Très forte', criticity: 4 as const },
]

const meta = {
  title: 'Saisie/FormField',
  component: McFormField,
  args: { label: 'Éditeur', required: false, help: 'L’éditeur doit exister dans les fournisseurs.', error: '', modified: false, disabled: false },
  parameters: {
    docs: {
      description: {
        component:
          'Ligne de formulaire : libellé au-dessus, le champ (slot par défaut), ses actions à droite (+ créer, ↗ ouvrir la fiche, ↺ revenir à la valeur d’origine quand elle est modifiée), puis l’aide ou l’erreur. Le slot reçoit `id`, `describedBy` et `invalid` à poser sur un champ natif. Grille de 2 colonnes dans une modale large, 1 colonne dans l’inspecteur.',
      },
    },
  },
  render: (args) => ({
    components: { McFormField, McSelect, McIconButton },
    setup: () => ({ args, editeurs, value: ref<string | number | null>('AMUE') }),
    template: `<div style="max-width:360px;min-height:300px">
      <McFormField v-bind="args" @reset="value = 'AMUE'">
        <McSelect :options="editeurs" v-model="value" :aria-label="args.label" :disabled="args.disabled" />
        <template #actions>
          <McIconButton size="sm" icon="plus" label="Créer un éditeur" :disabled="args.disabled" />
          <McIconButton size="sm" icon="external" label="Ouvrir la fiche de l’éditeur" :disabled="args.disabled || !value" />
        </template>
      </McFormField>
    </div>`,
  }),
} satisfies Meta<typeof McFormField>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Repos, obligatoire, modifié (↺ remet la valeur d'origine), erreur, désactivé, avec actions. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McFormField, McSelect, McTextField, McIconButton },
    setup: () => {
      const nom = ref('ASTRE RH')
      const dispoOrigine = 2
      const dispo = ref<string | number | null>(3)
      const date = ref('14/13/2021')
      const editeur = ref<string | number | null>('AMUE')
      const code = ref('CONT000015')
      return { editeurs, disponibilite, nom, dispo, dispoOrigine, dispoModifiee: computed(() => dispo.value !== dispoOrigine), date, editeur, code }
    },
    template: `<div class="mc-grid2" style="max-width:640px;padding-bottom:220px">
      <McFormField label="Nom de l’application" required v-slot="f">
        <McTextField v-model="nom" :aria-label="f.label" required />
      </McFormField>
      <McFormField label="Disponibilité" :modified="dispoModifiee" @reset="dispo = dispoOrigine" help="Faites ↺ pour revenir à « Modérée ».">
        <McSelect :options="disponibilite" v-model="dispo" aria-label="Disponibilité" />
      </McFormField>
      <McFormField label="Date de mise en service" error="Date invalide : utilisez le format JJ/MM/AAAA." v-slot="f">
        <McTextField v-model="date" icon-end="calendar" :aria-label="f.label" />
      </McFormField>
      <McFormField label="Éditeur" help="L’éditeur doit exister dans les fournisseurs.">
        <McSelect :options="editeurs" v-model="editeur" aria-label="Éditeur" clearable />
        <template #actions>
          <McIconButton size="sm" icon="plus" label="Créer un éditeur" />
          <McIconButton size="sm" icon="external" label="Ouvrir la fiche de l’éditeur" />
        </template>
      </McFormField>
      <McFormField label="Contrat" disabled help="Le contrat est géré par la direction des achats.">
        <McTextField v-model="code" aria-label="Contrat" disabled />
        <template #actions><McIconButton size="sm" icon="external" label="Ouvrir le contrat" disabled /></template>
      </McFormField>
      <McFormField label="Champ natif" help="Le slot reçoit id, describedBy et invalid." v-slot="f">
        <div class="mc-input"><input :id="f.id" :aria-describedby="f.describedBy" :aria-invalid="f.invalid || undefined" placeholder="ex. Scolarité" /></div>
      </McFormField>
    </div>`,
  }),
}
