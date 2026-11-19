<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'
import McIcon from '../../icons/McIcon.vue'

const props = withDefaults(
  defineProps<{
    /** ok : action réussie ; critical : échec ; info : information neutre. */
    status?: 'ok' | 'critical' | 'info'
    /** Le fait, au passé : « Application enregistrée ». Erreur : ce qui a échoué + quoi faire. */
    message: string
    /** Action en jaune : « Annuler », « Réessayer ». Émet `action`. */
    actionLabel?: string
    /** Affiche la croix de fermeture. */
    closable?: boolean
    /** Disparition automatique en ms (0 : reste jusqu'à fermeture). Par défaut 4000 pour ok et info, 0 pour critical. */
    duration?: number
  }>(),
  { status: 'ok', actionLabel: undefined, closable: true, duration: undefined },
)

const emit = defineEmits<{
  /** Clic sur l'action. */
  action: []
  /** Fermeture : croix, Échap ou fin du délai. */
  close: []
}>()

const icon = { ok: 'check', critical: 'alert-octagon', info: 'info' } as const
const ms = computed(() => props.duration ?? (props.status === 'critical' ? 0 : 4000))

let timer: ReturnType<typeof setTimeout> | undefined
let left = 0
let started = 0
function start(t: number) {
  if (!t) return
  left = t
  started = Date.now()
  timer = setTimeout(() => emit('close'), t)
}
/** Le délai s'arrête pendant le survol ou le focus, pour laisser le temps de lire ou d'agir. */
function pause() {
  if (!timer) return
  clearTimeout(timer)
  timer = undefined
  left -= Date.now() - started
}
function resume() {
  if (ms.value && !timer) start(Math.max(left, 1500))
}
onMounted(() => start(ms.value))
onBeforeUnmount(() => clearTimeout(timer))
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.closable) emit('close')
}
</script>

<template>
  <div
    class="mc-toast"
    :role="status === 'critical' ? 'alert' : 'status'"
    :aria-live="status === 'critical' ? 'assertive' : 'polite'"
    @mouseenter="pause"
    @mouseleave="resume"
    @focusin="pause"
    @focusout="resume"
    @keydown="onKey"
  >
    <span class="st" :class="status"><McIcon :name="icon[status]" size="sm" /></span>
    <span class="grow">{{ message }}</span>
    <button v-if="actionLabel" type="button" class="act" @click="emit('action')">{{ actionLabel }}</button>
    <button v-if="closable" type="button" class="x mc-toast-x" aria-label="Fermer le message" @click="emit('close')">
      <McIcon name="x" size="sm" />
    </button>
  </div>
</template>

<style>
.mc-toast { box-sizing: border-box; }
.mc-toast .act:hover { text-decoration: underline; }
.mc-toast .mc-toast-x { border: 0; background: transparent; border-radius: 6px; cursor: pointer; }
.mc-toast .mc-toast-x:hover { color: var(--on-navy); background: color-mix(in srgb, var(--on-navy) 12%, transparent); }
.mc-toast .act:focus-visible, .mc-toast .mc-toast-x:focus-visible { outline-color: var(--yellow); }
</style>
