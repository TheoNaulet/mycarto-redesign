<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { HomeSearchSuggestion } from './types'

const props = withDefaults(
  defineProps<{
    /** Texte du bouton : des exemples de ce qu'on peut chercher. */
    placeholder?: string
    /** Raccourci affiché à droite. */
    shortcut?: string
    /** Écoute ⌘K / Ctrl+K sur la page et émet `search`. À désactiver si la barre d'application le fait déjà. */
    hotkey?: boolean
    /** Puces sous le champ : objets récents ou fréquents. */
    suggestions?: HomeSearchSuggestion[]
    /** Titre lu de la liste des suggestions. */
    suggestionsLabel?: string
  }>(),
  {
    placeholder: 'Une application, un flux, une machine, une carte…',
    shortcut: '⌘K',
    hotkey: true,
    suggestions: () => [],
    suggestionsLabel: 'Consultés récemment',
  },
)

const emit = defineEmits<{
  /** Ouvrir la palette de recherche (clic ou raccourci). */
  search: []
  /** Choix d'une suggestion. */
  pick: [suggestion: HomeSearchSuggestion, event: MouseEvent]
}>()

const onKey = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('search')
  }
}
onMounted(() => props.hotkey && window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="mc-hsearch">
    <button type="button" class="mc-hsearch-btn" aria-haspopup="dialog" :aria-keyshortcuts="hotkey ? 'Meta+K Control+K' : undefined" @click="emit('search')">
      <McIcon name="search" size="lg" />
      <span class="grow">{{ placeholder }}</span>
      <span v-if="shortcut" class="mc-kbd" aria-hidden="true">{{ shortcut }}</span>
      <span class="mc-sr">Rechercher</span>
    </button>
    <ul v-if="suggestions.length" class="mc-hsugg" :aria-label="suggestionsLabel">
      <li v-for="s in suggestions" :key="s.label + s.layer">
        <component
          :is="s.href ? 'a' : 'button'"
          :href="s.href"
          :type="s.href ? undefined : 'button'"
          class="mc-hsugg-chip"
          :class="`l-${s.layer}`"
          @click="emit('pick', s, $event)"
        >
          <span class="d"><McIcon :name="s.icon" /></span>{{ s.label }}
        </component>
      </li>
    </ul>
  </div>
</template>

<style>
.mc-hsearch { display: grid; gap: 10px; flex: 1 1 420px; max-width: 620px; min-width: 0; }
.mc-hsearch-btn { display: flex; align-items: center; gap: 12px; height: 52px; box-sizing: border-box; padding: 0 8px 0 18px; border-radius: 14px; background: var(--surface); border: 1px solid var(--line); box-shadow: var(--shadow-float); color: var(--ink-subtle); font: 400 15px/20px var(--font-sans); text-align: left; cursor: text; transition: border-color .12s, box-shadow .12s; }
.mc-hsearch-btn:hover { border-color: var(--line-strong); }
.mc-hsearch-btn:focus-visible { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft), var(--shadow-float); }
.mc-hsearch-btn .grow { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mc-hsearch-btn .mc-kbd { margin-right: 6px; }
.mc-hsugg { display: flex; gap: 6px; flex-wrap: wrap; margin: 0; padding: 0; list-style: none; }
.mc-hsugg-chip { display: inline-flex; align-items: center; gap: 6px; height: 26px; box-sizing: border-box; padding: 0 10px 0 4px; border-radius: var(--radius-pill); background: var(--surface); border: 1px solid var(--line); color: var(--ink); text-decoration: none; font: 400 12px/16px var(--font-sans); cursor: pointer; transition: border-color .12s, background-color .12s; }
.mc-hsugg-chip:hover { border-color: color-mix(in srgb, var(--lc) 50%, var(--line)); background: color-mix(in srgb, var(--ls) 40%, var(--surface)); }
.mc-hsugg-chip .d { width: 16px; height: 16px; border-radius: 50%; background: var(--ls); color: var(--lc); display: inline-flex; align-items: center; justify-content: center; }
.mc-hsugg-chip .d .mc-ico { width: 10px; height: 10px; }
</style>
