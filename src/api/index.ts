// API模块统一导出
export { default as organizationApi } from './modules/organization'
export { default as userApi } from './modules/user'
export { default as sysConfigApi } from './modules/sysConfig'
export { default as sysRoleApi } from './modules/sysRole'
export { default as sysPermissionApi } from './modules/sysPermission'
export { default as sysUserRoleApi } from './modules/sysUserRole'
export { default as request } from './modules/request'
export { default as publicApi } from './modules/publicApi'
export { default as authApi } from './modules/auth'
export { default as activityApi } from './modules/activity'
export { default as aiApi } from './modules/ai'

// 类型导出
export * from '@/types/api'
