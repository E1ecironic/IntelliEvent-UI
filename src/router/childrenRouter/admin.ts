// 管理员相关子路由
export const adminRoutes = [
  {
    path: '/admin/organization',
    name: 'OrganizationManage',
    component: () => import('@/views/admin/organization-manage/index.vue'),
    meta: {
      title: '组织架构管理',
      icon: 'OfficeBuilding',
      isShow: true
    }
  },
  {
    path: '/admin/users',
    name: 'UserManage',
    component: () => import('@/views/admin/user-manage/index.vue'),
    meta: {
      title: '用户管理',
      icon: 'User',
      isShow: true
    }
  },
  {
    path: '/admin/roles',
    name: 'RoleManage',
    component: () => import('@/views/admin/role-manage/index.vue'),
    meta: {
      title: '角色管理',
      icon: 'Avatar',
      isShow: true
    }
  },
]