<template>
  <div class="aimi-search">
    <div class="search-header" v-if="showHeader">
      <div class="search-title" v-if="title">{{ title }}</div>
      <div class="search-actions">
        <slot name="button" />
        <el-button
          v-if="showAdvanced"
          type="text"
          :icon="showAdvancedSearch ? ArrowUp : ArrowDown"
          @click="toggleAdvanced"
        >
          {{ showAdvancedSearch ? '收起' : '展开' }}
        </el-button>
      </div>
    </div>
    
    <div class="search-content" :class="{ 'advanced-show': showAdvancedSearch }">
      <slot />
      
      <div v-if="$slots.advanced" class="advanced-content" v-show="showAdvancedSearch">
        <slot name="advanced" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowUp, ArrowDown } from '@element-plus/icons-vue'

interface Props {
  title?: string
  showHeader?: boolean
  showAdvanced?: boolean
  defaultAdvanced?: boolean
}

interface Emits {
  (e: 'toggle-advanced', show: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  showHeader: true,
  showAdvanced: false,
  defaultAdvanced: false
})

const emit = defineEmits<Emits>()

// Refs
const showAdvancedSearch = ref(props.defaultAdvanced)

// Methods
const toggleAdvanced = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
  emit('toggle-advanced', showAdvancedSearch.value)
}

const setAdvancedShow = (show: boolean) => {
  showAdvancedSearch.value = show
}

// 暴露方法
defineExpose({
  toggleAdvanced,
  setAdvancedShow
})
</script>

<style scoped lang="scss">
.aimi-search {
  background-color: var(--el-bg-color);
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 16px;
  
  .search-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    
    .search-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
    
    .search-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
  }
  
  .search-content {
    position: relative;
    width: 100%;
    overflow: hidden;
    
    &.advanced-show {
      padding-bottom: 8px;
    }
  }
  
  .advanced-content {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>