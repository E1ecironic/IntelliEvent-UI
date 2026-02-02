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
          <el-button type="primary" @click="showAddTopLevelDialog">
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
        <el-col :span="6">
          <el-input
            v-model="searchName"
            placeholder="搜索组织名称"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-input
            v-model="searchCode"
            placeholder="搜索组织编码"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable>
            <el-option label="全部状态" value="" />
            <el-option label="正常" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-col>

        <el-col :span="4">
          <el-button type="primary" @click="handleFilter">搜索</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 组织架构树形展示 -->
    <el-card class="content-card">
      <div class="tree-container">
        <el-tree
          ref="treeRef"
          :data="organizationList"
          :props="treeProps"
          :expand-on-click-node="false"
          :highlight-current="true"
          :filter-node-method="filterNode"
          node-key="id"
          @node-click="handleNodeClick"
        >
          <template #default="{ data }">
            <div class="org-node">
              <div class="node-info">
                <div class="org-name">
                  <el-icon style="margin-right: 8px;">
                    <OfficeBuilding v-if="data.level === 1" />
                    <Folder v-else />
                  </el-icon>
                  {{ data.name }}
                  <el-tag
                    v-if="data.status === 0"
                    type="info"
                    size="small"
                    style="margin-left: 8px;"
                  >
                    已禁用
                  </el-tag>
                </div>
                <div class="org-meta">
                  <span class="meta-item">
                    <el-icon><Document /></el-icon>
                    编码: {{ data.code }}
                  </span>
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    负责人: {{ data.managerName || '未设置' }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Phone /></el-icon>
                    电话: {{ data.connectPhone || '未设置' }}
                  </span>

                </div>
              </div>
              <div class="node-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click.stop="showAddChildDialog(data)"
                >
                  <el-icon><Plus /></el-icon>
                  添加下级
                </el-button>
                <el-button
                  size="small"
                  @click.stop="showEditDialog(data)"
                >
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  size="small"
                  @click.stop="showUsersDialog(data)"
                >
                  <el-icon><User /></el-icon>
                  成员
                </el-button>
                <el-button
                  :type="data.status === 1 ? 'danger' : 'success'"
                  size="small"
                  @click.stop="toggleStatus(data)"
                >
                  <el-icon><SwitchButton /></el-icon>
                  {{ data.status === 1 ? '禁用' : '启用' }}
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  @click.stop="deleteOrganization(data)"
                >
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>

      <!-- 分页控件 -->
      <div class="pagination-container" v-if="totalCount > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalCount"
          :page-sizes="config.performance.pagination.pageSizes"
          :layout="config.performance.pagination.layout"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑组织对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingOrg ? '编辑组织' : (isAddingSubordinate ? '添加下级组织' : '新增组织')"
      :width="config.dimensions.dialog.width.medium"
      @close="resetForm"
    >
      <el-form ref="orgFormRef" :model="orgForm" :rules="orgRules" label-width="100px">
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="orgForm.name" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织编码" prop="code">
          <el-input v-model="orgForm.code" placeholder="请输入组织编码" />
        </el-form-item>
        <el-form-item v-if="showParentOrgSelect" label="上级组织" prop="parentId">
          <el-tree-select
            v-model="orgForm.parentId"
            :data="organizationList"
            :props="treeProps"
            placeholder="请选择上级组织"
            clearable
            :disabled="isAddingSubordinate"
            check-strictly
          />
          <div v-if="isAddingSubordinate" style="color: #909399; font-size: 12px; margin-top: 5px;">
            提示：正在添加下级组织，上级组织已自动填充且不可修改
          </div>
        </el-form-item>
        <el-form-item label="负责人" prop="managerName">
          <el-input v-model="orgForm.managerName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="connectPhone">
          <el-input v-model="orgForm.connectPhone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="orgForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="orgForm.status">
            <el-radio :label="1">正常</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="orgForm.remark"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAddDialog = false">取消</el-button>
          <el-button type="primary" @click="saveOrganization">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 组织成员管理对话框 -->
    <el-dialog
      v-model="showUsersDialogFlag"
      title="组织成员管理"
      width="800px"
      @close="currentOrgUsers = []"
    >
      <div class="org-users-container">
        <div class="users-header">
          <span>{{ currentOrg?.name }} - 成员列表</span>
          <el-button type="primary" size="small" @click="showAddUserDialog = true">
            <el-icon><Plus /></el-icon>
            添加成员
          </el-button>
        </div>
        <el-table :data="currentOrgUsers" style="width: 100%">
          <el-table-column prop="userName" label="姓名" width="120" />
          <el-table-column prop="position" label="职位" width="150" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="phone" label="电话" width="120" />
          <el-table-column label="操作" width="100" fixed="right">
            <template #default="{ row }">
              <el-button type="danger" size="small" @click="removeUserFromOrg(row)">
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  OfficeBuilding,
  Folder,
  Document,
  User as UserIcon,
  Phone,
  Edit,
  SwitchButton,
  Delete
} from '@element-plus/icons-vue'
import { organizationApi } from '@/api'
import config from './config'
import type { Organization } from '@/views/admin/organization-manage/config'
import type { User } from '@/views/admin/user-manage/config'


// 响应式数据
const loading = ref<boolean>(false)
const organizationList = ref<Organization[]>([])
const allOrganizationData = ref<Organization[]>([]) // 存储所有数据用于前端搜索
const searchName = ref<string>('')
const searchCode = ref<string>('')
const filterStatus = ref<number | undefined>(undefined)
const showAddDialog = ref<boolean>(false)
const showUsersDialogFlag = ref<boolean>(false)
const showAddUserDialog = ref<boolean>(false)
const editingOrg = ref<Organization | null>(null)
const currentOrg = ref<Organization | null>(null)
const currentOrgUsers = ref<User[]>([])
const treeRef = ref<any>(null)

// 分页数据
const currentPage = ref<number>(1)
const pageSize = ref<number>(20)
const totalCount = ref<number>(0)

// 计算属性 - 是否正在添加下级组织
const isAddingSubordinate = computed<boolean>(() => {
  return editingOrg.value === null && orgForm.parentId !== null
})

// 计算属性 - 判断是否显示上级组织选择框
const showParentOrgSelect = computed<boolean>(() => {
  // 编辑模式或添加下级组织时显示上级组织选择框
  return editingOrg.value !== null || isAddingSubordinate.value
})

// 表单数据 - 使用与后端相同的字段名
const orgForm = reactive<Organization>({
  id: undefined,
  name: '',
  code: '',
  parentId: null,
  managerName: '',
  connectPhone: '',
  email: '',
  status: undefined,
  remark: ''
})

// 表单验证规则
const orgRules = {
  name: [
    { required: true, message: '请输入组织名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入组织编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[A-Za-z0-9_-]+$/, message: '编码只能包含字母、数字、下划线和短横线', trigger: 'blur' }
  ]
}

// 树形控件配置 - 使用后端字段名
const treeProps = {
  children: 'children',
  label: 'name',      // 使用后端字段名 name
  value: 'id'         // 使用后端字段名 id
}

// 方法
const loadOrganizations = async (pageNum: number = 1, pageSizeParam: number = 100): Promise<void> => {
  loading.value = true
  try {
    console.log('加载组织数据，参数:', { pageNum, pageSize: pageSizeParam, searchName: searchName.value, searchCode: searchCode.value, filterStatus: filterStatus.value })
    
    // 使用分页参数和搜索条件获取数据（后端现在支持搜索和筛选）
    const response = await organizationApi.getOrganizationPage(pageNum, pageSizeParam, searchName.value, null, filterStatus.value, searchCode.value)
    
    if (response.code === 200 && response.data) {
      console.log('组织数据加载成功:', response.data)
      // 处理分页数据 - 后端现在返回树形结构数据
      const { records, total, current, size } = response.data
      
      // 后端已经返回树形结构数据，直接使用，无需转换
      const treeData: Organization[] = records || []
      
      // 存储所有数据用于前端搜索
      if (pageNum === 1) {
        allOrganizationData.value = treeData
      } else {
        allOrganizationData.value = [...allOrganizationData.value, ...treeData]
      }
      
      // 如果是第一页，直接替换数据
      if (pageNum === 1) {
        organizationList.value = treeData
        totalCount.value = total || 0
        currentPage.value = current || 1
        pageSize.value = size || pageSize.value
      } else {
        // 如果是后续页面，追加数据（适用于树形结构的懒加载）
        organizationList.value = [...organizationList.value, ...treeData]
      }
      
      // 查询成功，不显示提示消息
    } else {
      ElMessage.error(response.message || '加载组织架构数据失败')
    }
  } catch (error) {
     const err = error as Error & {
        response?: {
            data?: any;
            status?: number;
        }
    };
    
    console.error('加载组织架构失败:', err);
    console.error('错误详情:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
    });
    ElMessage.error('加载组织架构失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 筛选处理
const handleFilter = (): void => {
  // 后端支持搜索参数，重新加载数据
  currentPage.value = 1  // 重置到第一页
  loadOrganizations(1, pageSize.value)
}

// 重置筛选
const resetFilter = (): void => {
  searchName.value = ''
  searchCode.value = ''
  filterStatus.value = undefined
  handleFilter()
}

// 树节点过滤
const filterNode = (value: string, data: Organization): boolean => {
  if (!value) return true
  return data.name?.toLowerCase().includes(value.toLowerCase()) ?? false
}
// 节点点击处理
const handleNodeClick = (data: Organization): void => {
  console.log('点击节点:', data)
}

// 声明 Tree 节点的类型
interface TreeNode {
  id: number | string
  label: string
  children?: TreeNode[]
  expanded?: boolean
  isLeaf?: boolean
  level?: number
  parent?: TreeNode | null
  // Tree 节点内部方法
  expand: () => void
  collapse: () => void
}

// 展开全部
const expandAll = (): void => {
  const nodes = treeRef.value?.store._getAllNodes() || []
  nodes.forEach((node: TreeNode) => {
    node.expand()
  })
}

// 收起全部
const collapseAll = (): void => {
  const nodes = treeRef.value?.store._getAllNodes() || []
  nodes.forEach((node: TreeNode) => {
    node.collapse()
  })
}

// 显示添加子组织对话框
const showAddChildDialog = (parentOrg: Organization): void => {
  editingOrg.value = null
  // 重置表单数据
  Object.assign(orgForm, {
    name: '',
    code: '',
    parentId: parentOrg.id,  // 使用后端字段名 id
    managerName: '',
    connectPhone: '',
    email: '',
    status: 1,
    remark: ''
  })
  showAddDialog.value = true
}

// 显示添加顶级组织对话框
const showAddTopLevelDialog = (): void => {
  editingOrg.value = null
  // 重置表单数据，parentId 为 null 表示顶级组织
  Object.assign(orgForm, {
    name: '',
    code: '',
    parentId: null,  // 顶级组织，无上级
    managerName: '',
    connectPhone: '',
    email: '',
    status: 1,
    remark: ''
  })
  showAddDialog.value = true
}

// 显示编辑对话框
const showEditDialog = (org: Organization): void => {
  editingOrg.value = org
  // 直接使用后端字段名，不再做映射
  Object.assign(orgForm, {
    id: org.id,
    name: org.name,
    code: org.code,
    parentId: org.parentId,
    managerName: org.managerName || '',
    connectPhone: org.connectPhone || '',
    email: org.email || '',
    status: org.status,
    remark: org.remark || ''
  })
  showAddDialog.value = true
}

// 显示成员对话框
const showUsersDialog = async (org: Organization): Promise<void> => {
  currentOrg.value = org
  showUsersDialogFlag.value = true
  await loadOrgUsers(org.id!)
}

// 加载组织成员
const loadOrgUsers = async (orgId: number): Promise<void> => {
  try {
    const response = await organizationApi.getOrgUsers(orgId)
    if (response.code === 200) {
      currentOrgUsers.value = response.data || []
    } else {
      ElMessage.error(response.message || '加载组织成员失败')
    }
  } catch (error) {
    console.error('加载组织成员失败:', error)
    ElMessage.error('加载组织成员失败')
  }
}

// 移除用户
const removeUserFromOrg = async (user: User): Promise<void> => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 "${user.userName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    if (!user.id) {
      ElMessage.error('用户 ID 不存在')
      return
    }
    const response = await organizationApi.removeOrgUser(currentOrg.value!.id!, user.id)
    if (response.code === 200) {
      ElMessage.success('移除成功')
      await loadOrgUsers(currentOrg.value!.id!)
    } else {
      ElMessage.error(response.message || '移除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('移除成员失败:', error)
      ElMessage.error('移除失败')
    }
  }
}

// 递归更新子组织状态
const updateChildOrganizations = (org: Organization, newStatus: number): void => {
  if (org.children && org.children.length > 0) {
    org.children.forEach(child => {
      child.status = newStatus
      // 递归更新子组织的子组织
      updateChildOrganizations(child, newStatus)
    })
  }
}

// 切换状态
const toggleStatus = async (org: Organization): Promise<void> => {
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
    
    const newStatus: number = org.status === 1 ? 0 : 1
    const response = await organizationApi.updateOrganization({
      id: org.id!,
      status: newStatus
    })
    
    if (response.code === 200) {
      org.status = newStatus
      // 递归更新所有子组织的状态
      updateChildOrganizations(org, newStatus)
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
      
      // 如果有子组织，显示提示信息
      if (org.children && org.children.length > 0) {
        ElMessage.info(`已同步${newStatus === 1 ? '启用' : '禁用'}了 ${org.children.length} 个子组织`)
      }
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('切换状态失败:', error)
      ElMessage.error('操作失败')
    }
  }
}

// 删除组织
const deleteOrganization = async (org: Organization): Promise<void> => {
  try {
    // 计算子组织数量
    const getChildOrgCount = (node: Organization): number => {
      let count: number = 0
      if (node.children && node.children.length > 0) {
        count += node.children.length
        node.children.forEach(child => {
          count += getChildOrgCount(child)
        })
      }
      return count
    }
    
    const childCount: number = getChildOrgCount(org)
    const deleteWarning: string = childCount > 0 
      ? `确定要删除组织 "${org.name}" 吗？\n\n⚠️ 警告：此操作将同时删除该组织下的 ${childCount} 个子组织，此操作不可恢复！`
      : `确定要删除组织 "${org.name}" 吗？\n\n⚠️ 警告：此操作不可恢复！`
    
    await ElMessageBox.confirm(
      deleteWarning,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        dangerouslyUseHTMLString: true
      }
    )
    
    const response = await organizationApi.deleteOrganization(org.id!)
    
    if (response.code === 200) {
      ElMessage.success('删除成功')
      // 重新加载数据
      loadOrganizations(currentPage.value, pageSize.value)
    } else {
      ElMessage.error(response.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除组织失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 保存组织
const saveOrganization = async (): Promise<void> => {
  try {
    // 直接使用前端表单数据，字段名已与后端保持一致
    const submitData: Partial<Organization> = {
      ...orgForm
    }
    
    console.log('提交的组织数据:', submitData)
    
    const id = editingOrg.value?.id
    const response = id
      ? await organizationApi.updateOrganization({ ...submitData, id })
      : await organizationApi.createOrganization(submitData)
    
    if (response.code === 200) {
      ElMessage.success(editingOrg.value ? '更新成功' : '创建成功')
      showAddDialog.value = false
      resetForm()
      loadOrganizations(currentPage.value, pageSize.value)
    } else {
      ElMessage.error(response.message || '操作失败')
    }
  } catch (error) {
    console.error('保存组织失败:', error)
    ElMessage.error('保存失败')
  }
}

// 重置表单
const resetForm = (): void => {
  editingOrg.value = null
  Object.assign(orgForm, {
    id: null,
    name: '',
    code: '',
    parentId: null,
    managerName: '',
    connectPhone: '',
    email: '',
    status: 1,
    remark: ''
  })
}

// 分页处理
const handlePageChange = (page: number): void => {
  currentPage.value = page
  loadOrganizations(page, pageSize.value)
}

const handlePageSizeChange = (size: number): void => {
  pageSize.value = size
  currentPage.value = 1
  loadOrganizations(1, size)
}

// 生命周期
onMounted((): void => {
  loadOrganizations() // 加载组织架构数据
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

/* 分页样式 */
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
}
</style>