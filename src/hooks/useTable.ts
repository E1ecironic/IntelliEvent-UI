import { ref, reactive, onMounted, onUnmounted, nextTick, type Ref } from 'vue'
import type { TableInstance } from 'element-plus'

interface UseTableOptions {
  // 表格数据
  data?: any[]
  requestApi?: (params: any) => Promise<any>
  requestParams?: Record<string, any>
  
  // 分页配置
  pageSize?: number
  pageSizes?: number[]
  
  // 表格配置
  showIndexColumn?: boolean
  showSelectColumn?: boolean
  showPagination?: boolean
  
  // 高度配置
  autoHeight?: boolean
  offsetHeight?: number
  maxHeight?: string | number
}

interface UseTableReturn {
  // 响应式数据
  loading: Ref<boolean>
  tableData: Ref<any[]>
  total: Ref<number>
  currentPage: Ref<number>
  pageSize: Ref<number>
  
  // 方法
  getTableData: (params?: Record<string, any>) => Promise<void>
  handleSearch: (params?: Record<string, any>) => void
  handleReset: () => void
  refresh: () => void
  reload: (params?: Record<string, any>) => void
  getSelectRecords: () => any[]
  getSelectIds: () => (string | number)[]
  clearSelection: () => void
  setCurrentRow: (row: any) => void
  clearCurrentRow: () => void
  
  // 表格实例
  tableRef: Ref<TableInstance | null>
}

export function useTable(
  api?: (params: any) => Promise<any>,
  searchForm?: Record<string, any>,
  options: UseTableOptions = {}
): UseTableReturn {
  // 默认配置
  const defaultOptions = {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    showIndexColumn: true,
    showSelectColumn: false,
    showPagination: true,
    autoHeight: true,
    offsetHeight: 200,
    maxHeight: 'auto',
    ...options
  }

  // 响应式数据
  const loading = ref(false)
  const tableData = ref<any[]>([])
  const total = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(defaultOptions.pageSize)
  const tableRef = ref<TableInstance | null>(null)
  
  // 搜索参数
  const searchParams = reactive<Record<string, any>>({})
  
  // 初始化搜索参数
  if (searchForm) {
    Object.assign(searchParams, searchForm)
  }

  // 获取表格数据
  const getTableData = async (params: Record<string, any> = {}) => {
    if (!api) return
    
    loading.value = true
    try {
      const requestParams = {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        ...searchParams,
        ...params
      }
      
      const response = await api(requestParams)
      
      if (response.code === 200 && response.data) {
        tableData.value = response.data.records || response.data.list || response.data
        total.value = response.data.total || tableData.value.length
      } else {
        tableData.value = []
        total.value = 0
      }
    } catch (error) {
      console.error('表格数据加载失败:', error)
      tableData.value = []
      total.value = 0
    } finally {
      loading.value = false
    }
  }

  // 搜索处理
  const handleSearch = (params: Record<string, any> = {}) => {
    currentPage.value = 1
    Object.assign(searchParams, params)
    getTableData()
  }

  // 重置处理
  const handleReset = () => {
    currentPage.value = 1
    Object.keys(searchParams).forEach(key => {
      searchParams[key] = ''
    })
    if (searchForm) {
      Object.assign(searchParams, searchForm)
    }
    getTableData()
  }

  // 刷新表格
  const refresh = () => {
    getTableData()
  }

  // 重新加载表格
  const reload = (params?: Record<string, any>) => {
    currentPage.value = 1
    if (params) {
      Object.assign(searchParams, params)
    }
    getTableData()
  }

  // 获取选中的记录
  const getSelectRecords = () => {
    if (tableRef.value) {
      return tableRef.value.getSelectionRows()
    }
    return []
  }

  // 获取选中的ID
  const getSelectIds = () => {
    return getSelectRecords().map(item => item.id)
  }

  // 清空选择
  const clearSelection = () => {
    if (tableRef.value) {
      tableRef.value.clearSelection()
    }
  }

  // 设置当前行
  const setCurrentRow = (row: any) => {
    if (tableRef.value) {
      tableRef.value.setCurrentRow(row)
    }
  }

  // 清空当前行
  const clearCurrentRow = () => {
    if (tableRef.value) {
      tableRef.value.setCurrentRow(undefined)
    }
  }

  // 自动计算表格高度
  const calculateTableHeight = () => {
    if (!defaultOptions.autoHeight) return
    
    nextTick(() => {
      const tableElement = tableRef.value?.$el
      if (tableElement) {
        const rect = tableElement.getBoundingClientRect()
        const windowHeight = window.innerHeight
        const height = windowHeight - rect.top - defaultOptions.offsetHeight
        
        // Element Plus表格使用max-height属性
        if (tableRef.value && height > 0) {
          // 设置表格最大高度
          tableElement.style.maxHeight = Math.max(height, 200) + 'px'
        }
      }
    })
  }

  // 监听窗口大小变化
  onMounted(() => {
    if (defaultOptions.autoHeight) {
      calculateTableHeight()
      window.addEventListener('resize', calculateTableHeight)
    }
    
    // 如果有API，自动加载数据
    if (api) {
      getTableData()
    }
  })

  // 清理事件监听
  onUnmounted(() => {
    if (defaultOptions.autoHeight) {
      window.removeEventListener('resize', calculateTableHeight)
    }
  })

  return {
    loading,
    tableData,
    total,
    currentPage,
    pageSize,
    getTableData,
    handleSearch,
    handleReset,
    refresh,
    reload,
    getSelectRecords,
    getSelectIds,
    clearSelection,
    setCurrentRow,
    clearCurrentRow,
    tableRef
  }
}