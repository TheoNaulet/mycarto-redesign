<script setup lang="ts">
import { ref, computed } from 'vue'
import McIcon from '../../icons/McIcon.vue'
import { icons, type IconName } from '../../icons/icons'

const q = ref('')
const copied = ref('')
const names = computed(() => (Object.keys(icons) as IconName[]).filter((n) => n.includes(q.value.toLowerCase())))
async function copy(n: string) {
  const snippet = `<McIcon name="${n}" />`
  try { await navigator.clipboard.writeText(snippet); copied.value = n } catch { copied.value = '' }
}
</script>

<template>
  <div>
    <input v-model="q" class="ig-q" placeholder="Filtrer les pictogrammes" aria-label="Filtrer les pictogrammes" />
    <div class="ig">
      <button v-for="n in names" :key="n" type="button" class="ig-it" :title="`Copier <McIcon name=&quot;${n}&quot; />`" @click="copy(n)">
        <McIcon :name="n" size="xl" />
        <span>{{ copied === n ? 'Copié' : n }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.ig-q { width: 280px; height: 32px; border: 1px solid #7a819e; border-radius: 8px; padding: 0 10px; font: inherit; margin: 8px 0 16px; }
.ig { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
.ig-it { display: grid; justify-items: center; gap: 8px; padding: 14px 6px; border: 1px solid #dee2e4; border-radius: 12px; background: #fff; color: #262e6f; cursor: pointer; font: 12px 'Noto Sans Variable', sans-serif; }
.ig-it:hover { border-color: #2f78b7; background: #e3eefa; }
.ig-it span { color: #555b7c; }
</style>
