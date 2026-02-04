<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <aimi-search-form
      :form-items="searchFormConfig"
      :basic-fields="['name', 'code', 'status']"
      show-advanced-toggle
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #toolbar>
        <el-button type="primary" @click="showAddTopLevelDialog" :icon="Plus">新增组织</el-button>
        <el-button @click="expandAll">展开全部</el-button>
        <el-button @click="collapseAll">收起全部</el-button>
      </template>
    </aimi-search-form>

    <!-- 表格区 -->
    <aimi-table
      ref="tableRef"
      v-bind="tableConfig"
      :loading="loading"
      :data="organizationList"
      :total="totalCount"
      :current-page="currentPage"
      :page-size="pageSize"
      style="margin-top: 16px;"
      :row-key="tableConfig.rowKey || 'id'"
      @operation-click="handleOperationClick"
    >
      <!-- 状态插槽 -->
      <template #status="{ row }">
        <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
          {{ row.status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </template>
    </aimi-table>

    <!-- 新增/编辑弹窗 -->
    <aimi-dialog
      v-model="showAddDialog"
      :title="editingOrg ? '编辑组织' : (isAddingSubordinate ? '添加下级组织' : '新增组织')"
      width="600px"
      @confirm="saveOrganization"
    >
      <template #body>
        <aimi-form
          ref="orgFormRef"
          :form-items="formConfig"
          v-model="orgForm"
        >
          <template #parentOrg>
            <el-tree-select
              v-model="orgForm.parentId"
              :data="organizationList"
              :props="{ label: 'name', value: 'id', children: 'children' }"
              placeholder="请选择上级组织"
              clearable
              :disabled="isAddingSubordinate"
              check-strictly
              style="width: 100%"
            />
            <div v-if="isAddingSubordinate" style="color: #909399; font-size: 12px; margin-top: 5px;">
              提示：正在添加下级组织，上级组织已自动填充且不可修改
            </div>
          </template>
        </aimi-form>
      </template>
    </aimi-dialog>

    <!-- 组织成员管理弹窗 -->
    <aimi-dialog
      v-model="showUsersDialogFlag"
      title="组织成员管理"
      width="800px"
      :show-footer="false"
      @close="currentOrgUsers = []"
    >
      <template #body>
        <div class="org-users-container">
          <div class="users-header">
            <span>{{ currentOrg?.name }} - 成员列表</span>
            <el-button type="primary" size="small" @click="showAddUserDialog = true" :icon="Plus">
              添加成员
            </el-button>
          </div>
          <el-table :data="currentOrgUsers" style="width: 100%" border stripe>
            <el-table-column prop="userName" label="姓名" width="120" />
            <el-table-column prop="position" label="职位" width="150" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="phone" label="电话" width="120" />
            <el-table-column label="操作" width="100" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link size="small" @click="removeUserFromOrg(row)">
                  移除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus
} from '@element-plus/icons-vue'
import { organizationApi } from '@/api'
import { tableConfig, formConfig, searchFormConfig } from './config'
import type { Organization } from './config'
import type { User } from '@/views/admin/user-manage/config'
import { useTable } from '@/hooks/useTable'
import {
  AimiSearchForm,
  AimiTable,
  AimiDialog,
  AimiForm
} from '@/components/Aimi'

// 初始搜索条件
const initialSearchParams = {
  name: '',
  code: '',
  status: undefined as number | undefined
}

// 使用 useTable Hook
const {
  loading,
  tableData: organizationList,
  total: totalCount,
  currentPage,
  pageSize,
  getTableData,
  handleSearch,
  handleReset,
  tableRef
} = useTable(organizationApi.ApiPageList, initialSearchParams, {
  showPagination: false // 树形表格通常不需要常规分页，或者由后端控制
})

// 响应式数据
const showAddDialog = ref<boolean>(false)
const showUsersDialogFlag = ref<boolean>(false)
const showAddUserDialog = ref<boolean>(false)
const editingOrg = ref<Organization | null>(null)
const currentOrg = ref<Organization | null>(null)
const currentOrgUsers = ref<User[]>([])
const orgFormRef = ref()

// 计算属性 - 是否正在添加下级组织
const isAddingSubordinate = computed<boolean>(() => {
  return editingOrg.value === null && orgForm.parentId !== null && orgForm.parentId !== undefined
})

// 表单数据
const orgForm = reactive<Organization>({
  id: undefined,
  name: '',
  code: '',
  parentId: undefined,
  managerName: '',
  connectPhone: '',
  email: '',
  status: 1,
  remark: ''
})

// 操作列点击事件
const handleOperationClick = (command: string, row: Organization) => {
  switch (command) {
    case 'addChild':
      showAddChildDialog(row)
      break
    case 'edit':
      showEditDialog(row)
      break
    case 'members':
      showUsersDialog(row)
      break
    case 'toggleStatus':
      toggleStatus(row)
      break
    case 'delete':
      deleteOrganization(row)
      break
  }
}

// 展开/收起全部
const toggleExpansion = (rows: Organization[], isExpanded: boolean) => {
  // 获取 el-table 实例
  const elTable = (tableRef.value as any)?.tableRef
  if (!elTable) return

  rows.forEach(row => {
    elTable.toggleRowExpansion(row, isExpanded)
    if (row.children && row.children.length > 0) {
      toggleExpansion(row.children, isExpanded)
    }
  })
}

const expandAll = () => {
  toggleExpansion(organizationList.value, true)
}

const collapseAll = () => {
  toggleExpansion(organizationList.value, false)
}

// 显示添加顶级组织对话框
const showAddTopLevelDialog = () => {
  editingOrg.value = null
  Object.assign(orgForm, {
    id: undefined,
    name: '',
    code: '',
    parentId: undefined,
    managerName: '',
    connectPhone: '',
    email: '',
    status: 1,
    remark: ''
  })
  showAddDialog.value = true
}

// 显示添加子组织对话框
const showAddChildDialog = (parentOrg: Organization) => {
  editingOrg.value = null
  Object.assign(orgForm, {
    id: undefined,
    name: '',
    code: '',
    parentId: parentOrg.id,
    managerName: '',
    connectPhone: '',
    email: '',
    status: 1,
    remark: ''
  })
  showAddDialog.value = true
}

// 显示编辑对话框
const showEditDialog = (org: Organization) => {
  editingOrg.value = org
  Object.assign(orgForm, { ...org })
  showAddDialog.value = true
}

// 保存组织
const saveOrganization = async () => {
  const formInstance = orgFormRef.value?.getFormRef()
  if (!formInstance) return
  
  const isValid = await formInstance.validate()
  if (!isValid) return

  try {
    let res
    if (orgForm.id) {
      res = await organizationApi.updateOrganization({ ...orgForm, id: orgForm.id! })
    } else {
      res = await organizationApi.createOrganization(orgForm)
    }

    if (res.code === 200) {
      ElMessage.success(editingOrg.value ? '修改成功' : '新增成功')
      showAddDialog.value = false
      getTableData()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('操作失败')
  }
}

// 递归更新子组织状态
const updateChildOrganizations = (org: Organization, newStatus: number) => {
  if (org.children && org.children.length > 0) {
    org.children.forEach(child => {
      child.status = newStatus
      updateChildOrganizations(child, newStatus)
    })
  }
}

// 切换状态
const toggleStatus = async (org: Organization) => {
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

    const newStatus = org.status === 1 ? 0 : 1
    const response = await organizationApi.updateOrganization({
      id: org.id!,
      status: newStatus
    })

    if (response.code === 200) {
      org.status = newStatus
      updateChildOrganizations(org, newStatus)
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

// 删除组织
const deleteOrganization = async (org: Organization) => {
  try {
    const getChildOrgCount = (node: Organization): number => {
      let count = 0
      if (node.children && node.children.length > 0) {
        count += node.children.length
        node.children.forEach(child => {
          count += getChildOrgCount(child)
        })
      }
      return count
    }

    const childCount = getChildOrgCount(org)
    const deleteWarning = childCount > 0
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
      getTableData()
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

// 成员管理相关
const showUsersDialog = async (org: Organization) => {
  currentOrg.value = org
  showUsersDialogFlag.value = true
  await loadOrgUsers(org.id!)
}

const loadOrgUsers = async (orgId: number) => {
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

const removeUserFromOrg = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `确定要移除成员 "${user.userName}" 吗？`,
      '提示',
      { type: 'warning' }
    )

    if (!user.id) return
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

.org-users-container {
  .users-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
  }
}
</style>
