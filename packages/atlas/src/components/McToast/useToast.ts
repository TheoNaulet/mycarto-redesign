import { readonly, shallowRef } from 'vue'

/** Un message à afficher dans `McToastHost`. */
export interface ToastOptions {
  /** ok : action réussie ; critical : échec ; info : information neutre. */
  status?: 'ok' | 'critical' | 'info'
  /** Le fait, au passé : « Application enregistrée ». */
  message: string
  /** Action en jaune : « Annuler », « Réessayer ». */
  actionLabel?: string
  /** Appelé au clic sur l'action ; le toast se ferme ensuite. */
  onAction?: () => void
  /** Disparition automatique en ms (0 : reste). Par défaut 4000 pour ok et info, 0 pour critical. */
  duration?: number
  /** Affiche la croix de fermeture. */
  closable?: boolean
}

export interface ActiveToast extends ToastOptions {
  id: number
}

// Un seul toast à la fois, partagé par toute l'application : le suivant remplace le précédent.
const current = shallowRef<ActiveToast | null>(null)
let seq = 0

function show(options: ToastOptions): number {
  seq += 1
  current.value = { status: 'ok', closable: true, ...options, id: seq }
  return seq
}
function dismiss(id?: number) {
  if (id === undefined || current.value?.id === id) current.value = null
}

/**
 * Affiche des toasts depuis n'importe quel composant. Monter un seul `McToastHost` dans l'application.
 *
 * ```ts
 * const toast = useToast()
 * toast.success('Application enregistrée', { actionLabel: 'Annuler', onAction: undo })
 * toast.error('Export impossible : la carte dépasse 2 000 nœuds. Filtrez-la puis réessayez.')
 * ```
 */
export function useToast() {
  return {
    /** Toast affiché, ou null. */
    current: readonly(current),
    show,
    /** Succès, 4 s. */
    success: (message: string, options: Omit<ToastOptions, 'message' | 'status'> = {}) => show({ ...options, message, status: 'ok' }),
    /** Échec : reste jusqu'à fermeture. */
    error: (message: string, options: Omit<ToastOptions, 'message' | 'status'> = {}) => show({ ...options, message, status: 'critical' }),
    /** Information neutre, 4 s. */
    info: (message: string, options: Omit<ToastOptions, 'message' | 'status'> = {}) => show({ ...options, message, status: 'info' }),
    dismiss,
  }
}
