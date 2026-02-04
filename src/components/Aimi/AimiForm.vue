<template>
  <div class="aimi-form">
    <el-form ref="formRef" :model="modelValue" :rules="rules" :label-width="labelWidth" :size="size" v-bind="$attrs">
      <el-row :gutter="gutter">
        <el-col v-for="item in formItems" :key="item.field" :span="item.colSpan || colSpan">
          <el-form-item :label="item.label" :prop="item.field" :rules="item.rules">
            <!-- 自定义插槽 -->
            <slot v-if="item.slotName" :name="item.slotName" :item="item" :value="modelValue[item.field]"
              :modelValue="modelValue" />

            <!-- 输入框 -->
            <el-input v-else-if="item.type === 'input'" v-model="modelValue[item.field]"
              :placeholder="item.placeholder || `请输入${item.label}`" :disabled="item.disabled"
              :clearable="item.clearable !== false" :show-password="item.showPassword" v-trim="item.isTrim !== false"
              @change="(val: any) => handleFieldChange(item.field, val)">
              <template v-if="item.prefix" #prefix>
                <el-icon>
                  <component :is="item.prefix" />
                </el-icon>
              </template>
              <template v-if="item.suffix" #suffix>
                <el-icon>
                  <component :is="item.suffix" />
                </el-icon>
              </template>
            </el-input>

            <!-- 文本域 -->
            <el-input v-else-if="item.type === 'textarea'" v-model="modelValue[item.field]" type="textarea"
              :placeholder="item.placeholder || `请输入${item.label}`" :disabled="item.disabled" :rows="item.rows || 3"
              :maxlength="item.maxlength" :show-word-limit="item.showWordLimit" v-trim="item.isTrim !== false"
              @change="(val: any) => handleFieldChange(item.field, val)" />

            <!-- 数字输入框 -->
            <el-input-number v-else-if="item.type === 'number'" v-model="modelValue[item.field]"
              :placeholder="item.placeholder || `请输入${item.label}`" :disabled="item.disabled" :min="item.min"
              :max="item.max" :step="item.step || 1" :precision="item.precision" :controls="item.controls !== false"
              style="width: 100%" @change="(val: any) => handleFieldChange(item.field, val)" />

            <!-- 选择框 -->
            <el-select v-else-if="item.type === 'select'" v-model="modelValue[item.field]"
              :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
              :clearable="item.clearable !== false" :filterable="item.filterable !== false" :multiple="item.multiple"
              :collapse-tags="item.collapseTags" style="width: 100%" @change="(val: any) => handleFieldChange(item.field, val)">
              <el-option v-for="option in item.options" :key="option.value" :label="option.label" :value="option.value"
                :disabled="option.disabled" />
            </el-select>

            <!-- 日期选择器 -->
            <el-date-picker v-else-if="item.type === 'datepicker'" v-model="modelValue[item.field]"
              :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
              :clearable="item.clearable !== false" :format="item.format || 'YYYY-MM-DD'"
              :value-format="item.valueFormat || 'YYYY-MM-DD'" :type="item.dateType || 'date'"
              :range-separator="item.rangeSeparator || '至'" :start-placeholder="item.startPlaceholder || '开始日期'"
              :end-placeholder="item.endPlaceholder || '结束日期'" style="width: 100%"
              @change="(val: any) => handleFieldChange(item.field, val)" />

            <!-- 时间选择器 -->
            <el-time-picker v-else-if="item.type === 'timepicker'" v-model="modelValue[item.field]"
              :placeholder="item.placeholder || `请选择${item.label}`" :disabled="item.disabled"
              :clearable="item.clearable !== false" :format="item.format || 'HH:mm:ss'"
              :value-format="item.valueFormat || 'HH:mm:ss'" :is-range="item.isRange"
              :range-separator="item.rangeSeparator || '至'" :start-placeholder="item.startPlaceholder || '开始时间'"
              :end-placeholder="item.endPlaceholder || '结束时间'" style="width: 100%"
              @change="(val: any) => handleFieldChange(item.field, val)" />

            <!-- 开关 -->
            <el-switch v-else-if="item.type === 'switch'" v-model="modelValue[item.field]" :disabled="item.disabled"
              :active-text="item.activeText" :inactive-text="item.inactiveText"
              :active-value="item.activeValue !== undefined ? item.activeValue : true"
              :inactive-value="item.inactiveValue !== undefined ? item.inactiveValue : false"
              @change="(val: any) => handleFieldChange(item.field, val)" />

            <!-- 单选框组 -->
            <el-radio-group v-else-if="item.type === 'radio'" v-model="modelValue[item.field]"
              :disabled="item.disabled" @change="(val: any) => handleFieldChange(item.field, val)">
              <el-radio v-for="option in item.options" :key="option.value" :label="option.value"
                :disabled="option.disabled">
                {{ option.label }}
              </el-radio>
            </el-radio-group>

            <!-- 复选框组 -->
            <el-checkbox-group v-else-if="item.type === 'checkbox'" v-model="modelValue[item.field]"
              :disabled="item.disabled" @change="(val: any) => handleFieldChange(item.field, val)">
              <el-checkbox v-for="option in item.options" :key="option.value" :label="option.value"
                :disabled="option.disabled">
                {{ option.label }}
              </el-checkbox>
            </el-checkbox-group>

            <!-- 文件上传 -->
            <el-upload v-else-if="item.type === 'upload'" v-model:file-list="modelValue[item.field]"
              :action="item.action" :headers="item.headers" :data="item.data" :multiple="item.multiple"
              :limit="item.limit" :accept="item.accept" :disabled="item.disabled" :drag="item.drag"
              :list-type="item.listType || 'text'" :show-file-list="item.showFileList !== false"
              :auto-upload="item.autoUpload !== false" v-bind="item.uploadProps || {}"
              @change="(val: any) => handleFieldChange(item.field, val)">

              <!-- 上传插槽 -->
              <template v-if="item.uploadSlot" #default>
                <slot :name="item.uploadSlot" />
              </template>

              <!-- 默认上传按钮 -->
              <template v-else #default>
                <el-button type="primary" :icon="Upload">
                  {{ item.uploadText || '点击上传' }}
                </el-button>
              </template>

            </el-upload>

            <!-- 默认输入框 -->
            <el-input v-else v-model="modelValue[item.field]" :placeholder="item.placeholder || `请输入${item.label}`"
              :disabled="item.disabled" :clearable="item.clearable !== false" v-trim="item.isTrim !== false" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload } from '@element-plus/icons-vue'
import type { FormOption } from '@/types/form'

interface Props {
  modelValue: Record<string, any>
  formItems: FormOption[]
  rules?: Record<string, any>
  labelWidth?: string | number
  size?: 'large' | 'default' | 'small'
  gutter?: number
  colSpan?: number
}

interface Emits {
  (e: 'update:modelValue', value: Record<string, any>): void
  (e: 'validate', valid: boolean): void
  (e: 'change', field: string, value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  rules: () => ({}),
  labelWidth: '100px',
  size: 'default',
  gutter: 20,
  colSpan: 24
})

const emit = defineEmits<Emits>()

const formRef = ref()

// 监听数据变化
watch(
  () => props.modelValue,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true }
)

const handleFieldChange = (field: string, value: any) => {
  emit('change', field, value)
}

// 表单验证
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch (error) {
    return false
  }
}

// 重置表单
const resetFields = (): void => {
  formRef.value?.resetFields()
}

// 清除验证
const clearValidate = (): void => {
  formRef.value?.clearValidate()
}

// 校验单个字段
const validateField = (props?: string | string[]): void => {
  formRef.value?.validateField(props)
}

// 暴露方法
defineExpose({
  validate,
  resetFields,
  clearValidate,
  validateField
})
</script>

<style scoped lang="scss">
.aimi-form {
  width: 100%;
}
</style>