// Every story gets the site's fonts and global styles, a router for the links, and a ground to sit on.
import type { Preview } from '@storybook/vue3-vite'
import { setup } from '@storybook/vue3-vite'
import { createMemoryHistory, createRouter } from 'vue-router'
import '@fontsource-variable/outfit'
import '@fontsource-variable/noto-sans'
import '../src/styles/base.css'
import '../src/styles/forms.css'
import './preview.css'

// Links inside stories resolve against an empty router: they render real hrefs but go nowhere.
const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
})

setup((app) => {
  app.use(router)
})

/** The four grounds of the site. Navy also sets `.on-navy`, as the sections do. */
const grounds = {
  paper: 'var(--paper)',
  cool: 'var(--paper-cool)',
  yellow: 'var(--yellow)',
  navy: 'var(--navy)',
} as const

const preview: Preview = {
  globalTypes: {
    ground: {
      description: 'Fond de la section',
      toolbar: {
        title: 'Fond',
        icon: 'paintbrush',
        items: [
          { value: 'paper', title: 'Papier' },
          { value: 'cool', title: 'Gris clair' },
          { value: 'yellow', title: 'Jaune' },
          { value: 'navy', title: 'Navy' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { ground: 'paper' },
  decorators: [
    (story, context) => {
      // A story can pin its ground (parameters.ground); otherwise the toolbar decides.
      const ground = (context.parameters.ground ?? context.globals.ground ?? 'paper') as keyof typeof grounds
      // Stories sit in the site's gutter, except full-width ones (parameters.pad: false).
      const padded = context.parameters.pad !== false
      return {
        components: { story },
        setup: () => ({ ground, background: grounds[ground], padded }),
        template: `<div class="sb-ground" :class="{ 'on-navy': ground === 'navy', 'sb-ground--padded': padded }" :style="{ background }"><story /></div>`,
      }
    },
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: ['Introduction', 'Fondations', 'Briques', 'Navigation', 'Produit', 'Clients'],
      },
    },
  },
}

export default preview
