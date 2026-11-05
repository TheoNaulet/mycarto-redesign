<script setup lang="ts">
import { computed } from 'vue'
import type { TeamRole } from '../../data/audiences'
import TickList from '../ui/TickList.vue'
import { useRovingTabs } from './useRovingTabs'

/** A framed list of roles as tabs, beside a stage that keeps the height of the tallest role. */
const props = defineProps<{ roles: TeamRole[] }>()
const model = defineModel<string>({ required: true })

const active = computed(() => Math.max(0, props.roles.findIndex((r) => r.id === model.value)))
const select = (i: number) => (model.value = props.roles[i].id)
const { onKey } = useRovingTabs('tabs', () => props.roles.length, select)
</script>

<template>
  <div class="picker">
    <div class="picker__tabs" role="tablist" aria-label="Choisir un métier" aria-orientation="vertical">
      <button
        v-for="(r, i) in roles"
        :id="`tab-role-${r.id}`"
        :key="r.id"
        ref="tabs"
        type="button"
        role="tab"
        class="picker__tab"
        :aria-selected="i === active"
        :aria-controls="`panel-role-${r.id}`"
        :tabindex="i === active ? 0 : -1"
        @click="select(i)"
        @keydown="onKey($event, i)"
      >
        <span class="picker__name">{{ r.name }}</span>
        <span class="picker__short">{{ r.short }}</span>
      </button>
    </div>

    <!-- Every panel sits in the same grid cell, so switching never changes the height. -->
    <div class="picker__stage">
      <div
        v-for="(r, i) in roles"
        :id="`panel-role-${r.id}`"
        :key="r.id"
        class="panel"
        :class="{ 'is-active': i === active }"
        role="tabpanel"
        :aria-labelledby="`tab-role-${r.id}`"
        :aria-hidden="i !== active"
      >
        <img
          class="panel__img"
          :src="`/brand/roles/${r.image}.webp`"
          alt=""
          width="1100"
          height="1100"
        />
        <div class="panel__text">
          <h3>{{ r.name }}</h3>
          <p class="panel__mission">{{ r.mission }}</p>
          <TickList :items="r.benefits" ground="yellow" size="m" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.picker {
  display: grid;
  grid-template-columns: minmax(16rem, 20rem) minmax(0, 1fr);
  gap: var(--space-7);
  align-items: center;
}

.picker__tabs {
  display: grid;
  padding: var(--space-2);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.picker__tab {
  position: relative;
  display: grid;
  gap: 0.1rem;
  padding: 0.8rem 1rem 0.75rem;
  border: 0;
  border-radius: var(--radius-plate);
  background: transparent;
  text-align: left;
  color: var(--navy);
  transition:
    background-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out);
}

.picker__tab + .picker__tab::before {
  content: '';
  position: absolute;
  top: 0;
  left: 1rem;
  right: 1rem;
  border-top: 1px solid var(--line);
}

.picker__tab[aria-selected='true']::before,
.picker__tab[aria-selected='true'] + .picker__tab::before {
  border-color: transparent;
}

.picker__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  line-height: 1.25;
}

.picker__short {
  font-size: var(--fs-s);
  line-height: 1.35;
  color: var(--text);
}

.picker__tab:hover .picker__name {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

.picker__tab[aria-selected='true'] {
  background: var(--navy);
  color: var(--on-navy);
}

.picker__tab[aria-selected='true'] .picker__short {
  color: var(--on-navy-soft);
}

.picker__tab[aria-selected='true'] .picker__name {
  text-decoration: none;
}

.picker__tab:focus-visible {
  outline-offset: 2px;
}

.picker__stage {
  display: grid;
}

.panel {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1fr);
  gap: var(--space-7);
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
  max-width: 26rem;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  justify-self: center;
}

.panel h3 {
  font-size: var(--fs-2xl);
}

.panel__mission {
  margin-block: var(--space-3) var(--space-6);
  font-size: var(--fs-l);
  line-height: 1.4;
  color: var(--navy);
  max-width: 30ch;
}

@media (--bp-l) {
  .picker {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  /* The roles become a two-column grid of short tabs above the stage. */
  .picker__tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .picker__short {
    display: none;
  }

  .picker__tab + .picker__tab::before {
    display: none;
  }
}

@media (--bp-s) {
  .panel {
    grid-template-columns: 1fr;
    gap: var(--space-4);
    align-content: start;
  }

  .panel__img {
    max-width: 15rem;
  }
}
</style>
