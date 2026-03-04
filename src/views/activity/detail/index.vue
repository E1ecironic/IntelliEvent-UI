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
        <el-descriptions-item label="负责人">{{ currentActivity?.responsibleName || currentActivity?.responsible
        }}</el-descriptions-item>
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
                <!-- 活动描述 -->
                <div class="section">
                  <h4>活动描述</h4>
                  <el-input v-model="activityForm.description" type="textarea" :rows="4" placeholder="请输入活动描述" />
                </div>

                <!-- 活动日程安排 -->
                <div class="section">
                  <div class="section-header">
                    <h4>活动日程安排</h4>
                    <el-button type="primary" @click="openAddScheduleDialog">
                      <el-icon>
                        <Plus />
                      </el-icon>
                      添加环节
                    </el-button>
                  </div>
                  <div class="schedule-container" v-if="groupedSchedules.length > 0">
                    <div v-for="group in groupedSchedules" :key="group.date" class="schedule-day-group">
                      <div class="day-header">
                        <h5>{{ group.date }}</h5>
                        <el-tag type="info" size="small">{{ group.items.length }}个环节</el-tag>
                      </div>
                      <div class="schedule-list">
                        <div v-for="item in group.items" :key="item.id" class="schedule-item">
                          <div class="schedule-time">
                            <span class="time-range">{{ item.startTime }} - {{ item.endTime || '结束' }}</span>
                          </div>
                          <div class="schedule-content">
                            <div class="schedule-title">{{ item.title }}</div>
                            <div class="schedule-meta" v-if="item.location || item.responsibleName">
                              <span v-if="item.location" class="meta-item">
                                <el-icon>
                                  <Location />
                                </el-icon>
                                {{ item.location }}
                              </span>
                              <span v-if="item.responsibleName" class="meta-item">
                                <el-icon>
                                  <User />
                                </el-icon>
                                {{ item.responsibleName }}
                              </span>
                            </div>
                            <div class="schedule-desc" v-if="item.description">{{ item.description }}</div>
                          </div>
                          <div class="schedule-actions">
                            <el-button type="primary" @click="editSchedule(item)">编辑</el-button>
                            <el-button type="danger" @click="deleteSchedule(item.id)">删除</el-button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <el-empty v-else description="暂无日程安排，点击上方按钮添加" />
                </div>
              </el-col>

              <el-col :span="8">
                <!-- AI智能策划 -->
                <div class="section">
                  <h4>AI智能策划</h4>
                  <div class="ai-planning-panel">
                    <el-input v-model="aiPrompt" type="textarea" :rows="3"
                      placeholder="输入您的活动想法，例如：为50名新员工组织一场半天的团队融合活动，预算5万，地点在上海" />
                    <div class="ai-actions">
                      <el-button type="primary" @click="generateAIPlan" :loading="isGenerating">
                        <el-icon>
                          <Star />
                        </el-icon>
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
                        <el-icon>
                          <Check />
                        </el-icon>
                        应用此方案
                      </el-button>
                      <el-button @click="regeneratePlan">
                        <el-icon>
                          <Refresh />
                        </el-icon>
                        重新生成
                      </el-button>
                    </div>
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
                <el-icon>
                  <Plus />
                </el-icon>
                添加任务
              </el-button>
            </div>

            <el-table :data="taskList" style="width: 100%">
              <el-table-column prop="name" label="任务名称" min-width="200" />
              <el-table-column prop="responsibleName" label="负责人" width="120" />
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
                    <el-button type="primary" @click="openAddBudgetDialog">
                      <el-icon>
                        <Plus />
                      </el-icon>
                      添加预算项
                    </el-button>
                  </div>

                  <el-table :data="budgetItems" style="width: 100%" class="budget-table">
                    <el-table-column prop="category" label="类别" width="90" show-overflow-tooltip />
                    <el-table-column prop="item" label="项目" min-width="140" show-overflow-tooltip />
                    <el-table-column prop="quantity" label="数量" width="80" align="center" />
                    <el-table-column prop="unitPrice" label="单价" min-width="100" align="right">
                      <template #default="{ row }">
                        ¥{{ row.unitPrice }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="total" label="小计" min-width="110" align="right">
                      <template #default="{ row }">
                        <strong>¥{{ row.total }}</strong>
                      </template>
                    </el-table-column>
                    <el-table-column prop="supplierName" label="供应商" min-width="110" show-overflow-tooltip />
                    <el-table-column prop="status" label="状态" min-width="100" align="center">
                      <template #default="{ row }">
                        <el-tag :type="getBudgetStatusType(row.status)" size="small">{{ row.status }}</el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" min-width="140" align="center" fixed="right">
                      <template #default="{ row }">
                        <el-button type="primary" link @click="editBudget(row)">编辑</el-button>
                        <el-button type="danger" link @click="deleteBudget(row.id)">删除</el-button>
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
                      <span class="amount">{{ formatBudget(currentActivity?.budget) }}</span>
                    </div>
                    <div class="budget-item">
                      <span>已分配:</span>
                      <span class="amount">{{ formatBudget(allocatedBudget) }}</span>
                    </div>
                    <div class="budget-item">
                      <span>已确认:</span>
                      <span class="amount confirmed">{{ formatBudget(confirmedBudget) }}</span>
                    </div>
                    <div class="budget-item">
                      <span>剩余:</span>
                      <span class="amount"
                        :class="{ 'remaining': remainingBudget >= 0, 'over-budget': remainingBudget < 0 }">
                        {{ formatBudget(Math.abs(remainingBudget)) }}{{ remainingBudget < 0 ? ' (超支)' : '' }} </span>
                    </div>
                    <div class="budget-progress">
                      <span>预算使用率:</span>
                      <el-progress :percentage="budgetUsageRate" :color="getBudgetProgressColor()" :stroke-width="12" />
                    </div>
                  </div>

                  <div class="ai-analysis-section">
                    <el-button type="primary" @click="analyzeBudget" :loading="isAnalyzing">
                      <el-icon>
                        <Star />
                      </el-icon>
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
                    <el-table-column prop="serviceType" label="服务类型" width="100" />
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
                  <el-icon>
                    <Warning />
                  </el-icon>
                  AI风险识别
                </el-button>
              </div>

              <div v-if="identifiedRisks.length > 0" class="risks-list">
                <div v-for="risk in identifiedRisks" :key="risk.id" class="risk-item">
                  <div class="risk-header">
                    <div class="risk-info">
                      <span class="risk-type">{{ risk.type }}</span>
                      <el-tag :type="getRiskLevelType(risk.level)" size="small">
                        {{ risk.level }}风险
                      </el-tag>
                    </div>
                    <el-button type="primary" size="small" @click="generateEmergencyPlan(risk)"
                      :loading="risk.isGenerating">
                      <el-icon>
                        <Document />
                      </el-icon>
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

    <!-- 日程编辑对话框 -->
    <el-dialog v-model="showScheduleDialog" :title="isEditingSchedule ? '编辑日程' : '添加日程'" width="500px">
      <el-form :model="scheduleForm" label-width="80px">
        <el-form-item label="日期" required>
          <el-date-picker v-model="scheduleForm.scheduleDate" type="date" placeholder="选择日期" format="YYYY-MM-DD"
            value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始时间" required>
          <el-time-picker v-model="scheduleForm.startTime" format="HH:mm" value-format="HH:mm" placeholder="选择开始时间"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-time-picker v-model="scheduleForm.endTime" format="HH:mm" value-format="HH:mm" placeholder="选择结束时间（可选）"
            style="width: 100%" />
        </el-form-item>
        <el-form-item label="环节名称" required>
          <el-input v-model="scheduleForm.title" placeholder="例如：签到集合" />
        </el-form-item>
        <el-form-item label="地点">
          <el-input v-model="scheduleForm.location" placeholder="例如：一楼大厅" />
        </el-form-item>
        <el-form-item label="负责人">
          <el-input v-model="scheduleForm.responsible" placeholder="负责人ID" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="scheduleForm.description" type="textarea" :rows="3" placeholder="环节描述或备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showScheduleDialog = false">取消</el-button>
          <el-button type="primary" @click="saveSchedule">
            {{ isEditingSchedule ? '保存' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 预算编辑对话框 -->
    <el-dialog v-model="showAddBudgetDialog" :title="isEditingBudget ? '编辑预算项' : '添加预算项'" width="550px">
      <el-form :model="budgetForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="类别" required>
              <el-select v-model="budgetForm.category" placeholder="选择类别" style="width: 100%">
                <el-option v-for="opt in budgetCategoryOptions" :key="opt.value" :label="opt.label"
                  :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="budgetForm.status" placeholder="选择状态" style="width: 100%">
                <el-option v-for="opt in budgetStatusOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="项目名称" required>
          <el-input v-model="budgetForm.item" placeholder="例如：会议室租赁" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="10">
            <el-form-item label="数量">
              <el-input-number v-model="budgetForm.quantity" :min="1" :max="9999" :controls="true" style="width: 100%"
                @change="calculateBudgetTotal" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单价" required>
              <el-input-number v-model="budgetForm.unitPrice" :min="0" :precision="2" :controls="true"
                style="width: 100%" @change="calculateBudgetTotal" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="小计">
              <span class="budget-total">¥{{ budgetForm.total || 0 }}</span>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="供应商">
          <el-input v-model="budgetForm.supplierName" placeholder="供应商名称（可选）" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="budgetForm.remark" type="textarea" :rows="2" placeholder="备注信息（可选）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddBudgetDialog = false">取消</el-button>
          <el-button type="primary" @click="saveBudget">
            {{ isEditingBudget ? '保存' : '添加' }}
          </el-button>
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
import { activityApi, activityScheduleApi, activityBudgetApi } from '@/api'
import type { Activity } from '@/types/activity'
import type { ActivityDetailData } from '@/api/modules/activity'
import {
  Check,
  Refresh,
  List,
  Money,
  Warning,
  Plus,
  Document,
  Star,
  Location,
  User,
  ArrowLeft
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
const showScheduleDialog = ref(false)
const isEditingBudget = ref(false)

// 预算表单
const budgetForm = ref({
  id: '',
  activityId: '',
  category: '',
  item: '',
  quantity: 1,
  unitPrice: 0,
  total: 0,
  supplierId: '',
  supplierName: '',
  status: '待确认',
  remark: ''
})

// 预算类别选项
const budgetCategoryOptions = [
  { label: '场地', value: '场地' },
  { label: '餐饮', value: '餐饮' },
  { label: '物料', value: '物料' },
  { label: '交通', value: '交通' },
  { label: '住宿', value: '住宿' },
  { label: '娱乐', value: '娱乐' },
  { label: '礼品', value: '礼品' },
  { label: '其他', value: '其他' }
]

// 预算状态选项
const budgetStatusOptions = [
  { label: '待确认', value: '待确认' },
  { label: '已确认', value: '已确认' },
  { label: '已取消', value: '已取消' }
]
const isEditingSchedule = ref(false)

// 任务表单
const taskForm = ref({
  name: '',
  responsible: '',
  deadline: ''
})

// 日程表单
const scheduleForm = ref({
  id: '',
  activityId: '',
  scheduleDate: '',
  startTime: '',
  endTime: '',
  title: '',
  description: '',
  location: '',
  responsible: '',
  sortOrder: 0
})

// 日程数据
const scheduleList = ref<ActivityDetailData['schedules']>([])

// 任务数据
const taskList = ref<ActivityDetailData['tasks']>([])

// 预算数据
const budgetItems = ref<ActivityDetailData['budgets']>([])

// 人员数据
const participants = ref<ActivityDetailData['participants']>([])

// 供应商数据
const suppliers = ref<ActivityDetailData['suppliers']>([])

// 风险数据
const identifiedRisks = ref<ActivityDetailData['risks']>([])

// 计算属性
const totalTasks = computed(() => taskList.value.length)
const completedTasks = computed(() =>
  taskList.value.filter(task => task.status === '已完成').length
)
const allocatedBudget = computed(() =>
  budgetItems.value.reduce((sum, item) => sum + (item.total || 0), 0)
)
const confirmedBudget = computed(() =>
  budgetItems.value
    .filter(item => item.status === '已确认')
    .reduce((sum, item) => sum + (item.total || 0), 0)
)
const remainingBudget = computed(() =>
  (currentActivity.value?.budget || 0) - allocatedBudget.value
)
const budgetUsageRate = computed(() => {
  const total = currentActivity.value?.budget || 0
  if (total === 0) return 0
  const rate = (allocatedBudget.value / total) * 100
  return Math.min(Math.round(rate), 100)
})
const getBudgetProgressColor = () => {
  if (budgetUsageRate.value >= 100) return '#f56c6c'
  if (budgetUsageRate.value >= 80) return '#e6a23c'
  return '#67c23a'
}

// 按日期分组的日程
const groupedSchedules = computed(() => {
  if (!scheduleList.value || scheduleList.value.length === 0) return []

  const groups = new Map()
  scheduleList.value.forEach(item => {
    const date = item.scheduleDate || '未指定日期'
    if (!groups.has(date)) {
      groups.set(date, [])
    }
    groups.get(date).push(item)
  })

  return Array.from(groups.entries()).map(([date, items]) => ({
    date,
    items
  }))
})

// 加载活动详情（聚合接口，一次性返回所有数据）
const loadAllData = async (activityId: string) => {
  const res = await activityApi.ApiGetDetail(activityId)
  if (res.code === 200 && res.data) {
    const detail = res.data
    // 设置活动基本信息
    store.setCurrentActivity(detail.activity as Activity)
    activityForm.value.description = detail.activity.description || ''
    // 设置各个页签数据
    scheduleList.value = detail.schedules || []
    taskList.value = detail.tasks || []
    budgetItems.value = detail.budgets || []
    participants.value = detail.participants || []
    suppliers.value = detail.suppliers || []
    identifiedRisks.value = detail.risks || []
  }
}

onMounted(() => {
  const activityId = String(route.params.id || '')
  if (activityId) {
    loadAllData(activityId)
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

// 日程管理
const resetScheduleForm = () => {
  scheduleForm.value = {
    id: '',
    activityId: currentActivity.value?.id || '',
    scheduleDate: currentActivity.value?.date || '',
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    location: '',
    responsible: '',
    sortOrder: 0
  }
}

const openAddScheduleDialog = () => {
  isEditingSchedule.value = false
  resetScheduleForm()

  // 智能填充开始时间：如果有上一个环节，使用其结束时间；否则默认09:00
  const lastSchedule = getLastScheduleOfSelectedDate()
  if (lastSchedule && lastSchedule.endTime) {
    scheduleForm.value.startTime = lastSchedule.endTime
  } else {
    scheduleForm.value.startTime = '09:00'
  }

  showScheduleDialog.value = true
}

// 获取所选日期最后一个环节
const getLastScheduleOfSelectedDate = () => {
  const selectedDate = scheduleForm.value.scheduleDate
  if (!selectedDate || !scheduleList.value || scheduleList.value.length === 0) {
    return null
  }

  // 过滤出所选日期的所有环节
  const dateSchedules = scheduleList.value.filter(
    item => item.scheduleDate === selectedDate
  )

  if (dateSchedules.length === 0) {
    return null
  }

  // 按开始时间排序，返回最后一个
  return dateSchedules.sort((a, b) => {
    return (a.startTime || '').localeCompare(b.startTime || '')
  })[dateSchedules.length - 1]
}

const editSchedule = (item: any) => {
  scheduleForm.value = { ...item }
  isEditingSchedule.value = true
  showScheduleDialog.value = true
}

const saveSchedule = async () => {
  if (!scheduleForm.value.scheduleDate || !scheduleForm.value.startTime || !scheduleForm.value.title) {
    ElMessage.warning('请填写日期、开始时间和环节名称')
    return
  }

  const activityId = currentActivity.value?.id
  if (!activityId) return

  const params = {
    ...scheduleForm.value,
    activityId
  }

  let res
  if (isEditingSchedule.value && scheduleForm.value.id) {
    res = await activityScheduleApi.ApiUpdate(params)
  } else {
    res = await activityScheduleApi.ApiSave(params)
  }

  if (res.code === 200) {
    ElMessage.success(isEditingSchedule.value ? '日程更新成功' : '日程添加成功')
    showScheduleDialog.value = false
    isEditingSchedule.value = false
    resetScheduleForm()
    // 重新加载日程数据
    const activityId = String(route.params.id || '')
    if (activityId) {
      const detailRes = await activityApi.ApiGetDetail(activityId)
      if (detailRes.code === 200 && detailRes.data) {
        scheduleList.value = detailRes.data.schedules || []
      }
    }
  }
}

const deleteSchedule = async (id: string) => {
  const res = await activityScheduleApi.ApiDelete(id)
  if (res.code === 200) {
    ElMessage.success('日程删除成功')
    scheduleList.value = scheduleList.value.filter(item => item.id !== id)
  }
}

// 预算管理
const openAddBudgetDialog = () => {
  isEditingBudget.value = false
  resetBudgetForm()
  showAddBudgetDialog.value = true
}

const resetBudgetForm = () => {
  budgetForm.value = {
    id: '',
    activityId: currentActivity.value?.id || '',
    category: '',
    item: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    supplierId: '',
    supplierName: '',
    status: '待确认',
    remark: ''
  }
}

const calculateBudgetTotal = () => {
  budgetForm.value.total = (budgetForm.value.quantity || 0) * (budgetForm.value.unitPrice || 0)
}

const editBudget = (item: any) => {
  budgetForm.value = { ...item }
  isEditingBudget.value = true
  showAddBudgetDialog.value = true
}

const saveBudget = async () => {
  if (!budgetForm.value.category || !budgetForm.value.item || !budgetForm.value.unitPrice) {
    ElMessage.warning('请填写类别、项目名称和单价')
    return
  }

  calculateBudgetTotal()

  const activityId = currentActivity.value?.id
  if (!activityId) return

  const params = {
    ...budgetForm.value,
    activityId,
    total: budgetForm.value.total
  }

  let res
  if (isEditingBudget.value && budgetForm.value.id) {
    res = await activityBudgetApi.ApiUpdate(params)
  } else {
    res = await activityBudgetApi.ApiSave(params)
  }

  if (res.code === 200) {
    ElMessage.success(isEditingBudget.value ? '预算项更新成功' : '预算项添加成功')
    showAddBudgetDialog.value = false
    isEditingBudget.value = false
    resetBudgetForm()
    // 重新加载预算数据
    const activityId = String(route.params.id || '')
    if (activityId) {
      const detailRes = await activityApi.ApiGetDetail(activityId)
      if (detailRes.code === 200 && detailRes.data) {
        budgetItems.value = detailRes.data.budgets || []
      }
    }
  }
}

const deleteBudget = async (id: string) => {
  const res = await activityBudgetApi.ApiDelete(id)
  if (res.code === 200) {
    ElMessage.success('预算项删除成功')
    budgetItems.value = budgetItems.value.filter(item => item.id !== id)
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
  margin-bottom: 12px;
  font-size: 14px;
}

.budget-item:last-child {
  margin-bottom: 0;
}

.amount {
  color: #409eff;
  font-weight: 600;
  font-size: 15px;
}

.amount.confirmed {
  color: #67c23a;
}

.amount.remaining {
  color: #67c23a;
}

.amount.over-budget {
  color: #f56c6c;
}

.budget-progress {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed #dcdfe6;
}

.budget-progress span {
  display: block;
  margin-bottom: 8px;
  font-size: 13px;
  color: #606266;
}

.budget-total {
  font-size: 18px;
  font-weight: 600;
  color: #409eff;
}

/* 预算表格样式 */
.budget-table {
  font-size: 13px;
}

.budget-table .el-table__cell {
  padding: 8px 4px;
}

.budget-table .el-button--link {
  padding: 4px 8px;
  margin: 0 2px;
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

/* 日程列表样式 */
.schedule-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.schedule-day-group {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.day-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}

.day-header h5 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
  transition: all 0.3s;
}

.schedule-item:hover {
  background: #e6f2ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.schedule-time {
  min-width: 120px;
  flex-shrink: 0;
}

.time-range {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.schedule-content {
  flex: 1;
  min-width: 0;
}

.schedule-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.schedule-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #606266;
}

.meta-item .el-icon {
  font-size: 14px;
  color: #909399;
}

.schedule-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.schedule-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}
</style>
