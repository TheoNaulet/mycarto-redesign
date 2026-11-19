// Post-its et commentaires posés sur les cartes, gardés le temps de la session (un magasin par écran).
// Les écrans de carte (Carte, Impact, Infrastructure, POS, Contrats) y lisent et y écrivent ; rien n'est envoyé au serveur.
import { reactive } from 'vue'

/** Personne qui écrit : l'utilisateur connecté. */
export interface AnnotationAuthor {
  initials: string
  name: string
  color: 1 | 2 | 3 | 4 | 5 | 6
}
export const ME: AnnotationAuthor = { initials: 'TN', name: 'Théo', color: 1 }

/** Un post-it libre, en coordonnées du canevas. */
export interface MapNote {
  id: string
  text: string
  x: number
  y: number
  color: 'yellow' | 'blue' | 'green' | 'pink'
  rotation: number
  author: AnnotationAuthor
  /** jj/mm */
  date: string
}

/** Un message d'un fil de commentaire. */
export interface CommentMessage {
  id: string
  author: AnnotationAuthor
  text: string
  /** hh:mm */
  time: string
}

/** Une épingle de commentaire et son fil. */
export interface MapComment {
  id: string
  x: number
  y: number
  messages: CommentMessage[]
  resolved: boolean
}

export interface ScreenAnnotations {
  notes: MapNote[]
  comments: MapComment[]
}

const store = reactive<Record<string, ScreenAnnotations>>({})
let seq = 1

/** Les post-its et commentaires d'un écran (« carte », « impact »…), créés vides au premier appel. */
export function annotationsOf(screen: string): ScreenAnnotations {
  if (!store[screen]) store[screen] = { notes: [], comments: [] }
  return store[screen]
}

const pad = (n: number) => String(n).padStart(2, '0')
const today = () => {
  const d = new Date()
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`
}
export const nowTime = () => {
  const d = new Date()
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const COLORS: MapNote['color'][] = ['yellow', 'blue', 'green', 'pink']

/** Pose un post-it vide au point donné (canevas). */
export function addNote(screen: string, x: number, y: number): MapNote {
  const a = annotationsOf(screen)
  const note: MapNote = {
    id: `note-${seq++}`,
    text: '',
    x: Math.round(x),
    y: Math.round(y),
    color: COLORS[a.notes.length % COLORS.length],
    rotation: a.notes.length % 2 ? 1.2 : -1.2,
    author: ME,
    date: today(),
  }
  a.notes.push(note)
  return note
}

export function removeNote(screen: string, id: string) {
  const a = annotationsOf(screen)
  const i = a.notes.findIndex((n) => n.id === id)
  if (i >= 0) a.notes.splice(i, 1)
}

/** Pose une épingle de commentaire (sans message : le fil s'ouvre pour l'écrire). */
export function addComment(screen: string, x: number, y: number): MapComment {
  const c: MapComment = { id: `comment-${seq++}`, x: Math.round(x), y: Math.round(y), messages: [], resolved: false }
  annotationsOf(screen).comments.push(c)
  return c
}

export function removeComment(screen: string, id: string) {
  const a = annotationsOf(screen)
  const i = a.comments.findIndex((c) => c.id === id)
  if (i >= 0) a.comments.splice(i, 1)
}

/** Ajoute un message au fil, signé par l'utilisateur connecté. */
export function reply(comment: MapComment, text: string) {
  comment.messages.push({ id: `msg-${seq++}`, author: ME, text, time: nowTime() })
}

/** Textes des post-its d'un écran, pour l'export. */
export const noteTexts = (screen: string) => annotationsOf(screen).notes.map((n) => n.text.trim()).filter(Boolean)
