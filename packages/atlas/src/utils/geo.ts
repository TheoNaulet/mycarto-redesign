/**
 * Tracé orthogonal d'un lien de carte, aux angles arrondis.
 * Part de (x1, y1) au bord droit de la source et arrive en (x2, y2).
 * Pour que la pointe s'arrête à 2px de la cible : x2 = bord gauche de la cible - 8.
 */
export function routeEdge(x1: number, y1: number, x2: number, y2: number, midX?: number, radius = 10): string {
  if (Math.abs(y2 - y1) < 0.5) return `M${x1} ${y1} H${x2}`
  const mx = midX ?? Math.round((x1 + x2) / 2)
  const s = y2 > y1 ? 1 : -1
  const r = Math.round(Math.min(radius, Math.abs(y2 - y1) / 2, mx - x1, x2 - mx) * 10) / 10
  const [sw1, sw2] = s > 0 ? [1, 0] : [0, 1]
  return `M${x1} ${y1} H${mx - r} a${r} ${r} 0 0 ${sw1} ${r} ${s * r} V${y2 - s * r} a${r} ${r} 0 0 ${sw2} ${r} ${s * r} H${x2}`
}

/** Espace laissé avant la cible : 6px de pointe + 2px d'air. */
export const EDGE_GAP = 8
