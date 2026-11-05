<script setup lang="ts">
/**
 * The site's only button, a flat pill in Outfit Bold. It renders the right element for the job:
 * a RouterLink with `to`, a plain link with `href` (anchor, mailto, external), otherwise a <button>.
 *
 * Variants:
 * - primary: yellow, the main action of a view (one per view).
 * - ghost: an outline in the ink of its ground. Navy on paper, grey and yellow; white inside `.on-navy`.
 *   It fills on hover, so it never needs restyling per page.
 * - navy: filled navy, the main action on a yellow or grey card where yellow would disappear.
 *
 * Sizes: s in the header, m by default, l for the actions of a hero or a final call.
 * Every other attribute (rel, disabled, aria-*, class) goes on the rendered element.
 */
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    to?: RouteLocationRaw
    href?: string
    variant?: 'primary' | 'ghost' | 'navy'
    size?: 's' | 'm' | 'l'
    type?: 'button' | 'submit'
  }>(),
  { to: undefined, href: undefined, variant: 'primary', size: 'm', type: 'button' },
)

const tag = computed(() => (props.to ? RouterLink : props.href ? 'a' : 'button'))

/**
 * Only the attributes of the element actually rendered: an `href` passed to RouterLink, even
 * undefined, would override the one it computes and leave an <a> without href (no pointer, no focus).
 */
const linkAttrs = computed(() => {
  if (props.to) return { to: props.to }
  if (props.href) return { href: props.href }
  return { type: props.type }
})
</script>

<template>
  <component
    :is="tag"
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`]"
    v-bind="linkAttrs"
  >
    <slot />
  </component>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  border: 2px solid transparent;
  border-radius: var(--radius-pill);
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  transition:
    background-color 0.2s var(--ease-out),
    color 0.2s var(--ease-out),
    border-color 0.2s var(--ease-out),
    transform 0.2s var(--ease-out);
}

.btn:active {
  transform: translateY(1px);
}

.btn:disabled {
  opacity: 0.75;
  cursor: progress;
}

.btn--s {
  min-height: 2.75rem;
  padding: 0.6rem 1.2rem;
  font-size: var(--fs-s);
}

.btn--m {
  min-height: 3rem;
  padding: 0.65rem 1.4rem;
  font-size: var(--fs-m);
}

.btn--l {
  min-height: 3.5rem;
  padding: 0.65rem 1.8rem;
  font-size: var(--fs-l);
}

.btn--primary {
  background: var(--yellow);
  color: var(--navy);
}

.btn--primary:hover {
  background: var(--yellow-hover);
}

.btn--navy {
  background: var(--navy);
  color: var(--on-navy);
}

.btn--navy:hover {
  background: var(--navy-hover);
}

.btn--ghost {
  border-color: currentColor;
  color: var(--navy);
}

.btn--ghost:hover {
  border-color: var(--navy);
  background: var(--navy);
  color: var(--on-navy);
}

.on-navy .btn--ghost {
  color: var(--on-navy);
}

.on-navy .btn--ghost:hover {
  border-color: var(--on-navy);
  background: var(--on-navy);
  color: var(--navy);
}
</style>
