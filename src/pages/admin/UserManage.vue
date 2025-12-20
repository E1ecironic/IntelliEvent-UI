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
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增用户
          </el-button>
          <el-button @click="handleBatchImport">
            <el-icon><Upload /></el-icon>
            批量导入
          </el-button>
          <el-button @click="handleExport">
            <el-icon><Download /></el-icon>
            导出用户
          </el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="6">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索用户名、姓名或邮箱"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterOrg" placeholder="组织架构" clearable @change="handleFilter">
            <el-option label="全部组织" value="" />
            <el-option
              v-for="org in organizationOptions"
              :key="org.id"
              :label="org.name"
              :value="org.id"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterRole" placeholder="角色" clearable @change="handleFilter">
            <el-option label="全部角色" value="" />
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态" clearable @change="handleFilter">
            <el-option label="全部状态" value="" />
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
            <el-option label="待激活" :value="2" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-button @click="resetFilter">重置</el-button>
          <el-button type="primary" @click="handleAdvancedSearch">高级搜索</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 用户列表 -->
    <el-card class="content-card">
      <div class="table-container">
        <el-table
          ref="userTableRef"
          :data="userList"
          style="width: 100%"
          v-loading="tableLoading"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55" />
          <el-table-column label="用户信息" min-width="200">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :size="40" 
                  :src="row.avatarUrl"
                  :style="{ backgroundColor: getAvatarColor(row.username) }"
                >
                  {{ (row.realName || row.username).charAt(0) }}
                </el-avatar>
                <div class="user-details">
                  <div class="user-name">{{ row.realName || row.username }}</div>
                  <div class="user-username">@{{ row.username }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="手机" min-width="120" />
          <el-table-column label="组织架构" min-width="150">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ getOrganizationName(row.organizationId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="角色" min-width="120">
            <template #default="{ row }">
              <div class="role-tags">
                <el-tag
                  v-for="role in getUserRoles(row.id)"
                  :key="role.id"
                  :type="role.isSystem ? 'primary' : 'info'"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 2px;"
                >
                  {{ role.name }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag
                :type="getStatusType(row.status)"
                size="small"
                effect="light"
              >
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="最后登录" min-width="120">
            <template #default="{ row }">
              <div class="login-info">
                <div>{{ row.lastLoginAt || '从未登录' }}</div>
                <div class="login-ip" v-if="row.lastLoginIp">{{ row.lastLoginIp }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons">
                <el-button type="primary" link @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="warning" link @click="handleAssignRole(row)">
                  <el-icon><User /></el-icon>
                  分配角色
                </el-button>
                <el-dropdown @command="(command) => handleCommand(command, row)">
                  <el-button type="info" link>
                    <el-icon><MoreFilled /></el-icon>
                    更多
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="resetPassword">
                        <el-icon><Key /></el-icon>
                        重置密码
                      </el-dropdown-item>
                      <el-dropdown-item command="viewDetails">
                        <el-icon><View /></el-icon>
                        查看详情
                      </el-dropdown-item>
                      <el-dropdown-item command="toggleStatus" divided>
                        <el-icon><Switch /></el-icon>
                        {{ row.status === 1 ? '禁用' : '启用' }}
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" style="color: #f56c6c;">
                        <el-icon><Delete /></el-icon>
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
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalUsers"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑用户对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑用户' : '新增用户'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="userFormRef" :model="userForm" :rules="userRules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" />
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
          <el-tree-select
            v-model="userForm.organizationId"
            :data="organizationOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择所属组织"
            clearable
            check-strictly
          />
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
        <el-form-item label="头像" prop="avatarUrl">
          <el-upload
            class="avatar-uploader"
            action="/api/upload/avatar"
            :show-file-list="false"
            :on-success="handleAvatarSuccess"
            :before-upload="beforeAvatarUpload"
          >
            <img v-if="userForm.avatarUrl" :src="userForm.avatarUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="个人设置" prop="settings">
          <el-input
            v-model="userForm.settings"
            type="textarea"
            :rows="3"
            placeholder="用户个性化设置（JSON格式）"
          />
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
    <el-dialog
      v-model="showRoleDialog"
      title="分配角色"
      width="500px"
    >
      <div class="role-selection">
        <div class="role-header">
          <span>选择角色（可多选）</span>
          <el-button type="primary" link @click="selectAllRoles">
            全选
          </el-button>
        </div>
        <el-checkbox-group v-model="selectedRoles">
          <el-checkbox
            v-for="role in roleOptions"
            :key="role.id"
            :label="role.id"
            class="role-checkbox"
          >
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
    <el-dialog
      v-model="showDetailDialog"
      title="用户详情"
      width="600px"
    >
      <div class="user-detail" v-if="currentUser">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="用户名">{{ currentUser.username }}</el-descriptions-item>
          <el-descriptions-item label="真实姓名">{{ currentUser.realName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ currentUser.email }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ currentUser.phone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="所属组织">{{ getOrganizationName(currentUser.organizationId) }}</el-descriptions-item>
          <el-descriptions-item label="职位">{{ currentUser.position || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentUser.status)" size="small">
              {{ getStatusText(currentUser.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="最后登录">{{ currentUser.lastLoginAt || '从未登录' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间" :span="2">{{ currentUser.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="角色权限" :span="2">
            <div class="role-tags">
              <el-tag
                v-for="role in getUserRoles(currentUser.id)"
                :key="role.id"
                :type="role.isSystem ? 'primary' : 'info'"
                size="small"
                style="margin-right: 8px; margin-bottom: 4px;"
              >
                {{ role.name }}
              </el-tag>
            </div>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Edit,
  User,
  Key,
  View,
  Delete,
  Switch,
  MoreFilled,
  Upload,
  Download
} from '@element-plus/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const filterOrg = ref('')
const filterRole = ref('')
const filterStatus = ref('')

// 表格和分页
const userTableRef = ref()
const tableLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalUsers = ref(0)
const selectedUsers = ref([])

// 对话框状态
const showAddDialog = ref(false)
const showRoleDialog = ref(false)
const showDetailDialog = ref(false)
const isEdit = ref(false)
const isSubmitting = ref(false)

// 当前操作的用户
const currentUser = ref(null)
const selectedRoles = ref([])

// 表单数据
const userForm = reactive({
  id: null,
  organizationId: null,
  username: '',
  email: '',
  passwordHash: '',
  realName: '',
  avatarUrl: '',
  phone: '',
  position: '',
  status: 1,
  settings: ''
})

// 表单验证规则
const userRules = {
  username: [
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

// 模拟组织数据
const organizationList = ref([
  {
    id: 1,
    name: '总公司',
    parentId: null,
    children: [
      {
        id: 2,
        name: '技术部',
        parentId: 1,
        children: []
      },
      {
        id: 3,
        name: '市场部',
        parentId: 1,
        children: []
      }
    ]
  }
])

// 模拟角色数据
const roleList = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '系统超级管理员，拥有所有权限',
    isSystem: 1
  },
  {
    id: 2,
    name: '组织管理员',
    description: '组织管理员，管理组织内用户',
    isSystem: 1
  },
  {
    id: 3,
    name: '普通用户',
    description: '普通用户，基础权限',
    isSystem: 0
  }
])

// 模拟用户角色关联数据
const userRoleList = ref([
  { userId: 1, roleId: 1 },
  { userId: 2, roleId: 2 },
  { userId: 3, roleId: 3 }
])

// 模拟用户数据
const userData = ref([
  {
    id: 1,
    organizationId: 1,
    username: 'admin',
    email: 'admin@company.com',
    passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    realName: '超级管理员',
    avatarUrl: '',
    phone: '13800138000',
    position: '系统管理员',
    status: 1,
    lastLoginAt: '2024-01-15 14:30:00',
    lastLoginIp: '192.168.1.100',
    settings: '{"theme":"dark","language":"zh-CN"}',
    createdAt: '2024-01-01 10:00:00'
  },
  {
    id: 2,
    organizationId: 2,
    username: 'zhangsan',
    email: 'zhangsan@company.com',
    passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    realName: '张三',
    avatarUrl: '',
    phone: '13800138001',
    position: '技术总监',
    status: 1,
    lastLoginAt: '2024-01-14 09:15:00',
    lastLoginIp: '192.168.1.101',
    settings: '{"theme":"light","language":"zh-CN"}',
    createdAt: '2024-01-02 11:00:00'
  },
  {
    id: 3,
    organizationId: 3,
    username: 'lisi',
    email: 'lisi@company.com',
    passwordHash: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    realName: '李四',
    avatarUrl: '',
    phone: '13800138002',
    position: '市场经理',
    status: 1,
    lastLoginAt: '',
    lastLoginIp: '',
    settings: '{"theme":"auto","language":"zh-CN"}',
    createdAt: '2024-01-03 14:00:00'
  }
])

// 计算属性
const userList = computed(() => {
  // 这里可以根据搜索条件过滤数据
  let filteredUsers = userData.value
  
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filteredUsers = filteredUsers.filter(user => 
      user.username.toLowerCase().includes(keyword) ||
      user.realName.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword)
    )
  }
  
  if (filterOrg.value) {
    filteredUsers = filteredUsers.filter(user => user.organizationId === filterOrg.value)
  }
  
  if (filterRole.value) {
    const userIds = userRoleList.value
      .filter(ur => ur.roleId === filterRole.value)
      .map(ur => ur.userId)
    filteredUsers = filteredUsers.filter(user => userIds.includes(user.id))
  }
  
  if (filterStatus.value !== '') {
    filteredUsers = filteredUsers.filter(user => user.status === filterStatus.value)
  }
  
  // 分页
  totalUsers.value = filteredUsers.length
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  
  return filteredUsers.slice(start, end)
})

const organizationOptions = computed(() => {
  const options = []
  const traverse = (orgs) => {
    orgs.forEach(org => {
      options.push({
        id: org.id,
        name: org.name,
        children: org.children ? traverse(org.children) : []
      })
    })
    return options
  }
  traverse(organizationList.value)
  return options
})

const roleOptions = computed(() => roleList.value)

// 方法
const handleSearch = () => {
  currentPage.value = 1
  console.log('搜索:', searchKeyword.value)
}

const handleFilter = () => {
  currentPage.value = 1
  console.log('筛选条件变更')
}

const handleAdvancedSearch = () => {
  // 高级搜索逻辑
  console.log('高级搜索')
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterOrg.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  currentPage.value = 1
}

const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

const handleBatchImport = () => {
  // 批量导入逻辑
  console.log('批量导入')
}

const handleExport = () => {
  // 导出逻辑
  console.log('导出用户')
}

const handleEdit = (user) => {
  currentUser.value = user
  isEdit.value = true
  
  // 填充表单数据
  Object.assign(userForm, {
    id: user.id,
    organizationId: user.organizationId,
    username: user.username,
    email: user.email,
    realName: user.realName,
    avatarUrl: user.avatarUrl,
    phone: user.phone,
    position: user.position,
    status: user.status,
    settings: user.settings || ''
  })
  
  showAddDialog.value = true
}

const handleAssignRole = (user) => {
  currentUser.value = user
  
  // 获取用户当前角色
  const userRoleIds = userRoleList.value
    .filter(ur => ur.userId === user.id)
    .map(ur => ur.roleId)
  
  selectedRoles.value = userRoleIds
  showRoleDialog.value = true
}

const handleCommand = (command, user) => {
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

const handleResetPassword = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要重置用户 "${user.realName || user.username}" 的密码吗？`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    console.log('重置密码:', user.id)
    ElMessage.success('密码重置成功，新密码已发送至用户邮箱')
  } catch (error) {
    console.log('取消重置')
  }
}

const handleViewDetails = (user) => {
  currentUser.value = user
  showDetailDialog.value = true
}

const handleToggleStatus = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要${user.status === 1 ? '禁用' : '启用'}用户 "${user.realName || user.username}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    user.status = user.status === 1 ? 0 : 1
    ElMessage.success(`${user.status === 1 ? '启用' : '禁用'}成功`)
  } catch (error) {
    console.log('取消操作')
  }
}

const handleDelete = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 "${user.realName || user.username}" 吗？此操作不可恢复。`,
      '删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 模拟API调用
    const index = userData.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      userData.value.splice(index, 1)
    }
    
    ElMessage.success('用户删除成功')
  } catch (error) {
    console.log('取消删除')
  }
}

const handleSizeChange = (size) => {
  pageSize.value = size
  console.log('每页显示:', size)
}

const handleCurrentChange = (page) => {
  currentPage.value = page
  console.log('当前页:', page)
}

const selectAllRoles = () => {
  selectedRoles.value = roleOptions.value.map(role => role.id)
}

const saveRoles = async () => {
  try {
    isSubmitting.value = true
    
    // 模拟API调用 - 更新用户角色
    const userId = currentUser.value.id
    
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
        userId: userId,
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

const resetForm = () => {
  userForm.id = null
  userForm.organizationId = null
  userForm.username = ''
  userForm.email = ''
  userForm.passwordHash = ''
  userForm.realName = ''
  userForm.avatarUrl = ''
  userForm.phone = ''
  userForm.position = ''
  userForm.status = 1
  userForm.settings = ''
  
  currentUser.value = null
  isEdit.value = false
}

// 辅助方法
const getOrganizationName = (orgId) => {
  const findOrg = (orgs) => {
    for (const org of orgs) {
      if (org.id === orgId) return org.name
      if (org.children) {
        const name = findOrg(org.children)
        if (name) return name
      }
    }
    return '-'
  }
  return findOrg(organizationList.value)
}

const getUserRoles = (userId) => {
  const roleIds = userRoleList.value
    .filter(ur => ur.userId === userId)
    .map(ur => ur.roleId)
  return roleList.value.filter(role => roleIds.includes(role.id))
}

const getStatusType = (status) => {
  const types = {
    0: 'info',
    1: 'success',
    2: 'warning'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    0: '禁用',
    1: '正常',
    2: '待激活'
  }
  return texts[status] || '未知'
}

const getAvatarColor = (username) => {
  const colors = ['#409EFF', '#67C23A', '#E6A23C', '#F56C6C', '#909399']
  const hash = username.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0)
  return colors[Math.abs(hash) % colors.length]
}

const handleAvatarSuccess = (response, file) => {
  userForm.avatarUrl = URL.createObjectURL(file.raw)
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

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
onMounted(() => {
  totalUsers.value = userData.value.length
})
</script>

<style scoped>
.user-manage {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;
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
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.content-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.table-container {
  padding: 20px 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-username {
  font-size: 12px;
  color: #909399;
}

.role-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.login-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-ip {
  font-size: 12px;
  color: #909399;
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
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

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 80px;
  height: 80px;
  text-align: center;
  line-height: 80px;
}

.avatar {
  width: 80px;
  height: 80px;
  display: block;
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