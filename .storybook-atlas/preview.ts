// Chaque story reçoit les styles d'Atlas, le thème (clair ou sombre) et un fond : uni, ou trame du canevas.
import type { Preview } from '@storybook/vue3-vite'
import '../packages/atlas/src/styles/atlas.css'
import './preview.css'

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Thème',
      toolbar: {
        title: 'Thème',
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Clair' },
          { value: 'dark', title: 'Sombre' },
        ],
        dynamicTitle: true,
      },
    },
    ground: {
      description: 'Fond',
      toolbar: {
        title: 'Fond',
        icon: 'grid',
        items: [
          { value: 'auto', title: 'Selon le composant' },
          { value: 'surface', title: 'Panneau' },
          { value: 'canvas', title: 'Canevas (trame)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light', ground: 'auto' },
  decorators: [
    (story, context) => {
      const theme = context.globals.theme ?? 'light'
      // Les composants de carte se posent sur la trame du canevas (parameters.canvas), les autres sur un panneau.
      const g = context.globals.ground === 'auto' || !context.globals.ground ? (context.parameters.canvas ? 'canvas' : 'surface') : context.globals.ground
      const padded = context.parameters.pad !== false
      return {
        components: { story },
        setup: () => ({ theme, g, padded }),
        template: `<div class="sb-atlas" :data-theme="theme" :class="['sb-atlas--' + g, { 'sb-atlas--padded': padded }]"><story /></div>`,
      }
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'todo' },
    docs: { codePanel: true },
    options: {
      storySort: {
        order: ['Introduction', 'Fondations', 'Actions', 'Saisie', 'Repères', 'Navigation', 'Surfaces', 'Canevas', 'Accueil', 'Données', 'Écrans'],
      },
    },
  },
}

export default preview
