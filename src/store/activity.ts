import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Activity } from '@/types/activity'

export const useActivityStore = defineStore('activity', () => {
  // 状态
  const activities = ref<Activity[]>([])
  const currentActivity = ref<Activity | null>(null)
  const unreadNotifications = ref(3)
  const todos = ref<any[]>([]) // 临时类型，实际需要定义Todo类型
  const notifications = ref<any[]>([]) // 临时类型，实际需要定义Notification类型
  
  // 计算属性
  const totalActivities = computed(() => activities.value.length)
  const ongoingActivities = computed(() => activities.value.filter(a => a.status === '进行中').length)
  const totalBudget = computed(() => activities.value.reduce((sum, a) => sum + a.budget, 0))
  const pendingTodos = computed(() => 0) // 临时值，实际应该从todos计算
  
  // 方法
  const setActivities = (data: Activity[]) => {
    activities.value = data
  }
  
  const setCurrentActivity = (activity: Activity | string | null) => {
    if (activity === null) {
      currentActivity.value = null
      return
    }
    if (typeof activity === 'string') {
      currentActivity.value = activities.value.find(item => item.id === activity) || null
      return
    }
    currentActivity.value = activity
  }
  
  const addActivity = (activity: Activity) => {
    activities.value.push(activity)
  }
  
  const updateActivity = (id: string, updates: Partial<Activity>) => {
    const index = activities.value.findIndex(item => item.id === id)
    if (index !== -1) {
      activities.value[index] = { ...activities.value[index], ...updates }
    }
  }
  
  const deleteActivity = (id: string) => {
    const index = activities.value.findIndex(item => item.id === id)
    if (index !== -1) {
      activities.value.splice(index, 1)
    }
  }
  
  const clearNotifications = () => {
    unreadNotifications.value = 0
  }
  
  return {
    activities,
    currentActivity,
    unreadNotifications,
    todos,
    notifications,
    totalActivities,
    ongoingActivities,
    totalBudget,
    pendingTodos,
    setActivities,
    setCurrentActivity,
    addActivity,
    updateActivity,
    deleteActivity,
    clearNotifications
  }
})
