<script setup lang="ts">
// 404: any unknown address, and an unknown case or article. The address stays as typed.
import PageHero from '../components/ui/PageHero.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import LostMap from '../components/LostMap.vue'
</script>

<template>
  <PageHero ground="navy">
    <template #before><p class="code">Erreur 404</p></template>
    <template #title>Cette page n’est pas sur la carte</template>
    <template #lede>L’adresse a changé, ou elle n’a jamais existé.</template>
    <template #actions>
      <BaseButton to="/" size="l">Retour à l’accueil</BaseButton>
      <BaseButton to="/plan-du-site" variant="ghost" size="l">Plan du site</BaseButton>
    </template>
    <template #aside><LostMap /></template>
  </PageHero>
</template>

<style scoped>
.code {
  margin-bottom: var(--space-3);
  color: var(--yellow);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}
</style>
