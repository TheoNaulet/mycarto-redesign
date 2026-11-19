// Storybook de myCarto Atlas : la bibliothèque de composants de l'application (visualiseur et administration).
// Séparé du Storybook du site vitrine (.storybook). Lancement : pnpm storybook:atlas
import type { StorybookConfig } from '@storybook/vue3-vite'
import remarkGfm from 'remark-gfm'

const config: StorybookConfig = {
  framework: { name: '@storybook/vue3-vite', options: { docgen: 'vue-component-meta' } },
  stories: ['../packages/atlas/src/docs/*.mdx', '../packages/atlas/src/**/*.stories.ts'],
  addons: [
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
    '@storybook/addon-a11y',
  ],
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
}

export default config
