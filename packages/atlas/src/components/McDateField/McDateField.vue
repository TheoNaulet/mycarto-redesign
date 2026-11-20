<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    label?: string
    /** Message d'aide sous le champ. */
    help?: string
    /** Erreur imposée par le formulaire ; sinon le champ signale lui-même une date mal formée. */
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Marque le champ comme modifié (point bleu après le libellé). */
    modified?: boolean
    size?: 'sm' | 'md'
    ariaLabel?: string
  }>(),
  { size: 'md' },
)

/** Valeur au format JJ/MM/AAAA, chaîne vide si non renseignée. */
const model = defineModel<string>({ default: '' })
const id = useId()
const native = ref<HTMLInputElement>()
const touched = ref(false)

/** « 14/03/2021 » → Date, ou null si la date n'existe pas. */
function parse(v: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(v)
  if (!m) return null
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]))
  return d.getDate() === Number(m[1]) && d.getMonth() === Number(m[2]) - 1 ? d : null
}

const iso = computed(() => {
  const d = parse(model.value)
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})

const ownError = computed(() =>
  touched.value && model.value && !parse(model.value) ? 'Date invalide : utilisez le format JJ/MM/AAAA.' : undefined,
)
const shownError = computed(() => props.error ?? ownError.value)
const describedBy = computed(() => (shownError.value ? `${id}-err` : props.help ? `${id}-help` : undefined))

/** Ajoute les barres obliques au fil de la frappe : « 14032021 » → « 14/03/2021 ». */
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const typedSlash = (e as InputEvent).data === '/'
  const digits = el.value.replace(/\D/g, '').slice(0, 8)
  let out = digits.slice(0, 2)
  if (digits.length > 2 || (typedSlash && digits.length === 2)) out += '/' + digits.slice(2, 4)
  if (digits.length > 4 || (typedSlash && digits.length === 4)) out += '/' + digits.slice(4)
  if ((e as InputEvent).inputType?.startsWith('delete')) out = el.value
  model.value = out
  el.value = out
}

function openPicker() {
  const el = native.value
  if (!el || props.disabled || props.readonly) return
  try {
    el.showPicker()
  } catch {
    el.focus()
    el.click()
  }
}

function onPick(e: Event) {
  const v = (e.target as HTMLInputElement).value
  if (!v) return
  const [y, m, d] = v.split('-')
  model.value = `${d}/${m}/${y}`
  touched.value = true
}
</script>

<template>
  <div class="mc-field" :class="{ 'is-modified': modified }">
    <label v-if="label" class="mc-field-label" :for="id">
      {{ label }}<span v-if="required" class="mc-req" aria-hidden="true">*</span>
    </label>
    <div
      class="mc-input mc-date"
      :class="{ 'is-error': shownError, 'is-disabled': disabled, 'is-readonly': readonly, sm: size === 'sm' }"
    >
      <input
        :id="id"
        :value="model"
        type="text"
        inputmode="numeric"
        autocomplete="off"
        maxlength="10"
        placeholder="JJ/MM/AAAA"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="shownError ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-label="label ? undefined : ariaLabel"
        @input="onInput"
        @blur="touched = true"
      />
      <button
        v-if="!disabled && !readonly"
        type="button"
        class="mc-date-btn"
        :aria-label="label ? `Choisir la date : ${label}` : 'Choisir une date'"
        title="Ouvrir le calendrier"
        @click="openPicker"
      >
        <McIcon name="calendar" />
      </button>
      <McIcon v-else name="calendar" />
      <input ref="native" class="mc-date-native" type="date" :value="iso" tabindex="-1" aria-hidden="true" @change="onPick" />
    </div>
    <span v-if="shownError" :id="`${id}-err`" class="mc-field-error" role="alert"><McIcon name="alert-octagon" size="sm" />{{ shownError }}</span>
    <span v-else-if="help" :id="`${id}-help`" class="mc-field-help">{{ help }}</span>
  </div>
</template>

<style>
.mc-date { position: relative; }
.mc-date-btn { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; margin-right: -6px; padding: 0; border: 0; border-radius: var(--radius-xs); background: transparent; color: var(--ink-subtle); cursor: pointer; flex: none; }
.mc-date-btn:hover { background: var(--surface-sunken); color: var(--ink); }
.mc-date-btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-date-btn .mc-ico { color: inherit; }
/* Champ natif invisible, ancré sous le bouton : il ne sert qu'à ouvrir le calendrier du navigateur. */
.mc-date .mc-date-native { position: absolute; right: 0; bottom: 0; width: 1px; height: 1px; padding: 0; border: 0; opacity: 0; pointer-events: none; }
</style>
