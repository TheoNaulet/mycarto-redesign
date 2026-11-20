<script setup lang="ts">
// Menu latéral de l'administration, commun à l'explorateur, aux tableaux de bord et aux pages d'administration.
// En pied : le centre de notifications (fenêtre flottante) et le profil.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import McSideNav, { type SideNavItem } from '../../components/McSideNav/McSideNav.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIcon from '../../icons/McIcon.vue'
import { adminSections, logoSvg, navPaths, notifications, readNotifications, type Notification } from './shell'
import { goPath, pathHref, withoutBase } from '../bridge'

const props = defineProps<{ /** Libellé de la page courante. */ active: string }>()

const sections = computed(() => adminSections(props.active))

/** En dessous de 1180px de large, le menu se replie en rail d'icônes pour laisser la place au contenu. */
const RAIL_QUERY = '(max-width: 1179px)'
const rail = ref(typeof window !== 'undefined' && !!window.matchMedia?.(RAIL_QUERY).matches)
let mq: MediaQueryList | undefined
const onMq = (e: MediaQueryListEvent) => (rail.value = e.matches)
onMounted(() => {
  mq = window.matchMedia?.(RAIL_QUERY)
  if (!mq) return
  rail.value = mq.matches
  mq.addEventListener('change', onMq)
})
onBeforeUnmount(() => mq?.removeEventListener('change', onMq))

/** L'adresse ouverte (sans l'éventuel préfixe Storybook) : on ne recharge pas la page où l'on est déjà. */
const currentPath = () => (typeof window !== 'undefined' ? withoutBase(window.location.pathname) + window.location.search : '')

function onSelect(item: SideNavItem | Omit<SideNavItem, 'children' | 'icon'>) {
  const to = navPaths[item.label]
  if (!to || to === currentPath()) return
  goPath(to)
}

/* ---------- Notifications ---------- */
const notifOpen = ref(false)
const notifBtn = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const panelPos = ref({ left: 0, bottom: 0 })
const unread = computed(() => notifications.filter((n) => !readNotifications.has(n.id)).length)

async function toggleNotif() {
  if (notifOpen.value) return (notifOpen.value = false)
  const r = notifBtn.value?.getBoundingClientRect()
  if (r) panelPos.value = { left: Math.round(r.right + 8), bottom: Math.max(12, Math.round(window.innerHeight - r.bottom)) }
  notifOpen.value = true
  await nextTick()
  panel.value?.querySelector<HTMLElement>('button')?.focus()
}
function openNotif(n: Notification) {
  readNotifications.add(n.id)
  notifOpen.value = false
  goPath(n.path)
}
function markAllRead() {
  notifications.forEach((n) => readNotifications.add(n.id))
}
function onDocDown(e: PointerEvent) {
  if (!notifOpen.value) return
  const t = e.target as Node
  if (panel.value?.contains(t) || notifBtn.value?.contains(t)) return
  notifOpen.value = false
}
function onDocKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && notifOpen.value) {
    notifOpen.value = false
    notifBtn.value?.focus()
  }
}
onMounted(() => {
  document.addEventListener('pointerdown', onDocDown, true)
  document.addEventListener('keydown', onDocKey)
})
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocDown, true)
  document.removeEventListener('keydown', onDocKey)
})
const notifLabel = computed(() => (unread.value ? `Notifications (${unread.value} non lue${unread.value > 1 ? 's' : ''})` : 'Notifications'))
</script>

<template>
  <McSideNav v-model:collapsed="rail" :sections="sections" aria-label="Administration" class="mc-scr-side" @select="onSelect">
    <template #header>
      <a href="/" class="mc-scr-logo" aria-label="myCarto, accueil" @click.prevent="goPath('/')" v-html="logoSvg" />
    </template>
    <template #footer="{ collapsed }">
      <a
        ref="notifBtn"
        href="#"
        :title="collapsed ? notifLabel : undefined"
        :aria-label="collapsed ? notifLabel : undefined"
        :aria-expanded="notifOpen"
        aria-haspopup="dialog"
        class="mc-scr-side-notif"
        :class="{ 'is-on': notifOpen }"
        @click.prevent="toggleNotif"
      >
        <McIcon name="bell" /><template v-if="!collapsed">Notifications<span v-if="unread" class="end"><span class="mc-count alert">{{ unread }}</span></span></template>
        <span v-else-if="unread" class="mc-scr-side-dot" aria-hidden="true" />
      </a>
      <a
        :href="pathHref('/utilisateurs')"
        :title="collapsed ? 'Théo Naulet, votre profil' : undefined"
        :aria-label="collapsed ? 'Théo Naulet, votre profil' : undefined"
        @click.prevent="onSelect({ label: 'Utilisateurs' })"
      ><span class="mc-avatar">TN</span><template v-if="!collapsed">Théo Naulet</template></a>
    </template>
  </McSideNav>

  <Teleport to="body">
    <div
      v-if="notifOpen"
      ref="panel"
      class="mc-float mc-scr-notif"
      role="dialog"
      aria-label="Notifications"
      :style="{ left: panelPos.left + 'px', bottom: panelPos.bottom + 'px' }"
    >
      <div class="mc-scr-notif-head">
        <b>Notifications</b>
        <span class="mc-cap">{{ unread ? `${unread} non lue${unread > 1 ? 's' : ''}` : 'Tout est lu' }}</span>
        <span class="mc-scr-notif-grow" />
        <McButton variant="ghost" size="sm" :disabled="!unread" @click="markAllRead">Tout marquer comme lu</McButton>
      </div>
      <ul class="mc-scr-notif-list">
        <li v-for="n in notifications" :key="n.id">
          <button type="button" class="mc-scr-notif-item" :class="{ unread: !readNotifications.has(n.id) }" @click="openNotif(n)">
            <span class="ic" :class="n.tone"><McIcon :name="n.icon" size="sm" /></span>
            <span class="tx"><b>{{ n.title }}</b><span>{{ n.text }}</span></span>
            <span class="when">{{ n.when }}</span>
            <span v-if="!readNotifications.has(n.id)" class="dot" aria-label="non lue" />
          </button>
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<style>
.mc-scr-side { flex: none; height: 100%; }
.mc-side a.mc-scr-logo { height: auto; padding: 4px 10px; margin-bottom: 8px; color: var(--ink); }
.mc-side a.mc-scr-logo:hover { background: transparent; }
.mc-scr-logo svg { display: block; height: 22px; width: auto; }
/* Rail : seul le pictogramme du logo reste visible (les 25 premiers pixels du SVG). */
.mc-side.rail a.mc-scr-logo { width: 40px; padding: 4px 0 4px 8px; justify-content: flex-start; overflow: hidden; box-sizing: border-box; }
.mc-side.rail .mc-scr-logo svg { flex: none; clip-path: inset(0 calc(100% - 25px) 0 0); }
.mc-side.rail .mc-scr-side-notif { position: relative; }
.mc-scr-side-dot { position: absolute; top: 6px; right: 8px; width: 7px; height: 7px; border-radius: 50%; background: var(--status-critical); box-shadow: 0 0 0 2px var(--surface); }

.mc-scr-notif { position: fixed; z-index: 60; width: 400px; max-width: calc(100vw - 24px); max-height: min(520px, calc(100vh - 24px)); overflow: auto; padding: 8px; box-sizing: border-box; display: grid; gap: 4px; color: var(--ink); font-family: var(--font-sans); }
.mc-scr-notif-head { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; padding: 6px 4px 8px 8px; border-bottom: 1px solid var(--line); }
.mc-scr-notif-head b { font: 600 14px/20px var(--font-display); }
.mc-scr-notif-grow { flex: 1; }
.mc-scr-notif-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.mc-scr-notif-item { position: relative; width: 100%; display: grid; grid-template-columns: 30px 1fr auto; gap: 10px; align-items: start; padding: 10px 22px 10px 8px; border: 0; border-radius: var(--radius-sm); background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.mc-scr-notif-item:hover { background: var(--surface-sunken); }
.mc-scr-notif-item:focus-visible { outline: 2px solid var(--focus); outline-offset: -2px; }
.mc-scr-notif-item .ic { width: 30px; height: 30px; border-radius: 9px; display: inline-flex; align-items: center; justify-content: center; background: var(--surface-sunken); color: var(--ink-muted); }
.mc-scr-notif-item .ic.critical { background: var(--status-critical-soft); color: var(--status-critical); }
.mc-scr-notif-item .ic.warn { background: var(--status-warn-soft); color: var(--status-warn); }
.mc-scr-notif-item .tx { display: grid; min-width: 0; }
.mc-scr-notif-item .tx b { font-weight: 500; font-size: 13px; line-height: 18px; }
.mc-scr-notif-item.unread .tx b { font-weight: 700; }
.mc-scr-notif-item .tx span { font-size: 12px; line-height: 16px; color: var(--ink-subtle); }
.mc-scr-notif-item .when { font-size: 11px; line-height: 18px; color: var(--ink-subtle); white-space: nowrap; }
.mc-scr-notif-item .dot { position: absolute; right: 8px; top: 16px; width: 7px; height: 7px; border-radius: 50%; background: var(--status-critical); }
</style>
