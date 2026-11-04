<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { voices } from '../data/content'

const DURATION = 8 // seconds per testimonial

const active = ref(0)
const tabs = ref<HTMLButtonElement[]>([])
const userPaused = ref(false)
const hovering = ref(false)
const focused = ref(false)
const running = computed(() => !userPaused.value && !hovering.value && !focused.value)

onMounted(() => {
  // No autoplay for people who asked for less motion; the play button still works.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) userPaused.value = true
})

function go(i: number) {
  active.value = (i + voices.length) % voices.length
}

async function onKey(e: KeyboardEvent, i: number) {
  const keys: Record<string, number> = {
    ArrowRight: i + 1,
    ArrowLeft: i - 1,
    Home: 0,
    End: voices.length - 1,
  }
  if (!(e.key in keys)) return
  e.preventDefault()
  go(keys[e.key])
  await nextTick()
  tabs.value[active.value]?.focus()
}

function onFocusOut(e: FocusEvent) {
  const next = e.relatedTarget as Node | null
  if (!next || !(e.currentTarget as HTMLElement).contains(next)) focused.value = false
}
</script>

<template>
  <section
    id="temoignages"
    class="voices on-navy"
    aria-labelledby="voices-title"
    @mouseenter="hovering = true"
    @mouseleave="hovering = false"
    @focusin="focused = true"
    @focusout="onFocusOut"
  >
    <div class="wrap voices__inner">
      <h2 id="voices-title">Ce qu’ils en disent</h2>

      <!-- Every quote sits in the same grid cell: the stage keeps the height of the longest one. -->
      <div id="panel-voices" class="voices__stage" role="tabpanel" :aria-labelledby="`tab-${voices[active].id}`">
        <figure
          v-for="(v, i) in voices"
          :key="v.id"
          class="quote"
          :class="{ 'is-active': i === active }"
          :aria-hidden="i !== active"
        >
          <blockquote>
            <p>{{ v.quote }}</p>
          </blockquote>
          <figcaption>
            <strong>{{ v.name }}</strong>
            <span>{{ v.role }}, {{ v.org }}</span>
          </figcaption>
        </figure>
      </div>

      <div class="voices__controls">
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
            @click="go(i)"
            @keydown="onKey($event, i)"
          >
            <img :src="`/brand/testimonials/${v.logo}.png`" :alt="v.org" />
            <span
              v-if="i === active"
              :key="`timer-${active}`"
              class="voice-tab__timer"
              :class="{ 'is-paused': !running }"
              :style="{ animationDuration: `${DURATION}s` }"
              aria-hidden="true"
              @animationend="go(active + 1)"
            />
          </button>
        </div>
        <button
          type="button"
          class="voices__toggle"
          :aria-label="userPaused ? 'Reprendre le défilement' : 'Mettre le défilement en pause'"
          @click="userPaused = !userPaused"
        >
          <svg v-if="userPaused" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" /></svg>
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
  width: 100%;
  margin-block: var(--space-6) var(--space-7);
}

.quote {
  grid-area: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition:
    opacity 0.45s var(--ease-out),
    transform 0.45s var(--ease-out),
    visibility 0s linear 0.45s;
}

.quote.is-active {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition:
    opacity 0.45s var(--ease-out) 0.15s,
    transform 0.45s var(--ease-out) 0.15s,
    visibility 0s;
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

.voices__controls {
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.voices__tabs {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 9.5rem));
  gap: var(--space-4);
}

.voice-tab {
  position: relative;
  display: grid;
  place-items: center;
  height: 6rem;
  padding: var(--space-2) var(--space-3);
  border: 3px solid transparent;
  border-radius: var(--radius-plate);
  background: var(--paper);
  overflow: hidden;
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

/* The visible timer: a yellow bar that fills along the bottom of the active logo. */
.voice-tab__timer {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 5px;
  width: 100%;
  background: var(--yellow);
  transform-origin: left;
  animation-name: fill;
  animation-timing-function: linear;
  animation-fill-mode: both;
}

.voice-tab__timer.is-paused {
  animation-play-state: paused;
}

@keyframes fill {
  from {
    transform: scaleX(0);
  }
  to {
    transform: scaleX(1);
  }
}

.voices__toggle {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  flex: none;
  border: 2px solid var(--on-navy-line);
  border-radius: 50%;
  background: transparent;
  transition: border-color 0.2s var(--ease-out);
}

.voices__toggle:hover {
  border-color: var(--on-navy);
}

.voices__toggle svg {
  width: 1.15rem;
  height: 1.15rem;
  fill: currentColor;
}

@media (max-width: 900px) {
  .voices {
    padding-block: var(--space-8);
  }

  .voices__controls {
    flex-direction: column;
    width: 100%;
  }

  .voices__tabs {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    width: 100%;
    gap: var(--space-3);
  }
}

@media (max-width: 480px) {
  .voice-tab {
    height: 4.5rem;
    padding: var(--space-2);
  }
}

@media (prefers-reduced-motion: reduce) {
  /* Keep the timer working (it drives the rotation) even under the global motion reset. */
  .voice-tab__timer {
    animation-duration: 8s !important;
  }
}
</style>
