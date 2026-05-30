<template>
  <view class="page-header">
    <view>
      <text class="eyebrow">{{ eyebrow }}</text>
      <text class="title">{{ title }}</text>
    </view>
    <button v-if="showAction" class="header-action" @click="$emit('action')">{{ actionText }}</button>
  </view>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: "家庭健康跟踪助手"
  },
  title: {
    type: String,
    required: true
  },
  actionText: {
    type: String,
    default: "铃"
  },
  showAction: {
    type: Boolean,
    default: true
  }
});

defineEmits(["action"]);
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
  padding: 34rpx 32rpx 10rpx;
}

.eyebrow {
  display: block;
  color: #66756f;
  font-size: 25rpx;
}

.title {
  display: block;
  margin-top: 6rpx;
  color: #18332d;
  font-size: 52rpx;
  font-weight: 900;
  line-height: 1.1;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 88rpx;
  height: 88rpx;
  flex: 0 0 auto;
  padding: 0 22rpx;
  border-radius: 28rpx;
  background: #ffffff;
  color: #2f8f72;
  box-shadow: 0 12rpx 28rpx rgba(54, 87, 74, 0.12);
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}
</style>
