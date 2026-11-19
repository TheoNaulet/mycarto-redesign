import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../McButton/McButton.vue'
import McNode from '../McNode/McNode.vue'
import McContainer from '../McContainer/McContainer.vue'
import McFlowNode from '../McFlowNode/McFlowNode.vue'
import McEdgeLayer from '../McEdge/McEdgeLayer.vue'
import { edgeBetween, type McBox, type McEdgeSpec } from '../McEdge/edge'
import McToolbar from '../McToolbar/McToolbar.vue'
import McLensPicker from '../McLensPicker/McLensPicker.vue'
import McMinimap, { type McMinimapBlock } from '../McMinimap/McMinimap.vue'
import McLegend, { type McLegendSection } from '../McLegend/McLegend.vue'
import McStickyNote from '../McStickyNote/McStickyNote.vue'
import McPresenceCursor from '../McPresenceCursor/McPresenceCursor.vue'
import McCanvas from './McCanvas.vue'

const meta = {
  title: 'Canevas/Canvas',
  component: McCanvas,
  args: { width: '100%', height: 360, fill: false, zoom: 1, label: 'Carte Applications et flux' },
  argTypes: { zoom: { control: { type: 'range', min: 0.1, max: 4, step: 0.05 } } },
  parameters: {
    canvas: true,
    pad: false,
    docs: {
      description: {
        component:
          'Le fond de toutes les cartes : une table de travail quadrillée de points (pas de 24px) sur laquelle flottent les panneaux. Taille fixe (`width`, `height`) ou `fill` pour remplir son parent.\n\n**Slots** : par défaut, le contenu de la carte, positionné en absolu dans un calque qui suit `zoom` (la trame suit aussi) et `pan` ; `top` la barre du haut (à 16px des bords) ; `bottom` la barre d’outils centrée ; `bottom-left` la vue d’ensemble ; `right` l’inspecteur ou la légende (sous la barre du haut quand elle existe).\n\nÉvénements : `deselect` (clic sur le vide, Échap), `fit` (double-clic sur le vide).',
      },
    },
  },
  render: (args) => ({
    components: { McCanvas, McNode },
    setup: () => ({ args }),
    template: `<McCanvas v-bind="args">
      <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="32 utilisateurs" style="position:absolute;left:48px;top:72px;margin:0" />
      <McNode layer="technique" icon="cloud" type="VM" name="pythagore" subtitle="Ubuntu 22.04" style="position:absolute;left:312px;top:72px;margin:0" />
    </McCanvas>`,
  }),
} satisfies Meta<typeof McCanvas>

export default meta
type Story = StoryObj<typeof meta>

/** Fais varier le zoom : le contenu et la trame suivent. */
export const Bac_a_sable: Story = { name: 'Bac à sable' }

/* ---------- Une petite carte complète ---------- */

// Le conteneur est posé à (32, 96) : ses nœuds tombent à x = 32 + 1 (bord) + 12 (marge),
// y = 96 + 1 + 40 (en-tête) + 14 (onglet du nœud). Hauteur d'un nœud : 48px ; d'une pilule : 26px.
const NODE_W = 200
const apogee: McBox = { x: 45, y: 151, w: NODE_W, h: 48 }
const diego: McBox = { x: 45, y: 223, w: NODE_W, h: 48 }
const flows = [
  { id: 'f1', label: 'Maj des données étudiantes', meta: 'semestrielle', target: 'CALCIUM', sub: 'Agenda partagé', cy: 100, edge: 'Synchrone · semestrielle' },
  { id: 'f2', label: 'Inscriptions pédagogiques', target: 'ADE', sub: 'Emplois du temps', cy: 175, edge: 'Web service · quotidienne' },
  { id: 'f3', label: 'Export des notes', target: 'NOTES', sub: 'Saisie des notes', cy: 250, edge: 'Fichier plat · semestrielle', status: 'critical' as const },
]
const ldap = { id: 'f4', label: 'Échange annuaire', meta: 'quotidien', target: 'LDAP central', sub: 'Annuaire', cy: 330, edge: 'LDAP · temps réel' }
const pill = (cy: number): McBox => ({ x: 320, y: cy - 13, w: 210, h: 26 })
const target = (cy: number): McBox => ({ x: 600, y: cy - 24, w: NODE_W, h: 48 })

const blocks: McMinimapBlock[] = [
  { layer: 'fonctionnel', x: 3, y: 17, w: 23, h: 34 },
  { layer: 'applicatif', x: 60, y: 14, w: 20, h: 9 },
  { layer: 'applicatif', x: 60, y: 27, w: 20, h: 9 },
  { layer: 'applicatif', x: 60, y: 40, w: 20, h: 9 },
  { layer: 'applicatif', x: 60, y: 54, w: 20, h: 9 },
  { layer: 'technique', x: 86, y: 52, w: 12, h: 20 },
]

const legendFor = (lens: string): McLegendSection[] => [
  { title: 'Types', items: [{ label: 'Domaine', count: 1, layer: 'fonctionnel' }, { label: 'Application', count: 6, layer: 'applicatif' }] },
  ...(lens === 'aucune'
    ? []
    : [
        {
          title: 'Obsolescence',
          items: [
            { id: 'critical', label: 'Obsolète', count: 1, status: 'critical' as const },
            { id: 'ok', label: 'Supporté', count: 4, status: 'ok' as const },
            { id: 'unknown', label: 'Non renseigné', count: 1, status: 'unknown' as const },
          ],
        },
      ]),
]

/**
 * Une petite carte « Applications et flux » : un domaine et ses applications, les flux et leurs liens,
 * la barre du haut, la barre d’outils (zoom, lentille, légende), la vue d’ensemble, un post-it et un curseur.
 * Clique sur APOGEE ou DIEGO : leurs liens passent en accent, les autres s’estompent. Clic sur le vide : désélection.
 */
export const Petite_carte: Story = {
  name: 'Une petite carte',
  render: () => ({
    components: { McCanvas, McNode, McContainer, McFlowNode, McEdgeLayer, McToolbar, McLensPicker, McMinimap, McLegend, McStickyNote, McPresenceCursor, McButton, McIcon },
    setup: () => {
      const selected = ref<'APOGEE' | 'DIEGO' | null>('APOGEE')
      const zoom = ref(1)
      const tool = ref<'select' | 'hand'>('select')
      const legend = ref(false)
      const lens = ref('aucune')
      const isolated = ref<string | null>(null)
      const collapsed = ref(false)
      const mapCollapsed = ref(false)
      const viewport = ref({ x: 0, y: 0, w: 100, h: 100 })
      const lensOn = computed(() => lens.value !== 'aucune')

      const edges = computed<McEdgeSpec[]>(() => {
        const s = selected.value
        const list: McEdgeSpec[] = []
        // Domaine replié : ses applications ne sont plus dessinées, leurs liens non plus.
        if (collapsed.value) return list
        flows.forEach((f, i) => {
          const kind = s === 'APOGEE' ? 'hover' : s === 'DIEGO' ? 'dim' : 'flow'
          list.push({ id: `${f.id}-a`, ...edgeBetween(apogee, pill(f.cy), i, flows.length), midX: 288, kind, label: f.edge })
          list.push({ id: `${f.id}-b`, ...edgeBetween(pill(f.cy), target(f.cy)), kind, label: f.edge })
        })
        const k2 = s === 'DIEGO' ? 'hover' : s === 'APOGEE' ? 'dim' : 'flow'
        list.push({ id: 'f4-a', ...edgeBetween(diego, pill(ldap.cy)), midX: 268, kind: k2, label: ldap.edge })
        list.push({ id: 'f4-b', ...edgeBetween(pill(ldap.cy), target(ldap.cy)), kind: k2, label: ldap.edge })
        return list
      })
      const pos = (b: McBox) => ({ position: 'absolute', left: b.x + 'px', top: b.y + 'px', margin: 0, width: b.w + 'px' })
      const fit = () => {
        zoom.value = 1
        viewport.value = { x: 0, y: 0, w: 100, h: 100 }
      }
      const statusOf = (name: string) => (!lensOn.value ? undefined : name === 'NOTES' ? 'critical' : name === 'LDAP central' ? 'unknown' : 'ok')
      const dimByIsolate = (name: string) => {
        const iso = isolated.value
        if (!iso || iso === 'Application') return false
        if (iso === 'Domaine') return true
        return statusOf(name) !== iso
      }
      return {
        selected, zoom, tool, legend, lens, isolated, collapsed, mapCollapsed, viewport, edges, flows, ldap, pill, target, pos, apogee, diego, blocks,
        legendSections: computed(() => legendFor(lens.value)), fit, statusOf, lensOn, dimByIsolate,
      }
    },
    template: `<McCanvas :height="600" :zoom="zoom" label="Carte Applications et flux du domaine Scolarité" @deselect="selected = null" @fit="fit">
      <McEdgeLayer :edges="edges" />
      <McContainer v-model:collapsed="collapsed" name="Scolarité" type="Domaine" layer="fonctionnel" icon="folder" :count="2" count-label="2 applications" style="left:32px;top:96px;width:232px">
        <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="32 utilisateurs" main
          :selected="selected === 'APOGEE'" :status="statusOf('APOGEE')" :lens="lensOn" :dimmed="dimByIsolate('APOGEE')" @select="selected = 'APOGEE'" />
        <McNode layer="applicatif" icon="app" type="Application" name="DIEGO" subtitle="Dossiers étudiants"
          :selected="selected === 'DIEGO'" :status="statusOf('DIEGO')" :lens="lensOn" :dimmed="dimByIsolate('DIEGO')" @select="selected = 'DIEGO'" />
      </McContainer>
      <McFlowNode v-for="f in flows" :key="f.id" :style="pos(pill(f.cy))" :label="f.label" :hover="selected === 'APOGEE'" :dimmed="selected === 'DIEGO'" />
      <McFlowNode :style="pos(pill(ldap.cy))" :label="ldap.label" direction="both" :hover="selected === 'DIEGO'" :dimmed="selected === 'APOGEE'" />
      <McNode v-for="f in [...flows, ldap]" :key="f.target" :style="pos(target(f.cy))" layer="applicatif" icon="app" type="Application" :name="f.target" :subtitle="f.sub"
        :status="statusOf(f.target)" :lens="lensOn" :dimmed="dimByIsolate(f.target)" />
      <McStickyNote text="NOTES dépend encore de Tomcat 5. Migration prévue ?" pinned-to="NOTES" :rotation="-1.5" :author="{ initials: 'WV', name: 'William', color: 4 }" date="07/07" style="position:absolute;left:860px;top:236px" />
      <McPresenceCursor name="Samuel" :color="5" style="position:absolute;left:700px;top:420px" />

      <template #top>
        <div class="mc-float mc-appbar" style="height:52px">
          <nav class="mc-trail" aria-label="Fil d’Ariane">
            <a href="#" aria-label="Accueil"><McIcon name="home" size="sm" /></a>
            <span class="chev"><McIcon name="chevron-right" size="sm" /></span>
            <a href="#" class="l-fonctionnel"><span class="ld" />Scolarité</a>
            <span class="chev"><McIcon name="chevron-right" size="sm" /></span>
            <a href="#" aria-current="page">Applications et flux</a>
          </nav>
          <span class="spacer" />
          <McButton size="sm" icon="pencil">Modifier la carte</McButton>
        </div>
      </template>
      <template #right>
        <McLegend v-if="legend" :sections="legendSections" v-model:isolated="isolated" @close="legend = false" />
      </template>
      <template #bottom-left>
        <McMinimap :blocks="blocks" :count="8" :zoom="zoom" v-model:viewport="viewport" v-model:collapsed="mapCollapsed" />
      </template>
      <template #bottom>
        <McToolbar v-model:tool="tool" v-model:zoom="zoom" v-model:legend="legend" @fit="fit">
          <template #lens><McLensPicker v-model:lens="lens" @change="legend = true" /></template>
        </McToolbar>
      </template>
    </McCanvas>`,
  }),
}

/** Le canevas seul et ses emplacements : barre du haut, panneau de droite, vue d'ensemble, barre d'outils, à zoom 64 %. */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McCanvas, McNode },
    template: `<div class="mc-col" style="gap:0">
      <McCanvas :height="300" label="Canevas vide avec ses emplacements">
        <template #top><div class="mc-float mc-cap" style="height:52px;display:flex;align-items:center;padding:0 16px">Slot <b>&nbsp;top</b></div></template>
        <template #right><div class="mc-float mc-cap" style="width:220px;height:120px;padding:12px">Slot <b>right</b> (inspecteur, légende)</div></template>
        <template #bottom-left><div class="mc-float mc-cap" style="width:160px;height:72px;padding:12px">Slot <b>bottom-left</b></div></template>
        <template #bottom><div class="mc-float mc-cap" style="padding:14px 24px">Slot <b>bottom</b> (barre d’outils)</div></template>
      </McCanvas>
      <McCanvas :height="220" :zoom="0.64" label="Carte à 64 %">
        <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="Zoom 64 % : la trame se resserre" style="position:absolute;left:48px;top:64px;margin:0" />
        <McNode layer="technique" icon="cloud" type="VM" name="pythagore" subtitle="Ubuntu 22.04" style="position:absolute;left:320px;top:64px;margin:0" />
      </McCanvas>
      <McCanvas :height="220" :zoom="1.5" label="Carte à 150 %">
        <McNode layer="applicatif" icon="app" type="Application" name="APOGEE" subtitle="Zoom 150 %" style="position:absolute;left:32px;top:40px;margin:0" />
      </McCanvas>
    </div>`,
  }),
}
