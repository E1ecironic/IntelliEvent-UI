import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../pages/Dashboard.vue'
import ActivityList from '../pages/ActivityList.vue'
import ActivityDetail from '../pages/ActivityDetail.vue'
import CreationCenter from '../pages/CreationCenter.vue'
import DataReport from '../pages/DataReport.vue'
import KnowledgeBase from '../pages/KnowledgeBase.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/activities',
    name: 'ActivityList',
    component: ActivityList
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: ActivityDetail
  },
  {
    path: '/creation',
    name: 'CreationCenter',
    component: CreationCenter
  },
  {
    path: '/reports',
    name: 'DataReport',
    component: DataReport
  },
  {
    path: '/knowledge',
    name: 'KnowledgeBase',
    component: KnowledgeBase
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router