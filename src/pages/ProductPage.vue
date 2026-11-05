<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import KeyList from '../components/ui/KeyList.vue'
import LayersIllustration from '../components/product/LayersIllustration.vue'
import FaqList from '../components/product/FaqList.vue'
import { productFaq, productFeatures, starterKit, verbs, whyMap } from '../data/product'
import BaseButton from '../components/ui/BaseButton.vue'

const featureKeys = productFeatures.map((f) => ({
  name: f.name,
  line: f.line,
  icon: `/brand/features/${f.id}.svg`,
  to: `/fonctionnalites#${f.id}`,
}))
</script>

<template>
  <div>
    <PageHero title-id="product-title">
      <template #title>Le logiciel de cartographie du SI</template>
      <template #lede>Process, applications, flux, infrastructures, données : tout votre SI, couche par couche, dans un seul référentiel.</template>
      <template #actions>
        <BaseButton to="/demo" size="l">Demander une démo</BaseButton>
        <BaseButton to="/tarifs" variant="ghost" size="l">Voir les tarifs</BaseButton>
      </template>
      <template #aside>
        <figure class="layers-frame">
          <LayersIllustration />
        </figure>
      </template>
    </PageHero>

    <!-- Why: navy, the four reasons in a 2 × 2 grid -->
    <section class="section why on-navy" aria-labelledby="why-title">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="why-title">Pourquoi cartographier son SI ?</h2>
          <p>Pour voir tout ce qui le compose, et tout ce qui le relie.</p>
        </div>
        <ol class="why__grid">
          <li v-for="(w, i) in whyMap" :key="w.name">
            <span class="why__num" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
            <h3>{{ w.name }}</h3>
            <p>{{ w.line }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- The seven verbs: cool grey, framed tiles with their folded-map icons -->
    <section class="section verbs" aria-labelledby="verbs-title">
      <div class="wrap">
        <div class="section-head verbs__head">
          <h2 id="verbs-title">Sept façons de gouverner votre SI</h2>
          <p>Une seule carte, autant d’usages que d’acteurs.</p>
        </div>
        <ul class="verbs__grid">
          <li v-for="v in verbs" :key="v.id" class="verb">
            <img :src="`/brand/product/${v.id}.svg`" alt="" width="68" height="69" loading="lazy" />
            <h3>{{ v.name }}</h3>
            <p>{{ v.line }}</p>
          </li>
          <li class="verb verb--cta">
            <RouterLink to="/demo">
              <span>Les voir sur vos données</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- Starter kit: yellow, navy plates with the figures -->
    <section class="section kit" aria-labelledby="kit-title">
      <div class="wrap split kit__grid">
        <div class="section-head">
          <h2 id="kit-title">Ne partez pas de zéro</h2>
          <p>Votre plateforme arrive initialisée, avec vingt ans d’expertise en architecture d’entreprise.</p>
        </div>
        <ul class="kit__plates">
          <li v-for="k in starterKit" :key="k.unit">
            <span class="kit__figure">{{ k.figure }}</span>
            <span class="kit__unit">{{ k.unit }}</span>
            <span class="kit__line">{{ k.line }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- Under the hood: the five features as a framed key list, each row opening its section -->
    <section class="section" aria-labelledby="engine-title">
      <div class="wrap split">
        <div class="section-head">
          <h2 id="engine-title">Sous le capot</h2>
          <p>Cinq fonctionnalités clés, zéro ligne de code.</p>
          <RouterLink class="link-more engine__more" to="/fonctionnalites">Toutes les fonctionnalités</RouterLink>
        </div>
        <KeyList :items="featureKeys" />
      </div>
    </section>

    <!-- FAQ: cool grey, their FAQ persona beside the questions -->
    <section class="section ground-cool" aria-labelledby="faq-title">
      <div class="wrap faq-grid">
        <div class="faq-grid__head">
          <img src="/brand/product/faq.webp" alt="" width="1100" height="1100" loading="lazy" />
          <h2 id="faq-title">Vos questions sur myCarto</h2>
          <p>Et la réponse, en deux lignes.</p>
          <RouterLink class="link-more" to="/faq">Toutes les questions</RouterLink>
        </div>
        <FaqList :items="productFaq" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Hero visual */
.layers-frame {
  margin: 0;
  padding: var(--space-6) var(--space-7) var(--space-6) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper-cool);
}

.layers-frame :deep(svg) {
  max-height: calc(100dvh - 15rem);
  margin-inline: auto;
}

/* Why */
.why {
  background: var(--navy);
}

.why .section-head p {
  color: var(--on-navy-soft);
}

.why__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-7) var(--space-6);
}

.why__grid li {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding-top: var(--space-5);
  border-top: 1px solid var(--on-navy-line);
}

.why__num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1;
  color: var(--yellow);
}

.why__grid h3 {
  margin-top: var(--space-2);
  font-size: var(--fs-xl);
}

.why__grid p {
  font-size: var(--fs-m);
  color: var(--on-navy-soft);
  max-width: 34ch;
}

/* Verbs */
.verbs {
  background: var(--paper-cool);
}

.verbs__head {
  margin-inline: auto;
  text-align: center;
}

.verbs__head p {
  margin-inline: auto;
}

.verbs__grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-4);
}

.verb {
  display: grid;
  align-content: start;
  gap: var(--space-2);
  padding: var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.verb img {
  width: 4rem;
  height: 4rem;
  margin-bottom: var(--space-3);
}

.verb h3 {
  font-size: var(--fs-xl);
}

.verb p {
  font-size: var(--fs-s);
  line-height: 1.5;
}

.verb--cta {
  padding: 0;
  background: var(--yellow);
}

.verb--cta a {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-5);
  height: 100%;
  padding: var(--space-5);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.15;
  color: var(--navy);
  text-decoration: none;
}

.verb--cta svg {
  align-self: flex-end;
  width: 3rem;
  height: 3rem;
  padding: 0.6rem;
  border-radius: 50%;
  background: var(--navy);
  fill: none;
  stroke: var(--yellow);
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

.verb--cta a:hover svg {
  transform: translateX(4px);
}

.verb--cta a:hover span {
  text-decoration: underline;
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

/* Starter kit */
.kit {
  background: var(--yellow);
}

.kit__grid {
  align-items: center;
}

.kit .section-head p {
  color: var(--navy);
}

.kit__plates {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
}

.kit__plates li {
  display: grid;
  align-content: start;
  padding: var(--space-5) var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--navy);
  color: var(--on-navy);
}

.kit__figure {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(3rem, 2rem + 3vw, 5rem);
  line-height: 1;
  letter-spacing: -0.03em;
  color: var(--yellow);
}

.kit__unit {
  margin-top: var(--space-2);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.15;
}

.kit__line {
  margin-top: var(--space-1);
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

/* Under the hood */
.engine__more {
  margin-top: var(--space-5);
  color: var(--navy);
}

/* FAQ */
.faq-grid {
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(0, 1.6fr);
  gap: var(--space-7);
  align-items: start;
}

.faq-grid__head {
  display: grid;
  justify-items: start;
  gap: var(--space-4);
}

.faq-grid__head img {
  width: 100%;
  max-width: 17rem;
  height: auto;
}

.faq-grid__head h2 {
  font-size: var(--fs-2xl);
}

.faq-grid__head p {
  font-size: var(--fs-l);
  line-height: 1.45;
}

.faq-grid__head .link-more {
  color: var(--navy);
}

@media (--bp-l) {
  .verbs__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .faq-grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .faq-grid__head img {
    max-width: 12rem;
  }
}

@media (--bp-s) {
  .why__grid,
  .kit__plates {
    grid-template-columns: 1fr;
  }

  .why__grid {
    gap: var(--space-5);
  }

  .verbs__grid {
    grid-template-columns: 1fr;
  }

  .verb {
    grid-template-columns: 3.25rem minmax(0, 1fr);
    column-gap: var(--space-4);
    padding: var(--space-4);
  }

  .verb img {
    grid-row: span 2;
    width: 3.25rem;
    height: 3.25rem;
    margin: 0;
  }

  .verb--cta {
    display: block;
    padding: 0;
  }

  .verb--cta a {
    flex-direction: row;
    align-items: center;
    padding: var(--space-4);
    font-size: var(--fs-l);
  }

  .verb--cta svg {
    align-self: center;
    flex: none;
  }

  .layers-frame {
    padding: var(--space-4) var(--space-5) var(--space-4) var(--space-4);
  }
}
</style>
