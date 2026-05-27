import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'

const LoginView            = () => import('@/views/auth/LoginView.vue')
const RegisterView         = () => import('@/views/auth/RegisterView.vue')
const OnboardingView       = () => import('@/views/auth/OnboardingView.vue')
const DashboardView        = () => import('@/views/DashboardView.vue')
const DiscoverView         = () => import('@/views/DiscoverView.vue')
const InternshipDetailView = () => import('@/views/InternshipDetailView.vue')
const TrackerView          = () => import('@/views/TrackerView.vue')
const AnalyticsView        = () => import('@/views/AnalyticsView.vue')
const ProfileView          = () => import('@/views/ProfileView.vue')
const AuthLayout           = () => import('@/layouts/AuthLayout.vue')
const MainLayout           = () => import('@/layouts/MainLayout.vue')

const routes = [
  {
    path: '/auth', component: AuthLayout, meta: { requiresGuest: true },
    children: [
      { path: 'login',    name: 'login',    component: LoginView },
      { path: 'register', name: 'register', component: RegisterView },
    ],
  },
  { path: '/onboarding', name: 'onboarding', component: OnboardingView, meta: { requiresAuth: true } },
  {
    path: '/', component: MainLayout, meta: { requiresAuth: true },
    children: [
      { path: '',              redirect: '/dashboard' },
      { path: 'dashboard',     name: 'dashboard',         component: DashboardView },
      { path: 'discover',      name: 'discover',          component: DiscoverView },
      { path: 'internship/:id',name: 'internship-detail', component: InternshipDetailView },
      { path: 'tracker',       name: 'tracker',           component: TrackerView },
      { path: 'analytics',     name: 'analytics',         component: AnalyticsView },
      { path: 'profile',       name: 'profile',           component: ProfileView },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) { return savedPosition || { top: 0 } },
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) return next({ name: 'login', query: { redirect: to.fullPath } })
  if (to.meta.requiresGuest && auth.isAuthenticated) return next({ name: 'dashboard' })
  if (auth.isAuthenticated && !auth.isOnboardingDone && to.name !== 'onboarding') return next({ name: 'onboarding' })
  next()
})

export default router