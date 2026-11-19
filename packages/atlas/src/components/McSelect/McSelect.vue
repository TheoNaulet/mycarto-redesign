<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import McDicpBadge, { type DicpLetter } from '../McDicpBadge/McDicpBadge.vue'
import type { Criticity, Status } from '../../utils/types'

export type McSelectValue = string | number

export interface McSelectOption {
  value: McSelectValue
  label: string
  disabled?: boolean
  /** Niveau DICP : affiche le carré de criticité devant le libellé. */
  criticity?: Criticity
  /** État : le libellé est affiché dans une puce d'état. */
  status?: Status
}

const props = withDefaults(
  defineProps<{
    /** Valeurs proposées. Une recherche apparaît en tête de liste au-delà de `searchFrom` options. */
    options: McSelectOption[]
    /** Libellé au-dessus du champ. Sans libellé, passer `ariaLabel`. */
    label?: string
    /** Texte affiché quand aucune valeur n'est choisie. */
    placeholder?: string
    /** Message d'aide sous le champ. */
    help?: string
    /** Message d'erreur : ce qui ne va pas + comment corriger. Active l'état erreur. */
    error?: string
    /** Champ obligatoire (astérisque rouge après le libellé). */
    required?: boolean
    /** Champ inactif. */
    disabled?: boolean
    /** Marque le champ comme modifié (point bleu après le libellé). */
    modified?: boolean
    /** Ajoute en tête de liste l'option « Non renseigné » qui vide la valeur. */
    clearable?: boolean
    /** Lettre écrite dans le carré de criticité des options (D, I, C ou P). */
    criticityLetter?: DicpLetter
    /** Nombre d'options à partir duquel la liste porte une recherche. */
    searchFrom?: number
    /** sm 28px, md 32px. */
    size?: 'sm' | 'md'
    /** Nom accessible quand il n'y a pas de libellé visible. */
    ariaLabel?: string
  }>(),
  {
    label: undefined,
    placeholder: 'Non renseigné',
    help: undefined,
    error: undefined,
    criticityLetter: 'D',
    searchFrom: 9,
    size: 'md',
    ariaLabel: undefined,
  },
)

const model = defineModel<McSelectValue | null>({ default: null })
const emit = defineEmits<{ change: [value: McSelectValue | null]; open: []; close: [] }>()

const id = useId()
const root = ref<HTMLElement>()
const trigger = ref<HTMLButtonElement>()
const list = ref<HTMLElement>()
const searchInput = ref<HTMLInputElement>()

const open = ref(false)
const query = ref('')
const active = ref(-1)

const EMPTY = Symbol('empty')
type Row = McSelectOption | { value: typeof EMPTY; label: string; disabled?: false; criticity?: undefined; status?: undefined }

const selected = computed(() => props.options.find((o) => o.value === model.value))
const hasSearch = computed(() => props.options.length >= props.searchFrom)

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const rows = computed<Row[]>(() => {
  const q = normalize(query.value.trim())
  const filtered = q ? props.options.filter((o) => normalize(o.label).includes(q)) : props.options
  return props.clearable && !q ? [{ value: EMPTY, label: props.placeholder }, ...filtered] : filtered
})

/** Props du carré DICP : une seule lettre, au niveau de l'option. */
const dicp = (level: Criticity) => ({ only: props.criticityLetter, [props.criticityLetter.toLowerCase()]: level })

const optionId = (i: number) => `${id}-opt-${i}`
const describedBy = computed(() => (props.error ? `${id}-err` : props.help ? `${id}-help` : undefined))
const activeId = computed(() => (open.value && active.value >= 0 ? optionId(active.value) : undefined))

function isSelected(row: Row) {
  return row.value === EMPTY ? model.value === null || model.value === undefined : row.value === model.value
}

function firstEnabled(from: number, step: 1 | -1) {
  const n = rows.value.length
  for (let k = 0, i = from; k < n; k++, i += step) {
    const j = ((i % n) + n) % n
    if (!rows.value[j].disabled) return j
  }
  return -1
}

function scrollToActive() {
  nextTick(() => {
    const el = list.value?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active.value))}`)
    el?.scrollIntoView({ block: 'nearest' })
  })
}

function openList() {
  if (props.disabled || open.value) return
  open.value = true
  query.value = ''
  const i = rows.value.findIndex(isSelected)
  active.value = i >= 0 ? i : firstEnabled(0, 1)
  emit('open')
  nextTick(() => {
    ;(hasSearch.value ? searchInput.value : list.value)?.focus()
    scrollToActive()
  })
}

function closeList(refocus = true) {
  if (!open.value) return
  open.value = false
  emit('close')
  if (refocus) trigger.value?.focus()
}

function choose(row: Row | undefined) {
  if (!row || row.disabled) return
  const value = row.value === EMPTY ? null : row.value
  if (value !== model.value) {
    model.value = value
    emit('change', value)
  }
  closeList()
}

function move(step: 1 | -1) {
  const next = firstEnabled(active.value + step, step)
  if (next >= 0) active.value = next
  scrollToActive()
}

/* Saisie rapide : taper les premières lettres va à l'option correspondante. */
let typed = ''
let typedTimer: ReturnType<typeof setTimeout> | undefined
function typeahead(char: string) {
  typed += normalize(char)
  clearTimeout(typedTimer)
  typedTimer = setTimeout(() => (typed = ''), 600)
  const n = rows.value.length
  const start = typed.length === 1 ? active.value + 1 : active.value
  for (let k = 0; k < n; k++) {
    const j = (((start + k) % n) + n) % n
    const r = rows.value[j]
    if (!r.disabled && r.value !== EMPTY && normalize(r.label).startsWith(typed)) {
      active.value = j
      scrollToActive()
      return
    }
  }
}

function onTriggerKey(e: KeyboardEvent) {
  if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
    e.preventDefault()
    openList()
  } else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
    openList()
    if (!hasSearch.value) nextTick(() => typeahead(e.key))
    else nextTick(() => (query.value = e.key))
    e.preventDefault()
  }
}

function onListKey(e: KeyboardEvent) {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      move(1)
      break
    case 'ArrowUp':
      e.preventDefault()
      move(-1)
      break
    case 'Home':
      if (e.target === searchInput.value) return
      e.preventDefault()
      active.value = firstEnabled(0, 1)
      scrollToActive()
      break
    case 'End':
      if (e.target === searchInput.value) return
      e.preventDefault()
      active.value = firstEnabled(rows.value.length - 1, -1)
      scrollToActive()
      break
    case 'Enter':
      e.preventDefault()
      choose(rows.value[active.value])
      break
    case ' ':
      if (e.target === searchInput.value) return
      e.preventDefault()
      choose(rows.value[active.value])
      break
    case 'Escape':
      e.preventDefault()
      e.stopPropagation()
      closeList()
      break
    case 'Tab':
      closeList(false)
      break
    default:
      if (e.target !== searchInput.value && e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) typeahead(e.key)
  }
}

watch(query, () => {
  active.value = firstEnabled(0, 1)
})

/* Clic en dehors : on ferme sans reprendre le focus. */
function onDocPointer(e: PointerEvent) {
  if (root.value && !root.value.contains(e.target as Node)) closeList(false)
}
watch(open, (v) => {
  if (v) document.addEventListener('pointerdown', onDocPointer, true)
  else document.removeEventListener('pointerdown', onDocPointer, true)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocPointer, true)
  clearTimeout(typedTimer)
})

defineExpose({ open: openList, close: closeList, focus: () => trigger.value?.focus() })
</script>

<template>
  <div ref="root" class="mc-field mc-select" :class="{ 'is-modified': modified, 'is-open': open }">
    <label v-if="label" :id="`${id}-label`" class="mc-field-label" :for="`${id}-trigger`">
      {{ label }}<span v-if="required" class="mc-req" aria-hidden="true">*</span>
    </label>
    <div class="mc-select-anchor">
    <button
      :id="`${id}-trigger`"
      ref="trigger"
      type="button"
      class="mc-input select mc-select-trigger"
      :class="{ 'is-error': error, 'is-disabled': disabled, 'is-focus': open && !error, sm: size === 'sm' }"
      :disabled="disabled"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="open ? `${id}-list` : undefined"
      :aria-labelledby="label ? `${id}-label ${id}-trigger` : undefined"
      :aria-label="label ? undefined : ariaLabel"
      :aria-invalid="error ? 'true' : undefined"
      :aria-required="required || undefined"
      :aria-describedby="describedBy"
      @click="open ? closeList() : openList()"
      @keydown="onTriggerKey"
    >
      <template v-if="selected">
        <McDicpBadge v-if="selected.criticity !== undefined" v-bind="dicp(selected.criticity)" />
        <span class="val">
          <McStatusChip v-if="selected.status" :status="selected.status" size="sm">{{ selected.label }}</McStatusChip>
          <template v-else>{{ selected.label }}</template>
        </span>
      </template>
      <span v-else class="val ph">{{ placeholder }}</span>
      <McIcon name="chevron-down" class="mc-select-chev" />
    </button>

    <div v-if="open" class="mc-pop mc-select-pop" @keydown="onListKey">
      <div v-if="hasSearch" class="mc-input search sm mc-select-search">
        <McIcon name="search" size="sm" />
        <input
          ref="searchInput"
          v-model="query"
          type="text"
          role="combobox"
          aria-autocomplete="list"
          :aria-expanded="true"
          :aria-controls="`${id}-list`"
          :aria-activedescendant="activeId"
          aria-label="Filtrer les valeurs"
          placeholder="Filtrer les valeurs"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <ul
        :id="`${id}-list`"
        ref="list"
        class="mc-select-list"
        role="listbox"
        :tabindex="hasSearch ? undefined : -1"
        :aria-labelledby="label ? `${id}-label` : undefined"
        :aria-label="label ? undefined : ariaLabel"
        :aria-activedescendant="hasSearch ? undefined : activeId"
      >
        <li
          v-for="(row, i) in rows"
          :id="optionId(i)"
          :key="String(row.value)"
          role="option"
          class="mc-select-option"
          :class="{ 'is-active': i === active, 'is-on': isSelected(row), 'is-disabled': row.disabled, 'is-empty': row.value === EMPTY }"
          :aria-selected="isSelected(row)"
          :aria-disabled="row.disabled || undefined"
          @pointerenter="!row.disabled && (active = i)"
          @click="choose(row)"
        >
          <McDicpBadge v-if="row.criticity !== undefined" v-bind="dicp(row.criticity)" />
          <span class="grow">
            <McStatusChip v-if="row.status" :status="row.status" size="sm">{{ row.label }}</McStatusChip>
            <template v-else>{{ row.label }}</template>
          </span>
          <McIcon v-if="isSelected(row)" name="check" class="mc-select-check" />
        </li>
        <li v-if="!rows.length" class="mc-select-none" role="presentation">Aucune valeur ne correspond à « {{ query }} ».</li>
      </ul>
    </div>
    </div>

    <span v-if="error" :id="`${id}-err`" class="mc-field-error" role="alert"><McIcon name="alert-octagon" size="sm" />{{ error }}</span>
    <span v-else-if="help" :id="`${id}-help`" class="mc-field-help">{{ help }}</span>
  </div>
</template>

<style>
.mc-select-anchor { position: relative; }
.mc-select-trigger { width: 100%; text-align: left; box-sizing: border-box; }
.mc-select-trigger:focus-visible { outline: 0; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft); }
.mc-select-trigger.is-error:focus-visible { border-color: var(--status-critical); box-shadow: 0 0 0 3px var(--status-critical-soft); }
.mc-select-trigger[disabled] { cursor: not-allowed; }
.mc-select-trigger .val { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: flex; align-items: center; }
.mc-select-trigger .mc-select-chev { margin-left: auto; transition: transform var(--dur-fast, .12s); }
.mc-select.is-open .mc-select-chev { transform: rotate(180deg); }
.mc-select-pop { position: absolute; z-index: 30; top: calc(100% + 4px); left: 0; min-width: 100%; box-sizing: border-box; padding: 6px; display: grid; gap: 6px; }
.mc-select-search { height: 28px; }
.mc-select-list { list-style: none; margin: 0; padding: 0; max-height: 264px; overflow-y: auto; outline: 0; display: grid; gap: 1px; }
.mc-select-option { display: flex; align-items: center; gap: 10px; min-height: 32px; padding: 0 8px; border-radius: var(--radius-sm); color: var(--ink); font-size: 14px; cursor: pointer; }
.mc-select-option .grow { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-select-option.is-active { background: var(--surface-sunken); }
.mc-select-option.is-on .grow { font-weight: 600; }
.mc-select-option.is-empty .grow { color: var(--ink-subtle); }
.mc-select-option.is-disabled { opacity: .45; cursor: not-allowed; }
.mc-select-check { color: var(--accent); }
.mc-select-none { padding: 8px; font-size: 13px; color: var(--ink-subtle); }
</style>
