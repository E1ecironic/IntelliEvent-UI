<template>
  <div class="aimi-table">
    <div class="table-wrapper">
      <vxe-table
        ref="tableRef"
        :data="tableData"
        :loading="loading"
        :height="tableHeight"
        :max-height="maxHeight"
        :stripe="stripe"
        :border="border"
        :show-header="showHeader"
        :show-overflow="showOverflow"
        :show-header-overflow="showHeaderOverflow"
        :highlight-current-row="highlightCurrentRow"
        :highlight-hover-row="highlightHoverRow"
        :highlight-current-column="highlightCurrentColumn"
        :highlight-hover-column="highlightHoverColumn"
        :resizable="resizable"
        :auto-resize="autoResize"
        :fit="fit"
        :empty-text="emptyText"
        :row-class-name="rowClassName"
        :cell-class-name="cellClassName"
        :header-row-class-name="headerRowClassName"
        :header-cell-class-name="headerCellClassName"
        :sort-config="sortConfig"
        :filter-config="filterConfig"
        :expand-config="expandConfig"
        :tree-config="treeConfig"
        :edit-config="editConfig"
        :checkbox-config="checkboxConfig"
        :radio-config="radioConfig"
        :tooltip-config="tooltipConfig"
        :menu-config="menuConfig"
        :custom-config="customConfig"
        :scroll-x="scrollX"
        :scroll-y="scrollY"
        :span-method="spanMethod"
        :footer-method="footerMethod"
        :footer-span-method="footerSpanMethod"
        :show-footer="showFooter"
        :footer-class-name="footerClassName"
        :footer-cell-class-name="footerCellClassName"
        :footer-row-class-name="footerRowClassName"
        @cell-click="handleCellClick"
        @cell-dblclick="handleCellDblclick"
        @cell-mouseenter="handleCellMouseenter"
        @cell-mouseleave="handleCellMouseleave"
        @current-change="handleCurrentChange"
        @radio-change="handleRadioChange"
        @checkbox-change="handleCheckboxChange"
        @checkbox-all="handleCheckboxAll"
        @sort-change="handleSortChange"
        @filter-change="handleFilterChange"
        @resizable-change="handleResizableChange"
        @toggle-row-expand="handleToggleRowExpand"
        @toggle-tree-expand="handleToggleTreeExpand"
        @edit-closed="handleEditClosed"
        @edit-actived="handleEditActived"
        @edit-disabled="handleEditDisabled"
        @scroll="handleScroll"
      >
        <!-- 序号列 -->
        <vxe-column
          v-if="showIndexColumn"
          type="seq"
          width="60"
          align="center"
          title="#"
        />

        <!-- 选择列 -->
        <vxe-column
          v-if="showSelectColumn"
          type="checkbox"
          width="50"
          align="center"
        />

        <!-- 单选列 -->
        <vxe-column
          v-if="showRadioColumn"
          type="radio"
          width="50"
          align="center"
        />

        <!-- 展开列 -->
        <vxe-column
          v-if="showExpandColumn"
          type="expand"
          width="50"
          align="center"
        >
          <template #content="{ row }">
            <slot name="expand" :row="row" />
          </template>
        </vxe-column>

        <!-- 数据列 -->
        <vxe-column
          v-for="column in columns"
          :key="column.prop"
          :field="column.prop"
          :title="column.label"
          :width="column.width"
          :min-width="column.minWidth"
          :align="column.align || 'left'"
          :fixed="column.fixed"
          :sortable="column.sortable"
          :filters="column.filters"
          :filter-multiple="column.filterMultiple"
          :filter-method="column.filterMethod"
          :formatter="column.formatter"
          :edit-render="column.editRender"
          :class-name="column.className"
          :header-class-name="column.headerClassName"
          :footer-class-name="column.footerClassName"
          :show-overflow="column.showOverflow"
          :show-header-overflow="column.showHeaderOverflow"
          :show-footer-overflow="column.showFooterOverflow"
          :resizable="column.resizable !== false"
          :visible="column.visible !== false"
          :drag-sort="column.dragSort"
          :tree-node="column.treeNode"
        >
          <!-- 自定义列模板 -->
          <template #default="{ row, rowIndex, column: col, $rowIndex, $columnIndex }">
            <slot
              v-if="column.slotName"
              :name="column.slotName"
              :row="row"
              :index="rowIndex"
              :column="col"
              :$rowIndex="$rowIndex"
              :$columnIndex="$columnIndex"
            />
            <span v-else-if="column.formatter">
              {{ column.formatter(row, col, row[column.prop], rowIndex) }}
            </span>
            <span v-else>
              {{ row[column.prop] }}
            </span>
          </template>

          <!-- 编辑模板 -->
          <template v-if="column.editRender" #edit="{ row, rowIndex }">
            <slot
              v-if="column.editSlotName"
              :name="column.editSlotName"
              :row="row"
              :index="rowIndex"
            />
            <template v-else>
              <!-- 输入框编辑 -->
              <vxe-input
                v-if="column.editRender.name === 'input'"
                v-model="row[column.prop]"
                v-bind="column.editRender.props || {}"
              />
              <!-- 选择框编辑 -->
              <vxe-select
                v-else-if="column.editRender.name === 'select'"
                v-model="row[column.prop]"
                v-bind="column.editRender.props || {}"
              >
                <vxe-option
                  v-for="option in column.editRender.options"
                  :key="option.value"
                  :value="option.value"
                  :label="option.label"
                />
              </vxe-select>
              <!-- 日期编辑 -->
              <vxe-input
                v-else-if="column.editRender.name === 'date'"
                v-model="row[column.prop]"
                type="date"
                v-bind="column.editRender.props || {}"
              />
            </template>
          </template>

          <!-- 表头模板 -->
          <template v-if="column.headerSlotName" #header="{ column: col }">
            <slot
              :name="column.headerSlotName"
              :column="col"
            />
          </template>

          <!-- 表尾模板 -->
          <template v-if="column.footerSlotName" #footer="{ items, $rowIndex }">
            <slot
              :name="column.footerSlotName"
              :items="items"
              :$rowIndex="$rowIndex"
            />
          </template>
        </vxe-column>

        <!-- 操作列 -->
        <vxe-column
          v-if="showHandlerColumn"
          field="handler"
          title="操作"
          :width="handlerWidth"
          :fixed="handlerFixed"
          :align="handlerAlign"
          :class-name="handlerClassName"
        >
          <template #default="{ row, rowIndex }">
            <slot
              name="handler"
              :row="row"
              :index="rowIndex"
            />
          </template>
        </vxe-column>
      </vxe-table>
    </div>

    <!-- 分页 -->
    <div v-if="showPagination" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="pageSizes"
        :layout="layout"
        :background="background"
        :small="small"
        :disabled="disabled"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import type { VxeTableInstance, VxeTablePropTypes, VxeColumnPropTypes } from 'vxe-table'
import type { TableOption, ColumnOption, PaginationOption } from '@/types/table'

interface Props {
  // 数据
  data?: any[]
  requestApi?: (params: any) => Promise<any>
  requestParams?: Record<string, any>
  
  // 表格配置
  tableOption?: TableOption
  columns?: ColumnOption[]
  
  // 显示控制
  showIndexColumn?: boolean
  showSelectColumn?: boolean
  showRadioColumn?: boolean
  showExpandColumn?: boolean
  showHandlerColumn?: boolean
  showPagination?: boolean
  showSummary?: boolean
  showFooter?: boolean
  
  // 样式
  height?: string | number
  maxHeight?: string | number
  stripe?: boolean
  border?: boolean
  fit?: boolean
  showHeader?: boolean
  showOverflow?: boolean | string
  showHeaderOverflow?: boolean | string
  highlightCurrentRow?: boolean
  highlightHoverRow?: boolean
  highlightCurrentColumn?: boolean
  highlightHoverColumn?: boolean
  resizable?: boolean
  autoResize?: boolean
  
  // 分页配置
  paginationOption?: PaginationOption
  pageSizes?: number[]
  layout?: string
  background?: boolean
  small?: boolean
  disabled?: boolean
  
  // 其他配置
  emptyText?: string
  rowClassName?: string | ((params: any) => string)
  cellClassName?: string | ((params: any) => string)
  headerRowClassName?: string | ((params: any) => string)
  headerCellClassName?: string | ((params: any) => string)
  footerRowClassName?: string | ((params: any) => string)
  footerCellClassName?: string | ((params: any) => string)
  handlerWidth?: string | number
  handlerFixed?: string | boolean
  handlerAlign?: string
  handlerClassName?: string
  
  // 功能配置
  sortConfig?: VxeTablePropTypes.SortConfig
  filterConfig?: VxeTablePropTypes.FilterConfig
  expandConfig?: VxeTablePropTypes.ExpandConfig
  treeConfig?: VxeTablePropTypes.TreeConfig
  editConfig?: VxeTablePropTypes.EditConfig
  checkboxConfig?: VxeTablePropTypes.CheckboxConfig
  radioConfig?: VxeTablePropTypes.RadioConfig
  tooltipConfig?: VxeTablePropTypes.TooltipConfig
  menuConfig?: VxeTablePropTypes.MenuConfig
  customConfig?: VxeTablePropTypes.CustomConfig
  scrollX?: VxeTablePropTypes.ScrollX
  scrollY?: VxeTablePropTypes.ScrollY
  spanMethod?: VxeTablePropTypes.SpanMethod
  footerMethod?: VxeTablePropTypes.FooterMethod
  footerSpanMethod?: VxeTablePropTypes.FooterSpanMethod
}

interface Emits {
  (e: 'cell-click', params: any): void
  (e: 'cell-dblclick', params: any): void
  (e: 'cell-mouseenter', params: any): void
  (e: 'cell-mouseleave', params: any): void
  (e: 'current-change', params: any): void
  (e: 'radio-change', params: any): void
  (e: 'checkbox-change', params: any): void
  (e: 'checkbox-all', params: any): void
  (e: 'sort-change', params: any): void
  (e: 'filter-change', params: any): void
  (e: 'resizable-change', params: any): void
  (e: 'toggle-row-expand', params: any): void
  (e: 'toggle-tree-expand', params: any): void
  (e: 'edit-closed', params: any): void
  (e: 'edit-actived', params: any): void
  (e: 'edit-disabled', params: any): void
  (e: 'scroll', params: any): void
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  requestParams: () => ({}),
  columns: () => [],
  
  // 显示控制
  showIndexColumn: false,
  showSelectColumn: false,
  showRadioColumn: false,
  showExpandColumn: false,
  showHandlerColumn: false,
  showPagination: true,
  showSummary: false,
  showFooter: false,
  
  // 样式
  stripe: true,
  border: true,
  fit: true,
  showHeader: true,
  showOverflow: 'tooltip',
  showHeaderOverflow: 'tooltip',
  highlightCurrentRow: false,
  highlightHoverRow: true,
  highlightCurrentColumn: false,
  highlightHoverColumn: false,
  resizable: true,
  autoResize: true,
  
  // 分页配置
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  small: false,
  disabled: false,
  
  // 其他配置
  emptyText: '暂无数据',
  handlerWidth: 150,
  handlerFixed: 'right',
  handlerAlign: 'center'
})

const emit = defineEmits<Emits>()

// Refs
const tableRef = ref<VxeTableInstance>()

// 响应式数据
const loading = ref(false)
const tableData = ref<any[]>([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const tableHeight = ref<number | string>('auto')

// 计算属性
const columns = computed(() => {
  if (props.tableOption?.propList) {
    return props.tableOption.propList.map(col => ({
      ...col,
      editRender: col.editable ? {
        name: col.editType || 'input',
        options: col.editOptions,
        props: col.editProps
      } : undefined
    }))
  }
  return props.columns
})

// 方法
const loadData = async () => {
  if (!props.requestApi) return
  
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
      ...props.requestParams
    }
    
    const response = await props.requestApi(params)
    
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

const refresh = () => {
  loadData()
}

const reload = (params?: Record<string, any>) => {
  if (params) {
    Object.assign(props.requestParams, params)
  }
  currentPage.value = 1
  loadData()
}

const getData = () => {
  return tableData.value
}

const getSelectRecords = () => {
  return tableRef.value?.getCheckboxRecords() || []
}

const getSelectIds = () => {
  return getSelectRecords().map(item => item.id)
}

const clearSelection = () => {
  tableRef.value?.clearCheckboxRow()
}

const toggleRowSelection = (row: any, selected?: boolean) => {
  tableRef.value?.setCheckboxRow(row, selected)
}

const toggleAllSelection = () => {
  tableRef.value?.toggleAllCheckboxRow()
}

const setCurrentRow = (row: any) => {
  tableRef.value?.setCurrentRow(row)
}

const clearCurrentRow = () => {
  tableRef.value?.clearCurrentRow()
}

const getCurrentRow = () => {
  return tableRef.value?.getCurrentRecord()
}

// 事件处理
const handleCellClick = (params: any) => {
  emit('cell-click', params)
}

const handleCellDblclick = (params: any) => {
  emit('cell-dblclick', params)
}

const handleCellMouseenter = (params: any) => {
  emit('cell-mouseenter', params)
}

const handleCellMouseleave = (params: any) => {
  emit('cell-mouseleave', params)
}

const handleCurrentChange = (params: any) => {
  emit('current-change', params)
}

const handleRadioChange = (params: any) => {
  emit('radio-change', params)
}

const handleCheckboxChange = (params: any) => {
  emit('checkbox-change', params)
}

const handleCheckboxAll = (params: any) => {
  emit('checkbox-all', params)
}

const handleSortChange = (params: any) => {
  emit('sort-change', params)
}

const handleFilterChange = (params: any) => {
  emit('filter-change', params)
}

const handleResizableChange = (params: any) => {
  emit('resizable-change', params)
}

const handleToggleRowExpand = (params: any) => {
  emit('toggle-row-expand', params)
}

const handleToggleTreeExpand = (params: any) => {
  emit('toggle-tree-expand', params)
}

const handleEditClosed = (params: any) => {
  emit('edit-closed', params)
}

const handleEditActived = (params: any) => {
  emit('edit-actived', params)
}

const handleEditDisabled = (params: any) => {
  emit('edit-disabled', params)
}

const handleScroll = (params: any) => {
  emit('scroll', params)
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
  loadData()
  emit('size-change', val)
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
  loadData()
  emit('current-change', val)
}

// 生命周期
onMounted(() => {
  if (props.requestApi) {
    loadData()
  } else if (props.data) {
    tableData.value = props.data
    total.value = props.data.length
  }
})

// 监听数据变化
watch(() => props.data, (newData) => {
  if (newData && !props.requestApi) {
    tableData.value = newData
    total.value = newData.length
  }
}, { immediate: true, deep: true })

watch(() => props.requestParams, () => {
  if (props.requestApi) {
    currentPage.value = 1
    loadData()
  }
}, { deep: true })

// 暴露方法
defineExpose({
  refresh,
  reload,
  getData,
  getSelectRecords,
  getSelectIds,
  clearSelection,
  toggleRowSelection,
  toggleAllSelection,
  setCurrentRow,
  clearCurrentRow,
  getCurrentRow,
  tableRef
})
</script>

<style scoped lang="scss">
.aimi-table {
  width: 100%;
  
  .table-wrapper {
    margin-bottom: 16px;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}
</style>