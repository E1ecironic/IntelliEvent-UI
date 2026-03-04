<template>
  <div class="app-container">
    <!-- 搜索区 -->
    <aimi-search>
      <aimi-search-form
        :formItems="moduleSearchFormConfig"
        @search="handleModuleSearch"
        @reset="handleModuleReset"
      />
      <template #button>
        <el-button type="primary" @click="handleAdd()">新增配置</el-button>
      </template>
    </aimi-search>

    <!-- 表格区 -->
    <aims-table
      ref="moduleTableRef"
      v-bind="moduleTableConfig"
      :data="moduleTableData"
      :loading="moduleLoading"
      :total="moduleTotal"
      :currentPage="moduleCurrentPage"
      :pageSize="modulePageSize"
    >
      <template #handler="{ row }">
        <el-button type="primary" @click="openModuleDetail(row)">查看</el-button>
      </template>
    </aims-table>

    <aimi-dialog
      v-model="detailDialogVisible"
      :title="detailDialogTitle"
      width="70%"
      :showFooter="false"
    >
      <template #body>
        <div>
          <div style="margin-bottom: 12px">
            <el-button type="primary" @click="handleAdd(detailModule)">新增配置</el-button>
          </div>
          <aims-table
            ref="detailTableRef"
            v-bind="detailTableConfig"
            :data="detailTableData"
            :loading="detailLoading"
            :total="detailTotal"
            :currentPage="detailCurrentPage"
            :pageSize="detailPageSize"
            @page-change="handleDetailPageChange"
            @size-change="handleDetailSizeChange"
          >
            <template #detailHandler="{ row }">
              <el-button type="primary" @click="handleEdit(row)">编辑</el-button>
              <el-button type="danger" @click="handleDelete(row)">删除</el-button>
            </template>
          </aims-table>
        </div>
      </template>
    </aimi-dialog>

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
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { moduleSearchFormConfig, moduleTableConfig, detailTableConfig, formConfig } from './config'
import type { SysConfig, SysConfigModule } from '@/types/sysConfig'
import { sysConfigApi } from '@/api'
import { useTable } from '@/hooks/useTable'
import {
  AimiSearch,
  AimiSearchForm,
  AimiTable as AimsTable,
  AimiDialog,
  AimiForm
} from '@/components/Aimi'

const moduleTableRef = ref()
const {
  loading: moduleLoading,
  tableData: moduleTableData,
  total: moduleTotal,
  currentPage: moduleCurrentPage,
  pageSize: modulePageSize,
  handleSearch: handleModuleSearch,
  handleReset: handleModuleReset,
  refresh: refreshModule
} = useTable(sysConfigApi.ApiModuleList)

const detailTableRef = ref()
const {
  loading: detailLoading,
  tableData: detailTableData,
  total: detailTotal,
  currentPage: detailCurrentPage,
  pageSize: detailPageSize,
  getTableData: getDetailTableData,
  reload: reloadDetail
} = useTable(sysConfigApi.ApiPageList, { module: '' })

const detailDialogVisible = ref(false)
const detailModule = ref('')
const detailDialogTitle = computed(() =>
  detailModule.value ? `模块配置 - ${detailModule.value}` : '模块配置'
)

const handleDetailPageChange = (page: number) => {
  detailCurrentPage.value = page
  getDetailTableData()
}

const handleDetailSizeChange = (size: number) => {
  detailPageSize.value = size
  detailCurrentPage.value = 1
  getDetailTableData()
}

const openModuleDetail = (row: SysConfigModule) => {
  detailModule.value = row.module
  detailDialogVisible.value = true
  reloadDetail({ module: row.module })
}

// 弹窗逻辑
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref()
const formData = reactive<SysConfig>({
  configKey: '',
  configValue: '',
  description: '',
  module: ''
})

const handleAdd = (module?: string) => {
  isEdit.value = false
  Object.assign(formData, {
    id: undefined,
    configKey: '',
    configValue: '',
    description: '',
    module: module || ''
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
        refreshModule()
        if (detailDialogVisible.value && detailModule.value) {
          reloadDetail({ module: detailModule.value })
        }
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
      refreshModule()
      if (detailDialogVisible.value && detailModule.value) {
        reloadDetail({ module: detailModule.value })
      }
    }
  } catch (error) {
    console.error(error)
  }
}
</script>

<style scoped>
</style>
