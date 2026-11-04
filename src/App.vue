<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import HeroSection from './components/HeroSection.vue'
import ClientsStrip from './components/ClientsStrip.vue'
import UseCases from './components/UseCases.vue'
import FeatureLegend from './components/FeatureLegend.vue'
import VoicesBoard from './components/VoicesBoard.vue'
import RouteSection from './components/RouteSection.vue'
import ClubSection from './components/ClubSection.vue'
import FinalCall from './components/FinalCall.vue'
</script>

<template>
  <a class="skip" href="#main">Aller au contenu</a>
  <SiteHeader />
  <main id="main">
    <HeroSection />
    <ClientsStrip />
    <UseCases />
    <FeatureLegend />
    <VoicesBoard />
    <RouteSection />
    <ClubSection />
  </main>
  <FinalCall />
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
