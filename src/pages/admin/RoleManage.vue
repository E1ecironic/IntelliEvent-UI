<template>
  <div class="role-manage">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>角色管理</h2>
          <p class="subtitle">管理系统角色和权限，支持RBAC权限模型</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
          <el-button @click="handleImportPermissions">
            <el-icon><Upload /></el-icon>
            导入权限
          </el-button>
          <el-button @click="handleExportPermissions">
            <el-icon><Download /></el-icon>
            导出权限
          </el-button>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-card class="content-card">
      <div class="role-container">
        <el-row :gutter="20">
          <el-col v-for="role in roleList" :key="role.id" :span="8">
            <el-card class="role-card" shadow="hover">
              <template #header>
                <div class="role-header">
                  <div class="role-title">
                    <h4>{{ role.name }}</h4>
                    <el-tag 
                      :type="role.isSystem ? 'primary' : 'info'" 
                      size="small"
                      style="margin-left: 8px;"
                    >
                      {{ role.isSystem ? '系统' : '自定义' }}
                    </el-tag>
                  </div>
                  <el-dropdown @command="(command) => handleRoleCommand(command, role)">
                    <el-button type="info" link>
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">
                          <el-icon><Edit /></el-icon>
                          编辑角色
                        </el-dropdown-item>
                        <el-dropdown-item command="permissions">
                          <el-icon><Key /></el-icon>
                          配置权限
                        </el-dropdown-item>
                        <el-dropdown-item command="copy">
                          <el-icon><CopyDocument /></el-icon>
                          复制角色
                        </el-dropdown-item>
                        <el-dropdown-item command="users" divided>
                          <el-icon><User /></el-icon>
                          查看用户
                        </el-dropdown-item>
                        <el-dropdown-item 
                          command="delete" 
                          style="color: #f56c6c;"
                          :disabled="role.isSystem === 1"
                        >
                          <el-icon><Delete /></el-icon>
                          删除角色
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </template>
              <div class="role-content">
                <div class="role-description">
                  {{ role.description || '暂无描述' }}
                </div>
                <div class="role-stats">
                  <div class="stat-item">
                    <el-icon><User /></el-icon>
                    <span>{{ getRoleUserCount(role.id) }} 个用户</span>
                  </div>
                  <div class="stat-item">
                    <el-icon><Key /></el-icon>
                    <span>{{ getRolePermissionCount(role.id) }} 项权限</span>
                  </div>
                </div>
                <div class="role-permissions">
                  <div class="permissions-header">
                    <span>主要权限</span>
                    <el-button type="primary" link @click="viewAllPermissions(role)">
                      查看全部
                    </el-button>
                  </div>
                  <div class="permissions-list">
                    <el-tag
                      v-for="permission in getRoleMainPermissions(role.id)"
                      :key="permission.id"
                      size="small"
                      style="margin-right: 4px; margin-bottom: 4px;"
                    >
                      {{ permission.name }}
                    </el-tag>
                  </div>
                </div>
              </div>
              <div class="role-footer">
                <div class="role-time">
                  <el-icon><Clock /></el-icon>
                  <span>创建于 {{ role.createdAt }}</span>
                </div>
                <div class="role-time">
                  <el-icon><Refresh /></el-icon>
                  <span>更新于 {{ role.updatedAt }}</span>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <!-- 新增/编辑角色对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="角色类型">
          <el-radio-group v-model="roleForm.isSystem" :disabled="isEdit">
            <el-radio :value="0">自定义角色</el-radio>
            <el-radio :value="1">系统角色</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限配置" v-if="!isEdit || roleForm.isSystem === 0">
          <div class="permission-config">
            <div class="permission-header">
              <el-button type="primary" link @click="selectAllPermissions">
                全选
              </el-button>
              <el-button type="info" link @click="clearAllPermissions">
                清空
              </el-button>
            </div>
            <el-tree
              ref="permissionTreeRef"
              :data="permissionTree"
              :props="permissionProps"
              show-checkbox
              node-key="id"
              default-expand-all
              @check-change="handlePermissionChange"
            />
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

    <!-- 权限配置对话框 -->
    <el-dialog
      v-model="showPermissionDialog"
      title="配置权限"
      width="800px"
    >
      <div class="permission-container">
        <div class="permission-tabs">
          <el-tabs v-model="activePermissionTab">
            <el-tab-pane label="菜单权限" name="menu">
              <div class="permission-tree-container">
                <el-tree
                  ref="menuPermissionTreeRef"
                  :data="menuPermissions"
                  :props="permissionProps"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="功能权限" name="function">
              <div class="permission-tree-container">
                <el-tree
                  ref="functionPermissionTreeRef"
                  :data="functionPermissions"
                  :props="permissionProps"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                />
              </div>
            </el-tab-pane>
            <el-tab-pane label="数据权限" name="data">
              <div class="permission-tree-container">
                <el-tree
                  ref="dataPermissionTreeRef"
                  :data="dataPermissions"
                  :props="permissionProps"
                  show-checkbox
                  node-key="id"
                  default-expand-all
                />
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showPermissionDialog = false">取消</el-button>
          <el-button type="primary" @click="savePermissions" :loading="isSubmitting">
            保存权限
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 角色用户列表对话框 -->
    <el-dialog
      v-model="showRoleUsersDialog"
      :title="`角色用户 - ${currentRole?.name}`"
      width="700px"
    >
      <div class="role-users-container">
        <div class="users-header">
          <span>拥有此角色的用户（{{ roleUsers.length }}人）</span>
          <el-button type="primary" link @click="showAddUserDialog = true">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
        <el-table :data="roleUsers" style="width: 100%" v-loading="usersLoading">
          <el-table-column prop="realName" label="用户信息" min-width="150">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar 
                  :size="32" 
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
          <el-table-column label="组织架构" min-width="120">
            <template #default="{ row }">
              <el-tag type="info" size="small">
                {{ getOrganizationName(row.organizationId) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" link @click="removeUserFromRole(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Edit,
  Key,
  User,
  Clock,
  Refresh,
  MoreFilled,
  CopyDocument,
  Delete,
  Upload,
  Download
} from '@element-plus/icons-vue'

// 对话框状态
const showAddDialog = ref(false)
const showPermissionDialog = ref(false)
const showRoleUsersDialog = ref(false)
const showAddUserDialog = ref(false)
const isEdit = ref(false)
const isSubmitting = ref(false)
const usersLoading = ref(false)
const activePermissionTab = ref('menu')

// 当前操作的角色
const currentRole = ref(null)
const roleUsers = ref([])

// 表单数据
const roleForm = reactive({
  id: null,
  name: '',
  description: '',
  isSystem: 0,
  permissions: []
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 50, message: '角色名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 500, message: '角色描述长度不能超过 500 个字符', trigger: 'blur' }
  ]
}

// 模拟角色数据
const roleData = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有系统所有权限的超级管理员角色',
    isSystem: 1,
    permissions: ['*'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 2,
    name: '组织管理员',
    description: '管理组织架构和用户的管理员角色',
    isSystem: 1,
    permissions: ['org.manage', 'user.manage', 'role.view'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  },
  {
    id: 3,
    name: '活动管理员',
    description: '管理活动策划和执行的角色',
    isSystem: 0,
    permissions: ['activity.manage', 'task.manage', 'report.view'],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
  },
  {
    id: 4,
    name: '普通用户',
    description: '普通用户角色，拥有基础权限',
    isSystem: 0,
    permissions: ['activity.view', 'task.view', 'profile.manage'],
    createdAt: '2024-01-02',
    updatedAt: '2024-01-02'
  }
])

// 模拟权限数据
const permissionData = ref([
  // 菜单权限
  { id: 'menu.dashboard', name: '仪表板', type: 'menu', parent: null },
  { id: 'menu.activity', name: '活动管理', type: 'menu', parent: null },
  { id: 'menu.creation', name: '智能创作', type: 'menu', parent: null },
  { id: 'menu.report', name: '数据报告', type: 'menu', parent: null },
  { id: 'menu.knowledge', name: '知识库', type: 'menu', parent: null },
  { id: 'menu.admin', name: '系统管理', type: 'menu', parent: null },
  
  // 功能权限
  { id: 'activity.create', name: '创建活动', type: 'function', parent: 'menu.activity' },
  { id: 'activity.edit', name: '编辑活动', type: 'function', parent: 'menu.activity' },
  { id: 'activity.delete', name: '删除活动', type: 'function', parent: 'menu.activity' },
  { id: 'task.create', name: '创建任务', type: 'function', parent: 'menu.activity' },
  { id: 'task.edit', name: '编辑任务', type: 'function', parent: 'menu.activity' },
  { id: 'task.delete', name: '删除任务', type: 'function', parent: 'menu.activity' },
  
  // 数据权限
  { id: 'data.all', name: '所有数据', type: 'data', parent: null },
  { id: 'data.org', name: '组织数据', type: 'data', parent: null },
  { id: 'data.own', name: '个人数据', type: 'data', parent: null }
])

// 模拟用户数据
const userData = ref([
  {
    id: 1,
    organizationId: 1,
    username: 'admin',
    email: 'admin@company.com',
    realName: '超级管理员',
    avatarUrl: '',
    status: 1,
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    organizationId: 1,
    username: 'zhangsan',
    email: 'zhangsan@company.com',
    realName: '张三',
    avatarUrl: '',
    status: 1,
    createdAt: '2024-01-02'
  },
  {
    id: 3,
    organizationId: 2,
    username: 'lisi',
    email: 'lisi@company.com',
    realName: '李四',
    avatarUrl: '',
    status: 1,
    createdAt: '2024-01-03'
  }
])

// 模拟用户角色关联数据
const userRoleData = ref([
  { userId: 1, roleId: 1 },
  { userId: 2, roleId: 2 },
  { userId: 3, roleId: 3 }
])

// 计算属性
const roleList = computed(() => roleData.value)

const permissionTree = computed(() => {
  const tree = []
  const permissionMap = {}
  
  // 构建权限映射
  permissionData.value.forEach(permission => {
    permissionMap[permission.id] = {
      id: permission.id,
      label: permission.name,
      children: []
    }
  })
  
  // 构建树形结构
  permissionData.value.forEach(permission => {
    if (permission.parent && permissionMap[permission.parent]) {
      permissionMap[permission.parent].children.push(permissionMap[permission.id])
    } else if (!permission.parent) {
      tree.push(permissionMap[permission.id])
    }
  })
  
  return tree
})

const menuPermissions = computed(() => {
  return permissionData.value.filter(p => p.type === 'menu')
})

const functionPermissions = computed(() => {
  return permissionData.value.filter(p => p.type === 'function')
})

const dataPermissions = computed(() => {
  return permissionData.value.filter(p => p.type === 'data')
})

// 权限树配置
const permissionProps = {
  label: 'name',
  children: 'children'
}

// 方法
const handleRoleCommand = (command, role) => {
  switch (command) {
    case 'edit':
      handleEdit(role)
      break
    case 'permissions':
      handlePermissions(role)
      break
    case 'copy':
      handleCopy(role)
      break
    case 'users':
      handleUsers(role)
      break
    case 'delete':
      handleDelete(role)
      break
  }
}

const handleEdit = (role) => {
  currentRole.value = role
  isEdit.value = true
  
  // 填充表单数据
  Object.assign(roleForm, {
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.isSystem,
    permissions: role.permissions || []
  })
  
  showAddDialog.value = true
}

const handlePermissions = (role) => {
  currentRole.value = role
  showPermissionDialog.value = true
  
  // 设置当前权限
  setTimeout(() => {
    if (menuPermissionTreeRef.value) {
      menuPermissionTreeRef.value.setCheckedKeys(role.permissions || [])
    }
    if (functionPermissionTreeRef.value) {
      functionPermissionTreeRef.value.setCheckedKeys(role.permissions || [])
    }
    if (dataPermissionTreeRef.value) {
      dataPermissionTreeRef.value.setCheckedKeys(role.permissions || [])
    }
  }, 100)
}

const handleCopy = (role) => {
  // 复制角色逻辑
  const newRole = {
    ...role,
    id: Date.now(),
    name: `${role.name}_副本`,
    isSystem: 0,
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0]
  }
  
  roleData.value.push(newRole)
  ElMessage.success('角色复制成功')
}

const handleUsers = (role) => {
  currentRole.value = role
  loadRoleUsers(role.id)
  showRoleUsersDialog.value = true
}

const handleDelete = async (role) => {
  if (role.isSystem === 1) {
    ElMessage.warning('系统角色不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？此操作不可恢复。`,
      '删除角色',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 检查是否有用户在使用此角色
    const userCount = getRoleUserCount(role.id)
    if (userCount > 0) {
      ElMessage.warning(`该角色还有 ${userCount} 个用户在使用，不能删除`)
      return
    }
    
    // 模拟API调用
    const index = roleData.value.findIndex(r => r.id === role.id)
    if (index > -1) {
      roleData.value.splice(index, 1)
    }
    
    ElMessage.success('角色删除成功')
  } catch (error) {
    console.log('取消删除')
  }
}

const handleImportPermissions = () => {
  // 导入权限逻辑
  console.log('导入权限')
}

const handleExportPermissions = () => {
  // 导出权限逻辑
  console.log('导出权限')
}

const selectAllPermissions = () => {
  if (permissionTreeRef.value) {
    const allKeys = permissionData.value.map(p => p.id)
    permissionTreeRef.value.setCheckedKeys(allKeys)
  }
}

const clearAllPermissions = () => {
  if (permissionTreeRef.value) {
    permissionTreeRef.value.setCheckedKeys([])
  }
}

const handlePermissionChange = () => {
  // 权限变更处理
  console.log('权限变更')
}

const submitForm = async () => {
  try {
    const valid = await roleFormRef.value.validate()
    if (!valid) return
    
    isSubmitting.value = true
    
    // 模拟API调用
    setTimeout(() => {
      if (isEdit.value) {
        // 编辑模式
        const role = roleData.value.find(r => r.id === roleForm.id)
        if (role) {
          Object.assign(role, {
            name: roleForm.name,
            description: roleForm.description,
            updatedAt: new Date().toISOString().split('T')[0]
          })
        }
        ElMessage.success('角色信息更新成功')
      } else {
        // 新增模式
        const newRole = {
          id: Date.now(),
          name: roleForm.name,
          description: roleForm.description,
          isSystem: roleForm.isSystem,
          permissions: [],
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        }
        roleData.value.push(newRole)
        ElMessage.success('角色创建成功')
      }
      
      showAddDialog.value = false
      resetForm()
      isSubmitting.value = false
    }, 1000)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const savePermissions = async () => {
  try {
    isSubmitting.value = true
    
    // 获取所有选中的权限
    const menuPermissions = menuPermissionTreeRef.value?.getCheckedKeys() || []
    const functionPermissions = functionPermissionTreeRef.value?.getCheckedKeys() || []
    const dataPermissions = dataPermissionTreeRef.value?.getCheckedKeys() || []
    
    const allPermissions = [...menuPermissions, ...functionPermissions, ...dataPermissions]
    
    // 更新角色权限
    if (currentRole.value) {
      currentRole.value.permissions = allPermissions
      currentRole.value.updatedAt = new Date().toISOString().split('T')[0]
    }
    
    ElMessage.success('权限配置保存成功')
    showPermissionDialog.value = false
    isSubmitting.value = false
  } catch (error) {
    console.error('权限配置失败:', error)
    isSubmitting.value = false
  }
}

const loadRoleUsers = (roleId) => {
  usersLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    const userIds = userRoleData.value
      .filter(ur => ur.roleId === roleId)
      .map(ur => ur.userId)
    
    roleUsers.value = userData.value.filter(user => userIds.includes(user.id))
    usersLoading.value = false
  }, 500)
}

const removeUserFromRole = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要将用户 "${user.realName || user.username}" 从角色中移除吗？`,
      '移除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    const index = userRoleData.value.findIndex(ur => ur.userId === user.id && ur.roleId === currentRole.value.id)
    if (index > -1) {
      userRoleData.value.splice(index, 1)
    }
    
    ElMessage.success('用户移除成功')
    loadRoleUsers(currentRole.value.id)
  } catch (error) {
    console.log('取消移除')
  }
}

const viewAllPermissions = (role) => {
  handlePermissions(role)
}

const resetForm = () => {
  roleForm.id = null
  roleForm.name = ''
  roleForm.description = ''
  roleForm.isSystem = 0
  roleForm.permissions = []
  
  currentRole.value = null
  isEdit.value = false
}

// 辅助方法
const getRoleUserCount = (roleId) => {
  return userRoleData.value.filter(ur => ur.roleId === roleId).length
}

const getRolePermissionCount = (roleId) => {
  const role = roleData.value.find(r => r.id === roleId)
  return role?.permissions?.length || 0
}

const getRoleMainPermissions = (roleId) => {
  const role = roleData.value.find(r => r.id === roleId)
  if (!role?.permissions) return []
  
  return role.permissions.slice(0, 5).map(permissionId => {
    const permission = permissionData.value.find(p => p.id === permissionId)
    return permission || { id: permissionId, name: permissionId }
  })
}

const getOrganizationName = (orgId) => {
  // 简化版本，实际需要递归查找
  return orgId === 1 ? '总公司' : orgId === 2 ? '技术部' : '市场部'
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

// 生命周期
onMounted(() => {
  // 初始化数据
})
</script>

<style scoped>
.role-manage {
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

.content-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.role-container {
  padding: 20px 0;
}

.role-card {
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
}

.role-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.role-title {
  display: flex;
  align-items: center;
}

.role-title h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.role-content {
  padding: 16px 0;
}

.role-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 16px;
  min-height: 42px;
}

.role-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.role-permissions {
  border-top: 1px solid #e4e7ed;
  padding-top: 16px;
}

.permissions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.permissions-header span {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.permissions-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-footer {
  border-top: 1px solid #e4e7ed;
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.role-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #909399;
}

.permission-config {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  max-height: 300px;
  overflow-y: auto;
}

.permission-header {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 12px;
}

.permission-tree-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.role-users-container {
  padding: 20px 0;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 16px;
  font-weight: 500;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
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

/* 响应式布局 */
@media (max-width: 1200px) {
  .role-container .el-col {
    span: 12;
  }
}

@media (max-width: 768px) {
  .role-container .el-col {
    span: 24;
  }
  
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
</style>