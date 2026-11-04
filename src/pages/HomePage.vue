<script setup lang="ts">
// The home page: one section per idea, on alternating grounds (see DESIGN.md, Layout).
import HeroSection from '../components/HeroSection.vue'
import ClientsStrip from '../components/ClientsStrip.vue'
import UseCases from '../components/UseCases.vue'
import FeatureLegend from '../components/FeatureLegend.vue'
import VoicesBoard from '../components/VoicesBoard.vue'
import RouteSection from '../components/RouteSection.vue'
import ClubSection from '../components/ClubSection.vue'
</script>

<template>
  <div>
    <HeroSection />
    <ClientsStrip />
    <UseCases />
    <FeatureLegend />
    <VoicesBoard />
    <RouteSection />
    <ClubSection />
  </div>
</template>
