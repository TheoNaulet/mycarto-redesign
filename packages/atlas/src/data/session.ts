// État de la session de démonstration, partagé entre les écrans : ce qui a été supprimé pendant la visite.
// Les objets supprimés vont dans la corbeille (src/data/corbeille.ts), d'où l'écran Corbeille les lit à l'ouverture.
import { reactive } from 'vue'
import { TRASH_TODAY, trashItems, type TrashTypeId } from './corbeille'
import { slugOf } from './applications'

/** Identifiants (slugs) des applications supprimées pendant la session. */
export const deletedApps = reactive(new Set<string>())

/** Place des objets dans la corbeille (en tête, datés d'aujourd'hui). Renvoie de quoi annuler. */
export function moveToTrash(names: string[], type: TrashTypeId = 'application', by = 'Théo Naulet'): () => void {
  let id = Math.max(0, ...trashItems.map((x) => x.id))
  const added = names.map((name) => ({ id: ++id, type, name, deletedBy: by, deletedAt: TRASH_TODAY }))
  trashItems.unshift(...added)
  if (type === 'application') names.forEach((n) => deletedApps.add(slugOf(n)))
  return () => {
    for (const a of added) {
      const i = trashItems.findIndex((x) => x.id === a.id)
      if (i >= 0) trashItems.splice(i, 1)
    }
    if (type === 'application') names.forEach((n) => deletedApps.delete(slugOf(n)))
  }
}

/** Sort une application de la corbeille (restauration depuis sa fiche). */
export function restoreFromTrash(name: string, type: TrashTypeId = 'application') {
  for (let i = trashItems.length - 1; i >= 0; i--) if (trashItems[i].type === type && trashItems[i].name === name) trashItems.splice(i, 1)
  if (type === 'application') deletedApps.delete(slugOf(name))
}
