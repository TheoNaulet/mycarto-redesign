<script setup lang="ts">
// Home hero: the promise, the two actions, and the brand banner in its yellow frame.
import { onMounted, ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'

// The frame and its image arrive together: the frame waits until the image is ready to paint.
const img = ref<HTMLImageElement | null>(null)
const ready = ref(false)
onMounted(() => {
  if (img.value?.complete) ready.value = true
})
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="wrap split hero__grid">
      <div class="hero__copy">
        <h1 id="hero-title">Plus jamais perdu dans votre SI</h1>
        <p>Le logiciel de cartographie du SI : vos référentiels deviennent des cartes, toujours à jour.</p>
        <div class="hero__actions">
          <BaseButton to="/demo" size="l">Demander une démo</BaseButton>
          <BaseButton to="/contact" variant="ghost" size="l">Contact commercial</BaseButton>
        </div>
      </div>
      <figure class="hero__visual" :class="{ 'is-ready': ready }">
        <img
          ref="img"
          src="/brand/photos/hero-banner.webp"
          alt="Un utilisateur de myCarto entouré de ses cartes, processus et tableaux de bord"
          width="1173"
          height="839"
          fetchpriority="high"
          @load="ready = true"
          @error="ready = true"
        />
      </figure>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  /* Fills the screen under the notice bar and header. */
  min-height: calc(100dvh - 6.8rem);
  padding-block: var(--space-6);
}

.hero > .wrap {
  width: min(100% - 2 * var(--gutter), var(--max));
}

.hero__visual img {
  max-height: calc(100dvh - 13rem);
  object-fit: contain;
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
}

/*
 * The page's one orchestrated moment, kept calm: the copy settles line by line,
 * and the banner, frame and image as one piece, settles beside it as soon as the image is ready.
 */
.hero__copy > * {
  animation: settle 0.7s var(--ease-out) both;
}

.hero__copy > :nth-child(2) {
  animation-delay: 0.08s;
}

.hero__copy > :nth-child(3) {
  animation-delay: 0.16s;
}

.hero__visual:not(.is-ready) {
  opacity: 0;
}

.hero__visual.is-ready {
  animation: settle 0.8s var(--ease-out) both;
}

@keyframes settle {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
}

@media (--bp-l) {
  .hero__visual {
    margin-top: var(--space-6);
  }
}

@media (--bp-xs) {
  .hero {
    padding-top: var(--space-5);
  }

  .hero__visual {
    padding: var(--space-4) var(--space-4) 0;
  }
}
</style>
