// Données de l'explorateur. Les 65 applications viennent de la source unique src/data/applications.ts.
import { ref } from 'vue'
import type { TreeNode } from '../../components/McTree/McTree.vue'
import { appRows, catalogue, contracts, domainNames, inventory, supplierSeeds, type Application, type AppRow, type Domaine } from '../../data/applications'

export type { AppRow, Domaine, Hebergement, Nature, Obsolescence, Statut } from '../../data/applications'
export { appRows as applications, editeurs, groupes, machines } from '../../data/applications'

/** Les types d'objets rangés par couche, avec le nombre d'occurrences. */
export const typeTree: TreeNode[] = [
  {
    id: 'metier',
    label: 'Couche métier',
    layer: 'metier',
    children: [
      { id: 'domaine', label: 'Domaine', count: domainNames.length },
      { id: 'processus', label: 'Processus', count: catalogue.processus },
      { id: 'acteur', label: 'Acteur', count: 12 },
    ],
  },
  {
    id: 'fonctionnel',
    label: 'Couche fonctionnelle',
    layer: 'fonctionnel',
    children: [
      { id: 'bloc', label: 'Bloc fonctionnel', count: 14 },
      { id: 'fonction', label: 'Fonction', count: 46 },
    ],
  },
  {
    id: 'applicatif',
    label: 'Couche applicative',
    layer: 'applicatif',
    children: [
      { id: 'application', label: 'Application', count: inventory.length },
      { id: 'flux', label: 'Flux' },
      { id: 'partenaire', label: 'Partenaire' },
      { id: 'projet', label: 'Projet' },
      { id: 'fournisseur', label: 'Fournisseur', count: supplierSeeds.length },
      { id: 'contrat', label: 'Contrat', count: contracts.length },
    ],
  },
  {
    id: 'technique',
    label: 'Couche technique',
    layer: 'technique',
    children: [
      { id: 'machine', label: 'Machine', count: catalogue.machines },
      { id: 'composant', label: 'Composant', count: catalogue.composants },
      { id: 'logiciel', label: 'Logiciel', count: catalogue.logiciels },
    ],
  },
  {
    id: 'bpmn',
    label: 'Processus (BPMN)',
    layer: 'metier',
    children: [
      { id: 'diagramme', label: 'Diagramme', count: 6 },
      { id: 'tache', label: 'Tâche', count: 54 },
    ],
  },
]

/** Pluriel et couche de chaque type, pour le titre de la liste. */
export const typeInfo: Record<string, { plural: string; layer: string; one: string; many: string; feminine: boolean }> = {
  domaine: { plural: 'Domaines', layer: 'Couche métier', one: 'domaine', many: 'domaines', feminine: false },
  processus: { plural: 'Processus', layer: 'Couche métier', one: 'processus', many: 'processus', feminine: false },
  acteur: { plural: 'Acteurs', layer: 'Couche métier', one: 'acteur', many: 'acteurs', feminine: false },
  bloc: { plural: 'Blocs fonctionnels', layer: 'Couche fonctionnelle', one: 'bloc fonctionnel', many: 'blocs fonctionnels', feminine: false },
  fonction: { plural: 'Fonctions', layer: 'Couche fonctionnelle', one: 'fonction', many: 'fonctions', feminine: true },
  application: { plural: 'Applications', layer: 'Couche applicative', one: 'application', many: 'applications', feminine: true },
  flux: { plural: 'Flux', layer: 'Couche applicative', one: 'flux', many: 'flux', feminine: false },
  partenaire: { plural: 'Partenaires', layer: 'Couche applicative', one: 'partenaire', many: 'partenaires', feminine: false },
  projet: { plural: 'Projets', layer: 'Couche applicative', one: 'projet', many: 'projets', feminine: false },
  fournisseur: { plural: 'Fournisseurs', layer: 'Couche applicative', one: 'fournisseur', many: 'fournisseurs', feminine: false },
  contrat: { plural: 'Contrats', layer: 'Couche applicative', one: 'contrat', many: 'contrats', feminine: false },
  machine: { plural: 'Machines', layer: 'Couche technique', one: 'machine', many: 'machines', feminine: true },
  composant: { plural: 'Composants', layer: 'Couche technique', one: 'composant', many: 'composants', feminine: false },
  logiciel: { plural: 'Logiciels', layer: 'Couche technique', one: 'logiciel', many: 'logiciels', feminine: false },
  diagramme: { plural: 'Diagrammes', layer: 'Processus (BPMN)', one: 'diagramme', many: 'diagrammes', feminine: false },
  tache: { plural: 'Tâches', layer: 'Processus (BPMN)', one: 'tâche', many: 'tâches', feminine: true },
}

/** Les lignes de l'explorateur pendant la session : modifications, créations et imports y restent d'une visite à l'autre.
 * Les applications supprimées restent ici mais sont masquées (voir deletedApps dans src/data/session.ts). */
export const sessionRows = ref<AppRow[]>(appRows.map((a) => ({ ...a, dicp: { ...a.dicp } })))

/** Date du jour au format français (JJ/MM/AAAA). */
export const today = () => new Date().toLocaleDateString('fr-FR')
/** Une ligne vide, pour une application créée ou importée. */
export function blankRow(id: number): AppRow {
  return {
    id, name: '', nature: 'Application', statut: 'Prévue', obsolescence: null, hebergement: 'On-premise', description: '', domaine: 'Scolarité', editeur: null,
    groupe: 'Groupe complet', miseEnService: '', finDeService: '', machine: '', cout: '', dicp: { d: 0, i: 0, c: 0, p: 0 }, flux: 0, creee: today(), modifiee: today(),
  }
}
/** Une application connue des autres écrans mais pas encore de l'inventaire, en ligne d'explorateur. */
export function rowFromApp(a: Application, id: number): AppRow {
  return {
    ...blankRow(id),
    name: a.name,
    nature: a.nature ?? 'Application',
    statut: a.statut ?? 'Prévue',
    obsolescence: a.obsolescence,
    hebergement: a.hebergement ?? 'On-premise',
    description: a.description ?? '',
    domaine: (a.domaines[0] ?? 'Scolarité') as Domaine,
    editeur: a.editeur ?? a.fournisseur,
    groupe: a.groupe ?? 'Groupe complet',
    miseEnService: a.miseEnService ?? '',
    finDeService: a.finDeService ?? '',
    machine: a.hosts[0]?.name ?? '',
    cout: a.cout ?? '',
    dicp: { ...a.dicp },
    flux: a.flux,
    creee: a.creee ?? today(),
    modifiee: a.modifiee ?? today(),
  }
}
