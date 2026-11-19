<script setup lang="ts">
// Écran Utilisateurs et groupes : les comptes (invitation, profil, désactivation), les groupes et leurs membres,
// et la matrice des droits de chaque profil.
import { computed, getCurrentInstance, ref, watch } from 'vue'
import McTabs from '../../components/McTabs/McTabs.vue'
import McDataTable from '../../components/McDataTable/McDataTable.vue'
import type { DataTableColumn, DataTableSort } from '../../components/McDataTable/types'
import McButton from '../../components/McButton/McButton.vue'
import McIconButton from '../../components/McIconButton/McIconButton.vue'
import McSearchField from '../../components/McSearchField/McSearchField.vue'
import McSelect, { type McSelectOption, type McSelectValue } from '../../components/McSelect/McSelect.vue'
import McTextField from '../../components/McTextField/McTextField.vue'
import McFormField from '../../components/McFormField/McFormField.vue'
import McCheckbox from '../../components/McCheckbox/McCheckbox.vue'
import McSwitch from '../../components/McSwitch/McSwitch.vue'
import McAvatar from '../../components/McAvatar/McAvatar.vue'
import McStatusChip from '../../components/McStatusChip/McStatusChip.vue'
import McModal from '../../components/McModal/McModal.vue'
import McEmptyState from '../../components/McEmptyState/McEmptyState.vue'
import McIcon from '../../icons/McIcon.vue'
import McToastHost from '../../components/McToast/McToastHost.vue'
import { useToast } from '../../components/McToast/useToast'
import AdminNav from '../Explorateur/AdminNav.vue'
import { grants as grantSeed, permissions, profiles, userGroups, users as userSeed, type Group, type ProfileId, type User } from '../../data/utilisateurs'

const toast = useToast()
const ME = 1
const plural = (n: number, one: string, many: string) => `${n} ${n > 1 ? many : one}`
/** « de Anne » → « d’Anne » : élision devant une voyelle ou un h muet. */
const de = (name: string) => (/^[aeiouyhàâéèêëîïôöûüœ]/i.test(name) ? `d’${name}` : `de ${name}`)
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const users = ref<User[]>(userSeed.map((u) => ({ ...u, groups: [...u.groups] })))
const groups = ref<Group[]>(userGroups.map((g) => ({ ...g })))
const grants = ref<Record<ProfileId, string[]>>(JSON.parse(JSON.stringify(grantSeed)) as Record<ProfileId, string[]>)
const profileLabel = (id: ProfileId) => profiles.find((p) => p.id === id)?.label ?? id
const profileOptions: McSelectOption[] = profiles.map((p) => ({ value: p.id, label: p.label }))

/* ---------- Onglets ---------- */
/** `?onglet=groupes|profils` ouvre directement cet onglet ; sinon, les utilisateurs. */
const TABS = ['utilisateurs', 'groupes', 'profils']
const tab = ref('utilisateurs')
const globals = getCurrentInstance()?.appContext.config.globalProperties
const routeQuery = computed(() => {
  const q = (globals as { $route?: { query?: Record<string, unknown> } } | undefined)?.$route?.query
  if (q) return q as Record<string, unknown>
  return typeof window !== 'undefined' ? Object.fromEntries(new URLSearchParams(window.location.search)) : {}
})
watch(
  () => routeQuery.value.onglet,
  (o) => {
    if (typeof o === 'string' && TABS.includes(o)) tab.value = o
  },
  { immediate: true },
)
const tabs = computed(() => [
  { value: 'utilisateurs', label: 'Utilisateurs', icon: 'user' as const, count: users.value.length },
  { value: 'groupes', label: 'Groupes', icon: 'org' as const, count: groups.value.length },
  { value: 'profils', label: 'Profils', icon: 'shield' as const, count: profiles.length },
])

/* ---------- Utilisateurs ---------- */
const query = ref('')
const profileFilter = ref<McSelectValue | null>(null)
const filteredUsers = computed(() => {
  const q = norm(query.value.trim())
  return users.value.filter((u) => (!profileFilter.value || u.profile === profileFilter.value) && (!q || norm(`${u.name} ${u.email} ${u.groups.join(' ')}`).includes(q)))
})
const sort = ref<DataTableSort | null>({ key: 'name', dir: 'asc' })
const dateKey = (d: string) => (d ? d.split('/').reverse().join('') : '')
const columns: DataTableColumn<User>[] = [
  { key: 'name', label: 'Nom', sortable: true },
  { key: 'email', label: 'Adresse e-mail', sortable: true, muted: true },
  { key: 'profile', label: 'Profil', sortable: true, sortValue: (u) => profiles.findIndex((p) => p.id === u.profile) },
  { key: 'groups', label: 'Groupes' },
  { key: 'lastSeen', label: 'Dernière connexion', sortable: true, sortValue: (u) => dateKey(u.lastSeen) || null },
  { key: 'status', label: 'Statut', sortable: true },
]
const statusOf = (u: User) => (u.status === 'Actif' ? 'ok' : u.status === 'Invité' ? 'warn' : 'neutral')
const otherGroups = (u: User) => u.groups.filter((g) => g !== 'Groupe complet')

function setStatus(u: User, status: User['status']) {
  const before = u.status
  u.status = status
  const word = status === 'Désactivé' ? 'désactivé' : 'réactivé'
  toast.success(`Compte ${de(u.name)} ${word}`, { actionLabel: 'Annuler', onAction: () => (u.status = before) })
}
/** Dernier renvoi de chaque invitation (heure), affiché dans la colonne « Dernière connexion ». */
const resentAt = ref<Record<number, string>>({})
function resend(u: User) {
  const before = resentAt.value[u.id]
  const now = new Date()
  const at = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  resentAt.value = { ...resentAt.value, [u.id]: at }
  toast.success(`Invitation renvoyée à ${u.email}`, {
    actionLabel: 'Annuler',
    onAction: () => {
      const next = { ...resentAt.value }
      if (before) next[u.id] = before
      else delete next[u.id]
      resentAt.value = next
    },
  })
}

/* Modification du profil et des groupes */
const editOpen = ref(false)
const editUser = ref<User | null>(null)
const editProfile = ref<McSelectValue | null>(null)
const editGroups = ref<string[]>([])
function openEdit(u: User) {
  editUser.value = u
  editProfile.value = u.profile
  editGroups.value = [...u.groups]
  editOpen.value = true
}
const toggle = (list: string[], g: string, on: boolean) => (on ? [...list, g] : list.filter((x) => x !== g))
const editDirty = computed(() => !!editUser.value && (editProfile.value !== editUser.value.profile || [...editGroups.value].sort().join() !== [...editUser.value.groups].sort().join()))
const lastAdmin = computed(() => !!editUser.value && editUser.value.profile === 'admin' && editProfile.value !== 'admin' && users.value.filter((u) => u.profile === 'admin' && u.status !== 'Désactivé').length <= 1)
function saveEdit() {
  const u = editUser.value
  if (!u || lastAdmin.value) return
  const before = { profile: u.profile, groups: [...u.groups] }
  u.profile = editProfile.value as ProfileId
  u.groups = groups.value.map((g) => g.name).filter((g) => editGroups.value.includes(g))
  editOpen.value = false
  toast.success(`Accès ${de(u.name)} enregistrés`, { actionLabel: 'Annuler', onAction: () => Object.assign(u, before) })
}

/* Invitation */
const inviteOpen = ref(false)
const invite = ref({ email: '', profile: 'lecteur' as McSelectValue | null, groups: ['Groupe complet'] as string[], message: '' })
const inviteTried = ref(false)
function openInvite() {
  invite.value = { email: '', profile: 'lecteur', groups: ['Groupe complet'], message: '' }
  inviteTried.value = false
  inviteOpen.value = true
}
const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const emailError = computed(() => {
  const e = invite.value.email.trim()
  if (!e) return 'Saisissez l’adresse e-mail de la personne.'
  if (!EMAIL.test(e)) return 'Cette adresse n’est pas valide. Exemple : prenom.nom@univ-demo.fr'
  if (users.value.some((u) => u.email.toLowerCase() === e.toLowerCase())) return 'Un compte existe déjà pour cette adresse.'
  return undefined
})
/** « marie-anne.durand@… » → « Marie-Anne Durand ». */
const nameFromEmail = (email: string) =>
  email
    .split('@')[0]
    .split(/[._]/)
    .filter(Boolean)
    .map((p) => p.replace(/(^|-)(\p{L})/gu, (_m, s: string, c: string) => s + c.toUpperCase()))
    .join(' ')
function sendInvite() {
  inviteTried.value = true
  if (emailError.value) return
  const email = invite.value.email.trim().toLowerCase()
  const id = Math.max(...users.value.map((u) => u.id)) + 1
  const user: User = {
    id,
    name: nameFromEmail(email),
    email,
    profile: invite.value.profile as ProfileId,
    groups: groups.value.map((g) => g.name).filter((g) => invite.value.groups.includes(g)),
    lastSeen: '',
    status: 'Invité',
    color: ((id % 6) + 1) as User['color'],
  }
  users.value = [...users.value, user]
  inviteOpen.value = false
  query.value = ''
  profileFilter.value = null
  toast.success(`Invitation envoyée à ${email}`, { actionLabel: 'Annuler', onAction: () => (users.value = users.value.filter((u) => u.id !== id)) })
}

/* ---------- Groupes ---------- */
const groupName = ref(groups.value[1]?.name ?? groups.value[0]?.name ?? '')
const group = computed(() => groups.value.find((g) => g.name === groupName.value) ?? null)
const membersOf = (name: string) => users.value.filter((u) => u.groups.includes(name))
const members = computed(() => (group.value ? membersOf(group.value.name) : []))
const addMemberValue = ref<McSelectValue | null>(null)
const memberOptions = computed<McSelectOption[]>(() =>
  users.value.filter((u) => group.value && !u.groups.includes(group.value.name)).map((u) => ({ value: u.id, label: `${u.name} · ${u.email}` })),
)
function addMember(v: McSelectValue | null) {
  const u = users.value.find((x) => x.id === v)
  const g = group.value
  if (!u || !g) return
  u.groups = [...u.groups, g.name]
  addMemberValue.value = null
  toast.success(`${u.name} fait maintenant partie du groupe ${g.name}`, {
    actionLabel: 'Annuler',
    onAction: () => (u.groups = u.groups.filter((x) => x !== g.name)),
  })
}
function removeMember(u: User) {
  const g = group.value
  if (!g) return
  const before = [...u.groups]
  u.groups = u.groups.filter((x) => x !== g.name)
  toast.success(`${u.name} ne fait plus partie du groupe ${g.name}`, { actionLabel: 'Annuler', onAction: () => (u.groups = before) })
}
const isEveryone = computed(() => group.value?.name === 'Groupe complet')

const groupOpen = ref(false)
const newGroup = ref({ name: '', description: '' })
const groupTried = ref(false)
function openNewGroup() {
  newGroup.value = { name: '', description: '' }
  groupTried.value = false
  groupOpen.value = true
}
const groupError = computed(() => {
  const n = newGroup.value.name.trim()
  if (!n) return 'Donnez un nom au groupe.'
  if (groups.value.some((g) => norm(g.name) === norm(n))) return 'Un groupe porte déjà ce nom.'
  return undefined
})
function createGroup() {
  groupTried.value = true
  if (groupError.value) return
  const g = { name: newGroup.value.name.trim(), description: newGroup.value.description.trim() }
  groups.value = [...groups.value, g]
  groupName.value = g.name
  groupOpen.value = false
  toast.success(`Groupe ${g.name} créé`, {
    actionLabel: 'Annuler',
    onAction: () => {
      groups.value = groups.value.filter((x) => x.name !== g.name)
      users.value.forEach((u) => (u.groups = u.groups.filter((x) => x !== g.name)))
      if (groupName.value === g.name) groupName.value = groups.value[0]?.name ?? ''
    },
  })
}

/* ---------- Profils ---------- */
const usersOf = (id: ProfileId) => users.value.filter((u) => u.profile === id && u.status !== 'Désactivé').length
const has = (p: ProfileId, perm: string) => grants.value[p].includes(perm)
function setGrant(p: ProfileId, perm: string, on: boolean) {
  if (p === 'admin') return
  const before = [...grants.value[p]]
  grants.value[p] = on ? [...grants.value[p], perm] : grants.value[p].filter((x) => x !== perm)
  const label = permissions.find((x) => x.id === perm)?.label ?? perm
  toast.success(`« ${label} » ${on ? 'accordé au' : 'retiré du'} profil ${profileLabel(p)}`, { actionLabel: 'Annuler', onAction: () => (grants.value[p] = before) })
}

/* ---------- En-tête ---------- */
const headNote = computed(() => {
  const active = users.value.filter((u) => u.status === 'Actif').length
  const invited = users.value.filter((u) => u.status === 'Invité').length
  return `${plural(active, 'compte actif', 'comptes actifs')}${invited ? ` · ${plural(invited, 'invitation en attente', 'invitations en attente')}` : ''}`
})
</script>

<template>
  <div class="mc-scr-us">
    <AdminNav active="Utilisateurs et groupes" />

    <main class="mc-scr-us-main">
      <header class="mc-scr-us-head">
        <div class="mc-scr-us-titles">
          <p class="mc-over">Administration</p>
          <h1 class="title-lg">Utilisateurs et groupes</h1>
          <p class="mc-cap">{{ headNote }}</p>
        </div>
        <McButton v-if="tab === 'utilisateurs'" icon="plus" @click="openInvite">Inviter un utilisateur</McButton>
        <McButton v-else-if="tab === 'groupes'" icon="plus" @click="openNewGroup">Nouveau groupe</McButton>
      </header>

      <McTabs v-model="tab" :tabs="tabs" aria-label="Utilisateurs, groupes et profils" />

      <!-- Utilisateurs -->
      <section v-if="tab === 'utilisateurs'" class="mc-scr-us-pane">
        <div class="mc-scr-us-tools">
          <McSearchField
            v-model="query"
            class="mc-scr-us-search"
            placeholder="Rechercher un utilisateur"
            :count="query ? (filteredUsers.length ? plural(filteredUsers.length, 'résultat', 'résultats') : 'Aucun résultat') : undefined"
          />
          <McSelect v-model="profileFilter" class="mc-scr-us-pf" size="sm" :options="profileOptions" clearable placeholder="Tous les profils" aria-label="Profil" />
        </div>
        <div class="mc-scr-us-zone">
          <McDataTable
            v-model:sort="sort"
            class="mc-scr-us-table"
            :columns="columns"
            :rows="filteredUsers"
            row-key="id"
            caption="Utilisateurs"
            empty-title="Aucun utilisateur ne correspond"
            empty-text="Modifiez la recherche ou choisissez un autre profil."
            @open="openEdit"
          >
            <template #tile="{ row }"><McAvatar :name="row.name" :color="row.color" /></template>
            <template #cell-name="{ row }">
              <span :class="{ 'mc-scr-us-off': row.status === 'Désactivé' }">{{ row.name }}</span>
              <span v-if="row.id === ME" class="mc-cap mc-scr-us-me">vous</span>
            </template>
            <template #cell-profile="{ row }">{{ profileLabel(row.profile) }}</template>
            <template #cell-groups="{ row }">
              <span v-if="otherGroups(row).length" class="mc-scr-us-groups">{{ otherGroups(row).join(', ') }}</span>
              <span v-else class="mc-dt-nil">Groupe complet</span>
            </template>
            <template #cell-lastSeen="{ row }">
              <template v-if="row.lastSeen">{{ row.lastSeen }}</template>
              <span v-else-if="resentAt[row.id]" class="mc-dt-nil">Jamais · invitation renvoyée à {{ resentAt[row.id] }}</span>
              <span v-else class="mc-dt-nil">Jamais</span>
            </template>
            <template #cell-status="{ row }">
              <McStatusChip :status="statusOf(row)" size="sm">{{ row.status }}</McStatusChip>
            </template>
            <template #actions="{ row }">
              <McIconButton size="sm" icon="pencil" :label="`Modifier les accès ${de(row.name)}`" @click="openEdit(row)" />
              <McIconButton v-if="row.status === 'Invité'" size="sm" icon="bell" :label="`Renvoyer l’invitation à ${row.name}`" @click="resend(row)" />
              <McIconButton v-if="row.status === 'Désactivé'" size="sm" icon="undo" :label="`Réactiver le compte ${de(row.name)}`" @click="setStatus(row, 'Actif')" />
              <McIconButton
                v-else-if="row.id !== ME"
                size="sm"
                icon="lock"
                variant="danger"
                :label="`Désactiver le compte ${de(row.name)}`"
                @click="setStatus(row, 'Désactivé')"
              />
            </template>
            <template #empty-action>
              <McButton variant="outline" size="sm" icon="x" @click="(query = ''), (profileFilter = null)">Effacer les filtres</McButton>
            </template>
          </McDataTable>
        </div>
      </section>

      <!-- Groupes -->
      <section v-else-if="tab === 'groupes'" class="mc-scr-us-pane mc-scr-us-groupsview">
        <nav class="mc-scr-us-glist" aria-label="Groupes">
          <button
            v-for="g in groups"
            :key="g.name"
            type="button"
            class="mc-scr-us-git"
            :class="{ 'is-on': g.name === groupName }"
            :aria-current="g.name === groupName ? 'true' : undefined"
            @click="groupName = g.name"
          >
            <span class="mc-scr-us-gic"><McIcon name="org" size="sm" /></span>
            <span class="mc-scr-us-gtx">
              <span class="mc-scr-us-gn">{{ g.name }}</span>
              <span class="mc-cap">{{ plural(membersOf(g.name).length, 'membre', 'membres') }}</span>
            </span>
          </button>
        </nav>

        <div v-if="group" class="mc-scr-us-gpanel">
          <div class="mc-scr-us-ghead">
            <div class="mc-scr-us-gtitles">
              <h2>{{ group.name }}</h2>
              <p class="mc-cap">{{ group.description || 'Sans description' }} · {{ plural(members.length, 'membre', 'membres') }}</p>
            </div>
            <span class="mc-avatars" aria-hidden="true">
              <McAvatar v-for="u in members.slice(0, 5)" :key="u.id" :name="u.name" :color="u.color" />
              <span v-if="members.length > 5" class="mc-avatar more">+{{ members.length - 5 }}</span>
            </span>
          </div>
          <McSelect
            v-if="!isEveryone && memberOptions.length"
            v-model="addMemberValue"
            class="mc-scr-us-add"
            label="Ajouter un membre"
            placeholder="Choisir un utilisateur"
            :options="memberOptions"
            @change="addMember"
          />
          <p v-if="isEveryone" class="mc-cap mc-scr-us-note">Tout le monde fait partie du groupe complet : ses membres ne se retirent pas.</p>
          <ul v-if="members.length" class="mc-scr-us-mlist">
            <li v-for="u in members" :key="u.id">
              <McAvatar :name="u.name" :color="u.color" />
              <span class="mc-scr-us-mtx">
                <span>{{ u.name }}</span>
                <span class="mc-cap">{{ profileLabel(u.profile) }} · {{ u.email }}</span>
              </span>
              <McStatusChip v-if="u.status !== 'Actif'" :status="statusOf(u)" size="sm">{{ u.status }}</McStatusChip>
              <McIconButton v-if="!isEveryone" size="sm" icon="x" :label="`Retirer ${u.name} du groupe`" @click="removeMember(u)" />
            </li>
          </ul>
          <McEmptyState v-else size="compact" icon="user" title="Ce groupe n’a pas encore de membre" text="Choisissez un utilisateur ci-dessus pour l’ajouter." />
        </div>
      </section>

      <!-- Profils -->
      <section v-else class="mc-scr-us-pane mc-scr-us-matrix-wrap">
        <p class="mc-cap mc-scr-us-note">Chaque interrupteur s’applique tout de suite à tous les utilisateurs du profil. L’Administrateur garde tous les droits.</p>
        <div class="mc-scr-us-matrix-scroll">
          <table class="mc-scr-us-matrix">
            <caption class="mc-scr-us-sr">Droits par profil</caption>
            <thead>
              <tr>
                <th scope="col">Droit</th>
                <th v-for="p in profiles" :key="p.id" scope="col">
                  <span class="mc-scr-us-pl">{{ p.label }}</span>
                  <span class="mc-cap">{{ usersOf(p.id) ? plural(usersOf(p.id), 'utilisateur', 'utilisateurs') : 'Aucun utilisateur' }}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="perm in permissions" :key="perm.id">
                <th scope="row">
                  <span class="mc-scr-us-perm">{{ perm.label }}</span>
                  <span class="mc-cap">{{ perm.help }}</span>
                </th>
                <td v-for="p in profiles" :key="p.id">
                  <span class="mc-scr-us-cell">
                    <McSwitch
                      :model-value="has(p.id, perm.id)"
                      :disabled="p.id === 'admin'"
                      :aria-label="`${perm.label} pour le profil ${p.label}`"
                      @update:model-value="(v: boolean) => setGrant(p.id, perm.id, v)"
                    />
                    <McIcon v-if="p.id === 'admin'" name="lock" size="sm" class="mc-scr-us-lock" />
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>

    <!-- Modifier les accès -->
    <McModal
      v-model:open="editOpen"
      :title="editUser ? `Modifier les accès ${de(editUser.name)}` : 'Modifier les accès'"
      :subtitle="editUser ? `${editUser.email} · ${editUser.lastSeen ? `dernière connexion le ${editUser.lastSeen}` : 'aucune connexion'}` : undefined"
      :confirm-disabled="!editDirty || lastAdmin"
      :dirty="editDirty"
      @confirm="saveEdit"
    >
      <div class="mc-scr-us-form">
        <McSelect
          v-model="editProfile"
          label="Profil"
          required
          :options="profileOptions"
          :help="profiles.find((p) => p.id === editProfile)?.description"
          :error="lastAdmin ? 'Il doit rester au moins un administrateur actif.' : undefined"
        />
        <McFormField label="Groupes">
          <div class="mc-scr-us-checks">
            <McCheckbox
              v-for="g in groups"
              :key="g.name"
              :label="g.name"
              :model-value="editGroups.includes(g.name)"
              @update:model-value="(v: boolean) => (editGroups = toggle(editGroups, g.name, v))"
            />
          </div>
        </McFormField>
      </div>
    </McModal>

    <!-- Inviter -->
    <McModal v-model:open="inviteOpen" title="Inviter un utilisateur" subtitle="La personne reçoit un lien pour créer son mot de passe" confirm-label="Envoyer l’invitation" confirm-icon="arrow-right" :dirty="!!invite.email || !!invite.message" @confirm="sendInvite">
      <div class="mc-scr-us-form">
        <McTextField v-model="invite.email" type="email" label="Adresse e-mail" required placeholder="ex. prenom.nom@univ-demo.fr" :error="inviteTried ? emailError : undefined" />
        <McSelect v-model="invite.profile" label="Profil" required :options="profileOptions" :help="profiles.find((p) => p.id === invite.profile)?.description" />
        <McFormField label="Groupes">
          <div class="mc-scr-us-checks">
            <McCheckbox
              v-for="g in groups"
              :key="g.name"
              :label="g.name"
              :model-value="invite.groups.includes(g.name)"
              @update:model-value="(v: boolean) => (invite.groups = toggle(invite.groups, g.name, v))"
            />
          </div>
        </McFormField>
        <McFormField v-slot="{ id, describedBy }" label="Message" help="Ajouté au courriel d’invitation. Facultatif.">
          <div class="mc-input mc-textarea mc-scr-us-textarea">
            <textarea :id="id" v-model="invite.message" rows="3" :aria-describedby="describedBy" placeholder="ex. Bienvenue ! Commence par la carte de ton domaine." />
          </div>
        </McFormField>
      </div>
    </McModal>

    <!-- Nouveau groupe -->
    <McModal v-model:open="groupOpen" title="Nouveau groupe" confirm-label="Créer le groupe" :dirty="!!newGroup.name || !!newGroup.description" @confirm="createGroup">
      <div class="mc-scr-us-form">
        <McTextField v-model="newGroup.name" label="Nom" required placeholder="ex. Direction de la recherche" :error="groupTried ? groupError : undefined" />
        <McTextField v-model="newGroup.description" label="Description" placeholder="ex. Laboratoires et écoles doctorales" />
      </div>
    </McModal>

    <McToastHost />
  </div>
</template>

<style>
.mc-scr-us { display: flex; height: 100vh; min-height: 560px; background: var(--canvas); color: var(--ink); font-family: var(--font-sans); overflow: hidden; }
.mc-scr-us-main { flex: 1 1 600px; min-width: 0; height: 100%; display: flex; flex-direction: column; gap: 14px; padding: 24px 28px; box-sizing: border-box; }
.mc-scr-us-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; }
.mc-scr-us-titles { flex: 1; min-width: 240px; }
.mc-scr-us-titles .mc-over { margin: 0 0 2px; }
.mc-scr-us-titles h1 { margin: 0; }
.mc-scr-us-titles .mc-cap { margin: 4px 0 0; }
.mc-scr-us-pane { flex: 1; min-height: 0; display: flex; flex-direction: column; gap: 12px; }
.mc-scr-us-tools { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.mc-scr-us-search { width: 300px; }
.mc-scr-us-pf { width: 200px; }
.mc-scr-us-zone { position: relative; flex: 1; min-height: 0; display: flex; flex-direction: column; }
.mc-scr-us-zone > .mc-scr-us-table { flex: 1; min-height: 0; overflow: auto; }
.mc-scr-us-zone .mc-dt-tile, .mc-scr-us-zone .tile { background: transparent; }
.mc-scr-us-me { margin-left: 6px; }
.mc-scr-us-off { color: var(--ink-subtle); text-decoration: line-through; }
.mc-scr-us-groups { display: inline-block; max-width: 260px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; vertical-align: bottom; }

/* Groupes */
.mc-scr-us-groupsview { flex-direction: row; gap: 18px; align-items: stretch; }
.mc-scr-us-glist { width: 280px; flex: none; display: flex; flex-direction: column; gap: 2px; padding: 8px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow-y: auto; box-sizing: border-box; }
.mc-scr-us-git { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border: 0; border-radius: var(--radius-sm); background: transparent; color: var(--ink); font: inherit; font-size: 13px; line-height: 18px; text-align: left; cursor: pointer; }
.mc-scr-us-git:hover { background: var(--surface-sunken); }
.mc-scr-us-git.is-on { background: var(--accent-soft); }
.mc-scr-us-git.is-on .mc-scr-us-gn { font-weight: 600; }
.mc-scr-us-git:focus-visible { outline: 2px solid var(--accent); outline-offset: 1px; }
.mc-scr-us-gic { width: 28px; height: 28px; flex: none; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: var(--layer-metier-soft); color: var(--layer-metier); }
.mc-scr-us-gtx { flex: 1; min-width: 0; display: grid; }
.mc-scr-us-gn { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.mc-scr-us-gpanel { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; padding: 18px 20px; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); overflow-y: auto; box-sizing: border-box; }
.mc-scr-us-ghead { display: flex; align-items: center; gap: 12px; }
.mc-scr-us-gtitles { flex: 1; min-width: 0; }
.mc-scr-us-gtitles h2 { margin: 0; font: 600 18px/24px var(--font-display); }
.mc-scr-us-gtitles .mc-cap { margin: 2px 0 0; }
.mc-scr-us-add { max-width: 420px; }
.mc-scr-us-note { margin: 0; }
.mc-scr-us-mlist { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--line); }
.mc-scr-us-mlist li { display: flex; align-items: center; gap: 10px; padding: 8px 4px; border-bottom: 1px solid var(--line); font-size: 13px; line-height: 18px; }
.mc-scr-us-mtx { flex: 1; min-width: 0; display: grid; }
.mc-scr-us-mtx .mc-cap { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Profils */
.mc-scr-us-matrix-scroll { flex: 1; min-height: 0; overflow: auto; background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius-md); }
.mc-scr-us-matrix { width: 100%; border-collapse: collapse; font-size: 13px; line-height: 18px; }
.mc-scr-us-matrix th, .mc-scr-us-matrix td { padding: 10px 14px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
.mc-scr-us-matrix thead th { position: sticky; top: 0; z-index: 1; background: var(--surface); font-weight: 600; }
.mc-scr-us-matrix thead th:not(:first-child), .mc-scr-us-matrix td { text-align: center; width: 150px; }
.mc-scr-us-matrix thead th > span, .mc-scr-us-matrix tbody th > span { display: block; }
.mc-scr-us-matrix tbody th { font-weight: 400; }
.mc-scr-us-matrix tbody tr:last-child > * { border-bottom: 0; }
.mc-scr-us-matrix tbody tr:hover { background: var(--surface-sunken); }
.mc-scr-us-perm { font-weight: 600; }
.mc-scr-us-pl { font-weight: 600; }
.mc-scr-us-cell { display: inline-flex; align-items: center; gap: 6px; }
.mc-scr-us-lock { color: var(--ink-subtle); }
.mc-scr-us-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* Modales */
.mc-scr-us-form { display: grid; gap: 14px; }
.mc-scr-us-checks { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
.mc-scr-us-textarea { height: auto; padding-block: 8px; }
.mc-scr-us-textarea textarea { flex: 1; min-width: 0; min-height: 56px; border: 0; outline: 0; resize: vertical; background: transparent; color: inherit; font: inherit; padding: 0; }
.mc-scr-us-textarea textarea::placeholder { color: var(--ink-subtle); }

@media (min-width: 1800px) {
  .mc-scr-us-main > * { width: 100%; max-width: 1400px; margin-inline: auto; box-sizing: border-box; }
}
@media (max-width: 1179px) {
  .mc-scr-us-main { padding: 18px 20px; }
  .mc-scr-us-glist { width: 220px; }
  .mc-scr-us-search { width: 240px; }
  .mc-scr-us-matrix thead th:not(:first-child), .mc-scr-us-matrix td { width: 110px; }
}
</style>
