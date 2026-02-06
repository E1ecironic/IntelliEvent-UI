<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <aimi-search>
      <aimi-search-form
        :formItems="searchFormConfig"
        @search="handleSearch"
        @reset="handleReset"
      />
      <template #button>
        <el-button type="primary" @click="handleAdd">新增配置</el-button>
      </template>
    </aimi-search>

    <!-- 表格区 -->
    <aims-table
      ref="tableRef"
      v-bind="tableConfig"
      :data="tableData"
      :loading="loading"
      :total="total"
      :currentPage="currentPage"
      :pageSize="pageSize"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    >
      <template #handler="{ row }">
        <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
        <el-button type="danger" @click="handleDelete(row)">删除</el-button>
      </template>
    </aims-table>

    <!-- 弹窗 -->
    <aimi-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑配置' : '新增配置'"
      @confirm="handleConfirm"
    >
      <template #body>
        <aimi-form
          ref="formRef"
          :formItems="formConfig"
          :modelValue="formData"
        />
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { searchFormConfig, tableConfig, formConfig } from './config'
import type { SysConfig } from '@/types/sysConfig'
import { sysConfigApi } from '@/api'
import { useTable } from '@/hooks/useTable'
import {
  AimiSearch,
  AimiSearchForm,
  AimiTable as AimsTable,
  AimiDialog,
  AimiForm
} from '@/components/Aimi'

// 表格逻辑
const tableRef = ref()
const {
  loading,
  tableData,
  total,
  currentPage,
  pageSize,
  getTableData,
  handleSearch,
  handleReset,
  refresh
} = useTable(sysConfigApi.ApiPageList)

const handlePageChange = (page: number) => {
  currentPage.value = page
  getTableData()
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  getTableData()
}

// 弹窗逻辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive<SysConfig>({
  configKey: '',
  configValue: '',
  description: ''
})

const handleAdd = () => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    configKey: '',
    configValue: '',
    description: ''
  })
  dialogVisible.value = true
}

const handleEdit = (row: SysConfig) => {
  isEdit.value = true
  Object.assign(formData, { ...row })
  dialogVisible.value = true
}

const handleDelete = (row: SysConfig) => {
  if (!row.configKey) return
  ElMessageBox.confirm(`确认删除配置【${row.configKey}】吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const res = await sysConfigApi.ApiDelete(row.configKey)
      if (res.code === 200) {
        ElMessage.success('删除成功')
        refresh()
      }
    } catch (error) {
      console.error(error)
    }
  })
}

const handleConfirm = async () => {
  const isValid = await formRef.value?.validate()
  if (!isValid) return

  try {
    const res = await sysConfigApi.ApiSaveOrUpdate(formData)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
      dialogVisible.value = false
      refresh()
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
</style>
