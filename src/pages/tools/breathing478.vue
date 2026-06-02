<template>
  <view class="page breathing-page">
    <PageHeader title="4-7-8 呼吸" action-text="退" @action="goBack" />

    <view class="content">
      <view class="breath-stage card">
        <view class="round-row">
          <text class="round-label">第 {{ currentRound }} / {{ selectedRounds }} 轮</text>
          <text class="round-status">{{ statusText }}</text>
        </view>

        <view class="breath-visual">
          <view class="outer-ring">
            <view class="middle-ring">
              <view class="breath-orb" :style="orbStyle">
                <text class="phase-name">{{ currentPhase.label }}</text>
                <text class="phase-count">{{ remaining }}</text>
              </view>
            </view>
          </view>
        </view>

        <text class="phase-hint">{{ currentPhase.hint }}</text>

        <view class="progress-track">
          <view class="progress-fill" :style="{ width: `${phaseProgress}%` }"></view>
        </view>

        <view class="phase-row">
          <view v-for="phase in phases" :key="phase.key" class="phase-chip" :class="{ active: phase.key === currentPhase.key }">
            <text>{{ phase.label }}</text>
            <text>{{ phase.duration }}秒</text>
          </view>
        </view>
      </view>

      <view class="control-card card">
        <text class="control-title">练习轮数</text>
        <view class="round-options">
          <button
            v-for="round in roundOptions"
            :key="round"
            :class="{ active: selectedRounds === round }"
            :disabled="isRunning"
            @click="selectedRounds = round"
          >
            {{ round }}轮
          </button>
        </view>

        <view class="action-row">
          <button class="secondary-button" @click="resetPractice">重置</button>
          <button class="primary-button" @click="togglePractice">{{ actionText }}</button>
        </view>
      </view>

      <view class="guide-card card">
        <text class="guide-title">节奏</text>
        <text class="guide-line">吸气 4 秒：鼻吸，肩颈放松。</text>
        <text class="guide-line">屏息 7 秒：轻轻停住，不要憋到不舒服。</text>
        <text class="guide-line">呼气 8 秒：口呼，尽量比吸气更慢。</text>
      </view>

      <view class="note-card card">
        <text>如出现头晕、胸闷、气短或其他不适，请立即停止。该练习仅用于日常放松，不替代医生诊断或治疗。</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";
import PageHeader from "../../components/PageHeader.vue";

const phases = [
  { key: "inhale", label: "吸气", duration: 4, hint: "鼻子慢慢吸气，让圆形变大" },
  { key: "hold", label: "屏息", duration: 7, hint: "轻轻停住，保持身体放松" },
  { key: "exhale", label: "呼气", duration: 8, hint: "嘴巴慢慢呼气，让圆形变小" }
];

const roundOptions = [3, 5, 8];
const selectedRounds = ref(3);
const currentRound = ref(1);
const phaseIndex = ref(0);
const elapsed = ref(0);
const isRunning = ref(false);
const isFinished = ref(false);
let timer = null;

const currentPhase = computed(() => phases[phaseIndex.value]);
const remaining = computed(() => Math.max(currentPhase.value.duration - elapsed.value, 0));
const phaseProgress = computed(() => Math.min(Math.round((elapsed.value / currentPhase.value.duration) * 100), 100));
const actionText = computed(() => {
  if (isFinished.value) {
    return "再练一次";
  }
  return isRunning.value ? "暂停" : "开始";
});
const statusText = computed(() => {
  if (isFinished.value) {
    return "已完成";
  }
  return isRunning.value ? "进行中" : "未开始";
});

const orbStyle = computed(() => {
  const phase = currentPhase.value;
  const ratio = Math.min(elapsed.value / phase.duration, 1);
  let scale = 0.86 + ratio * 0.28;

  if (phase.key === "hold") {
    scale = 1.14;
  }

  if (phase.key === "exhale") {
    scale = 1.14 - ratio * 0.28;
  }

  return {
    transform: `scale(${scale})`
  };
});

function clearTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function startTimer() {
  clearTimer();
  timer = setInterval(() => {
    elapsed.value += 1;

    if (elapsed.value >= currentPhase.value.duration) {
      goNextPhase();
    }
  }, 1000);
}

function goNextPhase() {
  elapsed.value = 0;

  if (phaseIndex.value < phases.length - 1) {
    phaseIndex.value += 1;
    return;
  }

  if (currentRound.value < selectedRounds.value) {
    currentRound.value += 1;
    phaseIndex.value = 0;
    return;
  }

  isRunning.value = false;
  isFinished.value = true;
  clearTimer();
}

function togglePractice() {
  if (isFinished.value) {
    resetPractice();
  }

  isRunning.value = !isRunning.value;
  if (isRunning.value) {
    startTimer();
  } else {
    clearTimer();
  }
}

function resetPractice() {
  clearTimer();
  currentRound.value = 1;
  phaseIndex.value = 0;
  elapsed.value = 0;
  isRunning.value = false;
  isFinished.value = false;
}

function goBack() {
  clearTimer();
  uni.navigateBack();
}

onUnmounted(() => clearTimer());
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.breath-stage {
  padding: 28rpx;
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 36%, rgba(47, 143, 114, 0.13), transparent 42%),
    linear-gradient(180deg, #ffffff 0%, #f2faf6 100%);
}

.round-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18rpx;
}

.round-label,
.round-status,
.phase-hint,
.control-title,
.guide-title,
.guide-line,
.note-card text {
  display: block;
}

.round-label {
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.round-status {
  min-width: 100rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 24rpx;
  font-weight: 900;
  text-align: center;
}

.breath-visual {
  height: 470rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outer-ring,
.middle-ring,
.breath-orb {
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outer-ring {
  width: 370rpx;
  height: 370rpx;
  background: rgba(47, 143, 114, 0.08);
}

.middle-ring {
  width: 288rpx;
  height: 288rpx;
  background: rgba(58, 115, 201, 0.08);
}

.breath-orb {
  width: 210rpx;
  height: 210rpx;
  flex-direction: column;
  background: linear-gradient(160deg, #2f8f72 0%, #3a73c9 100%);
  color: #ffffff;
  box-shadow: 0 24rpx 70rpx rgba(47, 143, 114, 0.28);
  transition: transform 900ms ease-in-out;
}

.phase-name {
  color: rgba(255, 255, 255, 0.86);
  font-size: 28rpx;
  font-weight: 900;
}

.phase-count {
  margin-top: 6rpx;
  color: #ffffff;
  font-size: 74rpx;
  font-weight: 900;
  line-height: 1;
}

.phase-hint {
  color: #38564e;
  font-size: 31rpx;
  font-weight: 800;
  line-height: 1.45;
  text-align: center;
}

.progress-track {
  height: 16rpx;
  margin-top: 24rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: #e7f0eb;
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: #2f8f72;
  transition: width 280ms linear;
}

.phase-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 24rpx;
}

.phase-chip {
  min-height: 80rpx;
  padding: 12rpx;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f5faf7;
  color: #66756f;
  font-size: 24rpx;
  font-weight: 800;
  line-height: 1.35;
}

.phase-chip.active {
  background: #dff2ea;
  color: #2f8f72;
}

.control-card,
.guide-card,
.note-card {
  margin-top: 20rpx;
  padding: 26rpx;
}

.control-title,
.guide-title {
  color: #18332d;
  font-size: 32rpx;
  font-weight: 900;
}

.round-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 18rpx;
}

.round-options button {
  min-height: 78rpx;
  border-radius: 8rpx;
  background: #e7f0eb;
  color: #66756f;
  font-size: 29rpx;
  font-weight: 900;
}

.round-options button.active {
  background: #2f8f72;
  color: #ffffff;
}

.action-row {
  display: grid;
  grid-template-columns: 0.84fr 1.16fr;
  gap: 14rpx;
  margin-top: 22rpx;
}

.guide-line {
  margin-top: 12rpx;
  color: #66756f;
  font-size: 27rpx;
  line-height: 1.5;
}

.note-card {
  background: #fff7e8;
  color: #76541c;
  font-size: 25rpx;
  line-height: 1.5;
}
</style>
