// Quel logo montrer pour un logiciel, un fournisseur, un éditeur ou une application :
// d'abord le nom du produit (Tomcat avant Apache, Windows avant Microsoft), sinon son éditeur.
import type { LogoName } from './logos'

const byName: [RegExp, LogoName][] = [
  [/tomcat/i, 'apachetomcat'],
  [/^apache\b/i, 'apache'],
  [/debian/i, 'debian'],
  [/ubuntu/i, 'ubuntu'],
  [/red ?hat|\brhel\b/i, 'redhat'],
  [/postgre/i, 'postgresql'],
  [/mysql/i, 'mysql'],
  [/oracle/i, 'oracle'],
  [/windows/i, 'windows'],
  [/\biis\b|sql ?server|active directory|dirsync|microsoft/i, 'microsoft'],
  [/sybase|\bsap\b/i, 'sap'],
  [/webobjects|\bapple\b/i, 'apple'],
  [/moodle/i, 'moodle'],
  [/limesurvey/i, 'limesurvey'],
  [/^hal$|\bccsd\b/i, 'hal'],
  [/symantec|netbackup|endpoint protection/i, 'symantec'],
]

const byEditeur: Record<string, LogoName> = {
  apache: 'apache',
  debian: 'debian',
  canonical: 'ubuntu',
  'red hat': 'redhat',
  postgresql: 'postgresql',
  oracle: 'oracle',
  microsoft: 'microsoft',
  sap: 'sap',
  apple: 'apple',
  moodle: 'moodle',
  limesurvey: 'limesurvey',
  ccsd: 'hal',
  symantec: 'symantec',
}

/** Logo de marque pour un nom (et éventuellement son éditeur) ; `undefined` si la marque n'a pas de logo connu. */
export function logoFor(name: string, editeur?: string | null): LogoName | undefined {
  for (const [re, logo] of byName) if (re.test(name)) return logo
  return editeur ? byEditeur[editeur.trim().toLowerCase()] : undefined
}
