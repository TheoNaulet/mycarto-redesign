import type { Directive } from 'vue'

/**
 * v-draw: the page's one motion idea, "la carte se dessine toute seule".
 * A drawing (rail, flow, chart, layers) traces itself once, when it comes into view.
 *
 * The directive only sets `data-draw` (the start state) and later `is-drawn` (the end state);
 * each component says in CSS what drawing means for it. Without JavaScript, or with reduced
 * motion, the element is drawn from the start. An optional callback runs once it is drawn.
 */

type OnDrawn = ((el: Element) => void) | undefined

const callbacks = new WeakMap<Element, OnDrawn>()
let io: IntersectionObserver | null = null

const prefersReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function draw(el: Element) {
  el.classList.add('is-drawn')
  callbacks.get(el)?.(el)
  callbacks.delete(el)
}

function observer() {
  io ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        io!.unobserve(e.target)
        draw(e.target)
      }
    },
    { threshold: 0.12, rootMargin: '0px 0px -4% 0px' },
  )
  return io
}

export const vDraw: Directive<Element, OnDrawn> = {
  mounted(el, binding) {
    callbacks.set(el, binding.value)
    if (prefersReduced() || !('IntersectionObserver' in window)) {
      el.classList.add('is-drawn')
      callbacks.delete(el)
      return
    }
    el.setAttribute('data-draw', '')
    observer().observe(el)
  },
  unmounted(el) {
    io?.unobserve(el)
    callbacks.delete(el)
  },
}

export { prefersReduced }
