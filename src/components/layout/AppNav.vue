<script setup lang="ts">
// AppNav no tiene estado propio.
// Vue Router se encarga de marcar el tab activo vía router-link-active.
</script>

<template>
  <nav class="bg-white border-b border-(--abh-border) px-6 sticky top-0 z-40">
    <div class="max-w-[1100px] mx-auto flex">
      <RouterLink
        to="/posiciones"
        class="nav-tab"
        active-class="nav-tab--active"
      >
        <!-- Ícono barras -->
        <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <rect x="1" y="9" width="3" height="6" rx="0.5"/>
          <rect x="6" y="5" width="3" height="10" rx="0.5"/>
          <rect x="11" y="1" width="3" height="14" rx="0.5"/>
        </svg>
        Posiciones
      </RouterLink>

      <RouterLink
        to="/designaciones"
        class="nav-tab"
        active-class="nav-tab--active"
      >
        <!-- Ícono persona con check -->
        <svg class="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
          <circle cx="6" cy="4.5" r="2.5"/>
          <path d="M1 13c0-2.8 2.2-4.5 5-4.5s5 1.7 5 4.5"/>
          <path d="M12 7l1.5 1.5L16 6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Designaciones
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-barlow-condensed);
  font-size: 0.88rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-decoration: none;
  padding: 0.75rem 1.25rem;
  color: #64748b;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -1.5px;
  transition: color 0.15s, border-color 0.15s;
}
.nav-tab:hover {
  color: var(--abh-blue);
}
.nav-tab--active {
  color: var(--abh-blue);
  border-bottom-color: var(--abh-gold);
}
.nav-icon {
  width: 15px;
  height: 15px;
  opacity: 0.7;
  flex-shrink: 0;
}
.nav-tab--active .nav-icon {
  opacity: 1;
}
</style>
