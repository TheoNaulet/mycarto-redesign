<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import SignArrow from './SignArrow.vue'
import { site } from '../data/content'
import {
  CELL_H,
  CELL_W,
  COLS,
  COL_LETTERS,
  ROWS,
  box,
  center,
  floors,
  ref as gridRef,
  roomById,
  rooms,
  route,
  type FloorId,
  type Room,
} from '../data/plan'

const selectedId = ref('crm')
const previousId = ref<string | null>(null)
const tripKey = ref(0)
const query = ref('')
const intro = ref(true)
const planScroller = ref<HTMLElement | null>(null)
const indexList = ref<HTMLElement | null>(null)

const selected = computed(() => roomById.get(selectedId.value) as Room)
const floor = computed<FloorId>(() => selected.value.floor)
const floorRooms = computed(() => rooms.filter((r) => r.floor === floor.value))
const currentFloor = computed(() => floors.find((f) => f.id === floor.value)!)

const sameFloorLinks = computed(() =>
  selected.value.links
    .map((l) => roomById.get(l.to) as Room)
    .filter((r) => r.floor === floor.value),
)
const linkedIds = computed(() => new Set(sameFloorLinks.value.map((r) => r.id)))

const fluxes = computed(() =>
  sameFloorLinks.value.map((target) => ({ id: target.id, ...route(selected.value, target) })),
)

const dot = computed(() => center(selected.value))

const trip = computed(() => {
  if (!previousId.value) return null
  const from = roomById.get(previousId.value)
  if (!from || from.floor !== floor.value || from.id === selectedId.value) return null
  return `${route(from, selected.value).d}V${dot.value.y}`
})

const plaqueLinks = computed(() =>
  selected.value.links.map((l) => {
    const target = roomById.get(l.to) as Room
    const dir: 'up' | 'down' | 'right' =
      target.floor > floor.value ? 'up' : target.floor < floor.value ? 'down' : 'right'
    return { ...l, target, dir }
  }),
)

const fold = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const indexItems = computed(() => {
  const q = fold(query.value.trim())
  return rooms
    .filter((r) => !q || fold(`${r.name} ${r.type}`).includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, 'fr', { sensitivity: 'base' }))
})

function select(id: string) {
  if (id === selectedId.value) return
  previousId.value = selectedId.value
  selectedId.value = id
  tripKey.value++
}

function goToFloor(id: FloorId) {
  if (id === floor.value) return
  const related = selected.value.links
    .map((l) => roomById.get(l.to) as Room)
    .find((r) => r.floor === id)
  select(related?.id ?? rooms.find((r) => r.floor === id)!.id)
}

function onRoomKey(e: KeyboardEvent, id: string) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    select(id)
  }
}

// On narrow screens the plan pans horizontally: keep the dot in view.
function centreDot(smooth: boolean) {
  const el = planScroller.value
  if (!el || el.scrollWidth <= el.clientWidth) return
  const ratio = (dot.value.x + 40) / 1012
  el.scrollTo({ left: ratio * el.scrollWidth - el.clientWidth / 3, behavior: smooth ? 'smooth' : 'auto' })
}

watch(selectedId, async () => {
  await nextTick()
  const list = indexList.value
  const item = list?.querySelector<HTMLElement>('[aria-current="location"]')
  if (list && item) {
    const top = item.offsetTop
    if (top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: top - list.clientHeight / 2 + item.offsetHeight / 2, behavior: 'smooth' })
    }
  }
  centreDot(true)
})

onMounted(() => {
  centreDot(false)
  window.setTimeout(() => (intro.value = false), 1800)
})

const viewBox = `-40 -46 ${COLS * CELL_W + 52} ${ROWS * CELL_H + 58}`
</script>

<template>
  <section class="hero" aria-labelledby="hero-title">
    <div class="panel" :class="{ 'is-intro': intro }">
      <div class="intro">
        <h1 id="hero-title">Plus jamais perdu dans votre SI</h1>
        <p class="lede">myCarto transforme vos référentiels en cartes toujours à jour, de l’organigramme au serveur.</p>
        <a class="btn btn--primary btn--lg" :href="site.demo">Demander une démo</a>
      </div>

      <div class="index">
        <label class="index__label" for="plan-search">Trouver dans le plan</label>
        <div class="search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.2" />
            <path d="m15.5 15.5 5 5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
          </svg>
          <input
            id="plan-search"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="CRM, paie, serveur…"
          />
        </div>
        <ul v-if="indexItems.length" ref="indexList" class="index__list">
          <li v-for="item in indexItems" :key="item.id">
            <button
              type="button"
              class="index__item"
              :aria-current="item.id === selectedId ? 'location' : undefined"
              @click="select(item.id)"
            >
              <span class="index__name">{{ item.name }}</span>
              <span class="index__meta">{{ item.type }}, niveau {{ item.floor }}</span>
              <span class="index__ref">{{ gridRef(item) }}</span>
            </button>
          </li>
        </ul>
        <div v-else class="index__empty">
          <p>Rien ne correspond à « {{ query }} ». Essayez « ERP » ou « paie ».</p>
          <button type="button" class="link-btn" @click="query = ''">Effacer la recherche</button>
        </div>
      </div>

      <div class="plan">
        <div class="plan__head">
          <p class="plan__title">
            <strong>Groupe Exemple</strong>
            <span>Plan d’exemple, données fictives</span>
          </p>
          <div class="floors" role="group" aria-label="Niveaux du plan">
            <button
              v-for="f in floors"
              :key="f.id"
              type="button"
              class="floor"
              :aria-pressed="f.id === floor"
              @click="goToFloor(f.id)"
            >
              <span class="floor__num" aria-hidden="true">{{ f.id }}</span>
              <span class="floor__name"><span class="visually-hidden">{{ f.short }}, </span>{{ f.name }}</span>
              <span class="floor__tag" aria-hidden="true">{{ f.tag }}</span>
            </button>
          </div>
        </div>

        <p class="plan__hint">Faites glisser le plan</p>
        <div ref="planScroller" class="plan__scroller">
          <svg
            class="plan__svg"
            :viewBox="viewBox"
            role="group"
            :aria-label="`${currentFloor.short}, ${currentFloor.name}`"
          >
            <g class="grid" aria-hidden="true">
              <line
                v-for="c in COLS - 1"
                :key="`v${c}`"
                :x1="c * CELL_W"
                :x2="c * CELL_W"
                y1="0"
                :y2="ROWS * CELL_H"
              />
              <line
                v-for="r in ROWS - 1"
                :key="`h${r}`"
                x1="0"
                :x2="COLS * CELL_W"
                :y1="r * CELL_H"
                :y2="r * CELL_H"
              />
              <text
                v-for="(l, i) in COL_LETTERS"
                :key="l"
                class="grid__ref"
                :x="(i + 0.5) * CELL_W"
                y="-18"
                text-anchor="middle"
              >{{ l }}</text>
              <text
                v-for="r in ROWS"
                :key="`n${r}`"
                class="grid__ref"
                x="-20"
                :y="(r - 0.5) * CELL_H + 6"
                text-anchor="middle"
              >{{ r }}</text>
            </g>

            <Transition name="floor" mode="out-in">
              <g :key="floor" class="rooms">
                <g
                  v-for="(room, i) in floorRooms"
                  :key="room.id"
                  class="room"
                  :class="{
                    'is-selected': room.id === selectedId,
                    'is-linked': linkedIds.has(room.id),
                  }"
                  :style="{ '--i': i }"
                  role="button"
                  tabindex="0"
                  :aria-label="`${room.name}, ${room.type}`"
                  :aria-current="room.id === selectedId ? 'location' : undefined"
                  @click="select(room.id)"
                  @keydown="onRoomKey($event, room.id)"
                >
                  <rect
                    class="room__rect"
                    :x="box(room).x0 + 11"
                    :y="box(room).y0 + 11"
                    :width="room.cols * CELL_W - 22"
                    :height="room.rows * CELL_H - 22"
                    rx="10"
                    pathLength="1"
                  />
                  <text class="room__name" :x="box(room).x0 + 24" :y="box(room).y0 + 40">{{ room.name }}</text>
                  <text class="room__type" :x="box(room).x0 + 24" :y="box(room).y0 + 62">{{ room.type }}</text>
                </g>
              </g>
            </Transition>

            <g class="fluxes" aria-hidden="true">
              <g v-for="f in fluxes" :key="`${selectedId}-${f.id}`" class="flux">
                <path :d="f.d" pathLength="1" />
                <circle :cx="f.end.x" :cy="f.end.y" r="7" />
              </g>
            </g>

            <path v-if="trip" :key="tripKey" class="trip" :d="trip" pathLength="1" aria-hidden="true" />

            <g class="dot" :style="{ transform: `translate(${dot.x}px, ${dot.y}px)` }" aria-hidden="true">
              <g class="dot__pin">
                <circle class="dot__halo" r="26" />
                <circle class="dot__core" r="13" />
                <g class="dot__label" :transform="`translate(${dot.x > 760 ? -170 : 34} 0)`">
                  <rect x="0" y="-17" width="136" height="34" rx="17" />
                  <text x="68" y="6" text-anchor="middle">Vous êtes ici</text>
                </g>
              </g>
            </g>
          </svg>
        </div>

        <div class="plaque" aria-live="polite">
          <div class="plaque__id">
            <h2 class="plaque__name">{{ selected.name }}</h2>
            <p class="plaque__where">
              {{ selected.type }}, {{ currentFloor.short.toLowerCase() }}, case {{ gridRef(selected) }}
            </p>
            <p class="plaque__fact">{{ selected.fact }}</p>
          </div>
          <ul class="plaque__links" aria-label="Liens de cet élément">
            <li v-for="l in plaqueLinks" :key="l.to">
              <button type="button" class="chip" :class="`chip--${l.dir}`" @click="select(l.to)">
                <SignArrow :dir="l.dir" />
                <span>
                  <span class="chip__rel">{{ l.rel }}</span>
                  {{ l.target.name }}
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  padding-block: var(--space-4) var(--space-7);
}

.panel {
  display: grid;
  grid-template-columns: minmax(19rem, 23rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  grid-template-areas:
    'intro plan'
    'index plan';
  height: clamp(42rem, calc(100svh - 9rem), 54rem);
  border: var(--frame) solid var(--on-navy);
  border-radius: var(--radius-panel);
  overflow: hidden;
  background: var(--navy);
}

/* Intro */
.intro {
  grid-area: intro;
  padding: var(--space-6) var(--space-6) var(--space-5);
  border-right: var(--frame) solid var(--on-navy);
}

.intro h1 {
  font-size: clamp(2.4rem, 1.6rem + 1.9vw, 3.4rem);
  line-height: 1.02;
  letter-spacing: -0.02em;
}

.lede {
  margin-top: var(--space-4);
  margin-bottom: var(--space-5);
  color: var(--on-navy-soft);
  font-size: var(--fs-m);
  line-height: 1.5;
  max-width: 30ch;
}

/* Index */
.index {
  grid-area: index;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: var(--space-5) var(--space-6) var(--space-5);
  border-right: var(--frame) solid var(--on-navy);
  border-top: 1px solid var(--on-navy-line);
}

.index__label {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  margin-bottom: var(--space-2);
}

.search {
  position: relative;
  margin-bottom: var(--space-3);
}

.search svg {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  width: 1.1rem;
  height: 1.1rem;
  transform: translateY(-50%);
  color: var(--on-navy-soft);
  pointer-events: none;
}

.search input {
  width: 100%;
  min-height: 2.75rem;
  padding: 0.55rem 0.9rem 0.5rem 2.6rem;
  border: 2px solid var(--on-navy-line);
  border-radius: var(--radius-pill);
  background: var(--navy-deep);
  color: var(--on-navy);
  font-size: var(--fs-s);
  transition: border-color 0.2s var(--ease-out);
}

.search input::placeholder {
  color: rgb(255 255 255 / 0.62);
}

.search input:hover {
  border-color: rgb(255 255 255 / 0.45);
}

.search input:focus-visible {
  outline: none;
  border-color: var(--yellow);
}

.search input::-webkit-search-cancel-button {
  filter: invert(1);
}

.index__list {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-inline: calc(-1 * var(--space-3));
  padding-inline: var(--space-1);
  padding-block: var(--space-2);
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 0.35) transparent;
  mask-image: linear-gradient(transparent, #000 2.6rem, #000 calc(100% - 1.6rem), transparent);
}

.index__item {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-areas:
    'name ref'
    'meta ref';
  align-items: center;
  column-gap: var(--space-3);
  width: 100%;
  padding: 0.55rem 0.75rem;
  border: 0;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  position: relative;
  transition: background-color 0.15s var(--ease-out);
}

.index__item:hover {
  background: rgb(255 255 255 / 0.07);
}

.index__item[aria-current='location'] {
  background: rgb(250 193 48 / 0.14);
}

.index__name {
  grid-area: name;
  font-weight: 600;
  font-size: var(--fs-s);
  line-height: 1.3;
}

.index__meta {
  grid-area: meta;
  font-size: var(--fs-xs);
  color: var(--on-navy-soft);
  line-height: 1.35;
}

.index__ref {
  grid-area: ref;
  display: grid;
  place-items: center;
  min-width: 2.4rem;
  height: 1.75rem;
  padding-top: 0.15em;
  border-radius: 6px;
  border: 1.5px solid var(--on-navy-line);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
  font-variant-numeric: tabular-nums;
  color: var(--on-navy);
}

.index__item[aria-current='location'] .index__ref {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--navy);
}

.index__empty {
  padding: var(--space-3) 0;
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
}

.link-btn {
  margin-top: var(--space-2);
  padding: 0;
  border: 0;
  background: none;
  color: var(--yellow);
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.2em;
}

/* Plan */
.plan {
  grid-area: plan;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--navy-plan);
}

.plan__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--on-navy-line);
}

.plan__title {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.plan__title strong {
  font-family: var(--font-display);
  font-size: var(--fs-l);
}

.plan__title span {
  font-size: var(--fs-xs);
  color: var(--on-navy-soft);
}

.floors {
  display: flex;
  gap: var(--space-2);
}

.floor {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.75rem;
  padding: 0.3rem 0.95rem 0.3rem 0.35rem;
  border: 2px solid var(--on-navy-line);
  border-radius: var(--radius-pill);
  background: transparent;
  font-size: var(--fs-xs);
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
  transition:
    border-color 0.2s var(--ease-out),
    background-color 0.2s var(--ease-out);
}

.floor:hover {
  border-color: rgb(255 255 255 / 0.5);
}

.floor__num {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  padding-top: 0.12em;
  border-radius: 50%;
  border: 2px solid var(--on-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--fs-s);
}

.floor[aria-pressed='true'] {
  border-color: var(--yellow);
}

.floor[aria-pressed='true'] .floor__num {
  background: var(--yellow);
  border-color: var(--yellow);
  color: var(--navy);
}

.plan__hint,
.floor__tag {
  display: none;
}

.plan__scroller {
  flex: 1;
  min-height: 0;
  padding: var(--space-3) var(--space-5);
}

.plan__svg {
  width: 100%;
  height: 100%;
  overflow: visible;
  font-family: var(--font-display);
}

.grid line {
  stroke: rgb(255 255 255 / 0.08);
  stroke-width: 1;
  stroke-dasharray: 4 6;
}

.grid__ref {
  fill: rgb(255 255 255 / 0.62);
  font-size: 17px;
  font-weight: 700;
}

.room {
  cursor: pointer;
  outline: none;
}

.room__rect {
  fill: var(--navy);
  stroke: var(--on-navy);
  stroke-width: 2.5;
  transition:
    fill 0.3s var(--ease-out),
    stroke 0.3s var(--ease-out);
}

.room:hover .room__rect {
  fill: #343e8c;
}

.room:focus-visible .room__rect {
  stroke: var(--yellow);
  stroke-width: 4;
  stroke-dasharray: 0.012 0.008;
}

.room.is-linked .room__rect {
  stroke: var(--blue);
  stroke-width: 3.5;
}

.room.is-selected .room__rect {
  fill: #3b3f78;
  stroke: var(--yellow);
  stroke-width: 4;
}

.room__name {
  fill: var(--on-navy);
  font-size: 19px;
  font-weight: 700;
  pointer-events: none;
}

.room__type {
  fill: rgb(255 255 255 / 0.7);
  font-family: var(--font-text);
  font-size: 14px;
  pointer-events: none;
}

.flux path {
  fill: none;
  stroke: var(--blue);
  stroke-width: 6;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  animation: draw 0.7s var(--ease-out) 0.15s both;
}

.flux circle {
  fill: var(--navy);
  stroke: var(--blue);
  stroke-width: 4;
  animation: pop 0.4s var(--ease-out) 0.6s both;
}

.trip {
  fill: none;
  stroke: var(--yellow);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 1;
  animation:
    draw 0.75s var(--ease-out) both,
    fade 0.6s ease-in 1.4s both;
}

.dot {
  transition: transform 0.75s var(--ease-out);
  pointer-events: none;
}

.dot__halo {
  fill: rgb(250 193 48 / 0.22);
}

.dot__core {
  fill: var(--yellow);
  stroke: var(--navy);
  stroke-width: 4;
}

.dot__label rect {
  fill: var(--yellow);
}

.dot__label text {
  fill: var(--navy);
  font-size: 17px;
  font-weight: 700;
}

/* Floor change */
.floor-enter-active,
.floor-leave-active {
  transition:
    opacity 0.28s var(--ease-out),
    transform 0.28s var(--ease-out);
}

.floor-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.floor-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}

/* The one authored load moment: the plan traces itself, then the dot lands. */
.is-intro .room__rect {
  stroke-dasharray: 1;
  animation: draw 1s var(--ease-out) both;
  animation-delay: calc(var(--i) * 80ms + 150ms);
}

.is-intro .room__name,
.is-intro .room__type {
  animation: fade-in 0.6s var(--ease-out) both;
  animation-delay: calc(var(--i) * 80ms + 550ms);
}

.is-intro .dot__pin {
  animation: land 0.7s var(--ease-out) 1.05s both;
}

@keyframes draw {
  from {
    stroke-dashoffset: 1;
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes fade {
  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }
}

@keyframes land {
  from {
    opacity: 0;
    transform: translateY(-40px) scale(0.6);
  }
}

.flux circle {
  transform-box: fill-box;
  transform-origin: center;
}

/* Plaque */
.plaque {
  display: grid;
  grid-template-columns: minmax(14rem, 0.8fr) minmax(0, 1.2fr);
  gap: var(--space-5);
  align-items: start;
  padding: var(--space-4) var(--space-5) var(--space-5);
  border-top: 1px solid var(--on-navy-line);
  background: var(--navy);
  min-height: 8.5rem;
}

.plaque__name {
  font-size: var(--fs-xl);
  line-height: 1.1;
}

.plaque__where {
  margin-top: var(--space-1);
  font-size: var(--fs-xs);
  color: var(--on-navy-soft);
  font-weight: 600;
}

.plaque__fact {
  margin-top: var(--space-2);
  font-size: var(--fs-s);
  color: var(--on-navy-soft);
  line-height: 1.45;
}

.plaque__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  padding-top: var(--space-1);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  min-height: 2.5rem;
  padding: 0.4rem 0.85rem 0.35rem 0.65rem;
  border: 2px solid var(--on-navy-line);
  border-radius: var(--radius-plate);
  background: transparent;
  font-size: var(--fs-xs);
  font-weight: 600;
  line-height: 1.25;
  text-align: left;
  transition:
    border-color 0.2s var(--ease-out),
    background-color 0.2s var(--ease-out);
}

.chip:hover {
  border-color: var(--on-navy);
  background: rgb(255 255 255 / 0.06);
}

.chip .sign-arrow {
  font-size: 1.15rem;
  color: var(--blue);
}

.chip--up .sign-arrow,
.chip--down .sign-arrow {
  color: var(--yellow);
}

.chip__rel {
  display: block;
  font-weight: 400;
  color: var(--on-navy-soft);
}

/* Narrower desktops */
@media (max-width: 1240px) {
  .floor__name {
    max-width: 7.5rem;
  }

  .plaque {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
}

/* Tablet and phone: the panel unfolds into one column */
@media (max-width: 1023px) {
  .panel {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    grid-template-areas:
      'intro'
      'plan'
      'index';
    height: auto;
  }

  .intro,
  .index {
    border-right: 0;
  }

  .intro {
    padding: var(--space-6) var(--space-5) var(--space-6);
    border-bottom: var(--frame) solid var(--on-navy);
  }

  .index {
    border-top: var(--frame) solid var(--on-navy);
    padding: var(--space-5);
  }

  .index__list {
    max-height: 22rem;
  }

  .plan__head {
    flex-direction: column;
    align-items: flex-start;
  }

  .floors {
    width: 100%;
  }

  .floor__name {
    display: none;
  }

  .floor[aria-pressed='true'] .floor__tag {
    display: inline;
  }

  .floor {
    padding-right: 0.35rem;
  }

  .floor[aria-pressed='true'] {
    padding-right: 0.95rem;
  }

  .plan__hint {
    display: block;
    padding: var(--space-3) var(--space-5) 0;
    font-size: var(--fs-xs);
    color: var(--on-navy-soft);
  }

  .floor {
    flex: none;
  }

  .floor__name {
    max-width: none;
    white-space: nowrap;
  }

  .plan__scroller {
    overflow-x: auto;
    mask-image: linear-gradient(to right, #000 82%, transparent);
    scrollbar-width: thin;
    scrollbar-color: rgb(255 255 255 / 0.35) transparent;
  }

  .plan__svg {
    min-width: 46rem;
    height: auto;
  }
}

@media (max-width: 560px) {
  .hero {
    padding-top: var(--space-2);
  }

  .panel {
    border-radius: 14px;
  }

  .plan__svg {
    min-width: 36rem;
  }

  .plan__scroller {
    padding-inline: var(--space-3);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dot {
    transition: none;
  }

  .trip {
    display: none;
  }
}
</style>
