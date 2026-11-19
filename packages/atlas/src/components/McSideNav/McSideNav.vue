<script setup lang="ts">
import { ref, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

/** Un élément du menu. */
export interface SideNavItem {
  /** Libellé métier : « Types d'objets », pas « Méta-modèle ». */
  label: string
  /** Pictogramme, seul visible en rail. */
  icon: IconName
  /** Adresse de la page. */
  href?: string
  /** Page courante. */
  active?: boolean
  /** Sous-menu : l'élément devient un bouton qui le déplie. */
  children?: Omit<SideNavItem, 'children' | 'icon'>[]
  /** Pastille à droite : nombre de notifications, d'éléments en corbeille… */
  badge?: number | string
  /** alert : pastille rouge (à traiter) ; neutral : simple compteur. */
  badgeTone?: 'neutral' | 'alert'
}

/** Une section titrée du menu. */
export interface SideNavSection {
  /** Titre en surtitre (Données, Modélisation, Administration). Sans titre : éléments de tête. */
  title?: string
  items: SideNavItem[]
}

const props = withDefaults(
  defineProps<{
    /** Sections du menu, dans l'ordre. */
    sections: SideNavSection[]
    /** Nom de la navigation pour les lecteurs d'écran. */
    ariaLabel?: string
  }>(),
  { ariaLabel: 'Administration' },
)

/** Replié en rail d'icônes de 56px ; chaque icône garde son infobulle. */
const collapsed = defineModel<boolean>('collapsed', { default: false })

const emit = defineEmits<{
  /** Clic sur un élément (ou un sous-élément) qui mène à une page. */
  select: [item: SideNavItem | Omit<SideNavItem, 'children' | 'icon'>, event: MouseEvent]
}>()

const open = ref<Record<string, boolean>>({})
const key = (s: number, i: number) => `${s}-${i}`

function initOpen(sections: SideNavSection[]) {
  sections.forEach((sec, s) =>
    sec.items.forEach((it, i) => {
      if (it.children?.some((c) => c.active) && open.value[key(s, i)] === undefined) open.value[key(s, i)] = true
    }),
  )
}

watch(() => props.sections, initOpen, { immediate: true, deep: true })

function toggle(s: number, i: number) {
  open.value[key(s, i)] = !open.value[key(s, i)]
}
function go(e: MouseEvent, item: SideNavItem | Omit<SideNavItem, 'children' | 'icon'>) {
  if (!item.href) e.preventDefault()
  emit('select', item, e)
}
</script>

<template>
  <nav class="mc-side" :class="{ rail: collapsed }" :aria-label="ariaLabel">
    <slot name="header" />
    <div
      v-for="(sec, s) in sections"
      :key="s"
      class="mc-side-sec"
      role="group"
      :aria-label="sec.title"
    >
      <div v-if="sec.title && !collapsed" class="sec mc-over" aria-hidden="true">{{ sec.title }}</div>
      <span v-else-if="sec.title && collapsed" class="mc-side-rule" aria-hidden="true" />
      <template v-for="(it, i) in sec.items" :key="i">
        <button
          v-if="it.children?.length && !collapsed"
          type="button"
          class="mc-side-tog"
          :class="{ 'is-on': it.active }"
          :aria-expanded="!!open[key(s, i)]"
          @click="toggle(s, i)"
        >
          <McIcon :name="it.icon" />{{ it.label }}
          <span class="end"><McIcon :name="open[key(s, i)] ? 'chevron-down' : 'chevron-right'" size="sm" /></span>
        </button>
        <a
          v-else
          :href="it.href ?? '#'"
          :class="{ 'is-on': it.active || (collapsed && it.children?.some((c) => c.active)) }"
          :aria-current="it.active ? 'page' : undefined"
          :title="collapsed ? it.label : undefined"
          :aria-label="collapsed ? it.label + (it.badge !== undefined ? ` (${it.badge})` : '') : undefined"
          @click="go($event, it)"
        >
          <McIcon :name="it.icon" />
          <template v-if="!collapsed">{{ it.label }}</template>
          <span v-if="it.badge !== undefined && !collapsed" class="end">
            <span class="mc-count" :class="{ alert: it.badgeTone !== 'neutral' }">{{ it.badge }}</span>
          </span>
          <span v-else-if="it.badge !== undefined" class="mc-dot-badge mc-side-dot" aria-hidden="true" />
        </a>
        <template v-if="it.children?.length && !collapsed && open[key(s, i)]">
          <a
            v-for="(c, j) in it.children"
            :key="j"
            class="mc-side-sub"
            :href="c.href ?? '#'"
            :class="{ 'is-on': c.active }"
            :aria-current="c.active ? 'page' : undefined"
            @click="go($event, c)"
          >
            {{ c.label }}
            <span v-if="c.badge !== undefined" class="end"><span class="mc-count" :class="{ alert: c.badgeTone === 'alert' }">{{ c.badge }}</span></span>
          </a>
        </template>
      </template>
    </div>
    <span class="mc-side-spacer" />
    <slot name="footer" :collapsed="collapsed" />
  </nav>
</template>

<style>
.mc-side { height: 100%; }
.mc-side-sec { display: flex; flex-direction: column; gap: 2px; width: 100%; }
.mc-side.rail .mc-side-sec { align-items: center; }
.mc-side-spacer { flex: 1; }
.mc-side-rule { display: block; width: 24px; height: 1px; margin: 8px auto; background: var(--line); }
.mc-side a { position: relative; }
.mc-side .mc-side-tog { display: flex; align-items: center; gap: 10px; width: 100%; height: 32px; padding: 0 10px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink-muted); font: 400 14px/20px var(--font-sans); text-align: left; cursor: pointer; }
.mc-side .mc-side-tog:hover { background: var(--surface-sunken); color: var(--ink); }
.mc-side .mc-side-tog .end { margin-left: auto; display: inline-flex; color: var(--ink-subtle); }
.mc-side .mc-side-tog.is-on .mc-ico:first-child { color: var(--accent); }
.mc-side a.mc-side-sub { padding-left: 36px; font-size: 13px; height: 30px; }
.mc-side .mc-side-dot { position: absolute; top: 5px; right: 7px; }
</style>
