<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import McTreeItem from './McTreeItem.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

/** Un nœud de l'arbre. */
export interface TreeNode {
  /** Identifiant unique dans l'arbre. */
  id: string
  /** Libellé : « Couche applicative », « Application »… */
  label: string
  /** Couche : point de couleur (premier niveau de l'explorateur). */
  layer?: Layer
  /** Pictogramme à la place du point. */
  icon?: IconName
  /** Nombre d'occurrences, à droite. */
  count?: number
  /** Enfants. */
  children?: TreeNode[]
}

const props = withDefaults(
  defineProps<{
    /** Nœuds racines. */
    nodes: TreeNode[]
    /** Les racines qui ont des enfants s'affichent en groupe (libellé atténué, gras). */
    groupRoots?: boolean
    /** Nom de l'arbre pour les lecteurs d'écran. */
    ariaLabel?: string
  }>(),
  { groupRoots: true, ariaLabel: 'Types d’objets' },
)

/** Identifiant du nœud sélectionné. */
const selected = defineModel<string | null>({ default: null })
/** Identifiants des nœuds dépliés. */
const expanded = defineModel<string[]>('expanded', { default: () => [] })

const emit = defineEmits<{
  /** Un nœud est choisi (clic, Entrée ou Espace). */
  select: [node: TreeNode]
}>()

const root = ref<HTMLElement | null>(null)
const focusId = ref<string | null>(null)

interface Row {
  node: TreeNode
  level: number
  parent: string | null
  pos: number
  size: number
}
const rows = computed<Row[]>(() => {
  const out: Row[] = []
  const walk = (list: TreeNode[], level: number, parent: string | null) =>
    list.forEach((node, i) => {
      out.push({ node, level, parent, pos: i + 1, size: list.length })
      if (node.children?.length && expanded.value.includes(node.id)) walk(node.children, level + 1, node.id)
    })
  walk(props.nodes, 0, null)
  return out
})
const tabbable = computed(() => {
  const ids = rows.value.map((r) => r.node.id)
  if (focusId.value && ids.includes(focusId.value)) return focusId.value
  if (selected.value && ids.includes(selected.value)) return selected.value
  return ids[0]
})

const isOpen = (id: string) => expanded.value.includes(id)
function setOpen(id: string, open: boolean) {
  if (open === isOpen(id)) return
  expanded.value = open ? [...expanded.value, id] : expanded.value.filter((x) => x !== id)
}
function choose(node: TreeNode) {
  selected.value = node.id
  focusId.value = node.id
  emit('select', node)
}
async function focus(id: string) {
  focusId.value = id
  await nextTick()
  root.value?.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`)?.focus()
}

function onKey(e: KeyboardEvent) {
  const list = rows.value
  const cur = list.findIndex((r) => r.node.id === tabbable.value)
  if (cur < 0) return
  const row = list[cur]
  const hasKids = !!row.node.children?.length
  let handled = true
  switch (e.key) {
    case 'ArrowDown':
      if (cur < list.length - 1) focus(list[cur + 1].node.id)
      break
    case 'ArrowUp':
      if (cur > 0) focus(list[cur - 1].node.id)
      break
    case 'ArrowRight':
      if (hasKids && !isOpen(row.node.id)) setOpen(row.node.id, true)
      else if (hasKids) focus(row.node.children![0].id)
      break
    case 'ArrowLeft':
      if (hasKids && isOpen(row.node.id)) setOpen(row.node.id, false)
      else if (row.parent) focus(row.parent)
      break
    case 'Home':
      focus(list[0].node.id)
      break
    case 'End':
      focus(list[list.length - 1].node.id)
      break
    case 'Enter':
    case ' ':
      choose(row.node)
      break
    default:
      handled = false
  }
  if (handled) e.preventDefault()
}
</script>

<template>
  <div ref="root" class="mc-tree" role="tree" :aria-label="ariaLabel" @keydown="onKey">
    <McTreeItem
      v-for="r in rows"
      :key="r.node.id"
      :data-id="r.node.id"
      :label="r.node.label"
      :level="r.level"
      :layer="r.node.layer"
      :icon="r.node.icon"
      :count="r.node.count"
      :expandable="!!r.node.children?.length"
      :expanded="isOpen(r.node.id)"
      :selected="selected === r.node.id"
      :group="groupRoots && r.level === 0 && !!r.node.children?.length"
      :focusable="tabbable === r.node.id"
      :posinset="r.pos"
      :setsize="r.size"
      @select="choose(r.node)"
      @toggle="setOpen(r.node.id, !isOpen(r.node.id))"
      @focus="focusId = r.node.id"
    >
      <template v-if="$slots.action" #action><slot name="action" :node="r.node" /></template>
    </McTreeItem>
  </div>
</template>

<style>
.mc-tree .it:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.mc-tree .it .tw { cursor: pointer; flex: none; }
.mc-tree .it .ld { flex: none; }
.mc-tree .it .mc-tree-ic { color: var(--lc, var(--ink-subtle)); }
.mc-tree .it .act .mc-ibtn { width: 22px; height: 22px; }
</style>
