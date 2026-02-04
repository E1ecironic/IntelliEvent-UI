import { createRouter, createWebHashHistory } from 'vue-router'
import Layout from '@/layout/index.vue'
import { adminRoutes } from './childrenRouter/admin'
import { activityRoutes } from './childrenRouter/activity'
import { aiRoutes } from './childrenRouter/ai'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
      isShow: false
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: {
          title: '首页',
          icon: 'House',
          isShow: true
        }
      },
      {
        path: '/creation',
        name: 'CreationCenter',
        component: () => import('@/views/creation-center/index.vue'),
        meta: {
          title: '创作中心',
          icon: 'Edit',
          isShow: true
        }
      },
      {
        path: '/reports',
        name: 'DataReport',
        component: () => import('@/views/data-report/index.vue'),
        meta: {
          title: '数据报表',
          icon: 'TrendCharts',
          isShow: true
        }
      },
      {
        path: '/knowledge',
        name: 'KnowledgeBase',
        component: () => import('@/views/knowledge-base/index.vue'),
        meta: {
          title: '知识库',
          icon: 'Document',
          isShow: true
        }
      },
      ...adminRoutes.map(route => ({ ...route, path: route.path.startsWith('/') ? route.path : `/${route.path}` })),
      ...activityRoutes.map(route => ({ ...route, path: route.path.startsWith('/') ? route.path : `/${route.path}` })),
      ...aiRoutes.map(route => ({ ...route, path: route.path.startsWith('/') ? route.path : `/${route.path}` }))
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const whiteList = ['/login'] // 白名单

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next(`/login?redirect=${to.path}`)
    }
  }
})

export default router