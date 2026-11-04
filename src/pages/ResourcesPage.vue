<script setup lang="ts">
// Articles et guides: the latest article in large, then every article with topic filters.
import { computed, ref } from 'vue'
import PageHero from '../components/ui/PageHero.vue'
import { articles, formatDate, topics, type Topic } from '../data/articles'

const [featured, ...rest] = articles
const filter = ref<Topic | 'all'>('all')

const chips = computed(() => [
  { id: 'all' as const, label: 'Tous', count: rest.length },
  ...topics.map((t) => ({ ...t, count: rest.filter((a) => a.topic === t.id).length })),
])
const shown = computed(() => (filter.value === 'all' ? rest : rest.filter((a) => a.topic === filter.value)))
const topicLabel = (id: Topic) => topics.find((t) => t.id === id)?.label
</script>

<template>
  <div>
    <PageHero :full="false">
      <template #title>Articles et guides</template>
      <template #lede>Pour piloter votre SI : méthode, réglementation, retours terrain.</template>
      <template #actions>
        <a class="btn btn--primary btn--lg" href="#tous">Parcourir les {{ articles.length }} articles</a>
      </template>
      <template #aside>
        <img
          class="hero-visual"
          src="/brand/resources/ressources.webp"
          alt="Un utilisateur de myCarto, un livre ouvert à la main"
          width="1100"
          height="1191"
        />
      </template>
    </PageHero>

    <section class="featured on-navy" aria-label="Le dernier article">
      <RouterLink class="wrap featured__link" :to="`/ressources/${featured.slug}`">
        <img :src="`/brand/articles/${featured.slug}.webp`" alt="" width="1200" height="700" />
        <span class="featured__body">
          <span class="featured__meta">Le dernier article · {{ formatDate(featured.date) }}</span>
          <span class="featured__title">{{ featured.title }}</span>
          <span class="featured__excerpt">{{ featured.excerpt }}</span>
          <span class="featured__go">Lire l’article, {{ featured.minutes }} min</span>
        </span>
      </RouterLink>
    </section>

    <section id="tous" class="section ground-cool" aria-labelledby="all-title">
      <div class="wrap">
        <div class="all__head">
          <h2 id="all-title">Tous les articles</h2>
          <div class="chips" role="group" aria-label="Filtrer par thème">
            <button
              v-for="c in chips"
              :key="c.id"
              type="button"
              class="chip"
              :aria-pressed="filter === c.id"
              @click="filter = c.id"
            >
              {{ c.label }} <span class="chip__count">{{ c.count }}</span>
            </button>
          </div>
        </div>
        <TransitionGroup tag="ul" name="cards" class="grid">
          <li v-for="a in shown" :key="a.slug">
            <RouterLink class="card" :to="`/ressources/${a.slug}`">
              <img :src="`/brand/articles/${a.slug}.webp`" alt="" width="1200" height="690" loading="lazy" />
              <span class="card__meta">{{ topicLabel(a.topic) }} · {{ a.minutes }} min</span>
              <span class="card__title">{{ a.title }}</span>
              <span class="card__excerpt">{{ a.excerpt }}</span>
            </RouterLink>
          </li>
        </TransitionGroup>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-visual {
  width: 100%;
  max-width: 26rem;
  height: auto;
  margin-inline: auto;
}

.featured {
  background: var(--navy);
  padding-block: var(--space-8);
}

.featured__link {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
  color: var(--on-navy);
  text-decoration: none;
}

.featured__link img {
  width: 100%;
  height: auto;
  aspect-ratio: 12 / 7;
  object-fit: cover;
  border: var(--frame) solid var(--on-navy);
  border-radius: var(--radius-panel);
}

.featured__body {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
}

.featured__meta {
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--on-navy-soft);
}

.featured__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-2xl);
  line-height: 1.08;
  text-wrap: balance;
}

.featured__excerpt {
  font-size: var(--fs-l);
  line-height: 1.45;
  color: var(--on-navy-soft);
}

.featured__go {
  margin-top: var(--space-3);
  font-family: var(--font-display);
  font-weight: 700;
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.3em;
}

.featured__link:hover .featured__title {
  color: var(--yellow);
}

.all__head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4) var(--space-6);
  margin-bottom: var(--space-7);
}

.all__head h2 {
  font-size: var(--fs-2xl);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.55rem 1.1rem 0.5rem;
  border: 2px solid var(--navy);
  border-radius: var(--radius-pill);
  background: transparent;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1;
  color: var(--navy);
  transition:
    background-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.chip:hover {
  background: var(--paper);
}

.chip[aria-pressed='true'] {
  background: var(--navy);
  color: var(--on-navy);
}

.chip__count {
  font-family: var(--font-text);
  font-weight: 600;
  opacity: 0.7;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-7) var(--space-5);
}

.card {
  display: grid;
  gap: var(--space-2);
  color: var(--text);
  text-decoration: none;
}

.card img {
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 10;
  object-fit: cover;
  border-radius: var(--radius-plate);
  margin-bottom: var(--space-2);
  transition: transform 0.35s var(--ease-out);
}

.card:hover img {
  transform: scale(1.02);
}

.card__meta {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-muted);
}

.card__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.2;
  color: var(--navy);
  text-wrap: balance;
}

.card:hover .card__title {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.15em;
}

.card__excerpt {
  font-size: var(--fs-s);
}

/* Filtering: the cards that stay slide to their new place, the new ones settle in. */
.cards-move {
  transition: transform 0.45s var(--ease-out);
}

.cards-enter-active {
  transition:
    opacity 0.3s var(--ease-out) 0.1s,
    transform 0.3s var(--ease-out) 0.1s;
}

.cards-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 1000px) {
  .hero-visual {
    max-width: 15rem;
  }

  .featured__link {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
