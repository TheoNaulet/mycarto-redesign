import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import McNode from '../McNode/McNode.vue'
import McStickyNote from './McStickyNote.vue'

const meta = {
  title: 'Canevas/StickyNote',
  component: McStickyNote,
  args: {
    text: 'APOGEE dépend encore de Tomcat 5. Migration prévue ?',
    color: 'yellow',
    editable: true,
    author: { initials: 'WV', name: 'William', color: 4 },
    date: '07/07',
    rotation: -1.5,
    pinnedTo: undefined,
    maxLength: 140,
  },
  argTypes: {
    color: { control: 'inline-radio', options: ['yellow', 'blue', 'green', 'pink'] },
    rotation: { control: { type: 'range', min: -3, max: 3, step: 0.5 } },
    pinnedTo: { control: 'text' },
  },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Post-it d’annotation posé sur la carte : une remarque, une question, une décision. 168 × 140 au minimum, coin bas-gauche arrondi (le coin corné du logo), texte Outfit 15px semi-gras, auteur et date en pied. Jaune par défaut, puis bleu, vert, rose ; les mêmes dans les deux thèmes.\n\n`editable` rend le texte modifiable (`v-model:text`) avec un compteur : au-delà de 140 caractères, préférer un commentaire. `pinnedTo` l’épingle à un nœud (il le suit) : punaise en haut et nom du nœud en pied.',
      },
    },
  },
  render: (args) => ({
    components: { McStickyNote },
    setup: () => ({ args }),
    template: '<McStickyNote v-bind="args" v-model:text="args.text" />',
  }),
} satisfies Meta<typeof McStickyNote>

export default meta
type Story = StoryObj<typeof meta>

/** Écris dans le post-it : le compteur suit. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McStickyNote, McNode },
    setup: () => ({
      draft: ref(''),
      long: ref(
        'Le contrat AMUE arrive à échéance en septembre et couvre APOGEE, APOGEE WEB et le module de bourses : il faut prévoir la consultation avant la rentrée, sinon nous serons hors support.',
      ),
    }),
    template: `<div class="mc-row lg" style="align-items:flex-start;gap:28px;padding-top:12px">
      <McStickyNote text="APOGEE dépend encore de Tomcat 5. Migration prévue ?" :author="{ initials: 'WV', name: 'William', color: 1 }" date="07/07" />
      <McStickyNote color="blue" :rotation="-1.5" text="Vérifier le contrat AMUE avant la rentrée" :author="{ initials: 'SF', name: 'Samuel', color: 4 }" date="08/07" />
      <McStickyNote color="green" text="Validé en comité SI" :author="{ initials: 'GB', name: 'Gwenaël', color: 5 }" date="09/07" />
      <McStickyNote color="pink" :rotation="1" text="Qui est référent technique de CALCIUM ?" :author="{ initials: 'AR', name: 'Antoine', color: 6 }" date="10/07" />
      <div style="position:relative;width:220px;height:250px">
        <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="32 utilisateurs" style="position:absolute;left:0;top:0;margin:0" />
        <McStickyNote text="Migration Tomcat prévue en 2027" pinned-to="APOGEE" :author="{ initials: 'LF', name: 'Lionel', color: 3 }" date="11/07" style="position:absolute;left:24px;top:84px" />
      </div>
      <McStickyNote v-model:text="draft" editable :author="{ initials: 'TN', name: 'Vous', color: 2 }" date="Aujourd’hui" />
      <McStickyNote v-model:text="long" editable color="blue" :author="{ initials: 'TN', name: 'Vous', color: 2 }" date="Aujourd’hui" />
    </div>`,
  }),
}
