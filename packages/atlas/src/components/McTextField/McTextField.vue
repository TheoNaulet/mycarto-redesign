<script setup lang="ts">
import { computed, useId } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import type { IconName } from '../../icons/icons'

const props = withDefaults(
  defineProps<{
    /** Libellé au-dessus du champ. Toujours renseigné (sinon passer `ariaLabel`). */
    label?: string
    /** Exemple de valeur, jamais le libellé : « ex. Gestion des étudiants ». */
    placeholder?: string
    /** Message d'aide sous le champ. */
    help?: string
    /** Message d'erreur : ce qui ne va pas + comment corriger. Active l'état erreur. */
    error?: string
    required?: boolean
    disabled?: boolean
    readonly?: boolean
    /** Icône à gauche (ou à droite avec `iconEnd`). */
    icon?: IconName
    iconEnd?: IconName
    /** Unité ou suffixe affiché à droite : « € / an ». */
    suffix?: string
    /** Marque le champ comme modifié (point bleu après le libellé). */
    modified?: boolean
    type?: 'text' | 'email' | 'number' | 'date' | 'search' | 'password' | 'url'
    size?: 'sm' | 'md'
    ariaLabel?: string
  }>(),
  { type: 'text', size: 'md' },
)
const model = defineModel<string | number>()
const id = useId()
const describedBy = computed(() => (props.error ? `${id}-err` : props.help ? `${id}-help` : undefined))
</script>

<template>
  <div class="mc-field" :class="{ 'is-modified': modified }">
    <label v-if="label" class="mc-field-label" :for="id">
      {{ label }}<span v-if="required" class="mc-req" aria-hidden="true">*</span>
    </label>
    <div
      class="mc-input"
      :class="{ 'is-error': error, 'is-disabled': disabled, 'is-readonly': readonly, sm: size === 'sm' }"
    >
      <McIcon v-if="icon" :name="icon" />
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="describedBy"
        :aria-label="label ? undefined : ariaLabel"
      />
      <span v-if="suffix" class="mc-cap">{{ suffix }}</span>
      <McIcon v-if="iconEnd" :name="iconEnd" />
    </div>
    <span v-if="error" :id="`${id}-err`" class="mc-field-error" role="alert"><McIcon name="alert-octagon" size="sm" />{{ error }}</span>
    <span v-else-if="help" :id="`${id}-help`" class="mc-field-help">{{ help }}</span>
  </div>
</template>
