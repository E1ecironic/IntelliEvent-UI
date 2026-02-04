<template>
  <div class="aimi-search-form">
      <!-- 1. 顶部工具栏 -->
      <div v-if="$slots.toolbar" class="search-toolbar">
        <slot name="toolbar" />
      </div>

      <!-- 2. 搜索表单区域 -->
      <el-form ref="formRef" :model="searchForm" :inline="inline" :label-width="labelWidth" :size="size" v-bind="$attrs" class="search-form-content">
        <el-row :gutter="gutter">
          <!-- 左侧：字段区域 -->
          <el-col :span="20" class="search-fields-area">
            <el-row :gutter="10">
              <!-- 基础字段 -->
              <template v-if="basicFormItems.length > 0">
                <el-col v-for="item in basicFormItems" :key="item.field" :span="item.colSpan || colSpan" :xs="24" :sm="12"
                  :md="item.colSpan || 8" :lg="item.colSpan || 8" :xl="item.colSpan || 6">
                  <el-form-item :label="item.label" :prop="item.field">
                    <!-- 输入框 -->
                    <el-input v-if="item.type === 'input'" v-model="searchForm[item.field]"
                      :placeholder="item.placeholder || `请输入${item.label}`" :disabled="item.disabled"
                      :clearable="item.clearable !== false" v-trim="item.isTrim !== false" @keyup.enter="handleSearch" />

                    <!-- 选择框 -->
                    <el-select v-else-if="item.type === 'select'" v-model="searchForm[item.field]"
                      :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
                      :clearable="item.clearable !== false" :filterable="item.filterable !== false" :multiple="item.multiple"
                      :collapse-tags="item.collapseTags">
                      <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value"
                        :disabled="option.disabled" />
                    </el-select>

                    <!-- 日期选择器 -->
                    <el-date-picker v-else-if="item.type === 'datepicker'" v-model="searchForm[item.field]"
                      :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
                      :clearable="item.clearable !== false" :format="item.format || 'YYYY-MM-DD'"
                      :value-format="item.valueFormat || 'YYYY-MM-DD'" :type="item.dateType || 'date'"
                      :range-separator="item.rangeSeparator || '至'" :start-placeholder="item.startPlaceholder || '开始日期'"
                      :end-placeholder="item.endPlaceholder || '结束日期'" />

                    <!-- 自定义插槽 -->
                    <slot v-else-if="item.slotName" :name="item.slotName" :item="item" :value="searchForm[item.field]"
                      :searchForm="searchForm" />

                    <!-- 默认输入框 -->
                    <el-input v-else v-model="searchForm[item.field]" :placeholder="item.placeholder || `请输入${item.label}`"
                      :disabled="item.disabled" :clearable="item.clearable !== false" v-trim="item.isTrim !== false"
                      @keyup.enter="handleSearch" />
                  </el-form-item>
                </el-col>
              </template>
            </el-row>

            <!-- 高级字段 -->
            <el-collapse-transition>
              <div v-show="advancedFormItems.length > 0 && (showAdvancedSearch || !showAdvancedToggle)" class="advanced-search-wrapper">
                <el-row :gutter="10">
                  <el-col v-for="item in advancedFormItems" :key="item.field" :span="item.colSpan || colSpan" :xs="24" :sm="12"
                    :md="item.colSpan || 8" :lg="item.colSpan || 8" :xl="item.colSpan || 6">
                    <el-form-item :label="item.label" :prop="item.field">
                      <!-- 输入框 -->
                      <el-input v-if="item.type === 'input'" v-model="searchForm[item.field]"
                        :placeholder="item.placeholder || `请输入${item.label}`" :disabled="item.disabled"
                        :clearable="item.clearable !== false" v-trim="item.isTrim !== false" @keyup.enter="handleSearch" />

                      <!-- 选择框 -->
                      <el-select v-else-if="item.type === 'select'" v-model="searchForm[item.field]"
                        :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
                        :clearable="item.clearable !== false" :filterable="item.filterable !== false" :multiple="item.multiple"
                        :collapse-tags="item.collapseTags">
                        <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value"
                          :disabled="option.disabled" />
                      </el-select>

                      <!-- 日期选择器 -->
                      <el-date-picker v-else-if="item.type === 'datepicker'" v-model="searchForm[item.field]"
                        :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
                        :clearable="item.clearable !== false" :format="item.format || 'YYYY-MM-DD'"
                        :value-format="item.valueFormat || 'YYYY-MM-DD'" :type="item.dateType || 'date'"
                        :range-separator="item.rangeSeparator || '至'" :start-placeholder="item.startPlaceholder || '开始日期'"
                        :end-placeholder="item.endPlaceholder || '结束日期'" />

                      <!-- 自定义插槽 -->
                      <slot v-else-if="item.slotName" :name="item.slotName" :item="item" :value="searchForm[item.field]"
                        :searchForm="searchForm" />

                      <!-- 默认输入框 -->
                      <el-input v-else v-model="searchForm[item.field]" :placeholder="item.placeholder || `请输入${item.label}`"
                        :disabled="item.disabled" :clearable="item.clearable !== false" v-trim="item.isTrim !== false"
                        @keyup.enter="handleSearch" />
                    </el-form-item>
                  </el-col>
                </el-row>
              </div>
            </el-collapse-transition>
          </el-col>

          <!-- 右侧：操作按钮 -->
          <el-col :span="4" class="search-actions-area">
            <div class="action-buttons">
              <div class="primary-actions">
                <el-button v-if="showSearch" type="primary" @click="handleSearch" :icon="Search">
                  搜索
                </el-button>
                <el-button v-if="showReset" @click="handleReset" :icon="Refresh">
                  重置
                </el-button>
              </div>
              <el-button v-if="showAdvancedToggle && advancedFormItems.length > 0" text @click="toggleAdvanced" class="advanced-toggle-btn">
                {{ showAdvancedSearch ? '收起' : '高级搜索' }}
                <el-icon class="el-icon--right">
                  <component :is="showAdvancedSearch ? ArrowUp : ArrowDown" />
                </el-icon>
              </el-button>
              <slot name="actions" :searchForm="searchForm" />
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { Search, Refresh, ArrowUp, ArrowDown } from '@element-plus/icons-vue'
import type { FormOption } from '@/types/form'

interface Props {
  formItems: FormOption[]
  basicFields?: string[] // 基础字段（始终显示）
  showSearch?: boolean
  showReset?: boolean
  inline?: boolean
  labelWidth?: string | number
  size?: 'large' | 'default' | 'small'
  gutter?: number
  colSpan?: number
  defaultValues?: Record<string, any>
  defaultAdvanced?: boolean // 默认是否展开高级搜索
  showAdvancedToggle?: boolean // 是否显示高级搜索切换按钮
}

interface Emits {
  (e: 'search', form: Record<string, any>): void
  (e: 'reset'): void
}

const props = withDefaults(defineProps<Props>(), {
  showSearch: true,
  showReset: true,
  inline: true,
  labelWidth: '80px',
  size: 'default',
  gutter: 20,
  colSpan: 6,
  defaultValues: () => ({}),
  defaultAdvanced: false,
  showAdvancedToggle: false,
  basicFields: () => []
})

const emit = defineEmits<Emits>()

// Refs
const formRef = ref()

// 响应式数据
const searchForm = reactive<Record<string, any>>({})
const showAdvancedSearch = ref(props.defaultAdvanced)

// 计算属性 - 分离基础字段和高级字段
const basicFormItems = computed(() => {
  if (!props.basicFields || props.basicFields.length === 0) {
    return props.formItems
  }
  return props.formItems.filter(item => props.basicFields.includes(item.field))
})

const advancedFormItems = computed(() => {
  if (!props.basicFields || props.basicFields.length === 0) {
    return []
  }
  return props.formItems.filter(item => !props.basicFields.includes(item.field))
})

// 初始化表单数据
const initFormData = () => {
  props.formItems.forEach(item => {
    searchForm[item.field] = props.defaultValues[item.field] ?? ''
  })
}

// 搜索
const handleSearch = () => {
  emit('search', { ...searchForm })
}

// 重置
const handleReset = () => {
  formRef.value?.resetFields()
  initFormData()
  emit('reset')
}

// 切换高级搜索
const toggleAdvanced = () => {
  showAdvancedSearch.value = !showAdvancedSearch.value
}

// 获取表单数据
const getFormData = () => {
  return { ...searchForm }
}

// 设置表单数据
const setFormData = (data: Record<string, any>) => {
  Object.assign(searchForm, data)
}

// 监听默认值变化
watch(() => props.defaultValues, initFormData, { deep: true, immediate: true })

// 暴露方法
defineExpose({
  getFormData,
  setFormData,
  handleSearch,
  handleReset
})
</script>

<style scoped lang="scss">
.aimi-search-form {
  width: 100%;
  box-sizing: border-box;
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}

.search-toolbar {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding-left: 30px;
}

.search-actions-area {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.primary-actions {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.advanced-toggle-btn {
  margin-left: 0 !important;
}

:deep(.el-date-editor.el-input),
  :deep(.el-date-editor.el-input__wrapper),
  :deep(.el-select),
  :deep(.el-input) {
    width: 220px;
  }

  .aimi-search-form {
    background-color: #fff;
    padding: 20px;
    border-radius: 4px;
  }
</style>