<template>
  <div class="activity-list">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h2>活动项目管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreateActivity">
          <el-icon><Plus /></el-icon>
          创建活动
        </el-button>
      </div>
    </div>

    <!-- 搜索和筛选栏 -->
    <el-card class="filter-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索活动名称、关键词"
            clearable
            @input="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterStatus" placeholder="状态筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="待开始" value="待开始" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-select v-model="filterType" placeholder="类型筛选" clearable @change="handleFilter">
            <el-option label="全部" value="" />
            <el-option label="团建" value="团建" />
            <el-option label="庆典" value="庆典" />
            <el-option label="会议" value="会议" />
            <el-option label="培训" value="培训" />
          </el-select>
        </el-col>
        <el-col :span="4">
          <el-date-picker
            v-model="filterDate"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            @change="handleFilter"
          />
        </el-col>
        <el-col :span="4">
          <el-button @click="handleResetFilter">重置</el-button>
        </el-col>
      </el-row>
    </el-card>

    <!-- 活动列表表格 -->
    <el-card class="table-card">
      <el-table
        :data="filteredActivities"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="活动名称" min-width="200">
          <template #default="{ row }">
            <div class="activity-name">
              <el-link type="primary" @click="handleViewDetail(row)">
                {{ row.name }}
              </el-link>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="date" label="日期" width="120">
          <template #default="{ row }">
            {{ formatDate(row.date) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="120" />
        <el-table-column prop="responsible" label="负责人" width="100" />
        <el-table-column prop="budget" label="预算" width="120">
          <template #default="{ row }">
            <span class="budget">{{ formatBudget(row.budget) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <div class="action-buttons">
              <el-button type="primary" link @click="handleViewDetail(row)">
                详情
              </el-button>
              <el-button type="primary" link @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="primary" link @click="handleCopy(row)">
                复制
              </el-button>
              <el-button type="danger" link @click="handleDelete(row)">
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="totalActivities"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useActivityStore } from '../stores/activity'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useRouter } from 'vue-router'
import { Plus, Search } from '@element-plus/icons-vue'

const store = useActivityStore()
const router = useRouter()

// 搜索和筛选
const searchKeyword = ref('')
const filterStatus = ref('')
const filterType = ref('')
const filterDate = ref('')

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const loading = ref(false)

// 计算属性
const totalActivities = computed(() => store.activities.length)
const filteredActivities = computed(() => {
  let result = store.activities

  // 关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword) ||
      item.location.toLowerCase().includes(keyword)
    )
  }

  // 状态筛选
  if (filterStatus.value) {
    result = result.filter(item => item.status === filterStatus.value)
  }

  // 类型筛选
  if (filterType.value) {
    result = result.filter(item => item.type === filterType.value)
  }

  // 日期筛选
  if (filterDate.value && filterDate.value.length === 2) {
    const startDate = new Date(filterDate.value[0])
    const endDate = new Date(filterDate.value[1])
    result = result.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate && itemDate <= endDate
    })
  }

  return result
})

// 获取类型标签样式
const getTypeTagType = (type) => {
  const types = {
    '团建': 'success',
    '庆典': 'warning',
    '会议': 'info',
    '培训': 'primary'
  }
  return types[type] || 'info'
}

// 获取状态标签样式
const getStatusTagType = (status) => {
  const types = {
    '待开始': 'info',
    '进行中': 'primary',
    '已完成': 'success'
  }
  return types[status] || 'info'
}

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 格式化预算
const formatBudget = (budget) => {
  return `¥${(budget / 10000).toFixed(1)}万`
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1
}

// 筛选处理
const handleFilter = () => {
  currentPage.value = 1
}

// 重置筛选
const handleResetFilter = () => {
  searchKeyword.value = ''
  filterStatus.value = ''
  filterType.value = ''
  filterDate.value = ''
  currentPage.value = 1
}

// 分页处理
const handleSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page) => {
  currentPage.value = page
}

// 操作处理
const handleViewDetail = (row) => {
  store.setCurrentActivity(row.id)
  router.push(`/activity/${row.id}`)
}

const handleEdit = (row) => {
  ElMessage.info(`编辑活动: ${row.name}`)
}

const handleCopy = (row) => {
  ElMessage.success(`已复制活动: ${row.name}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除活动 "${row.name}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = store.activities.findIndex(item => item.id === row.id)
    if (index !== -1) {
      store.activities.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const handleCreateActivity = () => {
  router.push('/')
  ElMessage.info('请在仪表盘创建新活动')
}
</script>

<style scoped>
.activity-list {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filter-card {
  margin-bottom: 20px;
  border-radius: 8px;
}

.table-card {
  border-radius: 8px;
}

.activity-name {
  font-weight: 500;
}

.budget {
  color: #67c23a;
  font-weight: 500;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style>