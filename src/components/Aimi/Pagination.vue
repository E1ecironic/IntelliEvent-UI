<template>
  <div class="aimi-pagination">
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :layout="layout"
      :background="background"
      :small="small"
      :disabled="disabled"
      :hide-on-single-page="hideOnSinglePage"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @prev-click="handlePrevClick"
      @next-click="handleNextClick"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { PaginationOption } from '@/types/pagination'

interface Props {
  modelValue?: number
  pageSize?: number
  total: number
  pageSizes?: number[]
  layout?: string
  background?: boolean
  small?: boolean
  disabled?: boolean
  hideOnSinglePage?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'update:pageSize', value: number): void
  (e: 'size-change', size: number): void
  (e: 'current-change', page: number): void
  (e: 'prev-click', page: number): void
  (e: 'next-click', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 1,
  pageSize: 10,
  pageSizes: () => [10, 20, 50, 100],
  layout: 'total, sizes, prev, pager, next, jumper',
  background: true,
  small: false,
  disabled: false,
  hideOnSinglePage: false
})

const emit = defineEmits<Emits>()

// Refs
const currentPage = ref(props.modelValue)
const pageSize = ref(props.pageSize)

// Watch
watch(() => props.modelValue, (newVal) => {
  if (newVal !== currentPage.value) {
    currentPage.value = newVal
  }
})

watch(() => props.pageSize, (newVal) => {
  if (newVal !== pageSize.value) {
    pageSize.value = newVal
  }
})

watch(currentPage, (newVal) => {
  emit('update:modelValue', newVal)
})

watch(pageSize, (newVal) => {
  emit('update:pageSize', newVal)
})

// Methods
const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleCurrentChange = (page: number) => {
  emit('current-change', page)
}

const handlePrevClick = (page: number) => {
  emit('prev-click', page)
}

const handleNextClick = (page: number) => {
  emit('next-click', page)
}

// 设置当前页
const setCurrentPage = (page: number) => {
  currentPage.value = page
}

// 设置每页条数
const setPageSize = (size: number) => {
  pageSize.value = size
}

// 获取分页信息
const getPaginationInfo = (): PaginationOption => {
  return {
    page: currentPage.value,
    limit: pageSize.value,
    total: props.total,
    pageSizes: props.pageSizes,
    layout: props.layout,
    background: props.background,
    autoScroll: true,
    hidden: props.hideOnSinglePage && props.total <= props.pageSize
  }
}

// 暴露方法
defineExpose({
  setCurrentPage,
  setPageSize,
  getPaginationInfo
})
</script>

<style scoped lang="scss">
.aimi-pagination {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}
</style>