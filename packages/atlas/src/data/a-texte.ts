// Petits outils de texte et d'export partagés par les écrans de la couche technique (Sites, Machines, Logiciels…).
import { download, fileSlug } from '../screens/shared/exportFile'

/** Mots en h aspiré : pas d'élision (« de Hyper-V »). */
const H_ASPIRE = /^(hyper|haut|hall|hangar|hasard|hibou|honte|houx|hu[bt])/i

/** « de » ou « d’ » devant un nom : « d’APOGEE », « d’hermes », « de sophocle ». */
export function de(name: string): string {
  const first = name.normalize('NFD').charAt(0).toLowerCase()
  const elide = /[aeiou]/.test(first) || (first === 'h' && !H_ASPIRE.test(name))
  return elide ? `d’${name}` : `de ${name}`
}

/** « que » ou « qu’ » devant un nom. */
export const que = (name: string) => (/^[aeiouh]/i.test(name.normalize('NFD')) ? `qu’${name}` : `que ${name}`)

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v)
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Télécharge un tableau en CSV lisible par Excel (séparateur « ; », UTF-8 avec BOM).
 * Renvoie le nom du fichier produit.
 */
export function exportCsv(title: string, headers: string[], rows: unknown[][]): string {
  const text = [headers, ...rows].map((r) => r.map(cell).join(';')).join('\r\n')
  const fileName = `${fileSlug(title)}.csv`
  download(new Blob(['﻿', text], { type: 'text/csv;charset=utf-8' }), fileName)
  return fileName
}
