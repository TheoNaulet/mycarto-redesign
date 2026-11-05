<script setup lang="ts">
import { RouterLink } from 'vue-router'

/**
 * The framed key list, the signature of the home legend: a 3px navy frame, 20px corners,
 * rows of asset / name / one line divided by hairlines. Rows with `to` become links with an arrow.
 */
export interface KeyItem {
  name: string
  line?: string
  /** Image path under /public, e.g. /brand/method/objectif.svg */
  icon?: string
  /** Internal route or #anchor. */
  to?: string
}

withDefaults(
  defineProps<{
    items: KeyItem[]
    /** `stack`: name over its line (Fonctionnalités head). `columns`: name column, line column (home legend). */
    layout?: 'stack' | 'columns'
    /** Arrow drawn on linked rows. */
    arrow?: 'right' | 'down'
    iconSize?: 'm' | 'l'
  }>(),
  { layout: 'stack', arrow: 'right', iconSize: 'm' },
)

function isAnchor(to?: string) {
  return !!to && to.startsWith('#')
}
</script>

<template>
  <ul class="keys" :class="[`keys--${layout}`, `keys--icon-${iconSize}`, `keys--arrow-${arrow}`]">
    <li v-for="item in items" :key="item.name">
      <component
        :is="item.to ? (isAnchor(item.to) ? 'a' : RouterLink) : 'div'"
        class="keys__row"
        :class="{ 'keys__row--link': item.to }"
        v-bind="item.to ? (isAnchor(item.to) ? { href: item.to } : { to: item.to }) : {}"
      >
        <img v-if="item.icon" class="keys__icon" :src="item.icon" alt="" width="56" height="56" />
        <span class="keys__name">{{ item.name }}</span>
        <span v-if="item.line" class="keys__line">{{ item.line }}</span>
        <svg v-if="item.to" class="keys__arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path v-if="arrow === 'down'" d="M12 5v14M6 13l6 6 6-6" />
          <path v-else d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </component>
    </li>
  </ul>
</template>

<style scoped>
.keys {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-2) var(--space-5);
  background: var(--paper);
}

.keys li + li {
  border-top: 1px solid var(--line);
}

.keys__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  grid-template-areas:
    'icon name arrow'
    'icon line arrow';
  grid-template-rows: auto auto;
  align-content: center;
  column-gap: var(--space-4);
  align-items: center;
  padding-block: var(--space-4);
  color: var(--navy);
  text-decoration: none;
}

.keys__icon {
  grid-area: icon;
  grid-row: 1 / 3;
  width: 3.5rem;
  height: 3.5rem;
  object-fit: contain;
}

.keys--icon-l .keys__icon {
  width: 4.5rem;
  height: 4.5rem;
}

.keys__name {
  grid-area: name;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  line-height: 1.2;
  text-wrap: balance;
  align-self: end;
}

.keys__row:not(:has(.keys__line)) .keys__name {
  grid-row: 1 / 3;
  align-self: center;
}

.keys__line {
  grid-area: line;
  font-size: var(--fs-s);
  line-height: 1.5;
  color: var(--text);
  align-self: start;
}

.keys__arrow {
  grid-area: arrow;
  width: 1.4rem;
  height: 1.4rem;
  fill: none;
  stroke: var(--navy);
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.25s var(--ease-out);
}

.keys__row--link:hover .keys__name {
  text-decoration: underline;
  text-decoration-color: var(--yellow);
  text-decoration-thickness: 3px;
  text-underline-offset: 0.2em;
}

.keys__row--link:hover .keys__arrow {
  transform: translateX(3px);
}

.keys--arrow-down .keys__row--link:hover .keys__arrow {
  transform: translateY(3px);
}

/* Home legend layout: name column beside line column. */
.keys--columns .keys__row {
  grid-template-columns: auto minmax(11rem, 1fr) minmax(0, 1.3fr) auto;
  grid-template-areas: 'icon name line arrow';
  grid-template-rows: auto;
  column-gap: var(--space-5);
}

.keys--columns .keys__icon,
.keys--columns .keys__name {
  grid-row: auto;
  align-self: center;
}

.keys--columns .keys__line {
  align-self: center;
}

@media (--bp-s) {
  .keys {
    padding: var(--space-1) var(--space-4);
  }

  .keys__icon,
  .keys--icon-l .keys__icon {
    width: 2.75rem;
    height: 2.75rem;
  }

  .keys--columns .keys__row {
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-areas:
      'icon name arrow'
      'icon line arrow';
    column-gap: var(--space-4);
  }

  .keys--columns .keys__row {
    grid-template-rows: auto auto;
  }

  .keys--columns .keys__icon {
    grid-row: 1 / 3;
  }

  .keys--columns .keys__name {
    align-self: end;
  }

  .keys--columns .keys__line {
    align-self: start;
  }
}
</style>
