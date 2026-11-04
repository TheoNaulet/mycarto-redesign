<script setup lang="ts">
// Contact commercial: a compact form validated field by field; nothing is sent, the concept says so.
import { nextTick, reactive, ref } from 'vue'
import { site } from '../data/content'

type Field = 'prenom' | 'nom' | 'email' | 'societe' | 'tel' | 'message' | 'consent'

const form = reactive({ prenom: '', nom: '', email: '', societe: '', tel: '', message: '', consent: false })
const errors = reactive<Partial<Record<Field, string>>>({})
const touched = reactive<Partial<Record<Field, boolean>>>({})
const status = ref<'idle' | 'sending' | 'sent'>('idle')
const formEl = ref<HTMLFormElement | null>(null)

function check(field: Field): string {
  const raw = form[field]
  const v = typeof raw === 'string' ? raw.trim() : raw
  switch (field) {
    case 'prenom':
      return v ? '' : 'Indiquez votre prénom.'
    case 'nom':
      return v ? '' : 'Indiquez votre nom.'
    case 'email':
      if (!v) return 'Indiquez votre e-mail professionnel.'
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v as string) ? '' : 'Cet e-mail semble incomplet, par exemple nom@societe.fr.'
    case 'societe':
      return v ? '' : 'Indiquez votre société ou organisation.'
    case 'tel':
      return !v || /^[+\d][\d\s.-]{7,}$/.test(v as string) ? '' : 'Ce numéro semble incomplet.'
    case 'message':
      return v ? '' : 'Dites-nous en quelques mots ce que vous cherchez.'
    case 'consent':
      return v ? '' : 'Acceptez les conditions pour envoyer le message.'
  }
}

function validate(field: Field) {
  touched[field] = true
  errors[field] = check(field)
}

function revalidate(field: Field) {
  if (touched[field]) errors[field] = check(field)
}

async function submit() {
  const fields: Field[] = ['prenom', 'nom', 'email', 'societe', 'tel', 'message', 'consent']
  fields.forEach(validate)
  const firstInvalid = fields.find((f) => errors[f])
  if (firstInvalid) {
    await nextTick()
    formEl.value?.querySelector<HTMLElement>(`[name="${firstInvalid}"]`)?.focus()
    return
  }
  status.value = 'sending'
  // Concept only: nothing leaves the browser.
  await new Promise((r) => setTimeout(r, 900))
  status.value = 'sent'
}

const textFields: { id: Exclude<Field, 'message' | 'consent'>; label: string; type?: string; auto: string; optional?: boolean }[] = [
  { id: 'prenom', label: 'Prénom', auto: 'given-name' },
  { id: 'nom', label: 'Nom', auto: 'family-name' },
  { id: 'email', label: 'E-mail professionnel', type: 'email', auto: 'email' },
  { id: 'societe', label: 'Société', auto: 'organization' },
  { id: 'tel', label: 'Téléphone', type: 'tel', auto: 'tel', optional: true },
]
</script>

<template>
  <div class="contact">
    <header class="wrap page-head contact__head">
      <h1>Parlons de votre SI</h1>
      <p>Une question, un besoin précis ? L’équipe commerciale vous répond rapidement.</p>
    </header>

    <div class="wrap contact__grid">
      <div class="contact__panel">
        <div v-if="status === 'sent'" class="sent" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
          <h2>Merci {{ form.prenom }}, message reçu.</h2>
          <p>Sur le vrai site, l’équipe commerciale vous répondrait sous peu.</p>
          <p class="sent__note">Ceci est une maquette : aucune donnée n’a été envoyée.</p>
          <RouterLink class="link-more" to="/">Retour à l’accueil</RouterLink>
        </div>

        <form v-else ref="formEl" novalidate @submit.prevent="submit">
          <div class="fields fields--3">
            <div v-for="f in textFields" :key="f.id" class="field">
              <label :for="`c-${f.id}`">
                {{ f.label }} <span v-if="f.optional" class="optional">facultatif</span>
              </label>
              <input
                :id="`c-${f.id}`"
                v-model="form[f.id]"
                :name="f.id"
                :type="f.type ?? 'text'"
                :autocomplete="f.auto"
                :aria-invalid="!!errors[f.id]"
                :aria-describedby="`ce-${f.id}`"
                @blur="validate(f.id)"
                @input="revalidate(f.id)"
              />
              <p :id="`ce-${f.id}`" class="field__error">{{ errors[f.id] }}</p>
            </div>
            <div class="field field--wide">
              <label for="c-message">Votre message</label>
              <textarea
                id="c-message"
                v-model="form.message"
                name="message"
                rows="3"
                placeholder="Votre contexte, vos questions sur l’offre, le SaaS ou l’On Premise…"
                :aria-invalid="!!errors.message"
                aria-describedby="ce-message"
                @blur="validate('message')"
                @input="revalidate('message')"
              />
              <p id="ce-message" class="field__error">{{ errors.message }}</p>
            </div>
          </div>

          <div class="consent">
            <label>
              <input
                v-model="form.consent"
                type="checkbox"
                name="consent"
                :aria-invalid="!!errors.consent"
                aria-describedby="ce-consent"
                @change="validate('consent')"
              />
              <span>
                J’accepte les conditions générales d’utilisation et la
                <a :href="site.privacy">politique de confidentialité</a> d’AB+ Software.
              </span>
            </label>
            <p id="ce-consent" class="field__error">{{ errors.consent }}</p>
          </div>

          <button class="btn btn--primary btn--lg submit" type="submit" :disabled="status === 'sending'">
            <span v-if="status === 'sending'" class="spinner" aria-hidden="true" />
            {{ status === 'sending' ? 'Envoi en cours' : 'Envoyer le message' }}
          </button>
        </form>
      </div>

      <aside class="ways" aria-label="Autres moyens de nous joindre">
        <a class="way" :href="site.phoneHref">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 3.5h2.6l1.5 4-2 1.3a11 11 0 0 0 6.5 6.5l1.3-2 4 1.5v2.6a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1z" /></svg>
          <span class="way__name">{{ site.phone }}</span>
          <span class="way__line">Du lundi au vendredi, de 9 h à 18 h.</span>
        </a>
        <a class="way" :href="`mailto:${site.email}`">
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
          <span class="way__name">{{ site.email }}</span>
          <span class="way__line">Réponse dans les meilleurs délais.</span>
        </a>
        <div class="way">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
          <span class="way__name">{{ site.address[2] }}</span>
          <span class="way__line">{{ site.address[0] }}, {{ site.address[1] }}</span>
        </div>
        <div class="demo-nudge">
          <p class="demo-nudge__title">Envie de voir l’outil ?</p>
          <p>Une démo avec un expert produit, en visio.</p>
          <RouterLink class="btn btn--navy-solid" to="/demo">Demander une démo</RouterLink>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.contact {
  padding-bottom: var(--space-9);
}

.contact__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(16rem, 0.8fr);
  gap: var(--space-8);
  align-items: start;
}

.contact__head {
  padding-block: var(--space-7) var(--space-6);
}

.contact__panel {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-5) var(--space-6);
}

.contact__panel .submit {
  margin-top: var(--space-2);
}

.ways {
  display: grid;
  gap: var(--space-3);
}

.way {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  grid-template-areas:
    'icon name'
    'icon line';
  column-gap: var(--space-4);
  align-items: center;
  padding: var(--space-4) var(--space-5);
  border: 2px solid var(--line);
  border-radius: var(--radius-plate);
  color: var(--text);
  text-decoration: none;
  transition: border-color 0.2s var(--ease-out);
}

a.way:hover {
  border-color: var(--navy);
}

.way svg {
  grid-area: icon;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0.6rem;
  border-radius: 50%;
  background: var(--navy);
  fill: none;
  stroke: var(--on-navy);
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.way__name {
  grid-area: name;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  color: var(--navy);
  overflow-wrap: anywhere;
}

.way__line {
  grid-area: line;
  font-size: var(--fs-s);
}

.demo-nudge {
  margin-top: var(--space-4);
  padding: var(--space-5);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  color: var(--navy);
}

.demo-nudge__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}

.demo-nudge p:not(.demo-nudge__title) {
  margin-block: var(--space-1) var(--space-4);
  font-size: var(--fs-s);
}

.btn--navy-solid {
  background: var(--navy);
  color: var(--on-navy);
}

.btn--navy-solid:hover {
  background: #343e8c;
}

@media (max-width: 1000px) {
  .contact__grid {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }
}

@media (max-width: 640px) {
  .contact__panel {
    padding: var(--space-4);
  }
}
</style>
