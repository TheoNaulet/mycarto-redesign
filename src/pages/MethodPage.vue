<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import MethodTrail from '../components/audiences/MethodTrail.vue'
import { frameworks, methodPhases, methodSteps } from '../data/audiences'

const byN = Object.fromEntries(methodSteps.map((s) => [s.n, s]))
const [cadrer, construire, faireVivre] = methodPhases.map((p) => ({ ...p, items: p.steps.map((n) => byN[n]) }))
</script>

<template>
  <div>
    <PageHero>
      <template #title><span class="nowrap">10 points</span> de passage pour cartographier votre SI</template>
      <template #lede>Tirés de plus de 200 implémentations, de l’objectif aux référentiels.</template>
      <template #actions>
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Demander une démo</RouterLink>
        <RouterLink class="btn btn--ghost btn--lg" to="/integration">Notre intégration</RouterLink>
      </template>
      <template #aside>
        <MethodTrail class="method-trail" :steps="methodSteps" />
      </template>
    </PageHero>

    <!-- 1. Cadrer: cool grey, the steps as a framed legend -->
    <section :id="cadrer.id" class="section ground-cool" aria-labelledby="t-cadrer">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="t-cadrer">{{ cadrer.name }}</h2>
          <p>{{ cadrer.line }}</p>
        </div>
        <ol class="legend">
          <li v-for="s in cadrer.items" :id="`etape-${s.n}`" :key="s.n" class="legend__row">
            <span class="num" aria-hidden="true">{{ s.n }}</span>
            <img :src="`/brand/method/${s.icon}.svg`" alt="" width="64" height="64" />
            <h3><span class="visually-hidden">Étape {{ s.n }} : </span>{{ s.name }}</h3>
            <p>{{ s.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 2. Construire: navy, three white tiles -->
    <section :id="construire.id" class="section phase-navy on-navy" aria-labelledby="t-construire">
      <div class="wrap">
        <div class="section-head phase-head">
          <h2 id="t-construire">{{ construire.name }}</h2>
          <p>{{ construire.line }}</p>
        </div>
        <ol class="tiles">
          <li v-for="s in construire.items" :id="`etape-${s.n}`" :key="s.n" class="tile">
            <span class="tile__top">
              <img :src="`/brand/method/${s.icon}.svg`" alt="" width="80" height="80" />
              <span class="num num--yellow" aria-hidden="true">{{ s.n }}</span>
            </span>
            <h3><span class="visually-hidden">Étape {{ s.n }} : </span>{{ s.name }}</h3>
            <p>{{ s.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- 3. Faire vivre: yellow, framed tiles and the frameworks it leans on -->
    <section :id="faireVivre.id" class="section phase-yellow" aria-labelledby="t-faire-vivre">
      <div class="wrap">
        <div class="section-head phase-head">
          <h2 id="t-faire-vivre">{{ faireVivre.name }}</h2>
          <p>{{ faireVivre.line }}</p>
        </div>
        <ol class="tiles tiles--framed">
          <li v-for="s in faireVivre.items" :id="`etape-${s.n}`" :key="s.n" class="tile">
            <span class="tile__top">
              <img :src="`/brand/method/${s.icon}.svg`" alt="" width="80" height="80" />
              <span class="num num--navy" aria-hidden="true">{{ s.n }}</span>
            </span>
            <h3><span class="visually-hidden">Étape {{ s.n }} : </span>{{ s.name }}</h3>
            <p>{{ s.line }}</p>
          </li>
        </ol>
        <div class="frameworks">
          <p>Les cadres sur lesquels s’appuyer</p>
          <ul>
            <li v-for="f in frameworks" :key="f">{{ f }}</li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.nowrap {
  white-space: nowrap;
}

/* The trail needs room to stay legible; on phones the steps below say it all. */
@media (max-width: 700px) {
  .method-trail {
    display: none;
  }
}

.num {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  border-radius: 50%;
  background: var(--yellow);
  color: var(--navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  line-height: 1;
  padding-top: 0.15em;
}

.num--navy {
  background: var(--navy);
  color: var(--on-navy);
}

/* 1. The legend: 3px navy frame, hairline rows of number, icon, name and line. */
.legend {
  margin: 0;
  padding: var(--space-2) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.legend__row {
  display: grid;
  grid-template-columns: auto 4rem minmax(12rem, 1fr) minmax(0, 1.3fr);
  gap: var(--space-5);
  align-items: center;
  padding-block: var(--space-4);
}

.legend__row + .legend__row {
  border-top: 1px solid var(--line);
}

.legend__row img {
  width: 4rem;
  height: 4rem;
}

.legend__row h3 {
  font-size: var(--fs-l);
  line-height: 1.2;
}

.legend__row p {
  font-size: var(--fs-s);
  line-height: 1.5;
}

/* 2 and 3. Tiles */
.phase-navy {
  background: var(--navy);
  padding-block: var(--space-9);
}

.phase-yellow {
  background: var(--yellow);
  color: var(--navy);
  padding-block: var(--space-9);
}

.phase-head {
  margin-inline: auto;
  text-align: center;
}

.phase-navy .phase-head p {
  color: var(--on-navy-soft);
}

.tiles {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
}

.tile {
  display: grid;
  align-content: start;
  gap: var(--space-3);
  padding: var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--paper);
  color: var(--text);
}

.tiles--framed .tile {
  border: var(--frame) solid var(--navy);
}

.tile__top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.tile img {
  width: 5rem;
  height: 5rem;
}

.tile h3 {
  font-size: var(--fs-xl);
  color: var(--navy);
}

.tile p {
  font-size: var(--fs-m);
  max-width: 32ch;
}

.frameworks {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-3) var(--space-5);
  margin-top: var(--space-7);
}

.frameworks p {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}

.frameworks ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.frameworks li {
  padding: 0.65rem 1.2rem 0.55rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
}

@media (max-width: 1100px) {
  .legend__row {
    grid-template-columns: auto 3.5rem minmax(0, 1fr);
    grid-template-areas:
      'num icon name'
      'num icon line';
    row-gap: var(--space-1);
    column-gap: var(--space-4);
  }

  .legend__row .num {
    grid-area: num;
  }

  .legend__row img {
    grid-area: icon;
    width: 3.5rem;
    height: 3.5rem;
  }

  .legend__row h3 {
    grid-area: name;
  }

  .legend__row p {
    grid-area: line;
  }
}

@media (max-width: 900px) {
  .tiles {
    grid-template-columns: 1fr;
    max-width: 34rem;
    margin-inline: auto;
  }

  .phase-navy,
  .phase-yellow {
    padding-block: var(--space-8);
  }
}

@media (max-width: 560px) {
  .legend {
    padding: var(--space-1) var(--space-4);
  }

  .legend__row {
    grid-template-columns: auto 3rem minmax(0, 1fr);
    column-gap: var(--space-3);
  }

  .legend__row .num {
    width: 2rem;
    height: 2rem;
    font-size: var(--fs-s);
  }

  .legend__row h3 {
    font-size: var(--fs-m);
  }

  .legend__row img {
    width: 3rem;
    height: 3rem;
  }

  .tile {
    padding: var(--space-5);
  }

  .tile img {
    width: 4rem;
    height: 4rem;
  }

  .frameworks {
    justify-content: flex-start;
  }
}
</style>
