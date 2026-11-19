import type { InjectionKey } from 'vue'
import { EDGE_GAP } from '../../utils/geo'

/** Un point du canevas, en pixels. */
export interface McPoint {
  x: number
  y: number
}

/** Une boîte posée sur le canevas (nœud, pilule de flux), en pixels. */
export interface McBox {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Type de lien : flux applicatif, survol ou sélection, chemin d'impact,
 * hébergement (pointillé, sans flèche) ou estompé.
 */
export type McEdgeKind = 'flow' | 'hover' | 'impact' | 'host' | 'dim'

/** Un lien tel que le décrit un écran, pour `McEdgeLayer`. */
export interface McEdgeSpec {
  /** Identifiant stable du lien. */
  id: string
  /** Départ, au bord droit de la source. */
  from: McPoint
  /** Arrivée, EDGE_GAP (8px) avant le bord gauche de la cible. */
  to: McPoint
  /** Abscisse du coude vertical. Par défaut, à mi-chemin. */
  midX?: number
  /** Type de lien. Par défaut `flow`. */
  kind?: McEdgeKind
  /** Libellé en pilule (« Synchrone · semestrielle »). */
  label?: string
  /** Lien sélectionné : passe en accent et montre son libellé. */
  selected?: boolean
  /** Montre le libellé même au repos. */
  showLabel?: boolean
  /** Pointe à l'arrivée. */
  arrow?: boolean
  /** Rond creux au départ. */
  port?: boolean
}

/** Identifiants des marqueurs partagés par une couche de liens. */
export interface McEdgeMarkers {
  arrow: Record<'base' | 'hover' | 'impact', string>
  port: Record<'base' | 'hover' | 'impact', string>
}

export const edgeMarkersKey: InjectionKey<McEdgeMarkers> = Symbol('mc-edge-markers')

let seq = 0

/**
 * Préfixe unique dans la page. `useId` ne suffit pas seul : deux applications Vue
 * (deux stories sur une page de doc) peuvent produire le même identifiant.
 */
export function uniquePrefix(base: string, id: string): string {
  return `${base}-${id}-${++seq}`
}

export function markerIds(prefix: string): McEdgeMarkers {
  return {
    arrow: { base: `${prefix}-a`, hover: `${prefix}-ah`, impact: `${prefix}-ai` },
    port: { base: `${prefix}-p`, hover: `${prefix}-ph`, impact: `${prefix}-pi` },
  }
}

/** Pas vertical entre les départs de plusieurs liens qui quittent le même nœud. */
export const PORT_SPREAD = 12

/**
 * Coordonnées d'un lien entre deux boîtes : départ au bord droit de la source
 * (décalé de PORT_SPREAD par lien quand plusieurs partent du même nœud),
 * arrivée au centre vertical de la cible, EDGE_GAP avant son bord gauche.
 */
export function edgeBetween(source: McBox, target: McBox, index = 0, total = 1, spread = PORT_SPREAD): { from: McPoint; to: McPoint } {
  const offset = (index - (total - 1) / 2) * spread
  return {
    from: { x: source.x + source.w, y: source.y + source.h / 2 + offset },
    to: { x: target.x - EDGE_GAP, y: target.y + target.h / 2 },
  }
}
