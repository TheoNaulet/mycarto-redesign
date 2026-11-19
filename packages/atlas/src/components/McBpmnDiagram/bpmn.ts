import { EDGE_GAP } from '../../utils/geo'

/** Un couloir (lane) : un acteur du processus. */
export interface McBpmnLane {
  id: string
  /** Nom de l'acteur : « Service demandeur ». */
  label: string
}

/** Forme BPMN : début, fin, tâche, passerelle exclusive, objet de données, magasin de données (= application). */
export type McBpmnKind = 'start' | 'end' | 'task' | 'gateway' | 'data' | 'store'

/** Un élément du diagramme. `x` et `y` donnent son centre ; `y` se compte depuis le haut de son couloir. */
export interface McBpmnNode {
  id: string
  kind: McBpmnKind
  /** Identifiant du couloir. */
  lane: string
  x: number
  y: number
  /** Libellé : « Faire une demande d'achat », « AMANDE ». */
  label: string
  /** Sélectionné : contour accent. */
  selected?: boolean
}

/** Un lien : séquence (trait plein fléché) ou association (pointillé). */
export interface McBpmnFlow {
  from: string
  to: string
  kind: 'sequence' | 'association'
  /** Libellé près du départ : « oui », « non ». */
  label?: string
}

/** Le modèle complet d'un diagramme. */
export interface McBpmnModel {
  lanes: McBpmnLane[]
  nodes: McBpmnNode[]
  flows: McBpmnFlow[]
}

/** Demi-largeur et demi-hauteur de chaque forme. */
export const BPMN_SIZE: Record<McBpmnKind, { hw: number; hh: number }> = {
  start: { hw: 15, hh: 15 },
  end: { hw: 15, hh: 15 },
  task: { hw: 65, hh: 24 },
  gateway: { hw: 28, hh: 28 },
  data: { hw: 16, hh: 20 },
  store: { hw: 28, hh: 22 },
}

export interface Placed {
  cx: number
  cy: number
  hw: number
  hh: number
}

/**
 * Tracé orthogonal simple : droit quand les centres sont alignés,
 * sinon vertical depuis la source puis horizontal jusqu'au bord de la cible.
 * Une séquence s'arrête EDGE_GAP avant la cible pour laisser la place à la pointe.
 */
export function routeBpmn(s: Placed, t: Placed, sequence: boolean): { d: string; lx: number; ly: number } {
  const gap = sequence ? EDGE_GAP : 0
  const dx = t.cx - s.cx
  const dy = t.cy - s.cy
  const sx = Math.sign(dx) || 1
  const sy = Math.sign(dy) || 1
  if (Math.abs(dy) < 1) {
    const x1 = s.cx + sx * s.hw
    return { d: `M${x1} ${s.cy} H${t.cx - sx * (t.hw + gap)}`, lx: x1 + 8, ly: s.cy - 10 }
  }
  const y1 = s.cy + sy * s.hh
  if (Math.abs(dx) < 1) {
    return { d: `M${s.cx} ${y1} V${t.cy - sy * (t.hh + gap)}`, lx: s.cx + 8, ly: y1 + sy * 32 }
  }
  return { d: `M${s.cx} ${y1} V${t.cy} H${t.cx - sx * (t.hw + gap)}`, lx: s.cx + 8, ly: y1 + sy * 32 }
}

/** Coupe un libellé de tâche en deux lignes au plus. */
export function wrapLabel(label: string, max = 19): string[] {
  if (label.length <= max) return [label]
  const words = label.split(' ')
  let first = ''
  while (words.length && (first + ' ' + words[0]).trim().length <= max) first = (first + ' ' + words.shift()).trim()
  if (!first) first = words.shift() ?? ''
  return words.length ? [first, words.join(' ')] : [first]
}
