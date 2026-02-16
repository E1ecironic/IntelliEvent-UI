<template>
  <div class="app-container">
    <el-row :gutter="20">
      <el-col :span="10">
        <aimi-search-form
          :form-items="searchFormConfig"
          :basic-fields="['name', 'code']"
          show-advanced-toggle
          @search="handleSearch"
          @reset="handleReset"
        />

        <aimi-table
          ref="tableRef"
          v-bind="tableConfig"
          :loading="loading"
          :data="roleList"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          :row-key="tableConfig.rowKey || 'id'"
          highlight-current-row
          @row-click="handleRoleClick"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
        >
          <template #status="{ row }">
            <el-tag :type="(row as RoleItem).status === 1 ? 'success' : 'danger'">
              {{ (row as RoleItem).status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </aimi-table>
      </el-col>
      <el-col :span="14">
        <el-card shadow="never" class="permission-tree">
          <div class="tree-header">
            <div class="tree-title">
              <span>权限树</span>
              <el-tag v-if="currentRole" type="info" size="small">
                {{ currentRole.name || '-' }}
              </el-tag>
            </div>
            <el-input v-model="treeKeyword" placeholder="搜索权限" clearable />
            <div class="tree-actions">
              <el-button type="primary" @click="expandAll">展开</el-button>
              <el-button type="primary" @click="collapseAll">收起</el-button>
              <el-button type="primary" @click="handleSave">保存授权</el-button>
            </div>
          </div>
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            node-key="id"
            show-checkbox
            default-expand-all
            :filter-node-method="filterNode"
          />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@/hooks/useTable'
import { arrayToTree } from '@/utils'
import { sysRoleApi, sysPermissionApi } from '@/api'
import { AimiSearchForm, AimiTable } from '@/components/Aimi'
import { searchFormConfig, tableConfig, type RoleItem } from './config'
import type { PermissionItem } from '../permission-manage/config'

const initialSearchParams = {
  name: '',
  code: '',
  status: undefined as number | undefined
}

const tableRef = ref()
const { loading, tableData: roleList, total, currentPage, pageSize, getTableData, handleSearch: tableSearch, handleReset: tableReset } = useTable(
  sysRoleApi.ApiPageList,
  initialSearchParams
)

const handlePageChange = (page: number) => {
  currentPage.value = page
  getTableData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getTableData()
}

const handleSearch = (params: Record<string, any>) => {
  tableSearch(params)
}

const handleReset = () => {
  tableReset()
}

const treeData = ref<PermissionItem[]>([])
const treeRef = ref()
const treeKeyword = ref('')
const treeProps = { label: 'name', children: 'children' }
const currentRole = ref<RoleItem | null>(null)

const filterNode = (value: string, data: PermissionItem) => {
  if (!value) return true
  return (data.name || '').includes(value)
}

watch(treeKeyword, value => {
  treeRef.value?.filter(value)
})

const toggleExpandAll = (expanded: boolean) => {
  const store = treeRef.value?.store?.value || treeRef.value?.store
  const root = store?.root
  if (!root) return
  const traverse = (nodes: any[]) => {
    nodes.forEach(node => {
      if (expanded) node.expand(null, true)
      else node.collapse()
      if (node.childNodes?.length) traverse(node.childNodes)
    })
  }
  traverse(root.childNodes || [])
}

const expandAll = () => {
  toggleExpandAll(true)
}

const collapseAll = () => {
  toggleExpandAll(false)
}

const normalizeTreeData = (data: any) => {
  if (Array.isArray(data)) {
    const hasChildren = data.some(item => Array.isArray(item?.children) && item.children.length > 0)
    return hasChildren ? data : arrayToTree(data)
  }
  return []
}

const fetchPermissionTree = async () => {
  const res = await sysPermissionApi.ApiTree()
  if (res.code === 200) {
    treeData.value = normalizeTreeData(res.data)
  }
}

const handleRoleClick = (row: RoleItem) => {
  currentRole.value = row
  loadRolePermissions(row.id)
}

const loadRolePermissions = async (roleId?: number) => {
  if (!roleId) return
  const res = await sysRoleApi.ApiGetRolePermissions(roleId)
  if (res.code === 200) {
    const data = res.data || []
    const keys = Array.isArray(data)
      ? data.map((item: any) => (typeof item === 'object' ? item.id : item)).filter(Boolean)
      : []
    treeRef.value?.setCheckedKeys(keys)
  }
}

const handleSave = async () => {
  if (!currentRole.value?.id) {
    ElMessage.warning('请选择角色')
    return
  }
  const checkedKeys = treeRef.value?.getCheckedKeys() || []
  const halfKeys = treeRef.value?.getHalfCheckedKeys() || []
  const permissionIds = Array.from(new Set([...checkedKeys, ...halfKeys]))
  const res = await sysRoleApi.ApiAssignPermissions({ roleId: currentRole.value.id, permissionIds })
  if (res.code === 200) {
    ElMessage.success('保存成功')
  }
}

onMounted(() => {
  fetchPermissionTree()
})
</script>

<style scoped lang="scss">
.permission-tree {
  min-height: 520px;
}

.tree-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.tree-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tree-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
</style>
