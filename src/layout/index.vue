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
        <el-menu-item index="/dashboard">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/activities">
          <el-icon><List /></el-icon>
          <span>活动列表</span>
        </el-menu-item>
        <el-menu-item index="/creation">
          <el-icon><Star /></el-icon>
          <span>智能创作</span>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon><TrendCharts /></el-icon>
          <span>数据报告</span>
        </el-menu-item>
        <el-menu-item index="/knowledge">
          <el-icon><Document /></el-icon>
          <span>知识库</span>
        </el-menu-item>
        <el-sub-menu index="/admin">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/admin/organization">
            <el-icon><OfficeBuilding /></el-icon>
            <span>组织架构</span>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><UserIcon /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/roles">
            <el-icon><Key /></el-icon>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/sys-config">
            <el-icon><Setting /></el-icon>
            <span>系统配置</span>
          </el-menu-item>
        </el-sub-menu>
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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivityStore } from '@/store/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api'
import { 
  House, 
  List, 
  Star, 
  TrendCharts, 
  Document, 
  Setting, 
  OfficeBuilding, 
  User as UserIcon, 
  Key, 
  Tools as ToolsIcon,
  Bell
} from '@element-plus/icons-vue'

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
      
      ElMessage.success('已成功退出登录')
      // 跳转到登录页
      router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      // 即便接口报错，前端也强制退出
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
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
