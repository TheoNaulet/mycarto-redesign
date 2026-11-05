<script setup lang="ts">
// Live countdown to the next event, ticking every second; screen readers get days and hours only.
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ to: string }>()

const now = ref(Date.now())
let timer: number | undefined

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})

onBeforeUnmount(() => window.clearInterval(timer))

const plural = (n: number, word: string) => (n > 1 ? `${word}s` : word)

const parts = computed(() => {
  const left = Math.max(0, Date.parse(props.to) - now.value)
  const s = Math.floor(left / 1000)
  return [
    { value: Math.floor(s / 86400), label: plural(Math.floor(s / 86400), 'jour') },
    { value: Math.floor((s % 86400) / 3600), label: plural(Math.floor((s % 86400) / 3600), 'heure') },
    { value: Math.floor((s % 3600) / 60), label: plural(Math.floor((s % 3600) / 60), 'minute') },
    { value: s % 60, label: plural(s % 60, 'seconde') },
  ]
})

/** Read once, not every second: screen readers get the day count only. */
const spoken = computed(() => `Dans ${parts.value[0].value} ${parts.value[0].label} et ${parts.value[1].value} ${parts.value[1].label}`)
</script>

<template>
  <p class="countdown">
    <span class="visually-hidden">{{ spoken }}</span>
    <span v-for="p in parts" :key="p.label" class="countdown__part" aria-hidden="true">
      <strong>{{ String(p.value).padStart(2, '0') }}</strong>
      {{ p.label }}
    </span>
  </p>
</template>

<style scoped>
.countdown {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-2);
}

.countdown__part {
  display: grid;
  justify-items: center;
  gap: 0.1rem;
  padding: var(--space-3) var(--space-1) var(--space-2);
  border-radius: var(--radius-plate);
  background: var(--navy);
  color: var(--on-navy-soft);
  font-size: var(--fs-xs);
}

.countdown__part strong {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1;
  color: var(--on-navy);
  font-variant-numeric: tabular-nums;
}
</style>
