<template>
  <div class="app-container">
    <aimi-search-form
      :form-items="searchFormConfig"
      show-advanced-toggle
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #toolbar>
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增权限</el-button>
      </template>
    </aimi-search-form>

    <el-row :gutter="20">
      <el-col :span="16">
        <aimi-table
          ref="tableRef"
          v-bind="tableConfig"
          :loading="loading"
          :data="permissionList"
          :total="total"
          :current-page="currentPage"
          :page-size="pageSize"
          :row-key="tableConfig.rowKey || 'id'"
          @page-change="handlePageChange"
          @size-change="handleSizeChange"
          @operation-click="handleOperationClick"
        >
          <template #type="{ row }">
            <el-tag type="info">
              {{ getTypeLabel((row as PermissionItem).type) }}
            </el-tag>
          </template>
          <template #visible="{ row }">
            <el-tag :type="(row as PermissionItem).visible === 1 ? 'success' : 'info'">
              {{ (row as PermissionItem).visible === 1 ? '显示' : '隐藏' }}
            </el-tag>
          </template>
          <template #status="{ row }">
            <el-tag :type="(row as PermissionItem).status === 1 ? 'success' : 'danger'">
              {{ (row as PermissionItem).status === 1 ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </aimi-table>
      </el-col>
      <el-col :span="8">
        <el-card shadow="never" class="permission-tree">
          <div class="tree-header">
            <el-input v-model="treeKeyword" placeholder="搜索权限" clearable />
            <div class="tree-actions">
              <el-button type="primary" @click="expandAll">展开</el-button>
              <el-button type="primary" @click="collapseAll">收起</el-button>
            </div>
          </div>
          <el-tree
            ref="treeRef"
            :data="treeData"
            :props="treeProps"
            node-key="id"
            default-expand-all
            :filter-node-method="filterNode"
          />
        </el-card>
      </el-col>
    </el-row>

    <aimi-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑权限' : '新增权限'"
      width="700px"
      @confirm="handleConfirm"
    >
      <template #body>
        <aimi-form
          ref="formRef"
          :form-items="formConfig"
          :model-value="formData"
          @update:model-value="value => Object.assign(formData, value)"
        >
          <template #parentSelect>
            <el-tree-select
              v-model="formData.parentId"
              :data="parentOptions"
              :props="treeProps"
              check-strictly
              clearable
              filterable
              style="width: 100%"
              placeholder="请选择上级权限"
            />
          </template>
        </aimi-form>
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useTable } from '@/hooks/useTable'
import { sysPermissionApi } from '@/api'
import { arrayToTree } from '@/utils'
import { AimiSearchForm, AimiTable, AimiDialog, AimiForm } from '@/components/Aimi'
import { searchFormConfig, tableConfig, formConfig, type PermissionItem } from './config'

const initialSearchParams = {
  name: '',
  code: '',
  type: '',
  status: undefined as number | undefined
}

const tableRef = ref()
const { loading, tableData: permissionList, total, currentPage, pageSize, getTableData, handleSearch: tableSearch, handleReset: tableReset, refresh } = useTable(
  sysPermissionApi.ApiPageList,
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

const treeData = ref<PermissionItem[]>([])
const treeRef = ref()
const treeKeyword = ref('')
const treeProps = { label: 'name', children: 'children', value: 'id' }

const parentOptions = computed(() => [{ id: 0, name: '顶级权限', children: treeData.value }])

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

const fetchTreeData = async () => {
  const res = await sysPermissionApi.ApiTree()
  if (res.code === 200) {
    treeData.value = normalizeTreeData(res.data)
  }
}

const handleSearch = (params: Record<string, any>) => {
  tableSearch(params)
}

const handleReset = () => {
  tableReset()
}

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive<PermissionItem>({
  id: undefined,
  name: '',
  code: '',
  type: 'MENU',
  path: '',
  component: '',
  icon: '',
  method: 'GET',
  api: '',
  visible: 1,
  sort: 0,
  status: 1,
  parentId: 0
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    type: 'MENU',
    path: '',
    component: '',
    icon: '',
    method: 'GET',
    api: '',
    visible: 1,
    sort: 0,
    status: 1,
    parentId: 0
  })
  dialogVisible.value = true
}

const handleEdit = (row: PermissionItem) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleOperationClick = (command: string, row: PermissionItem) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleDelete = (row: PermissionItem) => {
  if (!row.id) return
  ElMessageBox.confirm(`确认删除权限【${row.name}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await sysPermissionApi.ApiDelete(row.id as number)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      refresh()
      fetchTreeData()
    }
  })
}

const handleConfirm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return
  const res = await sysPermissionApi.ApiSaveOrUpdate(formData)
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
    dialogVisible.value = false
    refresh()
    fetchTreeData()
  }
}

const getTypeLabel = (type?: string) => {
  if (type === 'MENU') return '菜单'
  if (type === 'BUTTON') return '按钮'
  if (type === 'API') return '接口'
  return '-'
}

onMounted(() => {
  fetchTreeData()
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

.tree-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
