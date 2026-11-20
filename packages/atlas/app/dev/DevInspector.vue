<script setup lang="ts">
// Aide au développeur (pnpm dev:atlas uniquement, absente du build).
// Alt + clic droit sur n'importe quel élément de l'application : menu sur le composant Vue qui l'a rendu.
// Ouvrir le fichier dans l'éditeur, voir la story, ouvrir le test, copier l'import ou la balise, remonter au parent.
import { computed, onBeforeUnmount, onMounted, ref, shallowRef, type ComponentInternalInstance } from 'vue'
import McContextMenu, { type ContextMenuItem } from '../../src/components/McContextMenu/McContextMenu.vue'

const STORYBOOK = 'http://localhost:6008'

// Les stories (texte brut, pour lire le titre et la première story) et les tests (noms de fichiers seulement).
const stories = import.meta.glob<string>('../../src/**/*.stories.ts', { query: '?raw', import: 'default', eager: true })
const tests = Object.keys(import.meta.glob('../../src/**/*.{spec,test}.ts'))
const index = import.meta.glob<string>('../../src/index.ts', { query: '?raw', import: 'default', eager: true })['../../src/index.ts'] ?? ''

type Target = { inst: ComponentInternalInstance; name: string; file: string; rel: string }

const open = ref(false)
const x = ref(0)
const y = ref(0)
const target = shallowRef<Target | null>(null)
const box = ref<DOMRect | null>(null)
const toast = ref('')
let toastTimer = 0

/** Composant Atlas (fichier .vue sous packages/atlas/src ou app), en sautant RouterView, Transition, etc. */
function asTarget(inst: ComponentInternalInstance | null): Target | null {
  for (let i = inst; i; i = i.parent) {
    const type = i.type as { __file?: string; __name?: string; name?: string }
    const file = type.__file
    if (!file || file.includes('/node_modules/') || file.includes('/app/dev/')) continue
    const name = type.__name ?? type.name ?? file.split('/').pop()!.replace(/\.vue$/, '')
    const at = file.indexOf('/packages/atlas/')
    return { inst: i, name, file, rel: at >= 0 ? file.slice(at + 1) : file }
  }
  return null
}

function instanceAt(el: Element | null): ComponentInternalInstance | null {
  for (let n = el as (Element & { __vueParentComponent?: ComponentInternalInstance }) | null; n; n = n.parentElement) {
    if (n.__vueParentComponent) return n.__vueParentComponent
  }
  return null
}

const base = computed(() => target.value?.file.replace(/\.vue$/, '') ?? '')
const storyRaw = computed(() => {
  const t = target.value
  if (!t) return undefined
  const key = Object.keys(stories).find((k) => t.file.endsWith(k.replace(/^(\.\.\/)+/, '/packages/atlas/').replace(/\.stories\.ts$/, '.vue')))
  return key ? stories[key] : undefined
})
const testFile = computed(() => {
  const t = target.value
  if (!t) return undefined
  const k = tests.find((f) => /\.(spec|test)\.ts$/.test(f) && t.file.endsWith(f.replace(/^(\.\.\/)+/, '/packages/atlas/').replace(/\.(spec|test)\.ts$/, '.vue')))
  return k ? t.file.slice(0, t.file.indexOf('/packages/atlas/')) + k.replace(/^(\.\.\/)+/, '/packages/atlas/') : undefined
})
const parent = computed(() => asTarget(target.value?.inst.parent ?? null))

/** Identifiant Storybook : même règle que Storybook (« Écrans/Carte des flux » → ecrans-carte-des-flux). */
const sanitize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
const storyUrl = computed(() => {
  const raw = storyRaw.value
  const title = raw?.match(/title:\s*['"`]([^'"`]+)['"`]/)?.[1]
  const first = raw?.match(/export const (\w+)\s*[:=]/)?.[1]
  if (!title || !first) return undefined
  const story = first.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
  return `${STORYBOOK}/?path=/story/${sanitize(title)}--${sanitize(story)}`
})

const items = computed<(ContextMenuItem | 'separator')[]>(() => {
  const t = target.value
  if (!t) return []
  const p = parent.value
  return [
    { id: 'edit', label: 'Ouvrir le composant', icon: 'pencil' },
    { id: 'story', label: storyUrl.value ? 'Voir dans Storybook' : 'Pas de story', icon: 'book', disabled: !storyUrl.value },
    { id: 'stories', label: 'Ouvrir le fichier de stories', icon: 'external', disabled: !storyRaw.value },
    { id: 'test', label: testFile.value ? 'Ouvrir le test' : 'Pas encore de test', icon: 'check-circle', disabled: !testFile.value },
    'separator',
    { id: 'import', label: "Copier l'import", icon: 'copy' },
    { id: 'tag', label: 'Copier la balise et ses props', icon: 'copy' },
    { id: 'path', label: 'Copier le chemin', icon: 'link' },
    ...(p ? (['separator', { id: 'parent', label: `Parent : ${p.name}`, icon: 'arrow-right' }] as const) : []),
  ]
})

function openInEditor(file: string) {
  // Point d'entrée de Vite (launch-editor) : ouvre l'éditeur en cours (VS Code, Cursor…), réglable par LAUNCH_EDITOR.
  fetch(`/__open-in-editor?file=${encodeURIComponent(file)}`)
}

function importLine(t: Target) {
  if (new RegExp(`default as ${t.name} \\}`).test(index)) return `import { ${t.name} } from './packages/atlas/src'`
  return `import ${t.name} from './${t.rel}'`
}

/** La balise telle que le parent l'a écrite (props reçues), sans les écouteurs. */
function tagLine(t: Target) {
  const props = (t.inst.vnode.props ?? {}) as Record<string, unknown>
  const attrs = Object.entries(props)
    .filter(([k, v]) => !/^on[A-Z]/.test(k) && typeof v !== 'function' && k !== 'key' && k !== 'ref')
    .map(([k, v]) => {
      if (v === true || v === '') return k
      if (typeof v === 'string') return `${k}="${v.replace(/"/g, '&quot;')}"`
      const json = JSON.stringify(v)
      return `:${k}="${json && json.length <= 80 ? json.replace(/"/g, "'") : '…'}"`
    })
  const slots = Object.keys(t.inst.slots).length > 0
  const open = `<${t.name}${attrs.length ? ' ' + attrs.join(' ') : ''}`
  return slots ? `${open}>…</${t.name}>` : `${open} />`
}

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text)
    flash(`${what} copié`)
  } catch {
    flash('Copie refusée par le navigateur')
  }
}
function flash(msg: string) {
  toast.value = msg
  clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => (toast.value = ''), 1800)
}

function onSelect(item: ContextMenuItem) {
  const t = target.value
  if (!t) return
  switch (item.id) {
    case 'edit': openInEditor(t.file); break
    case 'story': window.open(storyUrl.value, 'atlas-storybook'); break
    case 'stories': openInEditor(`${base.value}.stories.ts`); break
    case 'test': if (testFile.value) openInEditor(testFile.value); break
    case 'import': copy(importLine(t), 'Import'); break
    case 'tag': copy(tagLine(t), 'Balise'); break
    case 'path': copy(t.rel, 'Chemin'); break
    case 'parent':
      if (parent.value) {
        // Le menu se ferme après le choix : on le rouvre au même endroit, sur le parent.
        const p = parent.value
        setTimeout(() => show(p), 0)
      }
      break
  }
}

function outline(t: Target) {
  const el = t.inst.proxy?.$el as Node | undefined
  box.value = el instanceof Element ? el.getBoundingClientRect() : null
}

function show(t: Target) {
  target.value = t
  outline(t)
  open.value = true
}

function onContext(e: MouseEvent) {
  if (!e.altKey) return
  const t = asTarget(instanceAt(e.target as Element))
  if (!t) return
  e.preventDefault()
  e.stopPropagation()
  const w = 280
  const h = 40 + items.value.length * 30
  x.value = Math.min(e.clientX, window.innerWidth - w - 8)
  y.value = Math.min(e.clientY, window.innerHeight - h - 8)
  show(t)
}

onMounted(() => window.addEventListener('contextmenu', onContext, true))
onBeforeUnmount(() => window.removeEventListener('contextmenu', onContext, true))
</script>

<template>
  <div class="dev-inspector">
    <div v-if="open && box" class="dev-outline" :style="{ left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px` }">
      <span>{{ target?.name }}</span>
    </div>
    <McContextMenu v-model:open="open" :items="items" :header="target?.name" :x="x" :y="y" :width="280" @select="onSelect" />
    <div v-if="toast" class="dev-toast" role="status">{{ toast }}</div>
  </div>
</template>

<style>
.dev-inspector { position: fixed; inset: 0; z-index: 10000; pointer-events: none; }
.dev-inspector .mc-ctx { pointer-events: auto; }
.dev-outline { position: fixed; box-sizing: border-box; border: 2px dashed var(--accent); border-radius: 4px; background: color-mix(in srgb, var(--accent) 8%, transparent); }
.dev-outline span { position: absolute; top: -20px; left: -2px; padding: 1px 6px; border-radius: 4px; background: var(--accent); color: var(--on-accent); font: 600 11px/18px ui-monospace, monospace; white-space: nowrap; }
.dev-toast { position: fixed; bottom: 16px; left: 50%; translate: -50% 0; padding: 6px 12px; border-radius: 6px; background: var(--surface-inverse); color: var(--on-navy); font-size: 13px; box-shadow: var(--shadow-pop); }
</style>
