// Club utilisateurs and events, from my-carto.com (November 2026), condensed.

const NB = ' '

export interface CommunityEvent {
  id: string
  title: string
  /** ISO date with the Paris offset. */
  start: string
  place: string
  online: boolean
  line: string
  image: string
  kind: 'club' | 'webconference' | 'salon'
  /** Internal page with more about it. */
  to?: string
}

export const events: CommunityEvent[] = [
  {
    id: 'club-2026-11',
    title: 'Club utilisateurs, novembre 2026',
    start: '2026-11-19T09:30:00+01:00',
    place: 'En ligne',
    online: true,
    line: 'Le retour d’expérience de Crédit Agricole Leasing & Factoring sur la connaissance de son SI.',
    image: '/brand/events/club-2026-11.webp',
    kind: 'club',
    to: '/club-utilisateurs#prochain',
  },
  {
    id: 'amue-2026-07',
    title: 'Webconférence Amue',
    start: '2026-07-07T10:00:00+02:00',
    place: 'En ligne',
    online: true,
    line: 'Démonstration, nouveautés et témoignage de l’Université Jean Moulin Lyon 3.',
    image: '/brand/events/amue-2026-07.webp',
    kind: 'webconference',
  },
  {
    id: 'club-2026-07',
    title: 'Club utilisateurs, juillet 2026',
    start: '2026-07-02T09:30:00+02:00',
    place: 'En ligne',
    online: true,
    line: 'Le témoignage de GIFI : lignage de données et vues projets.',
    image: '/brand/events/club-2026-07.webp',
    kind: 'club',
    to: '/clients/gifi',
  },
  {
    id: 'club-2026-02',
    title: 'Club utilisateurs, février 2026',
    start: '2026-02-19T09:30:00+01:00',
    place: 'En ligne',
    online: true,
    line: `La RATP pilote sa transformation digitale sur 1${NB}300 applications.`,
    image: '/brand/events/club-2026-02.webp',
    kind: 'club',
  },
  {
    id: 'cyber-sante-2025',
    title: 'Journée de la cybersécurité en santé',
    start: '2025-04-10T08:00:00+02:00',
    place: 'Maison de la Chimie, Paris',
    online: false,
    line: 'myCarto partenaire de la 3e édition, pour les établissements de santé d’Île-de-France.',
    image: '/brand/events/journee-cyber-2025.webp',
    kind: 'salon',
  },
  {
    id: 'strasbourg-2024',
    title: 'Gouvernance d’une direction du numérique',
    start: '2024-10-14T13:00:00+02:00',
    place: 'En ligne',
    online: true,
    line: 'Cartographie du SI et projets au service des métiers, avec l’Eurométropole de Strasbourg.',
    image: '/brand/events/temoignage-strasbourg.webp',
    kind: 'webconference',
  },
]

export function splitEvents(now = new Date()) {
  const t = now.getTime()
  const sorted = [...events].sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
  return {
    upcoming: sorted.filter((e) => Date.parse(e.start) >= t),
    past: sorted.filter((e) => Date.parse(e.start) < t).reverse(),
  }
}

const parisDay = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const parisShort = new Intl.DateTimeFormat('fr-FR', {
  timeZone: 'Europe/Paris',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const parisTime = new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', hour: 'numeric', minute: '2-digit' })

/** « jeudi 19 novembre 2026 » */
export function eventDay(iso: string, withWeekday = true) {
  return (withWeekday ? parisDay : parisShort).format(new Date(iso))
}

/** « 9 h 30 », the French way. */
export function eventTime(iso: string) {
  const parts = parisTime.formatToParts(new Date(iso))
  const h = Number(parts.find((p) => p.type === 'hour')?.value)
  const m = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return m === '00' ? `${h}${NB}h` : `${h}${NB}h${NB}${m}`
}

export const clubFigures = [
  { value: '3', label: 'rencontres par an, entre clients' },
  { value: '53e', label: `club le 19${NB}novembre 2026` },
  { value: '2012', label: 'une association loi 1901, indépendante de l’éditeur' },
]

export const clubBenefits = [
  { name: 'Les bonnes pratiques', line: 'Astuces et retours d’expérience entre utilisateurs de myCarto.' },
  { name: 'L’avant-première', line: 'Nouvelles fonctionnalités, versions bêta et conseils d’experts.' },
  { name: 'Un produit qui s’améliore', line: 'Vos retours disent ce qui marche et ce qui manque.' },
  { name: 'Un réseau de pairs', line: 'DSI, urbanistes et architectes échangent leurs contacts.' },
  { name: 'De la formation', line: 'Ateliers, webinaires et conférences pour aller plus loin.' },
  { name: 'La roadmap', line: 'Vos suggestions pèsent sur les prochaines versions.' },
]

export const nextClub = {
  eventId: 'club-2026-11',
  edition: '53e club utilisateurs',
  guest: 'Crédit Agricole Leasing & Factoring',
  line: 'Comment un acteur majeur du crédit-bail et de l’affacturage structure et exploite la connaissance de son SI avec myCarto.',
  programme: [
    'Le retour d’expérience de Crédit Agricole Leasing & Factoring',
    'Les dernières nouveautés de myCarto',
    'La roadmap et les perspectives',
    'Vos questions aux intervenants',
  ],
  speakers: [
    { name: 'Jean-Philippe Retaillé', role: 'Responsable Architecture, Crédit Agricole Leasing & Factoring' },
    { name: 'Cédric Volandi', role: 'Dirigeant, AB+ Software' },
    { name: 'Samuel Fourreau', role: 'Product Owner, AB+ Software' },
    { name: 'Thibaut Dequenne', role: 'Directeur commercial, AB+ Software' },
  ],
  note: 'Réservé aux clients des solutions de cartographie Solu-QIQ et myCarto.',
}

export const eventFormats = [
  { name: 'Le club utilisateurs', line: 'Trois fois par an, en ligne, réservé aux clients.', to: '/club-utilisateurs' },
  { name: 'Les webconférences', line: 'Des démonstrations en ligne avec nos partenaires, comme l’Amue.' },
  { name: 'Les salons et journées', line: 'Sur place, comme la Journée de la cybersécurité en santé.' },
]
