/**
 * Stylelint, as a guard on the two rules of the CSS (see the Storybook "Fondations" pages):
 * - media queries only use the four named breakpoints of src/styles/breakpoints.css;
 * - no !important, except the one documented exception in base.css (reduced motion).
 * It checks the .css files and the <style> blocks of the .vue files: `pnpm lint:css`.
 */
export default {
  overrides: [{ files: ['**/*.vue'], customSyntax: 'postcss-html' }],
  rules: {
    'declaration-no-important': true,
    'media-feature-name-allowed-list': [
      ['/^--bp-(xs|s|m|l)$/', 'prefers-reduced-motion', 'hover'],
      { message: (name) => `« ${name} » : utiliser un palier de src/styles/breakpoints.css (--bp-l, --bp-m, --bp-s, --bp-xs).` },
    ],
  },
}
