// Glossaire des notions de myCarto, avec l'écran où chacune se voit.
import type { IconName } from '../icons/icons'
import type { Layer } from '../utils/types'

export interface Definition {
  term: string
  /** Autres mots qui mènent à la même notion dans la recherche. */
  aliases?: string[]
  definition: string
  /** Exemple tiré de la cartographie. */
  exemple?: string
  layer?: Layer
  icon: IconName
  /** Écran où la notion se voit. */
  path: string
  /** Nom de cet écran, pour le lien « Voir ». */
  screen: string
}

export const definitions: Definition[] = [
  {
    term: 'Application',
    definition: 'Logiciel utilisé par les métiers pour rendre un service : elle a un éditeur, des utilisateurs, des flux et des référents.',
    exemple: 'APOGEE gère les étudiants et les enseignements.',
    layer: 'applicatif',
    icon: 'app',
    path: '/explorateur',
    screen: 'l’explorateur',
  },
  {
    term: 'Carte',
    definition: 'Vue dessinée d’une partie du SI : des objets et leurs liens, choisis selon un modèle de carte.',
    exemple: 'Applications et flux de Scolarité.',
    icon: 'map',
    path: '/carte',
    screen: 'la carte des flux',
  },
  {
    term: 'Composant',
    definition: 'Brique technique installée sur une machine pour faire tourner une application : serveur web, base de données, service.',
    exemple: 'Le serveur Web Forms d’APOGEE, sur Tomcat 5.',
    layer: 'technique',
    icon: 'chip',
    path: '/infrastructure',
    screen: 'l’infrastructure',
  },
  {
    term: 'Contrat',
    definition: 'Engagement signé avec un fournisseur pour une ou plusieurs applications : échéance, reconduction, montant.',
    layer: 'applicatif',
    icon: 'contract',
    path: '/contrats',
    screen: 'les contrats',
  },
  {
    term: 'Couche',
    definition: 'Niveau de lecture du SI. myCarto en compte quatre : métier, fonctionnelle, applicative et technique. Chacune a sa couleur.',
    icon: 'layers',
    path: '/',
    screen: 'l’accueil',
  },
  {
    term: 'DICP',
    aliases: ['Disponibilité', 'Intégrité', 'Confidentialité', 'Preuve', 'Criticité'],
    definition: 'Les quatre critères de sécurité d’une application, notés de 1 (faible) à 4 (très forte) : Disponibilité, Intégrité, Confidentialité, Preuve.',
    icon: 'shield',
    path: '/tableau-de-bord',
    screen: 'le tableau de bord',
  },
  {
    term: 'Domaine',
    definition: 'Regroupement fonctionnel d’applications qui servent une même activité.',
    exemple: 'Scolarité, Ressources humaines, Finances.',
    layer: 'fonctionnel',
    icon: 'folder',
    path: '/carte',
    screen: 'la carte des flux',
  },
  {
    term: 'Donnée',
    aliases: ['Objet de données'],
    definition: 'Information gérée par les applications et transportée par les flux. Une donnée de santé est dite sensible.',
    exemple: 'Données étudiantes, Notes, Diplômes.',
    layer: 'fonctionnel',
    icon: 'database',
    path: '/donnees',
    screen: 'les données',
  },
  {
    term: 'Flux',
    definition: 'Échange de données d’une application vers une autre, avec sa liaison (fichier, web service…) et sa fréquence.',
    exemple: 'APOGEE envoie les résultats à NOTES chaque jour.',
    layer: 'applicatif',
    icon: 'flow',
    path: '/carte',
    screen: 'la carte des flux',
  },
  {
    term: 'Fournisseur',
    aliases: ['Éditeur'],
    definition: 'Société ou organisme qui fournit une application et signe les contrats.',
    exemple: 'AMUE, Cocktail, Microsoft.',
    layer: 'applicatif',
    icon: 'building',
    path: '/fournisseurs',
    screen: 'les fournisseurs',
  },
  {
    term: 'Impact',
    definition: 'Ce qui s’arrête si un objet tombe en panne : applications, flux et utilisateurs touchés, de proche en proche.',
    exemple: 'Un arrêt de sophocle coupe APOGEE et APOGEE WEB.',
    icon: 'impact',
    path: '/impact',
    screen: 'l’analyse d’impact',
  },
  {
    term: 'Îlot',
    definition: 'Plus petit regroupement du plan d’occupation des sols : un ensemble d’applications au service d’une même fonction.',
    exemple: 'L’îlot Paiement, dans le quartier Finances.',
    layer: 'fonctionnel',
    icon: 'pos',
    path: '/pos',
    screen: 'le POS',
  },
  {
    term: 'Lentille',
    definition: 'Coloration d’une carte selon un critère (obsolescence, DICP, hébergement) pour faire ressortir ce qui compte.',
    icon: 'lens',
    path: '/reglages',
    screen: 'les règles de couleur',
  },
  {
    term: 'Machine',
    aliases: ['Serveur', 'VM'],
    definition: 'Serveur physique ou virtuel (VM) qui héberge des composants.',
    exemple: 'sophocle, pythagore.',
    layer: 'technique',
    icon: 'server',
    path: '/infrastructure',
    screen: 'l’infrastructure',
  },
  {
    term: 'Pays',
    definition: 'Pays où se trouvent les sites de l’établissement et vers lesquels des données peuvent être transférées.',
    layer: 'metier',
    icon: 'globe',
    path: '/pays',
    screen: 'les pays',
  },
  {
    term: 'POS',
    aliases: ['Plan d’occupation des sols'],
    definition: 'Plan d’occupation des sols : découpage du SI en zones, quartiers et îlots, comme le plan d’une ville.',
    layer: 'fonctionnel',
    icon: 'pos',
    path: '/pos',
    screen: 'le POS',
  },
  {
    term: 'Processus',
    definition: 'Enchaînement d’activités métier, du macro-processus à la tâche, qui s’appuie sur des applications.',
    exemple: 'Inscrire un étudiant.',
    layer: 'metier',
    icon: 'process',
    path: '/processus',
    screen: 'les processus',
  },
  {
    term: 'Projet',
    definition: 'Chantier qui fait évoluer le SI : il a des dates, un responsable et des applications concernées.',
    exemple: 'Migration Tomcat 5.',
    layer: 'applicatif',
    icon: 'project',
    path: '/projets',
    screen: 'les projets',
  },
  {
    term: 'Quartier',
    definition: 'Regroupement d’îlots dans une zone du plan d’occupation des sols.',
    exemple: 'Le quartier Finances.',
    layer: 'fonctionnel',
    icon: 'pos',
    path: '/pos',
    screen: 'le POS',
  },
  {
    term: 'Référent',
    definition: 'Personne à contacter pour une application : métier (l’usage), fonctionnel (le paramétrage) ou technique (l’exploitation).',
    icon: 'user',
    path: '/referents',
    screen: 'les référents',
  },
  {
    term: 'Site',
    definition: 'Lieu géographique de l’établissement : campus, bâtiment, salle serveurs.',
    exemple: 'Lyon, Montpellier, Paris.',
    layer: 'technique',
    icon: 'pin',
    path: '/pays',
    screen: 'les pays et leurs sites',
  },
  {
    term: 'Tableau de bord',
    definition: 'Page de contrôles et de chiffres sur la cartographie : fiches incomplètes, obsolescence, contrats.',
    icon: 'dashboard',
    path: '/tableaux-de-bord',
    screen: 'les tableaux de bord',
  },
  {
    term: 'Traitement',
    aliases: ['RGPD', 'Registre'],
    definition: 'Utilisation de données personnelles pour une finalité précise, inscrite au registre RGPD avec sa base légale et sa durée de conservation.',
    exemple: 'Paie des personnels.',
    layer: 'metier',
    icon: 'shield',
    path: '/traitements',
    screen: 'le registre des traitements',
  },
  {
    term: 'Unité organisationnelle',
    aliases: ['Direction', 'Service'],
    definition: 'Direction, service ou composante de l’établissement, rangée dans l’organigramme.',
    layer: 'metier',
    icon: 'org',
    path: '/organigramme',
    screen: 'l’organigramme',
  },
]
