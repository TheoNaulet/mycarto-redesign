// Mode modification d'une carte, sur place : la carte reste la même, ses objets deviennent modifiables.
// Chaque écran donne son état (lecture, écriture) et appelle `record()` avant chaque modification :
// on peut annuler pas à pas (bouton ou Ctrl/Cmd + Z), tout abandonner, ou terminer (publication).
import { computed, onBeforeUnmount, ref } from 'vue'
import { useToast } from '../../components/McToast/useToast'

export interface MapEditOptions<T> {
  /** Nom de la carte, pour les messages. */
  name: string
  get: () => T
  set: (v: T) => void
}

export function useMapEdit<T>(opts: MapEditOptions<T>) {
  const toast = useToast()
  const on = ref(false)
  const history = ref<string[]>([])
  let start = ''

  const snap = () => JSON.stringify(opts.get())
  const restore = (s: string) => opts.set(JSON.parse(s) as T)

  function begin() {
    start = snap()
    history.value = []
    on.value = true
  }
  /** À appeler juste avant de modifier l'état. Hors mode modification, ne fait rien. */
  function record() {
    if (on.value) history.value.push(snap())
  }
  function undo() {
    const prev = history.value.pop()
    if (prev) restore(prev)
  }
  const count = computed(() => history.value.length)
  const countLabel = computed(() => (count.value ? `${count.value} modification${count.value > 1 ? 's' : ''}` : 'Aucune modification'))

  function discard() {
    if (count.value) restore(start)
    const n = count.value
    history.value = []
    on.value = false
    if (n) toast.info('Modifications abandonnées')
  }
  function finish() {
    const n = count.value
    history.value = []
    on.value = false
    if (n) toast.success(`Carte « ${opts.name} » publiée · ${n} modification${n > 1 ? 's' : ''}`)
  }

  function onKey(e: KeyboardEvent) {
    if (!on.value) return
    const t = e.target as HTMLElement | null
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
    if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      undo()
    }
  }
  if (typeof window !== 'undefined') window.addEventListener('keydown', onKey)
  onBeforeUnmount(() => {
    if (typeof window !== 'undefined') window.removeEventListener('keydown', onKey)
  })

  return { on, count, countLabel, begin, record, undo, discard, finish }
}

export type MapEdit = ReturnType<typeof useMapEdit>
