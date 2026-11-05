<script setup lang="ts">
// One article: the body is loaded on demand (articles.ts), with a table of contents that follows the reading.
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { articles, formatDate, loadBody, topics, type Block } from '../data/articles'
import { setPageTitle, showNotFound } from '../router'
import BaseBadge from '../components/ui/BaseBadge.vue'

const route = useRoute()

const slug = computed(() => String(route.params.slug))
const article = computed(() => articles.find((a) => a.slug === slug.value))
const topic = computed(() => topics.find((t) => t.id === article.value?.topic))
const blocks = ref<Block[]>([])
const activeId = ref('')

/** Same topic first, then the most recent others, three in all. */
const related = computed(() => {
  const a = article.value
  if (!a) return []
  const others = articles.filter((x) => x.slug !== a.slug)
  return [...others.filter((x) => x.topic === a.topic), ...others.filter((x) => x.topic !== a.topic)].slice(0, 3)
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

const toc = computed(() =>
  blocks.value.flatMap((b) => (b.type === 'h2' ? [{ id: slugify(b.text), text: b.text }] : [])),
)

let observer: IntersectionObserver | null = null

function watchHeadings() {
  observer?.disconnect()
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)
      if (visible[0]) activeId.value = visible[0].target.id
    },
    { rootMargin: '0px 0px -70% 0px' },
  )
  toc.value.forEach((t) => {
    const el = document.getElementById(t.id)
    if (el) observer!.observe(el)
  })
}

watch(
  slug,
  async () => {
    const a = article.value
    if (!a) {
      showNotFound(route.path)
      return
    }
    setPageTitle(a.title)
    blocks.value = []
    activeId.value = ''
    blocks.value = (await loadBody(a.slug)) ?? []
    await nextTick()
    watchHeadings()
  },
  { immediate: true },
)

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div v-if="article">
    <article class="article">
      <header class="wrap article__head">
        <RouterLink class="back" to="/ressources">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" /></svg>
          Tous les articles
        </RouterLink>
        <p class="meta">
          <BaseBadge v-if="topic" size="s">{{ topic.label }}</BaseBadge>
          <time :datetime="article.date">{{ formatDate(article.date) }}</time>
          <span aria-hidden="true">·</span>
          <span>{{ article.minutes }} min de lecture</span>
        </p>
        <h1>{{ article.title }}</h1>
        <p class="article__excerpt">{{ article.excerpt }}</p>
      </header>

      <div class="wrap">
        <img
          class="article__cover"
          :src="`/brand/articles/${article.slug}.webp`"
          alt=""
          width="1200"
          height="700"
        />
      </div>

      <div class="wrap article__layout" :class="{ 'article__layout--toc': toc.length > 2 }">
        <nav v-if="toc.length > 2" class="toc" aria-labelledby="toc-title">
          <h2 id="toc-title">Sommaire</h2>
          <ol>
            <li v-for="t in toc" :key="t.id">
              <a :href="`#${t.id}`" :class="{ 'is-active': activeId === t.id }" :aria-current="activeId === t.id ? 'true' : undefined">
                {{ t.text }}
              </a>
            </li>
          </ol>
        </nav>

        <div class="article__body" aria-live="polite">
          <template v-for="(b, i) in blocks" :key="i">
            <p v-if="b.type === 'p'" :class="{ lead: i === 0 }">{{ b.text }}</p>
            <h2 v-else-if="b.type === 'h2'" :id="slugify(b.text)">{{ b.text }}</h2>
            <h3 v-else-if="b.type === 'h3'">{{ b.text }}</h3>
            <ul v-else-if="b.type === 'ul'">
              <li v-for="item in b.items" :key="item">{{ item }}</li>
            </ul>
            <ol v-else-if="b.type === 'ol'">
              <li v-for="item in b.items" :key="item">{{ item }}</li>
            </ol>
            <p v-else-if="b.type === 'link'">
              <a class="link-more" :href="b.href" rel="noopener">{{ b.text }}</a>
            </p>
          </template>
          <p v-if="blocks.length" class="source">
            Article publié sur <a :href="article.href" rel="noopener">my-carto.com</a>, repris ici sans ses encarts commerciaux.
          </p>
        </div>
      </div>
    </article>

    <section class="section ground-cool" aria-labelledby="related-title">
      <div class="wrap">
        <h2 id="related-title" class="related__title">À lire ensuite</h2>
        <ul class="related">
          <li v-for="r in related" :key="r.slug">
            <RouterLink class="card" :to="`/ressources/${r.slug}`">
              <img :src="`/brand/articles/${r.slug}.webp`" alt="" width="1200" height="690" loading="lazy" />
              <span class="card__meta">{{ formatDate(r.date) }} · {{ r.minutes }} min</span>
              <span class="card__title">{{ r.title }}</span>
            </RouterLink>
          </li>
        </ul>
      </div>
    </section>
  </div>
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

.meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2) var(--space-3);
  font-size: var(--fs-s);
  font-weight: 600;
  color: var(--text-muted);
}

.article__head h1 {
  font-size: var(--fs-3xl);
  line-height: 1.04;
  letter-spacing: -0.02em;
  max-width: 22ch;
}

.article__excerpt {
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 44ch;
}

.article__cover {
  width: 100%;
  height: auto;
  max-height: 34rem;
  object-fit: cover;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
}

.article__layout {
  display: grid;
  justify-content: center;
  grid-template-columns: minmax(0, 52rem);
  padding-top: var(--space-7);
}

.article__layout--toc {
  grid-template-columns: 16rem minmax(0, 52rem);
  gap: var(--space-8);
}

/* Table of contents, sticky beside the text, the current section marked in yellow. */
.toc {
  position: sticky;
  top: var(--space-5);
  align-self: start;
  max-height: calc(100dvh - 3rem);
  overflow-y: auto;
  padding-top: var(--space-2);
}

.toc h2 {
  margin-bottom: var(--space-3);
  font-size: var(--fs-m);
}

.toc ol {
  display: grid;
  gap: var(--space-1);
  border-left: 1px solid var(--line);
}

.toc a {
  display: block;
  margin-left: -1px;
  padding: 0.4rem 0 0.4rem var(--space-4);
  border-left: 3px solid transparent;
  font-size: var(--fs-s);
  line-height: 1.4;
  color: var(--text);
  text-decoration: none;
  transition:
    border-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.toc a:hover {
  color: var(--navy);
  text-decoration: underline;
}

.toc a.is-active {
  border-left-color: var(--yellow);
  color: var(--navy);
  font-weight: 600;
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
  scroll-margin-top: var(--space-6);
}

.article__body h3 {
  font-size: var(--fs-xl);
  margin-top: var(--space-6);
  margin-bottom: var(--space-2);
}

.article__body ul,
.article__body ol {
  display: grid;
  gap: var(--space-3);
  margin-block: var(--space-4);
}

.article__body li {
  display: flex;
  gap: var(--space-3);
}

.article__body ul li::before {
  content: '';
  flex: none;
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.7em;
  border-radius: 2px;
  background: var(--yellow);
  box-shadow: 0 0 0 2px var(--navy);
}

.article__body ol {
  counter-reset: step;
}

.article__body ol li {
  counter-increment: step;
}

.article__body ol li::before {
  content: counter(step);
  flex: none;
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  margin-top: 0.2em;
  border-radius: 50%;
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1;
}

.article__body .source {
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--line);
  font-size: var(--fs-s);
  color: var(--text-muted);
}

.related__title {
  font-size: var(--fs-2xl);
  margin-bottom: var(--space-6);
}

.related {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
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

@media (--bp-l) {
  .article__layout--toc {
    grid-template-columns: minmax(0, 52rem);
  }

  .toc {
    display: none;
  }
}

@media (--bp-m) {
  .related {
    grid-template-columns: 1fr;
  }

  .article__body p,
  .article__body li {
    font-size: var(--fs-m);
  }

  .article__body .lead {
    font-size: var(--fs-l);
  }
}
</style>
