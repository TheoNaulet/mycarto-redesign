import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McNode from '../McNode/McNode.vue'
import McContainer from './McContainer.vue'

const meta = {
  title: 'Canevas/Container',
  component: McContainer,
  args: {
    name: 'Scolarité',
    type: 'Domaine',
    layer: 'fonctionnel',
    icon: 'folder',
    count: 10,
    countLabel: '10 applications',
    variant: 'default',
    collapsible: true,
    selected: false,
    dimmed: false,
    empty: false,
    collapsed: false,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'zone', 'env'] },
    layer: { control: 'inline-radio', options: ['metier', 'fonctionnel', 'applicatif', 'technique'] },
  },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Un objet qui en regroupe d’autres : domaine, site, rack, machine, quartier, direction ; ou un environnement (PROD, DEV) avec `variant="env"`, sans onglet car ce n’est pas un objet. En-tête de 40px : tuile, nom, compteur (il dit ce qu’il compte au survol), bouton de repli (`v-model:collapsed`). Les enfants vont dans le slot par défaut.\n\nTrois niveaux d’imbrication au plus à l’écran ; au-delà, replier et proposer d’ouvrir la carte de l’enfant. Événements : `select` (clic sur l’en-tête), `open` (double-clic).',
      },
    },
  },
  render: (args) => ({
    components: { McContainer, McNode },
    setup: () => ({ args }),
    template: `<McContainer v-bind="args" v-model:collapsed="args.collapsed" style="width:236px">
      <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="32 utilisateurs" main />
      <McNode layer="applicatif" icon="app" type="Application" name="APOGEE WEB" subtitle="Inscriptions en ligne" />
    </McContainer>`,
  }),
} satisfies Meta<typeof McContainer>

export default meta
type Story = StoryObj<typeof meta>

/** Clique sur le chevron pour replier ; change la variante dans les contrôles. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McContainer, McNode },
    setup: () => {
      const rh = ref(true)
      const sel = ref(true)
      return { rh, sel }
    },
    template: `<div class="mc-row lg" style="align-items:flex-start;gap:24px">
      <div class="mc-col" style="width:264px">
        <span class="mc-over">Repos, imbriqué</span>
        <McContainer name="Paris" type="Site" layer="technique" icon="pin" :count="9" count-label="9 machines">
          <McContainer name="Rack 1" type="Rack" layer="technique" icon="rack" :count="8" count-label="8 machines" style="width:100%;--gbg:var(--surface)">
            <McNode layer="technique" icon="server" type="Machine" name="sophocle" subtitle="Machine physique" density="compact" />
            <McNode layer="technique" icon="server" type="Machine" name="protagoras" subtitle="Machine physique" density="compact" />
          </McContainer>
        </McContainer>
      </div>
      <div class="mc-col" style="width:250px">
        <span class="mc-over">Environnement</span>
        <McContainer name="Production" layer="technique" variant="env" :count="2" count-label="2 composants">
          <McNode layer="technique" icon="chip" type="Composant" name="Oracle Forms" subtitle="Oracle 11R2" density="compact" />
          <McNode layer="technique" icon="chip" type="Composant" name="WS_APOGEE" subtitle="Apache 2.6" density="compact" />
        </McContainer>
        <span class="mc-over" style="margin-top:8px">Replié</span>
        <McContainer v-model:collapsed="rh" name="Ressources humaines" type="Domaine" layer="fonctionnel" icon="folder" :count="9" count-label="9 applications">
          <McNode layer="applicatif" icon="app" type="Application" name="SANGRIA" subtitle="Carrières" />
        </McContainer>
        <span class="mc-over" style="margin-top:8px">Vide</span>
        <McContainer name="Recherche" type="Domaine" layer="fonctionnel" icon="folder" :count="0" count-label="0 application" />
      </div>
      <div class="mc-col" style="width:236px">
        <span class="mc-over">Sélectionné (clic sur l’en-tête)</span>
        <McContainer name="Scolarité" type="Domaine" layer="fonctionnel" icon="folder" :count="1" count-label="1 application" :selected="sel" @select="sel = !sel">
          <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="32 utilisateurs" main />
        </McContainer>
        <span class="mc-over" style="margin-top:8px">Estompé</span>
        <McContainer name="Finances" type="Domaine" layer="fonctionnel" icon="folder" :count="1" count-label="1 application" dimmed>
          <McNode layer="applicatif" icon="app" type="Application" name="SIFAC" subtitle="Comptabilité" />
        </McContainer>
      </div>
      <div class="mc-col" style="width:264px">
        <span class="mc-over">Zone</span>
        <McContainer name="Direction des RH" type="Direction" layer="metier" icon="org" variant="zone" :count="1" count-label="1 service">
          <McContainer name="Service Carrière" type="Service" layer="metier" :collapsible="false" style="width:100%;--gbg:var(--surface)">
            <McNode layer="applicatif" icon="app" type="Application" name="SANGRIA" density="compact" />
          </McContainer>
        </McContainer>
      </div>
    </div>`,
  }),
}
