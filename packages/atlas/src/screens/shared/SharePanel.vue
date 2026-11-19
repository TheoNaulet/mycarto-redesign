<script setup lang="ts">
// Panneau « Partager et exporter » d'une carte : copier le lien (avec ou sans la vue et la lentille actuelles),
// choisir qui peut l'ouvrir, puis exporter un fichier PNG, PDF ou SVG généré dans le navigateur.
import { computed, onBeforeUnmount, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSelect, { type McSelectOption } from '../../components/McSelect/McSelect.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McToggleGroup from '../../components/McToggleGroup/McToggleGroup.vue'
import { useToast } from '../../components/McToast/useToast'
import type { Layer } from '../../utils/types'
import { buildPdf, buildSvg, download, fileSlug, readPalette, sizeLabel, svgToPng, type ExportFormat, type ExportItem, type PageFormat } from './exportFile'

export type { ExportFormat, ExportItem, PageFormat } from './exportFile'

/** Ce que l'export vient de produire. */
export interface ShareExport {
  format: ExportFormat
  fileName: string
  /** Taille du fichier en octets. */
  size: number
}

const props = withDefaults(
  defineProps<{
    /** Nom de la carte : titre du fichier exporté et base de son nom. */
    title?: string
    /** Objets dessinés dans le fichier exporté. */
    items?: ExportItem[]
    /** Post-its de la carte, ajoutés à l'export si l'option est cochée. */
    notes?: string[]
    /** Lien à partager. Par défaut : l'adresse de la page ouverte. */
    link?: string
    /** Nombre d'objets sélectionnés : propose « Sélection seulement » dans le contenu exporté. */
    selectionCount?: number
    /** Affiche la croix de fermeture (panneau flottant). */
    closable?: boolean
  }>(),
  {
    title: 'Applications et flux de Scolarité',
    items: () => defaultItems,
    notes: () => ['APOGEE dépend encore de Tomcat 5. Migration prévue ?'],
    link: undefined,
    selectionCount: 0,
    closable: true,
  },
)

const emit = defineEmits<{
  /** Croix ou Échap. */
  close: []
  /** Le lien a été copié. */
  copied: [url: string]
  /** Un fichier a été généré et téléchargé. */
  exported: [file: ShareExport]
}>()

const toast = useToast()
const root = ref<HTMLElement | null>(null)

/* ---------- Lien ---------- */
const keepView = ref(true)
const keepLens = ref(false)
const access = ref<string | number | null>('organisation')
const accessOptions: McSelectOption[] = [
  { value: 'organisation', label: 'Toute l’organisation' },
  { value: 'membres', label: 'Les membres de la carte' },
  { value: 'lien', label: 'Toute personne qui a le lien' },
]
const accessHelp = computed(
  () =>
    ({
      organisation: 'Les personnes connectées à myCarto peuvent l’ouvrir, selon leurs droits.',
      membres: 'Seules les personnes ajoutées à cette carte peuvent l’ouvrir.',
      lien: 'Lecture seule, sans connexion. Le lien suffit : partagez-le avec prudence.',
    })[String(access.value)] ?? '',
)

/** L'adresse de la page : celle de l'onglet (Storybook ou application), sinon celle du cadre. */
function pageUrl(): string {
  try {
    return (window.top ?? window).location.href
  } catch {
    return window.location.href
  }
}
const link = computed(() => {
  const url = new URL(props.link ?? pageUrl(), window.location.origin)
  for (const k of ['vue', 'lentille', 'acces']) url.searchParams.delete(k)
  if (keepView.value) url.searchParams.set('vue', 'actuelle')
  if (keepLens.value) url.searchParams.set('lentille', 'active')
  if (access.value === 'lien') url.searchParams.set('acces', 'public')
  return url.href
})
const shownLink = computed(() => link.value.replace(/^https?:\/\//, ''))

const linkInput = ref<HTMLInputElement | null>(null)
const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | undefined
onBeforeUnmount(() => clearTimeout(copiedTimer))

async function copy() {
  const url = link.value
  let ok = false
  try {
    // Sans réponse du presse-papiers (page sans focus), on passe au repli au bout d'une seconde et demie.
    await Promise.race([navigator.clipboard.writeText(url), new Promise((_, reject) => setTimeout(() => reject(new Error('délai')), 1500))])
    ok = true
  } catch {
    // Presse-papiers refusé (cadre, permission) : on sélectionne le champ et on tente la copie classique.
    const el = linkInput.value
    if (el) {
      el.value = url
      el.focus()
      el.select()
      try {
        ok = document.execCommand('copy')
      } catch {
        ok = false
      }
    }
  }
  if (ok) {
    copied.value = true
    clearTimeout(copiedTimer)
    copiedTimer = setTimeout(() => (copied.value = false), 2000)
    toast.success('Lien copié dans le presse-papiers')
    emit('copied', url)
  } else {
    linkInput.value?.select()
    toast.info('Copie automatique impossible : le lien est sélectionné, copiez-le avec ⌘C ou Ctrl+C.')
  }
}

/* ---------- Export ---------- */
const format = ref<ExportFormat>('pdf')
const formatOptions = [
  { value: 'png', label: 'PNG' },
  { value: 'pdf', label: 'PDF' },
  { value: 'svg', label: 'SVG' },
]
const page = ref<string | number | null>('a3-paysage')
const pageOptions: McSelectOption[] = [
  { value: 'a4-paysage', label: 'A4 paysage' },
  { value: 'a3-paysage', label: 'A3 paysage' },
  { value: 'a4-portrait', label: 'A4 portrait' },
]
const scale = ref<string | number | null>(2)
const scaleOptions: McSelectOption[] = [
  { value: 1, label: 'Standard (1×)' },
  { value: 2, label: 'Haute définition (2×)' },
  { value: 3, label: 'Impression (3×)' },
]
const content = ref<string | number | null>('carte')
const contentOptions = computed<McSelectOption[]>(() => [
  { value: 'carte', label: 'Toute la carte' },
  { value: 'vue', label: 'Vue actuelle' },
  {
    value: 'selection',
    label: props.selectionCount ? `Sélection (${props.selectionCount} objet${props.selectionCount > 1 ? 's' : ''})` : 'Sélection (aucun objet choisi)',
    disabled: !props.selectionCount,
  },
])
const legend = ref(true)
const notesOn = ref(false)
const dots = ref(false)
const exporting = ref(false)

/** Objets exportés : toute la carte, ceux de la vue (les deux premières couches dessinées), ou la sélection. */
const exportedItems = computed<ExportItem[]>(() => {
  if (content.value === 'selection') return props.items.slice(0, props.selectionCount)
  if (content.value === 'vue') return props.items.slice(0, Math.max(1, Math.ceil(props.items.length * 0.6)))
  return props.items
})

function today() {
  return new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
async function exportFile() {
  if (!root.value || exporting.value) return
  exporting.value = true
  try {
    const palette = readPalette(root.value)
    const n = exportedItems.value.length
    const scene = {
      title: props.title,
      subtitle: `${n} objet${n > 1 ? 's' : ''} · ${String(contentOptions.value.find((o) => o.value === content.value)?.label ?? '')} · exportée le ${today()} depuis myCarto`,
      items: exportedItems.value,
      notes: notesOn.value ? props.notes : [],
      legend: legend.value,
      dots: dots.value,
    }
    const base = fileSlug(props.title)
    let blob: Blob
    if (format.value === 'pdf') blob = buildPdf(scene, palette, page.value as PageFormat)
    else {
      const { svg, w, h } = buildSvg(scene, palette)
      blob = format.value === 'svg' ? new Blob([svg], { type: 'image/svg+xml' }) : await svgToPng(svg, w, h, Number(scale.value) || 2)
    }
    const fileName = `${base}.${format.value}`
    download(blob, fileName)
    toast.success(`Export prêt : ${fileName} (${sizeLabel(blob.size)})`)
    emit('exported', { format: format.value, fileName, size: blob.size })
  } catch {
    toast.error('Export impossible : le navigateur n’a pas pu générer le fichier. Réessayez ou choisissez un autre format.')
  } finally {
    exporting.value = false
  }
}

/* ---------- Aperçu : un bloc par objet, couleur de sa couche ---------- */
const previewBlocks = computed(() => {
  const order: Layer[] = ['metier', 'fonctionnel', 'applicatif', 'technique']
  const list = exportedItems.value.slice(0, 12)
  return order.flatMap((layer, row) =>
    list.filter((i) => i.layer === layer).map((i, k) => ({ key: `${layer}-${i.name}`, layer, left: 14 + (k % 5) * 50, top: 14 + row * 22 + Math.floor(k / 5) * 12 })),
  )
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable) {
    e.stopPropagation()
    emit('close')
  }
}
</script>

<script lang="ts">
/** Objets de la carte « Applications et flux de Scolarité », dessinés par défaut. */
const defaultItems: ExportItem[] = [
  { name: 'Scolarité', layer: 'fonctionnel' },
  { name: 'Référentiel', layer: 'fonctionnel' },
  { name: 'APOGEE', layer: 'applicatif' },
  { name: 'APOGEE WEB', layer: 'applicatif' },
  { name: 'UNICAMPUS', layer: 'applicatif' },
  { name: 'NOTES', layer: 'applicatif' },
  { name: 'CALCIUM', layer: 'applicatif' },
  { name: 'DIEGO', layer: 'applicatif' },
  { name: 'ALERTES-DIPLOMES', layer: 'applicatif' },
  { name: 'OpenLDAP', layer: 'applicatif' },
  { name: 'TROMBINOSCOPE', layer: 'applicatif' },
  { name: 'C2I', layer: 'applicatif' },
  { name: 'CNOUS', layer: 'metier' },
]
</script>

<template>
  <div ref="root" class="mc-pop mc-scr-sh" role="dialog" aria-label="Partager et exporter" @keydown="onKey">
    <div class="mc-scr-sh-sec">
      <div class="mc-scr-sh-hd">
        <h3><McIcon name="link" size="sm" />Partager un lien</h3>
        <McIconButton v-if="closable" size="sm" icon="x" label="Fermer" @click="emit('close')" />
      </div>
      <div class="mc-scr-sh-line">
        <div class="mc-input sm is-readonly mc-scr-sh-link">
          <input ref="linkInput" class="mc-code" :value="shownLink" readonly aria-label="Lien de la carte" @focus="($event.target as HTMLInputElement).select()" />
        </div>
        <McButton variant="secondary" size="sm" :icon="copied ? 'check' : 'copy'" @click="copy">{{ copied ? 'Copié' : 'Copier' }}</McButton>
      </div>
      <McSwitch v-model="keepView" label="Ouvrir sur la vue actuelle (zoom et sélection)" block />
      <McSwitch v-model="keepLens" label="Garder la lentille active" block />
      <McSelect v-model="access" label="Qui peut ouvrir" size="sm" :options="accessOptions" :help="accessHelp" />
    </div>

    <div class="mc-scr-sh-sec">
      <h3><McIcon name="export" size="sm" />Exporter un fichier</h3>
      <McToggleGroup v-model="format" label="Format" :options="formatOptions" class="mc-scr-sh-seg" />
      <div class="mc-scr-sh-prev" aria-hidden="true" :class="{ 'is-dots': dots }">
        <i v-for="b in previewBlocks" :key="b.key" :class="`l-${b.layer}`" :style="{ left: `${b.left}px`, top: `${b.top}px` }" />
        <span v-if="notesOn && notes.length" class="mc-scr-sh-note" />
        <span v-if="legend" class="mc-scr-sh-lg" />
      </div>
      <div class="mc-grid2 mc-scr-sh-grid">
        <McSelect v-if="format === 'pdf'" v-model="page" label="Format de page" size="sm" :options="pageOptions" />
        <McSelect v-else-if="format === 'png'" v-model="scale" label="Résolution" size="sm" :options="scaleOptions" />
        <McSelect v-model="content" label="Contenu" size="sm" :options="contentOptions" :class="{ 'mc-scr-sh-span': format === 'svg' }" />
      </div>
      <McSwitch v-model="legend" label="Inclure la légende" block />
      <McSwitch v-model="notesOn" :label="`Inclure les post-its${notes.length ? ` (${notes.length})` : ''}`" :disabled="!notes.length" block />
      <McSwitch v-model="dots" label="Trame de points en fond" block />
      <McButton icon="export" :loading="exporting" class="mc-scr-sh-go" @click="exportFile">Exporter en {{ format.toUpperCase() }}</McButton>
    </div>
  </div>
</template>

<style>
.mc-scr-sh { width: 400px; max-width: calc(100vw - 32px); max-height: calc(100vh - 80px); overflow-y: auto; overscroll-behavior: contain; box-sizing: border-box; padding: 6px; display: grid; color: var(--ink); font-family: var(--font-sans); }
.mc-scr-sh-sec { padding: 14px; display: grid; gap: 12px; min-width: 0; }
.mc-scr-sh-sec + .mc-scr-sh-sec { border-top: 1px solid var(--line); }
.mc-scr-sh h3 { margin: 0; font: 600 14px/18px var(--font-display); display: flex; align-items: center; gap: 8px; }
.mc-scr-sh h3 .mc-ico { color: var(--ink-muted); }
.mc-scr-sh-hd { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin: -4px 0; }
.mc-scr-sh-line { display: flex; gap: 8px; align-items: center; }
.mc-scr-sh-link { flex: 1; min-width: 0; }
.mc-scr-sh-link input { font-size: 12px; text-overflow: ellipsis; }
.mc-scr-sh-seg { justify-self: start; }
.mc-scr-sh-prev { height: 120px; border-radius: var(--radius-sm); border: 1px solid var(--line); background: var(--surface); position: relative; overflow: hidden; }
.mc-scr-sh-prev.is-dots { background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1.2px); background-size: 10px 10px; }
.mc-scr-sh-prev i { position: absolute; width: 42px; height: 9px; border-radius: 2px; background: var(--lc); opacity: .75; transition: left .16s ease-out, top .16s ease-out; }
.mc-scr-sh-note { position: absolute; right: 76px; bottom: 8px; width: 40px; height: 28px; border-radius: 2px; background: var(--sticky-yellow); box-shadow: var(--shadow-node); }
.mc-scr-sh-lg { position: absolute; right: 8px; bottom: 8px; width: 60px; height: 44px; border-radius: 4px; background: var(--surface-sunken); border: 1px solid var(--line); }
.mc-scr-sh-grid { gap: 10px; }
.mc-scr-sh-span { grid-column: span 2; }
.mc-scr-sh-go { justify-self: stretch; }
@media (prefers-reduced-motion: reduce) {
  .mc-scr-sh-prev i { transition: none; }
}
</style>
