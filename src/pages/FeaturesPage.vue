<script setup lang="ts">
import { featureDetails } from '../data/pages'
import { ref } from 'vue'
import MapIllustration from '../components/MapIllustration.vue'
import FeatureIntro from '../components/product/FeatureIntro.vue'
import InteropHub from '../components/product/InteropHub.vue'
import TickList from '../components/ui/TickList.vue'
import { prefersReduced, vDraw } from '../motion/draw'
import BaseButton from '../components/ui/BaseButton.vue'

const f = Object.fromEntries(featureDetails.map((d) => [d.id, d])) as Record<string, (typeof featureDetails)[number]>
const meta = f['meta-modele']
const cartes = f['cartes']
const dash = f['tableaux-de-bord']
const interop = f['interoperabilite']
const bpmn = f['bpmn']

/**
 * A BPMN token runs the example process once when the diagram comes into view, lighting each task
 * and the server it runs on as it passes. "Suivre une commande" runs it again.
 */
const diagram = ref<HTMLElement | null>(null)

function runToken() {
  const root = diagram.value
  if (!root || prefersReduced()) return
  root.classList.remove('is-running')
  void root.getBoundingClientRect()
  root.classList.add('is-running')
  root.querySelector<SVGAnimationElement>('#bpmn-token')?.beginElement()
}

// One small drawn pictogram per dashboard point, in the navy and yellow of their icon set.
const dashIcons = [
  // library of dashboards
  '<rect x="6" y="8" width="7" height="32" rx="2"/><rect x="16" y="8" width="7" height="32" rx="2"/><path class="y" d="m27 12 6.5-1.7 7.8 29-6.5 1.7z"/>',
  // clickable chart
  '<path d="M7 40V8M7 40h34"/><rect class="y" x="13" y="24" width="6" height="16"/><rect x="23" y="16" width="6" height="24"/><path class="y" d="m32 26 9 3.5-4 1.5 4 4-2 2-4-4-1.5 4z"/>',
  // query designer
  '<path d="M7 9h34l-13 15v12l-8 4V24z"/><circle class="y" cx="37" cy="37" r="5"/>',
  // unlimited
  '<path d="M24 24c-4-5-7-8-11-8a8 8 0 0 0 0 16c4 0 7-3 11-8s7-8 11-8a8 8 0 0 1 0 16c-4 0-7-3-11-8z"/>',
]
</script>

<template>
  <div>
    <header class="features-head">
      <div class="wrap features-head__grid">
        <div>
          <h1><span class="nowrap">5 fonctionnalités</span> clés</h1>
          <p>Pour une urbanisation du SI maîtrisée, sans une ligne de code.</p>
          <div class="features-head__actions">
            <BaseButton to="/demo" size="l">Les voir en démo</BaseButton>
          </div>
        </div>
        <nav class="jump" aria-label="Aller à une fonctionnalité">
          <a v-for="d in featureDetails" :key="d.id" :href="`#${d.id}`">
            <img :src="`/brand/features/${d.icon}.svg`" alt="" width="56" height="56" />
            <span class="jump__name">{{ d.name }}</span>
            <span class="jump__why">{{ d.why }}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
          </a>
        </nav>
      </div>
    </header>

    <!-- 1. Méta-modèle: navy, persona, quote -->
    <section :id="meta.id" class="feat feat--meta on-navy" aria-labelledby="t-meta">
      <div class="wrap meta">
        <div class="meta__text">
          <FeatureIntro :icon="meta.icon" :title="meta.name" title-id="t-meta" :why="meta.why" ground="navy" />
          <TickList class="feat__ticks" :items="meta.points" ground="navy" />
        </div>
        <img class="meta__photo" src="/brand/photos/dsi-manager-it.webp" alt="" width="512" height="512" />
      </div>
      <figure v-if="meta.quote" class="wrap meta__quote">
        <blockquote>
          <p>« {{ meta.quote.text }} »</p>
        </blockquote>
        <figcaption>{{ meta.quote.name }}, {{ meta.quote.role }}</figcaption>
      </figure>
    </section>

    <!-- 2. Cartes: white, illustration in a yellow frame on the left -->
    <section :id="cartes.id" class="feat" aria-labelledby="t-cartes">
      <div class="wrap cartes">
        <figure class="cartes__visual">
          <MapIllustration />
        </figure>
        <div>
          <FeatureIntro :icon="cartes.icon" :title="cartes.name" title-id="t-cartes" :why="cartes.why" />
          <TickList class="feat__ticks" :items="cartes.points" />
          <p class="feat__case"><strong>Exemple :</strong> {{ cartes.usecase }}</p>
        </div>
      </div>
    </section>

    <!-- 3. Tableaux de bord: cool grey, four big tiles and a persona -->
    <section :id="dash.id" class="feat ground-cool" aria-labelledby="t-dash">
      <div class="wrap">
        <FeatureIntro :icon="dash.icon" :title="dash.name" title-id="t-dash" :why="dash.why" align="center" />
        <div class="dash">
          <ul class="tiles">
            <li v-for="(p, i) in dash.points" :key="p">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <svg viewBox="0 0 48 48" aria-hidden="true" v-html="dashIcons[i]" />
              {{ p }}
            </li>
          </ul>
          <img class="dash__photo" src="/brand/photos/manager-infrastructure.webp" alt="" width="512" height="513" />
        </div>
        <p class="feat__case dash__case"><strong>Exemple :</strong> {{ dash.usecase }}</p>
      </div>
    </section>

    <!-- 4. Interopérabilité: yellow, myCarto at the hub of the tools it connects -->
    <section :id="interop.id" class="feat feat--yellow" aria-labelledby="t-interop">
      <div class="wrap interop">
        <div>
          <FeatureIntro :icon="interop.icon" :title="interop.name" title-id="t-interop" :why="interop.why" />
          <TickList class="feat__ticks" :items="interop.points" ground="yellow" />
        </div>
        <InteropHub />
      </div>
    </section>

    <!-- 5. BPMN: a real BPMN diagram across three lanes -->
    <section :id="bpmn.id" class="feat" aria-labelledby="t-bpmn">
      <div class="wrap bpmn">
        <FeatureIntro :icon="bpmn.icon" :title="bpmn.name" title-id="t-bpmn" :why="bpmn.why" align="center" />

        <figure ref="diagram" v-draw="runToken" class="diagram">
          <div class="diagram__scroll">
            <svg viewBox="0 0 1000 390" role="img" aria-labelledby="bpmn-desc">
              <desc id="bpmn-desc">
                Exemple de processus Commande client sur trois couloirs. Métier : recevoir la commande, puis l’orienter selon que
                le client est connu ou nouveau. Application : créer la fiche dans le CRM, puis facturer dans l’ERP.
                Infrastructure : le CRM tourne sur le Cloud EU, l’ERP sur le serveur srv-app-01.
              </desc>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 10 5 0 10z" fill="#262e6f" />
                </marker>
              </defs>
              <!-- lanes -->
              <g class="lanes">
                <rect x="0" y="0" width="1000" height="390" rx="14" class="lanes__frame" />
                <rect x="0" y="0" width="120" height="390" class="lanes__labels" />
                <line x1="0" y1="130" x2="1000" y2="130" />
                <line x1="0" y1="260" x2="1000" y2="260" />
                <line x1="120" y1="0" x2="120" y2="390" />
                <text x="60" y="70">Métier</text>
                <text x="60" y="200">Application</text>
                <text x="60" y="330">Infrastructure</text>
              </g>
              <!-- sequence flows -->
              <g class="flows">
                <path d="M198 65H214" marker-end="url(#arrow)" />
                <path d="M412 65H442" marker-end="url(#arrow)" />
                <path d="M470 93V195H518" marker-end="url(#arrow)" />
                <path d="M498 65H815V163" marker-end="url(#arrow)" />
                <path d="M690 195H738" marker-end="url(#arrow)" />
                <path d="M890 195H940V87" marker-end="url(#arrow)" />
              </g>
              <g class="flow-labels">
                <text x="478" y="150">Nouveau</text>
                <text x="640" y="56">Connu</text>
              </g>
              <!-- the token runs on the flows, behind the tasks it goes through; started by runToken() -->
              <circle class="token" r="10" aria-hidden="true">
                <animateMotion
                  id="bpmn-token"
                  begin="indefinite"
                  dur="3.4s"
                  fill="freeze"
                  path="M180 65H470V195H940V65"
                />
              </circle>
              <!-- associations to infrastructure -->
              <g class="assoc">
                <path d="M605 225V292" />
                <path d="M815 225V292" />
              </g>
              <!-- events -->
              <circle class="ev-start" cx="180" cy="65" r="18" />
              <circle class="ev-end" cx="940" cy="65" r="18" />
              <!-- tasks -->
              <g class="task task--receive">
                <rect x="216" y="35" width="196" height="60" rx="10" />
                <text x="314" y="70">Recevoir la commande</text>
              </g>
              <g class="gateway">
                <path d="M470 37 498 65 470 93 442 65z" />
                <path class="gateway__x" d="M461 56 479 74M479 56 461 74" />
              </g>
              <g class="task task--crm">
                <rect x="520" y="165" width="170" height="60" rx="10" />
                <text x="605" y="192">CRM Ventes</text>
                <text x="605" y="212" class="task__sub">créer la fiche</text>
              </g>
              <g class="task task--erp">
                <rect x="740" y="165" width="150" height="60" rx="10" />
                <text x="815" y="192">ERP Finance</text>
                <text x="815" y="212" class="task__sub">facturer</text>
              </g>
              <!-- systems -->
              <g class="system system--cloud">
                <path d="M555 300a50 10 0 0 1 100 0v40a50 10 0 0 1-100 0z" />
                <path d="M555 300a50 10 0 0 0 100 0" />
                <text x="605" y="336">Cloud EU</text>
              </g>
              <g class="system system--srv">
                <path d="M765 300a50 10 0 0 1 100 0v40a50 10 0 0 1-100 0z" />
                <path d="M765 300a50 10 0 0 0 100 0" />
                <text x="815" y="336">srv-app-01</text>
              </g>
            </svg>
          </div>
          <figcaption>
            Exemple de processus fictif : une commande client, du métier au serveur.
            <button type="button" class="replay" @click="runToken">Suivre une commande</button>
          </figcaption>
        </figure>

        <ul class="bpmn__points">
          <li v-for="p in bpmn.points" :key="p">{{ p }}</li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
.features-head {
  display: flex;
  align-items: center;
  min-height: calc(100dvh - 6.8rem);
  padding-block: var(--space-7);
}

.features-head > .wrap {
  width: min(100% - 2 * var(--gutter), var(--max));
}

.features-head__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.2fr);
  gap: var(--space-8);
  align-items: center;
}

.features-head h1 {
  font-size: clamp(2.1rem, 0.9rem + 3.6vw, 4.1rem);
  line-height: 1.02;
  letter-spacing: -0.025em;
}

.nowrap {
  white-space: nowrap;
}

.features-head p {
  margin-top: var(--space-5);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 28ch;
}

.features-head__actions {
  margin-top: var(--space-6);
}

/* The five features as a framed key list, each row jumping to its section. */
.jump {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-2) var(--space-5);
}

.jump a {
  display: grid;
  grid-template-columns: 3.5rem minmax(0, 1fr) auto;
  grid-template-areas:
    'icon name arrow'
    'icon why arrow';
  column-gap: var(--space-4);
  align-items: center;
  padding-block: var(--space-4);
  color: var(--navy);
  text-decoration: none;
}

.jump a + a {
  border-top: 1px solid var(--line);
}

.jump img {
  grid-area: icon;
  width: 3.5rem;
  height: 3.5rem;
}

.jump__name {
  grid-area: name;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.2;
}

.jump__why {
  grid-area: why;
  font-size: var(--fs-s);
  color: var(--text);
}

.jump svg {
  grid-area: arrow;
  width: 1.4rem;
  height: 1.4rem;
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

.jump a:hover .jump__name {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

.jump a:hover svg {
  transform: translateY(3px);
}

/* Shared */
.feat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 88svh;
  padding-block: var(--space-9);
}

.feat__ticks {
  margin-top: var(--space-6);
}

.feat__case {
  margin-top: var(--space-6);
  font-size: var(--fs-m);
  max-width: 46ch;
}

.feat__case strong {
  font-family: var(--font-display);
}

/* 1. Méta-modèle */
.feat--meta {
  background: var(--navy);
}

.meta {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.meta__photo {
  width: 100%;
  max-width: 32rem;
  height: auto;
  justify-self: center;
}

.meta__quote {
  margin-top: var(--space-8);
  padding-top: var(--space-7);
  border-top: 1px solid var(--on-navy-line);
}

.meta__quote p {
  font-family: var(--font-display);
  font-size: var(--fs-2xl);
  line-height: 1.15;
  color: var(--yellow);
  max-width: 30ch;
}

.meta__quote figcaption {
  margin-top: var(--space-4);
  color: var(--on-navy-soft);
}

/* 2. Cartes */
.cartes {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.cartes__visual {
  margin: 0;
  padding: var(--space-7);
  border-radius: var(--radius-panel);
  background: var(--yellow);
}

/* 3. Tableaux de bord */
.dash {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
  margin-top: var(--space-8);
}

.tiles {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.tiles li {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-5);
  min-height: 10rem;
  padding: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.25;
  color: var(--navy);
}

.tiles svg {
  width: 3rem;
  height: 3rem;
  fill: none;
  stroke: var(--navy);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.tiles svg :deep(.y) {
  fill: var(--yellow);
}

.dash__photo {
  width: 100%;
  max-width: 26rem;
  height: auto;
  justify-self: center;
}

.dash__case {
  margin-inline: auto;
  text-align: center;
}

/* 4. Interopérabilité */
.feat--yellow {
  background: var(--yellow);
  color: var(--navy);
}

.interop {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: var(--space-8);
  align-items: center;
}

/* 5. BPMN */
.diagram {
  margin: var(--space-8) 0 0;
}

.diagram__scroll {
  overflow-x: auto;
}

.diagram svg {
  display: block;
  width: 100%;
  min-width: 44rem;
  height: auto;
  font-family: var(--font-display);
}

.lanes__frame {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 3;
}

.lanes__labels {
  fill: var(--paper-cool);
}

.lanes line {
  stroke: var(--line-strong);
  stroke-width: 1.5;
}

.lanes text {
  fill: var(--navy);
  font-weight: 700;
  font-size: 15px;
  text-anchor: middle;
}

.flows path {
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.5;
}

.flow-labels text {
  fill: var(--text-muted);
  font-family: var(--font-text);
  font-size: 14px;
}

.assoc path {
  fill: none;
  stroke: var(--navy);
  stroke-width: 2;
  stroke-dasharray: 5 5;
}

.ev-start {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 3;
}

.ev-end {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 7;
}

.task rect {
  fill: var(--paper);
  stroke: var(--navy);
  stroke-width: 3;
}

.task text,
.system text {
  fill: var(--navy);
  font-weight: 700;
  font-size: 16px;
  text-anchor: middle;
}

.task .task__sub {
  font-family: var(--font-text);
  font-weight: 400;
  font-size: 14px;
}

.gateway path:first-child {
  fill: var(--yellow);
  stroke: var(--navy);
  stroke-width: 3;
}

.gateway__x {
  fill: none;
  stroke: var(--navy);
  stroke-width: 3;
  stroke-linecap: round;
}

.system path {
  fill: var(--yellow-soft);
  stroke: var(--navy);
  stroke-width: 2.5;
}

.system path:nth-child(2) {
  fill: none;
}

.system text {
  font-size: 14px;
}

.diagram figcaption {
  margin-top: var(--space-3);
  font-size: var(--fs-s);
  color: var(--text-muted);
  text-align: center;
}

.replay {
  margin-left: var(--space-3);
  padding: 0;
  border: 0;
  background: none;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--navy);
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.3em;
}

.replay:hover {
  text-decoration-color: currentColor;
}

/* The token and what it lights up on its way: timings follow its 3.4s run along the flow. */
.token {
  fill: var(--yellow);
  stroke: var(--navy);
  stroke-width: 3;
  opacity: 0;
}

.is-running .token {
  animation: token 3.5s linear;
}

@keyframes token {
  0%,
  100% {
    opacity: 0;
  }

  3%,
  95% {
    opacity: 1;
  }
}

.is-running .task--receive rect {
  animation: lit 0.8s linear 0.05s;
}

.is-running .task--crm rect {
  animation: lit 0.7s linear 1.5s;
}

.is-running .system--cloud path:first-child {
  animation: lit-server 0.7s linear 1.5s;
}

.is-running .task--erp rect {
  animation: lit 0.65s linear 2.22s;
}

.is-running .system--srv path:first-child {
  animation: lit-server 0.65s linear 2.22s;
}

.is-running .ev-end {
  animation: lit 1.2s linear 3.3s;
}

@keyframes lit {
  0%,
  100% {
    fill: var(--paper);
  }

  20%,
  75% {
    fill: var(--yellow);
  }
}

@keyframes lit-server {
  0%,
  100% {
    fill: var(--yellow-soft);
  }

  20%,
  75% {
    fill: var(--yellow);
  }
}

@media (prefers-reduced-motion: reduce) {
  .replay {
    display: none;
  }
}

.bpmn__points {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-5);
  margin-top: var(--space-7);
}

.bpmn__points li {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  justify-items: start;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  line-height: 1.3;
  color: var(--navy);
}

.bpmn__points li::before {
  content: '';
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  background: var(--yellow)
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" fill="none" stroke="%23262e6f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    center / 70% no-repeat;
}

@media (--bp-l) {
  .bpmn__points {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .features-head {
    min-height: 0;
  }

  .features-head__grid {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .feat {
    min-height: 0;
    padding-block: var(--space-8);
  }

  .meta,
  .cartes,
  .dash,
  .interop {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .meta__photo,
  .dash__photo {
    max-width: 20rem;
  }
}

@media (--bp-xs) {
  .jump {
    padding: var(--space-1) var(--space-4);
  }

  .jump a {
    grid-template-columns: 2.75rem minmax(0, 1fr) auto;
  }

  .jump img {
    width: 2.75rem;
    height: 2.75rem;
  }

  .tiles {
    grid-template-columns: 1fr;
  }

  .tiles li {
    min-height: 0;
  }

  .bpmn__points {
    grid-template-columns: 1fr;
  }

  .cartes__visual {
    padding: var(--space-4) var(--space-4) 0;
  }
}
</style>
