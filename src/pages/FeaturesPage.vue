<script setup lang="ts">
import { featureDetails } from '../data/pages'

const f = Object.fromEntries(featureDetails.map((d) => [d.id, d])) as Record<string, (typeof featureDetails)[number]>
const meta = f['meta-modele']
const cartes = f['cartes']
const dash = f['tableaux-de-bord']
const interop = f['interoperabilite']
const bpmn = f['bpmn']

const systems = ['CMDB', 'ITSM', 'PPM', 'BI', 'SI Finances', 'Base de connaissances', 'LDAP']

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
    <header class="wrap page-head features-head">
      <div>
        <h1>5 fonctionnalités clés</h1>
        <p>Pour une urbanisation du SI maîtrisée, sans une ligne de code.</p>
      </div>
      <nav class="jump" aria-label="Aller à une fonctionnalité">
        <a v-for="d in featureDetails" :key="d.id" :href="`#${d.id}`">
          <img :src="`/brand/features/${d.icon}.svg`" alt="" width="56" height="56" />
          <span>{{ d.name }}</span>
        </a>
      </nav>
    </header>

    <!-- 1. Méta-modèle: navy, persona, quote -->
    <section :id="meta.id" class="feat feat--meta on-navy" aria-labelledby="t-meta">
      <div class="wrap meta">
        <div class="meta__text">
          <span class="feat__icon feat__icon--light"><img :src="`/brand/features/${meta.icon}.svg`" alt="" /></span>
          <h2 id="t-meta">{{ meta.name }}</h2>
          <p class="feat__why">{{ meta.why }}</p>
          <ul class="ticks ticks--light">
            <li v-for="p in meta.points" :key="p">{{ p }}</li>
          </ul>
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
          <img src="/brand/articles/pos.webp" alt="Plan d’urbanisme aux bâtiments surlignés en jaune" width="1200" height="688" />
        </figure>
        <div>
          <span class="feat__icon"><img :src="`/brand/features/${cartes.icon}.svg`" alt="" /></span>
          <h2 id="t-cartes">{{ cartes.name }}</h2>
          <p class="feat__why">{{ cartes.why }}</p>
          <ul class="ticks">
            <li v-for="p in cartes.points" :key="p">{{ p }}</li>
          </ul>
          <p class="feat__case"><strong>Exemple :</strong> {{ cartes.usecase }}</p>
        </div>
      </div>
    </section>

    <!-- 3. Tableaux de bord: cool grey, four big tiles and a persona -->
    <section :id="dash.id" class="feat ground-cool" aria-labelledby="t-dash">
      <div class="wrap">
        <div class="dash__head">
          <span class="feat__icon"><img :src="`/brand/features/${dash.icon}.svg`" alt="" /></span>
          <h2 id="t-dash">{{ dash.name }}</h2>
          <p class="feat__why">{{ dash.why }}</p>
        </div>
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

    <!-- 4. Interopérabilité: yellow, myCarto at the centre of the tools it connects -->
    <section :id="interop.id" class="feat feat--yellow" aria-labelledby="t-interop">
      <div class="wrap interop">
        <span class="feat__icon"><img :src="`/brand/features/${interop.icon}.svg`" alt="" /></span>
        <h2 id="t-interop">{{ interop.name }}</h2>
        <p class="feat__why">{{ interop.why }}</p>
        <div class="hub">
          <ul class="hub__ring" aria-label="Outils connectés">
            <li v-for="s in systems" :key="s">{{ s }}</li>
          </ul>
          <div class="hub__core">
            <img src="/brand/logo-mycarto.svg" alt="myCarto" width="164" height="50" />
            <span>API REST</span>
          </div>
        </div>
        <p class="feat__case"><strong>Exemple :</strong> {{ interop.usecase }}</p>
      </div>
    </section>

    <!-- 5. BPMN: white, the points drawn as a small process -->
    <section :id="bpmn.id" class="feat" aria-labelledby="t-bpmn">
      <div class="wrap bpmn">
        <div>
          <span class="feat__icon"><img :src="`/brand/features/${bpmn.icon}.svg`" alt="" /></span>
          <h2 id="t-bpmn">{{ bpmn.name }}</h2>
          <p class="feat__why">{{ bpmn.why }}</p>
          <p class="feat__case"><strong>Exemple :</strong> {{ bpmn.usecase }}</p>
        </div>
        <ol class="flow">
          <li class="flow__start" aria-hidden="true" />
          <li v-for="p in bpmn.points" :key="p" class="flow__task">{{ p }}</li>
          <li class="flow__end" aria-hidden="true" />
        </ol>
      </div>
    </section>
  </div>
</template>

<style scoped>
.features-head {
  display: grid;
  gap: var(--space-7);
}

.jump {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: var(--space-3);
}

.jump a {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border: 2px solid var(--line);
  border-radius: var(--radius-plate);
  color: var(--navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1.25;
  text-decoration: none;
  transition: border-color 0.2s var(--ease-out);
}

.jump a:hover {
  border-color: var(--navy);
}

.jump img {
  width: 3rem;
  height: 3rem;
}

/* Shared */
.feat {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 88svh;
  padding-block: var(--space-9);
}

.feat h2 {
  font-size: var(--fs-3xl);
  line-height: 1.04;
  letter-spacing: -0.02em;
  max-width: 14ch;
}

.feat__icon {
  display: inline-grid;
  place-items: center;
  width: 5.5rem;
  height: 5.5rem;
  margin-bottom: var(--space-5);
  border-radius: var(--radius-panel);
  background: var(--paper);
  border: var(--frame) solid var(--navy);
}

.feat__icon img {
  width: 3.75rem;
  height: 3.75rem;
}

.feat__icon--light {
  border-color: var(--paper);
}

.feat__why {
  margin-top: var(--space-4);
  font-size: var(--fs-xl);
  line-height: 1.3;
  max-width: 26ch;
}

.feat__case {
  margin-top: var(--space-6);
  font-size: var(--fs-m);
  max-width: 46ch;
}

.feat__case strong {
  font-family: var(--font-display);
}

.ticks {
  display: grid;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.ticks li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--fs-l);
  font-weight: 500;
  color: var(--navy);
}

.ticks li::before {
  content: '';
  width: 1.75rem;
  height: 1.75rem;
  flex: none;
  border-radius: 50%;
  background: var(--yellow)
    url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="m6.5 12.5 3.5 3.5 7.5-8" fill="none" stroke="%23262e6f" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>')
    center / 70% no-repeat;
}

.ticks--light li {
  color: var(--on-navy);
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

.feat--meta .feat__why {
  color: var(--on-navy-soft);
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
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
}

.cartes__visual img {
  width: 100%;
  height: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

/* 3. Tableaux de bord */
.dash__head {
  display: grid;
  justify-items: center;
  text-align: center;
}

.dash__head .feat__why {
  margin-inline: auto;
}

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
  justify-items: center;
  text-align: center;
}

.interop .feat__why {
  margin-inline: auto;
}

.hub {
  display: grid;
  justify-items: center;
  gap: var(--space-6);
  margin-top: var(--space-8);
}

.hub__core {
  order: -1;
  display: grid;
  justify-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-7);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.hub__core img {
  width: 11rem;
  height: auto;
}

.hub__core span {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
}

.hub__ring {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
  max-width: 52rem;
  padding-top: var(--space-6);
}

/* The link from myCarto down to the tools it feeds. */
.hub__ring::before {
  content: '';
  position: absolute;
  top: calc(-1 * var(--space-6));
  left: 50%;
  width: 4px;
  height: calc(var(--space-6) * 2);
  transform: translateX(-50%);
  border-radius: 2px;
  background: var(--navy);
}

.hub__ring li {
  padding: 0.85rem 1.4rem 0.75rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}

/* 5. BPMN */
.bpmn {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.flow {
  position: relative;
  display: grid;
  justify-items: center;
  gap: var(--space-5);
}

/* The sequence flow line behind the tasks */
.flow::before {
  content: '';
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 50%;
  width: 3px;
  transform: translateX(-50%);
  background: var(--navy);
}

.flow__start,
.flow__end {
  position: relative;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--navy);
}

.flow__end {
  border-width: 7px;
}

.flow__task {
  position: relative;
  width: min(100%, 26rem);
  padding: var(--space-4) var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-plate);
  background: var(--yellow);
  text-align: center;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  color: var(--navy);
}

@media (max-width: 1000px) {
  .jump {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .feat {
    min-height: 0;
    padding-block: var(--space-8);
  }

  .meta,
  .cartes,
  .dash,
  .bpmn {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }

  .meta__photo,
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
    max-width: 20rem;
  }
}

@media (max-width: 560px) {
  .jump {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .tiles {
    grid-template-columns: 1fr;
  }

  .tiles li {
    min-height: 0;
  }

  .ticks li,
  .hub__ring li {
    font-size: var(--fs-m);
  }

  .cartes__visual {
    padding: var(--space-4) var(--space-4) 0;
  }
}
</style>
