<template>
  <div class="aimi-table-container" :style="{ height: typeof height === 'number' ? height + 'px' : height }">
    <div class="table-content" :style="{ height: tableHeight }">
      <el-table
        ref="tableRef"
        v-bind="$attrs"
        :class="{ 'el-table--fluid-height': !height }"
        :data="displayData"
        :loading="displayLoading"
        :height="tableHeight"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :fit="fit"
        :show-header="showHeader"
        :empty-text="emptyText"
        :highlight-current-row="highlightCurrentRow"
        :current-row-key="currentRowKey"
        :row-key="rowKey"
        :default-expand-all="defaultExpandAll"
        :expand-row-keys="expandRowKeys"
        :default-sort="defaultSort"
        :tooltip-effect="tooltipEffect"
        :sum-text="sumText"
        :summary-method="summaryMethod"
        :show-summary="showSummary"
        :select-on-indeterminate="selectOnIndeterminate"
        :indent="indent"
        :lazy="lazy"
        :load="load"
        :tree-props="treeProps"
        @select="handleSelect"
        @select-all="handleSelectAll"
        @selection-change="handleSelectionChange"
        @cell-mouse-enter="handleCellMouseEnter"
        @cell-mouse-leave="handleCellMouseLeave"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @row-click="handleRowClick"
        @row-contextmenu="handleRowContextmenu"
        @row-dblclick="handleRowDblclick"
        @header-click="handleHeaderClick"
        @header-contextmenu="handleHeaderContextmenu"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @current-change="handleCurrentChange"
        @header-dragend="handleHeaderDragend"
        @expand-change="handleExpandChange"
      >
        <el-table-column v-if="showSelectColumn" type="selection" width="55" align="center" :reserve-selection="reserveSelection || $attrs['reserve-selection'] === '' || $attrs['reserve-selection'] === true" />
        <el-table-column v-if="showIndexColumn" type="index" label="序号" width="60" align="center" />
        
        <el-table-column v-for="column in displayColumns" :key="column.prop" :prop="column.prop" :label="column.label"
          :width="column.width" :min-width="column.minWidth" :align="column.align || 'left'" :fixed="column.fixed"
          :sortable="column.sortable" :sort-method="column.sortMethod" :sort-by="column.sortBy"
          :sort-orders="column.sortOrders" :resizable="column.resizable !== false"
          :show-overflow-tooltip="column.showOverflowTooltip" :formatter="column.formatter"
          :class-name="column.className" :label-class-name="column.labelClassName" :selectable="column.selectable"
          :reserve-selection="column.reserveSelection" :filters="column.filters"
          :filter-placement="column.filterPlacement" :filter-multiple="column.filterMultiple"
          :filter-method="column.filterMethod" :filtered-value="column.filteredValue">

          <!-- 内容渲染 -->
          <template #default="scope">
            <slot v-if="column.slotName" :name="column.slotName" :row="scope.row" :column="scope.column" :$index="scope.$index"
              :cell-value="scope.row[column.prop]" />
            <div v-else-if="column.buttons && column.buttons.length > 0" class="handler-btns">
              <el-button
                v-for="btn in getVisibleButtons(column.buttons, scope.row)"
                :key="btn.command"
                :type="getBtnType(btn, scope.row) as any"
                :icon="btn.icon"
                :disabled="getBtnDisabled(btn, scope.row)"
                :link="btn.link !== false"
                :plain="btn.plain"
                :text="btn.text"
                size="small"
                @click="handleOperationClick(btn.command, scope.row)"
              >
                {{ getBtnLabel(btn, scope.row) }}
              </el-button>
              
              <el-dropdown 
                v-if="getMoreButtons(column.buttons, scope.row).length > 0" 
                @command="(command: string) => handleOperationClick(command, scope.row)"
              >
                <el-button link type="primary" size="small">
                  更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item
                      v-for="btn in getMoreButtons(column.buttons, scope.row)"
                      :key="btn.command"
                      :command="btn.command"
                      :icon="btn.icon"
                      :disabled="getBtnDisabled(btn, scope.row)"
                      :style="typeof btn.style === 'object' ? btn.style : {}"
                    >
                      {{ getBtnLabel(btn, scope.row) }}
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <span v-else>{{ scope.row[column.prop] }}</span>
          </template>
        </el-table-column>

        <!-- 操作列（兼容旧版本） -->
        <el-table-column v-if="showHandlerColumn" prop="handler" label="操作" :width="handlerWidth" :fixed="handlerFixed"
          :align="handlerAlign" :class-name="handlerClassName">
          <template #default="scope">
            <slot name="handler" :row="scope.row" :$index="scope.$index" />
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-wrapper">
      <el-pagination :current-page="props.requestApi ? internalCurrentPage : currentPage"
        :page-size="props.requestApi ? internalPageSize : pageSize" :total="displayTotal"
        :page-sizes="pageSizes" :layout="layout" :background="background" :small="small" :disabled="disabled"
        @size-change="handleSizeChange" @current-change="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'
import type { ColumnOption, HandlerButton } from '@/types/table'

interface Props {
  // 数据
  data?: any[]
  requestApi?: (params: any) => Promise<any>
  requestParams?: Record<string, any>

  // 接收 useTable 的返回值
  loading?: boolean

  // 表格配置
  columns?: ColumnOption[]
  propList?: ColumnOption[] // 兼容 TableOption 结构

  // 显示控制
  showIndexColumn?: boolean
  showSelectColumn?: boolean
  showRadioColumn?: boolean
  showExpandColumn?: boolean
  showHandlerColumn?: boolean
  showPagination?: boolean
  showSummary?: boolean
  showFooter?: boolean
  reserveSelection?: boolean

  // 样式
  height?: string | number
  maxHeight?: string | number
  stripe?: boolean
  border?: boolean
  fit?: boolean
  showHeader?: boolean
  emptyText?: string
  rowClassName?: string | ((params: any) => string)
  cellClassName?: string | ((params: any) => string)
  headerRowClassName?: string | ((params: any) => string)
  headerCellClassName?: string | ((params: any) => string)
  rowStyle?: object | ((params: any) => object)
  cellStyle?: object | ((params: any) => object)
  headerRowStyle?: object | ((params: any) => object)
  headerCellStyle?: object | ((params: any) => object)
  highlightCurrentRow?: boolean
  currentRowKey?: string | number
  rowKey?: string | ((row: any) => string)
  defaultExpandAll?: boolean
  expandRowKeys?: any[]
  defaultSort?: object
  tooltipEffect?: 'dark' | 'light'
  sumText?: string
  summaryMethod?: (params: any) => any[]
  selectOnIndeterminate?: boolean
  indent?: number
  lazy?: boolean
  load?: (row: any, treeNode: any, resolve: (data: any[]) => void) => void
  treeProps?: object

  // 分页配置
  pageSizes?: number[]
  layout?: string
  background?: boolean
  small?: boolean
  disabled?: boolean

  // 操作列配置
  handlerWidth?: string | number
  handlerFixed?: 'left' | 'right' | boolean
  handlerAlign?: 'left' | 'center' | 'right'
  handlerClassName?: string

  // 总数
  total?: number
  currentPage?: number
  pageSize?: number
}

interface Emits {
  (e: 'select', selection: any, row: any): void
  (e: 'select-all', selection: any[]): void
  (e: 'selection-change', selection: any[]): void
  (e: 'cell-mouse-enter', row: any, column: any, cell: any, event: Event): void
  (e: 'cell-mouse-leave', row: any, column: any, cell: any, event: Event): void
  (e: 'cell-click', row: any, column: any, cell: any, event: Event): void
  (e: 'cell-dblclick', row: any, column: any, cell: any, event: Event): void
  (e: 'row-click', row: any, column: any, event: Event): void
  (e: 'row-contextmenu', row: any, column: any, event: Event): void
  (e: 'row-dblclick', row: any, column: any, event: Event): void
  (e: 'header-click', column: any, event: Event): void
  (e: 'header-contextmenu', column: any, event: Event): void
  (e: 'sort-change', sort: any): void
  (e: 'filter-change', filters: any): void
  (e: 'current-change', currentRow: any, oldCurrentRow: any): void
  (e: 'header-dragend', newWidth: number, oldWidth: number, column: any, event: Event): void
  (e: 'expand-change', row: any, expandedRows: any[]): void
  (e: 'edit', row: any): void
  (e: 'assign-role', row: any): void
  (e: 'command', command: string, row: any): void
  (e: 'operation-click', command: string, row: any): void
  (e: 'size-change', size: number): void
  (e: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  requestParams: () => ({}),
  columns: () => [],
  propList: () => [],

  // 状态默认值
  loading: false,
  total: 0,
  currentPage: 1,
  pageSize: 10,

  // 显示控制
  showIndexColumn: false,
  showSelectColumn: false,
  showRadioColumn: false,
  showExpandColumn: false,
  showHandlerColumn: false,
  showPagination: true,
  showSummary: false,
  showFooter: false,
  reserveSelection: false,

  // 样式
  stripe: true,
  border: true,
  fit: true,
  showHeader: true,
  emptyText: '暂无数据',
  highlightCurrentRow: false,
  tooltipEffect: 'dark',
  sumText: '合计',
  selectOnIndeterminate: true,
  indent: 16,
  lazy: false,
  treeProps: () => ({ hasChildren: 'hasChildren', children: 'children' }),

  // 分页配置
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  small: false,
  disabled: false,

  // 操作列配置
  handlerWidth: 150,
  handlerFixed: 'right',
  handlerAlign: 'center'
})

const emit = defineEmits<Emits>()

// 表格引用
const tableRef = ref()

// 内部状态（用于不使用 useTable 的情况）
const internalData = ref<any[]>([])
const internalLoading = ref(false)
const internalTotal = ref(0)
const internalCurrentPage = ref(1)
const internalPageSize = ref(10)

// 最终使用的状态
const displayData = computed(() => (props.requestApi ? internalData.value : props.data))
const displayLoading = computed(() => (props.requestApi ? internalLoading.value : props.loading))
const displayTotal = computed(() => (props.requestApi ? internalTotal.value : props.total))

// 合并列配置
const displayColumns = computed(() => {
  return props.columns.length > 0 ? props.columns : props.propList
})

// 计算属性
const tableHeight = computed(() => {
  // 如果提供了高度，则计算表格高度
  if (props.height) {
    return props.showPagination ? `calc(100% - 50px)` : '100%'
  }
  // 否则使用默认高度（自动）
  return undefined
})

// 生命周期
onMounted(() => {
  // 如果有请求API，则加载数据
  if (props.requestApi) {
    loadData()
  }
})

// 方法
const loadData = async () => {
  if (!props.requestApi) return

  internalLoading.value = true
  try {
    const params = {
      pageNum: internalCurrentPage.value,
      pageSize: internalPageSize.value,
      ...props.requestParams
    }

    const response = await props.requestApi(params)

    if (response.code === 200 && response.data) {
      internalData.value = response.data.list || response.data.records || []
      internalTotal.value = response.data.total || 0

      // 触发分页变化事件
      emit('page-change', internalCurrentPage.value)
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    internalData.value = []
    internalTotal.value = 0
  } finally {
    internalLoading.value = false
  }
}

// 操作列按钮处理
const getVisibleButtons = (buttons: HandlerButton[], row: any) => {
  const visible = buttons.filter(btn => {
    if (typeof btn.show === 'function') return btn.show(row)
    return btn.show !== false
  })
  return visible.slice(0, 2)
}

const getMoreButtons = (buttons: HandlerButton[], row: any) => {
  const visible = buttons.filter(btn => {
    if (typeof btn.show === 'function') return btn.show(row)
    return btn.show !== false
  })
  return visible.slice(2)
}

const getBtnLabel = (btn: HandlerButton, row: any) => {
  return typeof btn.label === 'function' ? btn.label(row) : btn.label
}

const getBtnType = (btn: HandlerButton, row: any) => {
  return typeof btn.type === 'function' ? btn.type(row) : (btn.type || 'primary')
}

const getBtnDisabled = (btn: HandlerButton, row: any) => {
  return typeof btn.disabled === 'function' ? btn.disabled(row) : btn.disabled
}

const handleOperationClick = (command: string, row: any) => {
  emit('operation-click', command, row)
}

const handleSelect = (selection: any[], row: any) => {
  emit('select', selection, row)
}

const handleSelectAll = (selection: any[]) => {
  emit('select-all', selection)
}

const handleSelectionChange = (selection: any[]) => {
  emit('selection-change', selection)
}

const handleCellMouseEnter = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-mouse-enter', row, column, cell, event)
}

const handleCellMouseLeave = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-mouse-leave', row, column, cell, event)
}

const handleCellClick = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-click', row, column, cell, event)
}

const handleCellDblclick = (row: any, column: any, cell: any, event: Event) => {
  emit('cell-dblclick', row, column, cell, event)
}

const handleRowClick = (row: any, column: any, event: Event) => {
  emit('row-click', row, column, event)
}

const handleRowContextmenu = (row: any, column: any, event: Event) => {
  emit('row-contextmenu', row, column, event)
}

const handleRowDblclick = (row: any, column: any, event: Event) => {
  emit('row-dblclick', row, column, event)
}

const handleHeaderClick = (column: any, event: Event) => {
  emit('header-click', column, event)
}

const handleHeaderContextmenu = (column: any, event: Event) => {
  emit('header-contextmenu', column, event)
}

const handleSortChange = (sort: any) => {
  emit('sort-change', sort)
}

const handleFilterChange = (filters: any) => {
  emit('filter-change', filters)
}

const handleCurrentChange = (currentRow: any, oldCurrentRow: any) => {
  emit('current-change', currentRow, oldCurrentRow)
}

const handleHeaderDragend = (newWidth: number, oldWidth: number, column: any, event: Event) => {
  emit('header-dragend', newWidth, oldWidth, column, event)
}

const handleExpandChange = (row: any, expandedRows: any[]) => {
  emit('expand-change', row, expandedRows)
}

// 分页事件处理
const handleSizeChange = (size: number) => {
  if (props.requestApi) {
    internalPageSize.value = size
    internalCurrentPage.value = 1
    loadData()
  } else {
    emit('size-change', size)
  }
}

const handlePageChange = (page: number) => {
  if (props.requestApi) {
    internalCurrentPage.value = page
    loadData()
  } else {
    emit('page-change', page)
  }
}

// 暴露方法
const getSelectionRows = () => tableRef.value?.getSelectionRows()
const clearSelection = () => tableRef.value?.clearSelection()
const setCurrentRow = (row: any) => tableRef.value?.setCurrentRow(row)
const toggleRowSelection = (row: any, selected: boolean) => tableRef.value?.toggleRowSelection(row, selected)
const toggleAllSelection = () => tableRef.value?.toggleAllSelection()
const toggleRowExpansion = (row: any, expanded: boolean) => tableRef.value?.toggleRowExpansion(row, expanded)

defineExpose({
  tableRef,
  loadData,
  getSelectionRows,
  clearSelection,
  setCurrentRow,
  toggleRowSelection,
  toggleAllSelection,
  toggleRowExpansion
})
</script>

<style scoped lang="scss">
.aimi-table-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: #fff;
  
  .table-content {
    flex: 1;
    overflow: hidden;
    
    :deep(.el-table) {
      width: 100%;
      
      &.el-table--fluid-height {
        height: auto;
      }
    }
  }
  
  .pagination-wrapper {
    padding: 12px 0;
    display: flex;
    justify-content: flex-end;
  }
}

.handler-btns {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
}
</style>
