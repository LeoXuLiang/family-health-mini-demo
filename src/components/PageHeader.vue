<template>
  <view class="page-header">
    <view>
      <text class="eyebrow">{{ eyebrow }}</text>
      <text class="title">{{ title }}</text>
    </view>
    <button v-if="showAction" class="header-action" @click="handleAction">{{ actionText }}</button>
  </view>
</template>

<script setup>
defineProps({
  eyebrow: {
    type: String,
    default: "家康小记"
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

const emit = defineEmits(["action"]);

function handleAction() {
  emit("action");
}
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
  color: #4a5c55;
  font-size: 28rpx;
}

.title {
  display: block;
  margin-top: 6rpx;
  color: #18332d;
  font-size: 54rpx;
  font-weight: 900;
  line-height: 1.1;
}

.header-action {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 96rpx;
  height: 96rpx;
  flex: 0 0 auto;
  padding: 0 24rpx;
  border-radius: 30rpx;
  background: #ffffff;
  color: #2f8f72;
  box-shadow: 0 12rpx 28rpx rgba(54, 87, 74, 0.12);
  font-size: 32rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}
</style>
