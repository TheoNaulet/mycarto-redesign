// Liens entre domaines (écran « Liens entre domaines ») : les 10 domaines de l'outil d'origine, avec leur nombre
// d'applications, et les flux qui passent d'un domaine à l'autre.
// - Les flux connus (applications.ts) sont rangés par le premier domaine de chaque application ; ceux d'un même domaine sont ignorés.
// - Les autres flux (`invente: true`) complètent la carte, faute de source : ils relient des applications de l'inventaire.
import { flows, getApplication, type AppFlow } from './applications'

export interface DomaineCarte {
  name: string
  /** Nombre d'applications rangées dans le domaine (outil d'origine). */
  apps: number
  /** Nom du domaine dans l'inventaire des applications, quand il y existe : filtre de l'explorateur. */
  inventaire: string | null
}

export const domaines: DomaineCarte[] = [
  { name: 'Documentation', apps: 1, inventaire: 'Documentation' },
  { name: 'Finances et compta', apps: 15, inventaire: 'Finances' },
  { name: 'Patrimoine', apps: 2, inventaire: 'Patrimoine' },
  { name: 'Pédagogie', apps: 4, inventaire: 'Pédagogie' },
  { name: 'Recherche', apps: 1, inventaire: 'Recherche' },
  { name: 'Référentiel', apps: 7, inventaire: 'Référentiel' },
  { name: 'Ressources et support', apps: 1, inventaire: null },
  { name: 'Ressources humaines', apps: 9, inventaire: 'Ressources humaines' },
  { name: 'Scolarité', apps: 10, inventaire: 'Scolarité' },
  { name: 'SI et communication', apps: 8, inventaire: null },
]

/** Domaine d'inventaire (ou de carte) → domaine de la carte des liens. */
const MAP: Record<string, string> = {
  Finances: 'Finances et compta',
  'Services numériques': 'SI et communication',
  Pilotage: 'SI et communication',
  'Vie étudiante': 'Ressources et support',
}
/** Domaine de la carte des liens où se range une application : son premier domaine. */
export function domaineOf(app: string): string | null {
  const d = getApplication(app)?.domaines[0]
  if (!d) return null
  const name = MAP[d] ?? d
  return domaines.some((x) => x.name === name) ? name : null
}

export interface FluxDomaine extends AppFlow {
  /** Flux ajouté pour la démonstration, sans source dans les autres écrans. */
  invente?: boolean
}

const inv = (from: string, to: string, label: string, meta: string): FluxDomaine => ({ from, to, label, meta, invente: true })
const INVENTES: FluxDomaine[] = [
  inv('SIHAM', 'SIFAC', 'Écritures de paie', 'Fichier plat · mensuelle'),
  inv('HARPEGE', 'GFC', 'Charges de personnel', 'Fichier plat · mensuelle'),
  inv('MANGUE', 'MARACUJA', 'Liquidation de la paie', 'Base partagée · mensuelle'),
  inv('HARPEGE', 'OpenLDAP', 'Comptes des personnels', 'LDAP · quotidienne'),
  inv('SIHAM', 'SINAPS', 'Structures et affectations', 'Web service · temps réel'),
  inv('SIHAM', 'ACTIVE DIRECTORY', 'Création des comptes', 'Web service · quotidienne'),
  inv('APOGEE', 'SIFAC', 'Droits d’inscription encaissés', 'Fichier plat · quotidienne'),
  inv('QUICKCONNECT', 'GFC', 'Paiements en ligne', 'Web service · temps réel'),
  inv('APOGEE', 'PIX', 'Inscriptions à la certification', 'Fichier plat · semestrielle'),
  inv('COCOLIGHT', 'SIFAC', 'Dépenses des contrats de recherche', 'Fichier plat · mensuelle'),
  inv('EGIMMO', 'GFC', 'Amortissements', 'Fichier plat · annuelle'),
  inv('GLPI', 'ENT', 'Demandes d’assistance', 'Web service · temps réel'),
  inv('CAS', 'ENT', 'Authentification unique', 'CAS · temps réel'),
  inv('OpenLDAP', 'ENT', 'Profils des usagers', 'LDAP · temps réel'),
  inv('KOHA', 'OpenLDAP', 'Comptes des lecteurs', 'LDAP · quotidienne'),
]

/** Un lien entre deux domaines : les flux qui vont de l'un à l'autre, dans les deux sens. */
export interface LienDomaines {
  id: string
  a: string
  b: string
  flux: FluxDomaine[]
}

function build(): LienDomaines[] {
  const links = new Map<string, LienDomaines>()
  for (const f of [...(flows as FluxDomaine[]), ...INVENTES]) {
    const da = domaineOf(f.from)
    const db = domaineOf(f.to)
    if (!da || !db || da === db) continue
    const [a, b] = [da, db].sort((x, y) => x.localeCompare(y, 'fr'))
    const id = `${a}|${b}`
    if (!links.has(id)) links.set(id, { id, a, b, flux: [] })
    links.get(id)!.flux.push(f)
  }
  return [...links.values()]
}

/** Les liens entre domaines, chacun avec ses flux. */
export const liensDomaines: LienDomaines[] = build()
