<template>
  <div class="organization-manage">
    <!-- 页面标题和操作区 -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h2>组织架构管理</h2>
          <p class="subtitle">管理企业组织架构，支持多层级结构设置</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="showAddDialog = true">
            <el-icon><Plus /></el-icon>
            新增组织
          </el-button>
          <el-button @click="expandAll">展开全部</el-button>
          <el-button @click="collapseAll">收起全部</el-button>
        </div>
      </div>
    </div>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-row :gutter="20" align="middle">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索组织名称或编码"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="handleFilter">
            <el-option label="全部状态" value="" />
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterLevel" placeholder="层级筛选" clearable @change="handleFilter">
            <el-option label="全部层级" value="" />
            <el-option label="顶级组织" :value="1" />
            <el-option label="二级组织" :value="2" />
            <el-option label="三级组织" :value="3" />
            <el-option label="四级及以下" :value="4" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-button @click="resetFilter">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 组织树形表格 -->
    <el-card class="content-card">
      <div class="tree-container">
        <el-tree
          ref="orgTreeRef"
          :data="organizationTree"
          :props="treeProps"
          :expand-on-click-node="false"
          :default-expanded-keys="expandedKeys"
          node-key="id"
          highlight-current
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="org-node">
              <div class="node-info">
                <div class="org-name">
                  <el-icon v-if="data.level === 1" style="margin-right: 8px; color: #409eff;"><OfficeBuilding /></el-icon>
                  <el-icon v-else style="margin-right: 8px; color: #67c23a;"><Folder /></el-icon>
                  <span>{{ data.name }}</span>
                  <el-tag v-if="data.level === 1" type="primary" size="small" style="margin-left: 8px;">顶级</el-tag>
                  <el-tag v-if="data.status === 0" type="info" size="small" style="margin-left: 8px;">已禁用</el-tag>
                </div>
                <div class="org-meta">
                  <span class="meta-item">
                    <el-icon><Key /></el-icon>
                    编码: {{ data.code || '-' }}
                  </span>
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    负责人: {{ data.managerName || '-' }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Clock /></el-icon>
                    创建: {{ data.createdAt }}
                  </span>
                </div>
              </div>
              <div class="node-actions">
                <el-button type="primary" link @click.stop="handleAddChild(data)">
                  <el-icon><Plus /></el-icon>
                  添加子组织
                </el-button>
                <el-button type="warning" link @click.stop="handleEdit(data)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button 
                  :type="data.status === 1 ? 'danger' : 'success'" 
                  link 
                  @click.stop="handleToggleStatus(data)"
                >
                  <el-icon><Switch /></el-icon>
                  {{ data.status === 1 ? '禁用' : '启用' }}
                </el-button>
                <el-button type="info" link @click.stop="handleViewUsers(data)">
                  <el-icon><UserFilled /></el-icon>
                  查看成员
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
    </el-card>

    <!-- 新增/编辑组织对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="isEdit ? '编辑组织' : '新增组织'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="orgFormRef" :model="orgForm" :rules="orgRules" label-width="100px">
        <el-form-item label="上级组织" v-if="!isEdit || orgForm.parentId">
          <el-tree-select
            v-model="orgForm.parentId"
            :data="organizationOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="选择上级组织（不选则为顶级组织）"
            clearable
            check-strictly
          />
        </el-form-item>
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="orgForm.name" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织编码" prop="code">
          <el-input v-model="orgForm.code" placeholder="请输入组织编码（可选）" />
        </el-form-item>
        <el-form-item label="负责人" prop="managerId">
          <el-select
            v-model="orgForm.managerId"
            placeholder="选择组织负责人"
            clearable
            filterable
          >
            <el-option
              v-for="user in managerOptions"
              :key="user.id"
              :label="user.realName || user.username"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="orgForm.status">
            <el-radio :value="1">正常</el-radio>
            <el-radio :value="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="orgForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
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

    <!-- 组织成员对话框 -->
    <el-dialog
      v-model="showUsersDialog"
      :title="`组织成员 - ${currentOrg?.name}`"
      width="800px"
    >
      <div class="org-users-container">
        <div class="users-header">
          <span>成员列表（{{ orgUsers.length }}人）</span>
          <el-button type="primary" link @click="showAddUserDialog = true">
            <el-icon><Plus /></el-icon>
            添加成员
          </el-button>
        </div>
        <el-table :data="orgUsers" style="width: 100%" v-loading="usersLoading">
          <el-table-column prop="realName" label="姓名" min-width="120">
            <template #default="{ row }">
              <div class="user-info">
                <el-avatar :size="32" :src="row.avatarUrl" v-if="row.avatarUrl">
                  {{ (row.realName || row.username).charAt(0) }}
                </el-avatar>
                <div class="user-name">
                  <div class="name">{{ row.realName || row.username }}</div>
                  <div class="position">{{ row.position || '-' }}</div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="email" label="邮箱" min-width="180" />
          <el-table-column prop="phone" label="手机" min-width="120" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                {{ row.status === 1 ? '正常' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" link @click="removeUserFromOrg(row)">
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
  Search,
  Plus,
  Edit,
  Switch,
  User,
  UserFilled,
  Key,
  Clock,
  OfficeBuilding,
  Folder
} from '@element-plus/icons-vue'

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterLevel = ref('')

// 树形控件
const orgTreeRef = ref()
const expandedKeys = ref([])

// 对话框状态
const showAddDialog = ref(false)
const showUsersDialog = ref(false)
const showAddUserDialog = ref(false)
const isEdit = ref(false)
const isSubmitting = ref(false)
const usersLoading = ref(false)

// 当前操作的数据
const currentOrg = ref(null)
const currentNode = ref(null)

// 表单数据
const orgForm = reactive({
  id: null,
  parentId: null,
  name: '',
  code: '',
  managerId: null,
  status: 1,
  remark: ''
})

// 表单验证规则
const orgRules = {
  name: [
    { required: true, message: '请输入组织名称', trigger: 'blur' },
    { min: 2, max: 50, message: '组织名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { max: 50, message: '组织编码长度不能超过 50 个字符', trigger: 'blur' }
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
    code: 'HQ',
    level: 1,
    managerId: 1,
    managerName: '张三',
    status: 1,
    createdAt: '2024-01-01',
    children: [
      {
        id: 2,
        name: '技术部',
        parentId: 1,
        code: 'TECH',
        level: 2,
        managerId: 2,
        managerName: '李四',
        status: 1,
        createdAt: '2024-01-02',
        children: [
          {
            id: 3,
            name: '前端开发组',
            parentId: 2,
            code: 'FRONTEND',
            level: 3,
            managerId: 3,
            managerName: '王五',
            status: 1,
            createdAt: '2024-01-03',
            children: []
          },
          {
            id: 4,
            name: '后端开发组',
            parentId: 2,
            code: 'BACKEND',
            level: 3,
            managerId: 4,
            managerName: '赵六',
            status: 1,
            createdAt: '2024-01-04',
            children: []
          }
        ]
      },
      {
        id: 5,
        name: '市场部',
        parentId: 1,
        code: 'MARKET',
        level: 2,
        managerId: 5,
        managerName: '孙七',
        status: 1,
        createdAt: '2024-01-05',
        children: []
      }
    ]
  }
])

// 模拟用户数据
const userList = ref([
  {
    id: 1,
    organizationId: 1,
    username: 'zhangsan',
    email: 'zhangsan@company.com',
    realName: '张三',
    avatarUrl: '',
    phone: '13800138000',
    position: '总经理',
    status: 1,
    createdAt: '2024-01-01'
  },
  {
    id: 2,
    organizationId: 2,
    username: 'lisi',
    email: 'lisi@company.com',
    realName: '李四',
    avatarUrl: '',
    phone: '13800138001',
    position: '技术总监',
    status: 1,
    createdAt: '2024-01-02'
  },
  {
    id: 3,
    organizationId: 3,
    username: 'wangwu',
    email: 'wangwu@company.com',
    realName: '王五',
    avatarUrl: '',
    phone: '13800138002',
    position: '前端工程师',
    status: 1,
    createdAt: '2024-01-03'
  }
])

// 组织树数据
const organizationTree = computed(() => {
  // 这里可以根据搜索条件过滤数据
  if (!searchKeyword.value && filterStatus.value === '' && filterLevel.value === '') {
    return organizationList.value
  }
  
  // 简单的过滤逻辑
  return filterOrganizations(organizationList.value)
})

// 组织选项（用于选择父组织）
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

// 负责人选项
const managerOptions = computed(() => {
  return userList.value.filter(user => user.status === 1)
})

// 组织用户列表
const orgUsers = ref([])

// 树形控件配置
const treeProps = {
  label: 'name',
  children: 'children',
  class: (data, node) => {
    return node.level === 1 ? 'top-level' : ''
  }
}

// 方法
const handleSearch = () => {
  // 搜索逻辑
  console.log('搜索:', searchKeyword.value)
}

const handleFilter = () => {
  // 筛选逻辑
  console.log('筛选状态:', filterStatus.value, '层级:', filterLevel.value)
}

const resetFilter = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterLevel.value = ''
}

const filterOrganizations = (orgs) => {
  return orgs.filter(org => {
    let match = true
    
    if (searchKeyword.value) {
      match = match && (org.name.includes(searchKeyword.value) || org.code?.includes(searchKeyword.value))
    }
    
    if (filterStatus.value !== '') {
      match = match && org.status === filterStatus.value
    }
    
    if (filterLevel.value !== '') {
      match = match && org.level === filterLevel.value
    }
    
    return match
  }).map(org => ({
    ...org,
    children: org.children ? filterOrganizations(org.children) : []
  }))
}

const expandAll = () => {
  const keys = []
  const getAllKeys = (nodes) => {
    nodes.forEach(node => {
      keys.push(node.id)
      if (node.children && node.children.length > 0) {
        getAllKeys(node.children)
      }
    })
  }
  getAllKeys(organizationList.value)
  expandedKeys.value = keys
}

const collapseAll = () => {
  expandedKeys.value = []
}

const handleNodeClick = (data, node) => {
  console.log('点击节点:', data, node)
}

const handleAddChild = (parentOrg) => {
  currentOrg.value = parentOrg
  orgForm.parentId = parentOrg.id
  isEdit.value = false
  showAddDialog.value = true
}

const handleEdit = (org) => {
  currentOrg.value = org
  currentNode.value = org
  
  // 填充表单数据
  orgForm.id = org.id
  orgForm.parentId = org.parentId
  orgForm.name = org.name
  orgForm.code = org.code
  orgForm.managerId = org.managerId
  orgForm.status = org.status
  orgForm.remark = org.remark || ''
  
  isEdit.value = true
  showAddDialog.value = true
}

const handleToggleStatus = async (org) => {
  try {
    await ElMessageBox.confirm(
      `确定要${org.status === 1 ? '禁用' : '启用'}组织 "${org.name}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    org.status = org.status === 1 ? 0 : 1
    ElMessage.success(`${org.status === 1 ? '启用' : '禁用'}成功`)
  } catch (error) {
    console.log('取消操作')
  }
}

const handleViewUsers = (org) => {
  currentOrg.value = org
  loadOrgUsers(org.id)
  showUsersDialog.value = true
}

const loadOrgUsers = (orgId) => {
  usersLoading.value = true
  
  // 模拟API调用
  setTimeout(() => {
    orgUsers.value = userList.value.filter(user => user.organizationId === orgId)
    usersLoading.value = false
  }, 500)
}

const removeUserFromOrg = async (user) => {
  try {
    await ElMessageBox.confirm(
      `确定要将用户 "${user.realName || user.username}" 从组织中移除吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 模拟API调用
    const index = userList.value.findIndex(u => u.id === user.id)
    if (index > -1) {
      userList.value[index].organizationId = null
    }
    
    ElMessage.success('移除成功')
    loadOrgUsers(currentOrg.value.id)
  } catch (error) {
    console.log('取消操作')
  }
}

const submitForm = async () => {
  try {
    const valid = await orgFormRef.value.validate()
    if (!valid) return
    
    isSubmitting.value = true
    
    // 模拟API调用
    setTimeout(() => {
      if (isEdit.value) {
        // 编辑模式
        const org = findOrganizationById(organizationList.value, orgForm.id)
        if (org) {
          Object.assign(org, {
            name: orgForm.name,
            code: orgForm.code,
            managerId: orgForm.managerId,
            managerName: managerOptions.value.find(m => m.id === orgForm.managerId)?.realName,
            status: orgForm.status,
            remark: orgForm.remark
          })
        }
        ElMessage.success('组织信息更新成功')
      } else {
        // 新增模式
        const newOrg = {
          id: Date.now(),
          name: orgForm.name,
          parentId: orgForm.parentId,
          code: orgForm.code,
          level: orgForm.parentId ? getOrganizationLevel(orgForm.parentId) + 1 : 1,
          managerId: orgForm.managerId,
          managerName: managerOptions.value.find(m => m.id === orgForm.managerId)?.realName,
          status: orgForm.status,
          remark: orgForm.remark,
          createdAt: new Date().toISOString().split('T')[0],
          children: []
        }
        
        if (orgForm.parentId) {
          const parent = findOrganizationById(organizationList.value, orgForm.parentId)
          if (parent) {
            parent.children.push(newOrg)
          }
        } else {
          organizationList.value.push(newOrg)
        }
        
        ElMessage.success('组织创建成功')
      }
      
      showAddDialog.value = false
      resetForm()
      isSubmitting.value = false
    }, 1000)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

const resetForm = () => {
  orgForm.id = null
  orgForm.parentId = null
  orgForm.name = ''
  orgForm.code = ''
  orgForm.managerId = null
  orgForm.status = 1
  orgForm.remark = ''
  
  currentOrg.value = null
  currentNode.value = null
  isEdit.value = false
}

const findOrganizationById = (orgs, id) => {
  for (const org of orgs) {
    if (org.id === id) return org
    if (org.children && org.children.length > 0) {
      const found = findOrganizationById(org.children, id)
      if (found) return found
    }
  }
  return null
}

const getOrganizationLevel = (parentId) => {
  const parent = findOrganizationById(organizationList.value, parentId)
  return parent ? parent.level : 0
}

// 生命周期
onMounted(() => {
  // 默认展开顶级组织
  expandedKeys.value = [1]
})
</script>

<style scoped>
.organization-manage {
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

.tree-container {
  padding: 20px 0;
}

.org-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 0;
}

.node-info {
  flex: 1;
}

.org-name {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.org-meta {
  display: flex;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.node-actions {
  display: flex;
  gap: 8px;
}

.node-actions .el-button {
  padding: 4px 8px;
  font-size: 12px;
}

.org-users-container {
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

.user-name {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-name .name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.user-name .position {
  font-size: 12px;
  color: #909399;
}

/* 树形控件样式优化 */
:deep(.el-tree-node__content) {
  height: auto;
  padding: 4px 8px;
}

:deep(.el-tree-node__expand-icon) {
  font-size: 16px;
  margin-right: 8px;
}

:deep(.el-tree--highlight-current .el-tree-node.is-current > .el-tree-node__content) {
  background-color: #f0f9ff;
}

:deep(.top-level > .el-tree-node__content) {
  background-color: #f5f7fa;
  font-weight: 600;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .org-node {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .node-actions {
    flex-wrap: wrap;
  }
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
  
  .org-meta {
    flex-direction: column;
    gap: 8px;
  }
}
</style>