/**
 * Site-wide reveal: headings, text, cards, list items and images settle in as they reach the screen,
 * neighbours slightly one after the other. It runs on every page without any markup: new content
 * (route change, an article body loading) is picked up by a MutationObserver.
 *
 * It uses a CSS animation with `backwards` fill, never a transition and never a final value,
 * so each component keeps its own transitions, hovers and opacity states (tabs, quotes…).
 * Drawings handled by v-draw, menus and anything under [data-no-reveal] are left alone.
 */
import { prefersReduced } from './draw'

const TARGETS = [
  'h1',
  'h2',
  'h3',
  'p',
  'li',
  'dl > div',
  'figure',
  'img',
  'blockquote',
  'table',
  '.btn',
  '.link-more',
  'form',
].join(',')

const SKIP = '[data-draw], [data-no-reveal], .hero, svg, nav, .menu__panel, .qa__a, details, .chips, .toc, .visually-hidden'

const STEP_MS = 70
const MAX_STEPS = 6

let io: IntersectionObserver | null = null

function reveal(el: Element) {
  el.classList.add('rv-in')
}

function scan(root: ParentNode) {
  const found = root.querySelectorAll<HTMLElement>(TARGETS)
  for (const el of found) {
    if (el.classList.contains('rv')) continue
    // One level only: an element inside something already revealed moves with it.
    if (el.parentElement?.closest('.rv')) continue
    if (el.closest(SKIP)) continue
    const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.matches(TARGETS)) : []
    const i = Math.max(0, siblings.indexOf(el))
    el.style.setProperty('--rv-delay', `${Math.min(i, MAX_STEPS) * STEP_MS}ms`)
    el.classList.add('rv')
    io!.observe(el)
  }
}

export function startReveal(roots: string[]) {
  if (prefersReduced() || !('IntersectionObserver' in window)) return
  io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io!.unobserve(e.target)
        reveal(e.target)
      }
    },
    { threshold: 0.08, rootMargin: '0px 0px -4% 0px' },
  )

  let queued = false
  const run = () => {
    queued = false
    roots.forEach((sel) => document.querySelectorAll(sel).forEach((r) => scan(r)))
  }
  run()
  new MutationObserver(() => {
    if (queued) return
    queued = true
    requestAnimationFrame(run)
  }).observe(document.getElementById('app')!, { childList: true, subtree: true })
}
