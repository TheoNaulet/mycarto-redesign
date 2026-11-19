import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McNode from './McNode.vue'

const meta = {
  title: 'Canevas/Node',
  component: McNode,
  args: { name: 'APOGEE', type: 'Application', layer: 'applicatif', icon: 'app', subtitle: '32 utilisateurs' },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Le nœud de carte, composant central de myCarto. **L’onglet** dit le type et porte la couleur de la couche. **L’état** passe par l’icône à droite et, sous une lentille, par la couleur de fond. Les deux ne se remplacent jamais. Un même objet n’apparaît qu’une fois par carte.\n\nÉvénements : `select` (clic), `open` (double-clic ou Entrée).',
      },
    },
  },
  render: (args) => ({
    components: { McNode },
    setup: () => ({ args }),
    template: '<McNode v-bind="args" />',
  }),
} satisfies Meta<typeof McNode>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Les_quatre_couches: Story = {
  name: 'Les quatre couches',
  render: () => ({
    components: { McNode },
    template: `<div class="mc-row lg">
      <McNode layer="metier" icon="process" type="Processus" name="M1.4 Suivi de la scolarité" subtitle="Formation et vie étudiante" />
      <McNode layer="fonctionnel" icon="folder" type="Domaine" name="Scolarité" subtitle="10 applications" />
      <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="32 utilisateurs" main />
      <McNode layer="technique" icon="cloud" type="VM" name="pythagore" subtitle="Ubuntu 22.04" />
    </div>`,
  }),
}

export const Etats_d_interaction: Story = {
  name: 'États d’interaction',
  render: () => ({
    components: { McNode },
    template: `<div class="mc-row lg">
      <McNode layer="applicatif" icon="app" type="Application" name="CALCIUM" subtitle="Repos" />
      <McNode layer="applicatif" icon="app" type="Application" name="APOGEE WEB" subtitle="Sélectionné" selected />
      <McNode layer="applicatif" icon="app" type="Application" name="APOIP" subtitle="Trouvé par la recherche" match />
      <McNode layer="applicatif" icon="app" type="Application" name="DIEGO" subtitle="Estompé" dimmed />
    </div>`,
  }),
}

export const Etats_de_donnees: Story = {
  name: 'Chargement et erreur',
  render: () => ({
    components: { McNode },
    template: `<div class="mc-row lg">
      <McNode layer="applicatif" icon="app" type="Application" name="" loading />
      <McNode layer="applicatif" icon="app" type="Application" name="SANGRIA" error />
    </div>`,
  }),
}

export const Sous_une_lentille: Story = {
  name: 'Sous une lentille',
  render: () => ({
    components: { McNode },
    template: `<div class="mc-row lg">
      <McNode layer="technique" icon="software" type="Logiciel" name="Tomcat 5" subtitle="Obsolète depuis 2012" status="critical" lens />
      <McNode layer="technique" icon="software" type="Logiciel" name="Apache 2.6" subtitle="Fin de support 2027" status="warn" lens />
      <McNode layer="technique" icon="software" type="Logiciel" name="Debian 12" subtitle="Supporté" status="ok" lens />
      <McNode layer="technique" icon="software" type="Logiciel" name="fichier plat" subtitle="Fin de support NC" status="unknown" lens />
    </div>`,
  }),
}

export const Compact_et_appartenance: Story = {
  name: 'Compact et appartenance',
  render: () => ({
    components: { McNode },
    template: `<div class="mc-row lg" style="padding-bottom:12px">
      <McNode layer="applicatif" icon="app" type="Application" name="TROMBINOSCOPE" density="compact" />
      <McNode layer="technique" icon="server" type="Machine" name="ESX3" subtitle="Machine physique" member="Cluster philosophe" />
    </div>`,
  }),
}
