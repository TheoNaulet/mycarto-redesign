<script setup lang="ts">
// Mentions légales and Politique RGPD on one template, chosen by the route `doc` prop (data: legal.ts).
import { computed } from 'vue'
import PageHero from '../components/ui/PageHero.vue'
import { legal } from '../data/legal'

const props = defineProps<{ doc: 'mentions' | 'rgpd' }>()
const page = computed(() => legal[props.doc])
const other = computed(() =>
  props.doc === 'mentions'
    ? { to: '/confidentialite', label: 'Politique de confidentialité' }
    : { to: '/mentions-legales', label: 'Mentions légales' },
)
</script>

<template>
  <div>
    <PageHero :full="false">
      <template #title>{{ page.title }}</template>
      <template #lede>{{ page.lede }}</template>
      <nav class="jump" aria-label="Sur cette page">
        <a v-for="s in page.sections" :key="s.id" :href="`#${s.id}`">{{ s.title }}</a>
      </nav>
    </PageHero>

    <section class="section ground-cool" :aria-label="page.title">
      <div class="wrap doc">
        <aside class="notice" role="note">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.01" /></svg>
          <div>
            <h2>{{ page.notice.title }}</h2>
            <p>{{ page.notice.text }}</p>
          </div>
        </aside>

        <section v-for="s in page.sections" :id="s.id" :key="s.id" class="part" :aria-labelledby="`t-${s.id}`">
          <h2 :id="`t-${s.id}`">{{ s.title }}</h2>
          <template v-for="(b, i) in s.blocks" :key="i">
            <p v-if="b.type === 'p'">{{ b.text }}</p>
            <ul v-else-if="b.type === 'ul'" class="list">
              <li v-for="item in b.items" :key="item">{{ item }}</li>
            </ul>
            <ul v-else-if="b.type === 'pills'" class="pills">
              <li v-for="item in b.items" :key="item">{{ item }}</li>
            </ul>
            <dl v-else-if="b.type === 'facts'" class="facts">
              <div v-for="f in b.items" :key="f.name">
                <dt>{{ f.name }}</dt>
                <dd>{{ f.value }}</dd>
              </div>
            </dl>
            <div v-else-if="b.type === 'table'" class="table">
              <table>
                <thead>
                  <tr>
                    <th v-for="h in b.head" :key="h" scope="col">{{ h }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in b.rows" :key="row[0]">
                    <th scope="row">{{ row[0] }}</th>
                    <td v-for="(cell, j) in row.slice(1)" :key="j">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </section>

        <p class="foot">
          <span>Texte d’origine sur <a :href="page.source" rel="noopener">my-carto.com</a>.</span>
          <RouterLink class="link-more" :to="other.to">{{ other.label }}</RouterLink>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.jump {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.jump a {
  padding: 0.5rem 1rem 0.45rem;
  border: 2px solid var(--navy);
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1.1;
  color: var(--navy);
  text-decoration: none;
  transition:
    background-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.jump a:hover {
  background: var(--navy);
  color: var(--on-navy);
}

.doc {
  display: grid;
  gap: var(--space-7);
  max-width: 56rem;
}

.notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  color: var(--navy);
}

.notice svg {
  width: 2rem;
  height: 2rem;
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.2;
  stroke-linecap: round;
}

.notice h2 {
  font-size: var(--fs-l);
}

.notice p {
  margin-top: var(--space-1);
}

.part {
  display: grid;
  gap: var(--space-4);
  scroll-margin-top: var(--space-5);
}

.part h2 {
  font-size: var(--fs-xl);
}

.part p {
  max-width: 68ch;
}

.list {
  display: grid;
  gap: var(--space-2);
}

.list li {
  display: flex;
  gap: var(--space-3);
}

.list li::before {
  content: '';
  flex: none;
  width: 0.55rem;
  height: 0.55rem;
  margin-top: 0.6em;
  border-radius: 2px;
  background: var(--yellow);
  outline: 2px solid var(--navy);
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.pills li {
  padding: 0.5rem 1rem 0.45rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  line-height: 1.1;
}

/* Facts as a small framed key list: name column, value column, hairlines. */
.facts {
  margin: 0;
  padding: var(--space-1) var(--space-5);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.facts div {
  display: grid;
  grid-template-columns: 12rem minmax(0, 1fr);
  gap: var(--space-4);
  padding-block: var(--space-3);
}

.facts div + div {
  border-top: 1px solid var(--line);
}

.facts dt {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--navy);
}

.facts dd {
  margin: 0;
}

.table {
  overflow-x: auto;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--fs-s);
}

thead th {
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  text-align: left;
}

th,
td {
  padding: var(--space-3) var(--space-4);
  vertical-align: top;
}

tbody tr + tr > * {
  border-top: 1px solid var(--line);
}

tbody th {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--navy);
  text-align: left;
  white-space: nowrap;
}

.foot {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3) var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--line-strong);
  font-size: var(--fs-s);
  color: var(--text-muted);
}

.foot .link-more {
  color: var(--navy);
}

@media (--bp-s) {
  .notice {
    grid-template-columns: 1fr;
    padding: var(--space-5);
  }

  .facts div {
    grid-template-columns: 1fr;
    gap: var(--space-1);
  }

  table {
    min-width: 36rem;
  }
}
</style>
