<script setup lang="ts">
import { hosting, route } from '../data/content'
</script>

<template>
  <section id="accompagnement" class="section" aria-labelledby="route-title">
    <div class="wrap split">
      <div class="section-head">
        <h2 id="route-title">Avec vous du choix à l’usage</h2>
        <p>Plus de 200 projets d’implémentation.</p>
      </div>
      <dl class="frame">
        <div v-for="(stop, i) in route" :key="stop.id" class="frame-row">
          <dt class="frame-row__title">
            <span class="step" aria-hidden="true">{{ i + 1 }}</span>
            {{ stop.name }}
          </dt>
          <dd class="frame-row__text">{{ stop.line }}</dd>
        </div>
      </dl>
    </div>

    <div class="wrap split hosting">
      <div class="section-head">
        <h2>Chez vous ou chez nous</h2>
      </div>
      <dl class="frame">
        <div v-for="h in hosting" :key="h.name" class="frame-row">
          <dt class="frame-row__title">{{ h.name }}</dt>
          <dd class="frame-row__text">{{ h.line }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.step {
  display: grid;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  flex: none;
  padding-top: 0.12em;
  border-radius: 50%;
  border: 2px solid var(--navy);
  font-size: var(--fs-m);
}

.hosting {
  margin-top: var(--space-8);
}

.hosting h2 {
  font-size: var(--fs-xl);
}
</style>
