// Macro-processus de l'établissement et diagrammes BPMN qui en décrivent certains.
// Source unique de l'écran Processus (cartographie et diagrammes) et de la liste « Diagrammes BPMN ».

export interface Proc {
  code: string
  name: string
}
export interface Macro {
  code: string
  name: string
  family: 'pilotage' | 'realisation' | 'support'
  cols: number
  processes: Proc[]
}

const p = (code: string, name: string): Proc => ({ code, name })
export const MACROS: Macro[] = [
  {
    code: 'P1',
    name: 'Gouvernance et pilotage',
    family: 'pilotage',
    cols: 5,
    processes: [
      p('P1.1', 'Définition de la stratégie de l’établissement'),
      p('P1.2', 'Pilotage budgétaire et contrôle de gestion'),
      p('P1.3', 'Démarche qualité et évaluation'),
      p('P1.4', 'Gestion des risques et conformité'),
      p('P1.5', 'Communication institutionnelle'),
    ],
  },
  {
    code: 'M1',
    name: 'Formation et vie étudiante',
    family: 'realisation',
    cols: 3,
    processes: [
      p('M1.1', 'Conception des programmes pédagogiques'),
      p('M1.2', 'Admissions et inscriptions'),
      p('M1.3', 'Organisation des cours et examens'),
      p('M1.4', 'Suivi de la scolarité et délivrance des diplômes'),
      p('M1.5', 'Accompagnement de la vie étudiante'),
    ],
  },
  {
    code: 'M2',
    name: 'Recherche et innovation',
    family: 'realisation',
    cols: 2,
    processes: [
      p('M2.1', 'Définition des axes de recherche'),
      p('M2.2', 'Gestion des projets de recherche et partenariats'),
      p('M2.3', 'Publications, colloques et diffusion'),
    ],
  },
  {
    code: 'S1',
    name: 'Support et logistique',
    family: 'support',
    cols: 3,
    processes: [
      p('S1.1', 'Gestion des infrastructures bâtiments'),
      p('S1.2', 'Gestion des ressources humaines'),
      p('S1.3', 'Gestion financière et comptable'),
      p('S1.4', 'Gestion du système d’information'),
      p('S1.5', 'Gestion des affaires juridiques'),
      p('S1.6', 'Gestion des achats et approvisionnements'),
    ],
  },
  {
    code: 'S2',
    name: 'Partenariats et relations extérieures',
    family: 'support',
    cols: 2,
    processes: [
      p('S2.1', 'Relations avec les entreprises'),
      p('S2.2', 'Relations internationales'),
      p('S2.3', 'Relations avec les collectivités'),
    ],
  },
]

/** Un diagramme BPMN enregistré. « Achat de fournitures » est dessiné en entier dans l'écran Processus ;
 * les autres sont des diagrammes simples (un couloir, une suite de tâches). */
export interface BpmnDiagram {
  code: string
  title: string
  /** Couloir unique des diagrammes simples. */
  lane?: string
  /** Tâches des diagrammes simples, dans l'ordre. */
  tasks?: string[]
  proprietaire: string
  etat: 'publie' | 'brouillon'
  /** Date de modification, ISO (AAAA-MM-JJ). */
  modifie: string
  /** Tâches et applications (magasins de données), pour la liste. */
  nbTaches: number
  nbApplications: number
}

export const BPMN_DIAGRAMS: BpmnDiagram[] = [
  { code: 'S1.6', title: 'Achat de fournitures', proprietaire: 'Isabelle Roux', etat: 'publie', modifie: '2026-11-12', nbTaches: 7, nbApplications: 3 },
  {
    code: 'M1.2',
    title: 'Inscription administrative',
    lane: 'Service de la scolarité',
    tasks: ['Recevoir le dossier', 'Vérifier les pièces', 'Encaisser les droits', 'Éditer la carte étudiante'],
    proprietaire: 'Théo Naulet',
    etat: 'publie',
    modifie: '2026-10-28',
    nbTaches: 4,
    nbApplications: 0,
  },
  {
    code: 'S1.2',
    title: 'Recrutement d’un contractuel',
    lane: 'Ressources humaines',
    tasks: ['Publier l’offre', 'Sélectionner les candidats', 'Établir le contrat'],
    proprietaire: 'Laura Martin',
    etat: 'brouillon',
    modifie: '2026-11-18',
    nbTaches: 3,
    nbApplications: 0,
  },
]
