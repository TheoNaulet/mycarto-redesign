<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

/** Une action du menu. */
export interface ContextMenuItem {
  /** Identifiant, renvoyé avec `select`. */
  id?: string
  /** Verbe à l'infinitif + objet : « Ouvrir la fiche ». */
  label: string
  /** Pictogramme à gauche. */
  icon?: IconName
  /** Raccourci affiché à droite : « ⌘L », « Entrée ». */
  shortcut?: string
  /** Action destructrice : toujours en dernier. */
  danger?: boolean
  /** Action indisponible ici. */
  disabled?: boolean
  /** Sous-menu : affiche le chevron (le contenu est géré par l'appelant). */
  children?: ContextMenuItem[]
}

const props = withDefaults(
  defineProps<{
    /** Actions et séparateurs (`'separator'`). 9 actions au plus avant un sous-menu. */
    items: (ContextMenuItem | 'separator')[]
    /** Titre en surtitre : le nom de l'objet visé (« APOGEE »). */
    header?: string
    /** Position horizontale (px) dans le conteneur positionné le plus proche. */
    x?: number
    /** Position verticale (px) dans le conteneur positionné le plus proche. */
    y?: number
    /** Rendu en place, sans positionnement (documentation, menu ancré par l'appelant). */
    inline?: boolean
    /** Largeur du menu en px. */
    width?: number
    /** Nom du menu pour les lecteurs d'écran (sinon `header`). */
    ariaLabel?: string
  }>(),
  { header: undefined, x: 0, y: 0, inline: false, width: 260, ariaLabel: undefined },
)

/** Menu ouvert. */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Une action est choisie (clic, Entrée, Espace, ou flèche droite sur un sous-menu). */
  select: [item: ContextMenuItem]
}>()

const id = useId()
const el = ref<HTMLElement | null>(null)
const active = ref(-1)
let opener: HTMLElement | null = null

const actions = computed(() =>
  props.items.map((it, i) => ({ it, i })).filter((x): x is { it: ContextMenuItem; i: number } => x.it !== 'separator'),
)
const enabled = computed(() => actions.value.filter((a) => !a.it.disabled).map((a) => a.i))

function move(delta: number) {
  const list = enabled.value
  if (!list.length) return
  const pos = list.indexOf(active.value)
  active.value = pos < 0 ? (delta > 0 ? list[0] : list[list.length - 1]) : list[(pos + delta + list.length) % list.length]
  el.value?.querySelector<HTMLElement>(`[data-i="${active.value}"]`)?.focus()
}
function close(returnFocus = true) {
  open.value = false
  if (returnFocus) opener?.focus?.()
}
function choose(item: ContextMenuItem) {
  if (item.disabled) return
  emit('select', item)
  if (!item.children?.length) close()
}
function onKey(e: KeyboardEvent) {
  const cur = props.items[active.value]
  switch (e.key) {
    case 'ArrowDown': move(1); break
    case 'ArrowUp': move(-1); break
    case 'Home': active.value = -1; move(1); break
    case 'End': active.value = -1; move(-1); break
    case 'Escape': close(); break
    case 'Tab': close(false); return
    case 'Enter':
    case ' ':
      if (cur && cur !== 'separator') choose(cur)
      break
    case 'ArrowRight':
      if (cur && cur !== 'separator' && cur.children?.length) choose(cur)
      break
    default: return
  }
  e.preventDefault()
}
function onDocDown(e: PointerEvent) {
  if (el.value && !el.value.contains(e.target as Node)) close(false)
}

watch(
  open,
  async (o) => {
    if (o) {
      opener = document.activeElement as HTMLElement | null
      active.value = -1
      if (props.inline) return
      document.addEventListener('pointerdown', onDocDown, true)
      await nextTick()
      move(1)
    } else {
      document.removeEventListener('pointerdown', onDocDown, true)
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocDown, true))
</script>

<template>
  <Transition name="mc-pop">
    <div
      v-if="open"
      ref="el"
      class="mc-menu mc-ctx"
      :class="{ 'is-placed': !inline }"
      role="menu"
      :aria-label="ariaLabel ?? header"
      :style="{ width: `${width}px`, ...(inline ? {} : { left: `${x}px`, top: `${y}px` }) }"
      @keydown="onKey"
      @contextmenu.prevent
    >
      <div v-if="header" :id="`${id}-h`" class="head" aria-hidden="true">{{ header }}</div>
      <template v-for="(it, i) in items" :key="i">
        <div v-if="it === 'separator'" class="sep" role="separator" />
        <div
          v-else
          class="it"
          role="menuitem"
          tabindex="-1"
          :data-i="i"
          :class="{ 'is-on': active === i, danger: it.danger, 'is-disabled': it.disabled }"
          :aria-disabled="it.disabled || undefined"
          :aria-haspopup="it.children?.length ? 'menu' : undefined"
          :aria-keyshortcuts="it.shortcut"
          @mouseenter="!it.disabled && (active = i)"
          @mouseleave="active = -1"
          @click="choose(it)"
        >
          <McIcon v-if="it.icon" :name="it.icon" size="sm" />
          <span class="grow">{{ it.label }}</span>
          <span v-if="it.shortcut" class="k">{{ it.shortcut }}</span>
          <McIcon v-if="it.children?.length" name="chevron-right" size="sm" />
        </div>
      </template>
    </div>
  </Transition>
</template>

<style>
.mc-ctx { box-sizing: border-box; user-select: none; }
.mc-ctx.is-placed { position: absolute; z-index: 40; }
.mc-ctx:focus, .mc-ctx .it:focus { outline: none; }
.mc-ctx .it:focus-visible { box-shadow: inset 0 0 0 2px var(--focus); }
.mc-menu .it.danger.is-on, .mc-menu .it.danger:hover { background: var(--status-critical); color: var(--on-navy); }
</style>
