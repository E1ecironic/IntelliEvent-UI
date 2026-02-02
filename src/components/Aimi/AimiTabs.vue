<template>
  <div class="aimi-tabs">
    <el-tabs
      v-model="activeTab"
      :type="type"
      :closable="closable"
      :addable="addable"
      :editable="editable"
      :tab-position="tabPosition"
      :stretch="stretch"
      :before-leave="beforeLeave"
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
      @tab-add="handleTabAdd"
      @edit="handleEdit"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.name"
        :label="tab.label"
        :name="tab.name"
        :disabled="tab.disabled"
        :closable="tab.closable"
        :lazy="tab.lazy"
      >
        <slot :name="tab.name" :tab="tab" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { TabOption } from '@/types/tabs'

interface Props {
  modelValue?: string
  tabs: TabOption[]
  type?: 'card' | 'border-card'
  closable?: boolean
  addable?: boolean
  editable?: boolean
  tabPosition?: 'top' | 'right' | 'bottom' | 'left'
  stretch?: boolean
  beforeLeave?: (activeName: string, oldActiveName: string) => boolean | Promise<boolean>
}

interface Emits {
  (e: 'update:modelValue', value: string): void
  (e: 'tab-click', tab: any, event: Event): void
  (e: 'tab-remove', name: string): void
  (e: 'tab-add'): void
  (e: 'edit', targetName: string, action: 'remove' | 'add'): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  type: 'card',
  closable: false,
  addable: false,
  editable: false,
  tabPosition: 'top',
  stretch: false
})

const emit = defineEmits<Emits>()

// Refs
const activeTab = ref(props.modelValue || (props.tabs.length > 0 ? props.tabs[0].name : ''))

// Watch
watch(() => props.modelValue, (newVal) => {
  if (newVal && newVal !== activeTab.value) {
    activeTab.value = newVal
  }
})

watch(activeTab, (newVal) => {
  emit('update:modelValue', newVal)
})

// Methods
const handleTabClick = (tab: any, event: Event) => {
  emit('tab-click', tab, event)
}

const handleTabRemove = (name: string) => {
  emit('tab-remove', name)
}

const handleTabAdd = () => {
  emit('tab-add')
}

const handleEdit = (targetName: string, action: 'remove' | 'add') => {
  emit('edit', targetName, action)
}

// 设置当前激活的标签
const setActiveTab = (name: string) => {
  activeTab.value = name
}

// 获取当前激活的标签
const getActiveTab = () => {
  return activeTab.value
}

// 暴露方法
defineExpose({
  setActiveTab,
  getActiveTab
})
</script>

<style scoped lang="scss">
.aimi-tabs {
  width: 100%;
}
</style>