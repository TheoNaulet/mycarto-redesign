<script setup lang="ts">
import tokens from '../../tokens/tokens.json'

const props = defineProps<{ /** Préfixes des jetons à montrer, ex. ['layer-'] */ prefixes?: string[] }>()

type Tok = { name: string; value: string | { light: string; dark?: string }; usage?: string }
const list = (tokens.color.tokens as Tok[]).filter((t) => !props.prefixes || props.prefixes.some((p) => t.name.startsWith(p)))
const val = (t: Tok, th: 'light' | 'dark') => (typeof t.value === 'string' ? t.value : (t.value[th] ?? t.value.light))
</script>

<template>
  <div class="sw-grid">
    <div v-for="t in list" :key="t.name" class="sw">
      <div class="chips">
        <span :style="{ background: `var(--${t.name})` }" data-theme="light" title="Clair" />
        <span data-theme="dark" :style="{ background: `var(--${t.name})` }" title="Sombre" />
      </div>
      <code>--{{ t.name }}</code>
      <small>{{ val(t, 'light') }} · {{ val(t, 'dark') }}</small>
      <p>{{ t.usage }}</p>
    </div>
  </div>
</template>

<style scoped>
.sw-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; margin: 16px 0 32px; }
.sw { border: 1px solid #dee2e4; border-radius: 12px; padding: 10px; display: grid; gap: 4px; font-family: 'Noto Sans Variable', sans-serif; }
.chips { display: grid; grid-template-columns: 1fr 1fr; height: 44px; border-radius: 8px; overflow: hidden; border: 1px solid #dee2e4; }
.chips span { display: block; }
code { font-size: 12px; font-weight: 600; color: #1e2347; }
small { font-size: 11px; color: #62688a; }
p { margin: 0; font-size: 12px; line-height: 16px; color: #555b7c; }
</style>
