// Petits outils partagés par les écrans de liste (pays, traitements, données, projets, référents…) :
// export d'un tableau en fichier CSV lisible par Excel, et élision française « de » → « d’ ».
import { download, fileSlug } from '../screens/shared/exportFile'

/** Commence par une voyelle ou un h (traité comme muet) : « d’APOGEE », « d’Hélène ». */
const VOYELLE = /^[aeiouyhàâäéèêëîïôöùûüœæ]/i

/** « de » ou « d’ » selon le mot qui suit : de('APOGEE') → « d’APOGEE », de('Tomcat') → « de Tomcat ». */
export const de = (mot: string) => (VOYELLE.test(mot.trim()) ? `d’${mot.trim()}` : `de ${mot.trim()}`)
/** « que » ou « qu’ ». */
export const que = (mot: string) => (VOYELLE.test(mot.trim()) ? `qu’${mot.trim()}` : `que ${mot.trim()}`)
/** « le » ou « l’ ». */
export const le = (mot: string) => (VOYELLE.test(mot.trim()) ? `l’${mot.trim()}` : `le ${mot.trim()}`)

const cell = (v: unknown) => {
  const s = v == null ? '' : String(v)
  return /[;"\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/**
 * Télécharge un fichier CSV (séparateur point-virgule, BOM UTF-8 : Excel l'ouvre avec les accents).
 * Renvoie le nom du fichier produit.
 */
export function downloadCsv(title: string, header: string[], rows: unknown[][]): string {
  const lines = [header, ...rows].map((r) => r.map(cell).join(';'))
  const fileName = `${fileSlug(title)}.csv`
  download(new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }), fileName)
  return fileName
}
