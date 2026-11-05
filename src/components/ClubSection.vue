<script setup lang="ts">
// Home and clients: the user club in one photo, one line and the next date, linking to /club-utilisateurs.
import BaseBadge from './ui/BaseBadge.vue'
</script>

<template>
  <section id="club" class="section club" aria-labelledby="club-title">
    <div class="wrap club__grid">
      <img
        src="/brand/photos/club-utilisateurs.webp"
        alt="Visuel du club utilisateurs myCarto avec Crédit Agricole Leasing & Factoring"
        width="1056"
        height="1080"
      />
      <div>
        <h2 id="club-title">Le club utilisateurs</h2>
        <p class="club__lede">Trois fois par an, entre clients, pour choisir les prochaines fonctionnalités.</p>
        <BaseBadge as="p" class="club__date">Prochaine édition le 19 novembre 2026</BaseBadge>
        <p>Avec le témoignage du Crédit Agricole Leasing &amp; Factoring. Réservé aux clients.</p>
        <RouterLink class="link-more club__more" to="/club-utilisateurs">Découvrir le club</RouterLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.club__grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
}

.club__grid img {
  width: 100%;
  max-width: 34rem;
  height: auto;
}

.club h2 {
  font-size: var(--fs-2xl);
}

.club__lede {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 28ch;
}

.club__date {
  margin: var(--space-6) 0 var(--space-3);
}

.club__grid p:last-of-type {
  font-size: var(--fs-s);
  max-width: 40ch;
}

.club__more {
  margin-top: var(--space-5);
  color: var(--navy);
}

@media (--bp-m) {
  .club__grid {
    grid-template-columns: 1fr;
    gap: var(--space-5);
  }

  .club__grid img {
    max-width: 22rem;
  }
}
</style>
