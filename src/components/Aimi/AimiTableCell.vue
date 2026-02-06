<template>
  <div class="aimi-table-cell">
    <slot v-if="column.slotName" :name="column.slotName" :row="row" :column="column" :$index="index"
      :cell-value="row[column.prop]" />
    
    <div v-else-if="column.buttons && column.buttons.length > 0" class="handler-btns">
      <el-button
        v-for="btn in getVisibleButtons(column.buttons, row)"
        :key="btn.command"
        :type="getBtnType(btn, row) as any"
        :icon="btn.icon"
        :disabled="getBtnDisabled(btn, row)"
        :link="btn.link !== false"
        :plain="btn.plain"
        :text="btn.text"
        size="small"
        @click="handleOperationClick(btn.command, row)"
      >
        {{ getBtnLabel(btn, row) }}
      </el-button>
      
      <el-dropdown 
        v-if="getMoreButtons(column.buttons, row).length > 0" 
        @command="(command: string) => handleOperationClick(command, row)"
      >
        <el-button link type="info" size="small">
          更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="btn in getMoreButtons(column.buttons, row)"
              :key="btn.command"
              :command="btn.command"
              :icon="btn.icon"
              :disabled="getBtnDisabled(btn, row)"
              :style="typeof btn.style === 'object' ? btn.style : {}"
            >
              {{ getBtnLabel(btn, row) }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    
    <span v-else>{{ (row[column.prop] === null || row[column.prop] === '' || row[column.prop] === undefined) ? '-' : row[column.prop] }}</span>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown } from '@element-plus/icons-vue'
import type { ColumnOption, HandlerButton } from '@/types/table'

interface Props {
  row: any
  column: ColumnOption
  index: number
}

interface Emits {
  (e: 'operation-click', command: string, row: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Helper functions (copied from AimiTable)
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
</script>

<style scoped lang="scss">
.aimi-table-cell {
  width: 100%;
}

.handler-btns {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  flex-wrap: nowrap;

  :deep(.el-button) {
    margin-left: 0 !important;
  }
}
</style>
