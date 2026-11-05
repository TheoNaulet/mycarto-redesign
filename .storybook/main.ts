// Storybook for the myCarto concept: the design system (tokens, breakpoints, components) next to the site.
// It reads vite.config.ts, so the components build exactly as on the site (custom media included).
import type { StorybookConfig } from '@storybook/vue3-vite'
import remarkGfm from 'remark-gfm'

const config: StorybookConfig = {
  // vue-component-meta reads the props from the TypeScript types, with their doc comments.
  framework: { name: '@storybook/vue3-vite', options: { docgen: 'vue-component-meta' } },
  stories: ['../src/docs/*.mdx', '../src/**/*.stories.ts'],
  addons: [
    // GitHub-flavoured Markdown, for the tables of the documentation pages.
    { name: '@storybook/addon-docs', options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } } },
    '@storybook/addon-a11y',
  ],
  staticDirs: ['../public'],
  core: { disableTelemetry: true },
}

export default config
