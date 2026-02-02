<template>
  <div class="aimi-upload">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :action="action"
      :headers="headers"
      :data="data"
      :multiple="multiple"
      :limit="limit"
      :accept="accept"
      :disabled="disabled"
      :drag="drag"
      :list-type="listType"
      :show-file-list="showFileList"
      :auto-upload="autoUpload"
      :before-upload="beforeUpload"
      :before-remove="beforeRemove"
      :on-preview="handlePreview"
      :on-remove="handleRemove"
      :on-success="handleSuccess"
      :on-error="handleError"
      :on-progress="handleProgress"
      :on-change="handleChange"
      :on-exceed="handleExceed"
      v-bind="$attrs"
    >
      <!-- 拖拽上传 -->
      <template v-if="drag" #default>
        <div class="el-upload-dragger">
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <div v-if="tip" class="el-upload__tip">{{ tip }}</div>
        </div>
      </template>
      
      <!-- 按钮上传 -->
      <template v-else-if="listType === 'text'" #default>
        <el-button type="primary" :icon="Upload" :loading="uploading">
          {{ uploadText }}
        </el-button>
      </template>
      
      <!-- 图片上传 -->
      <template v-else-if="listType === 'picture-card'" #default>
        <el-icon><Plus /></el-icon>
      </template>
      
      <!-- 自定义上传 -->
      <template v-else-if="$slots.default" #default>
        <slot name="default" />
      </template>
      
      <!-- 文件列表插槽 -->
      <template v-if="$slots.file" #file="{ file }">
        <slot name="file" :file="file" />
      </template>
      
      <!-- 提示文本 -->
      <template #tip v-if="tip">
        <div class="el-upload__tip">{{ tip }}</div>
      </template>
    </el-upload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { UploadFile, UploadFiles, UploadProgressEvent, UploadRawFile, UploadRequestOptions, UploadUserFile } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Upload, Plus, UploadFilled } from '@element-plus/icons-vue'

interface Props {
  modelValue?: UploadUserFile[]
  action: string
  headers?: Record<string, string>
  data?: Record<string, any>
  multiple?: boolean
  limit?: number
  accept?: string
  disabled?: boolean
  drag?: boolean
  listType?: 'text' | 'picture' | 'picture-card'
  showFileList?: boolean
  autoUpload?: boolean
  tip?: string
  uploadText?: string
  // 文件大小限制 (MB)
  maxSize?: number
  // 自定义上传方法
  httpRequest?: (options: UploadRequestOptions) => Promise<any>
  // 上传前处理
  beforeUpload?: (file: UploadRawFile) => boolean | Promise<boolean>
  // 删除前处理
  beforeRemove?: (file: UploadFile, fileList: UploadFiles) => boolean | Promise<boolean>
}

interface Emits {
  (e: 'update:modelValue', value: UploadUserFile[]): void
  (e: 'preview', file: UploadFile): void
  (e: 'remove', file: UploadFile, fileList: UploadFiles): void
  (e: 'success', response: any, file: UploadFile, fileList: UploadFiles): void
  (e: 'error', error: any, file: UploadFile, fileList: UploadFiles): void
  (e: 'progress', event: UploadProgressEvent, file: UploadFile, fileList: UploadFiles): void
  (e: 'change', file: UploadFile, fileList: UploadFiles): void
  (e: 'exceed', files: File[], fileList: UploadUserFile[]): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  headers: () => ({}),
  data: () => ({}),
  multiple: false,
  limit: 0,
  accept: '',
  disabled: false,
  drag: false,
  listType: 'text',
  showFileList: true,
  autoUpload: true,
  tip: '',
  uploadText: '点击上传',
  maxSize: 0
})

const emit = defineEmits<Emits>()

// Refs
const uploadRef = ref()
const uploading = ref(false)

// 计算属性
const fileList = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

// 文件大小转换
const formatFileSize = (size: number): string => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB'
  return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 检查文件大小
const checkFileSize = (file: File): boolean => {
  if (props.maxSize > 0 && file.size > props.maxSize * 1024 * 1024) {
    ElMessage.error(`文件大小不能超过 ${props.maxSize}MB`)
    return false
  }
  return true
}

// 检查文件类型
const checkFileType = (file: File): boolean => {
  if (props.accept) {
    const acceptTypes = props.accept.split(',').map(type => type.trim())
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileType = file.type
    
    const isValid = acceptTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.slice(1).toLowerCase()
      } else if (type.endsWith('/*')) {
        return fileType.startsWith(type.slice(0, -2))
      } else {
        return fileType === type || file.name.toLowerCase().endsWith(type.toLowerCase())
      }
    })
    
    if (!isValid) {
      ElMessage.error(`文件类型不支持，支持的类型：${props.accept}`)
      return false
    }
  }
  return true
}

// 上传前处理
const beforeUpload = (file: UploadRawFile): boolean | Promise<boolean> => {
  // 检查文件大小
  if (!checkFileSize(file)) {
    return false
  }
  
  // 检查文件类型
  if (!checkFileType(file)) {
    return false
  }
  
  // 调用自定义的上传前处理
  if (props.beforeUpload) {
    return props.beforeUpload(file)
  }
  
  return true
}

// 删除前处理
const beforeRemove = (file: UploadFile, fileList: UploadFiles): boolean | Promise<boolean> => {
  if (props.beforeRemove) {
    return props.beforeRemove(file, fileList)
  }
  return true
}

// 文件预览
const handlePreview = (file: UploadFile) => {
  emit('preview', file)
}

// 文件删除
const handleRemove = (file: UploadFile, fileList: UploadFiles) => {
  emit('remove', file, fileList)
}

// 上传成功
const handleSuccess = (response: any, file: UploadFile, fileList: UploadFiles) => {
  uploading.value = false
  emit('success', response, file, fileList)
}

// 上传失败
const handleError = (error: any, file: UploadFile, fileList: UploadFiles) => {
  uploading.value = false
  ElMessage.error('文件上传失败')
  emit('error', error, file, fileList)
}

// 上传进度
const handleProgress = (event: UploadProgressEvent, file: UploadFile, fileList: UploadFiles) => {
  uploading.value = true
  emit('progress', event, file, fileList)
}

// 文件状态改变
const handleChange = (file: UploadFile, fileList: UploadFiles) => {
  emit('change', file, fileList)
}

// 文件超出限制
const handleExceed = (files: File[], fileList: UploadUserFile[]) => {
  ElMessage.warning(`最多只能上传 ${props.limit} 个文件`)
  emit('exceed', files, fileList)
}

// 手动上传
const submit = () => {
  uploadRef.value?.submit()
}

// 清空文件列表
const clearFiles = () => {
  uploadRef.value?.clearFiles()
}

// 暴露方法
defineExpose({
  submit,
  clearFiles,
  uploadRef
})
</script>

<style scoped lang="scss">
.aimi-upload {
  width: 100%;
  
  :deep(.el-upload-dragger) {
    padding: 40px;
    
    .el-icon--upload {
      font-size: 48px;
      color: var(--el-color-primary);
      margin-bottom: 16px;
    }
    
    .el-upload__text {
      color: var(--el-text-color-regular);
      font-size: 14px;
      text-align: center;
      
      em {
        color: var(--el-color-primary);
        font-style: normal;
      }
    }
    
    .el-upload__tip {
      color: var(--el-text-color-secondary);
      font-size: 12px;
      margin-top: 8px;
      text-align: center;
    }
    
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
  
  :deep(.el-upload__tip) {
    color: var(--el-text-color-secondary);
    font-size: 12px;
    margin-top: 8px;
    line-height: 1.5;
  }
}
</style>