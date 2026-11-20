<script setup lang="ts">
// Guide de transition, façon pastille d'état de Figma : toujours là en bas à gauche, discret.
// Trois vues : « Comment faire » (tâches en visite pas à pas, chaque étape éclairée à l'écran),
// « Avant » (la capture de l'ancien écran) et « Maintenant » (ce qui a bougé, avec « Montrer »).
// Le pied propose la version précédente : l'ancien écran en plein écran, avec « Essayer la nouvelle interface ».
// Pour une démo qui part de l'ancienne interface : ajouter ?ancienne à l'adresse.
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import McIcon from '../../../icons/McIcon.vue'
import { captureUrl, transitionFor, transitionPages } from './transition'
import { findTarget, tachesFor, type Tache } from './taches'

const route = useRoute()
const router = useRouter()
const STORE = 'mc-transition-vus'
const LEGACY = 'mc-ancienne-interface'

const page = computed(() => transitionFor(route.path, String(route.meta.title ?? 'Écran')))
const pageKey = computed(() => (route.path.startsWith('/fiche/') ? '/fiche' : route.path))
const capture = computed(() => captureUrl(page.value.capture))
const taches = computed(() => tachesFor(pageKey.value))
const total = Object.keys(transitionPages).length

/* ---------- Écrans déjà découverts ---------- */
function load(): string[] {
  try { return JSON.parse(localStorage.getItem(STORE) ?? '[]') } catch { return [] }
}
const seen = ref<string[]>(load())
const isNew = computed(() => !seen.value.includes(pageKey.value))
const seenCount = computed(() => seen.value.filter((k) => k in transitionPages).length)
function markSeen() {
  if (!isNew.value) return
  seen.value = [...seen.value, pageKey.value]
  try { localStorage.setItem(STORE, JSON.stringify(seen.value)) } catch { /* stockage indisponible */ }
}
function resetSeen() {
  seen.value = []
  try { localStorage.removeItem(STORE) } catch { /* stockage indisponible */ }
}

/* ---------- Ouverture ---------- */
type View = 'faire' | 'avant' | 'maintenant'
const open = ref(false)
const view = ref<View>('faire')
const zoomed = ref(false)
function toggle() {
  open.value = !open.value
  if (open.value) markSeen()
}
watch(() => route.path, () => {
  zoomed.value = false
  stopTour()
  place()
})

/* ---------- Place : en bas à gauche, à droite de la minimap ou du menu latéral s'il y en a un ---------- */
const left = ref(16)
let timer: number | undefined
function measure() {
  let x = 16
  for (const sel of ['.mc-minimap', '.mc-side']) {
    const el = document.querySelector(sel)
    if (!el) continue
    const r = el.getBoundingClientRect()
    if (r.width && r.bottom > window.innerHeight - 80 && r.left < 40) x = Math.max(x, r.right + 12)
  }
  left.value = Math.round(x)
}
function place() {
  window.clearTimeout(timer)
  void nextTick(measure)
  timer = window.setTimeout(measure, 350) // les écrans se chargent à la demande
}

/* ---------- Projecteur : « Montrer » (bref) et visite pas à pas (tenu) ---------- */
interface Rect { x: number; y: number; w: number; h: number }
const spot = ref<(Rect & { label: string }) | null>(null)
let spotTimer: number | undefined
function rectOf(el: HTMLElement): Rect {
  const r = el.getBoundingClientRect()
  const pad = 6
  return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }
}
function show(sel: string | undefined, label: string) {
  const el = findTarget(sel)
  if (!el) return
  el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  spot.value = { ...rectOf(el), label }
  window.clearTimeout(spotTimer)
  spotTimer = window.setTimeout(() => (spot.value = null), 3200)
}
const showable = ref<boolean[]>([])
watch([open, view, () => route.path], () => {
  if (open.value) void nextTick(() => (showable.value = page.value.tips.map((t) => !!findTarget(t.montrer))))
})

const tour = ref<{ tache: Tache; i: number } | null>(null)
const tourRect = ref<Rect | null>(null)
let tourTick: number | undefined
const step = computed(() => (tour.value ? tour.value.tache.etapes[tour.value.i] : undefined))
function locate() {
  const el = findTarget(step.value?.montrer)
  tourRect.value = el ? rectOf(el) : null
}
function startTour(tache: Tache) {
  open.value = false
  spot.value = null
  tour.value = { tache, i: 0 }
  goStep(0)
  window.clearInterval(tourTick)
  tourTick = window.setInterval(locate, 250) // suit l'élément si la page bouge (inspecteur qui s'ouvre…)
}
function goStep(i: number) {
  if (!tour.value) return
  tour.value = { ...tour.value, i }
  void nextTick(() => {
    findTarget(step.value?.montrer)?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    locate()
  })
}
function stopTour(reopen = false) {
  window.clearInterval(tourTick)
  tour.value = null
  tourRect.value = null
  if (reopen) open.value = true
}
/** Bulle de la visite : sous l'élément, sinon au-dessus, sinon à côté ; sans élément, au-dessus de la pastille. */
const bubbleStyle = computed(() => {
  const W = 340
  const H = 210 // hauteur prévue de la bulle
  const gap = 14
  const r = tourRect.value
  if (!r) return { left: `${left.value}px`, bottom: '60px', width: `${W}px` }
  const vw = window.innerWidth
  const vh = window.innerHeight
  const x = Math.min(Math.max(16, r.x), vw - W - 16)
  if (r.y + r.h + gap + H < vh) return { left: `${x}px`, top: `${r.y + r.h + gap}px`, width: `${W}px` }
  if (r.y - gap - H > 16) return { left: `${x}px`, bottom: `${vh - r.y + gap}px`, width: `${W}px` }
  // Élément trop haut (un panneau entier) : la bulle se met à côté, à hauteur de son haut.
  const top = `${Math.min(Math.max(16, r.y + 24), vh - H - 16)}px`
  if (r.x - gap - W > 16) return { left: `${r.x - gap - W}px`, top, width: `${W}px` }
  return { left: `${Math.min(r.x + r.w + gap, vw - W - 16)}px`, top, width: `${W}px` }
})

/* ---------- Ancienne interface ---------- */
function initialLegacy() {
  if ('ancienne' in route.query || new URLSearchParams(location.search).has('ancienne')) return true
  try { return sessionStorage.getItem(LEGACY) === '1' } catch { return false }
}
const legacy = ref(initialLegacy())
watch(legacy, (v) => { try { sessionStorage.setItem(LEGACY, v ? '1' : '0') } catch { /* stockage indisponible */ } })
function toLegacy() {
  open.value = false
  stopTour()
  legacy.value = true
}
function toNew() {
  legacy.value = false
  // Sans ?ancienne dans l'adresse, un rechargement reste dans la nouvelle interface.
  if ('ancienne' in route.query) {
    const { ancienne: _drop, ...query } = route.query
    void router.replace({ query })
  }
  // Une fois dans la nouvelle interface, le guide s'ouvre sur ce qui a changé.
  window.setTimeout(() => { view.value = 'maintenant'; open.value = true; markSeen() }, 520)
}

/* ---------- Clavier : « ? » ouvre, flèches pendant la visite, Échap ferme ---------- */
function onKey(e: KeyboardEvent) {
  if (legacy.value) return
  const t = e.target as HTMLElement | null
  const typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))
  if (tour.value && !typing) {
    const n = tour.value.tache.etapes.length
    if (e.key === 'Escape') { stopTour(true); return }
    if (e.key === 'ArrowRight' && tour.value.i < n - 1) { goStep(tour.value.i + 1); return }
    if (e.key === 'ArrowLeft' && tour.value.i > 0) { goStep(tour.value.i - 1); return }
  }
  if (e.key === 'Escape') {
    if (zoomed.value) zoomed.value = false
    else if (spot.value) spot.value = null
    else if (open.value) open.value = false
    return
  }
  if ((e.key === '?' || (e.key === '/' && e.shiftKey) || (e.code === 'Comma' && e.shiftKey)) && !typing && !e.metaKey && !e.ctrlKey) {
    e.preventDefault()
    toggle()
  }
}
onMounted(() => {
  place()
  window.addEventListener('resize', measure)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  window.removeEventListener('resize', measure)
  document.removeEventListener('keydown', onKey)
  window.clearTimeout(timer)
  window.clearTimeout(spotTimer)
  window.clearInterval(tourTick)
})

const changes = computed(() => page.value.tips.length)
</script>

<template>
  <div v-show="!legacy" class="mc-tg" :style="{ left: `${left}px` }">
    <Transition name="mc-tg-card">
      <section v-if="open" class="mc-float mc-tg-card" role="dialog" aria-label="Guide de la nouvelle interface">
        <header class="mc-tg-head">
          <div>
            <p class="mc-tg-eyebrow">Nouvelle interface</p>
            <h2 class="mc-tg-title">{{ page.ecran }}</h2>
          </div>
          <button type="button" class="mc-tg-x" aria-label="Fermer le guide" @click="open = false">
            <McIcon name="x" size="sm" />
          </button>
        </header>

        <div class="mc-tg-seg three" role="tablist" aria-label="Guide">
          <button type="button" role="tab" :aria-selected="view === 'faire'" :class="{ on: view === 'faire' }" @click="view = 'faire'">Comment faire</button>
          <button type="button" role="tab" :aria-selected="view === 'avant'" :class="{ on: view === 'avant' }" @click="view = 'avant'">Avant</button>
          <button type="button" role="tab" :aria-selected="view === 'maintenant'" :class="{ on: view === 'maintenant' }" @click="view = 'maintenant'">Maintenant</button>
        </div>

        <div class="mc-tg-body">
          <Transition name="mc-tg-swap" mode="out-in">
            <div v-if="view === 'faire'" key="faire" class="mc-tg-pane">
              <p class="mc-tg-from">Choisissez une tâche : le guide vous montre où cliquer, étape par étape.</p>
              <ul class="mc-tg-tasks">
                <li v-for="(t, i) in taches" :key="i">
                  <button type="button" class="mc-tg-task" @click="startTour(t)">
                    <McIcon name="play" size="sm" />
                    <span class="mc-tg-task-q">{{ t.question }}</span>
                    <span class="mc-tg-task-n">{{ t.etapes.length }} étape{{ t.etapes.length > 1 ? 's' : '' }}</span>
                  </button>
                </li>
              </ul>
            </div>

            <div v-else-if="view === 'avant'" key="avant" class="mc-tg-pane">
              <button v-if="capture" type="button" class="mc-tg-shot" aria-label="Agrandir l’ancien écran" @click="zoomed = true">
                <img :src="capture" :alt="`Ancien écran : ${page.ancien}`" />
                <span class="mc-tg-shot-tag">Ancienne interface</span>
              </button>
              <div v-else class="mc-tg-noshot">
                <McIcon name="star" size="sm" />
                <span>{{ page.ancien === 'Nouvel écran' ? 'Cet écran n’existait pas.' : 'Pas de capture de cet écran.' }}</span>
              </div>
              <p class="mc-tg-from">{{ page.ancien }}</p>
              <ul class="mc-tg-list">
                <li v-for="(t, i) in page.tips" :key="i" class="was">{{ t.avant }}</li>
              </ul>
            </div>

            <div v-else key="maintenant" class="mc-tg-pane">
              <p class="mc-tg-resume">{{ page.resume }}</p>
              <ul class="mc-tg-list">
                <li v-for="(t, i) in page.tips" :key="i" class="now">
                  <span class="mc-tg-li-text">
                    <span class="mc-tg-li-was">{{ t.avant }}</span>
                    {{ t.maintenant }}
                  </span>
                  <button v-if="showable[i]" type="button" class="mc-tg-show" @click="show(t.montrer, t.maintenant)">
                    <McIcon name="eye" size="sm" />Montrer
                  </button>
                </li>
              </ul>
            </div>
          </Transition>
        </div>

        <footer class="mc-tg-foot">
          <div class="mc-tg-progress" :title="`${seenCount} écrans découverts sur ${total}`">
            <span class="mc-tg-bar"><span :style="{ width: `${Math.min(100, (seenCount / total) * 100)}%` }" /></span>
            <span>{{ seenCount }}/{{ total }} écrans vus</span>
            <button v-if="seenCount" type="button" class="mc-tg-reset" title="Recommencer la découverte" @click="resetSeen">
              <McIcon name="undo" size="sm" />
            </button>
          </div>
          <button type="button" class="mc-tg-legacy" title="Revoir cet écran dans l’ancienne interface" @click="toLegacy">
            <McIcon name="history" size="sm" />Version précédente
          </button>
        </footer>
      </section>
    </Transition>

    <button
      type="button"
      class="mc-float mc-tg-pill"
      :class="{ open, fresh: isNew }"
      :aria-expanded="open"
      :aria-label="`Guide de la nouvelle interface : ${page.ecran}, ${changes} changements. Raccourci : point d’interrogation`"
      @click="toggle"
    >
      <span class="mc-tg-dot" aria-hidden="true" />
      <span class="mc-tg-roll" aria-hidden="true">
        <Transition name="mc-tg-roll" mode="out-in">
          <span :key="page.ecran" class="mc-tg-roll-in">
            {{ page.ecran }}<span class="mc-tg-sep">·</span>{{ changes }} changement{{ changes > 1 ? 's' : '' }}
          </span>
        </Transition>
      </span>
      <span class="mc-kbd mc-tg-kbd" aria-hidden="true">?</span>
    </button>

    <Teleport to="body">
      <!-- « Montrer » : éclaire un repère quelques secondes. -->
      <Transition name="mc-tg-fade">
        <div v-if="spot" class="mc-tg-spot-layer" @click="spot = null">
          <div class="mc-tg-spot" :style="{ left: `${spot.x}px`, top: `${spot.y}px`, width: `${spot.w}px`, height: `${spot.h}px` }">
            <span class="mc-tg-spot-label" :class="{ below: spot.y < 60 }">{{ spot.label }}</span>
          </div>
        </div>
      </Transition>

      <!-- Visite pas à pas : la page reste utilisable, on peut cliquer sur ce qui est éclairé. -->
      <Transition name="mc-tg-fade">
        <div v-if="tour" class="mc-tg-tour" aria-live="polite">
          <div
            v-if="tourRect"
            class="mc-tg-spot held"
            :style="{ left: `${tourRect.x}px`, top: `${tourRect.y}px`, width: `${tourRect.w}px`, height: `${tourRect.h}px` }"
          />
          <div v-else class="mc-tg-dim" />
          <div class="mc-float mc-tg-bubble" :style="bubbleStyle" role="dialog" :aria-label="tour.tache.question">
            <div class="mc-tg-bubble-head">
              <span class="mc-tg-bubble-q">{{ tour.tache.question }}</span>
              <button type="button" class="mc-tg-x" aria-label="Arrêter la visite" @click="stopTour(true)"><McIcon name="x" size="sm" /></button>
            </div>
            <Transition name="mc-tg-swap" mode="out-in">
              <div :key="tour.i" class="mc-tg-bubble-body">
                <p class="mc-tg-bubble-text">{{ step?.texte }}</p>
                <p v-if="step?.avant" class="mc-tg-bubble-was"><b>Avant :</b> {{ step.avant }}</p>
              </div>
            </Transition>
            <div class="mc-tg-bubble-foot">
              <span class="mc-tg-dots" aria-hidden="true">
                <span v-for="(_, k) in tour.tache.etapes" :key="k" :class="{ on: k === tour.i }" />
              </span>
              <span class="mc-tg-sr">Étape {{ tour.i + 1 }} sur {{ tour.tache.etapes.length }}</span>
              <button v-if="tour.i > 0" type="button" class="mc-tg-btn ghost" @click="goStep(tour.i - 1)">Précédent</button>
              <button v-if="tour.i < tour.tache.etapes.length - 1" type="button" class="mc-tg-btn" @click="goStep(tour.i + 1)">Suivant</button>
              <button v-else type="button" class="mc-tg-btn" @click="stopTour(true)">Terminé</button>
            </div>
          </div>
        </div>
      </Transition>

      <Transition name="mc-tg-fade">
        <div v-if="zoomed && capture" class="mc-tg-zoom" role="dialog" aria-label="Ancien écran en grand" @click="zoomed = false">
          <figure>
            <img :src="capture" :alt="`Ancien écran : ${page.ancien}`" />
            <figcaption>Avant · {{ page.ancien }} <span>Échap pour fermer</span></figcaption>
          </figure>
        </div>
      </Transition>

      <!-- L'ancienne interface : la capture de l'ancien écran, avec l'invitation à essayer la nouvelle. -->
      <Transition name="mc-tg-legacy">
        <div v-if="legacy" class="mc-tg-old" :style="{ transformOrigin: `${left + 40}px calc(100% - 32px)` }" role="region" aria-label="Ancienne interface">
          <div class="mc-tg-old-bar">
            <span class="mc-tg-old-dot" aria-hidden="true" />
            <span class="mc-tg-old-msg"><b>Nouvelle interface disponible</b> pour « {{ page.ecran }} » : même contenu, plus lisible. Vous pourrez revenir ici à tout moment.</span>
            <button type="button" class="mc-tg-old-cta" @click="toNew">Essayer la nouvelle interface<McIcon name="arrow-right" size="sm" /></button>
          </div>
          <div class="mc-tg-old-stage">
            <img v-if="capture" :src="capture" :alt="`Ancienne interface : ${page.ancien}`" />
            <div v-else class="mc-tg-old-none">
              <p>{{ page.ancien === 'Nouvel écran' ? 'Cet écran n’existait pas dans l’ancienne interface.' : 'Pas de capture de cet écran dans la démo.' }}</p>
            </div>
            <span class="mc-tg-old-tag">Ancienne interface · {{ page.ancien }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style>
.mc-tg { position: fixed; bottom: 16px; z-index: 70; display: flex; flex-direction: column; align-items: flex-start; gap: 8px; font-family: var(--font-sans); transition: left var(--dur-base) var(--ease-out); pointer-events: none; }
.mc-tg > * { pointer-events: auto; }

/* Pastille */
.mc-tg-pill { display: inline-flex; align-items: center; gap: 8px; height: 32px; padding: 0 6px 0 10px; border-radius: var(--radius-pill); font: 500 12px/1 var(--font-sans); color: var(--ink-muted); cursor: pointer; font-variant-numeric: tabular-nums; transition: color var(--dur-fast), border-color var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.mc-tg-pill:hover, .mc-tg-pill.open { color: var(--ink); border-color: var(--line-strong); }
.mc-tg-pill:active { transform: scale(.97); }
.mc-tg-pill:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-tg-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--line-strong); flex: none; position: relative; }
.mc-tg-pill.fresh .mc-tg-dot { background: var(--yellow); }
.mc-tg-pill.fresh .mc-tg-dot::after { content: ""; position: absolute; inset: -4px; border-radius: 50%; border: 2px solid var(--yellow); animation: mc-tg-ping 1.6s var(--ease-out) infinite; }
@keyframes mc-tg-ping { from { transform: scale(.6); opacity: 1; } to { transform: scale(1.6); opacity: 0; } }
.mc-tg-roll { display: inline-grid; overflow: hidden; height: 16px; align-items: center; }
.mc-tg-roll-in { white-space: nowrap; }
.mc-tg-sep { margin: 0 6px; color: var(--ink-subtle); }
.mc-tg-kbd { min-width: 20px; height: 20px; display: inline-grid; place-items: center; }
.mc-tg-roll-enter-active, .mc-tg-roll-leave-active { transition: transform 220ms var(--ease-out), opacity 220ms var(--ease-out); }
.mc-tg-roll-enter-from { transform: translateY(100%); opacity: 0; }
.mc-tg-roll-leave-to { transform: translateY(-100%); opacity: 0; }

/* Carte */
.mc-tg-card { width: 380px; max-height: calc(100vh - 120px); display: flex; flex-direction: column; overflow: hidden; transform-origin: bottom left; }
.mc-tg-card-enter-active { transition: transform 240ms var(--ease-out), opacity 180ms var(--ease-out); }
.mc-tg-card-leave-active { transition: transform 140ms ease-in, opacity 140ms ease-in; }
.mc-tg-card-enter-from, .mc-tg-card-leave-to { transform: translateY(8px) scale(.96); opacity: 0; }
.mc-tg-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; padding: 14px 14px 10px 16px; }
.mc-tg-eyebrow { margin: 0 0 2px; font: 600 11px/1.3 var(--font-sans); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-subtle); }
.mc-tg-title { margin: 0; font: 600 16px/1.25 var(--font-display); color: var(--ink); }
.mc-tg-x { width: 28px; height: 28px; display: grid; place-items: center; border: 0; background: none; border-radius: var(--radius-sm); color: var(--ink-muted); cursor: pointer; }
.mc-tg-x:hover { background: var(--surface-sunken); color: var(--ink); }

.mc-tg-seg { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; margin: 0 16px 12px; padding: 2px; border-radius: var(--radius-md); background: var(--surface-sunken); }
.mc-tg-seg button { height: 28px; border: 0; border-radius: calc(var(--radius-md) - 2px); background: none; font: 500 12px/1 var(--font-sans); color: var(--ink-muted); cursor: pointer; transition: background var(--dur-fast), color var(--dur-fast); }
.mc-tg-seg button.on { background: var(--surface); color: var(--ink); box-shadow: 0 1px 2px rgba(20,24,60,.12); }

.mc-tg-body { overflow-y: auto; padding: 0 16px 4px; }
.mc-tg-pane { display: flex; flex-direction: column; gap: 10px; }
.mc-tg-swap-enter-active, .mc-tg-swap-leave-active { transition: opacity 140ms var(--ease-out), transform 140ms var(--ease-out); }
.mc-tg-swap-enter-from { opacity: 0; transform: translateX(6px); }
.mc-tg-swap-leave-to { opacity: 0; transform: translateX(-6px); }

.mc-tg-shot { position: relative; display: block; padding: 0; border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; background: var(--surface-sunken); cursor: zoom-in; }
.mc-tg-shot img { display: block; width: 100%; aspect-ratio: 1858 / 880; object-fit: cover; filter: saturate(.85); transition: transform 300ms var(--ease-out); }
.mc-tg-shot:hover img { transform: scale(1.03); }
.mc-tg-shot-tag { position: absolute; left: 8px; bottom: 8px; padding: 3px 8px; border-radius: var(--radius-pill); background: rgba(20,24,60,.78); color: #fff; font: 500 11px/1.3 var(--font-sans); }
.mc-tg-noshot { display: flex; align-items: center; gap: 8px; padding: 16px; border: 1px dashed var(--line); border-radius: var(--radius-md); color: var(--ink-muted); font-size: 13px; }
.mc-tg-from { margin: 0; font-size: 12px; color: var(--ink-subtle); }
.mc-tg-resume { margin: 0; font-size: 13px; line-height: 1.5; color: var(--ink); }

.mc-tg-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.mc-tg-list li { display: flex; align-items: flex-start; gap: 10px; padding: 9px 0; border-top: 1px solid var(--line); font-size: 13px; line-height: 1.45; color: var(--ink); }
.mc-tg-list li.was { color: var(--ink-muted); }
.mc-tg-list li.was::before { content: ""; flex: none; width: 6px; height: 6px; margin-top: 7px; border-radius: 50%; background: var(--line-strong); }
.mc-tg-li-text { flex: 1; }
.mc-tg-li-was { display: block; margin-bottom: 2px; font-size: 12px; color: var(--ink-subtle); }
.mc-tg-li-was::before { content: "Avant : "; font-weight: 600; }
.mc-tg-show { flex: none; display: inline-flex; align-items: center; gap: 4px; height: 26px; padding: 0 8px; border: 1px solid var(--line); border-radius: var(--radius-pill); background: var(--surface); font: 500 12px/1 var(--font-sans); color: var(--ink); cursor: pointer; }
.mc-tg-show:hover { border-color: var(--navy); background: var(--yellow-soft); }

.mc-tg-foot { white-space: nowrap; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 10px 12px 10px 16px; border-top: 1px solid var(--line); background: var(--surface-sunken); font-size: 12px; color: var(--ink-muted); }
.mc-tg-progress { display: flex; align-items: center; gap: 8px; min-width: 0; }
.mc-tg-bar { width: 48px; height: 4px; border-radius: 2px; background: var(--line); overflow: hidden; flex: none; }
.mc-tg-bar span { display: block; height: 100%; background: var(--navy); border-radius: 2px; transition: width 400ms var(--ease-out); }
.mc-tg-reset, .mc-tg-legacy { display: inline-flex; align-items: center; gap: 4px; border: 0; background: none; padding: 4px 6px; border-radius: var(--radius-sm); font: 500 12px/1 var(--font-sans); color: var(--ink-muted); cursor: pointer; }
.mc-tg-reset:hover, .mc-tg-legacy:hover { background: var(--surface); color: var(--ink); }
.mc-tg-legacy-note { margin: 0; padding: 10px 16px 12px; background: var(--surface-sunken); font-size: 12px; line-height: 1.45; color: var(--ink-muted); }

/* Projecteur sur un repère */
.mc-tg-spot-layer { position: fixed; inset: 0; z-index: 90; cursor: pointer; }
.mc-tg-spot { position: fixed; border-radius: 12px; box-shadow: 0 0 0 3px var(--yellow), 0 0 0 9999px rgba(20,24,60,.38); animation: mc-tg-spot-in 360ms var(--ease-out); pointer-events: none; }
.mc-tg-spot::after { content: ""; position: absolute; inset: -3px; border-radius: inherit; border: 3px solid var(--yellow); animation: mc-tg-ping-ring 1.2s var(--ease-out) 360ms 2; }
@keyframes mc-tg-spot-in { from { box-shadow: 0 0 0 3px var(--yellow), 0 0 0 9999px rgba(20,24,60,0); transform: scale(1.06); } }
@keyframes mc-tg-ping-ring { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(1.12); } }
.mc-tg-spot-label { position: absolute; left: 0; bottom: calc(100% + 10px); max-width: 320px; padding: 6px 10px; border-radius: var(--radius-md); background: var(--navy); color: #fff; font: 500 12px/1.4 var(--font-sans); white-space: normal; width: max-content; box-shadow: var(--shadow-float); }
.mc-tg-spot-label.below { bottom: auto; top: calc(100% + 10px); }

/* Ancien écran en grand */
.mc-tg-zoom { position: fixed; inset: 0; z-index: 95; display: grid; place-items: center; padding: 40px; background: rgba(20,24,60,.6); cursor: zoom-out; }
.mc-tg-zoom figure { margin: 0; max-width: min(1200px, 100%); }
.mc-tg-zoom img { display: block; width: 100%; border-radius: var(--radius-lg); box-shadow: 0 20px 60px rgba(0,0,0,.35); }
.mc-tg-zoom figcaption { display: flex; justify-content: space-between; margin-top: 12px; color: #fff; font: 500 13px/1.4 var(--font-sans); }
.mc-tg-zoom figcaption span { opacity: .7; }
.mc-tg-fade-enter-active, .mc-tg-fade-leave-active { transition: opacity 200ms var(--ease-out); }
.mc-tg-fade-enter-from, .mc-tg-fade-leave-to { opacity: 0; }

/* Trois onglets */
.mc-tg-seg.three { grid-template-columns: 1.4fr 1fr 1fr; }

/* Comment faire */
.mc-tg-tasks { list-style: none; margin: 0 0 8px; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.mc-tg-task { width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--radius-md); background: var(--surface); text-align: left; cursor: pointer; font: 500 13px/1.35 var(--font-sans); color: var(--ink); transition: border-color var(--dur-fast), background var(--dur-fast); }
.mc-tg-task:hover { border-color: var(--navy); background: var(--yellow-soft); }
.mc-tg-task:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-tg-task .mc-icon, .mc-tg-task svg { flex: none; color: var(--navy); }
.mc-tg-task-q { flex: 1; }
.mc-tg-task-n { flex: none; font-size: 11px; font-weight: 500; color: var(--ink-subtle); }

/* Visite pas à pas */
.mc-tg-tour { position: fixed; inset: 0; z-index: 90; pointer-events: none; }
.mc-tg-dim { position: fixed; inset: 0; background: rgba(20,24,60,.28); }
.mc-tg-spot.held { transition: left 260ms var(--ease-out), top 260ms var(--ease-out), width 260ms var(--ease-out), height 260ms var(--ease-out); }
.mc-tg-bubble { position: fixed; pointer-events: auto; padding: 14px 16px 12px; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 12px 40px rgba(20,24,60,.28); transition: left 260ms var(--ease-out), top 260ms var(--ease-out), bottom 260ms var(--ease-out); }
.mc-tg-bubble-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.mc-tg-bubble-q { font: 600 11px/1.4 var(--font-sans); letter-spacing: .04em; text-transform: uppercase; color: var(--ink-subtle); padding-top: 6px; }
.mc-tg-bubble-body { display: flex; flex-direction: column; gap: 8px; }
.mc-tg-bubble-text { margin: 0; font: 500 14px/1.5 var(--font-sans); color: var(--ink); }
.mc-tg-bubble-was { margin: 0; padding: 6px 10px; border-radius: var(--radius-sm); background: var(--surface-sunken); font-size: 12px; line-height: 1.45; color: var(--ink-muted); }
.mc-tg-bubble-foot { display: flex; align-items: center; gap: 6px; }
.mc-tg-dots { display: flex; gap: 5px; margin-right: auto; }
.mc-tg-dots span { width: 6px; height: 6px; border-radius: 50%; background: var(--line); transition: background var(--dur-fast), width var(--dur-base) var(--ease-out); }
.mc-tg-dots span.on { width: 16px; border-radius: 3px; background: var(--navy); }
.mc-tg-btn { height: 30px; padding: 0 12px; border: 0; border-radius: var(--radius-sm); background: var(--yellow); color: var(--navy); font: 600 12px/1 var(--font-sans); cursor: pointer; }
.mc-tg-btn:hover { background: var(--yellow-lift); }
.mc-tg-btn.ghost { background: none; color: var(--ink-muted); }
.mc-tg-btn.ghost:hover { background: var(--surface-sunken); color: var(--ink); }
.mc-tg-btn:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
.mc-tg-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Ancienne interface */
.mc-tg-old { position: fixed; inset: 0; z-index: 85; display: flex; flex-direction: column; background: #e6e7ea; font-family: var(--font-sans); }
.mc-tg-old-bar { display: flex; align-items: center; gap: 14px; padding: 10px 16px; background: var(--navy); color: #fff; font-size: 14px; line-height: 1.4; }
.mc-tg-old-dot { width: 10px; height: 10px; flex: none; border-radius: 50%; background: var(--yellow); box-shadow: 0 0 0 0 rgba(250,193,48,.7); animation: mc-tg-beacon 1.8s ease-out infinite; }
@keyframes mc-tg-beacon { to { box-shadow: 0 0 0 10px rgba(250,193,48,0); } }
.mc-tg-old-msg { flex: 1; font-family: var(--font-sans); color: #dfe2f3; }
.mc-tg-old-msg b { color: #fff; }
.mc-tg-old-cta { display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 16px; border: 0; border-radius: var(--radius-sm); background: var(--yellow); color: var(--navy); font: 600 14px/1 var(--font-sans); cursor: pointer; white-space: nowrap; transition: background var(--dur-fast), transform var(--dur-fast) var(--ease-out); }
.mc-tg-old-cta:hover { background: var(--yellow-lift); }
.mc-tg-old-cta:active { transform: scale(.97); }
.mc-tg-old-cta:focus-visible { outline: 2px solid #fff; outline-offset: 2px; }
.mc-tg-old-stage { position: relative; flex: 1; min-height: 0; display: grid; place-items: center; }
.mc-tg-old-stage img { width: 100%; height: 100%; object-fit: contain; object-position: top center; background: #fff; }
.mc-tg-old-none p { font-family: var(--font-sans); font-size: 16px; color: var(--ink-muted); }
.mc-tg-old-tag { position: absolute; right: 16px; bottom: 16px; padding: 5px 12px; border-radius: var(--radius-pill); background: rgba(20,24,60,.75); color: #fff; font: 500 12px/1.3 var(--font-sans); }
/* Le passage d'une interface à l'autre : l'ancien écran se replie vers le guide, ou en sort. */
.mc-tg-legacy-enter-active { transition: transform 460ms cubic-bezier(.2,.8,.2,1), opacity 300ms ease-out; }
.mc-tg-legacy-leave-active { transition: transform 480ms cubic-bezier(.5,0,.75,0), opacity 420ms ease-in; }
.mc-tg-legacy-enter-from, .mc-tg-legacy-leave-to { transform: scale(.04); opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .mc-tg, .mc-tg *, .mc-tg-spot, .mc-tg-spot::after, .mc-tg-bubble, .mc-tg-old, .mc-tg-old *, .mc-tg-legacy-enter-active, .mc-tg-legacy-leave-active { animation: none !important; transition: none !important; }
}
</style>
