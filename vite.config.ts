import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'
import type { Plugin as PostcssPlugin } from 'postcss'
import vue from '@vitejs/plugin-vue'
import postcssGlobalData from '@csstools/postcss-global-data'
import postcssCustomMedia from 'postcss-custom-media'

const breakpoints = fileURLToPath(new URL('./src/styles/breakpoints.css', import.meta.url))

/** Fails the build on a breakpoint name that breakpoints.css does not define (a typo, or a fifth tier). */
const unknownBreakpoint: PostcssPlugin = {
  postcssPlugin: 'unknown-breakpoint',
  OnceExit(root) {
    root.walkAtRules('media', (rule) => {
      const name = rule.params.match(/\(--[\w-]+\)/)?.[0]
      if (name) throw rule.error(`Palier inconnu ${name} : les paliers sont dans src/styles/breakpoints.css.`)
    })
  },
}

/**
 * Preloads the two Latin font files from the HTML, so the browser fetches them alongside the CSS
 * instead of discovering them at first paint: the text shows in Outfit and Noto Sans straight away,
 * without a flash of the fallback font.
 */
const preloadFonts = (): Plugin => ({
  name: 'preload-fonts',
  apply: 'build',
  transformIndexHtml(_html, ctx) {
    const files = Object.keys(ctx.bundle ?? {}).filter((f) =>
      /(outfit|noto-sans)-latin-wght-normal-[\w-]+\.woff2$/.test(f),
    )
    return files.map((f) => ({
      tag: 'link',
      attrs: { rel: 'preload', href: `/${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
      injectTo: 'head-prepend' as const,
    }))
  },
})

export default defineConfig({
  plugins: [vue(), preloadFonts()],
  css: {
    postcss: {
      plugins: [
        // Makes the @custom-media of breakpoints.css known to every stylesheet, then replaces the names
        // (`@media (--bp-m)`) with their values. Storybook reads this same config.
        postcssGlobalData({ files: [breakpoints] }),
        postcssCustomMedia(),
        unknownBreakpoint,
      ],
    },
  },
})
