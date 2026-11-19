import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McAvatar from './McAvatar.vue'
import McAvatarStack from './McAvatarStack.vue'

const equipe = [
  { name: 'Anne Rivière', role: 'Référente métier Scolarité', color: 1 as const },
  { name: 'Louis Fabre', role: 'Responsable d’APOGEE', color: 4 as const },
  { name: 'Pauline Garnier', role: 'Administratrice de sophocle', color: 5 as const },
  { name: 'Marc Delmas', role: 'Chef de projet CALCIUM', color: 2 as const },
  { name: 'Sophie Nguyen', role: 'Architecte', color: 3 as const },
  { name: 'Karim Benali', role: 'Exploitant', color: 6 as const },
  { name: 'Claire Morel', role: 'DSI' },
]

const meta = {
  title: 'Repères/Avatar',
  component: McAvatar,
  args: { name: 'Anne Rivière', role: 'Référente métier Scolarité', color: 1, size: 'lg' },
  argTypes: { color: { control: { type: 'inline-radio' }, options: [1, 2, 3, 4, 5, 6] } },
  parameters: {
    docs: {
      description: {
        component:
          'Initiales d’une personne : utilisateur connecté, auteur d’un post-it, référent, présence sur une carte. Chaque personne a une couleur stable (data-1 à 6), la même pour son avatar, son curseur et ses post-its ; l’infobulle donne le nom complet et le rôle. `McAvatarStack` empile les avatars avec « +N ».',
      },
    },
  },
} satisfies Meta<typeof McAvatar>

export default meta
type Story = StoryObj<typeof meta>

/** Survole l'avatar pour lire le nom et le rôle. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McAvatar, McAvatarStack },
    setup: () => ({ equipe, couleurs: [1, 2, 3, 4, 5, 6] }),
    template: `<div style="display:grid;grid-template-columns:180px auto;gap:14px 24px;align-items:center;font-size:12px;color:var(--ink-muted)">
      <span>6 couleurs, md</span><div class="mc-row"><McAvatar v-for="c in couleurs" :key="c" :color="c" :name="equipe[c - 1].name" :role="equipe[c - 1].role" /></div>
      <span>6 couleurs, lg</span><div class="mc-row"><McAvatar v-for="c in couleurs" :key="c" :color="c" :name="equipe[c - 1].name" size="lg" /></div>
      <span>Couleur déduite du nom</span><div class="mc-row"><McAvatar name="Claire Morel" /><McAvatar name="sophocle" /><McAvatar name="Jean-Pierre Durand" initials="JP" /></div>
      <span>Pile, 3 visibles</span><McAvatarStack :people="equipe" label="Personnes sur la carte" />
      <span>Pile, lg, 5 visibles</span><McAvatarStack :people="equipe" :max="5" size="lg" />
      <span>Pile sans débordement</span><McAvatarStack :people="equipe.slice(0, 2)" />
    </div>`,
  }),
}

/** Présence sur une carte : les personnes qui la regardent en ce moment. */
export const Pile: Story = {
  name: 'Pile d’avatars',
  render: () => ({
    components: { McAvatarStack },
    setup: () => ({ equipe }),
    template: `<div class="mc-row"><McAvatarStack :people="equipe" :max="3" label="Personnes sur la carte" /><span class="mc-cap">{{ equipe.length }} personnes sur la carte</span></div>`,
  }),
}
