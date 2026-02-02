<template>
  <div class="user-manage">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>用户管理</h2>
          <p class="subtitle">管理系统用户，支持组织架构关联和角色权限分配</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="handleAddUser">
            <el-icon>
              <Plus />
            </el-icon>
            新增用户
          </el-button>
          <el-button @click="handleBatchImport">
            <el-icon>
              <Upload />
            </el-icon>
            批量导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon>
              <Download />
            </el-icon>
            导出用户
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <!-- 第一行：搜索输入框 -->
      <el-row :gutter="16" class="search-row">
        <el-col :span="8">
          <div class="search-item">
            <label class="search-label">用户名</label>
            <el-input v-model="searchUserName" placeholder="请输入用户名" clearable @input="handleSearch" size="default">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="search-item">
            <label class="search-label">真实姓名</label>
            <el-input v-model="searchRealName" placeholder="请输入真实姓名" clearable @input="handleSearch" size="default">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="search-item">
            <label class="search-label">邮箱</label>
            <el-input v-model="searchEmail" placeholder="请输入邮箱" clearable @input="handleSearch" size="default">
              <template #prefix>
                <el-icon>
                  <Search />
                </el-icon>
              </template>
            </el-input>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行：筛选条件和操作按钮 -->
      <el-row :gutter="16" class="filter-row" align="middle">
        <el-col :span="6">
          <div class="search-item">
            <label class="search-label">组织架构</label>
            <el-select v-model="filterOrg" placeholder="全部组织" clearable @change="handleFilter" size="default">
              <el-option v-for="org in organizationOptions" :key="org.id" :label="org.name" :value="org.id" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="search-item">
            <label class="search-label">状态</label>
            <el-select v-model="filterStatus" placeholder="全部状态" clearable @change="handleFilter" size="default">
              <el-option label="正常" :value="1" />
              <el-option label="禁用" :value="0" />
              <el-option label="待激活" :value="2" />
            </el-select>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="filter-actions">
            <el-button type="primary" @click="handleAdvancedSearch" size="default">
              <el-icon>
                <Search />
              </el-icon>
              搜索
            </el-button>
            <el-button @click="resetFilter" size="default">
              <el-icon>
                <Refresh />
              </el-icon>
              重置
            </el-button>
            <el-button text @click="toggleAdvanced" size="default">
              {{ showAdvanced ? '收起' : '高级搜索' }}
              <el-icon>
                <ArrowDown v-if="!showAdvanced" />
                <ArrowUp v-else />
              </el-icon>
            </el-button>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="content-card">
      <div class="batch-actions" v-if="selectedUsers.length > 0">
        <el-button type="danger" @click="handleBatchDelete" size="small">
          <el-icon>
            <Delete />
          </el-icon>
          批量删除
        </el-button>
        <el-button type="success" @click="handleBatchStatusUpdate(1)" size="small">
          <el-icon>
            <Switch />
          </el-icon>
          批量启用
        </el-button>
        <el-button type="warning" @click="handleBatchStatusUpdate(0)" size="small">
          <el-icon>
            <Switch />
          </el-icon>
          批量禁用
        </el-button>
        <span class="selected-count">已选择 {{ selectedUsers.length }} 个用户</span>
      </div>
      <div class="table-wrapper">
        <div class="table-container">
          <el-table ref="userTableRef" :data="userList" style="width: 100%" v-loading="tableLoading"
            @selection-change="handleSelectionChange" table-layout="fixed">
            <el-table-column type="selection" width="55" />
            <el-table-column label="用户信息" min-width="140">
              <template #default="{ row }">
                <div class="user-info">
                  <el-avatar :size="32" :src="row.avatarUrl" :style="{ backgroundColor: getAvatarColor(row.userName) }">
                    {{ (row.realName || row.userName).charAt(0) }}
                  </el-avatar>
                  <div class="user-details">
                    <div class="user-name">{{ row.realName || row.userName }}</div>
                    <div class="user-userName">@{{ row.userName }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="email" label="邮箱" min-width="120" />
            <el-table-column prop="phone" label="手机" min-width="80" />
            <el-table-column label="组织架构" min-width="120">
              <template #default="{ row }">
                <el-tag type="info" size="small">
                  {{ getOrganizationName(row.organizationId) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="角色" min-width="70">
              <template #default="{ row }">
                <div class="role-tags">
                  <el-tag v-for="role in getUserRoles(row.id).slice(0, 1)" :key="role.id"
                    :type="role.isSystem ? 'primary' : 'info'" size="small">
                    {{ role.name }}
                  </el-tag>
                  <el-tag v-if="getUserRoles(row.id).length > 1" type="info" size="small">
                    +{{ getUserRoles(row.id).length - 1 }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" min-width="70">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" size="small" effect="light">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="最后登录" min-width="80">
              <template #default="{ row }">
                <div class="login-info">
                  <div>{{ formatLoginTime(row.lastLoginAt) }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="操作" min-width="100" fixed="right">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button type="primary" link @click="handleEdit(row)" size="small" title="编辑">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                  <el-button type="warning" link @click="handleAssignRole(row)" size="small" title="分配角色">
                    <el-icon>
                      <User />
                    </el-icon>
                  </el-button>
                  <el-dropdown @command="(command: string) => handleCommand(command, row)" placement="bottom-end">
                    <el-button type="info" link size="small" title="更多操作">
                      <el-icon>
                        <MoreFilled />
                      </el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="resetPassword">
                          <el-icon>
                            <Key />
                          </el-icon>
                          重置密码
                        </el-dropdown-item>
                        <el-dropdown-item command="viewDetails">
                          <el-icon>
                            <View />
                          </el-icon>
                          查看详情
                        </el-dropdown-item>
                        <el-dropdown-item command="toggleStatus" divided>
                          <el-icon>
                            <Switch />
                          </el-icon>
                          {{ row.status === 1 ? '禁用' : '启用' }}
                        </el-dropdown-item>
                        <el-dropdown-item command="delete" style="color: #f56c6c;">
                          <el-icon>
                            <Delete />
                          </el-icon>
                          删除用户
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="config.performance.pagination.pageSizes" :total="totalUsers"
              :layout="config.performance.pagination.layout" @size-change="handleSizeChange"
              @current-change="handleCurrentChange" />
          </div>
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog v-model="showAddDialog" :title="isEdit ? '编辑用户' : '新增用户'" :width="config.dimensions.dialog.width.medium"
      @close="resetForm">
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="userName">
              <el-input v-model="userForm.userName" placeholder="请输入用户名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userForm.realName" placeholder="请输入真实姓名" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="所属组织" prop="organizationId">
          <el-tree-select v-model="userForm.organizationId" :data="organizationOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }" placeholder="选择所属组织" clearable
            check-strictly />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="userForm.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
            <el-radio :value="2">待激活</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="头像" prop="avatar">
          <el-upload class="avatar-uploader" action="/api/upload/avatar" :show-file-list="false"
            :on-success="handleAvatarSuccess" :on-error="handleAvatarError" :on-change="handleAvatarChange"
            :before-upload="beforeAvatarUpload" accept="image/*">
            <img v-if="userForm.avatar" :src="userForm.avatar" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
          <div class="avatar-tips">
            <el-text type="info" size="small">支持 JPG、PNG、GIF 格式，大小不超过 2MB</el-text>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="isSubmitting">
            {{ isEdit ? '保存' : '创建' }}
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog v-model="showRoleDialog" title="分配角色" width="500px">
      <div class="role-selection">
        <div class="role-header">
          <span>选择角色（可多选）</span>
          <el-button type="primary" link @click="selectAllRoles">
            全选
          </el-button>
        </div>
        <el-checkbox-group v-model="selectedRoles">
          <el-checkbox v-for="role in roleOptions" :key="role.id" :label="role.id" class="role-checkbox">
            <div class="role-info">
              <div class="role-name">{{ role.name }}</div>
              <div class="role-desc">{{ role.description }}</div>
            </div>
          </el-checkbox>
        </el-checkbox-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRoleDialog = false">取消</el-button>
          <el-button type="primary" @click="saveRoles" :loading="isSubmitting">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户详情对话框 -->
    <el-dialog v-model="showDetailDialog" title="用户详情" width="600px">
      <div class="user-detail" v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser.userName }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentUser.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属组织">{{ getOrganizationName(currentUser.organizationId)
            }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ currentUser.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag v-if="currentUser.status !== undefined" :type="getStatusType(currentUser.status)" size="small">
              {{ getStatusText(currentUser.status) }}
            </el-tag>
            <el-tag v-else type="info" size="small">
              未知
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ currentUser.lastLoginAt || '从未登录' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentUser.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="角色权限" :span="2">
            <div class="role-tags">
              <el-tag v-for="role in safeGetUserRoles(currentUser.id)" :key="role.id"
                :type="role.isSystem ? 'primary' : 'info'" size="small" style="margin-right: 8px; margin-bottom: 4px;">
                {{ role.name }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { userApi, organizationApi } from '@/api'
import config from './config'
import type { User } from './config'
import type { Organization } from '@/views/admin/organization-manage/config'
/* import type { User, UserForm } from '@/types/user' */
import {
  Search,
  Plus,
  Edit,
  User as UserIcon,
  Key,
  View,
  Delete,
  Switch,
  MoreFilled,
  Upload,
  Download,
  Refresh,
  ArrowDown,
  ArrowUp
} from '@element-plus/icons-vue'

// TypeScript interfaces

interface Role {
  id: number
  name: string
  description: string
  isSystem: number
}

interface UserRole {
  userId: number
  roleId: number
}

// 搜索和筛选
const searchUserName = ref<string>('')
const searchRealName = ref<string>('')
const searchEmail = ref<string>('')
const filterOrg = ref<string>('')
const filterStatus = ref<number | null>(null)
const showAdvanced = ref<boolean>(false)

// 表格和分页
const userFormRef = ref()
const tableLoading = ref<boolean>(false)
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)
const totalUsers = ref<number>(0)
const selectedUsers = ref<User[]>([])

// 对话框状态
const showAddDialog = ref<boolean>(false)
const showRoleDialog = ref<boolean>(false)
const showDetailDialog = ref<boolean>(false)
const isEdit = ref<boolean>(false)
const isSubmitting = ref<boolean>(false)

// 当前操作的用户
const currentUser = ref<User>({})
const selectedRoles = ref<number[]>([])

// 表单数据
const userForm = reactive<User>({
  id: undefined,
  organizationId: undefined,
  userName: '',
  email: '',
  realName: '',
  phone: '',
  avatar: '',
  status: undefined,
  roleIds: []
})

// 表单验证规则
const userRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9_]+$/, message: '用户名只能包含字母、数字和下划线', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  realName: [
    { max: 50, message: '真实姓名长度不能超过 50 个字符', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  organizationId: [
    { required: true, message: '请选择所属组织', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 用户数据
const userList = ref<User[]>([])
const allUserData = ref<User[]>([]) // 存储所有用户数据用于前端筛选

// 组织数据
const organizationList = ref<Organization[]>([])
const organizationMap = ref<Map<number, string>>(new Map()) // 组织ID到名称的映射

// 角色数据
const roleList = ref<Role[]>([])

// 用户角色关联数据
const userRoleList = ref<UserRole[]>([])

// 计算属性
const organizationOptions = computed<Organization[]>(() => {
  const traverse = (orgs: Organization[]): Organization[] => {
    return orgs.map(org => ({
      id: org.id,
      name: org.name,
      code: org.code,
      managerName: org.managerName,
      connectPhone: org.connectPhone,
      email: org.email,
      status: org.status,
      remark: org.remark,
      children: org.children ? traverse(org.children) : undefined
    }))
  }

  return traverse(organizationList.value)
})

// 方法
const loadUsers = async (): Promise<void> => {
  tableLoading.value = true
  try {
    console.log('加载用户数据，参数:', {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      userName: searchUserName.value,
      realName: searchRealName.value,
      email: searchEmail.value,
      status: filterStatus.value,
      organizationId: filterOrg.value
    })

    const params: any = {}

    // 只添加非空的值
    if (searchUserName.value) params.userName = searchUserName.value
    if (searchRealName.value) params.realName = searchRealName.value
    if (searchEmail.value) params.email = searchEmail.value

    // 处理数字类型的参数
    if (filterStatus.value !== null) {
      const statusNum = Number(filterStatus.value)
      if (!isNaN(statusNum)) {
        params.status = statusNum
      }
    }

    if (filterOrg.value) {
      const orgNum = Number(filterOrg.value)
      if (!isNaN(orgNum)) {
        params.organizationId = orgNum
      }
    }

    const response = await userApi.getUserPage(
      currentPage.value,
      pageSize.value,
      params
    )

    if (response.code === 200 && response.data) {
      console.log('用户数据加载成功:', response.data)
      const { records, total } = response.data
      userList.value = records || []
      totalUsers.value = total || 0

      // 存储所有数据用于前端筛选
      allUserData.value = records || []
    } else {
      ElMessage.error(response.message || '加载用户数据失败')
      userList.value = []
      totalUsers.value = 0
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
    ElMessage.error('加载用户数据失败')
    userList.value = []
    totalUsers.value = 0
  } finally {
    tableLoading.value = false
  }
}

const roleOptions = computed<Role[]>(() => roleList.value)

// 方法
const loadOrganizations = async (): Promise<void> => {
  try {
    const response = await organizationApi.getOrganizationPage(1, 100)
    if (response.code === 200 && response.data) {
      const { records } = response.data
      organizationList.value = records || []

      // 构建组织ID到名称的映射
      const buildOrgMap = (orgs: Organization[]): void => {
        orgs.forEach(org => {
          // 添加类型检查
          if (org.id !== undefined && org.name !== undefined) {
            organizationMap.value.set(org.id, org.name)
          }
          if (org.children && org.children.length > 0) {
            buildOrgMap(org.children)
          }
        })
      }
      buildOrgMap(organizationList.value)
    }
  } catch (error) {
    console.error('加载组织数据失败:', error)
  }
}

const handleSearch = (): void => {
  currentPage.value = 1
  loadUsers()
}

const handleFilter = (): void => {
  currentPage.value = 1
  loadUsers()
}

const handleAdvancedSearch = (): void => {
  currentPage.value = 1
  loadUsers()
}

const toggleAdvanced = (): void => {
  showAdvanced.value = !showAdvanced.value
}

const resetFilter = (): void => {
  searchUserName.value = '' 
  searchRealName.value = ''
  searchEmail.value = ''
  filterOrg.value = ''
  filterStatus.value = null
  currentPage.value = 1
  loadUsers()
}

const handleSelectionChange = (selection: User[]): void => {
  selectedUsers.value = selection
}

const handleBatchImport = (): void => {
  // 批量导入逻辑
  console.log('批量导入')
}

const handleBatchDelete = async (): Promise<void> => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedUsers.value.length} 个用户吗？此操作不可恢复。`,
      '批量删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    // 获取选中的用户ID
    const userIds = selectedUsers.value.map(user => user.id!).filter(id => id !== null)

    // 调用批量删除API
    const response = await userApi.batchDeleteUsers(userIds)

    if (response.code === 200) {
      ElMessage.success(`成功删除 ${userIds.length} 个用户`)
      loadUsers() // 刷新用户列表
      selectedUsers.value = [] // 清空选择
    } else {
      ElMessage.error(response.message || '批量删除失败')
    }
  } catch (error) {
    console.log('取消批量删除')
  }
}

const handleBatchStatusUpdate = async (status: number): Promise<void> => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请选择要更新状态的用户')
    return
  }

  const statusText = status === 1 ? '启用' : '禁用'
  const statusType = status === 1 ? 'success' : 'warning'

  try {
    await ElMessageBox.confirm(
      `确定要${statusText}选中的 ${selectedUsers.value.length} 个用户吗？`,
      `批量${statusText}用户`,
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: statusType
      }
    )

    // 获取选中的用户ID
    const userIds = selectedUsers.value.map(user => user.id!).filter(id => id !== null)

    // 调用批量状态更新API
    const response = await userApi.batchUpdateStatus(userIds, status)

    if (response.code === 200) {
      ElMessage.success(`成功${statusText} ${userIds.length} 个用户`)
      loadUsers() // 刷新用户列表
      selectedUsers.value = [] // 清空选择
    } else {
      ElMessage.error(response.message || '批量状态更新失败')
    }
  } catch (error) {
    console.log('取消批量状态更新')
  }
}

const handleAddUser = (): void => {
  currentUser.value = {}
  isEdit.value = false
  resetForm()
  showAddDialog.value = true
}

const handleExport = (): void => {
  // 导出逻辑
  console.log('导出用户')
}

const handleEdit = (user: User): void => {
  currentUser.value = user
  isEdit.value = true

  // 填充表单数据
  Object.assign(userForm, {
    id: user.id,
    organizationId: user.organizationId,
    userName: user.userName,
    email: user.email,
    realName: user.realName,
    avatar: user.avatar,
    phone: user.phone,
    position: user.position,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    lastLoginIp: user.lastLoginIp,
    settings: user.settings || '',
    createdAt: user.createdAt
  })

  showAddDialog.value = true
}

const submitForm = async (): Promise<void> => {
  try {
    await userFormRef.value.validate()
    isSubmitting.value = true

    let response
    if (isEdit.value) {
      // 编辑用户
      response = await userApi.updateUser(userForm)
    } else {
      // 新增用户
      response = await userApi.createUser(userForm)
    }

    if (response.code === 200) {
      ElMessage.success(isEdit.value ? '用户更新成功' : '用户创建成功')
      showAddDialog.value = false
      resetForm()
      loadUsers() // 刷新用户列表
    } else {
      ElMessage.error(response.message || (isEdit.value ? '用户更新失败' : '用户创建失败'))
    }
  } catch (error) {
    console.error('表单提交失败:', error)
    if (error !== false) { // 如果不是验证错误
      ElMessage.error(isEdit.value ? '用户更新失败' : '用户创建失败')
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleAssignRole = (user: User): void => {
  currentUser.value = user

  // 获取用户当前角色
  const userRoleIds = userRoleList.value
    .filter(ur => ur.userId === user.id)
    .map(ur => ur.roleId)

  selectedRoles.value = userRoleIds
  showRoleDialog.value = true
}

const handleCommand = (command: string, user: User): void => {
  switch (command) {
    case 'resetPassword':
      handleResetPassword(user)
      break
    case 'viewDetails':
      handleViewDetails(user)
      break
    case 'toggleStatus':
      handleToggleStatus(user)
      break
    case 'delete':
      handleDelete(user)
      break
  }
}

const handleResetPassword = async (user: User): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.realName || user.userName}" 的密码吗？`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用API重置密码 - 不传新密码，由后端生成随机密码
    const response = await userApi.resetPassword(user.id!)

    if (response.code === 200) {
      ElMessage.success('密码重置成功，新密码已发送至用户邮箱')
    } else {
      ElMessage.error(response.message || '密码重置失败')
    }
  } catch (error) {
    console.log('取消重置')
  }
}

const handleViewDetails = (user: User): void => {
  currentUser.value = user
  showDetailDialog.value = true
}

const handleToggleStatus = async (user: User): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要${user.status === 1 ? '禁用' : '启用'}用户 "${user.realName || user.userName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用API更新用户状态
    const newStatus = user.status === 1 ? 0 : 1
    const updateData: User = {
      id: user.id,
      organizationId: user.organizationId,
      userName: user.userName,
      realName: user.realName,
      email: user.email,
      phone: user.phone,
      status: newStatus,
      roleIds: user.roleIds
    }
    const response = await userApi.updateUser(updateData)

    if (response.code === 200) {
      user.status = newStatus // 更新本地状态
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
    } else {
      ElMessage.error(response.message || '状态更新失败')
    }
  } catch (error) {
    console.log('取消操作')
  }
}

const handleDelete = async (user: User): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.realName || user.userName}" 吗？此操作不可恢复。`,
      '删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )

    // 调用API删除用户
    const response = await userApi.deleteUser(user.id!)

    if (response.code === 200) {
      ElMessage.success('用户删除成功')
      loadUsers() // 刷新用户列表
    } else {
      ElMessage.error(response.message || '用户删除失败')
    }
  } catch (error) {
    console.log('取消删除')
  }
}

const handleSizeChange = (size: number): void => {
  pageSize.value = size
  loadUsers()
}

const handleCurrentChange = (page: number): void => {
  currentPage.value = page
  loadUsers()
}

const selectAllRoles = (): void => {
  selectedRoles.value = roleOptions.value.map(role => role.id)
}

const saveRoles = async (): Promise<void> => {
  try {
    isSubmitting.value = true

    // 模拟API调用 - 更新用户角色
    const userId = currentUser.value!.id

    // 移除旧的角色关联
    const oldUserRoles = userRoleList.value.filter(ur => ur.userId === userId)
    oldUserRoles.forEach(ur => {
      const index = userRoleList.value.indexOf(ur)
      if (index > -1) {
        userRoleList.value.splice(index, 1)
      }
    })

    // 添加新的角色关联
    selectedRoles.value.forEach(roleId => {
      userRoleList.value.push({
        userId: userId!,
        roleId: roleId
      })
    })

    ElMessage.success('角色分配成功')
    showRoleDialog.value = false
    isSubmitting.value = false
  } catch (error) {
    console.error('角色分配失败:', error)
    isSubmitting.value = false
  }
}

const resetForm = (): void => {
  userForm.id = undefined
  userForm.organizationId = undefined
  userForm.userName = ''
  userForm.email = ''
  userForm.password = ''
  userForm.realName = ''
  userForm.avatar = ''
  userForm.phone = ''
  userForm.status = 1
  userForm.roleIds = []
  currentUser.value = {}
  isEdit.value = false
}

// 辅助方法
const getOrganizationName = (orgId: number | null | undefined): string => {
  if (!orgId) return '-'
  const name = organizationMap.value.get(orgId)
  return name || '-'
}

const safeGetUserRoles = (userId?: number): Role[] => {
  if (userId === undefined) return []
  return getUserRoles(userId)
}

const getUserRoles = (userId: number): Role[] => {
  const roleIds = userRoleList.value
    .filter(ur => ur.userId === userId)
    .map(ur => ur.roleId)
  return roleList.value.filter(role => roleIds.includes(role.id))
}

const getStatusType = (status: number): string => {
  const types: Record<number, string> = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status: number): string => {
  const texts: Record<number, string> = {
    0: '禁用',
    1: '正常',
    2: '待激活'
  }
  return texts[status] || '未知'
}

const getAvatarColor = (userName: string): string => {
  const colors: string[] = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const hash = userName.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) 
  return colors[Math.abs(hash) % colors.length]
}

const formatLoginTime = (time: string): string => {
  if (!time) return '从未登录'

  // 如果是今天的日期，只显示时间
  const today = new Date().toDateString()
  const loginDate = new Date(time).toDateString()

  if (today === loginDate) {
    return new Date(time).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // 如果是昨天，显示昨天
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)

  if (loginDate === yesterday.toDateString()) {
    return '昨天'
  }

  // 如果是本周内，显示星期几
  const weekDays: string[] = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const loginDay: number = new Date(time).getDay()
  const daysDiff: number = (new Date().getTime() - new Date(time).getTime()) / (1000 * 60 * 60 * 24)

  if (daysDiff < 7) {
    return weekDays[loginDay]
  }

  // 否则显示月-日
  return new Date(time).toLocaleDateString('zh-CN', {
    month: 'numeric',
    day: 'numeric'
  })
}

const handleAvatarSuccess = (response: any, file: any): void => {
  if (response.code === 200 && response.data) {
    // 使用后端返回的URL
    userForm.avatar = response.data.url || response.data.avatarUrl
    ElMessage.success('头像上传成功')
  } else {
    // 如果后端没有返回URL，使用本地预览
    userForm.avatar = URL.createObjectURL(file.raw)
    ElMessage.warning('头像上传成功，但未能获取到服务器URL')
  }
}

const handleAvatarChange = (file: any): void => {
  // 文件选择改变时的处理
  console.log('头像文件选择:', file)
}

const handleAvatarError = (error: any): void => {
  console.error('头像上传失败:', error)
  ElMessage.error('头像上传失败，请稍后重试')
}

const beforeAvatarUpload = (file: File): boolean => {
  const isImage: boolean = file.type.startsWith('image/')
  const isLt2M: boolean = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }

  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 生命周期
onMounted((): void => {
  loadOrganizations()
  loadUsers()
})
</script>

<style scoped>
.user-manage {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 24px;
}

.subtitle {
  color: #909399;
  font-size: 14px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.filter-card {
  border-radius: 8px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
}

.search-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-label {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  margin-bottom: 4px;
}

.search-row {
  margin-bottom: 16px;
}

.filter-row {
  padding-top: 8px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  height: 56px;
  /* 对齐其他表单项的高度 */
}

.search-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 20px;
  /* 对齐标签高度 */
}

.search-actions .el-button {
  width: 100%;
  margin: 0;
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.table-container {
  padding: 0;
  width: 100%;
  min-width: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

@media screen and (max-width: 1440px) {
  .table-container {
    overflow-x: auto;
  }
}

@media screen and (max-width: 1200px) {
  .user-info {
    gap: 4px;
  }

  .user-name {
    font-size: 12px;
  }

  .user-userName {
    font-size: 10px;
  }
}

.el-table__body-wrapper {
  flex: 1;
}

@media screen and (max-width: 768px) {
  .table-container .el-table {
    min-width: 800px !important;
  }

  .action-buttons .el-button--small {
    height: 20px;
    padding: 1px 3px;
  }

  .el-avatar {
    width: 24px !important;
    height: 24px !important;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name {
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  line-height: 1.2;
}

.user-userName {
  font-size: 11px;
  color: #909399;
  line-height: 1.2;
}

.role-tags {
  display: flex;
  flex-wrap: nowrap;
  gap: 2px;
  align-items: center;
}

.role-tags .el-tag {
  max-width: 50px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 3px;
  height: 18px;
  line-height: 16px;
  font-size: 10px;
}

.login-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  font-size: 10px;
  line-height: 1.1;
}

.login-info div {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.login-ip {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 1px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  padding: 1px 2px;
  margin: 0;
}

.action-buttons .el-button--small {
  min-width: auto;
  height: 20px;
  padding: 1px 2px;
}

.action-buttons .el-icon {
  margin: 0;
  font-size: 12px;
}

.action-buttons .el-button [class*="el-icon"] {
  font-size: 14px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #ebeef5;
}

.batch-actions {
  padding: 8px 0;
  border-bottom: 1px solid #e4e7ed;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.selected-count {
  margin-left: auto;
  color: #909399;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-item {
    margin-bottom: 12px;
  }

  .search-actions {
    padding-top: 0;
    flex-direction: row;
    gap: 8px;
  }

  .search-actions .el-button {
    width: auto;
  }
}

.role-selection {
  padding: 20px 0;
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
  color: #606266;
}

.role-checkbox {
  display: block;
  margin-bottom: 12px;
  width: 100%;
}

.role-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.role-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.role-desc {
  font-size: 12px;
  color: #909399;
}

.user-detail {
  padding: 20px 0;
}

/* 头像上传样式 */
.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  width: 120px;
  height: 120px;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.avatar-tips {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 768px) {
  .user-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
}
</style>