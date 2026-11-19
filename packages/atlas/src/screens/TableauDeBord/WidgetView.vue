<script setup lang="ts">
// Contenu d'un widget ajouté au tableau de bord, calculé sur les données de l'inventaire.
// Chaque élément mène à la liste ou à la fiche correspondante.
import { computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { WidgetType } from '../shared/widgets'
import { goFiche, goPath, pathHref } from '../bridge'
import { contracts, domainCount, domainNames, endOfSupportSoftware, invalidApplications, inventory, obsoleteSoftware } from '../../data/applications'
import { runQuery, savedQueries } from '../../data/requetes'
import { parseFr, TODAY } from './board'

const props = defineProps<{ type: WidgetType; /** Plein écran : plus de lignes. */ big?: boolean }>()

const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
function go(e: MouseEvent, path: string) {
  if (e.metaKey || e.ctrlKey || e.shiftKey) return
  e.preventDefault()
  goPath(path)
}

/* Chiffre clé */
const active = inventory.filter((a) => a.statut === 'Active').length
/* Jauge */
const validPct = Math.round(((inventory.length - invalidApplications.length) / inventory.length) * 100)
const GOAL = 90
/* Barres : applications par domaine */
const byDomain = domainNames.map((d) => ({ d, n: domainCount(d) })).sort((a, b) => b.n - a.n)
const domMax = Math.max(1, ...byDomain.map((x) => x.n))
/* Anneau : hébergement */
const saas = inventory.filter((a) => a.hebergement === 'SaaS').length
const onPrem = inventory.filter((a) => a.hebergement === 'On-premise').length
const nc = inventory.length - saas - onPrem
const ring = computed(() => {
  const t = inventory.length
  const a = (onPrem / t) * 360
  const b = a + (saas / t) * 360
  return `conic-gradient(var(--data-3) 0 ${a}deg, var(--data-5) ${a}deg ${b}deg, var(--line) ${b}deg 360deg)`
})
/* Évolution : mises en service par année */
const years = (() => {
  const ys = inventory.map((a) => parseFr(a.miseEnService)?.getFullYear()).filter((y): y is number => !!y)
  const min = Math.min(...ys)
  const max = Math.max(...ys)
  return Array.from({ length: max - min + 1 }, (_, i) => ({ y: min + i, n: ys.filter((x) => x === min + i).length }))
})()
const curve = computed(() => {
  const W = 300
  const H = 110
  const max = Math.max(1, ...years.map((x) => x.n))
  const step = years.length > 1 ? W / (years.length - 1) : W
  const pts = years.map((v, i) => ({ x: i * step, y: H - (v.n / max) * (H - 14) - 4, year: v.y, n: v.n }))
  return { W, H, pts, line: pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') }
})
/* Points d'attention : logiciels obsolètes puis en fin de support */
const attention = [...obsoleteSoftware.map((l) => ({ l, s: 'critical' as const, t: 'Plus supporté' })), ...endOfSupportSoftware.map((l) => ({ l, s: 'warn' as const, t: 'Fin de support proche' }))]
/* Échéances : contrats à venir, puis expirés */
const deadlines = [...contracts]
  .map((c) => ({ c, d: parseFr(c.end) }))
  .filter((x) => x.d)
  .sort((a, b) => a.d!.getTime() - b.d!.getTime())
  .filter((x) => x.d! >= new Date(TODAY.getFullYear() - 1, TODAY.getMonth(), 1))
const days = (d: Date) => Math.round((d.getTime() - TODAY.getTime()) / 86_400_000)
/* Résultat de requête */
const query = savedQueries.find((q) => q.id === 'applications-sans-composant' || q.id === 'apps-sans-composant') ?? savedQueries[0]
const queryRows = runQuery(query)
const openRow = (e: MouseEvent, r: (typeof queryRows)[number]) => {
  e.preventDefault()
  if ('fiche' in r.open) goFiche(r.open.fiche)
  else goPath(r.open.path)
}
const limit = computed(() => (props.big ? 14 : 6))
</script>

<template>
  <div class="mc-scr-wv" :class="{ big }">
    <a v-if="type === 'kpi'" class="mc-scr-wv-kpi" :href="pathHref('/explorateur')" @click="go($event, '/explorateur')">
      <b>{{ inventory.length }}</b><span>applications</span>
      <small>{{ plural(active, 'active', 'actives') }} · {{ plural(inventory.length - active, 'prévue', 'prévues') }}</small>
    </a>

    <a v-else-if="type === 'jauge'" class="mc-scr-wv-gauge" :href="pathHref('/explorateur?filtre=non-valides')" @click="go($event, '/explorateur?filtre=non-valides')">
      <b>{{ validPct }} %</b><span>des fiches valides · objectif {{ GOAL }} %</span>
      <span class="track"><i :style="{ width: validPct + '%' }" /><em :style="{ left: GOAL + '%' }" /></span>
      <small>{{ plural(invalidApplications.length, 'fiche à compléter', 'fiches à compléter') }} →</small>
    </a>

    <ul v-else-if="type === 'barres'" class="mc-scr-wv-bars">
      <li v-for="x in byDomain.slice(0, big ? 20 : 7)" :key="x.d">
        <a :href="pathHref(`/explorateur?domaine=${encodeURIComponent(x.d)}`)" @click="go($event, `/explorateur?domaine=${encodeURIComponent(x.d)}`)">{{ x.d }}</a>
        <span class="tr"><i :style="{ width: (x.n / domMax) * 100 + '%' }" /></span>
        <span class="c">{{ x.n }}</span>
      </li>
    </ul>

    <div v-else-if="type === 'anneau'" class="mc-scr-wv-ring">
      <span class="donut" :style="{ background: ring }" role="img" :aria-label="`${onPrem} on-premise, ${saas} SaaS`"><span /></span>
      <ul>
        <li><i style="background: var(--data-3)" />On-premise · {{ onPrem }}</li>
        <li><i style="background: var(--data-5)" />SaaS · {{ saas }}</li>
        <li v-if="nc"><i style="background: var(--line)" />Non renseigné · {{ nc }}</li>
      </ul>
    </div>

    <svg v-else-if="type === 'courbe'" class="mc-scr-wv-curve" :viewBox="`-10 -6 ${curve.W + 20} ${curve.H + 26}`" role="img" aria-label="Mises en service par année">
      <polyline :points="curve.line" />
      <g v-for="p in curve.pts" :key="p.year">
        <circle :cx="p.x" :cy="p.y" r="3"><title>{{ p.year }} : {{ plural(p.n, 'mise en service', 'mises en service') }}</title></circle>
        <text :x="p.x" :y="curve.H + 16" text-anchor="middle">{{ String(p.year).slice(2) }}</text>
      </g>
    </svg>

    <ul v-else-if="type === 'liste'" class="mc-scr-wv-list">
      <li v-for="x in attention.slice(0, limit)" :key="x.l">
        <a :href="pathHref(`/logiciels?id=${encodeURIComponent(x.l)}`)" @click="go($event, `/logiciels?id=${encodeURIComponent(x.l)}`)">
          <McIcon :name="x.s === 'critical' ? 'alert-octagon' : 'alert-triangle'" size="sm" :class="x.s" />{{ x.l }}<span>{{ x.t }}</span>
        </a>
      </li>
    </ul>

    <ul v-else-if="type === 'echeances'" class="mc-scr-wv-list">
      <li v-for="x in deadlines.slice(0, limit)" :key="x.c.ref">
        <a :href="pathHref('/contrats')" @click="go($event, '/contrats')">
          <McIcon name="contract" size="sm" :class="days(x.d!) < 0 ? 'critical' : days(x.d!) < 180 ? 'warn' : ''" />{{ x.c.ref }} · {{ x.c.supplier }}
          <span>{{ days(x.d!) < 0 ? `Expiré le ${x.c.end}` : `Le ${x.c.end}` }}</span>
        </a>
      </li>
    </ul>

    <div v-else-if="type === 'tableau'" class="mc-scr-wv-query">
      <ul class="mc-scr-wv-list">
        <li v-for="r in queryRows.slice(0, limit)" :key="r.id"><a href="#" @click="openRow($event, r)"><McIcon name="app" size="sm" />{{ r.name }}</a></li>
      </ul>
      <a class="more" :href="pathHref('/requetes?requete=applications-sans-composant')" @click="go($event, '/requetes?requete=applications-sans-composant')">{{ plural(queryRows.length, 'résultat', 'résultats') }} · ouvrir la requête →</a>
    </div>

    <a v-else class="mc-scr-wv-map" :href="pathHref('/carte')" @click="go($event, '/carte')">
      <span class="thumb" aria-hidden="true">
        <i class="l-fonctionnel" style="left: 6%; top: 8%; width: 44%; height: 84%" />
        <i class="l-applicatif" style="left: 58%; top: 12%; width: 34%; height: 14%" />
        <i class="l-applicatif" style="left: 58%; top: 40%; width: 34%; height: 14%" />
        <i class="l-applicatif" style="left: 58%; top: 68%; width: 34%; height: 14%" />
      </span>
      <span>Applications et flux de Scolarité · ouvrir →</span>
    </a>
  </div>
</template>

<style>
.mc-scr-wv { min-width: 0; font-size: 13px; line-height: 18px; }
.mc-scr-wv a { color: inherit; text-decoration: none; }
.mc-scr-wv a:hover { color: var(--accent); }
.mc-scr-wv-kpi, .mc-scr-wv-gauge { display: grid; gap: 4px; }
.mc-scr-wv-kpi b, .mc-scr-wv-gauge b { font: 700 32px/36px var(--font-display); color: var(--ink); }
.mc-scr-wv small { color: var(--ink-subtle); font-size: 12px; }
.mc-scr-wv-gauge .track { position: relative; height: 10px; border-radius: 5px; background: var(--surface-sunken); margin: 6px 0; }
.mc-scr-wv-gauge .track i { display: block; height: 100%; border-radius: 5px; background: var(--status-ok); }
.mc-scr-wv-gauge .track em { position: absolute; top: -3px; width: 2px; height: 16px; background: var(--ink); }
.mc-scr-wv-bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mc-scr-wv-bars li { display: grid; grid-template-columns: minmax(80px, 140px) 1fr 28px; gap: 10px; align-items: center; }
.mc-scr-wv-bars a { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-wv-bars .tr { height: 10px; border-radius: 5px; background: var(--surface-sunken); overflow: hidden; }
.mc-scr-wv-bars .tr i { display: block; height: 100%; background: var(--layer-fonctionnel); border-radius: 5px; }
.mc-scr-wv-bars .c { text-align: right; font-weight: 600; font-variant-numeric: tabular-nums; }
.mc-scr-wv-ring { display: flex; align-items: center; gap: 18px; }
.mc-scr-wv-ring .donut { width: 96px; height: 96px; border-radius: 50%; display: grid; place-items: center; flex: none; }
.mc-scr-wv-ring .donut span { width: 58px; height: 58px; border-radius: 50%; background: var(--surface); }
.mc-scr-wv-ring ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
.mc-scr-wv-ring i { display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 6px; }
.mc-scr-wv-curve { width: 100%; height: auto; display: block; }
.mc-scr-wv-curve polyline { fill: none; stroke: var(--data-3); stroke-width: 2; }
.mc-scr-wv-curve circle { fill: var(--surface); stroke: var(--data-3); stroke-width: 2; }
.mc-scr-wv-curve text { font: 10px var(--font-sans); fill: var(--ink-muted); }
.mc-scr-wv-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.mc-scr-wv-list a { display: flex; align-items: center; gap: 8px; padding: 5px 4px; border-radius: var(--radius-sm); }
.mc-scr-wv-list a:hover { background: var(--surface-sunken); }
.mc-scr-wv-list a > span { margin-left: auto; color: var(--ink-subtle); font-size: 12px; }
.mc-scr-wv-list .critical { color: var(--status-critical); }
.mc-scr-wv-list .warn { color: var(--status-warn); }
.mc-scr-wv-query { display: grid; gap: 8px; }
.mc-scr-wv-query .more { color: var(--accent); font-size: 12px; }
.mc-scr-wv-map { display: grid; gap: 8px; }
.mc-scr-wv-map .thumb { position: relative; display: block; height: 120px; border-radius: 8px; border: 1px solid var(--line); background-color: var(--canvas); background-image: radial-gradient(var(--canvas-dot) 1px, transparent 1.2px); background-size: 8px 8px; overflow: hidden; }
.mc-scr-wv-map .thumb i { position: absolute; border-radius: 3px; background: var(--lc); opacity: .75; }
.mc-scr-wv.big .mc-scr-wv-map .thumb { height: 360px; }
.mc-scr-wv.big .mc-scr-wv-ring .donut { width: 200px; height: 200px; }
.mc-scr-wv.big .mc-scr-wv-ring .donut span { width: 120px; height: 120px; }
</style>
