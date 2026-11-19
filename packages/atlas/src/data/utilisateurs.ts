// Utilisateurs, groupes et profils de démonstration (écran Utilisateurs et groupes).
import { groupes } from './applications'

export type ProfileId = 'admin' | 'editeur' | 'contributeur' | 'lecteur'
export type UserStatus = 'Actif' | 'Invité' | 'Désactivé'

export interface User {
  id: number
  name: string
  email: string
  profile: ProfileId
  /** Noms des groupes. */
  groups: string[]
  /** Dernière connexion, « JJ/MM/AAAA » ; vide : jamais connecté. */
  lastSeen: string
  status: UserStatus
  color: 1 | 2 | 3 | 4 | 5 | 6
}

export interface Group {
  name: string
  description: string
}

export interface Profile {
  id: ProfileId
  label: string
  description: string
}

export interface Permission {
  id: string
  label: string
  help: string
}

export const profiles: Profile[] = [
  { id: 'admin', label: 'Administrateur', description: 'Tous les droits, y compris les utilisateurs et le méta-modèle' },
  { id: 'editeur', label: 'Éditeur', description: 'Crée, modifie et supprime les objets et les cartes' },
  { id: 'contributeur', label: 'Contributeur', description: 'Complète les fiches de ses groupes' },
  { id: 'lecteur', label: 'Lecteur', description: 'Consulte les cartes et les fiches' },
]

export const permissions: Permission[] = [
  { id: 'voir', label: 'Voir les cartes', help: 'Ouvrir les cartes, les fiches et le tableau de bord' },
  { id: 'modifier', label: 'Modifier les objets', help: 'Changer les champs et les relations' },
  { id: 'creer', label: 'Créer des objets', help: 'Ajouter des objets et importer des fichiers' },
  { id: 'supprimer', label: 'Supprimer des objets', help: 'Placer des objets dans la corbeille' },
  { id: 'cartes', label: 'Créer des cartes', help: 'Créer et modifier les modèles de carte' },
  { id: 'exporter', label: 'Exporter', help: 'Télécharger des cartes et des tableaux' },
  { id: 'dictionnaires', label: 'Gérer les dictionnaires', help: 'Ajouter ou renommer des valeurs de liste' },
  { id: 'metamodele', label: 'Modifier le méta-modèle', help: 'Types d’objets, attributs et relations' },
  { id: 'utilisateurs', label: 'Gérer les utilisateurs', help: 'Inviter, désactiver, changer les profils' },
]

/** Droits accordés par profil (l'Administrateur a tout). */
export const grants: Record<ProfileId, string[]> = {
  admin: permissions.map((p) => p.id),
  editeur: ['voir', 'modifier', 'creer', 'supprimer', 'cartes', 'exporter', 'dictionnaires'],
  contributeur: ['voir', 'modifier', 'exporter'],
  lecteur: ['voir'],
}

const descriptions: Record<string, string> = {
  'Groupe complet': 'Tout l’établissement',
  DSI: 'Direction des systèmes d’information',
  'Scolarité centrale': 'Inscriptions, examens et diplômes',
  'Direction des ressources humaines': 'Carrières, paie et formation',
  'Agence comptable': 'Budget, dépenses et recettes',
}
export const userGroups: Group[] = groupes.map((name) => ({ name, description: descriptions[name] ?? '' }))

const G = 'Groupe complet'
export const users: User[] = [
  { id: 1, name: 'Théo Naulet', email: 'theo.naulet@univ-demo.fr', profile: 'admin', groups: [G, 'DSI'], lastSeen: '19/11/2026', status: 'Actif', color: 1 },
  { id: 2, name: 'William Vochelet', email: 'william.vochelet@univ-demo.fr', profile: 'editeur', groups: [G, 'DSI'], lastSeen: '18/11/2026', status: 'Actif', color: 2 },
  { id: 3, name: 'Samuel Fourreau', email: 'samuel.fourreau@univ-demo.fr', profile: 'editeur', groups: [G, 'DSI'], lastSeen: '17/11/2026', status: 'Actif', color: 4 },
  { id: 4, name: 'Gwenaël Le Bihan', email: 'gwenael.lebihan@univ-demo.fr', profile: 'admin', groups: [G, 'DSI'], lastSeen: '14/11/2026', status: 'Actif', color: 5 },
  { id: 5, name: 'Laura Martin', email: 'laura.martin@univ-demo.fr', profile: 'contributeur', groups: [G, 'Scolarité centrale'], lastSeen: '12/11/2026', status: 'Actif', color: 3 },
  { id: 6, name: 'Claire Dubreuil', email: 'claire.dubreuil@univ-demo.fr', profile: 'contributeur', groups: [G, 'Direction des ressources humaines'], lastSeen: '06/11/2026', status: 'Actif', color: 6 },
  { id: 7, name: 'Karim Benali', email: 'karim.benali@univ-demo.fr', profile: 'contributeur', groups: [G, 'Agence comptable'], lastSeen: '28/10/2026', status: 'Actif', color: 2 },
  { id: 8, name: 'Hélène Roussel', email: 'helene.roussel@univ-demo.fr', profile: 'lecteur', groups: [G, 'Scolarité centrale'], lastSeen: '21/10/2026', status: 'Actif', color: 3 },
  { id: 9, name: 'Mathieu Garnier', email: 'mathieu.garnier@univ-demo.fr', profile: 'lecteur', groups: [G], lastSeen: '02/09/2026', status: 'Désactivé', color: 4 },
  { id: 10, name: 'Sophie Lemaire', email: 'sophie.lemaire@univ-demo.fr', profile: 'lecteur', groups: [G, 'Agence comptable'], lastSeen: '', status: 'Invité', color: 5 },
  { id: 11, name: 'Nicolas Perrin', email: 'nicolas.perrin@univ-demo.fr', profile: 'editeur', groups: [G, 'DSI'], lastSeen: '09/11/2026', status: 'Actif', color: 6 },
  { id: 12, name: 'Amélie Fontaine', email: 'amelie.fontaine@univ-demo.fr', profile: 'contributeur', groups: [G, 'Direction des ressources humaines'], lastSeen: '', status: 'Invité', color: 1 },
]
