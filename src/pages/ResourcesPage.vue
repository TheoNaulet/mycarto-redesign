<script setup lang="ts">
import { articles, formatDate } from '../data/pages'

const [featured, ...rest] = articles
</script>

<template>
  <div>
    <header class="wrap page-head">
      <h1>Articles et guides</h1>
      <p>Pour piloter votre SI : méthode, réglementation, retours terrain.</p>
    </header>

    <section class="wrap featured" aria-label="À la une">
      <RouterLink class="featured__link" to="/ressources/nis2">
        <img :src="`/brand/articles/${featured.image}.webp`" alt="" width="1200" height="700" />
        <span class="featured__body">
          <time :datetime="featured.date">{{ formatDate(featured.date) }}</time>
          <span class="featured__title">{{ featured.title }}</span>
          <span class="featured__excerpt">{{ featured.excerpt }}</span>
          <span class="link-more">Lire l’article</span>
        </span>
      </RouterLink>
    </section>

    <section class="section ground-cool more" aria-labelledby="more-title">
      <div class="wrap">
        <h2 id="more-title" class="more__title">Tous les articles</h2>
        <ul class="grid">
          <li v-for="a in rest" :key="a.slug">
            <a class="card" :href="a.href">
              <img :src="`/brand/articles/${a.image}.webp`" alt="" width="1200" height="690" loading="lazy" />
              <time :datetime="a.date">{{ formatDate(a.date) }}</time>
              <span class="card__title">{{ a.title }}</span>
              <span class="card__excerpt">{{ a.excerpt }}</span>
            </a>
          </li>
        </ul>
        <p class="more__note">Ces articles s’ouvrent sur my-carto.com.</p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.featured {
  padding-bottom: var(--space-8);
}

.featured__link {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
  color: var(--text);
  text-decoration: none;
}

.featured__link img {
  width: 100%;
  height: auto;
  aspect-ratio: 12 / 7;
  object-fit: cover;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.featured__body {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
}

time {
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--text-muted);
}

.featured__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-2xl);
  line-height: 1.08;
  color: var(--navy);
  text-wrap: balance;
}

.featured__excerpt {
  font-size: var(--fs-l);
  line-height: 1.45;
}

.featured__link:hover .featured__title {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.15em;
}

.more__title {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-6);
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

.more__note {
  margin-top: var(--space-7);
  font-size: var(--fs-s);
  color: var(--text-muted);
}

@media (max-width: 1000px) {
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
