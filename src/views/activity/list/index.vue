<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <aimi-search-form :form-items="searchFormConfig" :basic-fields="['name', 'type', 'status']" show-advanced-toggle
      @search="handleSearch" @reset="handleReset">
      <template #toolbar>
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增</el-button>
      </template>
    </aimi-search-form>

    <!-- 表格区 -->
    <aimi-table ref="tableRef" v-bind="tableConfig" :loading="loading" :data="tableData" :total="total"
      :current-page="currentPage" :page-size="pageSize" :height="tableHeight" style="margin-top: 16px;"
      :row-key="tableConfig.rowKey || 'id'" @page-change="handlePageChange" @size-change="handleSizeChange"
      @operation-click="handleOperationClick">
      <!-- 类型插槽 -->
      <template #type="{ row }">
        <el-tag :type="getTypeTagType((row as Activity).type)" size="small">
          {{ (row as Activity).type }}
        </el-tag>
      </template>

      <!-- 状态插槽 -->
      <template #status="{ row }">
        <el-tag :type="getStatusTagType((row as Activity).status)" size="small">
          {{ (row as Activity).status }}
        </el-tag>
      </template>

      <!-- 预算插槽 -->
      <template #budget="{ row }">
        <span class="budget">{{ formatBudget((row as Activity).budget) }}</span>
      </template>

      <!-- 日期插槽 -->
      <template #date="{ row }">
        <span>{{ formatDate((row as Activity).date) }}</span>
      </template>

    </aimi-table>

    <!-- 新增/编辑弹窗 -->
    <aimi-dialog v-model="dialogVisible" :title="isEdit ? '编辑活动' : '新增活动'" width="600px" @confirm="handleConfirm">
      <template #body>
        <aimi-form ref="formRef" :form-items="formConfig" :model-value="formData"
          @update:model-value="value => Object.assign(formData, value)" @change="handleFormChange">
          <template #responsibleSelect>
            <el-select v-model="formData.responsible" placeholder="请选择负责人" filterable style="width: 100%">
              <el-option v-for="user in userList" :key="user.id" :label="user.realName || user.userName"
                :value="user.id">
                <span style="float: left">{{ user.realName || user.userName }}</span>
                <span style="float: right; color: #8492a6; font-size: 13px">{{ user.userName }}</span>
              </el-option>
            </el-select>
          </template>
        </aimi-form>
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { tableConfig, formConfig } from './config'
import type { Activity } from '@/types/activity'
import { activityApi, organizationApi } from '@/api'
import { useTable } from '@/hooks/useTable'
import { AimiSearchForm, AimiTable, AimiDialog, AimiForm } from '@/components/Aimi'
import type { User } from '@/views/admin/user-manage/config'
import { useRoute, useRouter } from 'vue-router'

// 表格逻辑
const tableRef = ref()
const route = useRoute()
const router = useRouter()
const {
  loading,
  tableData,
  total,
  currentPage,
  pageSize,
  getTableData,
  handleSearch,
  handleReset,
  refresh
} = useTable(activityApi.ApiPageList)

const handlePageChange = (page: number) => {
  currentPage.value = page
  getTableData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getTableData()
}

const tableHeight = ref<number>(400)
const updateTableHeight = () => {
  nextTick(() => {
    const tableElement = (tableRef.value as any)?.$el as HTMLElement | undefined
    if (!tableElement) return
    const rect = tableElement.getBoundingClientRect()
    const height = window.innerHeight - rect.top - 24
    tableHeight.value = Math.max(height, 260)
  })
}

// 搜索表单配置
const searchFormConfig = [
  {
    field: 'name',
    type: 'input',
    label: '活动名称',
    placeholder: '请输入活动名称'
  },
  {
    field: 'type',
    type: 'select',
    label: '活动类型',
    placeholder: '请选择活动类型',
    options: [
      { label: '全部', value: '' },
      { label: '团建', value: '团建' },
      { label: '庆典', value: '庆典' },
      { label: '会议', value: '会议' },
      { label: '培训', value: '培训' }
    ]
  },
  {
    field: 'status',
    type: 'select',
    label: '状态',
    placeholder: '请选择状态',
    options: [
      { label: '全部', value: '' },
      { label: '待开始', value: '待开始' },
      { label: '进行中', value: '进行中' },
      { label: '已完成', value: '已完成' }
    ]
  },
  {
    field: 'date',
    type: 'datepicker',
    label: '活动日期',
    placeholder: '选择日期范围',
    dateType: 'daterange',
    valueFormat: 'YYYY-MM-DD',
    rangeSeparator: '至',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    isRange: true
  }
]

// 弹窗逻辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive<Activity>({
  id: undefined,
  name: '',
  type: '',
  date: '',
  timeRange: '',
  location: '',
  responsible: '',
  participants: 0,
  budget: 0,
  status: '待开始',
  description: ''
})

// 组织成员列表
const userList = ref<User[]>([])
const loadUserList = async () => {
  try {
    const res = await organizationApi.getCurrentUserOrgMembers()
    if (res.code === 200 && res.data) {
      userList.value = res.data
      console.log('组织用户列表:', userList.value)
    }
  } catch (error) {
    console.error('获取组织用户列表失败:', error)
  }
}

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    name: '',
    type: '',
    date: '',
    timeRange: '',
    location: '',
    responsible: '',
    participants: 0,
    budget: 0,
    status: '待开始',
    description: ''
  })
  loadUserList()
  dialogVisible.value = true
}

const handleEdit = (row: Activity) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  loadUserList()
  dialogVisible.value = true
}

const handleConfirm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    const res = await activityApi.ApiSaveOrUpdate(formData)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      refresh()
    }
  } catch (error) {
    console.error(error)
  }
}

const handleFormChange = (field: string, value: any) => {
  console.log(`字段 ${field} 变更:`, value)
}

// 统一操作处理
const handleOperationClick = (command: string, row: Activity) => {
  switch (command) {
    case 'detail':
      handleDetail(row)
      break
    case 'edit':
      handleEdit(row)
      break
    case 'copy':
      handleCopy(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleDetail = (row: Activity) => {
  console.log('查看详情', row)
  // 跳转到详情页
  if (row.id) {
    router.push(`/activity/${row.id}`)
  }
}

const handleCopy = async (row: Activity) => {
  const { id, ...rest } = row
  const payload = {
    ...rest,
    name: `${row.name} (复制)`
  }
  try {
    const res = await activityApi.ApiSaveOrUpdate(payload)
    if (res.code === 200) {
      ElMessage.success('复制成功')
      refresh()
    }
  } catch (error) {
    console.error(error)
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
        ElMessage.success('删除成功')
        refresh()
      }
    }
  } catch {
  }
}

// 工具函数
const getTypeTagType = (type: string) => {
  const types = {
    '团建': 'success',
    '庆典': 'warning',
    '会议': 'info',
    '培训': 'primary'
  }
  return types[type] || 'info'
}

const getStatusTagType = (status: string) => {
  const types = {
    '待开始': 'info',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

const formatDate = (date: string | undefined) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('zh-CN')
}

const formatBudget = (budget: number | undefined) => {
  if (!budget) return '¥0'
  return `¥${(budget / 10000).toFixed(1)}万`
}

onMounted(() => {
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)

  // 检查路由参数，是否需要打开新增对话框
  const action = route.query.action
  if (action === 'create') {
    handleAdd()
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', updateTableHeight)
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.budget {
  color: #67c23a;
  font-weight: 500;
}
</style>
