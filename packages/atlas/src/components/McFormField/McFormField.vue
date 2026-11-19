<script setup lang="ts">
import { computed, useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import McIconButton from '../McIconButton/McIconButton.vue'

const props = withDefaults(
  defineProps<{
    /** Libellé au-dessus du champ, en ink-muted. */
    label: string
    /** Champ obligatoire : astérisque rouge après le libellé. */
    required?: boolean
    /** Message d'aide sous le champ. */
    help?: string
    /** Message d'erreur : ce qui ne va pas + comment corriger. Remplace l'aide. */
    error?: string
    /** Valeur modifiée : point accent après le libellé et bouton ↺ pour revenir à la valeur d'origine. */
    modified?: boolean
    /** Affiche le bouton ↺ quand le champ est modifié (émet `reset`). */
    resettable?: boolean
    /** Ligne inactive (libellé estompé). Désactiver aussi le champ lui-même. */
    disabled?: boolean
    /** Identifiant du champ natif placé dans le slot, pour relier le libellé. Par défaut, généré et transmis au slot. */
    controlId?: string
  }>(),
  { required: false, help: undefined, error: undefined, modified: false, resettable: true, disabled: false, controlId: undefined },
)

defineEmits<{ /** Clic sur ↺ : revenir à la valeur d'origine. */ reset: [] }>()

defineSlots<{
  /** Le champ : TextField, Select, date… Reçoit l'identifiant et les attributs d'accessibilité à poser sur un champ natif. */
  default(props: { id: string; describedBy: string | undefined; invalid: boolean; label: string }): unknown
  /** Actions de la valeur, à droite du champ : + créer, ↗ ouvrir la fiche. */
  actions?(): unknown
}>()

const uid = useId()
const id = computed(() => props.controlId ?? `${uid}-control`)
const describedBy = computed(() => (props.error ? `${uid}-err` : props.help ? `${uid}-help` : undefined))
</script>

<template>
  <div class="mc-field mc-form-field" :class="{ 'is-modified': modified, 'is-disabled': disabled, 'is-error': error }">
    <label class="mc-field-label" :for="id">
      {{ label }}<span v-if="required" class="mc-req" aria-hidden="true">*</span>
      <span v-if="modified" class="mc-sr">(modifié)</span>
    </label>
    <div class="mc-field-line">
      <div class="mc-form-field-control">
        <slot :id="id" :describedBy="describedBy" :invalid="!!error" :label="label" />
      </div>
      <slot name="actions" />
      <McIconButton
        v-if="modified && resettable"
        size="sm"
        icon="undo"
        :label="`Revenir à la valeur d'origine de ${label}`"
        :disabled="disabled"
        @click="$emit('reset')"
      />
    </div>
    <span v-if="error" :id="`${uid}-err`" class="mc-field-error" role="alert"><McIcon name="alert-octagon" size="sm" />{{ error }}</span>
    <span v-else-if="help" :id="`${uid}-help`" class="mc-field-help">{{ help }}</span>
  </div>
</template>

<style>
.mc-form-field .mc-field-line { align-items: flex-start; gap: 4px; }
.mc-form-field .mc-field-line > .mc-ibtn { margin-top: 2px; }
.mc-form-field-control { flex: 1; min-width: 0; margin-right: 4px; }
.mc-form-field.is-error .mc-form-field-control .mc-input { border-color: var(--status-critical); box-shadow: 0 0 0 3px var(--status-critical-soft); }
.mc-form-field.is-disabled .mc-field-label { color: var(--ink-subtle); }
</style>
