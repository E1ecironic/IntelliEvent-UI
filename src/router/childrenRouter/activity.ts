// 活动相关子路由
export const activityRoutes = [
  {
    path: '/activities',
    name: 'ActivityList',
    component: () => import('@/views/activity/list/index.vue'),
    meta: {
      title: '活动列表',
      icon: 'List',
      isShow: true
    }
  },
  {
    path: '/activity/:id',
    name: 'ActivityDetail',
    component: () => import('@/views/activity/detail/index.vue'),
    meta: {
      title: '活动详情',
      icon: 'Document',
      isShow: false
    }
  }
]