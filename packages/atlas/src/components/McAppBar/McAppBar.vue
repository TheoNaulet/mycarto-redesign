<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McMapTrail, { type TrailStep } from '../McMapTrail/McMapTrail.vue'

const props = withDefaults(
  defineProps<{
    /** Chemin parcouru de carte en carte, rendu par `McMapTrail`. Remplaçable par le slot `location`. */
    trail?: TrailStep[]
    /** À la place du fil : un titre et un sous-titre (écrans hors carte, ex. « Explorateur » / « 65 applications »). */
    meta?: { title: string; subtitle?: string }
    /** Image du logo (thème clair). */
    logoSrc?: string
    /** Image du logo en thème sombre (version blanche). */
    logoDarkSrc?: string
    /** Adresse de l'accueil, au clic sur le logo. */
    homeHref?: string
    /** Libellé du déclencheur de recherche. */
    searchLabel?: string
    /** Raccourci affiché et écouté (⌘K ou Ctrl+K) pour ouvrir la recherche. */
    searchShortcut?: string
    /** Écoute ⌘K / Ctrl+K sur la page et émet `search`. */
    listenShortcut?: boolean
    /** Masque le déclencheur de recherche (écran étroit, mode présentation). */
    hideSearch?: boolean
    /** Étapes visibles au plus dans le fil avant repli. */
    trailMax?: number
  }>(),
  {
    trail: undefined,
    meta: undefined,
    logoSrc: '/brand/logo-mycarto.svg',
    logoDarkSrc: '/brand/logo-mycarto-blanc.svg',
    homeHref: '#',
    searchLabel: 'Rechercher',
    searchShortcut: '⌘K',
    listenShortcut: true,
    hideSearch: false,
    trailMax: 4,
  },
)

const emit = defineEmits<{
  /** Ouvrir la palette de commandes (clic ou ⌘K). */
  search: []
  /** Clic sur le logo. */
  home: [event: MouseEvent]
  /** Clic sur une étape du fil. */
  navigate: [step: TrailStep, index: number]
}>()

function onKey(e: KeyboardEvent) {
  if (!props.listenShortcut || props.hideSearch) return
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    emit('search')
  }
}
onMounted(() => document.addEventListener('keydown', onKey))
onBeforeUnmount(() => document.removeEventListener('keydown', onKey))
</script>

<template>
  <header class="mc-float mc-appbar">
    <a class="brand" :href="homeHref" @click="emit('home', $event)">
      <img class="mc-logo-light" :src="logoSrc" alt="myCarto, accueil" />
      <img class="mc-logo-dark" :src="logoDarkSrc" alt="myCarto, accueil" />
    </a>
    <span class="mc-sep" aria-hidden="true" />
    <slot name="location">
      <McMapTrail v-if="trail?.length" :steps="trail" :max="trailMax" @navigate="(s, i) => emit('navigate', s, i)" />
      <div v-else-if="meta" class="meta">
        <b>{{ meta.title }}</b>
        <span v-if="meta.subtitle">{{ meta.subtitle }}</span>
      </div>
    </slot>
    <span class="spacer" />
    <button
      v-if="!hideSearch"
      type="button"
      class="mc-cmdk"
      aria-haspopup="dialog"
      :aria-keyshortcuts="listenShortcut ? 'Meta+K Control+K' : undefined"
      @click="emit('search')"
    >
      <McIcon name="search" />
      <span class="grow">{{ searchLabel }}</span>
      <span class="mc-kbd" aria-hidden="true">{{ searchShortcut }}</span>
    </button>
    <slot name="actions" />
  </header>
</template>

<style>
.mc-appbar .brand .mc-logo-dark { display: none; }
[data-theme="dark"] .mc-appbar .brand .mc-logo-light { display: none; }
[data-theme="dark"] .mc-appbar .brand .mc-logo-dark { display: block; }
.mc-appbar { box-sizing: border-box; min-width: 0; }
.mc-appbar > .mc-trail-host { min-width: 0; flex: 0 1 auto; }
.mc-appbar button.mc-cmdk { border: 0; font-family: var(--font-sans); text-align: left; flex: none; }
.mc-appbar button.mc-cmdk:hover { color: var(--ink-muted); background: color-mix(in srgb, var(--surface-sunken) 80%, var(--line)); }
.mc-appbar > .mc-avatars, .mc-appbar > .mc-btn { flex: none; }
</style>
