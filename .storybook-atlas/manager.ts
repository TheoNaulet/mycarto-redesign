import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'myCarto Atlas · composants de l’application',
    brandImage: '/brand/logo-mycarto.svg',
    colorPrimary: '#262e6f',
    colorSecondary: '#2f78b7',
    fontBase: '"Noto Sans Variable", system-ui, sans-serif',
    appBg: '#eef1f5',
    barSelectedColor: '#2f78b7',
  }),
})
