<template>
  <div class="activity-list">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h2>活动项目管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateActivity">
          <el-icon><Plus /></el-icon>
          创建活动
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索活动名称、关键词"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="待开始" value="待开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterType" placeholder="类型筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="团建" value="团建" />
            <el-option label="庆典" value="庆典" />
            <el-option label="会议" value="会议" />
            <el-option label="培训" value="培训" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="filterDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            @change="handleFilter"
          />
        </el-col>
        <el-col :span="4">
          <el-button @click="handleResetFilter">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 活动列表表格 -->
    <el-card class="table-card">
      <el-table
        :data="filteredActivities"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="活动名称" min-width="200">
          <template #default="{ row }">
            <div class="activity-name">
              <el-link type="primary" @click="handleViewDetail(row)">
                {{ row.name }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="120" />
        <el-table-column prop="responsible" label="负责人" width="100" />
        <el-table-column prop="budget" label="预算" width="120">
          <template #default="{ row }">
            <span class="budget">{{ formatBudget(row.budget) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleCopy(row)">
                复制
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalActivities"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 创建/编辑活动对话框 -->
    <el-dialog
      v-model="showCreateDialog"
      :title="isEdit ? '编辑活动' : '创建新活动'"
      width="600px"
    >
      <el-form :model="createForm" label-width="100px">
        <el-form-item label="活动名称">
          <el-input v-model="createForm.name" placeholder="请输入活动名称" />
        </el-form-item>
        <el-form-item label="活动类型">
          <el-select v-model="createForm.type" placeholder="请选择活动类型" style="width: 100%">
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
            style="width: 100%"
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
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="参与人数">
          <el-input-number
            v-model="createForm.participants"
            :min="0"
            placeholder="请输入参与人数"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="AI 需求" v-if="!isEdit">
          <el-input
            v-model="aiPrompt"
            type="textarea"
            :rows="2"
            placeholder="请输入活动想法或目标，AI 会补全活动信息"
          />
          <div class="ai-actions">
            <el-button type="primary" :loading="isGenerating" @click="handleAiGenerate">AI 生成</el-button>
          </div>
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
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive } from 'vue'
import { useActivityStore } from '@/store/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'
import { activityApi, aiApi } from '@/api'
import type { Activity } from '@/types/activity'

const store = useActivityStore()
const router = useRouter()

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const filterDate = ref<[Date, Date] | ''>('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)
const totalActivities = ref(0)

// 对话框相关
const showCreateDialog = ref(false)
const isEdit = ref(false)
const isGenerating = ref(false)
const aiPrompt = ref('')
const createForm = reactive({
  id: '',
  name: '',
  type: '',
  date: '' as any,
  location: '',
  budget: 0,
  participants: 0,
  description: ''
})

// 计算属性
const filteredActivities = computed(() => {
  let result = store.activities

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      (item.name || '').toLowerCase().includes(keyword) ||
      (item.description || '').toLowerCase().includes(keyword) ||
      (item.location || '').toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }

  // 日期筛选
  if (Array.isArray(filterDate.value) && filterDate.value.length === 2) {
    const startDate = new Date(filterDate.value[0])
    const endDate = new Date(filterDate.value[1])
    result = result.filter(item => {
      const itemDate = new Date(item.date || '')
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})

const formatDateValue = (value: string | Date) => {
  const date = typeof value === 'string' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getQueryParams = () => {
  const params: Activity & { pageNum?: number; pageSize?: number } = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    name: searchKeyword.value || undefined,
    status: filterStatus.value || undefined,
    type: filterType.value || undefined
  }
  if (Array.isArray(filterDate.value) && filterDate.value.length === 2) {
    params.dateStart = formatDateValue(filterDate.value[0])
    params.dateEnd = formatDateValue(filterDate.value[1])
  }
  return params
}

const fetchActivities = async () => {
  loading.value = true
  try {
    const res = await activityApi.ApiPageList(getQueryParams())
    if (res.code === 200 && res.data) {
      const list = res.data.list || res.data.records || []
      store.setActivities(list)
      totalActivities.value = res.data.total || list.length
    }
  } finally {
    loading.value = false
  }
}

// 获取类型标签样式
const getTypeTagType = (type: string) => {
  const types = {
    '团建': 'success',
    '庆典': 'warning',
    '会议': 'info',
    '培训': 'primary'
  }
  return types[type] || 'info'
}

// 获取状态标签样式
const getStatusTagType = (status: string) => {
  const types = {
    '待开始': 'info',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

// 格式化日期
const formatDate = (date: string | Date | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化预算
const formatBudget = (budget: number | undefined) => {
  if (!budget) return '¥0'
  return `¥${(budget / 10000).toFixed(1)}万`
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
  fetchActivities()
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
  fetchActivities()
}

// 重置筛选
const handleResetFilter = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterType.value = ''
  filterDate.value = ''
  currentPage.value = 1
  fetchActivities()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  fetchActivities()
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  fetchActivities()
}

// 操作处理
const handleViewDetail = (row: Activity) => {
  if (row?.id) {
    store.setCurrentActivity(row)
    router.push(`/activity/${row.id}`)
  }
}

const handleEdit = (row: Activity) => {
  isEdit.value = true
  createForm.id = row.id || ''
  createForm.name = row.name || ''
  createForm.type = row.type || ''
  createForm.date = row.date ? new Date(row.date) : ''
  createForm.location = row.location || ''
  createForm.budget = row.budget || 0
  createForm.participants = row.participants || 0
  createForm.description = row.description || ''
  showCreateDialog.value = true
}

const handleAiGenerate = async () => {
  isGenerating.value = true
  try {
    const res = await aiApi.generateStructuredPlan({
      prompt: aiPrompt.value,
      name: createForm.name || undefined,
      type: createForm.type || undefined,
      date: formatDateValue(createForm.date),
      location: createForm.location || undefined,
      participants: createForm.participants || undefined,
      budget: createForm.budget || undefined,
      description: createForm.description || undefined
    })
    if (res.code === 200 && res.data) {
      const plan = res.data
      if (plan.name) createForm.name = plan.name
      if (plan.type) createForm.type = plan.type
      if (plan.date) createForm.date = new Date(plan.date)
      if (plan.location) createForm.location = plan.location
      if (plan.participants !== undefined) createForm.participants = plan.participants
      if (plan.budget !== undefined) createForm.budget = plan.budget
      if (plan.description) createForm.description = plan.description
      if (!plan.description && plan.rawText) createForm.description = plan.rawText
      ElMessage.success('AI 已生成活动信息')
    }
  } finally {
    isGenerating.value = false
  }
}

const handleSubmit = async () => {
  if (!createForm.name || !createForm.type) {
    ElMessage.warning('请填写必要信息')
    return
  }

  const payload = {
    ...createForm,
    date: formatDateValue(createForm.date),
    status: isEdit.value ? undefined : '待开始'
  }
  const res = await activityApi.ApiSaveOrUpdate(payload)
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '编辑成功' : '创建成功')
    showCreateDialog.value = false
    fetchActivities()
  }
}

const handleCopy = async (row: Activity) => {
  const { id, ...rest } = row
  const payload = {
    ...rest,
    name: `${row.name} (复制)`
  }
  const res = await activityApi.ApiSaveOrUpdate(payload)
  if (res.code === 200) {
    ElMessage.success('复制成功')
    fetchActivities()
  }
}

const handleDelete = async (row: Activity) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (row.id) {
      const res = await activityApi.ApiDelete(row.id)
      if (res.code === 200) {
        store.deleteActivity(row.id)
        fetchActivities()
        ElMessage.success('删除成功')
      }
    }
  } catch {
  }
}

const handleCreateActivity = () => {
  isEdit.value = false
  aiPrompt.value = ''
  Object.assign(createForm, {
    id: '',
    name: '',
    type: '',
    date: '',
    location: '',
    budget: 0,
    participants: 0,
    description: ''
  })
  showCreateDialog.value = true
}

onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.activity-list {
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

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.activity-name {
  font-weight: 500;
}

.budget {
  color: #67c23a;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>
