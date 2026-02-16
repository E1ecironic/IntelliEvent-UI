<template>
  <div class="app-container">
    <aimi-search-form
      :form-items="searchFormConfig"
      :basic-fields="['userName', 'realName']"
      show-advanced-toggle
      @search="handleSearch"
      @reset="handleReset"
    />

    <aimi-table
      ref="tableRef"
      v-bind="tableConfig"
      :loading="loading"
      :data="userList"
      :total="total"
      :current-page="currentPage"
      :page-size="pageSize"
      :row-key="tableConfig.rowKey || 'id'"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @operation-click="handleOperationClick"
    >
      <template #status="{ row }">
        <el-tag :type="(row as UserItem).status === 1 ? 'success' : 'danger'">
          {{ (row as UserItem).status === 1 ? '正常' : '禁用' }}
        </el-tag>
      </template>
    </aimi-table>

    <aimi-dialog v-model="dialogVisible" title="分配角色" width="520px" @confirm="handleConfirm">
      <template #body>
        <div class="role-select">
          <el-checkbox-group v-model="selectedRoleIds">
            <el-checkbox v-for="role in roleOptions" :key="role.id" :label="role.id">
              {{ role.name }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </template>
    </aimi-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useTable } from '@/hooks/useTable'
import { sysRoleApi, sysUserRoleApi, userApi } from '@/api'
import { AimiSearchForm, AimiTable, AimiDialog } from '@/components/Aimi'
import { searchFormConfig, tableConfig, type UserItem, type RoleItem } from './config'

const initialSearchParams = {
  userName: '',
  realName: '',
  phone: '',
  status: undefined as number | undefined
}

const tableRef = ref()
const { loading, tableData: userList, total, currentPage, pageSize, getTableData, handleSearch, handleReset } = useTable(
  userApi.ApiPageList,
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
const currentUser = ref<UserItem | null>(null)
const roleOptions = ref<RoleItem[]>([])
const selectedRoleIds = ref<Array<number | string>>([])

const handleOperationClick = (command: string, row: UserItem) => {
  if (command === 'assignRole') {
    openAssignRole(row)
  }
}

const openAssignRole = async (row: UserItem) => {
  currentUser.value = row
  await fetchRoleOptions()
  await fetchUserRoles(row.id)
  dialogVisible.value = true
}

const fetchRoleOptions = async () => {
  const res = await sysRoleApi.ApiPageList({ pageNum: 1, pageSize: 9999 })
  if (res.code === 200) {
    roleOptions.value = res.data?.records || res.data?.list || res.data || []
  }
}

const fetchUserRoles = async (userId?: number) => {
  if (!userId) return
  const res = await sysUserRoleApi.ApiGetUserRoles(userId)
  if (res.code === 200) {
    const data = res.data || []
    selectedRoleIds.value = Array.isArray(data)
      ? data.map((item: any) => (typeof item === 'object' ? item.id : item)).filter(Boolean)
      : []
  }
}

const handleConfirm = async () => {
  if (!currentUser.value?.id) {
    ElMessage.warning('请选择用户')
    return
  }
  const res = await sysUserRoleApi.ApiAssignRoles({
    userId: currentUser.value.id,
    roleIds: selectedRoleIds.value
  })
  if (res.code === 200) {
    ElMessage.success('保存成功')
    dialogVisible.value = false
    getTableData()
  }
}
</script>

<style scoped lang="scss">
.role-select {
  max-height: 320px;
  overflow-y: auto;
}
</style>
