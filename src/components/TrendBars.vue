<template>
  <view class="chart-bars">
    <view
      v-for="(value, index) in values"
      :key="index"
      class="bar"
      :style="{ height: `${barHeight(value)}%` }"
    />
  </view>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  values: {
    type: Array,
    required: true
  }
});

const maxValue = computed(() => Math.max(...props.values.map((value) => Number(value) || 0), 0));

function barHeight(value) {
  const numericValue = Number(value) || 0;
  if (numericValue === 0 || maxValue.value === 0) return 4;
  return Math.max(Math.round((numericValue / maxValue.value) * 100), 18);
}
</script>

<style scoped>
.chart-bars {
  height: 180rpx;
  display: flex;
  align-items: flex-end;
  gap: 14rpx;
  padding: 12rpx 4rpx 18rpx;
  border-bottom: 1rpx solid #dce8e2;
}

.bar {
  flex: 1;
  min-width: 0;
  border-radius: 999rpx 999rpx 8rpx 8rpx;
  background: linear-gradient(180deg, #6bb59e, #2f8f72);
}
</style>
