// Tableaux de bord enregistrés. « Santé du SI » est celui que montre l'écran Tableau de bord.

/** Disposition de la vignette : tuiles de chiffres, barres, liste, frise d'échéances, vide. */
export type Gabarit = 'sante' | 'controles' | 'obsolescence' | 'contrats' | 'vide'

export const GABARITS: Record<Gabarit, { label: string; description: string; widgets: number }> = {
  sante: { label: 'Santé du SI', description: 'Contrôles de qualité, cycle de vie, applications les plus connectées, DICP.', widgets: 4 },
  controles: { label: 'Contrôles', description: 'Une tuile par contrôle de qualité de la cartographie.', widgets: 8 },
  obsolescence: { label: 'Obsolescence', description: 'Logiciels plus supportés, fins de support à venir, machines concernées.', widgets: 3 },
  contrats: { label: 'Contrats', description: 'Échéances des contrats et coûts par fournisseur.', widgets: 3 },
  vide: { label: 'Vide', description: 'Un tableau sans widget, à composer soi-même.', widgets: 0 },
}

export interface TableauDeBord {
  id: string
  name: string
  description: string
  gabarit: Gabarit
  proprietaire: string
  partage: boolean
  favori: boolean
  modifie: string
}

export const tableauxDeBord: TableauDeBord[] = [
  { id: 'sante', name: 'Santé du SI', description: 'Fiches à compléter, cycle de vie des applications et sécurité DICP.', gabarit: 'sante', proprietaire: 'Théo Naulet', partage: true, favori: true, modifie: '12/11/2026' },
  { id: 'controles', name: 'Contrôles divers', description: 'Composants sans logiciel, machines vides, flux sans cible, applications sans référent.', gabarit: 'controles', proprietaire: 'William Vidal', partage: true, favori: false, modifie: '04/11/2026' },
  { id: 'obsolescence', name: 'Obsolescence', description: 'Tomcat 5, Java 6, Oracle 10g : ce qui n’est plus supporté et ce qui le sera bientôt.', gabarit: 'obsolescence', proprietaire: 'Samuel Faure', partage: true, favori: false, modifie: '28/10/2026' },
  { id: 'contrats', name: 'Contrats', description: 'Contrats expirés, échéances des douze prochains mois et coûts SaaS.', gabarit: 'contrats', proprietaire: 'Isabelle Roux', partage: true, favori: false, modifie: '15/10/2026' },
  { id: 'mon-tableau', name: 'Mon tableau de bord', description: 'Les applications de Scolarité que je suis.', gabarit: 'controles', proprietaire: 'Théo Naulet', partage: false, favori: false, modifie: '02/10/2026' },
]
