import { defineStore } from 'pinia'

export const useActivityStore = defineStore('activity', {
  state: () => ({
    activities: [
      {
        id: 1,
        name: '新员工团队融合活动',
        type: '团建',
        date: '2024-01-15',
        location: '上海',
        budget: 50000,
        status: '进行中',
        responsible: '张三',
        description: '为50名新员工组织半天的团队融合活动',
        participants: 50,
        tasks: [
          { id: 1, name: '预订会议室', responsible: '张三', deadline: '2024-01-01', status: '已完成' },
          { id: 2, name: '准备活动道具', responsible: '李四', deadline: '2024-01-10', status: '进行中' }
        ],
        risks: [
          { id: 1, type: '天气风险', description: '户外活动可能受天气影响', level: '中', plan: '准备室内备用场地' }
        ]
      },
      {
        id: 2,
        name: '公司周年庆',
        type: '庆典',
        date: '2024-02-20',
        location: '北京总部',
        budget: 200000,
        status: '待开始',
        responsible: '王五',
        description: '庆祝公司成立10周年大型庆典活动',
        participants: 200,
        tasks: [],
        risks: []
      }
    ],
    currentActivity: null,
    notifications: [
      {
        id: 1,
        type: 'warning',
        title: '智能提醒',
        content: '"周年庆"活动还有30天，建议现在开始预定场地',
        time: '2小时前',
        read: false
      },
      {
        id: 2,
        type: 'info',
        title: '风险提醒',
        content: '检测到"户外拓展"活动当日降雨概率70%，请查看预案',
        time: '1天前',
        read: false
      }
    ],
    todos: [
      {
        id: 1,
        title: '审批场地预订申请',
        activity: '新员工团队融合活动',
        deadline: '2024-01-05',
        priority: 'high',
        status: 'pending'
      },
      {
        id: 2,
        title: '确认供应商合同',
        activity: '公司周年庆',
        deadline: '2024-01-10',
        priority: 'medium',
        status: 'pending'
      }
    ]
  }),

  getters: {
    totalActivities: (state) => state.activities.length,
    ongoingActivities: (state) => state.activities.filter(a => a.status === '进行中').length,
    completedActivities: (state) => state.activities.filter(a => a.status === '已完成').length,
    totalBudget: (state) => state.activities.reduce((sum, a) => sum + a.budget, 0),
    unreadNotifications: (state) => state.notifications.filter(n => !n.read).length,
    pendingTodos: (state) => state.todos.filter(t => t.status === 'pending').length
  },

  actions: {
    addActivity(activity) {
      this.activities.push({
        id: Date.now(),
        ...activity,
        status: '待开始',
        tasks: [],
        risks: []
      })
    },
    
    updateActivity(id, updates) {
      const index = this.activities.findIndex(a => a.id === id)
      if (index !== -1) {
        this.activities[index] = { ...this.activities[index], ...updates }
      }
    },
    
    setCurrentActivity(id) {
      this.currentActivity = this.activities.find(a => a.id === id)
    },
    
    addTask(activityId, task) {
      const activity = this.activities.find(a => a.id === activityId)
      if (activity) {
        activity.tasks.push({
          id: Date.now(),
          ...task
        })
      }
    },
    
    addRisk(activityId, risk) {
      const activity = this.activities.find(a => a.id === activityId)
      if (activity) {
        activity.risks.push({
          id: Date.now(),
          ...risk
        })
      }
    },
    
    markNotificationRead(id) {
      const notification = this.notifications.find(n => n.id === id)
      if (notification) {
        notification.read = true
      }
    },
    
    updateTodoStatus(id, status) {
      const todo = this.todos.find(t => t.id === id)
      if (todo) {
        todo.status = status
      }
    }
  }
})