import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McNode from '../McNode/McNode.vue'
import McFlowNode from '../McFlowNode/McFlowNode.vue'
import McEdge from './McEdge.vue'
import McEdgeLayer from './McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeKind, type McEdgeSpec } from './edge'

const meta = {
  title: 'Canevas/Edge',
  component: McEdge,
  args: {
    from: { x: 24, y: 40 },
    to: { x: 392, y: 120 },
    kind: 'flow',
    label: 'Synchrone · semestrielle',
    selected: false,
    showLabel: false,
    arrow: true,
    port: true,
  },
  argTypes: {
    kind: { control: 'inline-radio', options: ['flow', 'hover', 'impact', 'host', 'dim'] },
  },
  parameters: {
    canvas: true,
    docs: {
      description: {
        component:
          'Le lien entre deux nœuds : trait de 2px aux angles arrondis, **rond creux au départ** (bord droit de la source), **pointe pleine** qui s’arrête à 2px de la cible (l’arrivée se pose `EDGE_GAP` = 8px avant son bord gauche, au **centre vertical** de la cible). Plusieurs liens qui quittent le même nœud ont chacun leur départ, espacés de 12px (`edgeBetween(source, cible, index, total)`).\n\nLes écrans utilisent `McEdgeLayer` : un `<svg>` posé sur le canevas qui déclare les marqueurs une seule fois (identifiants uniques) et trace la liste `edges`. `McEdge` seul, dans n’importe quel `<svg>`, déclare ses propres marqueurs.\n\nLe libellé n’apparaît qu’au survol, à la sélection ou avec `showLabel`. Types : `flow`, `hover` (survol ou sélection), `impact` (chemin d’impact, tireté rouge), `host` (hébergement, pointillé sans flèche), `dim` (estompé à 25 %).',
      },
    },
  },
  render: (args) => ({
    components: { McEdge },
    setup: () => ({ args }),
    template: `<svg width="440" height="160" style="overflow:visible;display:block"><McEdge v-bind="args" /></svg>`,
  }),
} satisfies Meta<typeof McEdge>

export default meta
type Story = StoryObj<typeof meta>

/** Survole le lien pour voir son libellé ; change le type dans les contrôles. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

/** Les cinq types de lien, tracés par une couche `McEdgeLayer`. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McEdgeLayer },
    setup: () => {
      const kinds: { kind: McEdgeKind; text: string; bend?: boolean }[] = [
        { kind: 'flow', text: 'Flux applicatif' },
        { kind: 'hover', text: 'Survol ou sélection (avec libellé)', bend: true },
        { kind: 'impact', text: 'Chemin d’impact' },
        { kind: 'host', text: 'Hébergement' },
        { kind: 'dim', text: 'Estompé (hors chemin)' },
      ]
      let y = 30
      const rows = kinds.map((k) => {
        const row = { ...k, y: k.bend ? y + 30 : y }
        y += k.bend ? 76 : 46
        return row
      })
      const edges: McEdgeSpec[] = rows.map((r) => ({
        id: r.kind,
        from: { x: 24, y: r.bend ? r.y - 30 : r.y },
        to: { x: 320, y: r.y },
        midX: r.bend ? 150 : undefined,
        kind: r.kind,
        label: r.kind === 'hover' ? 'Synchrone · semestrielle' : 'Lien',
        showLabel: r.kind === 'hover',
      }))
      return { edges, rows }
    },
    template: `<div style="position:relative;width:620px;height:300px">
      <McEdgeLayer :edges="edges" :interactive="false" />
      <span v-for="r in rows" :key="r.kind" style="position:absolute;left:350px;font-size:12px;line-height:16px;color:var(--ink-muted)" :style="{ top: r.y - 8 + 'px' }">{{ r.text }}</span>
    </div>`,
  }),
}

/**
 * Des liens entre de vrais nœuds (48px de haut) et des pilules de flux (26px) : chaque pointe frappe le centre de sa cible.
 * Bascule entre repos, survol de SANGRIA et chemin d’impact ; survole un lien pour voir son libellé.
 */
export const Entre_des_noeuds: Story = {
  name: 'Entre des nœuds',
  render: () => ({
    components: { McEdgeLayer, McNode, McFlowNode },
    setup: () => {
      const mode = ref<'repos' | 'survol' | 'impact'>('repos')
      const selected = ref<string | null>(null)
      const NODE_W = 184
      const PILL_W = 210
      const src: McBox = { x: 40, y: 136, w: NODE_W, h: 48 }
      const pills: (McBox & { id: string; label: string; meta?: string; both?: boolean })[] = [
        { id: 'p1', label: 'Maj des dossiers RH', meta: 'quotidien', x: 290, y: 57, w: PILL_W, h: 26 },
        { id: 'p2', label: 'Export de la paie', x: 290, y: 147, w: PILL_W, h: 26 },
        { id: 'p3', label: 'Échange annuaire', both: true, x: 290, y: 237, w: PILL_W, h: 26 },
      ]
      const targets: (McBox & { id: string; name: string; subtitle: string })[] = [
        { id: 't1', name: 'GIRAFE', subtitle: 'Gestion des carrières', x: 580, y: 46, w: NODE_W, h: 48 },
        { id: 't2', name: 'WINPAIE', subtitle: '1 240 agents', x: 580, y: 136, w: NODE_W, h: 48 },
        { id: 't3', name: 'LDAP central', subtitle: 'Annuaire', x: 580, y: 226, w: NODE_W, h: 48 },
      ]
      const comp: McBox = { x: 40, y: 320, w: NODE_W, h: 48 }
      const vm: McBox = { x: 290, y: 320, w: NODE_W, h: 48 }

      const edges = computed<McEdgeSpec[]>(() => {
        const m = mode.value
        const list: McEdgeSpec[] = []
        pills.forEach((p, i) => {
          const impacted = m === 'impact' && i === 0
          const kind: McEdgeKind = m === 'survol' ? 'hover' : m === 'impact' ? (impacted ? 'impact' : 'dim') : 'flow'
          const labels = ['Synchrone · quotidienne', 'Fichier plat · mensuelle', 'LDAP · temps réel']
          list.push({ id: `s-${p.id}`, ...edgeBetween(src, p, i, pills.length), kind, label: labels[i], showLabel: m === 'survol' && i === 0, selected: selected.value === `s-${p.id}` })
          list.push({ id: `${p.id}-t`, ...edgeBetween(p, targets[i]!), kind, label: labels[i], selected: selected.value === `${p.id}-t` })
        })
        // Hébergement : pointillé, sans rond ni pointe, il s'arrête à 2px de la machine.
        list.push({
          id: 'host',
          from: { x: comp.x + comp.w, y: comp.y + comp.h / 2 },
          to: { x: vm.x - 2, y: vm.y + vm.h / 2 },
          kind: m === 'impact' ? 'dim' : 'host',
          label: 'Héberge',
          selected: selected.value === 'host',
        })
        return list
      })
      const pos = (b: McBox) => ({ position: 'absolute', left: b.x + 'px', top: b.y + 'px', margin: 0, width: b.w + 'px' })
      const dimNode = (i: number) => mode.value === 'impact' && i !== 0
      return { mode, edges, pills, targets, src, comp, vm, pos, selected, dimNode }
    },
    template: `<div style="display:grid;gap:16px">
      <div class="mc-seg" role="radiogroup" aria-label="État des liens" style="justify-self:start">
        <button v-for="m in [['repos','Repos'],['survol','Survol de SANGRIA'],['impact','Impact : SANGRIA arrêtée']]" :key="m[0]" type="button" role="radio" :aria-checked="mode === m[0]" :class="{ 'is-on': mode === m[0] }" @click="mode = m[0]">{{ m[1] }}</button>
      </div>
      <div style="position:relative;width:800px;height:390px">
        <McEdgeLayer :edges="edges" @select="(id) => (selected = selected === id ? null : id)" />
        <McNode :style="pos(src)" layer="applicatif" icon="app" type="Application" name="SANGRIA" subtitle="Ressources humaines" :selected="mode === 'survol'" :status="mode === 'impact' ? 'critical' : undefined" :lens="mode === 'impact'" />
        <McFlowNode v-for="(p, i) in pills" :key="p.id" :style="pos(p)" :label="p.label" :meta="p.meta" :direction="p.both ? 'both' : 'one'" :width="p.w" :hover="mode === 'survol'" :dimmed="dimNode(i)" />
        <McNode v-for="(t, i) in targets" :key="t.id" :style="pos(t)" layer="applicatif" icon="app" type="Application" :name="t.name" :subtitle="t.subtitle" :dimmed="dimNode(i)" :status="mode === 'impact' && i === 0 ? 'warn' : undefined" :lens="mode === 'impact' && i === 0" />
        <McNode :style="pos(comp)" layer="technique" icon="chip" type="Composant" name="WS_SANGRIA" subtitle="Tomcat 9" :dimmed="mode === 'impact'" />
        <McNode :style="pos(vm)" layer="technique" icon="cloud" type="VM" name="pythagore" subtitle="Ubuntu 22.04" :dimmed="mode === 'impact'" />
      </div>
    </div>`,
  }),
}
