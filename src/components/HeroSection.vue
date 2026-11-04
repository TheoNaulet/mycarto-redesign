<script setup lang="ts">
import { site } from '../data/content'
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="wrap split hero__grid">
      <div class="hero__copy">
        <h1 id="hero-title">Plus jamais perdu dans votre SI</h1>
        <p>Le logiciel de cartographie du SI : vos référentiels deviennent des cartes, toujours à jour.</p>
        <div class="hero__actions">
          <a class="btn btn--primary btn--lg" :href="site.demo">Demander une démo</a>
          <a class="btn btn--ghost btn--lg" :href="site.contact">Contact commercial</a>
        </div>
      </div>
      <figure class="hero__visual">
        <img
          src="/brand/photos/hero-banner.webp"
          alt="Un utilisateur de myCarto entouré de ses cartes, processus et tableaux de bord"
          width="1173"
          height="839"
          fetchpriority="high"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-block: var(--space-7) var(--space-8);
}

.hero__grid {
  align-items: center;
}

.hero__copy h1 {
  font-size: var(--fs-3xl);
  line-height: 1.02;
  letter-spacing: -0.02em;
}

.hero__copy p {
  margin-top: var(--space-5);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 26ch;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.hero__actions .btn--ghost {
  color: var(--navy);
}

.hero__actions .btn--ghost:hover {
  background: var(--navy);
  border-color: var(--navy);
  color: var(--on-navy);
}

.hero__visual {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  padding: var(--space-6) var(--space-6) 0;
  overflow: hidden;
}

.hero__visual img {
  width: 100%;
  height: auto;
  animation: rise 0.9s var(--ease-out) 0.1s both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

@media (max-width: 1100px) {
  .hero__visual {
    margin-top: var(--space-6);
  }
}

@media (max-width: 560px) {
  .hero {
    padding-top: var(--space-5);
  }

  .hero__visual {
    padding: var(--space-4) var(--space-4) 0;
  }
}
</style>
