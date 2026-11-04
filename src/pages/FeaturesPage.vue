<script setup lang="ts">
import { featureDetails } from '../data/pages'
</script>

<template>
  <div>
    <header class="wrap page-head features-head">
      <div>
        <h1>5 fonctionnalités clés</h1>
        <p>Pour une urbanisation du SI maîtrisée, sans une ligne de code.</p>
      </div>
      <nav class="jump" aria-label="Aller à une fonctionnalité">
        <a v-for="f in featureDetails" :key="f.id" :href="`#${f.id}`">
          <img :src="`/brand/features/${f.icon}.svg`" alt="" width="56" height="56" />
          <span>{{ f.name }}</span>
        </a>
      </nav>
    </header>

    <section
      v-for="(f, i) in featureDetails"
      :id="f.id"
      :key="f.id"
      class="feature"
      :class="{ 'ground-cool': i % 2 === 0 }"
      :aria-labelledby="`${f.id}-title`"
    >
      <div class="wrap feature__grid">
        <div class="feature__intro">
          <img :src="`/brand/features/${f.icon}.svg`" alt="" width="96" height="96" />
          <h2 :id="`${f.id}-title`">{{ f.name }}</h2>
          <p class="feature__why">{{ f.why }}</p>
          <p class="feature__case"><strong>Exemple :</strong> {{ f.usecase }}</p>
        </div>
        <div>
          <ul class="feature__points">
            <li v-for="p in f.points" :key="p">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
              {{ p }}
            </li>
          </ul>
          <figure v-if="f.quote" class="feature__quote">
            <blockquote>
              <p>« {{ f.quote.text }} »</p>
            </blockquote>
            <figcaption>
              <strong>{{ f.quote.name }}</strong>, {{ f.quote.role }}
            </figcaption>
          </figure>
        </div>
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

.feature {
  padding-block: var(--space-8);
  scroll-margin-top: 0;
}

.feature__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
  gap: var(--space-8);
  align-items: center;
}

.feature__intro img {
  width: 6rem;
  height: 6rem;
  margin-bottom: var(--space-4);
}

.feature__intro h2 {
  font-size: var(--fs-2xl);
  max-width: 16ch;
}

.feature__why {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 32ch;
}

.feature__case {
  margin-top: var(--space-5);
  font-size: var(--fs-s);
  max-width: 44ch;
}

.feature__case strong {
  color: var(--navy);
}

.feature__points {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
  padding: var(--space-2) var(--space-6);
}

.feature__points li {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding-block: var(--space-4);
  font-size: var(--fs-m);
  color: var(--navy);
  font-weight: 500;
}

.feature__points li + li {
  border-top: 1px solid var(--line);
}

.feature__points svg {
  width: 1.75rem;
  height: 1.75rem;
  flex: none;
  padding: 0.3rem;
  border-radius: 50%;
  background: var(--yellow);
  fill: none;
  stroke: var(--navy);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.feature__quote {
  margin-top: var(--space-5);
  padding-inline: var(--space-6);
}

.feature__quote p {
  font-family: var(--font-display);
  font-size: var(--fs-l);
  line-height: 1.35;
  color: var(--navy);
}

.feature__quote figcaption {
  margin-top: var(--space-2);
  font-size: var(--fs-s);
}

@media (max-width: 1000px) {
  .jump {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .feature__grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }
}

@media (max-width: 560px) {
  .jump {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature__points {
    padding: var(--space-1) var(--space-4);
  }

  .feature__quote {
    padding-inline: 0;
  }
}
</style>
