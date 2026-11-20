<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

/** L'objet dont on liste les cartes. */
export interface MapsObject {
  /** Nom de l'objet : « Scolarité ». */
  name: string
  /** Type : « Domaine », « Application ». */
  type: string
  /** Couche : teinte des vignettes. */
  layer: Layer
  /** Pictogramme du type. */
  icon: IconName
}
/** Une carte qu'on peut ouvrir. */
export interface AssociatedMap {
  /** Titre de la carte. */
  title: string
  /** Un fait : « 10 applications, 34 flux ». */
  description?: string
  /** Pictogramme de la vue (flow, app, pos, server…). */
  icon: IconName
  /** Adresse de la carte. */
  href?: string
}

const props = withDefaults(
  defineProps<{
    /** L'objet ou la tuile d'origine. */
    object: MapsObject
    /** Cartes associées. */
    maps: AssociatedMap[]
    /** Rendu en place, toujours visible (documentation). Sans lui, le slot `trigger` ouvre le popover au clic. */
    inline?: boolean
    /** Côté d'alignement sous le déclencheur. */
    align?: 'start' | 'end'
  }>(),
  { inline: false, align: 'start' },
)

/** Popover ouvert. */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  /** Une carte est choisie. */
  open: [map: AssociatedMap]
}>()

const id = useId()
const host = ref<HTMLElement | null>(null)
const pop = ref<HTMLElement | null>(null)
const active = ref(0)
let opener: HTMLElement | null = null

const links = () => Array.from(pop.value?.querySelectorAll<HTMLElement>('.it') ?? [])
function focusAt(i: number) {
  const l = links()
  if (!l.length) return
  active.value = (i + l.length) % l.length
  l[active.value].focus()
}
function close(returnFocus = true) {
  open.value = false
  if (returnFocus) opener?.focus?.()
}
function toggle(e?: Event) {
  if (!open.value) opener = (e?.currentTarget as HTMLElement) ?? (document.activeElement as HTMLElement)
  open.value = !open.value
}
function choose(e: MouseEvent, m: AssociatedMap) {
  if (!m.href) e.preventDefault()
  emit('open', m)
  if (!props.inline) close()
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && !props.inline) close()
  else if (e.key === 'ArrowDown') focusAt(active.value + 1)
  else if (e.key === 'ArrowUp') focusAt(active.value - 1)
  else if (e.key === 'Home') focusAt(0)
  else if (e.key === 'End') focusAt(-1)
  else return
  e.preventDefault()
}
function onDocDown(e: PointerEvent) {
  if (host.value && !host.value.contains(e.target as Node)) close(false)
}
watch(open, async (o) => {
  if (props.inline) return
  if (o) {
    if (!opener) opener = document.activeElement as HTMLElement | null
    document.addEventListener('pointerdown', onDocDown, true)
    await nextTick()
    focusAt(0)
  } else {
    document.removeEventListener('pointerdown', onDocDown, true)
    opener = null
  }
})
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocDown, true))
const count = () => `${props.maps.length} ${props.maps.length > 1 ? 'cartes' : 'carte'}`
</script>

<template>
  <span ref="host" class="mc-maps-host" :class="{ 'is-inline': inline }">
    <slot name="trigger" :open="open" :toggle="toggle" :aria="{ 'aria-haspopup': 'dialog', 'aria-expanded': open, 'aria-controls': `${id}-pop` }" />
    <Transition name="mc-pop">
      <div
        v-if="open || inline"
        :id="`${id}-pop`"
        ref="pop"
        class="mc-pop mc-maps"
        :class="{ 'is-placed': !inline, end: align === 'end' }"
        role="dialog"
        :aria-labelledby="`${id}-t`"
        @keydown="onKey"
      >
        <div class="head" :class="`l-${object.layer}`">
          <span class="mc-chip type"><span class="sw"><McIcon :name="object.icon" /></span>{{ object.name }}</span>
          <span :id="`${id}-t`" class="mc-sr">Cartes associées à {{ object.name }} ({{ object.type }})</span>
          <span class="mc-cap" style="margin-left: auto">{{ count() }}</span>
        </div>
        <a
          v-for="(m, i) in maps"
          :key="m.title"
          class="it"
          :class="[`l-${object.layer}`, { 'is-on': i === active && !inline }]"
          :href="m.href ?? '#'"
          @focus="active = i"
          @mouseenter="active = i"
          @click="choose($event, m)"
        >
          <span class="th"><McIcon :name="m.icon" /></span>
          <span class="tx"><b>{{ m.title }}</b><span v-if="m.description">{{ m.description }}</span></span>
          <span class="go"><McIcon name="arrow-right" size="sm" /></span>
        </a>
        <p v-if="!maps.length" class="mc-cap mc-maps-empty">Aucune carte ne montre encore {{ object.name }}.</p>
      </div>
    </Transition>
  </span>
</template>

<style>
.mc-maps-host { position: relative; display: inline-flex; }
.mc-maps-host.is-inline { display: block; }
.mc-maps { box-sizing: border-box; }
.mc-maps.is-placed { position: absolute; top: calc(100% + 6px); left: 0; z-index: 40; }
.mc-maps.is-placed.end { left: auto; right: 0; }
.mc-maps a.it { color: inherit; text-decoration: none; }
.mc-maps a.it:focus { outline: none; }
.mc-maps a.it:focus-visible { box-shadow: inset 0 0 0 2px var(--focus); }
.mc-maps-empty { margin: 0; padding: 4px 8px 8px; }
</style>
