import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import ImportPanel, { type ImportResult } from './ImportPanel.vue'
import McButton from '../../components/McButton/McButton.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'

const meta = {
  title: 'Écrans/Partagés/Import',
  id: 'ecrans-partages-import',
  component: ImportPanel,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Import d’objets depuis un tableur, en modale. 1. Déposer ou choisir un fichier (un CSV est vraiment lu : colonnes, lignes, exemple ; un classeur Excel est lu de façon simplifiée), ou prendre le fichier d’exemple, ou télécharger le modèle CSV. 2. Associer chaque colonne à un champ myCarto (association automatique par nom, le champ obligatoire et les doublons sont vérifiés). 3. Importer avec une barre de progression, puis toast et « Voir dans l’explorateur ». Props : `v-model:open`, `type`, `fields`, `resultPath`. Événement : `imported({ fileName, count, mapping })`.',
      },
    },
  },
} satisfies Meta<typeof ImportPanel>

export default meta
type Story = StoryObj<typeof meta>

export const Import: Story = {
  render: () => ({
    components: { ImportPanel, McButton, McToastHost },
    setup: () => {
      const open = ref(true)
      const log = ref('Aucun import pour l’instant.')
      const onImported = (r: ImportResult) => (log.value = `${r.fileName} : ${r.count} objets, champs ${Object.values(r.mapping).join(', ')}`)
      return { open, log, onImported }
    },
    template: `<div style="min-height:100vh;padding:24px;box-sizing:border-box;background:var(--canvas);font-family:var(--font-sans);color:var(--ink);display:flex;gap:12px;align-items:flex-start">
  <McButton icon="upload" @click="open = true">Importer des applications</McButton>
  <span class="mc-cap" style="padding-top:8px">{{ log }}</span>
  <ImportPanel v-model:open="open" @imported="onImported" />
  <McToastHost />
</div>`,
  }),
}
