<script setup lang="ts">
import McToast from './McToast.vue'
import { useToast } from './useToast'

withDefaults(
  defineProps<{
    /** Positionné dans le conteneur le plus proche plutôt qu'en bas de la fenêtre (documentation). */
    contained?: boolean
    /** Distance au bas, en px. */
    offset?: number
  }>(),
  { contained: false, offset: 24 },
)

const toast = useToast()
function act(run?: () => void, id?: number) {
  run?.()
  toast.dismiss(id)
}
</script>

<template>
  <div class="mc-toast-host" :class="{ contained }" :style="{ bottom: `${offset}px` }">
    <Transition name="mc-toast">
      <McToast
        v-if="toast.current.value"
        :key="toast.current.value.id"
        :status="toast.current.value.status"
        :message="toast.current.value.message"
        :action-label="toast.current.value.actionLabel"
        :duration="toast.current.value.duration"
        :closable="toast.current.value.closable"
        @action="act(toast.current.value?.onAction, toast.current.value?.id)"
        @close="toast.dismiss(toast.current.value?.id)"
      />
    </Transition>
  </div>
</template>

<style>
.mc-toast-host { position: fixed; left: 50%; transform: translateX(-50%); z-index: 80; display: flex; justify-content: center; max-width: calc(100% - 32px); pointer-events: none; }
.mc-toast-host.contained { position: absolute; }
.mc-toast-host .mc-toast { pointer-events: auto; }
.mc-toast-enter-active { transition: opacity var(--dur-base) var(--ease-out), transform var(--dur-base) var(--ease-out); }
.mc-toast-leave-active { transition: opacity var(--dur-fast) ease-in; position: absolute; }
.mc-toast-enter-from { opacity: 0; transform: translateY(8px); }
.mc-toast-leave-to { opacity: 0; }
</style>
