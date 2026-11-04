<template>
  <section id="club" class="section club" aria-labelledby="club-title">
    <div class="wrap split">
      <div class="section-head">
        <h2 id="club-title">Le club utilisateurs</h2>
        <p>Trois fois par an, entre clients, pour choisir les prochaines fonctionnalités.</p>
      </div>
      <div class="frame club__frame">
        <img
          src="/brand/photos/club-utilisateurs.webp"
          alt="Visuel du club utilisateurs myCarto avec Crédit Agricole Leasing & Factoring"
          width="1056"
          height="1080"
        />
        <div class="club__info">
          <p class="club__date">19 novembre 2026</p>
          <p>Avec le témoignage du Crédit Agricole Leasing &amp; Factoring.</p>
          <p class="club__note">Réservé aux clients.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.club {
  padding-top: 0;
}

.club__frame {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: var(--space-6);
  align-items: center;
  padding: var(--space-5) var(--space-6);
}

.club__frame img {
  width: 100%;
  height: auto;
  max-width: 22rem;
}

.club__date {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  color: var(--navy);
  margin-bottom: var(--space-2);
}

.club__info p:not(.club__date) {
  font-size: var(--fs-s);
}

.club__note {
  margin-top: var(--space-2);
  color: var(--grey);
}

@media (max-width: 720px) {
  .club__frame {
    grid-template-columns: 1fr;
    padding: var(--space-4);
  }
}
</style>
