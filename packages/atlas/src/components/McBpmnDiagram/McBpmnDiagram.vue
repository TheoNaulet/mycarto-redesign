<script setup lang="ts">
import { computed, useId } from 'vue'
import { uniquePrefix } from '../McEdge/edge'
import { BPMN_SIZE, routeBpmn, wrapLabel, type McBpmnModel, type McBpmnNode, type Placed } from './bpmn'

const props = withDefaults(
  defineProps<{
    /** Le diagramme : couloirs, éléments (centre x, y depuis le haut du couloir) et liens. */
    model: McBpmnModel
    /** Nom du processus, lu par les lecteurs d'écran : « Achat de fournitures ». */
    title?: string
    /** Largeur du diagramme, en unités du dessin. */
    width?: number
    /** Hauteur d'un couloir, en unités du dessin. */
    laneHeight?: number
  }>(),
  { title: 'Diagramme BPMN', width: 1080, laneHeight: 240 },
)

const emit = defineEmits<{
  /** Clic ou Entrée sur un magasin de données : l'identifiant de l'application. */
  select: [id: string]
}>()

const arrowId = `${uniquePrefix('mc-bpmn', useId())}-a`
const height = computed(() => props.model.lanes.length * props.laneHeight)
const laneTop = computed(() => new Map(props.model.lanes.map((l, i) => [l.id, i * props.laneHeight])))

const placed = computed(() => {
  const m = new Map<string, Placed & { node: McBpmnNode }>()
  for (const n of props.model.nodes) {
    const top = laneTop.value.get(n.lane) ?? 0
    m.set(n.id, { node: n, cx: n.x, cy: top + n.y, ...BPMN_SIZE[n.kind] })
  }
  return m
})

const flows = computed(() =>
  props.model.flows.flatMap((f, i) => {
    const s = placed.value.get(f.from)
    const t = placed.value.get(f.to)
    if (!s || !t) return []
    return [{ key: `${f.from}-${f.to}-${i}`, flow: f, ...routeBpmn(s, t, f.kind === 'sequence') }]
  }),
)

const shapes = computed(() => [...placed.value.values()])
const tasks = computed(() => props.model.nodes.filter((n) => n.kind === 'task').length)
const stores = computed(() => props.model.nodes.filter((n) => n.kind === 'store').length)
</script>

<template>
  <svg
    class="mc-bpmn mc-bpmn-diagram"
    :viewBox="`0 0 ${width} ${height}`"
    :style="{ maxWidth: width + 'px' }"
    role="group"
    :aria-label="`${title} : ${model.lanes.length} couloirs, ${tasks} tâches, ${stores} applications`"
  >
    <defs>
      <marker :id="arrowId" viewBox="0 0 24 24" refX="7" refY="12" markerWidth="12" markerHeight="12" markerUnits="userSpaceOnUse" orient="auto">
        <path d="M7 6.5 L18 12 L7 17.5 Z" class="ah mc-bpmn-ah" />
      </marker>
    </defs>

    <g v-for="(lane, i) in model.lanes" :key="lane.id">
      <rect class="lane" :class="{ alt: i % 2 === 1 }" x="0" :y="i * laneHeight" :width="width" :height="laneHeight" />
      <rect class="lane-h" x="0" :y="i * laneHeight" width="34" :height="laneHeight" />
      <text class="h" text-anchor="middle" :transform="`translate(22 ${i * laneHeight + laneHeight / 2}) rotate(-90)`">
        {{ lane.label.toLocaleUpperCase('fr-FR') }}
      </text>
    </g>

    <g aria-hidden="true">
      <template v-for="f in flows" :key="f.key">
        <path
          :class="f.flow.kind === 'sequence' ? 'seq' : 'assoc'"
          :d="f.d"
          :marker-end="f.flow.kind === 'sequence' ? `url(#${arrowId})` : undefined"
        />
        <text v-if="f.flow.label" :x="f.lx" :y="f.ly">{{ f.flow.label }}</text>
      </template>
    </g>

    <template v-for="p in shapes" :key="p.node.id">
      <g v-if="p.node.kind === 'start' || p.node.kind === 'end'" role="img" :aria-label="`${p.node.kind === 'start' ? 'Début' : 'Fin'} : ${p.node.label}`">
        <circle :class="[p.node.kind, { 'is-selected': p.node.selected }]" :cx="p.cx" :cy="p.cy" r="15" />
        <text :x="p.cx" :y="p.cy + 36" text-anchor="middle">{{ p.node.label }}</text>
      </g>

      <g v-else-if="p.node.kind === 'task'" role="img" :aria-label="`Tâche : ${p.node.label}`">
        <rect class="t" :class="{ 'is-selected': p.node.selected }" :x="p.cx - p.hw" :y="p.cy - p.hh" :width="p.hw * 2" :height="p.hh * 2" rx="8" />
        <text
          v-for="(line, li) in wrapLabel(p.node.label)"
          :key="li"
          :x="p.cx"
          :y="p.cy + (wrapLabel(p.node.label).length === 1 ? 4 : li === 0 ? -3 : 11)"
          text-anchor="middle"
        >{{ line }}</text>
      </g>

      <g v-else-if="p.node.kind === 'gateway'" role="img" :aria-label="`Passerelle exclusive : ${p.node.label}`">
        <path class="gw" :class="{ 'is-selected': p.node.selected }" :d="`M${p.cx} ${p.cy - 28} L${p.cx + 28} ${p.cy} L${p.cx} ${p.cy + 28} L${p.cx - 28} ${p.cy}z`" />
        <path class="gwx" :d="`M${p.cx - 9} ${p.cy - 9} L${p.cx + 9} ${p.cy + 9} M${p.cx + 9} ${p.cy - 9} L${p.cx - 9} ${p.cy + 9}`" />
        <text :x="p.cx" :y="p.cy + 50" text-anchor="middle">{{ p.node.label }}</text>
      </g>

      <g v-else-if="p.node.kind === 'data'" role="img" :aria-label="`Objet de données : ${p.node.label}`">
        <path class="doc" :d="`M${p.cx - 16} ${p.cy - 20} h24 l8 8 v32 h-32z`" />
        <path class="doc" :d="`M${p.cx + 8} ${p.cy - 20} v8 h8`" style="fill: none" />
        <text :x="p.cx" :y="p.cy + 36" text-anchor="middle">{{ p.node.label }}</text>
      </g>

      <g
        v-else
        class="mc-bpmn-store"
        :class="{ 'is-selected': p.node.selected }"
        role="button"
        tabindex="0"
        :aria-pressed="!!p.node.selected"
        :aria-label="`Application ${p.node.label} (magasin de données) : ouvrir l'inspecteur`"
        @click="emit('select', p.node.id)"
        @keydown.enter.prevent="emit('select', p.node.id)"
        @keydown.space.prevent="emit('select', p.node.id)"
      >
        <title>Application {{ p.node.label }}</title>
        <path class="store" :d="`M${p.cx - 28} ${p.cy - 15} a28 7 0 0 1 56 0 v30 a28 7 0 0 1 -56 0z`" />
        <path class="store" :d="`M${p.cx - 28} ${p.cy - 15} a28 7 0 0 0 56 0`" style="fill: none" />
        <text :x="p.cx" :y="p.cy + 37" text-anchor="middle" class="mc-bpmn-store-label">{{ p.node.label }}</text>
      </g>
    </template>
  </svg>
</template>

<style>
.mc-bpmn-diagram { display: block; width: 100%; height: auto; }
.mc-bpmn .mc-bpmn-ah { stroke: var(--ink-muted); stroke-width: 1.5; stroke-linejoin: round; }
.mc-bpmn .t.is-selected, .mc-bpmn .gw.is-selected, .mc-bpmn circle.is-selected { stroke: var(--accent); stroke-width: 2.5; }
.mc-bpmn-store { cursor: pointer; outline: none; }
.mc-bpmn-store .store { transition: stroke var(--dur-fast, .12s), stroke-width var(--dur-fast, .12s); }
.mc-bpmn-store:hover .store, .mc-bpmn-store:focus-visible .store, .mc-bpmn-store.is-selected .store { stroke: var(--accent); stroke-width: 2.25; }
.mc-bpmn-store:focus-visible .mc-bpmn-store-label { text-decoration: underline; }
.mc-bpmn text.mc-bpmn-store-label { font-weight: 600; }
.mc-bpmn-store:hover .mc-bpmn-store-label, .mc-bpmn-store.is-selected .mc-bpmn-store-label { fill: var(--accent); }
</style>
