<script setup lang="ts">
import { site } from '../data/content'
</script>

<template>
  <section id="contact" class="final on-navy" aria-labelledby="final-title">
    <div class="wrap final__inner">
      <h2 id="final-title">Votre SI mérite son plan.</h2>
      <p>Demandez une démo, l’équipe myCarto vous recontacte.</p>
      <div class="final__actions">
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Demander une démo</RouterLink>
        <RouterLink class="btn btn--ghost btn--lg" to="/contact">Contact commercial</RouterLink>
      </div>
      <p class="final__direct">
        Ou directement : <a :href="site.phoneHref">{{ site.phone }}</a>, <a :href="`mailto:${site.email}`">{{ site.email }}</a>
      </p>
    </div>
  </section>

</template>

<style scoped>
.final {
  background: var(--navy);
  padding-block: var(--space-9) var(--space-8);
  border-top: var(--frame) solid var(--on-navy);
}

.final__inner {
  display: grid;
  justify-items: start;
}

.final h2 {
  font-size: var(--fs-3xl);
  letter-spacing: -0.02em;
  max-width: 16ch;
}

.final__inner > p:first-of-type {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  color: var(--on-navy-soft);
}

.final__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.final__direct {
  margin-top: var(--space-5);
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

.final__direct a {
  color: var(--on-navy);
  font-weight: 600;
}

</style>
