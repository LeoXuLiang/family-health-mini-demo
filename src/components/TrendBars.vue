<template>
  <view class="chart-bars">
    <view
      v-for="(value, index) in values"
      :key="index"
      class="bar"
      :style="{ height: `${Math.max(Number(value) || 0, 4)}%` }"
    />
  </view>
</template>

<script setup>
defineProps({
  values: {
    type: Array,
    required: true
  }
});
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
