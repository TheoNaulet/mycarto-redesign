<script setup lang="ts">
// Post-its et commentaires d'une carte, posés dans le calque du canevas (ils suivent le zoom et le déplacement).
// Partagé par les écrans Carte, Impact, Infrastructure, POS et Contrats. Les données vivent dans src/data/annotations.ts.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McStickyNote from '../../components/McStickyNote/McStickyNote.vue'
import { useToast } from '../../components/McToast/useToast'
import { addComment, addNote, annotationsOf, removeComment, removeNote, reply, type MapComment, type MapNote } from '../../data/annotations'

const props = defineProps<{
  /** Clé de l'écran dans le magasin : « carte », « impact »… */
  screen: string
  /** Zoom du canevas : un déplacement à l'écran se divise par lui. */
  zoom: number
}>()

const toast = useToast()
const data = computed(() => annotationsOf(props.screen))
const root = ref<HTMLElement>()

/* ---------- Post-its ---------- */
async function placeNote(x: number, y: number) {
  // Le post-it se centre sur le point ; on décale s'il en recouvre un autre.
  let px = x - 84
  let py = y - 70
  while (data.value.notes.some((n) => Math.abs(n.x - px) < 12 && Math.abs(n.y - py) < 12)) {
    px += 24
    py += 24
  }
  const n = addNote(props.screen, px, py)
  await nextTick()
  root.value?.querySelector<HTMLTextAreaElement>(`[data-note="${n.id}"] textarea`)?.focus()
}
function deleteNote(n: MapNote) {
  const copy = { ...n }
  removeNote(props.screen, n.id)
  toast.info('Post-it supprimé', { actionLabel: 'Annuler', onAction: () => annotationsOf(props.screen).notes.push(copy) })
}

let drag: { kind: 'note' | 'pin'; item: MapNote | MapComment; x: number; y: number; ox: number; oy: number; moved: boolean } | null = null
function startDrag(e: PointerEvent, kind: 'note' | 'pin', item: MapNote | MapComment) {
  e.stopPropagation()
  if (e.button !== 0) return
  const t = e.target as HTMLElement
  if (kind === 'note' && t.closest('textarea, button')) return
  drag = { kind, item, x: e.clientX, y: e.clientY, ox: item.x, oy: item.y, moved: false }
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}
function moveDrag(e: PointerEvent) {
  if (!drag) return
  const dx = (e.clientX - drag.x) / (props.zoom || 1)
  const dy = (e.clientY - drag.y) / (props.zoom || 1)
  if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true
  drag.item.x = Math.round(drag.ox + dx)
  drag.item.y = Math.round(drag.oy + dy)
}
let justDragged = false
function endDrag() {
  justDragged = !!drag?.moved
  drag = null
}

/* ---------- Commentaires ---------- */
const openId = ref<string | null>(null)
const draft = ref('')
/** Brouillons par fil : fermer un fil en cours d'écriture ne perd pas le texte. */
const drafts = new Map<string, string>()
async function placeComment(x: number, y: number) {
  closeThread()
  const c = addComment(props.screen, x, y)
  openThread(c)
}
async function openThread(c: MapComment) {
  if (openId.value && openId.value !== c.id) closeThread()
  openId.value = c.id
  draft.value = drafts.get(c.id) ?? ''
  await nextTick()
  root.value?.querySelector<HTMLTextAreaElement>(`[data-thread="${c.id}"] textarea`)?.focus()
}
function togglePin(c: MapComment) {
  if (justDragged) return void (justDragged = false)
  if (openId.value === c.id) closeThread()
  else openThread(c)
}
/** Fermer un fil sans message retire son épingle : rien n'a été dit. */
function closeThread() {
  const c = data.value.comments.find((x) => x.id === openId.value)
  if (c && draft.value.trim()) drafts.set(c.id, draft.value)
  else if (c) drafts.delete(c.id)
  if (c && !c.messages.length && !draft.value.trim()) removeComment(props.screen, c.id)
  openId.value = null
  draft.value = ''
}
function send(c: MapComment) {
  const text = draft.value.trim()
  if (!text) return
  reply(c, text)
  draft.value = ''
  drafts.delete(c.id)
}
function onDraftKey(e: KeyboardEvent, c: MapComment) {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
    e.preventDefault()
    send(c)
  } else if (e.key === 'Escape') {
    e.stopPropagation()
    closeThread()
  }
}
function resolve(c: MapComment) {
  c.resolved = !c.resolved
  if (c.resolved) closeThread()
  toast.success(c.resolved ? 'Fil de commentaire résolu' : 'Fil rouvert')
}
function deleteThread(c: MapComment) {
  const copy = { ...c, messages: [...c.messages] }
  openId.value = null
  removeComment(props.screen, c.id)
  if (copy.messages.length) toast.info('Fil de commentaire supprimé', { actionLabel: 'Annuler', onAction: () => annotationsOf(props.screen).comments.push(copy) })
}

/* Un fil ouvert se ferme dès qu'on clique ailleurs (comme dans Figma) : il ne reste jamais devant la carte.
 * Le clic n'est pas avalé : il sélectionne aussi ce qu'il vise. Échap ferme également. */
function onOutsideDown(e: PointerEvent) {
  const id = openId.value
  const t = e.target as HTMLElement | null
  if (!id || !t) return
  if (t.closest(`[data-thread="${id}"], [data-pin="${id}"]`)) return
  closeThread()
}
function onOutsideKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && openId.value) closeThread()
}
watch(openId, (id) => {
  window.removeEventListener('pointerdown', onOutsideDown, true)
  window.removeEventListener('keydown', onOutsideKey)
  if (id) {
    window.addEventListener('pointerdown', onOutsideDown, true)
    window.addEventListener('keydown', onOutsideKey)
  }
})
onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onOutsideDown, true)
  window.removeEventListener('keydown', onOutsideKey)
})

/* ---------- Mode placement : le curseur devient une épingle, un clic sur la carte pose le commentaire ---------- */
const placing = ref(false)
const canvasRoot = () => root.value?.closest<HTMLElement>('.mc-canvas-root') ?? null
function armComment() {
  if (placing.value) return disarm()
  closeThread()
  placing.value = true
  canvasRoot()?.classList.add('is-placing-comment')
  window.addEventListener('pointerdown', onPlaceDown, true)
  window.addEventListener('keydown', onPlaceKey, true)
}
function disarm() {
  placing.value = false
  canvasRoot()?.classList.remove('is-placing-comment')
  window.removeEventListener('pointerdown', onPlaceDown, true)
  window.removeEventListener('keydown', onPlaceKey, true)
}
/** Avale le clic qui suit la pose, pour que le canevas ne désélectionne pas ou n'ouvre pas l'objet dessous. */
function swallowClick(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
}
function onPlaceDown(e: PointerEvent) {
  const t = e.target as HTMLElement
  const canvas = canvasRoot()
  // La barre d'outils garde la main : son bouton Commentaire désarme, ses autres outils aussi.
  if (t.closest('.mc-toolbar')) {
    if (!t.closest('[aria-label="Commentaire"]')) disarm()
    return
  }
  // Ailleurs qu'au-dessus de la carte (panneaux flottants, hors du canevas) : on annule sans rien poser.
  if (!canvas || !canvas.contains(t) || t.closest('.mc-float') || e.button !== 0) return disarm()
  e.preventDefault()
  e.stopPropagation()
  window.addEventListener('click', swallowClick, { capture: true, once: true })
  const origin = root.value!.getBoundingClientRect()
  const z = props.zoom || 1
  disarm()
  placeComment(Math.round((e.clientX - origin.left) / z), Math.round((e.clientY - origin.top) / z))
}
function onPlaceKey(e: KeyboardEvent) {
  if (e.key !== 'Escape') return
  e.stopPropagation()
  disarm()
}
onBeforeUnmount(disarm)

defineExpose({ placeNote, placeComment, armComment, placing })
</script>

<template>
  <div ref="root" class="mc-ann">
    <div
      v-for="n in data.notes"
      :key="n.id"
      class="mc-ann-note"
      :data-note="n.id"
      :style="{ left: n.x + 'px', top: n.y + 'px' }"
      title="Glisser pour déplacer"
      @pointerdown="startDrag($event, 'note', n)"
      @pointermove="moveDrag"
      @pointerup="endDrag"
      @pointercancel="endDrag"
      @click.stop
      @dblclick.stop
    >
      <McStickyNote v-model:text="n.text" editable :color="n.color" :rotation="n.rotation" :author="n.author" :date="n.date" />
      <span class="mc-ann-grip" aria-hidden="true" />
      <button type="button" class="mc-ann-del" aria-label="Supprimer le post-it" title="Supprimer le post-it" @click="deleteNote(n)"><McIcon name="x" size="sm" /></button>
    </div>

    <template v-for="c in data.comments" :key="c.id">
      <button
        type="button"
        class="mc-ann-pin"
        :class="{ 'is-open': openId === c.id, 'is-resolved': c.resolved }"
        :data-pin="c.id"
        :style="{ left: c.x + 'px', top: c.y + 'px' }"
        :aria-label="`Commentaire${c.messages.length ? ` : ${c.messages.length} message${c.messages.length > 1 ? 's' : ''}` : ''}`"
        :aria-expanded="openId === c.id"
        title="Cliquer pour ouvrir, glisser pour déplacer"
        @pointerdown="startDrag($event, 'pin', c)"
        @pointermove="moveDrag"
        @pointerup="endDrag"
        @pointercancel="endDrag"
        @click.stop="togglePin(c)"
        @dblclick.stop
      >
        <span>{{ c.messages[0]?.author.initials ?? 'TN' }}</span>
        <b v-if="c.messages.length > 1">{{ c.messages.length }}</b>
      </button>
      <!-- Aperçu au survol de l'épingle : le premier message, sans ouvrir le fil. -->
      <div
        v-if="c.messages.length && openId !== c.id"
        class="mc-ann-peek mc-float"
        :style="{ left: c.x + 22 + 'px', top: c.y - 30 + 'px', transform: `scale(${1 / (zoom || 1)})` }"
        aria-hidden="true"
      >
        <div class="mc-ann-meta"><b>{{ c.messages[0]!.author.name }}</b> · {{ c.messages[0]!.time }}<template v-if="c.resolved"> · Résolu</template></div>
        <p>{{ c.messages[0]!.text }}</p>
        <span v-if="c.messages.length > 1" class="mc-ann-more">{{ c.messages.length - 1 }} réponse{{ c.messages.length > 2 ? 's' : '' }}</span>
      </div>
      <div
        v-if="openId === c.id"
        class="mc-ann-thread mc-float"
        :data-thread="c.id"
        :style="{ left: c.x + 22 + 'px', top: c.y - 8 + 'px', transform: `scale(${1 / (zoom || 1)})` }"
        role="dialog"
        aria-label="Fil de commentaire"
        @pointerdown.stop
        @click.stop
        @dblclick.stop
      >
        <div class="mc-ann-hd">
          <b>Commentaire</b>
          <span class="grow" />
          <McIconButton v-if="c.messages.length" size="sm" :icon="c.resolved ? 'undo' : 'check'" :label="c.resolved ? 'Rouvrir' : 'Résoudre'" @click="resolve(c)" />
          <McIconButton size="sm" icon="trash" label="Supprimer le fil" @click="deleteThread(c)" />
          <McIconButton size="sm" icon="x" label="Fermer" @click="closeThread" />
        </div>
        <ol v-if="c.messages.length" class="mc-ann-msgs">
          <li v-for="m in c.messages" :key="m.id">
            <span class="mc-avatar" :style="{ background: `var(--data-${m.author.color})` }" aria-hidden="true">{{ m.author.initials }}</span>
            <div>
              <div class="mc-ann-meta"><b>{{ m.author.name }}</b> · {{ m.time }}</div>
              <p>{{ m.text }}</p>
            </div>
          </li>
        </ol>
        <p v-else class="mc-ann-empty">Écrivez le premier message de ce fil.</p>
        <div class="mc-input mc-textarea mc-ann-input">
          <textarea v-model="draft" rows="2" aria-label="Votre message" :placeholder="c.messages.length ? 'Répondre…' : 'Une question, une remarque…'" @keydown="onDraftKey($event, c)" />
        </div>
        <div class="mc-ann-ft">
          <span class="mc-ann-hint">⌘ Entrée</span>
          <McButton size="sm" icon="arrow-right" :disabled="!draft.trim()" @click="send(c)">Envoyer</McButton>
        </div>
      </div>
    </template>
  </div>
</template>

<style>
/* Mode placement : curseur en forme d'épingle de commentaire (pointe en bas à gauche), sur la carte seulement. */
.mc-canvas-root.is-placing-comment,
.mc-canvas-root.is-placing-comment .mc-canvas-layer,
.mc-canvas-root.is-placing-comment .mc-canvas-layer * {
  cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M3 25V12a9 9 0 0 1 9-9h4a9 9 0 0 1 0 18H7z' fill='%23262e6f' stroke='white' stroke-width='2' stroke-linejoin='round'/%3E%3Cpath d='M14 8v8M10 12h8' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E") 3 25, crosshair;
}
.mc-canvas-root.is-placing-comment .mc-float { cursor: default; }
.mc-ann { position: absolute; left: 0; top: 0; width: 0; height: 0; z-index: 4; }
.mc-ann-note { position: absolute; cursor: grab; touch-action: none; }
.mc-ann-note:active { cursor: grabbing; }
.mc-ann-note .mc-sticky { width: 184px; }
.mc-ann-grip { position: absolute; left: 0; right: 0; top: 0; height: 14px; cursor: grab; }
.mc-ann-grip::after { content: ''; position: absolute; left: 50%; top: 5px; width: 28px; height: 4px; margin-left: -14px; border-radius: 2px; background: color-mix(in srgb, var(--navy) 22%, transparent); }
.mc-ann-del { position: absolute; top: -8px; right: -8px; width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--line); background: var(--surface); color: var(--ink-muted); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; opacity: 0; transition: opacity .12s; box-shadow: var(--shadow-node); }
.mc-ann-note:hover .mc-ann-del, .mc-ann-note:focus-within .mc-ann-del { opacity: 1; }
.mc-ann-del:hover { color: var(--status-critical); }
.mc-ann-del:focus-visible { opacity: 1; outline: 2px solid var(--accent); }
.mc-ann-pin { position: absolute; transform: translate(-4px, -100%); display: inline-flex; align-items: center; gap: 2px; height: 30px; min-width: 30px; padding: 0 3px; box-sizing: border-box; border: 2px solid var(--surface); border-radius: 15px 15px 15px 2px; background: var(--data-1); color: var(--on-navy, #fff); font: 700 11px/1 var(--font-sans); cursor: grab; box-shadow: var(--shadow-pop); touch-action: none; }
.mc-ann-pin:active { cursor: grabbing; }
.mc-ann-pin span { width: 22px; text-align: center; }
.mc-ann-pin b { padding: 0 5px 0 0; font-size: 11px; }
.mc-ann-pin.is-open { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-ann-pin.is-resolved { opacity: .55; }
.mc-ann-peek { position: absolute; transform-origin: 0 0; width: 240px; padding: 8px 10px; box-sizing: border-box; display: grid; gap: 2px; pointer-events: none; opacity: 0; translate: -4px 0; transition: opacity 120ms var(--ease-out), translate 160ms var(--ease-out); font-family: var(--font-sans); color: var(--ink); z-index: 1; }
.mc-ann-peek p { margin: 0; font-size: 12px; line-height: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.mc-ann-more { font-size: 11px; color: var(--accent); }
.mc-ann-pin:hover + .mc-ann-peek { opacity: 1; translate: 0 0; transition-delay: 250ms; }
.mc-ann-pin:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
@keyframes mc-ann-in { from { opacity: 0; scale: .96; } }
.mc-ann-thread { animation: mc-ann-in 160ms var(--ease-out); z-index: 2; position: absolute; transform-origin: 0 0; width: 288px; padding: 10px; box-sizing: border-box; display: grid; gap: 10px; cursor: default; color: var(--ink); font-family: var(--font-sans); }
.mc-ann-hd { display: flex; align-items: center; gap: 2px; font: 600 13px/16px var(--font-display); }
.mc-ann-hd .grow { flex: 1; }
.mc-ann-msgs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; max-height: 220px; overflow-y: auto; }
.mc-ann-msgs li { display: flex; gap: 8px; align-items: flex-start; }
.mc-ann-msgs .mc-avatar { flex: none; width: 24px; height: 24px; font-size: 10px; }
.mc-ann-meta { font-size: 11px; line-height: 14px; color: var(--ink-muted); }
.mc-ann-meta b { color: var(--ink); }
.mc-ann-msgs p { margin: 2px 0 0; font-size: 13px; line-height: 18px; white-space: pre-wrap; overflow-wrap: anywhere; }
.mc-ann-empty { margin: 0; font-size: 12px; line-height: 16px; color: var(--ink-muted); }
.mc-ann-input textarea { min-height: 52px; }
.mc-ann-ft { display: flex; align-items: center; justify-content: space-between; }
.mc-ann-hint { font-size: 11px; color: var(--ink-subtle); }
</style>
