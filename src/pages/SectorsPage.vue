<script setup lang="ts">
import PageHero from '../components/ui/PageHero.vue'
import SectorPicker from '../components/audiences/SectorPicker.vue'
import { otherSectors, sectors } from '../data/audiences'
import { clients } from '../data/content'

const clientName = (file: string) => clients.find((c) => c.file === file)?.name ?? file
</script>

<template>
  <div>
    <PageHero>
      <template #title>À chaque secteur son jeu de cartes</template>
      <template #lede>Public ou privé, PME ou grand groupe&nbsp;: le numérique est partout, myCarto aussi.</template>
      <template #actions>
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Demander une démo</RouterLink>
        <RouterLink class="btn btn--ghost btn--lg" to="/clients">Voir les cas clients</RouterLink>
      </template>
      <template #aside>
        <figure class="hero-visual">
          <img
            src="/brand/sectors/tous-secteurs.webp"
            alt="Un utilisateur de myCarto présente les cartes de son système d’information"
            width="1100"
            height="1128"
            fetchpriority="high"
          />
        </figure>
      </template>
    </PageHero>

    <!-- Navy: one tab per sector -->
    <section class="section by-sector on-navy" aria-labelledby="t-sectors">
      <div class="wrap">
        <div class="section-head by-sector__head">
          <h2 id="t-sectors">Votre secteur, vos cartes</h2>
          <p>Cinq secteurs où myCarto est chez lui.</p>
        </div>
        <SectorPicker :sectors="sectors" />
      </div>
    </section>

    <!-- Yellow: the threshold, then every other kind of DSI -->
    <section class="section others" aria-labelledby="t-others">
      <div class="wrap others__grid">
        <p class="threshold">
          <span class="threshold__num">50</span>
          <span class="threshold__line">applications&nbsp;: au-delà, les inventaires bureautiques ne suffisent plus.</span>
        </p>
        <div>
          <h2 id="t-others">Et toutes les autres DSI</h2>
          <p class="others__lede">myCarto décrit n’importe quel système d’information, quel que soit le métier.</p>
          <ul class="others__names" aria-label="Autres secteurs équipés">
            <li v-for="n in otherSectors.names" :key="n">{{ n }}</li>
          </ul>
          <ul class="others__logos" aria-label="Quelques clients">
            <li v-for="c in otherSectors.clients" :key="c">
              <img :src="`/brand/clients/${c}.svg`" :alt="clientName(c)" />
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* The brand's sector illustration on its yellow ground, in the hero frame of the home page. */
.hero-visual {
  display: grid;
  justify-items: center;
  max-width: 40rem;
  margin: 0 0 0 auto;
  padding: var(--space-6) var(--space-6) 0;
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  overflow: hidden;
}

.hero-visual img {
  width: auto;
  max-width: 100%;
  max-height: calc(100dvh - 15rem);
  height: auto;
  animation: rise 0.9s var(--ease-out) 0.1s both;
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
}

.by-sector {
  background: var(--navy);
  padding-block: var(--space-9);
}

.by-sector__head {
  margin-inline: auto;
  text-align: center;
}

.by-sector__head p {
  margin-inline: auto;
  color: var(--on-navy-soft);
}

.others {
  background: var(--yellow);
  color: var(--navy);
}

.others__grid {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  gap: var(--space-8);
  align-items: center;
}

.threshold {
  display: grid;
  gap: var(--space-3);
}

.threshold__num {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(7rem, 4rem + 9vw, 13rem);
  line-height: 0.85;
  letter-spacing: -0.04em;
  color: var(--navy);
}

.threshold__line {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-xl);
  line-height: 1.2;
  max-width: 18ch;
}

.others h2 {
  font-size: var(--fs-2xl);
}

.others__lede {
  margin-top: var(--space-4);
  font-size: var(--fs-l);
  line-height: 1.45;
  max-width: 36ch;
}

.others__names {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.others__names li {
  padding: 0.6rem 1.1rem 0.5rem;
  border-radius: var(--radius-pill);
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
}

/* The white client logos sit on small navy plates, so they read on yellow. */
.others__logos {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.others__logos li {
  display: grid;
  place-items: center;
  height: 5.5rem;
  padding: var(--space-4);
  border-radius: var(--radius-panel);
  background: var(--navy);
}

/* An explicit cap: a percentage max-height does not resolve inside this padded grid cell. */
.others__logos img {
  max-height: 3.25rem;
  max-width: 100%;
  width: auto;
  height: auto;
  object-fit: contain;
}

@media (max-width: 1000px) {
  .hero-visual {
    margin-inline: auto;
  }

  .hero-visual img {
    max-height: 26rem;
  }

  .others__grid {
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  .threshold {
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: var(--space-5);
  }
}

@media (max-width: 860px) {
  .by-sector {
    padding-block: var(--space-8);
  }
}

@media (max-width: 560px) {
  .hero-visual {
    padding: var(--space-4) var(--space-4) 0;
  }

  .others__logos {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .threshold__num {
    font-size: 6rem;
  }

  .threshold__line {
    font-size: var(--fs-l);
  }
}
</style>
