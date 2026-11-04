<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { voices } from '../data/content'

const active = ref(0)
const tabs = ref<HTMLButtonElement[]>([])
const current = computed(() => voices[active.value])

async function onKey(e: KeyboardEvent, i: number) {
  const keys: Record<string, number> = {
    ArrowRight: i + 1,
    ArrowLeft: i - 1,
    Home: 0,
    End: voices.length - 1,
  }
  if (!(e.key in keys)) return
  e.preventDefault()
  active.value = (keys[e.key] + voices.length) % voices.length
  await nextTick()
  tabs.value[active.value]?.focus()
}
</script>

<template>
  <section id="temoignages" class="voices on-navy" aria-labelledby="voices-title">
    <div class="wrap voices__inner">
      <h2 id="voices-title">Ce qu’ils en disent</h2>

      <div id="panel-voices" class="voices__stage" role="tabpanel" :aria-labelledby="`tab-${current.id}`">
        <Transition name="quote" mode="out-in">
          <figure :key="current.id" class="quote">
            <blockquote>
              <p>{{ current.quote }}</p>
            </blockquote>
            <figcaption>
              <strong>{{ current.name }}</strong>
              <span>{{ current.role }}, {{ current.org }}</span>
            </figcaption>
          </figure>
        </Transition>
      </div>

      <div class="voices__tabs" role="tablist" aria-label="Choisir un témoignage">
        <button
          v-for="(v, i) in voices"
          :id="`tab-${v.id}`"
          :key="v.id"
          ref="tabs"
          type="button"
          role="tab"
          class="voice-tab"
          :aria-selected="i === active"
          aria-controls="panel-voices"
          :tabindex="i === active ? 0 : -1"
          @click="active = i"
          @keydown="onKey($event, i)"
        >
          <img :src="`/brand/testimonials/${v.logo}.png`" :alt="v.org" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.voices {
  background: var(--navy);
  padding-block: var(--space-9);
}

.voices__inner {
  display: grid;
  justify-items: center;
  text-align: center;
}

.voices h2 {
  font-size: var(--fs-2xl);
}

.voices__stage {
  display: grid;
  place-items: center;
  min-height: 21rem;
  margin-block: var(--space-6);
}

.quote blockquote {
  position: relative;
  padding-top: 4.5rem;
}

/* One oversized yellow guillemet opens the quote. */
.quote blockquote::before {
  content: '«';
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 7rem;
  line-height: 1;
  color: var(--yellow);
}

.quote blockquote p {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.5rem, 1.1rem + 1.4vw, 2.4rem);
  line-height: 1.25;
  letter-spacing: -0.01em;
  max-width: 34ch;
  margin-inline: auto;
  text-wrap: balance;
}

.quote figcaption {
  display: grid;
  gap: 0.15rem;
  margin-top: var(--space-6);
  font-size: var(--fs-s);
}

.quote figcaption strong {
  font-family: var(--font-display);
  font-size: var(--fs-l);
}

.quote figcaption span {
  color: var(--on-navy-soft);
}

.voices__tabs {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 9.5rem));
  gap: var(--space-4);
}

.voice-tab {
  display: grid;
  place-items: center;
  height: 6rem;
  padding: var(--space-2) var(--space-3);
  border: 3px solid transparent;
  border-radius: var(--radius-plate);
  background: var(--paper);
  opacity: 0.55;
  transition:
    opacity 0.25s var(--ease-out),
    transform 0.25s var(--ease-out),
    border-color 0.25s var(--ease-out);
}

.voice-tab img {
  max-width: 100%;
  max-height: 4.25rem;
  width: auto;
  object-fit: contain;
}

.voice-tab:hover {
  opacity: 0.85;
}

.voice-tab[aria-selected='true'] {
  opacity: 1;
  border-color: var(--yellow);
  transform: translateY(-4px);
}

.quote-enter-active,
.quote-leave-active {
  transition:
    opacity 0.3s var(--ease-out),
    transform 0.3s var(--ease-out);
}

.quote-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.quote-leave-to {
  opacity: 0;
}

@media (max-width: 900px) {
  .voices {
    padding-block: var(--space-8);
  }

  .voices__tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
    gap: var(--space-3);
  }

  .voices__stage {
    min-height: 26rem;
  }
}

@media (max-width: 480px) {
  .voice-tab {
    height: 4.25rem;
    padding: var(--space-2);
  }

  .voices__stage {
    min-height: 30rem;
  }
}
</style>
