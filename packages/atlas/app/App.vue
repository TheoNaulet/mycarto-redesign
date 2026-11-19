<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'

// Thème : clair par défaut (quel que soit le système). Alt+T bascule en sombre si besoin.
const root = document.documentElement
const media = window.matchMedia('(prefers-color-scheme: dark)')
const apply = () => root.setAttribute('data-theme', localStorage.getItem('mc-theme-v2') ?? 'light')
function onKey(e: KeyboardEvent) {
  if (e.altKey && e.code === 'KeyT') {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    try { localStorage.setItem('mc-theme-v2', next) } catch { /* stockage indisponible */ }
    apply()
  }
}
onMounted(() => {
  try { apply() } catch { root.setAttribute('data-theme', 'light') }
  media.addEventListener('change', apply)
  document.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  media.removeEventListener('change', apply)
  document.removeEventListener('keydown', onKey)
})
</script>

<template>
  <RouterView />
</template>
