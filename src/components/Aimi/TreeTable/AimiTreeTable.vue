<template>
  <div class="aimi-tree-table" v-loading="loading">
    <!-- Header -->
    <div class="tree-header">
      <div v-for="(col, idx) in displayColumns" :key="col.prop" 
           class="header-cell"
           :class="['align-' + (col.align || 'left')]"
           :style="getCellStyle(col)">
        {{ col.label }}
      </div>
    </div>
    
    <!-- Body -->
    <div class="tree-body">
      <TreeRow v-for="(row, idx) in data" :key="row[rowKey] || idx"
               :row="row" :columns="displayColumns" :row-key="rowKey"
               :children-prop="treeProps.children" :row-index="idx" :level="0"
               @operation-click="handleOperationClick">
         <template v-for="(_, name) in $slots" #[name]="slotData">
             <slot :name="name" v-bind="slotData" />
         </template>
      </TreeRow>
      
      <!-- Empty -->
      <div v-if="!data || data.length === 0" class="tree-empty">
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide, type Ref } from 'vue'
import TreeRow from './TreeRow.vue'
import type { ColumnOption } from '@/types/table'

interface Props {
  data: any[]
  columns: ColumnOption[]
  rowKey?: string
  treeProps?: { children: string, hasChildren: string }
  emptyText?: string
  loading?: boolean
}

interface Emits {
  (e: 'operation-click', command: string, row: any): void
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  columns: () => [],
  rowKey: 'id',
  treeProps: () => ({ children: 'children', hasChildren: 'hasChildren' }),
  emptyText: '暂无数据',
  loading: false
})

const emit = defineEmits<Emits>()

const displayColumns = computed(() => props.columns)

// Expansion State
const expandedKeys = ref<Set<string | number>>(new Set())

provide('expandedKeys', expandedKeys)
provide('toggleExpansion', (key: string | number, expanded: boolean) => {
  const newSet = new Set(expandedKeys.value)
  if (expanded) newSet.add(key)
  else newSet.delete(key)
  expandedKeys.value = newSet
})

const getCellStyle = (col: ColumnOption) => {
  const style: any = {}
  if (col.width) {
    style.flex = `0 0 ${col.width}px`
    style.width = `${col.width}px`
  } else if (col.minWidth) {
    style.flex = `1 1 ${col.minWidth}px`
    style.minWidth = `${col.minWidth}px`
  } else {
    style.flex = '1 1 0'
  }
  return style
}

const handleOperationClick = (command: string, row: any) => {
  emit('operation-click', command, row)
}

const toggleRowExpansion = (row: any, expanded: boolean) => {
  if (!row) return
  const key = row[props.rowKey]
  const newSet = new Set(expandedKeys.value)
  if (expanded) newSet.add(key)
  else newSet.delete(key)
  expandedKeys.value = newSet
}

defineExpose({
  toggleRowExpansion
})
</script>

<style scoped lang="scss">
.aimi-tree-table {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color-lighter);
  border-bottom: none;
  background-color: #fff;
}

.tree-header {
  display: flex;
  background-color: #f5f7fa;
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-weight: bold;
  color: var(--el-text-color-regular);
  flex-shrink: 0;
}

.header-cell {
  padding: 20px 12px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  border-right: 1px solid var(--el-border-color-lighter);
  
  &.align-center {
    justify-content: center;
  }
  &.align-right {
    justify-content: flex-end;
  }

  &:last-child {
    border-right: none;
  }
}

.tree-empty {
  padding: 30px;
  text-align: center;
  color: var(--el-text-color-secondary);
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.tree-body {
  flex: 1;
  overflow-y: auto;
}
</style>
