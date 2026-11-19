<script setup lang="ts">
// « Exporter » et « Partager » des écrans de carte : le panneau Partager et exporter (lien copié, fichier PNG, PDF ou SVG généré),
// flottant sous la barre du haut, à droite. Clic à côté ou Échap : il se ferme.
import { nextTick, ref, watch } from 'vue'
import SharePanel, { type ExportItem } from '../shared/SharePanel.vue'

const props = withDefaults(
  defineProps<{
    /** Nom de la carte : titre et nom du fichier exporté. */
    title: string
    /** Objets de la carte dessinés dans l'export. */
    items: ExportItem[]
    /** Post-its de la carte. */
    notes?: string[]
    /** Nombre d'objets sélectionnés (les premiers de `items`). */
    selectionCount?: number
  }>(),
  { notes: () => [], selectionCount: 0 },
)

const open = defineModel<boolean>('open', { default: false })
const wrap = ref<HTMLElement>()

watch(open, async (o) => {
  if (!o) return
  await nextTick()
  wrap.value?.querySelector<HTMLElement>('button, input')?.focus()
})
</script>

<template>
  <div v-if="open" class="mc-map-share" @pointerdown.self="open = false" @wheel.stop>
    <div ref="wrap" class="mc-map-share-panel">
      <SharePanel :title="props.title" :items="props.items" :notes="props.notes" :selection-count="props.selectionCount" closable @close="open = false" />
    </div>
  </div>
</template>

<style>
.mc-map-share { position: absolute; inset: 0; z-index: 60; }
.mc-map-share-panel { position: absolute; top: 72px; right: 16px; }
.mc-map-share-panel .mc-scr-sh { max-height: calc(100vh - 96px); }
</style>
