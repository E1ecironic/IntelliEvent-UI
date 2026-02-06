<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <aimi-search-form
      :form-items="searchFormConfig"
      :basic-fields="['userName', 'realName', 'phone']"
      show-advanced-toggle
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #orgSearch="{ searchForm, item }">
        <el-tree-select
          v-model="searchForm[item.field]"
          :data="organizationOptions"
          :props="{ label: 'fullName', value: 'id', children: 'children' }"
          :placeholder="item.placeholder || '请选择组织'"
          clearable
          filterable
          check-strictly
          style="width: 100%"
        />
      </template>
      <template #toolbar>
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增</el-button>
      </template>
    </aimi-search-form>

    <!-- 表格区 -->
    <aimi-table
      ref="tableRef"
      v-bind="tableConfig"
      :loading="loading"
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :height="tableHeight"
      style="margin-top: 16px;"
      :row-key="tableConfig.rowKey || 'id'"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @operation-click="handleOperationClick"
    >
      <!-- 用户信息插槽 -->
      <template #userInfo="{ row }">
        <div class="user-info">
          <el-avatar :size="32" :style="{ backgroundColor: getAvatarColor((row as User).userName) }">
            {{ ((row as User).realName || (row as User).userName || '').charAt(0) }}
          </el-avatar>
          <div class="user-details">
            <div class="user-name">{{ (row as User).realName || (row as User).userName }}</div>
            <div class="user-userName">@{{ (row as User).userName }}</div>
          </div>
        </div>
      </template>

      <!-- 组织架构插槽 -->
      <template #organization="{ row }">
        <el-tag type="info" size="small" v-if="getOrgName(row as User) !== '-'">
          {{ getOrgName(row as User) }}
        </el-tag>
        <span v-else>-</span>
      </template>

      <!-- 状态插槽 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType((row as User).status)" size="small">
          {{ getStatusText((row as User).status) }}
        </el-tag>
      </template>

      <!-- 最后登录插槽 -->
      <template #lastLogin="{ row }">
        <span class="login-info">{{ formatLoginTime((row as User).lastLoginAt) || '-' }}</span>
      </template>

      <!-- 操作插槽 -->
      <!-- 使用配置驱动的操作列，不再需要手动插槽 -->

    </aimi-table>

    <!-- 新增/编辑弹窗 -->
    <aimi-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
      @confirm="handleConfirm"
    >
      <template #body>
        <aimi-form
          ref="formRef"
          :form-items="formConfig"
          :model-value="formData"
          @update:model-value="value => Object.assign(formData, value)"
          @change="handleFormChange"
        >
  <template #orgSelect>
    <el-tree-select
      v-model="formData.organizationId"
      :data="organizationOptions"
      placeholder="请选择组织架构"
      :props="{ label: 'fullName', value: 'id', children: 'children' }"
      node-key="id"
      clearable
      filterable
      check-strictly
      style="width: 100%"
      @change="validateField('organizationId')"
    >
      <template #default="{ data }">
        <span>{{ data.name }}</span>
      </template>
    </el-tree-select>
  </template>
        </aimi-form>
      </template>
    </aimi-dialog>

    <!-- 分配角色弹窗 -->
    <aimi-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="400px"
      @confirm="handleSaveRoles"
    >
      <template #body>
        <div class="role-selection">
          <el-checkbox-group v-model="selectedRoleIds">
            <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { tableConfig, formConfig, searchFormConfig } from './config'
import type { User, Role } from './config'
import type { Organization } from '@/views/admin/organization-manage/config'
import { userApi, organizationApi } from '@/api'
import { useTable } from '@/hooks/useTable'
import {
  AimiSearch,
  AimiSearchForm,
  AimiTable,
  AimiDialog,
  AimiForm
} from '@/components/Aimi'

// 表格逻辑
const tableRef = ref()
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
} = useTable(userApi.ApiPageList)

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


// 弹窗逻辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive<User>({
  userName: '',
  realName: '',
  email: '',
  phone: '',
  password: '',
  position: '',
  organizationId: undefined,
  status: 1
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    userName: '',
    realName: '',
    email: '',
    phone: '',
    password: '',
    position: '',
    organizationId: undefined,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row: User) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleConfirm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    const res = await userApi.ApiSaveOrUpdate(formData)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      refresh()
    }
  } catch (error) {
    console.error(error)
  }
}

// 表单字段校验
const validateField = (field: string) => {
  formRef.value?.validateField(field)
}

const handleFormChange = (field: string, value: any) => {
  console.log(`字段 ${field} 变更:`, value)
}

// 统一操作处理
const handleOperationClick = (command: string, row: User) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'assignRole':
      handleAssignRole(row)
      break
    case 'resetPassword':
      handleResetPassword(row)
      break
    case 'toggleStatus':
      handleToggleStatus(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleResetPassword = (row: User) => {
  ElMessageBox.confirm(`确定要重置用户 ${row.userName} 的密码吗？`, '提示', {
    type: 'warning'
  }).then(async () => {
    const res = await userApi.ApiResetPassword(row.id!)
    if (res.code === 200) ElMessage.success('重置成功')
  })
}

const handleToggleStatus = async (row: User) => {
  const newStatus = row.status === 1 ? 0 : 1
  const res = await userApi.ApiUpdateStatus(row.id!, newStatus)
  if (res.code === 200) {
    ElMessage.success('状态更新成功')
    refresh()
  }
}

const handleDelete = (row: User) => {
  ElMessageBox.confirm(`确定要删除用户 ${row.userName} 吗？`, '警告', {
    type: 'error'
  }).then(async () => {
    const res = await userApi.ApiDelete(row.id!)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      refresh()
    }
  })
}


// 角色分配逻辑
const roleDialogVisible = ref(false)
const roleList = ref<Role[]>([])
const selectedRoleIds = ref<number[]>([])
const currentUserId = ref<number>()

const handleAssignRole = async (row: User) => {
  currentUserId.value = row.id
  try {
    const [roleRes, userRoleRes] = await Promise.all([
      userApi.ApiGetAllRoles(),
      userApi.ApiGetUserRoles(row.id!)
    ])

    if (roleRes.code === 200) {
      roleList.value = roleRes.data || []
    }

    if (userRoleRes.code === 200) {
      // 假设返回的是角色对象列表，提取ID
      const userRoles = userRoleRes.data || []
      selectedRoleIds.value = userRoles.map((role: any) => role.id || role)
    }

    roleDialogVisible.value = true
  } catch (error) {
    console.error('获取角色信息失败', error)
    ElMessage.error('获取角色信息失败')
  }
}

const handleSaveRoles = async () => {
  if (!currentUserId.value) return
  const res = await userApi.ApiAssignRoles(currentUserId.value, selectedRoleIds.value)
  if (res.code === 200) {
    ElMessage.success('分配成功')
    roleDialogVisible.value = false
    refresh()
  }
}

// 组织架构选项
const organizationOptions = ref<Organization[]>([])
const orgMap = ref<Record<string, string>>({})

/**
 * 递归处理组织架构数据，生成全路径名称并建立 ID 映射
 */
const formatOrgData = (data: any[], parentName = ''): Organization[] => {
  return data.map((item) => {
    const fullName = parentName ? `${parentName}/${item.name}` : item.name
    // 建立 ID 到全路径名称的映射
    orgMap.value[item.id] = fullName
    
    const newItem = {
      ...item,
      fullName
    }
    if (item.children && item.children.length > 0) {
      newItem.children = formatOrgData(item.children, fullName)
    }
    return newItem
  })
}

const getOrganizationOptions = async () => {
  try {
    const res = await organizationApi.getOrganizationPage(1, 100)
    console.log('获取组织架构响应:', res)
    if (res.code === 200 && res.data) {
      // 兼容 list 和 records 字段
      const list = res.data.list || res.data.records || []
      console.log('原始组织列表:', list)
      
      // 清空旧映射
      orgMap.value = {}
      // 处理全路径并填充映射
      organizationOptions.value = formatOrgData(list)
      console.log('处理后的组织列表:', organizationOptions.value)
      console.log('组织映射表:', orgMap.value)
    }
  } catch (error) {
    console.error('获取组织架构失败:', error)
  }
}

// 获取显示用的组织名称
const getOrgName = (row: User) => {
  if (row.orgPathName) return row.orgPathName
  if (row.organizationName) return row.organizationName
  if (row.organizationId && orgMap.value[row.organizationId]) {
    return orgMap.value[row.organizationId]
  }
  return '-'
}

// 工具函数
const getAvatarColor = (name: string | undefined): string => {
  if (!name) return '#409EFF'
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

const getStatusType = (status: number | undefined): string => {
  switch (status) {
    case 1: return 'success'
    case 0: return 'danger'
    case 2: return 'warning'
    default: return 'info'
  }
}

const getStatusText = (status: number | undefined): string => {
  switch (status) {
    case 1: return '正常'
    case 0: return '禁用'
    case 2: return '待激活'
    default: return '未知'
  }
}

const formatLoginTime = (time: string | undefined): string => {
  if (!time) return '从未登录'
  return new Date(time).toLocaleString('zh-CN')
}

onMounted(() => {
  getOrganizationOptions()
  updateTableHeight()
  window.addEventListener('resize', updateTableHeight)
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

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;

  .user-details {
    display: flex;
    flex-direction: column;

    .user-name {
      font-weight: 500;
      color: #303133;
      font-size: 13px;
    }

    .user-userName {
      font-size: 11px;
      color: #909399;
    }
  }
}

.login-info {
  font-size: 12px;
  color: #909399;
}

.role-selection {
  max-height: 300px;
  overflow-y: auto;
  .el-checkbox {
    display: block;
    margin-bottom: 8px;
  }
}
</style>
