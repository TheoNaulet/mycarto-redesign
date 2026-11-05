<script setup lang="ts">
// Home: "La légende de myCarto", the five features as the framed key list that the inner pages reuse.
import { features } from '../data/content'
</script>

<template>
  <section id="fonctionnalites" class="section legend-section" aria-labelledby="legend-title">
    <div class="wrap legend">
      <div class="section-head legend__head">
        <h2 id="legend-title">La légende de myCarto</h2>
        <p>Cinq outils, zéro ligne de code pour les administrer.</p>
        <RouterLink class="more" to="/fonctionnalites">Voir les fonctionnalités en détail</RouterLink>
      </div>
      <dl class="legend__keys">
        <div v-for="f in features" :key="f.icon" class="legend__key">
          <dt>
            <img :src="`/brand/features/${f.icon}.svg`" alt="" width="56" height="56" />
            {{ f.name }}
          </dt>
          <dd>{{ f.line }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.legend {
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(0, 1.6fr);
  gap: var(--space-7);
  align-items: start;
}

.more {
  display: inline-block;
  margin-top: var(--space-5);
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--navy);
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.3em;
}

.legend__keys {
  margin: 0;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-2) var(--space-6);
}

.legend__key {
  display: grid;
  grid-template-columns: minmax(15rem, 1fr) minmax(0, 1.3fr);
  gap: var(--space-5);
  align-items: center;
  padding-block: var(--space-4);
}

.legend__key + .legend__key {
  border-top: 1px solid var(--line);
}

.legend__key dt {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.2;
  color: var(--navy);
}

.legend__key img {
  width: 3.5rem;
  height: 3.5rem;
  flex: none;
}

.legend__key dd {
  margin: 0;
  font-size: var(--fs-s);
  line-height: 1.5;
}

@media (--bp-l) {
  .legend {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (--bp-s) {
  .legend__keys {
    padding: var(--space-1) var(--space-4);
  }

  .legend__key {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }

  .legend__key dd {
    padding-left: calc(3.5rem + var(--space-4));
  }
}
</style>
