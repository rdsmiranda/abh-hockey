import { createRouter, createWebHashHistory } from 'vue-router'

/**
 * Usamos createWebHashHistory para compatibilidad total con GitHub Pages
 * sin necesidad de configurar redirects del servidor.
 *
 * Las URLs serán: https://usuario.github.io/abh-hockey/#/posiciones
 *                 https://usuario.github.io/abh-hockey/#/designaciones
 *
 * Si en el futuro se agrega un dominio custom con control del servidor,
 * se puede migrar a createWebHistory sin cambios en los componentes.
 */
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/posiciones',
    },
    {
      path: '/posiciones',
      name: 'standings',
      component: () => import('@/pages/StandingsPage.vue'),
      meta: { title: 'Posiciones — ABH' },
    },
    {
      path: '/designaciones',
      name: 'designations',
      component: () => import('@/pages/DesignationsPage.vue'),
      meta: { title: 'Designaciones — ABH' },
    },
    // Ruta catch-all: redirige al inicio en lugar de pantalla en blanco
    {
      path: '/:pathMatch(.*)*',
      redirect: '/posiciones',
    },
  ],
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' }
  },
})

// Actualizar <title> en cada navegación
router.afterEach((to) => {
  if (typeof to.meta.title === 'string') {
    document.title = to.meta.title
  }
})

export default router
