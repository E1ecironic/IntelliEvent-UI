<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <aimi-search>
      <aimi-search-form
        :form-items="searchFormConfig"
        @search="handleSearch"
        @reset="handleReset"
      />
      <template #button>
        <el-button type="primary" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增用户
        </el-button>
        <el-button @click="handleBatchDelete" type="danger" :disabled="!selectedIds.length">
          <el-icon><Delete /></el-icon>批量删除
        </el-button>
      </template>
    </aimi-search>

    <!-- 表格区 -->
    <aimi-table
      v-bind="tableConfig"
      :loading="loading"
      :data="tableData"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      @page-change="(page: number) => getTableData()"
      @size-change="(size: number) => getTableData()"
      @selection-change="handleSelectionChange"
    >
      <!-- 用户信息插槽 -->
      <template #userInfo="{ row }">
        <div class="user-info">
          <el-avatar :size="32" :style="{ backgroundColor: getAvatarColor(row.userName) }">
            {{ (row.realName || row.userName || '').charAt(0) }}
          </el-avatar>
          <div class="user-details">
            <div class="user-name">{{ row.realName || row.userName }}</div>
            <div class="user-userName">@{{ row.userName }}</div>
          </div>
        </div>
      </template>

      <!-- 组织架构插槽 -->
      <template #organization="{ row }">
        <el-tag type="info" size="small">
          {{ row.organizationName || '-' }}
        </el-tag>
      </template>

      <!-- 状态插槽 -->
      <template #status="{ row }">
        <el-tag :type="getStatusType(row.status)" size="small">
          {{ getStatusText(row.status) }}
        </el-tag>
      </template>

      <!-- 最后登录插槽 -->
      <template #lastLogin="{ row }">
        <span class="login-info">{{ formatLoginTime(row.lastLoginAt) }}</span>
      </template>

      <!-- 操作插槽 -->
      <template #handler="{ row }">
        <el-button link type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button link type="warning" @click="handleAssignRole(row)">分配角色</el-button>
        <el-dropdown @command="(command: string) => handleCommand(command, row)">
          <el-button link type="info" style="margin-left: 8px">
            更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="resetPassword">重置密码</el-dropdown-item>
              <el-dropdown-item command="toggleStatus">
                {{ row.status === 1 ? '禁用' : '启用' }}
              </el-dropdown-item>
              <el-dropdown-item command="delete" style="color: #f56c6c">删除</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </template>
    </aimi-table>

    <!-- 新增/编辑弹窗 -->
    <aimi-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
      @confirm="handleConfirm"
    >
      <aimi-form
        ref="formRef"
        :form-items="formConfig"
        v-model="formData"
        @change="handleFormChange"
      >
        <template #orgSelect>
          <el-tree-select
            v-model="formData.organizationId"
            :data="organizationOptions"
            placeholder="请选择组织架构"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            clearable
            style="width: 100%"
            @change="validateField('organizationId')"
          />
        </template>
      </aimi-form>
    </aimi-dialog>

    <!-- 分配角色弹窗 -->
    <aimi-dialog
      v-model="roleDialogVisible"
      title="分配角色"
      width="400px"
      @confirm="handleSaveRoles"
    >
      <div class="role-selection">
        <el-checkbox-group v-model="selectedRoleIds">
          <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">
            {{ role.name }}
          </el-checkbox>
        </el-checkbox-group>
      </div>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, ArrowDown } from '@element-plus/icons-vue'
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

// 选中的数据
const selectedIds = ref<number[]>([])
const handleSelectionChange = (selection: User[]) => {
  selectedIds.value = selection.map((item) => item.id!)
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

// 更多操作
const handleCommand = (command: string, row: User) => {
  switch (command) {
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

const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 个用户吗？`, '警告', {
    type: 'error'
  }).then(async () => {
    const res = await userApi.ApiBatchDelete(selectedIds.value)
    if (res.code === 200) {
      ElMessage.success('批量删除成功')
      selectedIds.value = []
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
const getOrganizationOptions = async () => {
  const res = await organizationApi.getOrganizationPage(1, 100)
  if (res.code === 200 && res.data) {
    organizationOptions.value = res.data.records || []
  }
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
})
</script>

<style scoped lang="scss">
.app-container {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
