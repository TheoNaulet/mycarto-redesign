import type { Meta, StoryObj } from '@storybook/vue3-vite'
import McToast from './McToast.vue'
import McToastHost from './McToastHost.vue'
import { useToast } from './useToast'
import McButton from '../McButton/McButton.vue'

const meta = {
  title: 'Surfaces/Toast',
  component: McToast,
  args: { status: 'ok', message: 'Application enregistrée', actionLabel: 'Annuler', closable: true, duration: 0 },
  parameters: {
    docs: {
      description: {
        component:
          'Message bref en bas au centre, qui confirme une action ou signale un échec. Rond d’état à gauche, action en jaune, croix. **Succès : 4 s puis disparaît (le délai s’arrête au survol). Erreur : reste jusqu’à fermeture.** Message = le fait, au passé (« Application enregistrée ») ; erreur = ce qui a échoué + quoi faire. **Un seul toast à la fois** : le suivant remplace le précédent. Dans l’application, monter un `McToastHost` et appeler `useToast().success(…)`, `.error(…)`, `.info(…)`.',
      },
    },
  },
} satisfies Meta<typeof McToast>

export default meta
type Story = StoryObj<typeof meta>

/** `duration` à 0 ici pour qu’il reste affiché pendant les essais. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Chaque état, affichés en permanence. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McToast },
    template: `<div class="mc-col" style="align-items:center">
      <McToast status="ok" message="Application enregistrée" action-label="Annuler" :duration="0" />
      <McToast status="ok" message="Lien de la carte copié" :duration="0" />
      <McToast status="info" message="Anne Simon modifie aussi cette carte" :duration="0" />
      <McToast status="critical" message="Export impossible : la carte dépasse 2 000 nœuds. Filtrez-la puis réessayez." />
      <McToast status="critical" message="Enregistrement impossible : le serveur n’a pas répondu." action-label="Réessayer" />
      <McToast status="ok" message="3 applications déplacées dans la corbeille" action-label="Annuler" :closable="false" :duration="0" />
    </div>`,
  }),
}

/** Les boutons appellent `useToast()` ; `McToastHost` affiche un toast à la fois, en bas au centre. */
export const Avec_useToast: Story = {
  name: 'Avec useToast',
  parameters: { pad: false },
  render: () => ({
    components: { McToastHost, McButton },
    setup: () => {
      const toast = useToast()
      return {
        saved: () => toast.success('Application enregistrée', { actionLabel: 'Annuler', onAction: () => toast.info('Modification annulée') }),
        copied: () => toast.success('Lien de la carte copié'),
        failed: () =>
          toast.error('Export impossible : la carte dépasse 2 000 nœuds. Filtrez-la puis réessayez.', {
            actionLabel: 'Réessayer',
            onAction: () => toast.success('Carte exportée en PDF'),
          }),
        info: () => toast.info('Anne Simon modifie aussi cette carte'),
      }
    },
    template: `<div style="position:relative;height:360px;padding:24px" class="mc-canvas">
      <div class="mc-row">
        <McButton icon="check" @click="saved">Enregistrer</McButton>
        <McButton variant="outline" icon="link" @click="copied">Copier le lien</McButton>
        <McButton variant="outline" icon="export" @click="failed">Exporter (échec)</McButton>
        <McButton variant="ghost" icon="info" @click="info">Information</McButton>
      </div>
      <McToastHost contained />
    </div>`,
  }),
}
