<script setup lang="ts">
import { useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McButton from '../McButton/McButton.vue'
import McTabs, { type TabItem } from '../McTabs/McTabs.vue'
import type { IconName } from '../../icons/icons'
import type { Layer } from '../../utils/types'

/** L'objet inspecté. */
export interface InspectedObject {
  /** Nom, casse saisie. */
  name: string
  /** Type écrit dans la puce : « Application ». */
  type: string
  /** Couche : teinte de la tuile et de la puce. */
  layer: Layer
  /** Pictogramme du type. */
  icon: IconName
  /** Une phrase qui dit à quoi il sert. */
  description?: string
}

const props = withDefaults(
  defineProps<{
    /** Objet sélectionné. Sans objet : état vide « Sélectionnez un objet sur la carte ». */
    object?: InspectedObject
    /** Onglets : Informations · Relations · Cartes · Historique. */
    tabs?: TabItem[]
    /** Données en cours de chargement : squelette. */
    loading?: boolean
    /** Message d'erreur (ce qui a échoué + quoi faire). Active l'état erreur. */
    error?: string
    /** Hauteur max du panneau ; le corps défile au-delà. */
    maxHeight?: string
  }>(),
  { object: undefined, tabs: () => [], loading: false, error: undefined, maxHeight: undefined },
)

/** Onglet actif, restitué au retour sur l'objet. */
const tab = defineModel<string>('tab')

const emit = defineEmits<{
  /** Fermeture (croix ou Échap). */
  close: []
  /** Clic sur « Réessayer » dans l'état erreur. */
  retry: []
}>()

const id = useId()
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    emit('close')
  }
}
const state = () => (props.loading ? 'loading' : props.error ? 'error' : props.object ? 'ready' : 'empty')
</script>

<template>
  <aside
    class="mc-float mc-insp"
    :class="object && `l-${object.layer}`"
    :aria-labelledby="object ? `${id}-t` : undefined"
    :aria-label="object ? undefined : 'Inspecteur'"
    :aria-busy="loading || undefined"
    :style="maxHeight ? { maxHeight } : undefined"
    @keydown="onKey"
  >
    <!-- Chargement -->
    <template v-if="state() === 'loading'">
      <div class="hd" aria-hidden="true">
        <span class="tile mc-skel" />
        <div class="grow">
          <span class="mc-skel" style="height: 18px; width: 60%" />
          <span class="mc-skel" style="height: 14px; width: 45%" />
        </div>
      </div>
      <div class="acts" aria-hidden="true"><span class="mc-skel" style="height: 28px; flex: 1" /><span class="mc-skel" style="height: 28px; flex: 1" /></div>
      <div class="body" aria-hidden="true">
        <span v-for="n in 5" :key="n" class="mc-skel" :style="{ height: '14px', width: `${55 + ((n * 23) % 40)}%` }" />
      </div>
      <span class="mc-sr" role="status">Chargement de l’objet</span>
    </template>

    <!-- Erreur -->
    <div v-else-if="state() === 'error'" class="mc-insp-state">
      <div class="mc-insp-x"><button type="button" class="mc-ibtn sm" aria-label="Fermer l’inspecteur" @click="emit('close')"><McIcon name="x" size="sm" /></button></div>
      <div class="mc-error" role="alert">
        <span class="art"><McIcon name="alert-octagon" size="xl" /></span>
        <b>{{ object ? `Impossible d’afficher ${object.name}` : 'Impossible d’afficher l’objet' }}</b>
        <p>{{ error }}</p>
        <McButton variant="outline" size="sm" icon="undo" @click="emit('retry')">Réessayer</McButton>
      </div>
    </div>

    <!-- Vide -->
    <div v-else-if="state() === 'empty'" class="mc-insp-state">
      <div class="mc-empty">
        <span class="art"><McIcon name="cursor" size="xl" /></span>
        <b>Sélectionnez un objet sur la carte</b>
        <p>Sa fiche, ses relations et ses cartes s’affichent ici.</p>
      </div>
    </div>

    <!-- Objet -->
    <template v-else-if="object">
      <div class="hd">
        <span class="tile"><McIcon :name="object.icon" size="lg" /></span>
        <div class="grow">
          <h2 :id="`${id}-t`" class="title mc-insp-name">{{ object.name }}</h2>
          <div class="mc-row" style="gap: 6px">
            <span class="mc-chip sm type"><span class="sw"><McIcon :name="object.icon" /></span>{{ object.type }}</span>
            <slot name="statuses" />
          </div>
        </div>
        <button type="button" class="mc-ibtn sm" aria-label="Fermer l’inspecteur" @click="emit('close')"><McIcon name="x" size="sm" /></button>
      </div>
      <div v-if="$slots.actions" class="acts"><slot name="actions" /></div>
      <div v-if="tabs.length" class="tabs"><McTabs v-model="tab" :tabs="tabs" :aria-label="`Fiche de ${object.name}`" /></div>
      <div class="body">
        <p v-if="object.description && (!tabs.length || tab === tabs[0].value || !tab)" class="mc-insp-desc">{{ object.description }}</p>
        <slot :tab="tab ?? tabs[0]?.value" />
      </div>
    </template>
  </aside>
</template>

<style>
.mc-insp { box-sizing: border-box; }
.mc-insp .body { overflow-y: auto; min-height: 0; }
.mc-insp .hd .grow .mc-skel { display: block; }
.mc-insp .tile.mc-skel { background-color: var(--surface-sunken); }
.mc-insp .body > .mc-skel { display: block; }
.mc-insp-name { margin: 0; color: var(--ink); overflow-wrap: anywhere; }
.mc-insp-desc { margin: 0; color: var(--ink-muted); font-size: 13px; line-height: 18px; }
.mc-insp-state { position: relative; }
.mc-insp-x { position: absolute; top: 12px; right: 12px; }
.mc-insp .mc-empty .art { background: var(--surface-sunken); color: var(--ink-subtle); }
</style>
