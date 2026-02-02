<template>
  <div class="aimi-dialog">
    <el-dialog
      v-model="dialogVisible"
      :title="title"
      :width="width"
      :top="top"
      :modal="modal"
      :modal-class="modalClass"
      :draggable="draggable"
      :center="center"
      :align-center="alignCenter"
      :close-on-click-modal="closeOnClickModal"
      :close-on-press-escape="closeOnPressEscape"
      :show-close="showClose"
      :before-close="beforeClose"
      :lock-scroll="lockScroll"
      :open-delay="openDelay"
      :close-delay="closeDelay"
      :destroy-on-close="destroyOnClose"
      @open="handleOpen"
      @opened="handleOpened"
      @close="handleClose"
      @closed="handleClosed"
    >
      <!-- 对话框内容 -->
      <template #default>
        <slot name="body" />
      </template>

      <!-- 对话框底部 -->
      <template #footer v-if="showFooter">
        <slot name="footer">
          <el-button @click="handleCancel" v-if="showCancel">
            {{ cancelText }}
          </el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
            :loading="confirmLoading"
            v-if="showConfirm"
          >
            {{ confirmText }}
          </el-button>
        </slot>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: boolean
  title?: string
  width?: string | number
  top?: string
  modal?: boolean
  modalClass?: string
  draggable?: boolean
  center?: boolean
  alignCenter?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  showClose?: boolean
  beforeClose?: (done: () => void) => void
  lockScroll?: boolean
  openDelay?: number
  closeDelay?: number
  destroyOnClose?: boolean
  showFooter?: boolean
  showCancel?: boolean
  showConfirm?: boolean
  cancelText?: string
  confirmText?: string
  confirmLoading?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'close'): void
  (e: 'closed'): void
  (e: 'cancel'): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '50%',
  top: '15vh',
  modal: true,
  modalClass: '',
  draggable: false,
  center: false,
  alignCenter: false,
  closeOnClickModal: true,
  closeOnPressEscape: true,
  showClose: true,
  lockScroll: true,
  openDelay: 0,
  closeDelay: 0,
  destroyOnClose: false,
  showFooter: true,
  showCancel: true,
  showConfirm: true,
  cancelText: '取消',
  confirmText: '确定',
  confirmLoading: false
})

const emit = defineEmits<Emits>()

// Refs
const dialogVisible = ref(props.modelValue)

// Watch
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
})

// Methods
const handleOpen = () => {
  emit('open')
}

const handleOpened = () => {
  emit('opened')
}

const handleClose = () => {
  emit('close')
}

const handleClosed = () => {
  emit('closed')
}

const handleCancel = () => {
  dialogVisible.value = false
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}

const open = () => {
  dialogVisible.value = true
}

const close = () => {
  dialogVisible.value = false
}

// 暴露方法
defineExpose({
  open,
  close
})
</script>

<style scoped lang="scss">
.aimi-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    
    .el-dialog__header {
      padding: 16px 20px;
      margin: 0;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
    
    .el-dialog__body {
      padding: 20px;
    }
    
    .el-dialog__footer {
      padding: 12px 20px;
      border-top: 1px solid var(--el-border-color-lighter);
    }
  }
}
</style>