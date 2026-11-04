<script setup lang="ts">
import { articles, formatDate, nis2Body } from '../data/pages'

const article = articles[0]
</script>

<template>
  <article class="article">
    <header class="wrap article__head">
      <RouterLink class="back" to="/ressources">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>
        Tous les articles
      </RouterLink>
      <time :datetime="article.date">{{ formatDate(article.date) }}</time>
      <h1>{{ article.title }}</h1>
    </header>

    <div class="wrap">
      <img class="article__cover" :src="`/brand/articles/${article.image}.webp`" alt="" width="1200" height="700" />
    </div>

    <div class="wrap article__body">
      <template v-for="(b, i) in nis2Body" :key="i">
        <p v-if="b.type === 'p'" :class="{ lead: i === 0 }">{{ b.text }}</p>
        <h2 v-else-if="b.type === 'h2'">{{ b.text }}</h2>
        <h3 v-else-if="b.type === 'h3'">{{ b.text }}</h3>
        <ul v-else>
          <li v-for="item in b.items" :key="item">{{ item }}</li>
        </ul>
      </template>
      <p class="source">
        Article publié sur <a :href="article.href">my-carto.com</a>, légèrement raccourci pour cette maquette.
      </p>
    </div>
  </article>
</template>

<style scoped>
.article {
  padding-bottom: var(--space-9);
}

.article__head {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  padding-block: var(--space-7) var(--space-6);
}

.back {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  font-weight: 600;
  font-size: var(--fs-s);
  color: var(--navy);
  text-decoration: none;
}

.back:hover {
  text-decoration: underline;
}

.back svg {
  width: 1.2rem;
  height: 1.2rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

time {
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--text-muted);
}

.article__head h1 {
  font-size: var(--fs-3xl);
  line-height: 1.04;
  letter-spacing: -0.02em;
  max-width: 20ch;
}

.article__cover {
  width: 100%;
  height: auto;
  max-height: 34rem;
  object-fit: cover;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.article__body {
  max-width: 52rem;
  padding-top: var(--space-7);
}

.article__body p,
.article__body li {
  font-size: var(--fs-l);
  line-height: 1.7;
}

.article__body p + p {
  margin-top: var(--space-4);
}

.article__body .lead {
  font-size: var(--fs-xl);
  line-height: 1.6;
  color: var(--navy);
}

.article__body h2 {
  font-size: var(--fs-2xl);
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}

.article__body h3 {
  font-size: var(--fs-xl);
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
}

.article__body ul {
  display: grid;
  gap: var(--space-3);
  margin-block: var(--space-4);
}

.article__body li {
  display: flex;
  gap: var(--space-3);
}

.article__body li::before {
  content: '';
  flex: none;
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.7em;
  border-radius: 2px;
  background: var(--yellow);
  box-shadow: 0 0 0 2px var(--navy);
}

.source {
  margin-top: var(--space-8) !important;
  padding-top: var(--space-5);
  border-top: 1px solid var(--line);
  font-size: var(--fs-s) !important;
  color: var(--text-muted);
}
</style>
