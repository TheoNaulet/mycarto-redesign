// The Storybook shell in the myCarto colours.
import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'myCarto, système de design (concept)',
    brandImage: '/brand/logo-mycarto.svg',
    colorPrimary: '#262e6f',
    colorSecondary: '#262e6f',
    fontBase: '"Noto Sans Variable", system-ui, sans-serif',
    appBg: '#eef1f5',
    barSelectedColor: '#262e6f',
  }),
})
