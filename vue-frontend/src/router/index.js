import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue')
      },
      {
        path: 'properties',
        name: 'Properties',
        component: () => import('@/views/Property/List.vue')
      },
      {
        path: 'properties/create',
        name: 'PropertyCreate',
        component: () => import('@/views/Property/Form.vue')
      },
      {
        path: 'properties/edit/:id',
        name: 'PropertyEdit',
        component: () => import('@/views/Property/Form.vue')
      },
      {
        path: 'tenants',
        name: 'Tenants',
        component: () => import('@/views/Tenant/List.vue')
      },
      {
        path: 'tenants/create',
        name: 'TenantCreate',
        component: () => import('@/views/Tenant/Form.vue')
      },
      {
        path: 'tenants/edit/:id',
        name: 'TenantEdit',
        component: () => import('@/views/Tenant/Form.vue')
      },
      {
        path: 'leases',
        name: 'Leases',
        component: () => import('@/views/Lease/List.vue')
      },
      {
        path: 'leases/create',
        name: 'LeaseCreate',
        component: () => import('@/views/Lease/Form.vue')
      },
      {
        path: 'leases/:id',
        name: 'LeaseDetail',
        component: () => import('@/views/Lease/Detail.vue')
      },
      {
        path: 'bills',
        name: 'Bills',
        component: () => import('@/views/Bill/List.vue')
      },
      {
        path: 'feedbacks',
        name: 'Feedbacks',
        component: () => import('@/views/Feedback/List.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/Profile/Index.vue')
      },
      {
        path: 'tasks',
        name: 'Tasks',
        component: () => import('@/views/Task/Index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn) {
    next('/')
  } else {
    next()
  }
})

export default router
