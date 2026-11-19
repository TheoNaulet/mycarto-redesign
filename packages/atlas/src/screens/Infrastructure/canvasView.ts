// Zoom, déplacement et recadrage d'un écran de carte plein écran.
// Partagé par les écrans Carte, Impact, Infrastructure, POS et Contrats (comme Explorateur/shell.ts pour les écrans d'administration).
// Les règles de mise en page des panneaux flottants selon la largeur sont dans canvasView.css (classe `mc-scr-map`).
import { computed, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'
import type { McMinimapRect } from '../../components/McMinimap/McMinimap.vue'
import './canvasView.css'

/** Une boîte en coordonnées du canevas (avant zoom). */
export interface ViewBox {
  x: number
  y: number
  w: number
  h: number
}

/** En dessous de cette largeur, la vue d'ensemble se masque (canvasView.css) : la barre d'outils garde sa place. */
export const MINIMAP_MIN_W = 1200
/** Et au-dessous de cette hauteur (1280 × 720…) : elle prendrait le quart de la hauteur. */
export const MINIMAP_MIN_H = 760
/** Largeur prise par la vue d'ensemble, marge comprise. */
const MINIMAP_W = 216
/** Jusqu'à cette largeur l'écran est « étroit » : panneaux resserrés, actions de la barre du haut en icônes. */
export const NARROW_W = 1280

/** Fenêtre étroite (≤ 1280 px de large ou ≤ 760 px de haut), lue à l'ouverture de l'écran : la légende y attend dans la barre d'outils. */
export function isNarrowWindow() {
  return typeof window !== 'undefined' && (window.innerWidth <= NARROW_W || window.innerHeight <= 760)
}

/**
 * Zoom maximal au recadrage selon la taille de la fenêtre : 100 % jusqu'à 1600 × 1000,
 * puis la carte grandit avec l'écran (jusqu'à 130 % sur 2560 × 1440) pour ne pas flotter, minuscule, au milieu.
 */
export function maxFitFor(w: number, h: number) {
  return Math.round(Math.min(1.3, Math.max(1, Math.min(w / 1600, h / 1000))) * 100) / 100
}
/** Zoom minimal au recadrage : en dessous, le texte des nœuds ne se lit plus ; on se déplace dans la carte. */
export const MIN_FIT = 0.5

export interface CanvasViewOptions {
  /** Contenu à cadrer, en coordonnées du canevas. */
  content: () => ViewBox
  /** Place prise à droite par les panneaux (inspecteur, légende), en px écran, marges comprises. */
  rightPanel?: () => number
  /** Hauteur réservée en haut (barre d'application, vues, puces), en px écran. Agrandie si la barre passe sur deux lignes. */
  top?: number
  /** Hauteur réservée en bas (barre d’outils et vue d’ensemble), en px écran. */
  bottom?: number
  /** Hauteur réservée en bas quand la vue d'ensemble est masquée (écran étroit) : la barre d'outils seule. */
  bottomCompact?: number
  /** Marge gauche de la zone libre, en px écran. */
  left?: number
  /** `center` centre le contenu dans la zone libre ; `start` le cale en haut à gauche (centré quand même au-delà de 1600 px de large). */
  align?: 'center' | 'start'
  /** Zoom maximal au recadrage (par défaut, selon la taille de la fenêtre). */
  maxFit?: number
  /** Zoom minimal au recadrage (50 % par défaut). Plus bas pour une vue d'ensemble qui doit tenir entière. */
  minFit?: number
}

/**
 * Le recadrage met tout le contenu dans la zone libre (sous la barre du haut, au-dessus de la barre d'outils,
 * à gauche des panneaux), entre 50 % et 100 % (130 % sur un très grand écran). Il est refait quand la fenêtre change de taille.
 */
export function useCanvasView(root: Ref<HTMLElement | undefined>, opts: CanvasViewOptions) {
  const zoom = ref(1)
  const pan = ref({ x: 0, y: 0 })
  const tool = ref<'select' | 'hand'>('select')
  const size = ref({ w: 1440, h: 900 })
  let fitting = false
  let ro: ResizeObserver | undefined

  const narrow = computed(() => size.value.w <= NARROW_W || size.value.h <= 760)
  const minimapShown = computed(() => size.value.w >= MINIMAP_MIN_W && size.value.h > MINIMAP_MIN_H)

  /** Bas de la barre du haut (fil, vues, puces), qui peut passer sur deux lignes quand l'écran est étroit. */
  function measuredTop() {
    const el = root.value?.querySelector('.mc-canvas-top')
    if (!el) return 0
    const base = root.value!.getBoundingClientRect().top
    let b = 0
    el.querySelectorAll<HTMLElement>(':scope > * > *, :scope > .mc-appbar').forEach((c) => {
      const r = c.getBoundingClientRect()
      if (r.height) b = Math.max(b, r.bottom - base)
    })
    return Math.round(b) + 2
  }

  function fit() {
    const c = opts.content()
    const { w, h } = size.value
    const right = opts.rightPanel?.() ?? 0
    const left = opts.left ?? 16
    const top = Math.max(opts.top ?? 128, measuredTop())
    const bottom = minimapShown.value ? (opts.bottom ?? 156) : (opts.bottomCompact ?? Math.min(opts.bottom ?? 156, 84))
    const availW = Math.max(200, w - left - 16 - right)
    const availH = Math.max(200, h - top - bottom)
    const max = opts.maxFit ?? maxFitFor(w, h)
    const z = Math.round(Math.max(opts.minFit ?? MIN_FIT, Math.min(max, availW / c.w, availH / c.h)) * 100) / 100
    fitting = z !== zoom.value
    zoom.value = z
    const start = opts.align === 'start' && w <= 1600
    pan.value = {
      x: Math.round(left + (start ? 0 : Math.max(0, (availW - c.w * z) / 2)) - c.x * z),
      y: Math.round(top + (start ? 0 : Math.max(0, (availH - c.h * z) / 2)) - c.y * z),
    }
  }

  onMounted(() => {
    const el = root.value!
    size.value = { w: el.clientWidth, h: el.clientHeight }
    fit()
    ro = new ResizeObserver(() => {
      const next = { w: el.clientWidth, h: el.clientHeight }
      if (next.w === size.value.w && next.h === size.value.h) return
      size.value = next
      fit()
    })
    ro.observe(el)
  })
  onBeforeUnmount(() => ro?.disconnect())

  // − et + gardent le centre de la vue en place.
  watch(zoom, (z, old) => {
    if (fitting) return void (fitting = false)
    if (!old || z === old) return
    const cx = size.value.w / 2
    const cy = size.value.h / 2
    pan.value = { x: cx - ((cx - pan.value.x) * z) / old, y: cy - ((cy - pan.value.y) * z) / old }
  })

  let drag: { x: number; y: number; px: number; py: number } | null = null
  function onPointerDown(e: PointerEvent) {
    if (tool.value !== 'hand' && e.button !== 1) return
    if ((e.target as HTMLElement).closest('.mc-float, .mc-tabs, .mc-chip')) return
    drag = { x: e.clientX, y: e.clientY, px: pan.value.x, py: pan.value.y }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: PointerEvent) {
    if (!drag) return
    pan.value = { x: drag.px + e.clientX - drag.x, y: drag.py + e.clientY - drag.y }
  }
  function onPointerUp() {
    drag = null
  }
  function onWheel(e: WheelEvent) {
    if ((e.target as HTMLElement).closest('.mc-float')) return
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      const old = zoom.value
      const z = Math.round(Math.min(4, Math.max(0.1, old * (e.deltaY < 0 ? 1.1 : 1 / 1.1))) * 100) / 100
      // La molette zoome autour du pointeur.
      const r = root.value!.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      fitting = true
      zoom.value = z
      if (z === old) fitting = false
      pan.value = { x: px - ((px - pan.value.x) * z) / old, y: py - ((py - pan.value.y) * z) / old }
    } else {
      pan.value = { x: pan.value.x - e.deltaX, y: pan.value.y - e.deltaY }
    }
  }

  /** Cadre de la vue d'ensemble, en % du contenu. */
  const viewport = computed<McMinimapRect>({
    get() {
      const c = opts.content()
      const z = zoom.value
      const w = Math.min(100, (size.value.w / z / c.w) * 100)
      const h = Math.min(100, (size.value.h / z / c.h) * 100)
      const x = Math.max(0, Math.min(100 - w, ((-pan.value.x / z - c.x) / c.w) * 100))
      const y = Math.max(0, Math.min(100 - h, ((-pan.value.y / z - c.y) / c.h) * 100))
      return { x, y, w, h }
    },
    set(r) {
      const c = opts.content()
      const z = zoom.value
      pan.value = { x: -((r.x / 100) * c.w + c.x) * z, y: -((r.y / 100) * c.h + c.y) * z }
    },
  })
  /** Une boîte du canevas en % du contenu, pour la vue d'ensemble. */
  function pct(b: ViewBox) {
    const c = opts.content()
    return { x: ((b.x - c.x) / c.w) * 100, y: ((b.y - c.y) / c.h) * 100, w: (b.w / c.w) * 100, h: (b.h / c.h) * 100 }
  }

  /** Variables CSS de la racine : la place des panneaux, pour centrer la barre d'outils dans la zone libre (canvasView.css). */
  const vars = computed(() => ({
    '--map-right': `${Math.max(16, opts.rightPanel?.() ?? 0)}px`,
    '--map-bl': `${minimapShown.value ? MINIMAP_W : 0}px`,
  }))

  /** Centre de la zone visible, en coordonnées du canevas : là où se posent un post-it ou un commentaire. */
  function viewCenter(): { x: number; y: number } {
    const right = opts.rightPanel?.() ?? 0
    const cx = (size.value.w - right) / 2
    const cy = size.value.h / 2
    return { x: (cx - pan.value.x) / zoom.value, y: (cy - pan.value.y) / zoom.value }
  }

  return { zoom, pan, tool, size, narrow, minimapShown, fit, viewport, pct, vars, viewCenter, handlers: { onPointerDown, onPointerMove, onPointerUp, onWheel } }
}
