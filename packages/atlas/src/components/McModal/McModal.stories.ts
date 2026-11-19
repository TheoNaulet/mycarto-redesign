import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import McModal, { type ModalSection } from './McModal.vue'
import McButton from '../McButton/McButton.vue'
import McTextField from '../McTextField/McTextField.vue'
import McIcon from '../../icons/McIcon.vue'

const app = { label: 'Application', icon: 'app', layer: 'applicatif' } as const

const selectField = (label: string, options: string[], model: string) => `<div class="mc-field">
  <label class="mc-field-label">${label}</label>
  <div class="mc-input select"><select v-model="${model}" style="flex:1;min-width:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;appearance:none;cursor:pointer">${options
    .map((o) => `<option>${o}</option>`)
    .join('')}</select><McIcon name="chevron-down" /></div>
</div>`

const form = `<div class="mc-grid2">
  <McTextField label="Nom" v-model="name" required />
  ${selectField('Statut', ['Prévue', 'Active', 'Obsolète', 'Retirée'], 'status')}
  <McTextField label="Mise en service" v-model="start" icon-end="calendar" placeholder="JJ/MM/AAAA" />
  <McTextField label="Fin de service" v-model="end" icon-end="calendar" placeholder="JJ/MM/AAAA" />
</div>`

const meta = {
  title: 'Surfaces/Modal',
  component: McModal,
  args: {
    title: 'Modifier ASTRE RH',
    type: app,
    size: 'md',
    danger: false,
    confirmLabel: 'Enregistrer',
    confirmDisabled: false,
    loading: false,
    cancelLabel: 'Annuler',
    footerNote: 'Modifiée par vous il y a 2 min',
    dirty: false,
    closeOnScrim: true,
    contained: true,
  },
  parameters: {
    pad: false,
    docs: {
      description: {
        component:
          'Fenêtre modale pour créer ou modifier un objet, ou confirmer une action risquée. Voile, panneau de 560px (860px en `lg`), en-tête avec la puce de type et un titre **« l’action + l’objet » (« Modifier APOGEE »)**, corps en 2 colonnes, pied avec une indication à gauche, « Annuler » puis l’action principale. Échap, la croix et le voile ferment (événement `close`) ; avec `dirty`, la fermeture demande d’abord confirmation. Focus sur le premier champ à l’ouverture, piégé dans la modale, rendu au déclencheur à la fermeture. `danger` : confirmation de suppression (dire ce qui sera supprimé et ce qui en dépend). Préférer l’inspecteur pour une modification rapide.',
      },
    },
  },
  render: (args) => ({
    components: { McModal, McButton, McTextField, McIcon },
    setup: () => {
      const open = ref(true)
      const saving = ref(false)
      const name = ref('ASTRE RH')
      const status = ref('Prévue')
      const start = ref('02/11/2025')
      const end = ref('')
      const log = ref('')
      function save() {
        saving.value = true
        setTimeout(() => {
          saving.value = false
          open.value = false
          log.value = 'Application enregistrée'
        }, 900)
      }
      return { args, open, saving, name, status, start, end, log, save }
    },
    template: `<div style="position:relative;height:640px;padding:24px" class="mc-canvas">
      <McButton variant="outline" icon="pencil" @click="open = true">Modifier ASTRE RH</McButton>
      <p class="mc-cap">{{ log || 'Échap, la croix ou le voile ferment la modale.' }}</p>
      <McModal v-bind="args" v-model:open="open" :loading="args.loading || saving" :confirm-disabled="args.confirmDisabled || !name" @confirm="save" @close="log = 'Fermée sans enregistrer'">
        ${form}
        <button type="button" class="mc-section-toggle"><span class="grow mc-over">Sécurité (DICP)</span><span class="mc-dicp"><span class="c3">D</span><span class="c0">I</span><span class="c0">C</span><span class="c0">P</span></span><McIcon name="chevron-down" size="sm" /></button>
        <button type="button" class="mc-section-toggle"><span class="grow mc-over">Commentaire</span><McIcon name="chevron-right" size="sm" /></button>
      </McModal>
    </div>`,
  }),
} satisfies Meta<typeof McModal>

export default meta
type Story = StoryObj<typeof meta>

export const Bac_a_sable: Story = { name: 'Bac à sable' }

const sections: ModalSection[] = [
  { id: 'general', label: 'Général', icon: 'info', modified: true },
  { id: 'cycle', label: 'Cycle de vie', icon: 'calendar' },
  { id: 'dicp', label: 'Sécurité (DICP)', icon: 'shield', modified: true },
  { id: 'hebergement', label: 'Hébergement', icon: 'server' },
  { id: 'fournisseur', label: 'Fournisseur et coûts', icon: 'contract', error: true },
  { id: 'relations', label: 'Relations', icon: 'link' },
  { id: 'commentaire', label: 'Commentaire', icon: 'comment' },
]

/** Saisie longue en 860px : navigation par sections à gauche (le corps défile et la section active suit), modifications et erreur signalées, enregistrement bloqué tant qu’un champ obligatoire manque. */
export const Modification_longue: Story = {
  name: 'Modification longue',
  render: () => ({
    components: { McModal, McButton, McTextField, McIcon },
    setup: () => {
      const open = ref(true)
      const section = ref('general')
      const v = ref({ name: 'ASTRE RH', nature: 'Application', desc: 'Gestion des ressources humaines : carrière, paie, temps', status: 'Prévue', owner: 'Groupe complet', start: '02/11/2025', end: '', host: 'philosophe', editor: '', cost: '' })
      const missing = computed(() => !v.value.editor)
      const note = computed(() => `2 modifications${missing.value ? ' · 1 champ à corriger' : ''}`)
      const secs = computed(() => sections.map((s) => (s.id === 'fournisseur' ? { ...s, error: missing.value } : s)))
      return { open, section, v, missing, note, secs, app }
    },
    template: `<div style="position:relative;height:860px;padding:24px" class="mc-canvas">
      <McButton variant="outline" icon="pencil" @click="open = true">Modifier ASTRE RH</McButton>
      <McModal v-model:open="open" v-model:section="section" title="Modifier ASTRE RH" :type="app" subtitle="Créée le 18/12/2024 · modifiée le 19/12/2024" size="lg" :sections="secs" :footer-note="note" :confirm-disabled="missing" dirty contained @confirm="open = false">
        <section data-section="general" style="display:grid;gap:14px"><h3>Général</h3>
          <div class="mc-grid2">
            <McTextField label="Nom" v-model="v.name" required />
            <McTextField label="Nature" v-model="v.nature" readonly />
            <div style="grid-column:span 2"><McTextField label="Description" v-model="v.desc" modified /></div>
            <McTextField label="Statut" v-model="v.status" />
            <McTextField label="Groupe propriétaire" v-model="v.owner" required />
          </div>
        </section>
        <section data-section="cycle" style="display:grid;gap:14px"><h3>Cycle de vie</h3>
          <div class="mc-grid2">
            <McTextField label="Mise en service" v-model="v.start" icon-end="calendar" />
            <McTextField label="Fin de service" v-model="v.end" icon-end="calendar" placeholder="JJ/MM/AAAA" />
          </div>
        </section>
        <section data-section="dicp" style="display:grid;gap:14px"><h3>Sécurité (DICP)</h3>
          <div class="mc-grid2">
            <div class="mc-field is-modified"><span class="mc-field-label">Disponibilité</span><div class="mc-input select"><span class="mc-dicp"><span class="c3">D</span></span><span class="val">Forte</span><McIcon name="chevron-down" /></div></div>
            <div class="mc-field"><span class="mc-field-label">Intégrité</span><div class="mc-input select"><span class="mc-dicp"><span class="c0">I</span></span><span class="val ph">Non renseignée</span><McIcon name="chevron-down" /></div></div>
            <div class="mc-field"><span class="mc-field-label">Confidentialité</span><div class="mc-input select"><span class="mc-dicp"><span class="c0">C</span></span><span class="val ph">Non renseignée</span><McIcon name="chevron-down" /></div></div>
            <div class="mc-field"><span class="mc-field-label">Preuve</span><div class="mc-input select"><span class="mc-dicp"><span class="c0">P</span></span><span class="val ph">Non renseignée</span><McIcon name="chevron-down" /></div></div>
          </div>
          <p class="mc-cap" style="margin:0">Astuce : les niveaux DICP alimentent la lentille Criticité et le tableau de bord.</p>
        </section>
        <section data-section="hebergement" style="display:grid;gap:14px"><h3>Hébergement</h3>
          <div class="mc-grid2"><McTextField label="Machine" v-model="v.host" icon="cloud" /></div>
        </section>
        <section data-section="fournisseur" style="display:grid;gap:14px"><h3>Fournisseur et coûts</h3>
          <div class="mc-grid2">
            <McTextField label="Éditeur" v-model="v.editor" placeholder="ex. AMUE" required :error="missing ? 'Choisissez l’éditeur pour pouvoir enregistrer.' : undefined" />
            <McTextField label="Coût total de possession" v-model="v.cost" placeholder="ex. 12 400" suffix="€ / an" />
          </div>
        </section>
        <section data-section="relations" style="display:grid;gap:14px"><h3>Relations</h3>
          <p class="mc-cap" style="margin:0">14 relations : 9 flux, 4 machines, 1 contrat. Elles se modifient depuis l’inspecteur.</p>
        </section>
        <section data-section="commentaire" style="display:grid;gap:14px;min-height:240px"><h3>Commentaire</h3>
          <McTextField label="Commentaire" placeholder="ex. Migration prévue vers la version SaaS en 2026" />
        </section>
      </McModal>
    </div>`,
  }),
}

/** Création, enregistrement en cours, action bloquée, confirmation de suppression, fermeture avec modifications non enregistrées (cliquer sur Annuler). */
export const Tous_les_etats: Story = {
  name: 'Tous les états',
  render: () => ({
    components: { McModal, McTextField, McIcon },
    setup: () => ({ app, name: ref('APOGEE'), status: ref('Active'), start: ref('14/03/2021'), end: ref(''), empty: ref(''), t: ref(true) }),
    template: `<div class="mc-col" style="gap:0">
      <div style="position:relative;height:460px" class="mc-canvas"><McModal :open="true" contained :autofocus="false" title="Créer une application" :type="app" confirm-label="Créer" confirm-icon="plus">
        <div class="mc-grid2"><McTextField label="Nom" v-model="empty" placeholder="ex. Gestion des étudiants" required /><McTextField label="Mise en service" v-model="end" icon-end="calendar" placeholder="JJ/MM/AAAA" /></div>
      </McModal></div>
      <div style="position:relative;height:460px" class="mc-canvas"><McModal :open="true" contained :autofocus="false" title="Modifier APOGEE" :type="app" loading footer-note="Enregistrement…">
        ${form}
      </McModal></div>
      <div style="position:relative;height:460px" class="mc-canvas"><McModal :open="true" contained :autofocus="false" title="Créer une application" :type="app" confirm-label="Créer" confirm-disabled footer-note="Renseignez le nom pour créer l’application.">
        <div class="mc-grid2"><McTextField label="Nom" v-model="empty" required error="Saisissez un nom." /><McTextField label="Mise en service" v-model="end" icon-end="calendar" placeholder="JJ/MM/AAAA" /></div>
      </McModal></div>
      <div style="position:relative;height:400px" class="mc-canvas"><McModal :open="true" contained :autofocus="false" danger title="Supprimer APOGEE ?" confirm-label="Supprimer l’application">
        <p style="margin:0;font-size:14px;line-height:20px;color:var(--ink-muted)">APOGEE sera placée dans la corbeille pendant 30 jours. <b style="color:var(--ink)">12 relations seront retirées</b> et l’application disparaîtra de 4 cartes.</p>
      </McModal></div>
      <div style="position:relative;height:460px" class="mc-canvas"><McModal v-model:open="t" contained :autofocus="false" dirty title="Modifier APOGEE" :type="app" footer-note="2 modifications">
        ${form}
      </McModal><button v-if="!t" class="mc-btn outline" style="margin:24px" @click="t = true">Rouvrir</button></div>
    </div>`,
  }),
}
