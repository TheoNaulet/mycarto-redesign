<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../McButton/McButton.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

/** Une section de la navigation latérale (saisie longue). */
export interface ModalSection {
  /** Identifiant ; le contenu correspondant porte `data-section="<id>"`. */
  id: string
  /** Libellé : « Général », « Cycle de vie »… */
  label: string
  /** Pictogramme. */
  icon?: IconName
  /** Des champs ont été modifiés (point bleu). */
  modified?: boolean
  /** Un champ est à corriger (icône rouge). */
  error?: boolean
}

const props = withDefaults(
  defineProps<{
    /** L'action + l'objet : « Modifier APOGEE », jamais « Modification de l'occurrence APOGEE ». */
    title: string
    /** Type de l'objet, affiché en puce au-dessus du titre (remplaçable par le slot `chip`). */
    type?: { label: string; icon: IconName; layer: Layer }
    /** Ligne de contexte sous le titre : « Créée le 18/12/2024 · modifiée le 19/12/2024 ». */
    subtitle?: string
    /** md 560px (création, confirmation), lg 860px (saisie longue). */
    size?: 'md' | 'lg'
    /** Confirmation d'une action destructrice : bouton rouge, focus sur « Annuler ». */
    danger?: boolean
    /** Libellé de l'action principale. */
    confirmLabel?: string
    /** Pictogramme de l'action principale. */
    confirmIcon?: IconName
    /** Action principale indisponible (champ obligatoire vide, erreur). */
    confirmDisabled?: boolean
    /** Enregistrement en cours : roue sur l'action principale. */
    loading?: boolean
    /** Libellé du bouton d'annulation. */
    cancelLabel?: string
    /** Indication à gauche du pied : « 2 modifications · 1 champ à corriger ». */
    footerNote?: string
    /** Des modifications ne sont pas enregistrées : fermer demande d'abord confirmation. */
    dirty?: boolean
    /** Le clic sur le voile ferme la modale. */
    closeOnScrim?: boolean
    /** Navigation par sections à gauche (saisie longue) ; le corps défile. */
    sections?: ModalSection[]
    /** Positionnée dans le conteneur le plus proche plutôt que sur toute la fenêtre (documentation). */
    contained?: boolean
    /** Donne le focus à la modale à l'ouverture (désactiver seulement pour montrer plusieurs modales ensemble). */
    autofocus?: boolean
  }>(),
  {
    type: undefined,
    subtitle: undefined,
    size: 'md',
    danger: false,
    confirmLabel: 'Enregistrer',
    confirmIcon: undefined,
    confirmDisabled: false,
    loading: false,
    cancelLabel: 'Annuler',
    footerNote: undefined,
    dirty: false,
    closeOnScrim: true,
    sections: undefined,
    contained: false,
    autofocus: true,
  },
)

/** Modale ouverte. */
const open = defineModel<boolean>('open', { default: false })
/** Section active de la navigation latérale. */
const section = defineModel<string>('section')

const emit = defineEmits<{
  /** La modale se ferme (Échap, voile, croix, Annuler). */
  close: []
  /** Clic sur « Annuler ». */
  cancel: []
  /** Clic sur l'action principale. La modale reste ouverte : à l'appelant de la fermer. */
  confirm: []
}>()

const id = useId()
const panel = ref<HTMLElement | null>(null)
const form = ref<HTMLElement | null>(null)
const cancelBtn = ref<InstanceType<typeof McButton> | null>(null)
const asking = ref(false)
let opener: HTMLElement | null = null

const hasNav = computed(() => !!props.sections?.length)
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

watch(
  open,
  async (o) => {
    if (o) {
      opener = document.activeElement as HTMLElement | null
      asking.value = false
      if (hasNav.value && !section.value) section.value = props.sections![0].id
      if (!props.autofocus) return
      await nextTick()
      const root = panel.value
      if (!root) return
      if (props.danger) {
        ;(cancelBtn.value?.$el as HTMLElement | undefined)?.focus()
        return
      }
      const field = root.querySelector<HTMLElement>('.mc-modal-body input:not([disabled]), .mc-modal-body select:not([disabled]), .mc-modal-body textarea:not([disabled])')
      ;(field ?? root.querySelector<HTMLElement>(FOCUSABLE) ?? root).focus()
    } else {
      opener?.focus?.()
      opener = null
    }
  },
  { immediate: true },
)

function close() {
  open.value = false
  emit('close')
}
function requestClose() {
  if (props.dirty && !asking.value) {
    asking.value = true
    return
  }
  close()
}
function cancel() {
  emit('cancel')
  requestClose()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.preventDefault()
    e.stopPropagation()
    if (asking.value) asking.value = false
    else requestClose()
  } else if (e.key === 'Tab' && panel.value) {
    const list = Array.from(panel.value.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
    if (!list.length) return
    const first = list[0]
    const last = list[list.length - 1]
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault()
      last.focus()
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault()
      first.focus()
    }
  }
}

/* ---------- Listes déroulantes dans le corps ----------
   Le corps défile (overflow auto) et la modale arrondit ses coins (overflow hidden) : une liste de McSelect ouverte
   y serait coupée. Tant qu'une liste est ouverte et que le contenu tient sans défiler, le corps et la modale laissent
   déborder : la liste s'affiche en entier par-dessus le pied. Si le corps défile, rien ne change (on fait défiler). */
const popping = ref(false)
let popObserver: MutationObserver | null = null
function checkPop() {
  const body = panel.value?.querySelector<HTMLElement>('.mc-modal-body')
  const pop = body?.querySelector<HTMLElement>('.mc-select-pop')
  if (!body || !pop) {
    popping.value = false
    return
  }
  if (popping.value) return
  // Mesure sans la liste : une liste en position absolue compte dans la hauteur défilable.
  const prev = pop.style.display
  pop.style.display = 'none'
  const fits = body.scrollHeight <= body.clientHeight + 1
  pop.style.display = prev
  popping.value = fits
  // Près du bas de la fenêtre, la liste s'ouvre vers le haut si la place y est plus grande.
  if (fits) {
    const r = pop.getBoundingClientRect()
    const anchor = pop.parentElement?.getBoundingClientRect()
    if (anchor && r.bottom > window.innerHeight - 8 && anchor.top - 8 > window.innerHeight - anchor.bottom) {
      pop.style.top = 'auto'
      pop.style.bottom = 'calc(100% + 4px)'
    }
  }
}
watch(panel, (el) => {
  popObserver?.disconnect()
  popObserver = null
  popping.value = false
  if (!el || typeof MutationObserver === 'undefined') return
  popObserver = new MutationObserver(checkPop)
  popObserver.observe(el, { childList: true, subtree: true })
})
onBeforeUnmount(() => popObserver?.disconnect())

/** Section choisie au clic : elle reste active pendant le défilement qu'elle déclenche,
 * même si le formulaire bute en bas avant qu'elle n'atteigne le haut (dernières sections courtes). */
let pinned: string | null = null
let pinTimer: ReturnType<typeof setTimeout> | undefined
function goSection(s: ModalSection) {
  section.value = s.id
  const target = form.value?.querySelector<HTMLElement>(`[data-section="${CSS.escape(s.id)}"]`)
  if (!target || !form.value) return
  const el = form.value
  const top = Math.min(target.offsetTop - 20, el.scrollHeight - el.clientHeight)
  if (Math.abs(top - el.scrollTop) < 2) return
  pinned = s.id
  clearTimeout(pinTimer)
  pinTimer = setTimeout(() => (pinned = null), 1000)
  el.scrollTo({ top, behavior: 'smooth' })
}
function onScroll() {
  if (!form.value || !props.sections) return
  if (pinned) {
    // Le défilement programmé continue : on attend qu'il s'arrête avant de rendre la main à l'utilisateur.
    clearTimeout(pinTimer)
    pinTimer = setTimeout(() => (pinned = null), 150)
    return
  }
  const el = form.value
  const top = el.scrollTop + 32
  let cur = props.sections[0].id
  for (const s of props.sections) {
    const node = el.querySelector<HTMLElement>(`[data-section="${CSS.escape(s.id)}"]`)
    if (node && node.offsetTop <= top) cur = s.id
  }
  section.value = cur
}
onBeforeUnmount(() => clearTimeout(pinTimer))

/* Espace sous la dernière section : juste ce qu'il faut pour que son titre puisse monter en haut.
 * Sans lui, les dernières sections, courtes, ne deviennent jamais actives au défilement. */
const tail = ref(0)
function measureTail() {
  const el = form.value
  if (!el || !props.sections?.length) return
  const last = el.querySelector<HTMLElement>(`[data-section="${CSS.escape(props.sections[props.sections.length - 1].id)}"]`)
  if (!last) return
  const content = el.scrollHeight - tail.value
  tail.value = Math.max(0, Math.ceil(last.offsetTop - 20 + el.clientHeight - content))
}
let tailObserver: ResizeObserver | null = null
watch(form, (el) => {
  tailObserver?.disconnect()
  tailObserver = null
  if (!el || typeof ResizeObserver === 'undefined') return
  tailObserver = new ResizeObserver(() => measureTail())
  tailObserver.observe(el)
  for (const child of Array.from(el.children)) tailObserver.observe(child)
  nextTick(measureTail)
})
onBeforeUnmount(() => tailObserver?.disconnect())
</script>

<template>
  <Transition name="mc-overlay">
    <div v-if="open" class="mc-scrim mc-modal-layer" :class="{ contained }" @click.self="closeOnScrim && requestClose()" @keydown="onKey" @wheel.stop>
      <div
        ref="panel"
        class="mc-modal"
        :class="{ lg: size === 'lg', 'has-nav': hasNav, 'is-danger': danger, 'is-popping': popping }"
        :role="danger ? 'alertdialog' : 'dialog'"
        aria-modal="true"
        :aria-labelledby="`${id}-t`"
        :aria-describedby="danger ? `${id}-b` : undefined"
        tabindex="-1"
      >
        <div class="hd" :class="{ 'mc-modal-hd-tile': hasNav }">
          <slot name="header">
            <span v-if="hasNav && type" class="mc-modal-tile" :class="`l-${type.layer}`"><McIcon :name="type.icon" size="lg" /></span>
            <span v-else-if="danger" class="mc-modal-tile mc-modal-tile-danger"><McIcon name="alert-triangle" size="lg" /></span>
            <div class="grow mc-modal-titles">
              <slot v-if="!hasNav" name="chip">
                <span v-if="type" class="mc-chip type" :class="`l-${type.layer}`"><span class="sw"><McIcon :name="type.icon" /></span>{{ type.label }}</span>
              </slot>
              <h2 :id="`${id}-t`" class="title-lg">{{ title }}</h2>
              <div v-if="hasNav && (type || subtitle)" class="mc-row" style="gap: 6px">
                <slot name="chip">
                  <span v-if="type" class="mc-chip sm type" :class="`l-${type.layer}`"><span class="sw"><McIcon :name="type.icon" /></span>{{ type.label }}</span>
                </slot>
                <span v-if="subtitle" class="mc-cap">{{ subtitle }}</span>
              </div>
              <span v-else-if="subtitle" class="mc-cap">{{ subtitle }}</span>
            </div>
          </slot>
          <button type="button" class="mc-ibtn" aria-label="Fermer" @click="requestClose"><McIcon name="x" /></button>
        </div>

        <div v-if="hasNav" class="mc-modal-split">
          <nav class="mc-modal-nav" aria-label="Sections">
            <button
              v-for="s in sections"
              :key="s.id"
              type="button"
              :class="{ 'is-on': section === s.id }"
              :aria-current="section === s.id ? 'true' : undefined"
              @click="goSection(s)"
            >
              <McIcon v-if="s.icon" :name="s.icon" size="sm" />{{ s.label }}
              <span v-if="s.error" class="err"><McIcon name="alert-octagon" size="sm" label="À corriger" /></span>
              <span v-else-if="s.modified" class="dot" role="img" aria-label="Modifiée" />
            </button>
          </nav>
          <div ref="form" class="mc-modal-body mc-modal-form" @scroll.passive="onScroll"><slot /><div v-if="sections?.length" class="mc-modal-tail" :style="{ height: tail + 'px' }" aria-hidden="true" /></div>
        </div>
        <div v-else :id="`${id}-b`" class="bd mc-modal-body"><slot /></div>

        <div class="ft">
          <template v-if="asking">
            <span class="left mc-modal-ask" role="alert"><McIcon name="alert-triangle" size="sm" />Des modifications ne sont pas enregistrées.</span>
            <McButton variant="outline" @click="asking = false">Continuer la saisie</McButton>
            <McButton variant="danger" @click="close">Fermer sans enregistrer</McButton>
          </template>
          <slot v-else name="footer" :close="requestClose">
            <span v-if="footerNote" class="left"><McIcon name="info" size="sm" />{{ footerNote }}</span>
            <McButton ref="cancelBtn" variant="outline" @click="cancel">{{ cancelLabel }}</McButton>
            <McButton
              :variant="danger ? 'danger' : 'primary'"
              :icon="confirmIcon ?? (danger ? 'trash' : undefined)"
              :disabled="confirmDisabled"
              :loading="loading"
              @click="emit('confirm')"
            >{{ confirmLabel }}</McButton>
          </slot>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
.mc-modal-layer { position: fixed; inset: 0; z-index: 70; align-items: center; box-sizing: border-box; }
.mc-modal-layer.contained { position: absolute; }
.mc-modal { display: flex; flex-direction: column; max-height: 100%; outline: none; }
.mc-modal.lg { width: 860px; }
.mc-modal .hd { flex: none; }
.mc-modal .bd { overflow-y: auto; min-height: 0; }
.mc-modal .ft { flex: none; align-items: center; }
.mc-modal-titles { display: grid; gap: 6px; justify-items: start; min-width: 0; }
.mc-modal-titles .title-lg { margin: 0; color: var(--ink); }
.mc-modal .hd.mc-modal-hd-tile { align-items: center; padding: 18px 20px 14px 24px; border-bottom: 1px solid var(--line); }
.mc-modal .hd.mc-modal-hd-tile .mc-modal-titles { gap: 4px; }
.mc-modal-tile { width: 40px; height: 40px; border-radius: 10px; background: var(--ls); color: var(--lc); display: inline-flex; align-items: center; justify-content: center; flex: none; }
.mc-modal-tile-danger { background: var(--status-critical-soft); color: var(--status-critical); }
.mc-modal.has-nav { height: 740px; }
.mc-modal-split { flex: 1; display: flex; min-height: 0; }
.mc-modal-nav { width: 200px; flex: none; padding: 14px 10px; border-right: 1px solid var(--line); background: var(--surface-sunken); display: grid; gap: 2px; align-content: start; overflow-y: auto; }
.mc-modal-nav button { display: flex; align-items: center; gap: 8px; padding: 8px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; font: 400 13px/18px var(--font-sans); color: var(--ink-muted); text-align: left; cursor: pointer; }
.mc-modal-nav button:hover { color: var(--ink); }
.mc-modal-nav button.is-on { background: var(--surface); color: var(--ink); font-weight: 600; box-shadow: var(--shadow-node); }
.mc-modal-nav .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-left: auto; flex: none; }
.mc-modal-nav .err { margin-left: auto; color: var(--status-critical); display: inline-flex; }
.mc-modal-form { position: relative; flex: 1; overflow-y: auto; padding: 20px 24px; display: grid; gap: 22px; align-content: start; }
.mc-modal-form h3 { margin: 0; font: 600 15px/20px var(--font-display); color: var(--ink); }
.mc-modal.is-popping, .mc-modal.is-popping .mc-modal-split, .mc-modal.is-popping .mc-modal-body { overflow: visible; }
.mc-modal.is-popping .ft { border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
.mc-modal .ft .left.mc-modal-ask { color: var(--status-warn); font-weight: 600; }
</style>
