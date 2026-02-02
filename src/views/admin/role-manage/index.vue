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
          <el-button type="primary" @click="handleAddRole">
            <el-icon><Plus /></el-icon>
            新增角色
          </el-button>
        </div>
      </div>
    </div>

    <!-- 角色列表 -->
    <el-card class="table-card">
      <el-table :data="roleList" style="width: 100%" v-loading="loading">
        <el-table-column prop="name" label="角色名称" min-width="120" />
        <el-table-column prop="code" label="角色编码" min-width="120" />
        <el-table-column prop="description" label="描述" min-width="200" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleEdit(row)" size="small">
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              <el-button type="warning" link @click="handlePermissions(row)" size="small">
                <el-icon><Key /></el-icon>
                权限
              </el-button>
              <el-dropdown @command="(command: string) => handleCommand(command, row)" placement="bottom-end">
                <el-button type="info" link size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="toggleStatus">
                      <el-icon><Switch /></el-icon>
                      {{ row.status === 1 ? '禁用' : '启用' }}
                    </el-dropdown-item>
                    <el-dropdown-item command="delete" style="color: #f56c6c;">
                      <el-icon><Delete /></el-icon>
                      删除角色
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 角色编辑对话框 -->
    <el-dialog
      v-model="showRoleDialog"
      :title="editingRole ? '编辑角色' : '新增角色'"
      width="500px"
      @close="resetRoleForm"
    >
      <el-form ref="roleFormRef" :model="roleForm" :rules="roleRules" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" placeholder="请输入角色编码" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input
            v-model="roleForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="roleForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showRoleDialog = false">取消</el-button>
          <el-button type="primary" @click="saveRole">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Key, MoreFilled, Switch, Delete } from '@element-plus/icons-vue'

// TypeScript interfaces
interface Role {
  id: number | null
  name: string
  code: string
  description: string
  status: number
  permissions?: Permission[]
}

interface Permission {
  id: number
  name: string
  code: string
  description: string
}

// 响应式数据
const loading = ref(false)
const roleList = ref<Role[]>([])
const showRoleDialog = ref(false)
const editingRole = ref<Role | null>(null)

// 表单数据
const roleForm = reactive<Role>({
  id: null,
  name: '',
  code: '',
  description: '',
  status: 1
})

// 表单验证规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[A-Z_]+$/, message: '角色编码必须为大写字母和下划线', trigger: 'blur' }
  ]
}

// 加载角色列表
const loadRoles = async (): Promise<void> => {
  loading.value = true
  try {
    // 模拟数据
    roleList.value = [
      {
        id: 1,
        name: '超级管理员',
        code: 'SUPER_ADMIN',
        description: '拥有系统所有权限',
        status: 1
      },
      {
        id: 2,
        name: '管理员',
        code: 'ADMIN',
        description: '拥有大部分管理权限',
        status: 1
      },
      {
        id: 3,
        name: '普通用户',
        code: 'USER',
        description: '普通用户权限',
        status: 1
      }
    ]
  } catch (error) {
    console.error('加载角色列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 新增角色
const handleAddRole = (): void => {
  editingRole.value = null
  resetRoleForm()
  showRoleDialog.value = true
}

// 编辑角色
const handleEdit = (role: Role): void => {
  editingRole.value = role
  Object.assign(roleForm, role)
  showRoleDialog.value = true
}

// 权限管理
const handlePermissions = (role: Role): void => {
  ElMessage.info(`权限管理功能开发中... 角色: ${role.name}`)
}

// 更多操作
const handleCommand = (command: string, role: Role): void => {
  switch (command) {
    case 'toggleStatus':
      toggleRoleStatus(role)
      break
    case 'delete':
      deleteRole(role)
      break
  }
}

// 切换角色状态
const toggleRoleStatus = async (role: Role): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要${role.status === 1 ? '禁用' : '启用'}角色 "${role.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    role.status = role.status === 1 ? 0 : 1
    ElMessage.success(`${role.status === 1 ? '启用' : '禁用'}成功`)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换角色状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除角色
const deleteRole = async (role: Role): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要删除角色 "${role.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    
    const index = roleList.value.findIndex(item => item.id === role.id)
    if (index !== -1) {
      roleList.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 保存角色
const saveRole = async (): Promise<void> => {
  try {
    if (editingRole.value) {
      // 编辑模式
      const index = roleList.value.findIndex(item => item.id === editingRole.value!.id)
      if (index !== -1) {
        roleList.value[index] = { ...roleForm }
      }
      ElMessage.success('更新成功')
    } else {
      // 新增模式
      const newRole: Role = {
        ...roleForm,
        id: Date.now()
      }
      roleList.value.push(newRole)
      ElMessage.success('创建成功')
    }
    
    showRoleDialog.value = false
    resetRoleForm()
  } catch (error) {
    console.error('保存角色失败:', error)
    ElMessage.error('保存失败')
  }
}

// 重置表单
const resetRoleForm = (): void => {
  Object.assign(roleForm, {
    id: null,
    name: '',
    code: '',
    description: '',
    status: 1
  })
}

// 生命周期
onMounted(() => {
  loadRoles()
})
</script>

<style scoped lang="scss">
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

.table-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.action-buttons .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

@media (max-width: 768px) {
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