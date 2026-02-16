<template>
  <div class="app-container">
    <aimi-search-form
      :form-items="searchFormConfig"
      show-advanced-toggle
      @search="handleSearch"
      @reset="handleReset"
    >
      <template #toolbar>
        <el-button type="primary" @click="handleAdd" :icon="Plus">新增角色</el-button>
      </template>
    </aimi-search-form>

    <aimi-table
      ref="tableRef"
      v-bind="tableConfig"
      :loading="loading"
      :data="roleList"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :row-key="tableConfig.rowKey || 'id'"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @operation-click="handleOperationClick"
    >
      <template #status="{ row }">
        <el-tag :type="(row as Role).status === 1 ? 'success' : 'danger'">
          {{ (row as Role).status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </template>
    </aimi-table>

    <aimi-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '新增角色'"
      width="600px"
      @confirm="handleConfirm"
    >
      <template #body>
        <aimi-form
          ref="formRef"
          :form-items="formConfig"
          :model-value="formData"
          @update:model-value="value => Object.assign(formData, value)"
        />
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { searchFormConfig, tableConfig, formConfig, type Role } from './config'
import { useTable } from '@/hooks/useTable'
import { sysRoleApi } from '@/api'
import { AimiSearchForm, AimiTable, AimiDialog, AimiForm } from '@/components/Aimi'

const initialSearchParams = {
  name: '',
  code: '',
  status: undefined as number | undefined
}

const tableRef = ref()
const { loading, tableData: roleList, total, currentPage, pageSize, getTableData, handleSearch, handleReset, refresh } = useTable(
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

const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive<Role>({
  id: undefined,
  name: '',
  code: '',
  description: '',
  sort: 0,
  status: 1
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    name: '',
    code: '',
    description: '',
    sort: 0,
    status: 1
  })
  dialogVisible.value = true
}

const handleEdit = (row: Role) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleOperationClick = (command: string, row: Role) => {
  switch (command) {
    case 'edit':
      handleEdit(row)
      break
    case 'delete':
      handleDelete(row)
      break
  }
}

const handleDelete = (row: Role) => {
  if (!row.id) return
  ElMessageBox.confirm(`确认删除角色【${row.name}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    const res = await sysRoleApi.ApiDelete(row.id as number)
    if (res.code === 200) {
      ElMessage.success('删除成功')
      refresh()
    }
  })
}

const handleConfirm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return
  const res = await sysRoleApi.ApiSaveOrUpdate(formData)
  if (res.code === 200) {
    ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
    dialogVisible.value = false
    refresh()
  }
}
</script>
