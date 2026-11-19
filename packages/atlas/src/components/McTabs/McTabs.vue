<script setup lang="ts">
import { ref, useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

/** Un onglet. */
export interface TabItem {
  /** Valeur liée au `v-model`. */
  value: string
  /** Libellé d'un ou deux mots. */
  label: string
  /** Pictogramme devant le libellé (surtout en variante pilule). */
  icon?: IconName
  /** Compteur facultatif après le libellé. */
  count?: number
  /** Onglet indisponible. */
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    /** 2 à 5 onglets. */
    tabs: TabItem[]
    /** underline : inspecteur et modales ; pill : vues d'une même carte, au-dessus du canevas. */
    variant?: 'underline' | 'pill'
    /** Nom de la liste d'onglets pour les lecteurs d'écran. */
    ariaLabel?: string
  }>(),
  { variant: 'underline', ariaLabel: undefined },
)

/** Onglet actif. */
const model = defineModel<string>()
const id = useId()
const list = ref<HTMLElement | null>(null)

const tabId = (v: string) => `${id}-tab-${v}`
const panelId = (v: string) => `${id}-panel-${v}`

function select(t: TabItem) {
  if (!t.disabled) model.value = t.value
}
function onKey(e: KeyboardEvent, index: number) {
  const enabled = props.tabs.map((t, i) => (t.disabled ? -1 : i)).filter((i) => i >= 0)
  const pos = enabled.indexOf(index)
  let next: number | undefined
  if (e.key === 'ArrowRight') next = enabled[(pos + 1) % enabled.length]
  else if (e.key === 'ArrowLeft') next = enabled[(pos - 1 + enabled.length) % enabled.length]
  else if (e.key === 'Home') next = enabled[0]
  else if (e.key === 'End') next = enabled[enabled.length - 1]
  if (next === undefined) return
  e.preventDefault()
  select(props.tabs[next])
  list.value?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus()
}
const current = () => model.value ?? props.tabs.find((t) => !t.disabled)?.value
</script>

<template>
  <div>
    <div ref="list" class="mc-tabs" :class="{ pill: variant === 'pill' }" role="tablist" :aria-label="ariaLabel">
      <button
        v-for="(t, i) in tabs"
        :id="tabId(t.value)"
        :key="t.value"
        type="button"
        role="tab"
        :class="{ 'is-on': t.value === current() }"
        :aria-selected="t.value === current()"
        :aria-controls="$slots.default ? panelId(t.value) : undefined"
        :tabindex="t.value === current() ? 0 : -1"
        :disabled="t.disabled"
        @click="select(t)"
        @keydown="onKey($event, i)"
      >
        <McIcon v-if="t.icon" :name="t.icon" size="sm" />{{ t.label }}
        <span v-if="t.count !== undefined" class="mc-count">{{ t.count }}</span>
      </button>
    </div>
    <div
      v-if="$slots.default && current()"
      :id="panelId(current()!)"
      role="tabpanel"
      :aria-labelledby="tabId(current()!)"
      tabindex="0"
      class="mc-tabpanel"
    >
      <slot :value="current()" />
    </div>
  </div>
</template>

<style>
.mc-tabs button[disabled] { opacity: .45; cursor: not-allowed; }
.mc-tabs button:hover:not(.is-on):not([disabled]) { color: var(--ink); }
.mc-tabpanel { padding-top: var(--space-3); }
.mc-tabpanel:focus { outline: none; }
.mc-tabpanel:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px; }
</style>
