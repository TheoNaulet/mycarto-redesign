<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { demoFormats, demoNext } from '../data/pages'
import { site } from '../data/content'

type Field = 'nom' | 'prenom' | 'email' | 'societe' | 'tel' | 'projet' | 'consent'

const form = reactive({
  format: 'decouverte',
  nom: '',
  prenom: '',
  email: '',
  societe: '',
  tel: '',
  projet: '',
  consent: false,
})
const errors = reactive<Partial<Record<Field, string>>>({})
const touched = reactive<Partial<Record<Field, boolean>>>({})
const status = ref<'idle' | 'sending' | 'sent'>('idle')
const formEl = ref<HTMLFormElement | null>(null)

const chosen = computed(() => demoFormats.find((f) => f.id === form.format)!)

function check(field: Field): string {
  const v = typeof form[field] === 'string' ? (form[field] as string).trim() : form[field]
  switch (field) {
    case 'nom':
      return v ? '' : 'Indiquez votre nom.'
    case 'prenom':
      return v ? '' : 'Indiquez votre prénom.'
    case 'email':
      if (!v) return 'Indiquez votre e-mail professionnel.'
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v as string) ? '' : 'Cet e-mail semble incomplet, par exemple nom@societe.fr.'
    case 'societe':
      return v ? '' : 'Indiquez votre société ou organisation.'
    case 'tel':
      return !v || /^[+\d][\d\s.-]{7,}$/.test(v as string) ? '' : 'Ce numéro semble incomplet.'
    case 'consent':
      return v ? '' : 'Acceptez les conditions pour envoyer la demande.'
    default:
      return ''
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
  const fields: Field[] = ['nom', 'prenom', 'email', 'societe', 'tel', 'consent']
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
</script>

<template>
  <div class="demo">
    <header class="wrap page-head">
      <h1>Découvrez myCarto avec une démo gratuite</h1>
      <p>Plus de 200 DSI cartographient déjà leur SI avec myCarto. Ils ont tous commencé par une démo.</p>
    </header>

    <div class="wrap demo__grid">
      <div class="demo__panel">
        <div v-if="status === 'sent'" class="sent" role="status">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
          <h2>Merci {{ form.prenom }}, c’est noté.</h2>
          <p>{{ chosen.name }}, {{ chosen.duration }}. Sur le vrai site, l’équipe myCarto vous recontacterait pour fixer un créneau.</p>
          <p class="sent__note">Ceci est une maquette : aucune donnée n’a été envoyée.</p>
          <RouterLink class="link-more" to="/">Retour à l’accueil</RouterLink>
        </div>

        <form v-else ref="formEl" novalidate @submit.prevent="submit">
          <fieldset class="formats">
            <legend>Choisissez votre format</legend>
            <label v-for="f in demoFormats" :key="f.id" class="format">
              <input v-model="form.format" type="radio" name="format" :value="f.id" />
              <span class="format__name">{{ f.name }}</span>
              <span class="format__line">{{ f.line }}</span>
              <span class="format__time">{{ f.duration }}</span>
            </label>
          </fieldset>

          <div class="fields">
            <div class="field">
              <label for="f-nom">Nom</label>
              <input
                id="f-nom"
                v-model="form.nom"
                name="nom"
                autocomplete="family-name"
                :aria-invalid="!!errors.nom"
                aria-describedby="e-nom"
                @blur="validate('nom')"
                @input="revalidate('nom')"
              />
              <p id="e-nom" class="field__error">{{ errors.nom }}</p>
            </div>
            <div class="field">
              <label for="f-prenom">Prénom</label>
              <input
                id="f-prenom"
                v-model="form.prenom"
                name="prenom"
                autocomplete="given-name"
                :aria-invalid="!!errors.prenom"
                aria-describedby="e-prenom"
                @blur="validate('prenom')"
                @input="revalidate('prenom')"
              />
              <p id="e-prenom" class="field__error">{{ errors.prenom }}</p>
            </div>
            <div class="field">
              <label for="f-email">E-mail professionnel</label>
              <input
                id="f-email"
                v-model="form.email"
                name="email"
                type="email"
                autocomplete="email"
                inputmode="email"
                :aria-invalid="!!errors.email"
                aria-describedby="e-email"
                @blur="validate('email')"
                @input="revalidate('email')"
              />
              <p id="e-email" class="field__error">{{ errors.email }}</p>
            </div>
            <div class="field">
              <label for="f-societe">Société</label>
              <input
                id="f-societe"
                v-model="form.societe"
                name="societe"
                autocomplete="organization"
                :aria-invalid="!!errors.societe"
                aria-describedby="e-societe"
                @blur="validate('societe')"
                @input="revalidate('societe')"
              />
              <p id="e-societe" class="field__error">{{ errors.societe }}</p>
            </div>
            <div class="field">
              <label for="f-tel">Téléphone <span class="optional">facultatif</span></label>
              <input
                id="f-tel"
                v-model="form.tel"
                name="tel"
                type="tel"
                autocomplete="tel"
                :aria-invalid="!!errors.tel"
                aria-describedby="e-tel"
                @blur="validate('tel')"
                @input="revalidate('tel')"
              />
              <p id="e-tel" class="field__error">{{ errors.tel }}</p>
            </div>
            <div class="field field--wide">
              <label for="f-projet">Votre projet <span class="optional">facultatif</span></label>
              <textarea
                id="f-projet"
                v-model="form.projet"
                name="projet"
                rows="3"
                placeholder="Nombre d’applications, échéance, enjeu NIS2…"
              />
            </div>
          </div>

          <div class="consent">
            <label>
              <input
                v-model="form.consent"
                type="checkbox"
                name="consent"
                :aria-invalid="!!errors.consent"
                aria-describedby="e-consent"
                @change="validate('consent')"
              />
              <span>
                J’accepte les conditions générales d’utilisation et la
                <a :href="site.privacy">politique de confidentialité</a> d’AB+ Software.
              </span>
            </label>
            <p id="e-consent" class="field__error">{{ errors.consent }}</p>
          </div>

          <button class="btn btn--primary btn--lg submit" type="submit" :disabled="status === 'sending'">
            <span v-if="status === 'sending'" class="spinner" aria-hidden="true" />
            {{ status === 'sending' ? 'Envoi en cours' : 'Demander ma démo' }}
          </button>
        </form>
      </div>

      <aside class="demo__aside" aria-labelledby="next-title">
        <h2 id="next-title">Et ensuite ?</h2>
        <ol class="next">
          <li v-for="(n, i) in demoNext" :key="n.name">
            <span class="next__num" aria-hidden="true">{{ i + 1 }}</span>
            <div>
              <h3>{{ n.name }}</h3>
              <p>{{ n.line }}</p>
            </div>
          </li>
        </ol>
        <div class="ask">
          <p class="ask__title">Une question avant la démo ?</p>
          <p>Du lundi au vendredi, de 9 h à 18 h.</p>
          <a class="link-more" :href="site.phoneHref">{{ site.phone }}</a>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.demo {
  padding-bottom: var(--space-9);
}

.demo__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(16rem, 0.8fr);
  gap: var(--space-8);
  align-items: start;
}

.demo__panel {
  border: var(--frame) solid var(--navy);
  border-radius: var(--radius-panel);
  padding: var(--space-6);
}

/* Formats */
.formats {
  border: 0;
  margin: 0 0 var(--space-6);
  padding: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
}

.formats legend {
  padding: 0;
  margin-bottom: var(--space-3);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
  color: var(--navy);
}

.format {
  position: relative;
  display: grid;
  align-content: start;
  gap: var(--space-1);
  padding: var(--space-4);
  border: 2px solid var(--line);
  border-radius: var(--radius-plate);
  cursor: pointer;
  transition:
    border-color 0.2s var(--ease-out),
    background-color 0.2s var(--ease-out);
}

.format:hover {
  border-color: var(--navy);
}

.format input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.format:has(input:checked) {
  border-color: var(--navy);
  background: var(--navy);
  color: var(--on-navy);
}

.format:has(input:focus-visible) {
  outline: 3px solid var(--navy);
  outline-offset: 3px;
}

.format__name {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-m);
  color: var(--navy);
}

.format:has(input:checked) .format__name {
  color: var(--yellow);
}

.format__line {
  font-size: var(--fs-xs);
  line-height: 1.45;
}

.format__time {
  margin-top: var(--space-2);
  font-size: var(--fs-xs);
  font-weight: 600;
}

/* Fields */
.fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-1) var(--space-4);
}

.field--wide {
  grid-column: 1 / -1;
}

.field label {
  display: block;
  margin-bottom: var(--space-1);
  font-weight: 600;
  font-size: var(--fs-s);
  color: var(--navy);
}

.optional {
  font-weight: 400;
  color: var(--text-muted);
}

.field input,
.field textarea {
  width: 100%;
  min-height: 3rem;
  padding: 0.65rem 0.9rem;
  border: 2px solid var(--line);
  border-radius: var(--radius-plate);
  background: var(--paper);
  font-size: var(--fs-m);
  transition: border-color 0.2s var(--ease-out);
}

.field textarea {
  resize: vertical;
}

.field input::placeholder,
.field textarea::placeholder {
  color: var(--placeholder);
}

.field input:hover,
.field textarea:hover {
  border-color: var(--line-strong);
}

.field input:focus-visible,
.field textarea:focus-visible {
  outline: none;
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgb(38 46 111 / 0.18);
}

.field input[aria-invalid='true'] {
  border-color: var(--danger);
}

.field__error {
  min-height: 1.5rem;
  padding-top: 0.2rem;
  font-size: var(--fs-xs);
  font-weight: 600;
  color: var(--danger);
}

.consent {
  margin-top: var(--space-3);
}

.consent label {
  display: flex;
  gap: var(--space-3);
  align-items: flex-start;
  font-size: var(--fs-s);
  cursor: pointer;
}

.consent input {
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.15rem;
  flex: none;
  accent-color: var(--navy);
}

.submit {
  margin-top: var(--space-4);
}

.submit:disabled {
  opacity: 0.75;
  cursor: progress;
}

.spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2.5px solid var(--navy);
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Sent */
.sent {
  display: grid;
  justify-items: start;
  gap: var(--space-3);
  padding-block: var(--space-6);
}

.sent svg {
  width: 3.5rem;
  height: 3.5rem;
  padding: 0.6rem;
  border-radius: 50%;
  background: var(--yellow);
  fill: none;
  stroke: var(--navy);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.sent h2 {
  font-size: var(--fs-2xl);
}

.sent p {
  max-width: 46ch;
}

.sent__note {
  font-size: var(--fs-s);
  color: var(--text-muted);
}

/* Aside */
.demo__aside h2 {
  font-size: var(--fs-xl);
  margin-bottom: var(--space-5);
}

.next {
  display: grid;
  gap: var(--space-5);
}

.next li {
  display: flex;
  gap: var(--space-4);
}

.next__num {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  flex: none;
  padding-top: 0.12em;
  border-radius: 50%;
  background: var(--navy);
  color: var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
}

.next h3 {
  font-size: var(--fs-m);
}

.next p {
  font-size: var(--fs-s);
}

.ask {
  margin-top: var(--space-7);
  padding: var(--space-5);
  border-radius: var(--radius-panel);
  background: var(--yellow);
  color: var(--navy);
}

.ask__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-l);
}

.ask p:not(.ask__title) {
  margin-block: var(--space-1) var(--space-3);
  font-size: var(--fs-s);
}

@media (max-width: 1000px) {
  .demo__grid {
    grid-template-columns: 1fr;
    gap: var(--space-7);
  }
}

@media (max-width: 640px) {
  .demo__panel {
    padding: var(--space-4);
  }

  .formats,
  .fields {
    grid-template-columns: 1fr;
  }
}
</style>
