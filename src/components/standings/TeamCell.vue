<script setup lang="ts">
import { useTeam } from '@/composables/useTeam'

const props = defineProps<{
  teamId: number
  /** Tamaño del logo. Default: 'md' (26px). 'sm' = 18px para tablas compactas. */
  size?: 'sm' | 'md'
}>()

const team = useTeam(props.teamId)

const logoSize = props.size === 'sm' ? 18 : 26

function hideOnError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}
</script>

<template>
  <div class="team-cell">
    <img
      v-if="team?.logo"
      :src="team.logo"
      :alt="team.short_name ?? team.name"
      :style="{ width: `${logoSize}px`, height: `${logoSize}px` }"
      class="team-logo"
      @error="hideOnError"
    />
    <span
      v-else
      class="team-logo-ph"
      :style="{ width: `${logoSize}px`, height: `${logoSize}px` }"
      aria-hidden="true"
    >
      {{ (team?.short_name ?? team?.name ?? '?').substring(0, 2).toUpperCase() }}
    </span>

    <span class="team-name">{{ team?.name ?? '—' }}</span>
    <span class="team-short">{{ team?.short_name ?? team?.name ?? '—' }}</span>
  </div>
</template>

<style scoped>
.team-cell  { display: flex; align-items: center; gap: 0.55rem; }
.team-logo  { object-fit: contain; flex-shrink: 0; }
.team-logo-ph {
  background: var(--abh-border);
  border-radius: 50%;
  flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.6rem; font-weight: 700; color: #94a3b8;
}
.team-name  { font-weight: 600; white-space: nowrap; }
.team-short { font-size: 0.75rem; font-weight: 600; display: none; }

@media (max-width: 640px) {
  .team-name  { display: none; }
  .team-short { display: block; }
}
</style>
