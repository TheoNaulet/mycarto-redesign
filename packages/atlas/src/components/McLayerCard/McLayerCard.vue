<script setup lang="ts">
import { useId } from 'vue'
import type { Layer } from '../../utils/types'
import McSkeleton from '../McSkeleton/McSkeleton.vue'
import McObjectTile from './McObjectTile.vue'
import type { ObjectTileItem } from './types'

withDefaults(
  defineProps<{
    /** Numéro de la couche, 1 (métier) à 4 (technique). */
    n: number
    /** Couche : fond adouci, liseré, rond du numéro et pictogrammes des tuiles. */
    layer: Layer
    /** Nom de la couche : « Couche applicative ». */
    name: string
    /** Résumé à droite de l'en-tête : « 65 applications · 142 flux ». */
    summary?: string
    /** Tuiles des types d'objets. Ou le slot par défaut, avec des `McObjectTile`. */
    tiles?: ObjectTileItem[]
    /** Niveau de titre du nom de couche. */
    headingLevel?: 2 | 3 | 4
    /** Chiffres en cours de chargement : tuiles squelettes. */
    loading?: boolean
    /** Nombre de tuiles squelettes. */
    loadingTiles?: number
  }>(),
  { summary: undefined, tiles: () => [], headingLevel: 2, loading: false, loadingTiles: 4 },
)

const emit = defineEmits<{ /** Ouverture d'une tuile. */ open: [tile: ObjectTileItem, event: MouseEvent] }>()
defineSlots<{ /** Tuiles libres, à la place de `tiles`. */ default?: () => unknown }>()

const id = useId()
</script>

<template>
  <section class="mc-layer mc-lcard" :class="`l-${layer}`" :aria-labelledby="id" :aria-busy="loading || undefined">
    <div class="lh">
      <span class="n" aria-hidden="true">{{ n }}</span>
      <component :is="`h${headingLevel}`" :id="id" class="ttl"><b>{{ name }}</b></component>
      <span v-if="summary && !loading" class="mc-cap">{{ summary }}</span>
    </div>
    <ul class="tiles">
      <template v-if="loading">
        <li v-for="i in loadingTiles" :key="i">
          <McSkeleton shape="block" :width="112" :height="104" :label="i === 1 ? 'Chargement des types' : ''" />
        </li>
      </template>
      <slot v-else>
        <li v-for="t in tiles" :key="t.label">
          <McObjectTile v-bind="t" @open="emit('open', t, $event)" />
        </li>
      </slot>
    </ul>
  </section>
</template>

<style>
.mc-lcard .lh .ttl { margin: 0; font: inherit; }
.mc-lcard .tiles { margin: 0; padding: 0; list-style: none; }
.mc-lcard .tiles > li { display: flex; }
.mc-lcard .tiles .mc-skeleton { width: auto; }
</style>
