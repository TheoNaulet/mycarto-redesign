<script setup lang="ts">
import SiteHeader from './components/SiteHeader.vue'
import OrientationPanel from './components/OrientationPanel.vue'
import ClientsStrip from './components/ClientsStrip.vue'
import UseSignpost from './components/UseSignpost.vue'
import FeatureLegend from './components/FeatureLegend.vue'
import VoicesBoard from './components/VoicesBoard.vue'
import RouteSection from './components/RouteSection.vue'
import FinalCall from './components/FinalCall.vue'
</script>

<template>
  <a class="skip" href="#plan">Aller au plan</a>
  <div id="top" class="navy-zone on-navy">
    <SiteHeader />
    <main>
      <div id="plan" class="wrap">
        <OrientationPanel />
        <ClientsStrip />
      </div>
    </main>
  </div>
  <UseSignpost />
  <FeatureLegend />
  <VoicesBoard />
  <RouteSection />
  <FinalCall />
</template>

<style scoped>
.navy-zone {
  background: var(--navy);
}

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
