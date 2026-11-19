<script setup lang="ts">
import { computed, nextTick, ref, useId, useSlots, watch } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McStatusChip from '../McStatusChip/McStatusChip.vue'
import type { IconName } from '../../icons/icons'
import type { Layer, Status } from '../../utils/types'

export type PaletteGroup = 'Objets' | 'Cartes' | 'Actions'

/** Un résultat possible. */
export interface PaletteItem {
  /** Identifiant unique. */
  id: string
  /** Groupe : Objets, Cartes ou Actions. */
  group: PaletteGroup
  /** Libellé cherché et surligné : « APOGEE », « Les flux de APOGEE ». */
  label: string
  /** Complément après le libellé : « 1 déploiement ». Cherché aussi. */
  detail?: string
  /** Objets : type écrit dans la puce (« Application ») ; Cartes : vue (« Flux »). */
  type?: string
  /** Couche : couleur de la puce de type. */
  layer?: Layer
  /** Pictogramme (puce de type pour un objet, icône de tête pour une carte ou une action). */
  icon?: IconName
  /** État de l'objet. */
  status?: Status
  /** Mot de l'état : « Obsolète », « Supporté ». */
  statusLabel?: string
  /** Raccourci d'une action : « ⌘I ». */
  shortcut?: string
}

type Scope = 'Tout' | PaletteGroup
const SCOPES: Scope[] = ['Tout', 'Cartes', 'Objets', 'Actions']
const ORDER: PaletteGroup[] = ['Objets', 'Cartes', 'Actions']

const props = withDefaults(
  defineProps<{
    /** Tout ce qui peut être trouvé. Le filtrage (sans casse ni accents) se fait dans le composant. */
    items: PaletteItem[]
    /** Résultats en cours d'arrivée : lignes squelettes. */
    loading?: boolean
    /** Exemple de saisie. */
    placeholder?: string
    /** Sans saisie : nombre de résultats montrés par groupe (récents, favoris). */
    emptyLimit?: number
    /** Positionné dans le conteneur le plus proche plutôt que sur toute la fenêtre (documentation). */
    contained?: boolean
    /** Donne le focus au champ à l'ouverture (désactiver seulement quand plusieurs palettes sont montrées ensemble). */
    autofocus?: boolean
  }>(),
  { loading: false, placeholder: 'Rechercher une carte, un objet, une action', emptyLimit: 4, contained: false, autofocus: true },
)

/** Palette ouverte. */
const open = defineModel<boolean>('open', { default: false })
/** Texte saisi. */
const query = defineModel<string>('query', { default: '' })
/** Portée : Tout, Cartes, Objets ou Actions. */
const scope = defineModel<Scope>('scope', { default: 'Tout' })

const emit = defineEmits<{
  /** Un résultat est ouvert (Entrée, clic). `aside` : ⌘Entrée, ouvrir à côté. */
  select: [item: PaletteItem, aside: boolean]
}>()

const slots = useSlots()
const id = useId()
const input = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const active = ref(0)
let opener: HTMLElement | null = null

const fold = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
const q = computed(() => fold(query.value.trim()))

const matches = computed(() => props.items.filter((it) => !q.value || fold(`${it.label} ${it.detail ?? ''}`).includes(q.value)))
const counts = computed(() => {
  const c: Record<Scope, number> = { Tout: matches.value.length, Objets: 0, Cartes: 0, Actions: 0 }
  matches.value.forEach((m) => c[m.group]++)
  return c
})
const groups = computed(() =>
  ORDER.filter((g) => scope.value === 'Tout' || scope.value === g)
    .map((g) => {
      let rows = matches.value.filter((m) => m.group === g)
      if (!q.value) rows = rows.slice(0, props.emptyLimit)
      return { name: g, rows }
    })
    .filter((g) => g.rows.length),
)
const flat = computed(() => groups.value.flatMap((g) => g.rows))
const current = computed(() => flat.value[active.value])
const optId = (i: number) => `${id}-o${i}`
const indexOf = (it: PaletteItem) => flat.value.indexOf(it)

/** Découpe un texte en morceaux, avec les correspondances à surligner. */
function parts(text: string) {
  const needle = q.value
  if (!needle) return [{ t: text, m: false }]
  // Repli caractère par caractère pour garder les positions du texte d'origine.
  const folded = Array.from(text).map((ch) => {
    const f = fold(ch)
    return f.length === 1 ? f : ch.toLowerCase()
  })
  const hay = folded.join('')
  if (hay.length !== text.length) return [{ t: text, m: false }]
  const out: { t: string; m: boolean }[] = []
  let from = 0
  let at = hay.indexOf(needle)
  while (at >= 0 && needle) {
    if (at > from) out.push({ t: text.slice(from, at), m: false })
    out.push({ t: text.slice(at, at + needle.length), m: true })
    from = at + needle.length
    at = hay.indexOf(needle, from)
  }
  if (from < text.length) out.push({ t: text.slice(from), m: false })
  return out
}

watch([query, scope], () => (active.value = 0))
watch(active, async () => {
  await nextTick()
  list.value?.querySelector(`#${CSS.escape(optId(active.value))}`)?.scrollIntoView({ block: 'nearest' })
})
watch(
  open,
  async (o) => {
    if (o) {
      opener = document.activeElement as HTMLElement | null
      active.value = 0
      if (!props.autofocus) return
      await nextTick()
      input.value?.focus()
      input.value?.select()
    } else {
      opener?.focus?.()
      opener = null
    }
  },
  { immediate: true },
)

function choose(it: PaletteItem | undefined, aside = false) {
  if (!it) return
  emit('select', it, aside)
  open.value = false
}
function cycleScope(dir: number) {
  const i = SCOPES.indexOf(scope.value)
  scope.value = SCOPES[(i + dir + SCOPES.length) % SCOPES.length]
}
function onKey(e: KeyboardEvent) {
  const n = flat.value.length
  if (e.key === 'Escape') {
    e.preventDefault()
    open.value = false
  } else if (e.key === 'ArrowDown' && n) {
    e.preventDefault()
    active.value = (active.value + 1) % n
  } else if (e.key === 'ArrowUp' && n) {
    e.preventDefault()
    active.value = (active.value - 1 + n) % n
  } else if (e.key === 'Enter') {
    e.preventDefault()
    choose(current.value, e.metaKey || e.ctrlKey)
  } else if (e.key === 'Tab' && e.target === input.value) {
    // Tab change de portée, comme les filtres d'un moteur de recherche.
    e.preventDefault()
    cycleScope(e.shiftKey ? -1 : 1)
  }
}
const hasPreview = computed(() => !!slots.preview)
</script>

<template>
  <div v-if="open" class="mc-cmd-layer" :class="{ contained }">
    <div class="mc-cmd-scrim" aria-hidden="true" @click="open = false" />
    <div
      class="mc-pop mc-palette"
      :class="{ 'has-preview': hasPreview }"
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher"
      @keydown="onKey"
    >
      <div class="mc-cmd-main">
        <label class="q">
          <McIcon name="search" size="lg" />
          <input
            ref="input"
            v-model="query"
            class="grow"
            type="text"
            role="combobox"
            autocomplete="off"
            spellcheck="false"
            aria-autocomplete="list"
            :aria-expanded="true"
            :aria-controls="`${id}-list`"
            :aria-activedescendant="current ? optId(active) : undefined"
            :placeholder="placeholder"
            aria-label="Rechercher"
          />
          <span class="mc-kbd">Échap</span>
        </label>
        <div class="scopes" role="radiogroup" aria-label="Portée">
          <button
            v-for="s in SCOPES"
            :key="s"
            type="button"
            role="radio"
            class="mc-chip"
            :class="scope === s ? 'filter' : 'neutral'"
            :aria-checked="scope === s"
            tabindex="-1"
            @click="scope = s; input?.focus()"
          >{{ s }}<template v-if="q && !loading"> · {{ counts[s] }}</template></button>
        </div>

        <div :id="`${id}-list`" ref="list" class="mc-cmd-list" role="listbox" aria-label="Résultats">
          <template v-if="loading">
            <div v-for="n in 5" :key="n" class="res mc-cmd-skel" aria-hidden="true">
              <span class="mc-skel" style="width: 92px; height: 20px" />
              <span class="mc-skel" :style="{ width: `${40 + ((n * 37) % 40)}%`, height: '12px' }" />
            </div>
            <span class="mc-sr" role="status">Recherche en cours</span>
          </template>
          <div v-else-if="!flat.length" class="mc-cmd-empty" role="status">
            <b>Aucun résultat pour « {{ query.trim() }} »</b>
            <span>Vérifiez l’orthographe<template v-if="scope !== 'Tout'">, ou cherchez dans <button type="button" class="mc-cmd-link" @click="scope = 'Tout'">Tout</button></template>.</span>
          </div>
          <template v-else>
            <div v-for="g in groups" :key="g.name" role="group" :aria-labelledby="`${id}-g-${g.name}`">
              <div :id="`${id}-g-${g.name}`" class="grp mc-over">{{ !q && g.name === 'Cartes' ? 'Cartes récentes' : g.name }}</div>
              <div
                v-for="it in g.rows"
                :id="optId(indexOf(it))"
                :key="it.id"
                class="res"
                :class="[it.layer && `l-${it.layer}`, { 'is-on': indexOf(it) === active }]"
                role="option"
                :aria-selected="indexOf(it) === active"
                @mousemove="active = indexOf(it)"
                @click="choose(it, $event.metaKey || $event.ctrlKey)"
              >
                <span v-if="it.group === 'Objets' && it.type" class="mc-chip type">
                  <span class="sw"><McIcon :name="it.icon ?? 'app'" /></span>{{ it.type }}
                </span>
                <McIcon v-else :name="it.icon ?? (it.group === 'Cartes' ? 'map' : 'arrow-right')" />
                <span class="grow mc-cmd-label">
                  <template v-for="(p, k) in parts(it.label)" :key="k"><mark v-if="p.m">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template>
                  <span v-if="it.detail" class="sub"> · <template v-for="(p, k) in parts(it.detail)" :key="k"><mark v-if="p.m">{{ p.t }}</mark><template v-else>{{ p.t }}</template></template></span>
                </span>
                <McStatusChip v-if="it.status && it.statusLabel" :status="it.status" size="sm">{{ it.statusLabel }}</McStatusChip>
                <span v-if="it.group === 'Cartes' && it.type" class="mc-cap">{{ it.type }}</span>
                <span v-if="it.shortcut" class="mc-kbd">{{ it.shortcut }}</span>
              </div>
            </div>
          </template>
        </div>

        <div class="foot" aria-hidden="true">
          <span>↑↓ naviguer</span><span>Entrée ouvrir</span><span>⌘Entrée ouvrir à côté</span><span>Tab portée</span>
        </div>
      </div>
      <div v-if="hasPreview" class="mc-cmd-prev" :class="current?.layer && `l-${current.layer}`" aria-live="polite">
        <slot v-if="current && !loading" name="preview" :item="current" />
        <p v-else class="mc-cap" style="margin: 0">L’aperçu du résultat actif s’affiche ici.</p>
      </div>
    </div>
  </div>
</template>

<style>
.mc-cmd-layer { position: fixed; inset: 0; z-index: 60; }
.mc-cmd-layer.contained { position: absolute; }
.mc-cmd-scrim { position: absolute; inset: 0; background: color-mix(in srgb, var(--navy-deep) 38%, transparent); }
.mc-cmd-layer .mc-palette { position: absolute; left: 50%; top: 64px; transform: translateX(-50%); max-width: calc(100% - 32px); display: flex; flex-direction: column; }
.mc-palette.has-preview { width: 880px; display: grid; grid-template-columns: minmax(0, 1fr) 320px; }
.mc-cmd-main { min-width: 0; display: flex; flex-direction: column; }
.mc-palette.has-preview .mc-cmd-main { border-right: 1px solid var(--line); }
.mc-palette .q { cursor: text; color: var(--ink-subtle); }
.mc-palette .q input { border: 0; outline: 0; background: transparent; color: var(--ink); font: 400 15px/20px var(--font-sans); min-width: 0; padding: 0; }
.mc-palette .q input::placeholder { color: var(--ink-subtle); }
.mc-palette .scopes button.mc-chip { border: 0; cursor: pointer; font-family: var(--font-sans); }
.mc-palette .scopes button.mc-chip.neutral:hover { color: var(--ink); }
.mc-cmd-list { max-height: 360px; overflow-y: auto; padding-bottom: 4px; }
.mc-palette .res { cursor: pointer; color: var(--ink); }
.mc-palette .res .mc-ico { color: var(--ink-subtle); }
.mc-palette .res .mc-chip.type .mc-ico { color: inherit; }
.mc-palette .res .sub { color: var(--ink-subtle); font-size: 12px; }
.mc-cmd-label { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-cmd-skel { cursor: default; margin-top: 6px; }
.mc-cmd-empty { display: grid; gap: 4px; padding: 28px 16px 24px; text-align: center; font-size: 13px; line-height: 18px; color: var(--ink-muted); }
.mc-cmd-empty b { font: 600 14px/20px var(--font-display); color: var(--ink); }
.mc-cmd-link { border: 0; background: none; padding: 0; color: var(--accent); font: inherit; cursor: pointer; text-decoration: underline; }
.mc-cmd-prev { padding: 18px; display: grid; gap: 14px; align-content: start; background: var(--surface-sunken); min-width: 0; }
</style>
