<template>
  <view class="page">
    <PageHeader title="工具" action-text="息" @action="openBreathing" />

    <view class="content">
      <button class="breathing-card card" @click="openBreathing">
        <view class="tool-copy">
          <text class="tool-label">放松练习</text>
          <text class="tool-title">4-7-8 呼吸法</text>
          <text class="tool-desc">跟随圆形节奏吸气、屏息、呼气，适合睡前或紧张时短时间练习。</text>
        </view>
        <view class="tool-orbit">
          <view class="tool-orb">
            <text>478</text>
          </view>
        </view>
      </button>

      <view class="section-title">
        <text class="section-title-text">练习说明</text>
      </view>

      <view class="step-grid">
        <view v-for="step in steps" :key="step.title" class="step-card card">
          <text class="step-count">{{ step.count }}</text>
          <text class="step-title">{{ step.title }}</text>
          <text class="step-desc">{{ step.desc }}</text>
        </view>
      </view>

      <view class="safety-card card">
        <text class="safety-title">使用提醒</text>
        <text class="safety-desc">练习中如出现头晕、胸闷或明显不适，请立即停止。该工具仅用于放松练习，不替代诊断或治疗。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import PageHeader from "../../components/PageHeader.vue";

const steps = [
  { count: "4", title: "吸气", desc: "鼻吸 4 秒，放慢动作" },
  { count: "7", title: "屏息", desc: "轻轻停住 7 秒" },
  { count: "8", title: "呼气", desc: "口呼 8 秒，慢慢放松" }
];

function openBreathing() {
  uni.navigateTo({ url: "/pages/tools/breathing478" });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.breathing-card {
  min-height: 300rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28rpx;
  overflow: hidden;
  text-align: left;
  background:
    radial-gradient(circle at 84% 28%, rgba(59, 115, 201, 0.18), transparent 34%),
    linear-gradient(135deg, #ffffff 0%, #eef8f4 56%, #fff7e8 100%);
}

.tool-copy {
  flex: 1;
  min-width: 0;
}

.tool-label,
.tool-title,
.tool-desc,
.step-title,
.step-desc,
.safety-title,
.safety-desc {
  display: block;
}

.tool-label {
  color: #2f8f72;
  font-size: 26rpx;
  font-weight: 900;
}

.tool-title {
  margin-top: 10rpx;
  color: #18332d;
  font-size: 46rpx;
  font-weight: 900;
  line-height: 1.18;
}

.tool-desc {
  margin-top: 16rpx;
  color: #66756f;
  font-size: 28rpx;
  line-height: 1.5;
}

.tool-orbit {
  width: 174rpx;
  height: 174rpx;
  flex: 0 0 174rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(47, 143, 114, 0.1);
}

.tool-orb {
  width: 126rpx;
  height: 126rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2f8f72;
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 900;
  box-shadow: 0 18rpx 40rpx rgba(47, 143, 114, 0.25);
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
}

.step-card {
  min-height: 190rpx;
  padding: 22rpx;
}

.step-count {
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 900;
}

.step-title {
  margin-top: 16rpx;
  color: #18332d;
  font-size: 31rpx;
  font-weight: 900;
}

.step-desc {
  margin-top: 8rpx;
  color: #66756f;
  font-size: 24rpx;
  line-height: 1.4;
}

.safety-card {
  margin-top: 24rpx;
  padding: 26rpx;
  background: #fff7e8;
}

.safety-title {
  color: #8a641c;
  font-size: 30rpx;
  font-weight: 900;
}

.safety-desc {
  margin-top: 10rpx;
  color: #76541c;
  font-size: 26rpx;
  line-height: 1.5;
}
</style>
