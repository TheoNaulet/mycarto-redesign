// Journal des modifications : ce qui a changé dans la cartographie, toutes cartes et tous objets confondus.
// Les lignes de la carte « Applications et flux de Scolarité » ouvrent la comparaison de versions (écran Historique).
import type { TrashTypeId } from './corbeille'

export type JournalKind = 'add' | 'mod' | 'del' | 'pub'

export const journalKinds: Record<JournalKind, { label: string; icon: 'plus' | 'pencil' | 'trash' | 'check-circle' }> = {
  add: { label: 'Ajout', icon: 'plus' },
  mod: { label: 'Modification', icon: 'pencil' },
  del: { label: 'Suppression', icon: 'trash' },
  pub: { label: 'Publication', icon: 'check-circle' },
}

export interface JournalEntry {
  id: number
  kind: JournalKind
  /** Type de l'objet touché (mêmes types que la corbeille). */
  type: TrashTypeId
  objet: string
  texte: string
  /** Carte où le changement a été fait, s'il y en a une. */
  carte?: string
  par: string
  /** Date ISO (AAAA-MM-JJ) et heure (HH:MM). */
  date: string
  heure: string
}

/** La carte dont l'historique est dessiné en entier (écran Historique). */
export const CARTE_SCOLARITE = 'Applications et flux de Scolarité'

const rows: Omit<JournalEntry, 'id'>[] = [
  { kind: 'mod', type: 'flux', objet: 'Maj des données étudiantes', texte: 'Passé en synchrone', carte: CARTE_SCOLARITE, par: 'ABP', date: '2026-11-19', heure: '11:28' },
  { kind: 'mod', type: 'machine', objet: 'sophocle', texte: 'Composant Tomcat 5 marqué « à migrer »', carte: CARTE_SCOLARITE, par: 'William Vidal', date: '2026-11-19', heure: '10:02' },
  { kind: 'del', type: 'application', objet: 'GEST-STAGES', texte: 'Mise à la corbeille', par: 'Théo Naulet', date: '2026-11-18', heure: '17:05' },
  { kind: 'add', type: 'logiciel', objet: 'Talend ESB', texte: 'Ajouté, relié à APOGEE par « Synchro des comptes »', carte: CARTE_SCOLARITE, par: 'Samuel Faure', date: '2026-11-18', heure: '16:40' },
  { kind: 'del', type: 'application', objet: 'SANGRIA', texte: 'Retirée du domaine Scolarité', carte: CARTE_SCOLARITE, par: 'Samuel Faure', date: '2026-11-18', heure: '16:12' },
  { kind: 'mod', type: 'processus', objet: 'Recrutement d’un contractuel', texte: 'Diagramme BPMN : 3 tâches', par: 'Laura Martin', date: '2026-11-18', heure: '14:30' },
  { kind: 'pub', type: 'carte', objet: 'Machines nécessaires à APOGEE', texte: 'Nouvelle version publiée', carte: 'Machines nécessaires à APOGEE', par: 'William Vidal', date: '2026-11-18', heure: '09:47' },
  { kind: 'add', type: 'application', objet: 'ASTRE RH', texte: 'Ajoutée (statut Prévue)', carte: CARTE_SCOLARITE, par: 'Théo Naulet', date: '2026-11-17', heure: '09:15' },
  { kind: 'mod', type: 'contrat', objet: 'CONT000027', texte: 'Échéance repoussée au 31/12/2027', par: 'Isabelle Roux', date: '2026-11-16', heure: '15:22' },
  { kind: 'del', type: 'machine', objet: 'eschyle', texte: 'Mise à la corbeille', carte: 'Machines nécessaires à APOGEE', par: 'Samuel Faure', date: '2026-11-16', heure: '11:03' },
  { kind: 'mod', type: 'application', objet: 'APOGEE', texte: 'Référent technique : William Vidal', par: 'Théo Naulet', date: '2026-11-14', heure: '10:41' },
  { kind: 'add', type: 'processus', objet: 'Achat de fournitures', texte: 'Magasin de données CARAMBOLE relié à « Passer une commande »', par: 'Isabelle Roux', date: '2026-11-12', heure: '16:18' },
  { kind: 'pub', type: 'carte', objet: CARTE_SCOLARITE, texte: 'Nouvelle version publiée', carte: CARTE_SCOLARITE, par: 'Théo Naulet', date: '2026-11-12', heure: '12:00' },
  { kind: 'mod', type: 'fournisseur', objet: 'Cocktail', texte: 'Adresse du support mise à jour', par: 'Laura Martin', date: '2026-11-10', heure: '14:56' },
  { kind: 'add', type: 'flux', objet: 'Export des inscrits vers MOODLE', texte: 'Ajouté entre APOGEE et MOODLE', carte: CARTE_SCOLARITE, par: 'William Vidal', date: '2026-11-07', heure: '09:30' },
  { kind: 'mod', type: 'domaine', objet: 'Ressources humaines', texte: 'Responsable : Laura Martin', par: 'Gwenaël Le Bihan', date: '2026-11-05', heure: '17:44' },
]

export const journalEntries: JournalEntry[] = rows.map((r, i) => ({ id: i + 1, ...r }))
