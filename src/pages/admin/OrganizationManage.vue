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
          node-key="orgId"
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="org-node">
              <div class="node-info">
                <div class="org-name">
                  <el-icon style="margin-right: 8px;">
                    <OfficeBuilding v-if="data.level === 1" />
                    <Folder v-else />
                  </el-icon>
                  {{ data.orgName }}
                  <el-tag
                    v-if="data.level === 1"
                    type="success"
                    size="small"
                    style="margin-left: 8px;"
                  >
                    顶级
                  </el-tag>
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
                    编码: {{ data.orgCode }}
                  </span>
                  <span class="meta-item">
                    <el-icon><User /></el-icon>
                    负责人: {{ data.leaderName || '未设置' }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Phone /></el-icon>
                    电话: {{ data.phone || '未设置' }}
                  </span>
                  <span class="meta-item">
                    <el-icon><Location /></el-icon>
                    层级: {{ data.level }}级
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
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑组织对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingOrg ? '编辑组织' : '新增组织'"
      width="600px"
      @close="resetForm"
    >
      <el-form ref="orgFormRef" :model="orgForm" :rules="orgRules" label-width="100px">
        <el-form-item label="组织名称" prop="orgName">
          <el-input v-model="orgForm.orgName" placeholder="请输入组织名称" />
        </el-form-item>
        <el-form-item label="组织编码" prop="orgCode">
          <el-input v-model="orgForm.orgCode" placeholder="请输入组织编码" />
        </el-form-item>
        <el-form-item label="上级组织" prop="parentId">
          <el-tree-select
            v-model="orgForm.parentId"
            :data="organizationList"
            :props="treeProps"
            placeholder="请选择上级组织"
            clearable
          />
        </el-form-item>
        <el-form-item label="负责人" prop="leaderName">
          <el-input v-model="orgForm.leaderName" placeholder="请输入负责人姓名" />
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="orgForm.phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="orgForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="orgForm.sortOrder" :min="0" :max="999" />
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
          <span>{{ currentOrg?.orgName }} - 成员列表</span>
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

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Search,
  OfficeBuilding,
  Folder,
  Document,
  User,
  Phone,
  Location,
  Edit,
  SwitchButton
} from '@element-plus/icons-vue'
import organizationApi from '../../api/organization'

// 响应式数据
const loading = ref(false)
const organizationList = ref([])
const allOrganizationData = ref([]) // 存储所有数据用于前端搜索
const searchKeyword = ref('')
const filterStatus = ref('')
const filterLevel = ref('')
const showAddDialog = ref(false)
const showUsersDialogFlag = ref(false)
const showAddUserDialog = ref(false)
const editingOrg = ref(null)
const currentOrg = ref(null)
const currentOrgUsers = ref([])
const treeRef = ref(null)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(20)
const totalCount = ref(0)

// 表单数据
const orgForm = reactive({
  orgName: '',
  orgCode: '',
  parentId: null,
  leaderName: '',
  phone: '',
  email: '',
  sortOrder: 0,
  status: 1,
  remark: ''
})

// 表单验证规则
const orgRules = {
  orgName: [
    { required: true, message: '请输入组织名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  orgCode: [
    { required: true, message: '请输入组织编码', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 树形控件配置
const treeProps = {
  children: 'children',
  label: 'orgName',
  value: 'orgId'
}

// 方法
const loadOrganizations = async (pageNum = 1, pageSizeParam = 100) => {
  loading.value = true
  try {
    console.log('加载组织数据，参数:', { pageNum, pageSize: pageSizeParam })
    
    // 使用基本分页参数获取数据（后端不支持搜索参数）
    const response = await organizationApi.getOrganizationPage(pageNum, pageSizeParam)
    
    if (response.code === 200 && response.data) {
              console.log('组织数据加载成功:', response.data)
              // 处理分页数据
              const { records, total, current, size } = response.data
              
              // 转换后端数据为树形结构（适配实际的API字段名）
              const treeData = buildTreeStructure(records || [])
              
              // 存储所有数据用于前端搜索
              if (pageNum === 1) {
                allOrganizationData.value = treeData
              } else {
                allOrganizationData.value = [...allOrganizationData.value, ...treeData]
              }
              
              // 如果是第一页，直接替换数据
              if (pageNum === 1) {
                organizationList.value = treeData
                totalCount.value = total || records?.length || 0
                currentPage.value = current || 1
                pageSize.value = size || pageSize.value
              } else {
                // 如果是后续页面，追加数据（适用于树形结构的懒加载）
                organizationList.value = [...organizationList.value, ...treeData]
              }
              
              ElMessage.success(`组织架构数据加载成功，共${total || records?.length || 0}条记录`)
            } else {
              ElMessage.error(response.message || '加载组织架构数据失败')
            }
  } catch (error) {
    console.error('加载组织架构失败:', error)
    console.error('错误详情:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    })
    ElMessage.error('加载组织架构失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 构建树形结构（适配实际的API字段名）
const buildTreeStructure = (data) => {
  const map = {}
  const result = []
  
  // 创建映射（使用实际的字段名）
  data.forEach(item => {
    map[item.id] = { 
      ...item, 
      // 映射字段名以适配前端组件
      orgId: item.id,
      orgName: item.name,
      orgCode: item.code,
      leaderName: item.managerId ? `用户${item.managerId}` : '未设置',
      children: [] 
    }
  })
  
  // 构建树形结构
  data.forEach(item => {
    const node = map[item.id]
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(node)
    } else if (!item.parentId) {
      result.push(node)
    }
  })
  
  return result
}

// 前端过滤树形数据
const filterTreeData = () => {
  if (!searchKeyword.value) {
    organizationList.value = allOrganizationData.value
    return
  }
  
  const keyword = searchKeyword.value.toLowerCase()
  
  const filterNode = (node) => {
    // 检查当前节点是否匹配
    const matchCurrent = node.orgName.toLowerCase().includes(keyword) || 
                        node.orgCode.toLowerCase().includes(keyword)
    
    // 检查子节点是否匹配
    const matchChildren = node.children && node.children.some(child => filterNode(child))
    
    // 如果当前节点或子节点匹配，则保留该节点
    if (matchCurrent || matchChildren) {
      return {
        ...node,
        children: node.children ? node.children.filter(child => filterNode(child)) : []
      }
    }
    
    return null
  }
  
  // 过滤数据
  const filteredData = allOrganizationData.value
    .map(node => filterNode(node))
    .filter(node => node !== null)
  
  organizationList.value = filteredData
}

// 搜索处理
const handleSearch = () => {
  console.log('搜索关键词:', searchKeyword.value)
  // 由于后端不支持搜索参数，使用前端过滤
  if (searchKeyword.value) {
    filterTreeData()
  } else {
    // 如果搜索词为空，重新加载所有数据
    loadOrganizations(1, pageSize.value)
  }
}

// 筛选处理
const handleFilter = () => {
  // 由于后端不支持筛选参数，重新加载数据
  loadOrganizations(1, pageSize.value)
}

// 重置筛选
const resetFilter = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterLevel.value = ''
  handleFilter()
}

// 树节点过滤
const filterNode = (value, data) => {
  if (!value) return true
  return data.orgName.toLowerCase().includes(value.toLowerCase()) ||
         data.orgCode.toLowerCase().includes(value.toLowerCase())
}

// 节点点击处理
const handleNodeClick = (data) => {
  console.log('点击节点:', data)
}

// 展开全部
const expandAll = () => {
  const nodes = treeRef.value?.store._getAllNodes() || []
  nodes.forEach(node => {
    node.expand()
  })
}

// 收起全部
const collapseAll = () => {
  const nodes = treeRef.value?.store._getAllNodes() || []
  nodes.forEach(node => {
    node.collapse()
  })
}

// 显示添加子组织对话框
const showAddChildDialog = (parentOrg) => {
  editingOrg.value = null
  orgForm.parentId = parentOrg.orgId
  showAddDialog.value = true
}

// 显示编辑对话框
const showEditDialog = (org) => {
  editingOrg.value = org
  Object.assign(orgForm, org)
  showAddDialog.value = true
}

// 显示成员对话框
const showUsersDialog = async (org) => {
  currentOrg.value = org
  showUsersDialogFlag.value = true
  await loadOrgUsers(org.orgId)
}

// 加载组织成员
const loadOrgUsers = async (orgId) => {
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
const removeUserFromOrg = async (user) => {
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
    
    const response = await organizationApi.removeOrgUser(currentOrg.value.orgId, user.userId)
    if (response.code === 200) {
      ElMessage.success('移除成功')
      await loadOrgUsers(currentOrg.value.orgId)
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

// 切换状态
const toggleStatus = async (org) => {
  try {
    await ElMessageBox.confirm(
      `确定要${org.status === 1 ? '禁用' : '启用'}组织 "${org.orgName}" 吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const newStatus = org.status === 1 ? 0 : 1
    const response = await organizationApi.updateOrganization({
      orgId: org.orgId,
      status: newStatus
    })
    
    if (response.code === 200) {
      org.status = newStatus
      ElMessage.success(`${newStatus === 1 ? '启用' : '禁用'}成功`)
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

// 保存组织
const saveOrganization = async () => {
  try {
    const response = editingOrg.value
      ? await organizationApi.updateOrganization({ ...orgForm, orgId: editingOrg.value.orgId })
      : await organizationApi.createOrganization(orgForm)
    
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
const resetForm = () => {
  editingOrg.value = null
  Object.assign(orgForm, {
    orgName: '',
    orgCode: '',
    parentId: null,
    leaderName: '',
    phone: '',
    email: '',
    sortOrder: 0,
    status: 1,
    remark: ''
  })
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  loadOrganizations(page, pageSize.value)
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  loadOrganizations(1, size)
}

// 生命周期
onMounted(() => {
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