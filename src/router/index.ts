import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layout/index.vue'
import { adminRoutes } from './childrenRouter/admin'
import { activityRoutes } from './childrenRouter/activity'
import { aiRoutes } from './childrenRouter/ai'
import { sysPermissionApi } from '@/api'

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
    name: 'Root',
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

const viewModules = import.meta.glob('@/views/**/*.vue')

const componentMap: Record<string, () => Promise<any>> = {
  Dashboard: () => import('@/views/dashboard/index.vue'),
  CreationCenter: () => import('@/views/creation-center/index.vue'),
  DataReport: () => import('@/views/data-report/index.vue'),
  KnowledgeBase: () => import('@/views/knowledge-base/index.vue'),
  ActivityList: () => import('@/views/activity/list/index.vue'),
  ActivityDetail: () => import('@/views/activity/detail/index.vue'),
  AIGenerate: () => import('@/views/ai/generate/index.vue'),
  OrganizationManage: () => import('@/views/admin/organization-manage/index.vue'),
  UserManage: () => import('@/views/admin/user-manage/index.vue'),
  RoleManage: () => import('@/views/admin/role-manage/index.vue'),
  PermissionManage: () => import('@/views/admin/permission-manage/index.vue'),
  RoleAuthorize: () => import('@/views/admin/role-authorize/index.vue'),
  UserRole: () => import('@/views/admin/user-role/index.vue'),
  SysConfigManage: () => import('@/views/admin/sys-config/index.vue'),
  SysRole: () => import('@/views/admin/role-manage/index.vue'),
  SysPermission: () => import('@/views/admin/permission-manage/index.vue'),
  SysRoleAuthorize: () => import('@/views/admin/role-authorize/index.vue'),
  SysUserRole: () => import('@/views/admin/user-role/index.vue')
}

const normalizePath = (path: string) => {
  let result = path || ''
  if (result.includes('#')) {
    const parts = result.split('#')
    result = parts[parts.length - 1] || ''
  }
  result = result.split('?')[0] || ''
  if (result && !result.startsWith('/')) {
    result = `/${result}`
  }
  return result
}

const resolveViewComponent = (component?: string) => {
  if (!component) return null
  if (component === 'Layout') return Layout
  if (componentMap[component]) return componentMap[component]
  const normalized = component.replace(/^\/?views\//, '').replace(/^\/+/, '')
  const directPath = `/src/views/${normalized}.vue`
  const indexPath = `/src/views/${normalized}/index.vue`
  if (viewModules[directPath]) return viewModules[directPath]
  if (viewModules[indexPath]) return viewModules[indexPath]
  return null
}

const getUserName = () => {
  const raw = localStorage.getItem('userInfo')
  if (!raw) return ''
  try {
    const data = JSON.parse(raw) || {}
    return (data.userName || data.username || data.account || '').toString().toLowerCase()
  } catch (error) {
    return ''
  }
}

const isSuperAdmin = () => {
  return getUserName() === 'sa'
}

const normalizeMenuTree = (items: any[], parentKey = ''): any[] => {
  const source = Array.isArray(items) ? items : []
  const map = new Map<string, any>()
  source.forEach((item, index) => {
    if (!item) return
    const path = normalizePath(item?.path || '')
    const key = path || item?.code || item?.id || item?.name || `${parentKey}${index}`
    const children = normalizeMenuTree(Array.isArray(item?.children) ? item.children : [], `${parentKey}${key}-`)
    const existing = map.get(key)
    if (existing) {
      const mergedChildren = [...(existing.children || []), ...children]
      map.set(key, {
        ...existing,
        ...item,
        path,
        children: normalizeMenuTree(mergedChildren, `${parentKey}${key}-`)
      })
    } else {
      map.set(key, {
        ...item,
        path,
        children
      })
    }
  })
  const result = Array.from(map.values())
  result.sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))
  return result
}

const parseMenuTree = () => {
  const raw = localStorage.getItem('menuTree')
  if (!raw) return []
  try {
    return normalizeMenuTree(JSON.parse(raw) || [])
  } catch (error) {
    return []
  }
}

const getAllowedPaths = () => {
  const data = parseMenuTree()
  const paths: string[] = []
  const walk = (nodes: any[]) => {
    nodes.forEach(node => {
      if (node?.path) paths.push(normalizePath(node.path))
      if (Array.isArray(node?.children) && node.children.length > 0) walk(node.children)
    })
  }
  walk(data)
  return new Set(paths.filter(Boolean))
}

const isPathAllowed = (path: string, allowedPaths: Set<string>) => {
  const normalized = normalizePath(path)
  if (allowedPaths.size === 0) return true
  if (allowedPaths.has(normalized)) return true
  for (const allowed of allowedPaths) {
    if (normalized.startsWith(`${allowed}/`)) return true
  }
  return false
}

let dynamicRoutesAdded = false

const buildRoutesFromMenu = (menus: any[]): RouteRecordRaw[] => {
  const result: RouteRecordRaw[] = []
  menus.forEach(item => {
    if (item?.type && item.type !== 'MENU') return
    if (item?.status === 0 || item?.visible === 0) return
    const path = normalizePath(item?.path || '')
    const children = Array.isArray(item?.children) ? item.children : []
    const childRoutes = buildRoutesFromMenu(children)
    const component = resolveViewComponent(item?.component)
    if (!path && childRoutes.length === 0) return
    if (!component && childRoutes.length === 0) return
    const route: RouteRecordRaw = {
      path: path || `/${item?.code || item?.id}`,
      name: item?.code || item?.name || path || item?.id,
      component: component || (childRoutes.length > 0 ? Layout : undefined),
      meta: {
        title: item?.name,
        icon: item?.icon,
        isShow: item?.visible !== 0
      }
    }
    if (childRoutes.length > 0) route.children = childRoutes
    result.push(route)
  })
  return result
}

const addDynamicRoutes = (menuTree: any[]) => {
  if (dynamicRoutesAdded) return
  const dynamicRoutes = buildRoutesFromMenu(menuTree)
  dynamicRoutes.forEach(route => {
    if (route.name && router.hasRoute(route.name)) return
    router.addRoute('Root', route)
  })
  dynamicRoutesAdded = true
}

const ensurePermissionCache = async () => {
  if (isSuperAdmin()) {
    localStorage.setItem('permissions', JSON.stringify(['*']))
  }
  const hasMenuTree = !!localStorage.getItem('menuTree')
  const hasButtons = !!localStorage.getItem('permissions')
  if (!hasMenuTree || (!hasButtons && !isSuperAdmin())) {
    const [menuRes, buttonRes] = await Promise.all([
      sysPermissionApi.ApiUserMenuTree(),
      sysPermissionApi.ApiButtons()
    ])
    if (menuRes.code === 200) {
      const normalizedMenu = normalizeMenuTree(menuRes.data || [])
      localStorage.setItem('menuTree', JSON.stringify(normalizedMenu))
    }
    if (!isSuperAdmin() && buttonRes.code === 200) {
      const rawPermissions = Array.isArray(buttonRes.data) ? buttonRes.data : []
      const permissionCodes = rawPermissions
        .map(item => (typeof item === 'string' ? item : item?.code || item?.permission || item?.id))
        .filter(Boolean)
      localStorage.setItem('permissions', JSON.stringify(permissionCodes))
    }
  }
}

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token')
  const whiteList = ['/login'] // 白名单

  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
    } else {
      if (isSuperAdmin()) {
        if (!localStorage.getItem('permissions')) {
          localStorage.setItem('permissions', JSON.stringify(['*']))
        }
        try {
          await ensurePermissionCache()
        } catch (error) {
          next()
          return
        }
        addDynamicRoutes(parseMenuTree())
        next()
        return
      }
      try {
        await ensurePermissionCache()
      } catch (error) {
        next()
        return
      }
      addDynamicRoutes(parseMenuTree())
      const allowedPaths = getAllowedPaths()
      const routePaths = new Set(router.getRoutes().map(route => route.path))
      const effectiveAllowedPaths = new Set(
        Array.from(allowedPaths).filter(path => routePaths.has(path))
      )
      const hasMatchedRoute = router.resolve(to).matched.length > 0
      if (!hasMatchedRoute) {
        const fallback = Array.from(effectiveAllowedPaths)[0] || '/dashboard'
        next(fallback)
        return
      }
      if (effectiveAllowedPaths.size === 0 || isPathAllowed(to.path, effectiveAllowedPaths)) {
        next()
      } else {
        const fallback = Array.from(effectiveAllowedPaths)[0] || '/dashboard'
        next(fallback)
      }
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
