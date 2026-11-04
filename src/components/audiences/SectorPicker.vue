<script setup lang="ts">
import { ref } from 'vue'
import type { Sector } from '../../data/audiences'
import { clients } from '../../data/content'
import TickList from '../ui/TickList.vue'
import { useRovingTabs } from './useRovingTabs'

/** Sector tabs on navy; each panel shows the sector persona, its key maps and the clients who use it. */
const props = defineProps<{ sectors: Sector[] }>()

const active = ref(0)
const select = (i: number) => (active.value = i)
const { onKey } = useRovingTabs('tabs', () => props.sectors.length, select)

const clientName = (file: string) => clients.find((c) => c.file === file)?.name ?? file
</script>

<template>
  <div class="sectors">
    <div class="sectors__tabs" role="tablist" aria-label="Choisir un secteur">
      <button
        v-for="(s, i) in sectors"
        :id="`tab-sector-${s.id}`"
        :key="s.id"
        ref="tabs"
        type="button"
        role="tab"
        class="sectors__tab"
        :aria-selected="i === active"
        :aria-controls="`panel-sector-${s.id}`"
        :tabindex="i === active ? 0 : -1"
        @click="select(i)"
        @keydown="onKey($event, i)"
      >
        {{ s.name }}
      </button>
    </div>

    <!-- Same grid cell for every panel: the stage keeps the height of the fullest sector. -->
    <div class="sectors__stage">
      <div
        v-for="(s, i) in sectors"
        :id="`panel-sector-${s.id}`"
        :key="s.id"
        class="panel"
        :class="{ 'is-active': i === active }"
        role="tabpanel"
        :aria-labelledby="`tab-sector-${s.id}`"
        :aria-hidden="i !== active"
      >
        <img class="panel__img" :src="`/brand/sectors/${s.image}.webp`" alt="" width="1100" height="1150" />
        <div class="panel__text">
          <h3>{{ s.name }}</h3>
          <p class="panel__line">{{ s.line }}</p>
          <h4>Les cartes qui changent tout</h4>
          <TickList :items="s.maps" ground="navy" size="m" />
          <div class="panel__clients">
            <h4>Ils l’utilisent</h4>
            <ul>
              <li v-for="c in s.clients" :key="c">
                <img :src="`/brand/clients/${c}.svg`" :alt="clientName(c)" />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sectors__tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--space-3);
}

.sectors__tab {
  min-height: 3rem;
  padding: 0.7rem 1.4rem 0.6rem;
  border: 2px solid var(--on-navy-line);
  border-radius: var(--radius-pill);
  background: transparent;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  line-height: 1;
  color: var(--on-navy);
  transition:
    background-color 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.sectors__tab:hover {
  border-color: var(--on-navy);
}

.sectors__tab[aria-selected='true'] {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--navy);
}

.sectors__stage {
  display: grid;
  margin-top: var(--space-7);
}

.panel {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1fr);
  gap: var(--space-8);
  align-items: center;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition:
    opacity 0.35s var(--ease-out),
    transform 0.35s var(--ease-out),
    visibility 0s linear 0.35s;
}

.panel.is-active {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition:
    opacity 0.35s var(--ease-out) 0.1s,
    transform 0.35s var(--ease-out) 0.1s,
    visibility 0s;
}

.panel__img {
  width: 100%;
  max-width: 28rem;
  height: auto;
  justify-self: center;
}

.panel h3 {
  font-size: var(--fs-3xl);
  line-height: 1.02;
  letter-spacing: -0.02em;
}

.panel__line {
  margin-top: var(--space-3);
  font-size: var(--fs-l);
  line-height: 1.4;
  color: var(--on-navy-soft);
  max-width: 32ch;
}

.panel h4 {
  margin: var(--space-6) 0 var(--space-3);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  color: var(--yellow);
}

.panel__clients ul {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-6);
  align-items: center;
}

.panel__clients li {
  display: grid;
  place-items: center;
  height: 3rem;
  max-width: 9rem;
}

.panel__clients img {
  max-height: 100%;
  max-width: 100%;
  width: auto;
}

@media (max-width: 1000px) {
  .panel {
    grid-template-columns: 1fr;
    gap: var(--space-5);
    align-content: start;
  }

  .panel__img {
    max-width: 18rem;
  }
}

@media (max-width: 560px) {
  .sectors__tabs {
    justify-content: flex-start;
  }

  .sectors__tab {
    padding-inline: 1.1rem;
    font-size: var(--fs-s);
  }

  /* Four logos a row keeps the fullest sector (eight logos) to two rows. */
  .panel__clients ul {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-4);
  }

  .panel__clients li {
    height: 2.25rem;
    max-width: none;
  }
}
</style>
