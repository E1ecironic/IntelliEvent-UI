<template>
  <div class="activity-detail">
    <!-- 页面标题和返回按钮 -->
    <div class="page-header">
      <el-button @click="goBack" :icon="ArrowLeft">返回</el-button>
      <h2>{{ currentActivity?.name }}</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleSave">保存</el-button>
      </div>
    </div>

    <!-- 活动基本信息卡片 -->
    <el-card class="basic-info-card">
      <el-descriptions :column="4" border>
        <el-descriptions-item label="活动类型">
          <el-tag :type="getTypeTagType(currentActivity?.type)">{{ currentActivity?.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="活动时间">{{ formatDate(currentActivity?.date) }}</el-descriptions-item>
        <el-descriptions-item label="活动地点">{{ currentActivity?.location }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentActivity?.responsibleName || currentActivity?.responsible }}</el-descriptions-item>
        <el-descriptions-item label="参与人数">{{ currentActivity?.participants }}人</el-descriptions-item>
        <el-descriptions-item label="预算">
          <span class="budget">{{ formatBudget(currentActivity?.budget) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusTagType(currentActivity?.status)">{{ currentActivity?.status }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ formatDateTime(currentActivity?.createdAt) }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 主要内容区域 - 标签页 -->
    <el-card class="main-content-card">
      <el-tabs v-model="activeTab" class="activity-tabs">
        <!-- Tab 1: 活动概览 -->
        <el-tab-pane label="活动概览" name="overview">
          <div class="overview-content">
            <el-row :gutter="20">
              <el-col :span="16">
                <div class="section">
                  <h4>活动描述</h4>
                  <el-input
                    v-model="activityForm.description"
                    type="textarea"
                    :rows="4"
                    placeholder="请输入活动描述"
                  />
                </div>
                
                <div class="section">
                  <h4>AI智能策划</h4>
                  <div class="ai-planning-panel">
                    <el-input
                      v-model="aiPrompt"
                      type="textarea"
                      :rows="3"
                      placeholder="输入您的活动想法，例如：为50名新员工组织一场半天的团队融合活动，预算5万，地点在上海"
                    />
                    <div class="ai-actions">
                      <el-button type="primary" @click="generateAIPlan" :loading="isGenerating">
                        <el-icon><Star /></el-icon>
                        生成策划草案
                      </el-button>
                      <el-button @click="clearAIInput">清空</el-button>
                    </div>
                  </div>
                </div>

                <!-- AI生成结果 -->
                <div class="section" v-if="generatedPlan">
                  <h4>AI生成的策划方案</h4>
                  <div class="ai-result-panel">
                    <div class="result-content">
                      <el-tabs v-model="resultTab">
                        <el-tab-pane label="活动概述" name="overview">
                          <div class="plan-content">{{ generatedPlan.overview }}</div>
                        </el-tab-pane>
                        <el-tab-pane label="详细流程" name="schedule">
                          <div class="plan-content">{{ generatedPlan.schedule }}</div>
                        </el-tab-pane>
                        <el-tab-pane label="物料清单" name="materials">
                          <div class="plan-content">{{ generatedPlan.materials }}</div>
                        </el-tab-pane>
                      </el-tabs>
                    </div>
                    <div class="result-actions">
                      <el-button type="success" @click="applyAIPlan">
                        <el-icon><Check /></el-icon>
                        应用此方案
                      </el-button>
                      <el-button @click="regeneratePlan">
                        <el-icon><Refresh /></el-icon>
                        重新生成
                      </el-button>
                    </div>
                  </div>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="section">
                  <h4>活动进度</h4>
                  <div class="progress-panel">
                    <el-progress 
                      :percentage="getProgress()" 
                      :color="getProgressColor()"
                      :stroke-width="20"
                    />
                    <div class="progress-text">
                      已完成 {{ completedTasks }} / {{ totalTasks }} 个任务
                    </div>
                  </div>
                </div>
                
                <div class="section">
                  <h4>快速操作</h4>
                  <div class="quick-actions">
                    <el-button @click="activeTab = 'tasks'" class="action-btn">
                      <el-icon><List /></el-icon>
                      管理任务
                    </el-button>
                    <el-button @click="activeTab = 'budget'" class="action-btn">
                      <el-icon><Money /></el-icon>
                      查看预算
                    </el-button>
                    <el-button @click="activeTab = 'risks'" class="action-btn">
                      <el-icon><Warning /></el-icon>
                      风险分析
                    </el-button>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- Tab 2: 任务流程管理 -->
        <el-tab-pane label="任务流程" name="tasks">
          <div class="tasks-content">
            <div class="section-header">
              <h4>任务列表</h4>
              <el-button type="primary" @click="showAddTaskDialog = true">
                <el-icon><Plus /></el-icon>
                添加任务
              </el-button>
            </div>
            
            <el-table :data="currentActivity?.tasks" style="width: 100%">
              <el-table-column prop="name" label="任务名称" min-width="200" />
              <el-table-column prop="responsible" label="负责人" width="120" />
              <el-table-column prop="deadline" label="截止日期" width="120">
                <template #default="{ row }">
                  {{ formatDate(row.deadline) }}
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getTaskStatusType(row.status)">{{ row.status }}</el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150">
                <template #default="{ row, $index }">
                  <el-button type="primary" link @click="updateTaskStatus($index, '已完成')">
                    完成
                  </el-button>
                  <el-button type="danger" link @click="deleteTask($index)">
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>

        <!-- Tab 3: 预算与物料管理 -->
        <el-tab-pane label="预算物料" name="budget">
          <div class="budget-content">
            <el-row :gutter="20">
              <el-col :span="16">
                <div class="section">
                  <div class="section-header">
                    <h4>预算明细</h4>
                    <el-button type="primary" @click="showAddBudgetDialog = true">
                      <el-icon><Plus /></el-icon>
                      添加预算项
                    </el-button>
                  </div>
                  
                  <el-table :data="budgetItems" style="width: 100%">
                    <el-table-column prop="category" label="类别" width="120" />
                    <el-table-column prop="item" label="项目" min-width="150" />
                    <el-table-column prop="quantity" label="数量" width="80" />
                    <el-table-column prop="unitPrice" label="单价" width="100">
                      <template #default="{ row }">
                        ¥{{ row.unitPrice }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="total" label="小计" width="120">
                      <template #default="{ row }">
                        <strong>¥{{ row.total }}</strong>
                      </template>
                    </el-table-column>
                    <el-table-column prop="supplier" label="供应商" width="120" />
                    <el-table-column prop="status" label="状态" width="100">
                      <template #default="{ row }">
                        <el-tag :type="getBudgetStatusType(row.status)">{{ row.status }}</el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </el-col>
              
              <el-col :span="8">
                <div class="section">
                  <h4>预算分析</h4>
                  <div class="budget-summary">
                    <div class="budget-item">
                      <span>总预算:</span>
                      <span class="amount">¥{{ currentActivity?.budget }}</span>
                    </div>
                    <div class="budget-item">
                      <span>已分配:</span>
                      <span class="amount">¥{{ allocatedBudget }}</span>
                    </div>
                    <div class="budget-item">
                      <span>剩余:</span>
                      <span class="amount remaining">¥{{ remainingBudget }}</span>
                    </div>
                  </div>
                  
                  <div class="ai-analysis-section">
                    <el-button type="primary" @click="analyzeBudget" :loading="isAnalyzing">
                      <el-icon><Star /></el-icon>
                      AI预算分析
                    </el-button>
                    
                    <div v-if="budgetAnalysis" class="analysis-result">
                      <h5>分析结果</h5>
                      <div class="analysis-content">{{ budgetAnalysis }}</div>
                    </div>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- Tab 4: 人员与资源 -->
        <el-tab-pane label="人员资源" name="resources">
          <div class="resources-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="section">
                  <h4>参与人员</h4>
                  <el-table :data="participants" style="width: 100%">
                    <el-table-column prop="name" label="姓名" width="120" />
                    <el-table-column prop="department" label="部门" width="120" />
                    <el-table-column prop="role" label="角色" width="100" />
                    <el-table-column prop="contact" label="联系方式" min-width="150" />
                  </el-table>
                </div>
              </el-col>
              
              <el-col :span="12">
                <div class="section">
                  <h4>供应商信息</h4>
                  <el-table :data="suppliers" style="width: 100%">
                    <el-table-column prop="name" label="供应商名称" min-width="150" />
                    <el-table-column prop="contact" label="联系人" width="120" />
                    <el-table-column prop="phone" label="电话" width="120" />
                    <el-table-column prop="service" label="服务类型" width="100" />
                  </el-table>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <!-- Tab 5: 风险与预案 -->
        <el-tab-pane label="风险预案" name="risks">
          <div class="risks-content">
            <div class="section">
              <div class="section-header">
                <h4>风险识别</h4>
                <el-button type="primary" @click="identifyRisks" :loading="isIdentifyingRisks">
                  <el-icon><Warning /></el-icon>
                  AI风险识别
                </el-button>
              </div>
              
              <div v-if="identifiedRisks.length > 0" class="risks-list">
                <div 
                  v-for="risk in identifiedRisks" 
                  :key="risk.id"
                  class="risk-item"
                >
                  <div class="risk-header">
                    <div class="risk-info">
                      <span class="risk-type">{{ risk.type }}</span>
                      <el-tag :type="getRiskLevelType(risk.level)" size="small">
                        {{ risk.level }}风险
                      </el-tag>
                    </div>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="generateEmergencyPlan(risk)"
                      :loading="risk.isGenerating"
                    >
                      <el-icon><Document /></el-icon>
                      生成预案
                    </el-button>
                  </div>
                  <div class="risk-description">{{ risk.description }}</div>
                  
                  <div v-if="risk.emergencyPlan" class="emergency-plan">
                    <h5>应急预案</h5>
                    <div class="plan-content">{{ risk.emergencyPlan }}</div>
                    <div class="plan-actions">
                      <el-button type="success" size="small" @click="applyEmergencyPlan(risk)">
                        应用预案
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else class="no-risks">
                <el-empty description="暂无识别出的风险" />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加任务对话框 -->
    <el-dialog v-model="showAddTaskDialog" title="添加任务" width="500px">
      <el-form :model="taskForm" label-width="80px">
        <el-form-item label="任务名称">
          <el-input v-model="taskForm.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="taskForm.responsible" placeholder="请输入负责人" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker v-model="taskForm.deadline" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddTaskDialog = false">取消</el-button>
          <el-button type="primary" @click="addTask">添加</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useActivityStore } from '@/store/activity'
import { ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { activityApi } from '@/api'
import type { Activity } from '@/types/activity'
import {
  Check,
  Refresh,
  List,
  Money,
  Warning,
  Plus,
  Document,
  Star
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const store = useActivityStore()

// 当前活动数据
const currentActivity = computed(() => store.currentActivity)

// 标签页状态
const activeTab = ref('overview')
const resultTab = ref('overview')

// AI生成状态
const isGenerating = ref(false)
const isAnalyzing = ref(false)
const isIdentifyingRisks = ref(false)

// 表单数据
const activityForm = ref({
  description: ''
})

const aiPrompt = ref('')
const generatedPlan = ref(null)
const budgetAnalysis = ref('')

// 对话框状态
const showAddTaskDialog = ref(false)
const showAddBudgetDialog = ref(false)

// 任务表单
const taskForm = ref({
  name: '',
  responsible: '',
  deadline: ''
})

// 预算数据（模拟）
const budgetItems = ref([
  {
    category: '场地',
    item: '会议室租赁',
    quantity: 1,
    unitPrice: 5000,
    total: 5000,
    supplier: '会议中心',
    status: '已确认'
  },
  {
    category: '餐饮',
    item: '午餐',
    quantity: 50,
    unitPrice: 80,
    total: 4000,
    supplier: '餐饮公司',
    status: '待确认'
  }
])

// 人员数据（模拟）
const participants = ref([
  { name: '张三', department: '人事部', role: '组织者', contact: '13800138000' },
  { name: '李四', department: '行政部', role: '协助者', contact: '13900139000' }
])

// 供应商数据（模拟）
const suppliers = ref([
  { name: '会议中心', contact: '王经理', phone: '010-12345678', service: '场地租赁' },
  { name: '餐饮公司', contact: '李总', phone: '010-87654321', service: '餐饮服务' }
])

// 风险数据
const identifiedRisks = ref([])

// 计算属性
const totalTasks = computed(() => currentActivity.value?.tasks?.length || 0)
const completedTasks = computed(() => 
  currentActivity.value?.tasks?.filter(task => task.status === '已完成').length || 0
)
const allocatedBudget = computed(() => 
  budgetItems.value.reduce((sum, item) => sum + item.total, 0)
)
const remainingBudget = computed(() => 
  (currentActivity.value?.budget || 0) - allocatedBudget.value
)

// 初始化
const fetchActivity = async (activityId: string) => {
  const res = await activityApi.ApiGetById(activityId)
  if (res.code === 200 && res.data) {
    store.setCurrentActivity(res.data as Activity)
    activityForm.value.description = res.data.description || ''
  }
}

onMounted(() => {
  const activityId = String(route.params.id || '')
  if (activityId) {
    fetchActivity(activityId)
  }
})

// 返回上一页
const goBack = () => {
  router.push('/activities')
}

// 格式化函数
const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatDateTime = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const formatBudget = (budget) => {
  if (!budget) return '¥0'
  return `¥${budget.toLocaleString()}`
}

// 获取标签样式
const getTypeTagType = (type) => {
  const types = {
    '团建': 'success',
    '庆典': 'warning',
    '会议': 'info',
    '培训': 'primary'
  }
  return types[type] || 'info'
}

const getStatusTagType = (status) => {
  const types = {
    '待开始': 'info',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const getTaskStatusType = (status) => {
  const types = {
    '未开始': 'info',
    '进行中': 'warning',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const getBudgetStatusType = (status) => {
  const types = {
    '已确认': 'success',
    '待确认': 'warning',
    '已取消': 'danger'
  }
  return types[status] || 'info'
}

const getRiskLevelType = (level) => {
  const types = {
    '高': 'danger',
    '中': 'warning',
    '低': 'info'
  }
  return types[level] || 'info'
}

// 进度相关
const getProgress = () => {
  if (totalTasks.value === 0) return 0
  return Math.round((completedTasks.value / totalTasks.value) * 100)
}

const getProgressColor = () => {
  const progress = getProgress()
  if (progress >= 80) return '#67c23a'
  if (progress >= 50) return '#e6a23c'
  return '#f56c6c'
}

// AI功能
const generateAIPlan = async () => {
  if (!aiPrompt.value.trim()) {
    ElMessage.warning('请输入活动想法')
    return
  }
  
  isGenerating.value = true
  
  // 模拟AI生成
  setTimeout(() => {
    generatedPlan.value = {
      overview: `基于您的需求，AI为您生成了一份${currentActivity.value?.type}活动策划方案。该方案包含详细的活动流程、时间安排和注意事项，适合${currentActivity.value?.participants}人参与，预算控制在${formatBudget(currentActivity.value?.budget)}以内。`,
      schedule: `详细时间安排：\n09:00-09:30 签到集合\n09:30-10:00 开场破冰\n10:00-12:00 团队协作游戏\n12:00-13:30 午餐休息\n13:30-15:30 主要活动环节\n15:30-16:00 总结分享\n16:00 活动结束`,
      materials: `所需物料清单：\n1. 活动道具：团队协作游戏用品\n2. 音响设备：音响、麦克风\n3. 餐饮用品：午餐、饮料、水果\n4. 奖品礼品：团队奖品、纪念品\n5. 其他用品：签到表、姓名贴、急救包`
    }
    isGenerating.value = false
    ElMessage.success('策划方案生成成功！')
  }, 2000)
}

const regeneratePlan = () => {
  generatedPlan.value = null
  generateAIPlan()
}

const clearAIInput = () => {
  aiPrompt.value = ''
  generatedPlan.value = null
}

const applyAIPlan = () => {
  if (generatedPlan.value) {
    activityForm.value.description = generatedPlan.value.overview
    ElMessage.success('策划方案已应用到活动描述中')
  }
}

// 任务管理
const addTask = () => {
  if (!taskForm.value.name || !taskForm.value.responsible) {
    ElMessage.warning('请填写完整信息')
    return
  }
  
  const newTask = {
    id: Date.now(),
    name: taskForm.value.name,
    responsible: taskForm.value.responsible,
    deadline: taskForm.value.deadline,
    status: '未开始'
  }
  
  store.addTask(currentActivity.value.id, newTask)
  showAddTaskDialog.value = false
  
  // 重置表单
  taskForm.value = {
    name: '',
    responsible: '',
    deadline: ''
  }
  
  ElMessage.success('任务添加成功')
}

const updateTaskStatus = (index, status) => {
  if (currentActivity.value?.tasks) {
    currentActivity.value.tasks[index].status = status
    ElMessage.success('任务状态已更新')
  }
}

const deleteTask = (index) => {
  if (currentActivity.value?.tasks) {
    currentActivity.value.tasks.splice(index, 1)
    ElMessage.success('任务已删除')
  }
}

// 预算分析
const analyzeBudget = async () => {
  isAnalyzing.value = true
  
  setTimeout(() => {
    budgetAnalysis.value = `AI预算分析结果：\n\n1. 预算分配合理，各项支出比例符合行业标准\n2. 场地费用占比${Math.round((budgetItems.value[0]?.total / allocatedBudget.value) * 100)}%，处于合理范围\n3. 建议预留10%的应急资金\n4. 可以通过批量采购进一步节省成本\n5. 建议与供应商协商获得更好的价格`
    
    isAnalyzing.value = false
    ElMessage.success('预算分析完成')
  }, 1500)
}

// 风险识别
const identifyRisks = async () => {
  isIdentifyingRisks.value = true
  
  setTimeout(() => {
    identifiedRisks.value = [
      {
        id: 1,
        type: '天气风险',
        description: '户外活动可能受天气影响，特别是雨雪天气',
        level: '中',
        isGenerating: false,
        emergencyPlan: ''
      },
      {
        id: 2,
        type: '安全风险',
        description: '大型聚会存在安全风险，需要做好应急预案',
        level: '高',
        isGenerating: false,
        emergencyPlan: ''
      },
      {
        id: 3,
        type: '供应商风险',
        description: '供应商可能临时变更或无法按时提供服务',
        level: '中',
        isGenerating: false,
        emergencyPlan: ''
      }
    ]
    
    isIdentifyingRisks.value = false
    ElMessage.success('风险识别完成')
  }, 2000)
}

// 生成应急预案
const generateEmergencyPlan = async (risk) => {
  risk.isGenerating = true
  
  setTimeout(() => {
    const plans = {
      '天气风险': '应急预案：\n1. 提前关注天气预报，准备室内备用场地\n2. 准备雨具和保暖用品\n3. 制定活动时间调整方案\n4. 及时通知所有参与者',
      '安全风险': '应急预案：\n1. 配备专业安保人员\n2. 设置安全出口标识\n3. 准备急救包和联系医院\n4. 制定紧急疏散方案\n5. 购买活动保险',
      '供应商风险': '应急预案：\n1. 准备备用供应商名单\n2. 提前签订合同并确认\n3. 建立供应商评价体系\n4. 保持与多个供应商的联系'
    }
    
    risk.emergencyPlan = plans[risk.type] || '正在生成应急预案...'
    risk.isGenerating = false
    ElMessage.success('应急预案生成成功')
  }, 1500)
}

const applyEmergencyPlan = (risk) => {
  ElMessage.success(`已应用${risk.type}的应急预案`)
}

// 保存活动
const handleSave = async () => {
  if (!currentActivity.value?.id) return
  const res = await activityApi.ApiSaveOrUpdate({
    id: currentActivity.value.id,
    description: activityForm.value.description
  })
  if (res.code === 200) {
    store.updateActivity(currentActivity.value.id, {
      description: activityForm.value.description
    })
    ElMessage.success('活动信息保存成功')
  }
}
</script>

<style scoped>
.activity-detail {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.basic-info-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.main-content-card {
  border-radius: 8px;
}

.activity-tabs {
  min-height: 600px;
}

.section {
  margin-bottom: 30px;
}

.section h4 {
  margin-bottom: 15px;
  color: #303133;
  font-size: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.ai-planning-panel {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.ai-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.ai-result-panel {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 8px;
  padding: 20px;
}

.result-content {
  margin-bottom: 20px;
}

.plan-content {
  background: white;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.6;
  white-space: pre-line;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.progress-panel {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-text {
  margin-top: 10px;
  color: #606266;
  font-size: 14px;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.action-btn {
  width: 100%;
  justify-content: flex-start;
}

.budget-summary {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.budget-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.budget-item:last-child {
  margin-bottom: 0;
  font-weight: bold;
}

.amount {
  color: #67c23a;
  font-weight: 500;
}

.amount.remaining {
  color: #f56c6c;
}

.ai-analysis-section {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.analysis-result {
  margin-top: 20px;
  padding: 15px;
  background: white;
  border-radius: 4px;
}

.analysis-content {
  line-height: 1.6;
  white-space: pre-line;
  color: #606266;
}

.risks-list {
  margin-top: 20px;
}

.risk-item {
  background: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 15px;
}

.risk-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.risk-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.risk-type {
  font-weight: 500;
  color: #303133;
}

.risk-description {
  color: #606266;
  margin-bottom: 15px;
  line-height: 1.5;
}

.emergency-plan {
  background: #f0f9ff;
  border: 1px solid #b3d8ff;
  border-radius: 4px;
  padding: 15px;
  margin-top: 15px;
}

.emergency-plan h5 {
  margin-bottom: 10px;
  color: #409eff;
}

.plan-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.no-risks {
  text-align: center;
  padding: 40px 0;
  color: #909399;
}
</style>
