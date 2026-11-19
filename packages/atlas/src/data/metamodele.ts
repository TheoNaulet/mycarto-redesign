// Méta-modèle de démonstration : les types d'objets de la cartographie, rangés par couche, avec leurs attributs
// et leurs relations. Mêmes identifiants et libellés que l'arbre de l'explorateur.
import type { IconName } from '../icons/icons'
import type { Layer } from '../utils/types'

export type AttributeKind = 'Texte' | 'Texte long' | 'Nombre' | 'Date' | 'Liste (dictionnaire)' | 'Booléen' | 'Niveau DICP' | 'Lien'
export const attributeKinds: AttributeKind[] = ['Texte', 'Texte long', 'Nombre', 'Date', 'Liste (dictionnaire)', 'Booléen', 'Niveau DICP', 'Lien']

/** 0..1 : facultatif, un au plus ; 1 : exactement un ; 0..n : plusieurs, facultatif ; 1..n : au moins un. */
export type Cardinality = '0..1' | '1' | '0..n' | '1..n'

export interface Attribute {
  id: string
  name: string
  type: AttributeKind
  required: boolean
  /** Dictionnaire qui donne les valeurs (type « Liste »). */
  dictionnaire?: string
}

export interface Relation {
  /** Verbe, écrit pour le type source : « Hébergée sur ». */
  verb: string
  /** Type cible. */
  target: string
  cardinality: Cardinality
  /** Type d'objet qui porte la relation (« via les flux »). */
  via?: string
}

export interface ObjectType {
  id: string
  label: string
  /** Nom commun au singulier et au pluriel, pour les phrases. */
  one: string
  many: string
  feminine: boolean
  icon: IconName
  layer: Layer
  /** Groupe de l'arbre. */
  group: string
  attributes: Attribute[]
  relations: Relation[]
}

/** Dictionnaires proposés pour les attributs de type liste. */
export const dictionnaireNames = [
  'Contribution Flux',
  'Statuts d’application',
  'Types d’hébergement',
  'Natures',
  'Niveaux DICP',
  'Fréquences de flux',
  'Types de liaison',
  'Niveaux de processus',
  'Types d’acteur',
  'Types de partenaire',
  'Statuts de projet',
  'Modes de reconduction',
  'Environnements',
  'Sites',
  'Types de licence',
  'Types de tâche',
  'Zones du POS',
]

export const typeGroups: { id: string; label: string; layer: Layer }[] = [
  { id: 'metier', label: 'Couche métier', layer: 'metier' },
  { id: 'fonctionnel', label: 'Couche fonctionnelle', layer: 'fonctionnel' },
  { id: 'applicatif', label: 'Couche applicative', layer: 'applicatif' },
  { id: 'technique', label: 'Couche technique', layer: 'technique' },
  { id: 'bpmn', label: 'Processus (BPMN)', layer: 'metier' },
]

type A = [name: string, type: AttributeKind, required?: boolean, dictionnaire?: string]
type R = [verb: string, target: string, cardinality: Cardinality, via?: string]
type Seed = Omit<ObjectType, 'attributes' | 'relations'> & { attributes: A[]; relations: R[] }

const seeds: Seed[] = [
  {
    id: 'domaine', label: 'Domaine', one: 'domaine', many: 'domaines', feminine: false, icon: 'folder', layer: 'metier', group: 'metier',
    attributes: [['Nom', 'Texte', true], ['Description', 'Texte long'], ['Responsable', 'Texte'], ['Couleur sur les cartes', 'Texte']],
    relations: [['Regroupe', 'processus', '0..n'], ['Est découpé en', 'domaine', '0..n']],
  },
  {
    id: 'processus', label: 'Processus', one: 'processus', many: 'processus', feminine: false, icon: 'process', layer: 'metier', group: 'metier',
    attributes: [['Nom', 'Texte', true], ['Description', 'Texte long'], ['Niveau', 'Liste (dictionnaire)', true, 'Niveaux de processus'], ['Propriétaire', 'Texte']],
    relations: [['Appartient à', 'domaine', '1'], ['Est réalisé par', 'acteur', '0..n'], ['Est décrit par', 'diagramme', '0..1'], ['S’appuie sur', 'application', '0..n']],
  },
  {
    id: 'acteur', label: 'Acteur', one: 'acteur', many: 'acteurs', feminine: false, icon: 'user', layer: 'metier', group: 'metier',
    attributes: [['Nom', 'Texte', true], ['Type', 'Liste (dictionnaire)', true, 'Types d’acteur'], ['Effectif', 'Nombre'], ['Adresse de contact', 'Texte']],
    relations: [['Est rattaché à', 'acteur', '0..1'], ['Utilise', 'application', '0..n']],
  },
  {
    id: 'bloc', label: 'Bloc fonctionnel', one: 'bloc fonctionnel', many: 'blocs fonctionnels', feminine: false, icon: 'pos', layer: 'fonctionnel', group: 'fonctionnel',
    attributes: [['Nom', 'Texte', true], ['Description', 'Texte long'], ['Zone du POS', 'Liste (dictionnaire)', true, 'Zones du POS']],
    relations: [['Regroupe', 'fonction', '1..n']],
  },
  {
    id: 'fonction', label: 'Fonction', one: 'fonction', many: 'fonctions', feminine: true, icon: 'list', layer: 'fonctionnel', group: 'fonctionnel',
    attributes: [['Nom', 'Texte', true], ['Description', 'Texte long'], ['Couverture attendue', 'Liste (dictionnaire)', false, 'Niveaux de processus']],
    relations: [['Appartient à', 'bloc', '1'], ['Est réalisée par', 'application', '0..n']],
  },
  {
    id: 'application', label: 'Application', one: 'application', many: 'applications', feminine: true, icon: 'app', layer: 'applicatif', group: 'applicatif',
    attributes: [
      ['Nom', 'Texte', true],
      ['Description', 'Texte long', true],
      ['Nature', 'Liste (dictionnaire)', true, 'Natures'],
      ['Statut', 'Liste (dictionnaire)', true, 'Statuts d’application'],
      ['Type d’hébergement', 'Liste (dictionnaire)', true, 'Types d’hébergement'],
      ['Mise en service', 'Date', true],
      ['Fin de service', 'Date'],
      ['Disponibilité', 'Niveau DICP', true],
      ['Intégrité', 'Niveau DICP', true],
      ['Confidentialité', 'Niveau DICP', true],
      ['Preuve', 'Niveau DICP'],
      ['Coût total de possession', 'Nombre'],
      ['Nombre d’utilisateurs', 'Nombre'],
      ['Documentation', 'Lien'],
    ],
    relations: [
      ['Appartient à', 'domaine', '1..n'],
      ['Est hébergée sur', 'machine', '0..n'],
      ['Échange avec', 'application', '0..n', 'flux'],
      ['Est fournie par', 'fournisseur', '0..1'],
      ['Est couverte par', 'contrat', '0..n'],
      ['Réalise', 'fonction', '0..n'],
    ],
  },
  {
    id: 'flux', label: 'Flux', one: 'flux', many: 'flux', feminine: false, icon: 'flow', layer: 'applicatif', group: 'applicatif',
    attributes: [
      ['Nom', 'Texte', true],
      ['Description', 'Texte long'],
      ['Type de liaison', 'Liste (dictionnaire)', true, 'Types de liaison'],
      ['Fréquence', 'Liste (dictionnaire)', true, 'Fréquences de flux'],
      ['Contribution', 'Liste (dictionnaire)', false, 'Contribution Flux'],
      ['Données personnelles', 'Booléen'],
    ],
    relations: [['Part de', 'application', '1'], ['Arrive à', 'application', '0..1'], ['Échange avec', 'partenaire', '0..1']],
  },
  {
    id: 'partenaire', label: 'Partenaire', one: 'partenaire', many: 'partenaires', feminine: false, icon: 'globe', layer: 'applicatif', group: 'applicatif',
    attributes: [['Nom', 'Texte', true], ['Type', 'Liste (dictionnaire)', true, 'Types de partenaire'], ['Site web', 'Lien']],
    relations: [['Échange avec', 'application', '0..n', 'flux']],
  },
  {
    id: 'projet', label: 'Projet', one: 'projet', many: 'projets', feminine: false, icon: 'project', layer: 'applicatif', group: 'applicatif',
    attributes: [['Nom', 'Texte', true], ['Statut', 'Liste (dictionnaire)', true, 'Statuts de projet'], ['Chef de projet', 'Texte'], ['Début', 'Date'], ['Fin', 'Date'], ['Budget', 'Nombre']],
    relations: [['Modifie', 'application', '1..n'], ['Est piloté par', 'acteur', '0..1']],
  },
  {
    id: 'fournisseur', label: 'Fournisseur', one: 'fournisseur', many: 'fournisseurs', feminine: false, icon: 'building', layer: 'applicatif', group: 'applicatif',
    attributes: [['Nom', 'Texte', true], ['SIRET', 'Texte'], ['Site web', 'Lien'], ['Contact', 'Texte']],
    relations: [['Signe', 'contrat', '0..n'], ['Édite', 'logiciel', '0..n']],
  },
  {
    id: 'contrat', label: 'Contrat', one: 'contrat', many: 'contrats', feminine: false, icon: 'contract', layer: 'applicatif', group: 'applicatif',
    attributes: [
      ['Référence', 'Texte', true],
      ['Objet', 'Texte long'],
      ['Début', 'Date', true],
      ['Fin', 'Date'],
      ['Reconduction', 'Liste (dictionnaire)', false, 'Modes de reconduction'],
      ['Montant annuel', 'Nombre'],
    ],
    relations: [['Est signé avec', 'fournisseur', '1'], ['Couvre', 'application', '1..n']],
  },
  {
    id: 'machine', label: 'Machine', one: 'machine', many: 'machines', feminine: true, icon: 'server', layer: 'technique', group: 'technique',
    attributes: [
      ['Nom', 'Texte', true],
      ['Système d’exploitation', 'Texte'],
      ['Environnement', 'Liste (dictionnaire)', true, 'Environnements'],
      ['Site', 'Liste (dictionnaire)', false, 'Sites'],
      ['Virtuelle', 'Booléen'],
      ['Adresse IP', 'Texte'],
    ],
    relations: [['Héberge', 'composant', '0..n'], ['Est virtualisée sur', 'machine', '0..1']],
  },
  {
    id: 'composant', label: 'Composant', one: 'composant', many: 'composants', feminine: false, icon: 'chip', layer: 'technique', group: 'technique',
    attributes: [['Nom', 'Texte', true], ['Version', 'Texte'], ['Port', 'Nombre']],
    relations: [['Est installé sur', 'machine', '1'], ['Est une instance de', 'logiciel', '1'], ['Sert', 'application', '1..n']],
  },
  {
    id: 'logiciel', label: 'Logiciel', one: 'logiciel', many: 'logiciels', feminine: false, icon: 'software', layer: 'technique', group: 'technique',
    attributes: [['Nom', 'Texte', true], ['Version', 'Texte', true], ['Fin de support', 'Date'], ['Licence', 'Liste (dictionnaire)', false, 'Types de licence']],
    relations: [['Est édité par', 'fournisseur', '0..1']],
  },
  {
    id: 'diagramme', label: 'Diagramme', one: 'diagramme', many: 'diagrammes', feminine: false, icon: 'process', layer: 'metier', group: 'bpmn',
    attributes: [['Nom', 'Texte', true], ['Version', 'Texte'], ['Publié', 'Booléen']],
    relations: [['Décrit', 'processus', '1'], ['Contient', 'tache', '1..n']],
  },
  {
    id: 'tache', label: 'Tâche', one: 'tâche', many: 'tâches', feminine: true, icon: 'check-circle', layer: 'metier', group: 'bpmn',
    attributes: [['Nom', 'Texte', true], ['Type', 'Liste (dictionnaire)', true, 'Types de tâche'], ['Durée en jours', 'Nombre']],
    relations: [['Appartient à', 'diagramme', '1'], ['Est réalisée par', 'acteur', '0..1'], ['Utilise', 'application', '0..n']],
  },
]

export const objectTypes: ObjectType[] = seeds.map((s) => ({
  ...s,
  attributes: s.attributes.map(([name, type, required, dictionnaire], i) => ({ id: `${s.id}-${i + 1}`, name, type, required: !!required, ...(dictionnaire ? { dictionnaire } : {}) })),
  relations: s.relations.map(([verb, target, cardinality, via]) => ({ verb, target, cardinality, ...(via ? { via } : {}) })),
}))

export const objectType = (id: string) => objectTypes.find((t) => t.id === id)

/** Cardinalité en mots courts, accordés au genre de la cible : « aucune ou une », « plusieurs ». */
export function cardinalityWords(c: Cardinality, feminine: boolean): string {
  switch (c) {
    case '0..1':
      return feminine ? 'aucune ou une' : 'aucun ou un'
    case '1':
      return feminine ? 'exactement une' : 'exactement un'
    case '0..n':
      return 'plusieurs'
    case '1..n':
      return feminine ? 'une ou plusieurs' : 'un ou plusieurs'
  }
}

/** Relation obligatoire (au moins une cible). */
export const isMandatory = (c: Cardinality) => c === '1' || c === '1..n'

/** La cible avec sa cardinalité : « un ou plusieurs domaines », « aucun ou un fournisseur ». */
export function targetPhrase(c: Cardinality, target: ObjectType): string {
  const many = c === '0..n' || c === '1..n'
  return `${cardinalityWords(c, target.feminine)} ${many ? target.many : target.one}`
}
