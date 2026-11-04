<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { voices } from '../data/content'

const active = ref(0)
const tabs = ref<HTMLButtonElement[]>([])
const current = computed(() => voices[active.value])

async function onKey(e: KeyboardEvent, i: number) {
  const keys: Record<string, number> = {
    ArrowDown: i + 1,
    ArrowRight: i + 1,
    ArrowUp: i - 1,
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
    <div class="wrap voices__grid">
      <div class="voices__side">
        <h2 id="voices-title">Ce qu’ils en disent</h2>
        <div class="voices__tabs" role="tablist" aria-label="Témoignages clients" aria-orientation="vertical">
          <button
            v-for="(v, i) in voices"
            :key="v.id"
            ref="tabs"
            type="button"
            role="tab"
            class="voice-tab"
            :id="`tab-${v.id}`"
            :aria-selected="i === active"
            :aria-controls="`panel-voices`"
            :tabindex="i === active ? 0 : -1"
            @click="active = i"
            @keydown="onKey($event, i)"
          >
            <span class="voice-tab__name">{{ v.name }}</span>
            <span class="voice-tab__org">{{ v.org }}</span>
          </button>
        </div>
      </div>

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
    </div>
  </section>
</template>

<style scoped>
.voices {
  background: var(--navy);
  padding-block: var(--space-9);
}

.voices__grid {
  display: grid;
  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: start;
}

.voices__side {
  min-width: 0;
}

.voices__side h2 {
  font-size: var(--fs-2xl);
  margin-bottom: var(--space-6);
}

.voices__tabs {
  display: grid;
  border-top: 1px solid var(--on-navy-line);
}

.voice-tab {
  display: grid;
  gap: 0.1rem;
  padding: 0.85rem 0.75rem 0.8rem 2.1rem;
  border: 0;
  border-bottom: 1px solid var(--on-navy-line);
  background: transparent;
  text-align: left;
  position: relative;
  transition: background-color 0.2s var(--ease-out);
}

.voice-tab::before {
  content: '';
  position: absolute;
  left: 0.6rem;
  top: 1.15rem;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  border: 2px solid var(--on-navy-line);
  transition:
    background-color 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out);
}

.voice-tab:hover {
  background: rgb(255 255 255 / 0.05);
}

.voice-tab[aria-selected='true']::before {
  background: var(--yellow);
  border-color: var(--yellow);
}

.voice-tab__name {
  font-weight: 600;
  font-size: var(--fs-s);
}

.voice-tab__org {
  font-size: var(--fs-xs);
  color: var(--on-navy-soft);
}

.voice-tab[aria-selected='true'] {
  background: rgb(255 255 255 / 0.06);
}

.voices__stage {
  min-height: 22rem;
  display: flex;
  align-items: center;
  border-radius: 4px;
}

.quote blockquote p {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.6rem, 1.1rem + 1.6vw, 2.6rem);
  line-height: 1.22;
  letter-spacing: -0.01em;
  max-width: 28ch;
  text-wrap: balance;
}

.quote blockquote p::before {
  content: '« ';
  color: var(--yellow);
}

.quote blockquote p::after {
  content: ' »';
  color: var(--yellow);
}

.quote figcaption {
  display: grid;
  margin-top: var(--space-6);
  font-size: var(--fs-s);
}

.quote figcaption span {
  color: var(--on-navy-soft);
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

@media (max-width: 1000px) {
  .voices {
    padding-block: var(--space-8);
  }

  .voices__grid {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--space-6);
  }

  .voices__side h2 {
    margin-bottom: var(--space-5);
  }

  .voices__tabs {
    grid-auto-flow: column;
    grid-auto-columns: max-content;
    overflow-x: auto;
    border-top: 0;
    gap: var(--space-2);
    scrollbar-width: none;
  }

  .voice-tab {
    border: 2px solid var(--on-navy-line);
    border-radius: var(--radius-plate);
  }

  .voices__stage {
    min-height: 0;
    display: block;
  }
}
</style>
