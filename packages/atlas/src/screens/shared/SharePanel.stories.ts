import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import SharePanel, { type ShareExport } from './SharePanel.vue'
import McButton from '../../components/McButton/McButton.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'

const meta = {
  title: 'Écrans/Partagés/Partage',
  id: 'ecrans-partages-partage',
  component: SharePanel,
  parameters: {
    layout: 'fullscreen',
    pad: false,
    docs: {
      description: {
        component:
          'Panneau « Partager et exporter » d’une carte. « Copier » met vraiment l’adresse de la page dans le presse-papiers (repli : le champ est sélectionné) ; les interrupteurs ajoutent la vue et la lentille au lien, « Qui peut ouvrir » règle l’accès. « Exporter » génère dans le navigateur un fichier PNG, PDF ou SVG (titre, objets par couche, post-its, légende, trame) et le télécharge, puis annonce « Export prêt ». Props : `title`, `items`, `notes`, `link`, `selectionCount`, `closable`. Événements : `close`, `copied(url)`, `exported({ format, fileName, size })`. Monter un `McToastHost` dans l’écran.',
      },
    },
  },
} satisfies Meta<typeof SharePanel>

export default meta
type Story = StoryObj<typeof meta>

export const Partage: Story = {
  render: () => ({
    components: { SharePanel, McButton, McToastHost },
    setup: () => {
      const open = ref(true)
      const log = ref('Aucune action pour l’instant.')
      const onCopied = (url: string) => (log.value = `Lien copié : ${url}`)
      const onExported = (f: ShareExport) => (log.value = `Fichier exporté : ${f.fileName} (${f.size} octets)`)
      return { open, log, onCopied, onExported }
    },
    template: `<div style="position:relative;min-height:100vh;background:var(--canvas);background-image:radial-gradient(var(--canvas-dot) 1px,transparent 1.2px);background-size:24px 24px;font-family:var(--font-sans);color:var(--ink)">
  <div style="position:absolute;top:16px;right:16px;display:flex;gap:8px;align-items:center">
    <span class="mc-cap">{{ log }}</span>
    <McButton variant="outline" icon="export" @click="open = !open">{{ open ? 'Fermer le panneau' : 'Partager et exporter' }}</McButton>
  </div>
  <SharePanel v-if="open" style="position:absolute;top:64px;right:16px;z-index:9" :selection-count="3" @close="open = false" @copied="onCopied" @exported="onExported" />
  <McToastHost />
</div>`,
  }),
}
