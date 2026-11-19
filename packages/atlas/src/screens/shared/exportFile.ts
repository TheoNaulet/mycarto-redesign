// Export d'une carte en fichier, côté navigateur : un résumé dessiné (titre, objets par couche, post-its, légende)
// en SVG, PNG (le SVG peint dans un canevas) ou PDF (écrit à la main, une page, polices Helvetica).
// Les couleurs viennent des variables CSS du thème, lues sur l'élément qui déclenche l'export.
import type { Layer } from '../../utils/types'

export type ExportFormat = 'png' | 'pdf' | 'svg'
export type PageFormat = 'a4-paysage' | 'a3-paysage' | 'a4-portrait'

/** Un objet dessiné dans l'export. */
export interface ExportItem {
  name: string
  layer: Layer
}

export interface ExportScene {
  title: string
  subtitle: string
  items: ExportItem[]
  notes: string[]
  legend: boolean
  dots: boolean
}

const LAYERS: { layer: Layer; label: string }[] = [
  { layer: 'metier', label: 'Couche métier' },
  { layer: 'fonctionnel', label: 'Couche fonctionnelle' },
  { layer: 'applicatif', label: 'Couche applicative' },
  { layer: 'technique', label: 'Couche technique' },
]

/* ---------- Couleurs : variable CSS → rgb, quel que soit son format (on la peint dans un pixel) ---------- */
type Rgb = [number, number, number]
interface Palette {
  ink: Rgb
  muted: Rgb
  surface: Rgb
  line: Rgb
  dot: Rgb
  sticky: Rgb
  layer: Record<Layer, { c: Rgb; s: Rgb }>
}

function resolver(el: Element) {
  const style = getComputedStyle(el)
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  return (name: string, fallback: Rgb): Rgb => {
    const raw = style.getPropertyValue(name).trim()
    if (!raw || !ctx) return fallback
    ctx.clearRect(0, 0, 1, 1)
    ctx.fillStyle = '#000'
    ctx.fillStyle = raw
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  }
}

export function readPalette(el: Element): Palette {
  const get = resolver(el)
  const layer = (l: Layer) => ({ c: get(`--layer-${l}`, [38, 46, 111]), s: get(`--layer-${l}-soft`, [230, 232, 244]) })
  return {
    ink: get('--ink', [30, 35, 71]),
    muted: get('--ink-muted', [90, 96, 120]),
    surface: get('--surface', [255, 255, 255]),
    line: get('--line', [222, 226, 228]),
    dot: get('--canvas-dot', [201, 207, 219]),
    sticky: get('--sticky-yellow', [255, 224, 138]),
    layer: { metier: layer('metier'), fonctionnel: layer('fonctionnel'), applicatif: layer('applicatif'), technique: layer('technique') },
  }
}

/* ---------- Mise en page commune : des rectangles et des textes, en unités d'un plan de 1200 de large ---------- */
type Shape =
  | { k: 'rect'; x: number; y: number; w: number; h: number; fill: Rgb; stroke?: Rgb }
  | { k: 'text'; x: number; y: number; size: number; bold?: boolean; color: Rgb; str: string }
  | { k: 'dot'; x: number; y: number; color: Rgb }

const W = 1200
const M = 40
const BOX_W = 170
const BOX_H = 44
const GAP = 14
const LABEL_W = 160

const fit = (s: string, size: number, width: number) => {
  const max = Math.floor(width / (size * 0.56))
  return s.length > max ? `${s.slice(0, Math.max(1, max - 1))}…` : s
}

/** Coupe un texte en deux lignes au plus, aux espaces. */
function wrap(s: string, size: number, width: number, lines = 2): string[] {
  const max = Math.floor(width / (size * 0.56))
  const out: string[] = []
  let cur = ''
  for (const word of s.split(/\s+/)) {
    if (cur && (cur + ' ' + word).length > max) {
      out.push(cur)
      cur = word
    } else cur = cur ? `${cur} ${word}` : word
  }
  if (cur) out.push(cur)
  return out.length > lines ? [...out.slice(0, lines - 1), fit(out.slice(lines - 1).join(' '), size, width)] : out
}

function layout(scene: ExportScene, p: Palette): { shapes: Shape[]; h: number } {
  const body: Shape[] = []
  let y = M
  body.push({ k: 'text', x: M, y: y + 22, size: 22, bold: true, color: p.ink, str: scene.title })
  body.push({ k: 'text', x: M, y: y + 46, size: 13, color: p.muted, str: scene.subtitle })
  y += 80

  const perRow = Math.max(1, Math.floor((W - 2 * M - LABEL_W + GAP) / (BOX_W + GAP)))
  const used = LAYERS.filter((l) => scene.items.some((i) => i.layer === l.layer))
  for (const { layer, label } of used) {
    const list = scene.items.filter((i) => i.layer === layer)
    const lines = Math.ceil(list.length / perRow)
    const bandH = lines * (BOX_H + GAP) - GAP + 28
    const c = p.layer[layer]
    body.push({ k: 'rect', x: M, y, w: W - 2 * M, h: bandH, fill: p.surface, stroke: p.line })
    body.push({ k: 'rect', x: M, y, w: 4, h: bandH, fill: c.c })
    body.push({ k: 'text', x: M + 16, y: y + 24, size: 12, bold: true, color: c.c, str: label })
    body.push({ k: 'text', x: M + 16, y: y + 42, size: 11, color: p.muted, str: `${list.length} objet${list.length > 1 ? 's' : ''}` })
    list.forEach((it, i) => {
      const bx = M + LABEL_W + (i % perRow) * (BOX_W + GAP)
      const by = y + 14 + Math.floor(i / perRow) * (BOX_H + GAP)
      body.push({ k: 'rect', x: bx, y: by, w: BOX_W, h: BOX_H, fill: c.s, stroke: c.c })
      body.push({ k: 'text', x: bx + 12, y: by + 27, size: 13, bold: true, color: p.ink, str: fit(it.name, 13, BOX_W - 24) })
    })
    y += bandH + 16
  }

  if (scene.notes.length) {
    y += 4
    scene.notes.forEach((n, i) => {
      const nx = M + i * 300
      body.push({ k: 'rect', x: nx, y, w: 280, h: 64, fill: p.sticky })
      wrap(n, 12, 256).forEach((line, j) => body.push({ k: 'text', x: nx + 12, y: y + 26 + j * 20, size: 12, color: p.ink, str: line }))
    })
    y += 80
  }

  if (scene.legend && used.length) {
    body.push({ k: 'text', x: M, y: y + 16, size: 11, bold: true, color: p.muted, str: 'LÉGENDE' })
    used.forEach((l, i) => {
      const lx = M + 80 + i * 210
      body.push({ k: 'rect', x: lx, y: y + 5, w: 14, h: 14, fill: p.layer[l.layer].s, stroke: p.layer[l.layer].c })
      body.push({ k: 'text', x: lx + 22, y: y + 16, size: 12, color: p.ink, str: l.label })
    })
    y += 36
  }
  const h = y + M - 16
  const back: Shape[] = []
  if (scene.dots) for (let dy = 12; dy < h; dy += 24) for (let dx = 12; dx < W; dx += 24) back.push({ k: 'dot', x: dx, y: dy, color: p.dot })
  return { shapes: [...back, ...body], h }
}

/* ---------- SVG ---------- */
const hex = ([r, g, b]: Rgb) => `#${[r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('')}`
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function buildSvg(scene: ExportScene, p: Palette): { svg: string; w: number; h: number } {
  const { shapes, h } = layout(scene, p)
  const parts = shapes.map((s) => {
    if (s.k === 'dot') return `<circle cx="${s.x}" cy="${s.y}" r="1.2" fill="${hex(s.color)}"/>`
    if (s.k === 'rect') return `<rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="${s.w > 8 ? 8 : 0}" fill="${hex(s.fill)}"${s.stroke ? ` stroke="${hex(s.stroke)}"` : ''}/>`
    return `<text x="${s.x}" y="${s.y}" font-size="${s.size}"${s.bold ? ' font-weight="600"' : ''} fill="${hex(s.color)}">${esc(s.str)}</text>`
  })
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" font-family="Noto Sans, Helvetica, Arial, sans-serif">
<title>${esc(scene.title)}</title>
<rect width="${W}" height="${h}" fill="${hex(p.surface)}"/>
${parts.join('\n')}
</svg>`
  return { svg, w: W, h }
}

/* ---------- PNG : le SVG peint dans un canevas ---------- */
export function svgToPng(svg: string, w: number, h: number, scale = 2): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }))
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(w * scale)
      canvas.height = Math.round(h * scale)
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canevas indisponible'))
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Image vide'))), 'image/png')
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('SVG illisible'))
    }
    img.src = url
  })
}

/* ---------- PDF : une page, Helvetica en WinAnsi ---------- */
const PAGES: Record<PageFormat, [number, number]> = {
  'a4-paysage': [842, 595],
  'a3-paysage': [1191, 842],
  'a4-portrait': [595, 842],
}
/** Caractères hors Latin-1 remplacés par leur équivalent WinAnsi ou ASCII. */
const WIN: Record<string, string> = { '’': '\x92', '‘': '\x91', '“': '\x93', '”': '\x94', '…': '\x85', '–': '\x96', '—': '\x97', 'œ': '\x9c', 'Œ': '\x8c', '€': '\x80', '›': '\x9b', '‹': '\x8b', '\u00a0': '\xa0', '\u202f': ' ' }
const pdfText = (s: string) =>
  [...s]
    .map((ch) => WIN[ch] ?? (ch.charCodeAt(0) <= 0xff ? ch : '?'))
    .join('')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
const n = (x: number) => (Math.round(x * 100) / 100).toString()
const col = ([r, g, b]: Rgb) => `${n(r / 255)} ${n(g / 255)} ${n(b / 255)}`

export function buildPdf(scene: ExportScene, p: Palette, page: PageFormat): Blob {
  const [pw, ph] = PAGES[page]
  const { shapes, h } = layout(scene, p)
  const margin = 24
  const k = Math.min((pw - 2 * margin) / W, (ph - 2 * margin) / h)
  const ox = (pw - W * k) / 2
  const oy = ph - (ph - h * k) / 2
  const X = (x: number) => n(ox + x * k)
  const Y = (y: number) => n(oy - y * k)
  const ops: string[] = [`${col(p.surface)} rg 0 0 ${pw} ${ph} re f`, '0.6 w']
  for (const s of shapes) {
    if (s.k === 'dot') ops.push(`${col(s.color)} rg ${X(s.x - 1)} ${Y(s.y + 1)} ${n(2 * k)} ${n(2 * k)} re f`)
    else if (s.k === 'rect') ops.push(`${col(s.fill)} rg ${s.stroke ? `${col(s.stroke)} RG ` : ''}${X(s.x)} ${Y(s.y + s.h)} ${n(s.w * k)} ${n(s.h * k)} re ${s.stroke ? 'B' : 'f'}`)
    else ops.push(`BT ${col(s.color)} rg /${s.bold ? 'F2' : 'F1'} ${n(s.size * k)} Tf ${X(s.x)} ${Y(s.y)} Td (${pdfText(s.str)}) Tj ET`)
  }
  const content = ops.join('\n')
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Title (${pdfText(scene.title)}) /Producer (myCarto) >>`,
  ]
  let out = '%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'
  const offsets: number[] = []
  objects.forEach((o, i) => {
    offsets.push(out.length)
    out += `${i + 1} 0 obj\n${o}\nendobj\n`
  })
  const xref = out.length
  out += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`
  out += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info 7 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  const bytes = new Uint8Array(out.length)
  for (let i = 0; i < out.length; i++) bytes[i] = out.charCodeAt(i) & 0xff
  return new Blob([bytes], { type: 'application/pdf' })
}

/* ---------- Téléchargement ---------- */
export function download(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** « Applications et flux de Scolarité » → « applications-et-flux-de-scolarite ». */
export const fileSlug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'carte'

export const sizeLabel = (b: number) => (b < 1024 ? `${b} o` : b < 1024 * 1024 ? `${Math.round(b / 1024)} Ko` : `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} Mo`)
