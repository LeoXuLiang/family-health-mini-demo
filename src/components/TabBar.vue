<template>
  <view class="tabbar-wrap">
    <view class="tabbar">
      <view
        v-for="(tab, index) in tabs"
        :key="tab.pagePath"
        class="tab-item"
        @click="switchTab(index)"
      >
        <text class="tab-text" :class="{ active: active === index }">{{ tab.text }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";

defineProps({
  active: {
    type: Number,
    default: 0
  }
});

const tabs = [
  { pagePath: "/pages/today/index", text: "今天" },
  { pagePath: "/pages/records/index", text: "记录" },
  { pagePath: "/pages/meals/index", text: "饮食" },
  { pagePath: "/pages/medications/index", text: "用药" },
  { pagePath: "/pages/tools/index", text: "工具" },
  { pagePath: "/pages/family/index", text: "家庭" }
];

function switchTab(index) {
  const target = tabs[index];
  if (!target) return;
  uni.switchTab({ url: target.pagePath });
}
</script>

<style scoped>
.tabbar-wrap {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #ffffff;
  border-top: 1rpx solid #e3ebe6;
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}

.tabbar {
  height: 96rpx;
  display: flex;
  flex-direction: row;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 96rpx;
}

.tab-text {
  color: #4a5c55;
  font-size: 30rpx;
  font-weight: 700;
}

.tab-text.active {
  color: #2f8f72;
  font-weight: 900;
}
</style>
