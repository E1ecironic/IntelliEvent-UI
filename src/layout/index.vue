<template>
  <div class="layout-container">
    <div class="sidebar">
      <div class="logo">
        <h2>AI活动管理</h2>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        router
        background-color="#304156"
        text-color="#fff"
        active-text-color="#409EFF"
      >
        <MenuTree :items="menuItems" />
      </el-menu>
    </div>
    
    <div class="main-container">
      <el-header class="header">
        <aimi-page-header>
          <template #right>
            <div class="header-right">
              <el-badge :value="unreadNotifications" class="notification-badge">
                <el-icon size="20"><Bell /></el-icon>
              </el-badge>
              <el-dropdown @command="handleCommand">
                <span class="user-info">
                  <el-avatar size="small" icon="UserFilled" />
                  <span class="username">{{ userInfo.userName || '管理员' }}</span>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="profile">个人设置</el-dropdown-item>
                    <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </aimi-page-header>
      </el-header>
      
      <el-main class="main-content">
        <router-view />
      </el-main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, resolveComponent } from 'vue'
import type { PropType } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityStore } from '@/store/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api'
import { Bell } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useActivityStore()
const unreadNotifications = computed(() => store.unreadNotifications)
const activeMenu = computed(() => route.path)

// 用户信息
const userInfo = computed(() => {
  const info = localStorage.getItem('userInfo')
  return info ? JSON.parse(info) : {}
})

const menuTree = computed(() => {
  const raw = localStorage.getItem('menuTree')
  if (!raw) return []
  try {
    return JSON.parse(raw) || []
  } catch (error) {
    return []
  }
})

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

const buildMenuItems = (items: any[], parentKey = ''): any[] => {
  const source = Array.isArray(items) ? items : []
  const map = new Map<string, any>()
  source
    .filter(item => !item?.type || item.type === 'MENU')
    .filter(item => item?.status !== 0 && item?.visible !== 0)
    .forEach((item, index) => {
      const path = normalizePath(item?.path || '')
      const baseKey = path || item?.id || item?.code || item?.name || index
      const menuKey = `${parentKey}${baseKey}`
      const children = Array.isArray(item?.children)
        ? buildMenuItems(item.children, `${menuKey}-`)
        : []
      const icon =
        typeof item?.icon === 'string' && /^[A-Za-z]/.test(item.icon) ? item.icon : ''
      const existing = map.get(baseKey)
      if (existing) {
        const mergedChildren = [...(existing.children || []), ...children]
        map.set(baseKey, {
          ...existing,
          ...item,
          path,
          menuKey,
          icon,
          children: buildMenuItems(mergedChildren, `${menuKey}-`)
        })
      } else {
        map.set(baseKey, {
          ...item,
          path,
          menuKey,
          icon,
          children
        })
      }
    })
  const result = Array.from(map.values())
    .filter(item => item.path || (item.children && item.children.length > 0))
  result.sort((a, b) => (a?.sort ?? 0) - (b?.sort ?? 0))
  return result
}

const menuItems = computed(() => buildMenuItems(menuTree.value))

const MenuTree = defineComponent({
  name: 'MenuTree',
  props: {
    items: {
      type: Array as PropType<any[]>,
      default: () => []
    }
  },
  setup(props) {
    const renderIcon = (icon?: string) => {
      if (!icon) return null
      return h(resolveComponent('el-icon') as any, null, {
        default: () => [h(resolveComponent(icon) as any)]
      })
    }

    const renderItems = (items: any[]) => {
      return items.map(item => {
        const iconNode = renderIcon(item.icon)
        const children = Array.isArray(item.children) ? item.children : []
        if (children.length > 0) {
          return h(resolveComponent('el-sub-menu') as any, { index: item.menuKey }, {
            title: () => [iconNode, h('span', item.name || '')],
            default: () => renderItems(children)
          })
        }
        if (!item.path) return null
        return h(resolveComponent('el-menu-item') as any, { index: item.path }, {
          default: () => [iconNode, h('span', item.name || '')]
        })
      })
    }

    return () => renderItems(props.items)
  }
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else if (command === 'profile') {
    ElMessage.info('个人设置功能开发中...')
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await authApi.logout()
      // 清除本地存储
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('menuTree')
      localStorage.removeItem('permissions')
      
      ElMessage.success('已成功退出登录')
      // 跳转到登录页
      router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      // 即便接口报错，前端也强制退出
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('menuTree')
      localStorage.removeItem('permissions')
      router.push('/login')
    }
  }).catch(() => {
    // 取消退出
  })
}
</script>

<style scoped lang="scss">
.layout-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background-color: #304156;
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  z-index: 1000;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434a50;
}

.logo h2 {
  margin: 0;
  color: white;
  font-size: 18px;
}

.el-menu-vertical {
  border-right: none;
}

.main-container {
  flex: 1;
  margin-left: 200px;
  display: flex;
  flex-direction: column;
  height: 100vh;
  min-width: 0;
}

.header {
  background-color: white;
  padding: 0;
  height: 60px;
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.notification-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.username {
  margin-left: 8px;
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f0f2f5;
  overflow: auto;
  display: flex;
  flex-direction: column;
}
</style>
