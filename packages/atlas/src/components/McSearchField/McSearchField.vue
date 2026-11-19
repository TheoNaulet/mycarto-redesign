<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** Ce qu'on cherche et où : « Rechercher dans la carte ». Sert aussi de nom accessible. */
    placeholder?: string
    /** Touche qui place le curseur dans le champ, affichée à droite quand il est vide : « F ». Vide = pas de raccourci. */
    shortcut?: string
    /** Résultat de la recherche, affiché à droite pendant la saisie : « 2 sur 7 », « Aucun résultat ». */
    count?: string
    /** Nom accessible, si différent du placeholder. */
    ariaLabel?: string
    /** sm 28px, md 32px. */
    size?: 'sm' | 'md'
    /** Champ inactif. */
    disabled?: boolean
  }>(),
  { placeholder: 'Rechercher', shortcut: undefined, count: undefined, ariaLabel: undefined, size: 'md', disabled: false },
)

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{
  /** Entrée : lancer la recherche ou aller au résultat suivant. */
  submit: [value: string]
  /** Entrée : passer au résultat suivant. */
  next: []
  /** Maj + Entrée : revenir au résultat précédent. */
  previous: []
  /** Croix ou Échap : la saisie est effacée. */
  clear: []
}>()

const id = useId()
const input = ref<HTMLInputElement>()
const filled = computed(() => model.value.length > 0)

function clear() {
  model.value = ''
  emit('clear')
  input.value?.focus()
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    if (e.shiftKey) emit('previous')
    else {
      emit('submit', model.value)
      emit('next')
    }
  } else if (e.key === 'Escape' && filled.value) {
    e.preventDefault()
    clear()
  }
}

/** Raccourci global : la touche place le curseur dans le champ, sauf si l'on écrit déjà ailleurs. */
function onGlobalKey(e: KeyboardEvent) {
  if (!props.shortcut || props.disabled || e.metaKey || e.ctrlKey || e.altKey) return
  if (e.key.toLowerCase() !== props.shortcut.toLowerCase()) return
  const t = e.target as HTMLElement | null
  if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return
  e.preventDefault()
  input.value?.focus()
}
onMounted(() => window.addEventListener('keydown', onGlobalKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onGlobalKey))

defineExpose({ focus: () => input.value?.focus() })
</script>

<template>
  <div class="mc-input search" :class="{ sm: size === 'sm', 'is-disabled': disabled }" role="search">
    <McIcon name="search" />
    <input
      :id="id"
      ref="input"
      v-model="model"
      type="search"
      :placeholder="placeholder"
      :disabled="disabled"
      :aria-label="ariaLabel ?? placeholder"
      :aria-describedby="filled && count ? `${id}-count` : undefined"
      :aria-keyshortcuts="shortcut"
      autocomplete="off"
      spellcheck="false"
      @keydown="onKey"
    />
    <span v-if="filled && count" :id="`${id}-count`" class="mc-cap" aria-live="polite">{{ count }}</span>
    <button v-if="filled && !disabled" type="button" class="mc-search-clear" aria-label="Effacer la recherche" title="Effacer (Échap)" @click="clear">
      <McIcon name="x" size="sm" />
    </button>
    <span v-else-if="shortcut && !filled" class="mc-kbd" aria-hidden="true">{{ shortcut }}</span>
  </div>
</template>

<style>
.mc-input.search input::-webkit-search-cancel-button { display: none; }
.mc-search-clear { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; margin-right: -4px; padding: 0; border: 0; border-radius: var(--radius-xs); background: transparent; color: var(--ink-subtle); cursor: pointer; flex: none; }
.mc-search-clear:hover { background: var(--surface-sunken); color: var(--ink); }
.mc-search-clear .mc-ico { color: inherit; }
</style>
