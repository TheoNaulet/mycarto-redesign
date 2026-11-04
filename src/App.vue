<script setup lang="ts">
import { useRoute } from 'vue-router'
import SiteHeader from './components/SiteHeader.vue'
import FinalCall from './components/FinalCall.vue'
import SiteFooter from './components/SiteFooter.vue'

const route = useRoute()
</script>

<template>
  <a class="skip" href="#main">Aller au contenu</a>
  <SiteHeader />
  <main id="main">
    <RouterView />
  </main>
  <FinalCall v-if="route.name !== 'demo' && route.name !== 'contact'" />
  <SiteFooter />
</template>

<style scoped>
.skip {
  position: absolute;
  left: var(--space-4);
  top: -4rem;
  z-index: 20;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-plate);
  background: var(--yellow);
  color: var(--navy);
  font-weight: 700;
}

.skip:focus {
  top: var(--space-4);
}
</style>
