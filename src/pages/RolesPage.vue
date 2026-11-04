<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHero from '../components/ui/PageHero.vue'
import KeyList, { type KeyItem } from '../components/ui/KeyList.vue'
import RolePicker from '../components/audiences/RolePicker.vue'
import { architect, dsi, teamRoles } from '../data/audiences'

const route = useRoute()
const router = useRouter()

// /metiers/:role selects a role in the picker; switching roles rewrites the URL without scrolling.
const activeRole = computed({
  get: () => teamRoles.find((r) => r.id === route.params.role)?.id ?? teamRoles[0].id,
  set: (id: string) => router.replace({ name: 'roles', params: { role: id } }),
})

const contents: KeyItem[] = [
  { name: 'DSI', line: 'Tout le SI sous les yeux, pour décider', to: '/metiers/dsi#dsi' },
  { name: 'Architecte d’entreprise et urbaniste', line: 'Structurer, aligner, rationaliser', to: '/metiers/architecte#architecte' },
  ...teamRoles.map((r) => ({ name: r.name, line: r.short, to: `/metiers/${r.id}#equipes` })),
]
</script>

<template>
  <div>
    <PageHero>
      <template #title>Chaque métier du SI a sa carte</template>
      <template #lede>Du DSI au support, chacun lit le même référentiel à son échelle.</template>
      <template #actions>
        <RouterLink class="btn btn--primary btn--lg" to="/demo">Demander une démo</RouterLink>
      </template>
      <template #aside>
        <nav class="roles-index" aria-label="Aller à un métier">
          <KeyList :items="contents" arrow="down" />
        </nav>
      </template>
    </PageHero>

    <!-- DSI: navy, four illustrated themes -->
    <section id="dsi" class="section dsi on-navy" aria-labelledby="t-dsi">
      <div class="wrap">
        <div class="section-head dsi__head">
          <h2 id="t-dsi">{{ dsi.title }}</h2>
          <p>{{ dsi.line }}</p>
        </div>
        <ul class="dsi__themes">
          <li v-for="t in dsi.themes" :key="t.id">
            <img :src="`/brand/roles/${t.image}.webp`" alt="" width="512" height="512" loading="lazy" />
            <h3>{{ t.name }}</h3>
            <p>{{ t.line }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Architect: cool grey, framed rows beside a navy plate with the one figure we have -->
    <section id="architecte" class="section ground-cool" aria-labelledby="t-archi">
      <div class="wrap archi">
        <div class="archi__side">
          <div class="section-head">
            <h2 id="t-archi">{{ architect.title }}</h2>
            <p>{{ architect.line }}</p>
          </div>
          <figure class="proof on-navy">
            <p class="proof__figure">{{ architect.quote.figure }}</p>
            <p class="proof__what">{{ architect.quote.figureLine }}</p>
            <blockquote>
              <p>« {{ architect.quote.text }} »</p>
            </blockquote>
            <figcaption>
              <strong>{{ architect.quote.name }}</strong>
              {{ architect.quote.role }}
            </figcaption>
          </figure>
        </div>
        <ul class="archi__themes">
          <li v-for="t in architect.themes" :key="t.id">
            <img :src="`/brand/roles/${t.image}.webp`" alt="" width="1100" height="1100" />
            <div>
              <h3>{{ t.name }}</h3>
              <p>{{ t.line }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- Everyone else: yellow, the role picker -->
    <section id="equipes" class="section team" aria-labelledby="t-team">
      <div class="wrap">
        <div class="section-head">
          <h2 id="t-team">Et tous ceux qui font vivre le SI</h2>
          <p>Six métiers, un même référentiel.</p>
        </div>
        <RolePicker v-model="activeRole" :roles="teamRoles" />
      </div>
    </section>
  </div>
</template>

<style scoped>
/* DSI */
.dsi {
  background: var(--navy);
  padding-block: var(--space-9);
}

.dsi__head {
  margin-inline: auto;
  text-align: center;
  max-width: 44rem;
}

.dsi__head p {
  color: var(--on-navy-soft);
  margin-inline: auto;
  max-width: 36ch;
}

.dsi__themes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--space-6);
}

.dsi__themes li {
  display: grid;
  justify-items: center;
  align-content: start;
  text-align: center;
}

.dsi__themes img {
  width: 100%;
  max-width: 18rem;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
  margin-bottom: var(--space-4);
}

.dsi__themes h3 {
  font-size: var(--fs-xl);
}

.dsi__themes p {
  margin-top: var(--space-2);
  max-width: 28ch;
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

/* Architect */
.archi {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: var(--space-8);
  align-items: start;
}

.archi__side .section-head {
  margin-bottom: var(--space-6);
}

.proof {
  margin: 0;
  padding: var(--space-6);
  border-radius: var(--radius-panel);
  background: var(--navy);
}

.proof__figure {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-3xl);
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--yellow);
}

.proof__what {
  margin-top: var(--space-2);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}

.proof blockquote {
  margin-top: var(--space-5);
  padding-top: var(--space-5);
  border-top: 1px solid var(--on-navy-line);
}

.proof blockquote p {
  font-size: var(--fs-m);
  line-height: 1.55;
  color: var(--on-navy-soft);
}

.proof figcaption {
  display: grid;
  margin-top: var(--space-4);
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

.proof figcaption strong {
  font-family: var(--font-display);
  font-size: var(--fs-m);
  color: var(--on-navy);
}

.archi__themes {
  display: grid;
  gap: var(--space-4);
}

.archi__themes li {
  display: grid;
  grid-template-columns: 10rem minmax(0, 1fr);
  gap: var(--space-5);
  align-items: center;
  padding: var(--space-3) var(--space-5) var(--space-3) var(--space-3);
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  background: var(--paper);
}

.archi__themes img {
  width: 10rem;
  height: 10rem;
  object-fit: contain;
}

.archi__themes h3 {
  font-size: var(--fs-xl);
}

.archi__themes p {
  margin-top: var(--space-2);
  font-size: var(--fs-m);
  max-width: 34ch;
}

/* Team roles */
.team {
  background: var(--yellow);
  padding-block: var(--space-9);
}

.team .section-head p {
  color: var(--navy);
}

@media (max-width: 1100px) {
  .dsi__themes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-7) var(--space-5);
  }

  .archi {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }
}

@media (max-width: 860px) {
  .dsi,
  .team {
    padding-block: var(--space-8);
  }
}

@media (max-width: 560px) {
  .dsi__themes {
    gap: var(--space-6) var(--space-4);
  }

  .dsi__themes h3 {
    font-size: var(--fs-l);
  }

  .archi__themes li {
    grid-template-columns: 6rem minmax(0, 1fr);
    gap: var(--space-4);
    padding-right: var(--space-4);
  }

  .archi__themes img {
    width: 6rem;
    height: 6rem;
  }

  .archi__themes h3 {
    font-size: var(--fs-l);
  }

  .archi__themes p {
    font-size: var(--fs-s);
  }

  .proof {
    padding: var(--space-5);
  }
}
</style>
