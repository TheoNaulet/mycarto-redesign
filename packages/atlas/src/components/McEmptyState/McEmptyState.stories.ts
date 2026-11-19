import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn } from 'storybook/test'
import { ref } from 'vue'
import McEmptyState from './McEmptyState.vue'
import McErrorState from './McErrorState.vue'
import McButton from '../McButton/McButton.vue'

const meta = {
  title: 'Données/EmptyState',
  component: McEmptyState,
  args: {
    icon: 'filter',
    layer: 'applicatif',
    title: 'Aucune application ne correspond à ces filtres',
    text: 'Retirez un filtre, ou cherchez dans toutes les couches.',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        component:
          'Ce qu’on voit quand il n’y a rien (`McEmptyState`) ou quand le chargement a échoué (`McErrorState`). Le vide dit **pourquoi** c’est vide et **quoi faire**, avec une action. L’erreur dit ce qui n’a pas marché, rassure sur les données et propose « Réessayer » (événement `retry`). Le détail technique est replié.',
      },
    },
  },
  render: (args) => ({
    components: { McEmptyState, McButton },
    setup: () => ({ args }),
    template: `<McEmptyState v-bind="args"><template #action><McButton variant="outline" size="sm" icon="x">Effacer les filtres</McButton></template></McEmptyState>`,
  }),
} satisfies Meta<typeof McEmptyState>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Recherche, filtre, carte vide, liste vide compacte, erreur, erreur compacte avec détails. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McEmptyState, McErrorState, McButton },
    setup: () => ({ onRetry: fn() }),
    template: `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">
      <div style="border:1px solid var(--line);border-radius:var(--radius-md)">
        <McEmptyState icon="search" title="Aucun objet ne s’appelle « apogé »" text="Vérifiez l’orthographe, ou cherchez dans toutes les couches.">
          <template #action><McButton variant="outline" size="sm" icon="layers">Chercher partout</McButton></template>
        </McEmptyState>
      </div>
      <div style="border:1px solid var(--line);border-radius:var(--radius-md)">
        <McEmptyState icon="filter" title="Aucune application ne correspond à ces filtres" text="Retirez un filtre pour élargir la recherche.">
          <template #action><McButton variant="outline" size="sm" icon="x">Effacer les filtres</McButton></template>
        </McEmptyState>
      </div>
      <div style="border:1px solid var(--line);border-radius:var(--radius-md)">
        <McEmptyState icon="map" layer="metier" title="Cette carte n’a encore aucun objet" text="Ajoutez des objets depuis l’explorateur ou glissez-les sur la carte.">
          <template #action><McButton size="sm" icon="plus">Ajouter des objets</McButton></template>
        </McEmptyState>
      </div>
      <div style="border:1px solid var(--line);border-radius:var(--radius-md)">
        <McEmptyState size="compact" icon="server" layer="technique" title="Aucune machine liée" text="Indiquez où tourne APOGEE pour voir l’impact d’une panne.">
          <template #action><McButton variant="outline" size="sm" icon="plus">Ajouter une machine</McButton></template>
        </McEmptyState>
      </div>
      <div style="border:1px solid var(--line);border-radius:var(--radius-md)">
        <McErrorState title="Impossible de charger les applications" @retry="onRetry" />
      </div>
      <div style="border:1px solid var(--line);border-radius:var(--radius-md)">
        <McErrorState size="compact" title="Les relations n’ont pas pu être chargées" text="Le reste de la fiche reste à jour." details="HTTP 504 · GET /api/applications/APOGEE/relations · délai dépassé après 30 s" @retry="onRetry" />
      </div>
    </div>`,
  }),
}

/** « Réessayer » relance le chargement : roue dans le bouton pendant l’essai. */
export const Erreur: Story = {
  render: () => ({
    components: { McErrorState },
    setup() {
      const retrying = ref(false)
      const retry = () => {
        retrying.value = true
        setTimeout(() => (retrying.value = false), 1500)
      }
      return { retrying, retry }
    },
    template: `<McErrorState title="Impossible de charger les applications" :retrying="retrying" details="HTTP 503 · Service indisponible" @retry="retry" />`,
  }),
}
