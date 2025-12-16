<template>
  <div class="dashboard">
    <!-- 核心数据总览 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon ongoing">
              <el-icon size="40"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ ongoingActivities }}</div>
              <div class="stat-label">进行中活动</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon pending">
              <el-icon size="40"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ pendingTodos }}</div>
              <div class="stat-label">待办事项</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon total">
              <el-icon size="40"><List /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ totalActivities }}</div>
              <div class="stat-label">总活动数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon budget">
              <el-icon size="40"><Money /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ formatBudget(totalBudget) }}</div>
              <div class="stat-label">总预算</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快速创建入口 -->
    <el-row class="quick-actions">
      <el-col :span="24">
        <el-card>
          <div class="quick-create">
            <h3>快速创建活动</h3>
            <el-button type="primary" size="large" @click="showCreateDialog = true">
              <el-icon><Plus /></el-icon>
              创建新活动
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项和智能提醒 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :span="12">
        <el-card class="todo-card">
          <template #header>
            <div class="card-header">
              <span>我的待办</span>
              <el-button text @click="handleTodoAction">查看全部</el-button>
            </div>
          </template>
          <div class="todo-list">
            <div 
              v-for="todo in pendingTodosList" 
              :key="todo.id"
              class="todo-item"
              @click="handleTodoClick(todo)"
            >
              <div class="todo-content">
                <div class="todo-title">{{ todo.title }}</div>
                <div class="todo-meta">
                  <span>{{ todo.activity }}</span>
                  <span class="deadline">截止: {{ todo.deadline }}</span>
                </div>
              </div>
              <el-tag :type="getPriorityType(todo.priority)" size="small">
                {{ getPriorityText(todo.priority) }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="notification-card">
          <template #header>
            <div class="card-header">
              <span>智能提醒</span>
              <el-button text @click="handleNotificationAction">查看全部</el-button>
            </div>
          </template>
          <div class="notification-list">
            <div 
              v-for="notification in unreadNotificationsList" 
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
              @click="handleNotificationClick(notification)"
            >
              <div class="notification-icon">
                <el-icon :size="20" :color="getNotificationColor(notification.type)">
                  <Warning v-if="notification.type === 'warning'" />
                  <InfoFilled v-else />
                </el-icon>
              </div>
              <div class="notification-content">
                <div class="notification-title">{{ notification.title }}</div>
                <div class="notification-text">{{ notification.content }}</div>
                <div class="notification-time">{{ notification.time }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 创建活动对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      title="创建新活动"
      width="600px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="createForm.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="createForm.type" placeholder="请选择活动类型">
            <el-option label="团建" value="团建" />
            <el-option label="庆典" value="庆典" />
            <el-option label="会议" value="会议" />
            <el-option label="培训" value="培训" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动时间">
          <el-date-picker
            v-model="createForm.date"
            type="date"
            placeholder="选择日期"
          />
        </el-form-item>
        <el-form-item label="活动地点">
          <el-input v-model="createForm.location" placeholder="请输入活动地点" />
        </el-form-item>
        <el-form-item label="预算">
          <el-input-number
            v-model="createForm.budget"
            :min="0"
            :step="1000"
            placeholder="请输入预算"
          />
        </el-form-item>
        <el-form-item label="参与人数">
          <el-input-number
            v-model="createForm.participants"
            :min="0"
            placeholder="请输入参与人数"
          />
        </el-form-item>
        <el-form-item label="活动描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入活动描述"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">取消</el-button>
          <el-button type="primary" @click="handleCreateActivity">创建</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivityStore } from '../stores/activity'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus } from '@element-plus/icons-vue'

const store = useActivityStore()
const router = useRouter()

// 统计数据
const totalActivities = computed(() => store.totalActivities)
const ongoingActivities = computed(() => store.ongoingActivities)
const pendingTodos = computed(() => store.pendingTodos)
const totalBudget = computed(() => store.totalBudget)

// 待办事项和通知
const pendingTodosList = computed(() => store.todos.filter(t => t.status === 'pending').slice(0, 5))
const unreadNotificationsList = computed(() => store.notifications.filter(n => !n.read).slice(0, 5))

// 创建活动相关
const showCreateDialog = ref(false)
const createForm = ref({
  name: '',
  type: '',
  date: '',
  location: '',
  budget: 0,
  participants: 0,
  description: ''
})

// 格式化预算
const formatBudget = (budget) => {
  return `¥${(budget / 10000).toFixed(1)}万`
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const types = {
    high: 'danger',
    medium: 'warning',
    low: 'info'
  }
  return types[priority] || 'info'
}

// 获取优先级文本
const getPriorityText = (priority) => {
  const texts = {
    high: '高',
    medium: '中',
    low: '低'
  }
  return texts[priority] || '中'
}

// 获取通知颜色
const getNotificationColor = (type) => {
  const colors = {
    warning: '#E6A23C',
    info: '#409EFF',
    error: '#F56C6C'
  }
  return colors[type] || '#409EFF'
}

// 处理待办事项点击
const handleTodoClick = (todo) => {
  ElMessage.success(`处理待办: ${todo.title}`)
  store.updateTodoStatus(todo.id, 'completed')
}

// 处理通知点击
const handleNotificationClick = (notification) => {
  store.markNotificationRead(notification.id)
  ElMessage.info(`查看通知: ${notification.title}`)
}

// 处理待办操作
const handleTodoAction = () => {
  ElMessage.info('跳转到待办列表')
}

// 处理通知操作
const handleNotificationAction = () => {
  ElMessage.info('跳转到通知中心')
}

// 创建活动
const handleCreateActivity = () => {
  if (!createForm.value.name || !createForm.value.type) {
    ElMessage.warning('请填写必要信息')
    return
  }
  
  store.addActivity(createForm.value)
  showCreateDialog.value = false
  ElMessage.success('活动创建成功')
  
  // 重置表单
  createForm.value = {
    name: '',
    type: '',
    date: '',
    location: '',
    budget: 0,
    participants: 0,
    description: ''
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stat-icon.ongoing {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-icon.pending {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-icon.total {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-icon.budget {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-info {
  text-align: right;
}

.stat-number {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.quick-actions {
  margin-bottom: 20px;
}

.quick-create {
  text-align: center;
  padding: 30px;
}

.quick-create h3 {
  margin-bottom: 20px;
  color: #303133;
}

.bottom-row {
  margin-bottom: 0;
}

.todo-card, .notification-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-list, .notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.todo-item:hover {
  background-color: #f5f7fa;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-content {
  flex: 1;
}

.todo-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.todo-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
}

.deadline {
  color: #f56c6c;
}

.notification-item {
  display: flex;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background-color 0.3s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item.unread {
  background-color: #f0f9ff;
}

.notification-icon {
  margin-right: 15px;
  padding-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 500;
  margin-bottom: 5px;
}

.notification-text {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}
</style>