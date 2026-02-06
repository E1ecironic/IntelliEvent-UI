<template>
  <div class="tree-row-wrapper">
    <div class="tree-row" :class="{ 'is-hover': isHover }" 
         @mouseenter="isHover = true" @mouseleave="isHover = false">
      <div v-for="(col, idx) in columns" :key="col.prop" 
           class="tree-cell"
           :class="['align-' + (col.align || 'left')]"
           :style="getCellStyle(col)">
        
        <div v-if="idx === 0" class="expand-icon-wrapper" :style="{ paddingLeft: (level * 24) + 'px' }">
          <span v-if="hasChildren" class="expand-icon" @click.stop="toggleExpand">
             <el-icon :class="{ 'is-active': isExpanded }"><ArrowRight /></el-icon>
          </span>
          <span v-else class="expand-placeholder"></span>
        </div>

        <div class="cell-content">
           <AimiTableCell :row="row" :column="col" :index="rowIndex" @operation-click="handleOperationClick">
              <template v-for="(_, name) in slots" #[name]="slotData">
                 <slot :name="name" v-bind="slotData" />
              </template>
           </AimiTableCell>
        </div>
      </div>
    </div>
    
    <el-collapse-transition>
      <div v-show="isExpanded && hasChildren" class="tree-children">
        <TreeRow v-for="(child, idx) in (row[childrenProp] as any[])" :key="child[rowKey] || idx"
                  :row="child" :columns="columns" :level="level + 1" 
                  :row-key="rowKey" :children-prop="childrenProp"
                  :row-index="idx"
                  @operation-click="handleOperationClick">
           <template v-for="(_, name) in slots" #[name]="slotData">
             <slot :name="name" v-bind="slotData" />
           </template>
        </TreeRow>
      </div>
    </el-collapse-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, type Ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import AimiTableCell from '../AimiTableCell.vue'
import type { ColumnOption } from '@/types/table'

interface Props {
  row: any
  columns: ColumnOption[]
  level: number
  rowKey?: string
  childrenProp?: string
  rowIndex: number
}

interface Emits {
  (e: 'operation-click', command: string, row: any): void
}

type SlotProps = Record<string, unknown>

const props = withDefaults(defineProps<Props>(), {
  rowKey: 'id',
  childrenProp: 'children',
  level: 0
})

const emit = defineEmits<Emits>()
const slots = defineSlots<Record<string, (props: SlotProps) => any>>()

const isHover = ref(false)

const expandedKeys = inject<Ref<Set<string | number>>>('expandedKeys')
const toggleExpansion = inject<(key: string | number, expanded: boolean) => void>('toggleExpansion')

const isExpanded = computed(() => {
  if (!expandedKeys || !expandedKeys.value) return false
  return expandedKeys.value.has(props.row[props.rowKey])
})

const hasChildren = computed(() => {
  return props.row[props.childrenProp] && props.row[props.childrenProp].length > 0
})

const toggleExpand = () => {
  if (toggleExpansion) {
    toggleExpansion(props.row[props.rowKey], !isExpanded.value)
  }
}

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
</script>

<style scoped lang="scss">
.tree-row {
  display: flex;
  border-bottom: 1px solid var(--el-border-color-lighter);
  transition: background-color 0.25s ease;
  
  &.is-hover {
    background-color: var(--el-table-row-hover-bg-color);
  }
}

.tree-cell {
  padding: 20px 12px;
  display: flex;
  align-items: center;
  overflow: hidden;
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

.expand-icon-wrapper {
  display: flex;
  align-items: center;
  margin-right: 8px;
  flex-shrink: 0;
}

.expand-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  color: var(--el-text-color-regular);
  transition: transform 0.3s;
  
  .el-icon {
    transition: transform 0.3s;
    &.is-active {
      transform: rotate(90deg);
    }
  }
}

.expand-placeholder {
  width: 14px;
  display: inline-block;
}

.cell-content {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
