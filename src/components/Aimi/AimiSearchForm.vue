<template>
  <div class="aimi-search-form">
    <el-form
      ref="formRef"
      :model="searchForm"
      :inline="inline"
      :label-width="labelWidth"
      :size="size"
      v-bind="$attrs"
    >
      <el-row :gutter="gutter">
        <el-col
          v-for="item in formItems"
          :key="item.field"
          :span="item.colSpan || colSpan"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          :xl="4"
        >
          <el-form-item
            :label="item.label"
            :prop="item.field"
          >
            <!-- 输入框 -->
            <el-input
              v-if="item.type === 'input'"
              v-model="searchForm[item.field]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              v-trim="item.isTrim !== false"
              @keyup.enter="handleSearch"
            />

            <!-- 选择框 -->
            <el-select
              v-else-if="item.type === 'select'"
              v-model="searchForm[item.field]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              :filterable="item.filterable !== false"
              :multiple="item.multiple"
              :collapse-tags="item.collapseTags"
              style="width: 100%"
            >
              <el-option
                v-for="option in item.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
                :disabled="option.disabled"
              />
            </el-select>

            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="item.type === 'datepicker'"
              v-model="searchForm[item.field]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              :format="item.format || 'YYYY-MM-DD'"
              :value-format="item.valueFormat || 'YYYY-MM-DD'"
              :type="item.dateType || 'date'"
              :range-separator="item.rangeSeparator || '至'"
              :start-placeholder="item.startPlaceholder || '开始日期'"
              :end-placeholder="item.endPlaceholder || '结束日期'"
              style="width: 100%"
            />

            <!-- 自定义插槽 -->
            <slot
              v-else-if="item.slotName"
              :name="item.slotName"
              :item="item"
              :value="searchForm[item.field]"
              :searchForm="searchForm"
            />

            <!-- 默认输入框 -->
            <el-input
              v-else
              v-model="searchForm[item.field]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :disabled="item.disabled"
              :clearable="item.clearable !== false"
              v-trim="item.isTrim !== false"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
        </el-col>
        
        <!-- 操作按钮 -->
        <el-col :span="24" style="text-align: right;">
          <el-form-item>
            <el-button v-if="showSearch" type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button v-if="showReset" @click="handleReset" :icon="Refresh">
              重置
            </el-button>
            <slot name="actions" :searchForm="searchForm" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { Search, Refresh } from '@element-plus/icons-vue'
import type { FormOption } from '@/types/form'

interface Props {
  formItems: FormOption[]
  showSearch?: boolean
  showReset?: boolean
  inline?: boolean
  labelWidth?: string | number
  size?: 'large' | 'default' | 'small'
  gutter?: number
  colSpan?: number
  defaultValues?: Record<string, any>
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
  defaultValues: () => ({})
})

const emit = defineEmits<Emits>()

// Refs
const formRef = ref()

// 响应式数据
const searchForm = reactive<Record<string, any>>({})

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
  padding: 16px;
  background-color: var(--el-bg-color);
  border-radius: 4px;
  margin-bottom: 16px;
}
</style>