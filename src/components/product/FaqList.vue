<script setup lang="ts">
/** Questions in a framed list; each one opens in place (native details, so it works without JS). */
defineProps<{
  items: { q: string; a: string; link?: { to: string; label: string } }[]
}>()
</script>

<template>
  <div class="faq">
    <details v-for="(item, i) in items" :key="item.q" class="faq__item" :open="i === 0">
      <summary>
        <span>{{ item.q }}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
      </summary>
      <div class="faq__answer">
        <p>{{ item.a }}</p>
        <RouterLink v-if="item.link" class="link-more" :to="item.link.to">{{ item.link.label }}</RouterLink>
      </div>
    </details>
  </div>
</template>

<style scoped>
.faq {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-1) var(--space-6);
  background: var(--paper);
}

.faq__item + .faq__item {
  border-top: 1px solid var(--line);
}

summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding-block: var(--space-4);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.25;
  color: var(--navy);
  cursor: pointer;
  list-style: none;
}

summary::-webkit-details-marker {
  display: none;
}

summary:hover span {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

summary svg {
  flex: none;
  width: 2rem;
  height: 2rem;
  padding: 0.35rem;
  border-radius: 50%;
  background: var(--yellow);
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.6;
  stroke-linecap: round;
  transition: transform 0.25s var(--ease-out);
}

details[open] summary svg {
  transform: rotate(45deg);
}

.faq__answer {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  padding: 0 3rem var(--space-5) 0;
}

.faq__answer p {
  max-width: 60ch;
}

@media (--bp-xs) {
  .faq {
    padding: var(--space-1) var(--space-4);
  }

  summary {
    font-size: var(--fs-m);
  }

  .faq__answer {
    padding-right: 0;
  }
}
</style>
