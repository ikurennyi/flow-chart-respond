import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from './routes'
import WelcomeView from '../views/WelcomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: ROUTES.WELCOME.path,
      name: ROUTES.WELCOME.name,
      component: WelcomeView,
    },
    {
      path: ROUTES.FLOW.path,
      name: ROUTES.FLOW.name,
      component: () => import('../views/FlowView.vue'),
    },
  ],
})

export default router
