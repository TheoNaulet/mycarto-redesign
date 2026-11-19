<script setup lang="ts">
// Recherche ⌘K commune aux écrans de carte : les mêmes résultats que l'accueil, ouverts au même endroit.
import McCommandPalette, { type PaletteItem } from '../../components/McCommandPalette/McCommandPalette.vue'
import { openPaletteItem, paletteItems } from './nav'

const open = defineModel<boolean>('open', { default: false })

function onSelect(item: PaletteItem) {
  openPaletteItem(item)
}
</script>

<template>
  <McCommandPalette v-model:open="open" :items="paletteItems" @select="onSelect" />
</template>
