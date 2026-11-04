<script setup lang="ts">
import SignArrow from './SignArrow.vue'
import { directions } from '../data/content'
</script>

<template>
  <section id="usages" class="section usages" aria-labelledby="usages-title">
    <div class="wrap usages__grid">
      <div class="section-head">
        <h2 id="usages-title">Les DSI s’en servent pour trois directions</h2>
        <p>Un seul référentiel, trois façons de décider.</p>
      </div>

      <ol class="post">
        <li v-for="(d, i) in directions" :key="d.id" class="post__row" :class="{ 'is-left': i % 2 === 1 }">
          <h3 class="sign">
            <span class="sign__arrow"><SignArrow :dir="i % 2 === 1 ? 'left' : 'right'" /></span>
            {{ d.name }}
          </h3>
          <ul class="post__points">
            <li v-for="p in d.points" :key="p">{{ p }}</li>
          </ul>
        </li>
      </ol>
    </div>
  </section>
</template>

<style scoped>
.usages__grid {
  display: grid;
  grid-template-columns: minmax(16rem, 0.8fr) minmax(0, 1.6fr);
  gap: var(--space-7);
  align-items: start;
}

.post {
  position: relative;
  display: grid;
  gap: var(--space-6);
  padding-left: 0.5rem;
}

/* The pole the signs hang on */
.post::before {
  content: '';
  position: absolute;
  left: 1.6rem;
  top: -1.5rem;
  bottom: -2.5rem;
  width: 0.6rem;
  border-radius: 0.3rem;
  background: var(--line);
}

.post__row {
  position: relative;
  display: grid;
  grid-template-columns: minmax(18rem, 24rem) minmax(0, 1fr);
  gap: var(--space-5);
  align-items: center;
}

.sign {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  min-height: 4.25rem;
  padding: 0.6rem 1.4rem 0.5rem 0.6rem;
  border-radius: var(--radius-plate);
  background: var(--navy);
  color: var(--on-navy);
  font-size: var(--fs-l);
  line-height: 1.15;
  box-shadow: 0 10px 24px -14px rgb(38 46 111 / 0.55);
}

.sign__arrow {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  flex: none;
  border-radius: 7px;
  background: var(--on-navy);
  color: var(--navy);
  font-size: 1.6rem;
}

.post__row.is-left .sign {
  flex-direction: row-reverse;
  justify-content: flex-end;
  padding: 0.6rem 0.6rem 0.5rem 1.4rem;
}

.post__row.is-left .sign__arrow {
  margin-left: auto;
}

.post__points {
  display: grid;
  gap: var(--space-1);
  color: var(--text);
  font-size: var(--fs-s);
  line-height: 1.45;
}

.post__points li {
  display: flex;
  gap: var(--space-3);
}

.post__points li::before {
  content: '';
  flex: none;
  width: 0.45rem;
  height: 0.45rem;
  margin-top: 0.5em;
  border-radius: 1px;
  background: var(--blue);
}

@media (max-width: 1100px) {
  .usages__grid {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 720px) {
  .post__row {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .post__points {
    padding-left: 3.5rem;
  }
}
</style>
