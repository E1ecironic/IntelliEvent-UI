<template>
  <div class="aimi-page-header">
    <div class="header-left">
      <h2 class="page-title">{{ title }}</h2>
      <span v-if="description" class="page-description">{{ description }}</span>
    </div>
    <div class="header-right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const title = computed(() => {
  return route.meta?.title || ''
})

const description = computed(() => {
  return route.meta?.description || ''
})
</script>

<style scoped lang="scss">
.aimi-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 12px;

    .page-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #1f2f3d;
      line-height: 1.5;
    }

    .page-description {
      font-size: 14px;
      color: #909399;
      font-weight: normal;
    }
  }

  .header-right {
    display: flex;
    align-items: center;
  }
}
</style>
