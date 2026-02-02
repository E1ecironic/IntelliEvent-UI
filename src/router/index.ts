import { createRouter, createWebHistory } from 'vue-router'
import { adminRoutes } from './childrenRouter/admin'
import { activityRoutes } from './childrenRouter/activity'
import { aiRoutes } from './childrenRouter/ai'

const routes = [
  {
    path: '/',
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
  ...adminRoutes,
  ...activityRoutes,
  ...aiRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router