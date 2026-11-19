// Lecture et écriture de fichiers CSV, côté navigateur : utilisées par l'import (explorateur, démarrage) et les exports.

/** Découpe un CSV : séparateur deviné (point-virgule, tabulation ou virgule), guillemets gérés, lignes vides écartées. */
export function parseCsv(text: string): string[][] {
  const clean = text.replace(/^﻿/, '')
  const first = clean.split(/\r?\n/, 1)[0] ?? ''
  const sep = [';', '\t', ','].map((s) => [s, first.split(s).length] as const).sort((a, b) => b[1] - a[1])[0][0]
  const out: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < clean.length; i++) {
    const c = clean[i]
    if (quoted) {
      if (c === '"' && clean[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && clean[i + 1] === '\n') i++
      row.push(cell)
      if (row.some((x) => x.trim())) out.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  row.push(cell)
  if (row.some((x) => x.trim())) out.push(row)
  return out
}

/** Tableau → texte CSV (point-virgule, pour Excel en français), avec BOM pour les accents. */
export function toCsv(table: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const c = v === null || v === undefined ? '' : String(v)
    return /[;"\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c
  }
  return '﻿' + table.map((r) => r.map(esc).join(';')).join('\r\n')
}

/** Télécharge un tableau en fichier CSV. */
export function downloadCsv(table: (string | number | null | undefined)[][], fileName: string) {
  const blob = new Blob([toCsv(table)], { type: 'text/csv;charset=utf-8' })
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

/** « Hébergement » → « hebergement » : pour reconnaître les noms de colonnes. */
export const normCol = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
