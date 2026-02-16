// 管理员相关子路由
export const adminRoutes = [
  {
    path: 'admin/organization',
    name: 'OrganizationManage',
    component: () => import('@/views/admin/organization-manage/index.vue'),
    meta: {
      title: '组织架构管理',
      description: '管理企业组织架构，支持多层级结构设置',
      icon: 'OfficeBuilding',
      isShow: true
    }
  },
  {
    path: 'admin/users',
    name: 'UserManage',
    component: () => import('@/views/admin/user-manage/index.vue'),
    meta: {
      title: '用户管理',
      description: '管理系统所有用户信息，包括添加、修改、删除及权限分配',
      icon: 'User',
      isShow: true
    }
  },
  {
    path: 'admin/roles',
    name: 'RoleManage',
    component: () => import('@/views/admin/role-manage/index.vue'),
    meta: {
      title: '角色管理',
      icon: 'Avatar',
      isShow: true
    }
  },
  {
    path: 'admin/permissions',
    name: 'PermissionManage',
    component: () => import('@/views/admin/permission-manage/index.vue'),
    meta: {
      title: '权限管理',
      icon: 'Menu',
      isShow: true
    }
  },
  {
    path: 'admin/role-authorize',
    name: 'RoleAuthorize',
    component: () => import('@/views/admin/role-authorize/index.vue'),
    meta: {
      title: '角色授权',
      icon: 'Connection',
      isShow: true
    }
  },
  {
    path: 'admin/user-role',
    name: 'UserRole',
    component: () => import('@/views/admin/user-role/index.vue'),
    meta: {
      title: '用户角色',
      icon: 'User',
      isShow: true
    }
  },
  {
    path: 'admin/sys-config',
    name: 'SysConfigManage',
    component: () => import('@/views/admin/sys-config/index.vue'),
    meta: {
      title: '系统配置',
      icon: 'Setting',
      isShow: true
    }
  }
]
