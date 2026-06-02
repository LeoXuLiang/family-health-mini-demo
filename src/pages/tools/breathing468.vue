<template>
  <view class="page breathing-page">
    <PageHeader title="4-6-8 呼吸" action-text="退" @action="goBack" />

    <view class="content">
      <view class="breath-stage card" :style="{ background: stageBg }">
        <view class="round-row">
          <text class="round-label">第 {{ currentRound }} / {{ selectedRounds }} 轮</text>
          <text class="round-status" :class="statusClass">{{ statusText }}</text>
        </view>

        <view class="breath-visual">
          <svg viewBox="0 0 300 300" class="breath-svg">
            <circle
              cx="150" cy="150" r="132"
              fill="none" stroke="rgba(47,143,114,0.06)" stroke-width="2"
            />
            <circle
              cx="150" cy="150" :r="ringR"
              fill="none" :stroke="ringColor" stroke-width="8"
              stroke-linecap="round"
              :stroke-dasharray="circumference"
              :stroke-dashoffset="dashOffset"
              class="progress-ring"
              transform="rotate(-90 150 150)"
            />
            <circle
              cx="150" cy="150" :r="innerR"
              fill="none" :stroke="ringColor" stroke-width="0.8"
              stroke-dasharray="4 6"
              :opacity="pulseOpacity"
              class="pulse-ring"
            />
          </svg>

          <view class="breath-center" :style="{ transform: `scale(${orbScale})` }">
            <text class="phase-countdown">{{ displayCountdown }}</text>
            <text class="phase-label">{{ currentPhase.label }}</text>
            <view class="phase-dots">
              <view
                v-for="(phase, i) in phases"
                :key="phase.key"
                class="dot"
                :class="{
                  active: i === phaseIndex,
                  done: i < phaseIndex || (i === phaseIndex && isRunning)
                }"
                :style="i === phaseIndex && isRunning ? { background: ringColor } : {}"
              />
            </view>
          </view>
        </view>

        <view class="phase-row">
          <view
            v-for="phase in phases"
            :key="phase.key"
            class="phase-chip"
            :class="{ active: phase.key === currentPhase.key }"
            :style="phase.key === currentPhase.key ? { background: ringColor + '18', color: ringColor, borderColor: ringColor + '40' } : {}"
          >
            <text class="chip-label">{{ phase.label }}</text>
            <text class="chip-dur">{{ phase.duration }}秒</text>
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
        <text class="guide-title">节奏说明</text>
        <view class="guide-list">
          <view class="guide-item">
            <view class="guide-badge" style="background: #2f8f7218; color: #2f8f72;">吸</view>
            <text class="guide-line">鼻吸 4 秒，肩颈放松，腹部自然隆起。</text>
          </view>
          <view class="guide-item">
            <view class="guide-badge" style="background: #3a73c918; color: #3a73c9;">屏</view>
            <text class="guide-line">屏息 6 秒，轻轻停住即可，不要用力憋气。</text>
          </view>
          <view class="guide-item">
            <view class="guide-badge" style="background: #d96a5518; color: #d96a55;">呼</view>
            <text class="guide-line">口呼 8 秒，缓慢吐尽，比吸气更长。</text>
          </view>
        </view>
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
  { key: "inhale", label: "吸气", duration: 4, color: "#2f8f72" },
  { key: "hold", label: "屏息", duration: 6, color: "#3a73c9" },
  { key: "exhale", label: "呼气", duration: 8, color: "#d96a55" }
];

const ringR = 125;
const innerR = 138;
const circumference = 2 * Math.PI * ringR;

const roundOptions = [3, 5, 8];
const selectedRounds = ref(3);
const currentRound = ref(1);
const phaseIndex = ref(0);
const elapsedMs = ref(0);
const isRunning = ref(false);
const isFinished = ref(false);
let timer = null;

const currentPhase = computed(() => phases[phaseIndex.value]);
const phaseDurationMs = computed(() => currentPhase.value.duration * 1000);
const progress = computed(() => Math.min(elapsedMs.value / phaseDurationMs.value, 1));

const remaining = computed(() =>
  Math.max(Math.ceil((phaseDurationMs.value - elapsedMs.value) / 1000), 0)
);

const displayCountdown = computed(() => remaining.value);

const dashOffset = computed(() => circumference * (1 - progress.value));

const ringColor = computed(() => currentPhase.value.color);

const actionText = computed(() => {
  if (isFinished.value) return "再练一次";
  return isRunning.value ? "暂停" : "开始";
});

const statusText = computed(() => {
  if (isFinished.value) return "完成";
  return isRunning.value ? "进行中" : "准备";
});

const statusClass = computed(() => {
  if (isFinished.value) return "status-done";
  if (isRunning.value) return "status-active";
  return "status-idle";
});

const orbScale = computed(() => {
  const p = progress.value;
  const key = currentPhase.value.key;
  if (key === "inhale") return 0.82 + p * 0.18;
  if (key === "hold") return 1.0;
  return 1.0 - p * 0.18;
});

const pulseOpacity = computed(() => {
  if (!isRunning.value) return 0;
  const p = progress.value;
  const key = currentPhase.value.key;
  if (key === "hold") return 0.35 + Math.sin(elapsedMs.value / 400) * 0.15;
  return 0.1 + p * 0.15;
});

const stageBg = computed(() => {
  const c = ringColor.value;
  return `radial-gradient(circle at 50% 38%, ${c}12, transparent 46%), linear-gradient(180deg, #ffffff 0%, ${c}06 100%)`;
});

function clearAll() {
  if (timer) { clearInterval(timer); timer = null; }
}

function startTimer() {
  clearAll();
  const tickMs = 100;
  timer = setInterval(() => {
    if (!isRunning.value) return;

    elapsedMs.value += tickMs;

    if (elapsedMs.value >= phaseDurationMs.value) {
      goNextPhase();
    }
  }, tickMs);
}

function goNextPhase() {
  elapsedMs.value = 0;

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
  clearAll();
}

function togglePractice() {
  if (isFinished.value) {
    resetPractice();
  }

  isRunning.value = !isRunning.value;
  if (isRunning.value) {
    startTimer();
  } else {
    clearAll();
  }
}

function resetPractice() {
  clearAll();
  currentRound.value = 1;
  phaseIndex.value = 0;
  elapsedMs.value = 0;
  isRunning.value = false;
  isFinished.value = false;
}

function goBack() {
  clearAll();
  uni.navigateBack();
}

onUnmounted(() => clearAll());
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.breath-stage {
  padding: 32rpx 28rpx 28rpx;
  overflow: hidden;
  transition: background 0.6s ease;
}

.round-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.round-label {
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.round-status {
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 30rpx;
  font-weight: 900;
  background: #e7f0eb;
  color: #4a5c55;
}

.round-status.status-active {
  background: #dff2ea;
  color: #2f8f72;
}

.round-status.status-done {
  background: #e2ecfb;
  color: #3a73c9;
}

.breath-visual {
  position: relative;
  height: 520rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8rpx;
}

.breath-svg {
  position: absolute;
  width: 500rpx;
  height: 500rpx;
}

.progress-ring {
  transition: stroke 0.5s ease;
}

.pulse-ring {
  transition: opacity 0.4s ease;
}

.breath-center {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 210rpx;
  height: 210rpx;
  border-radius: 50%;
  background: linear-gradient(160deg, rgba(47, 143, 114, 0.92) 0%, rgba(58, 115, 201, 0.92) 100%);
  box-shadow: 0 20rpx 60rpx rgba(47, 143, 114, 0.22);
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.phase-countdown {
  color: #ffffff;
  font-size: 82rpx;
  font-weight: 900;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.phase-label {
  margin-top: 6rpx;
  color: rgba(255, 255, 255, 0.88);
  font-size: 30rpx;
  font-weight: 800;
}

.phase-dots {
  display: flex;
  gap: 10rpx;
  margin-top: 14rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dot.active {
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 0 8rpx rgba(255, 255, 255, 0.5);
}

.dot.done {
  background: rgba(255, 255, 255, 0.55);
}

.phase-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 8rpx;
}

.phase-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 78rpx;
  padding: 12rpx 8rpx;
  border-radius: 12rpx;
  border: 1.5rpx solid transparent;
  background: #f5faf7;
  color: #4a5c55;
  transition: all 0.35s ease;
}

.phase-chip.active {
  font-weight: 800;
}

.chip-label {
  font-size: 30rpx;
  font-weight: 800;
}

.chip-dur {
  margin-top: 2rpx;
  font-size: 30rpx;
  opacity: 0.75;
}

.control-card {
  margin-top: 20rpx;
  padding: 26rpx;
}

.control-title {
  display: block;
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
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 78rpx;
  line-height: 1;
  border-radius: 10rpx;
  background: #e7f0eb;
  color: #4a5c55;
  font-size: 29rpx;
  font-weight: 900;
  transition: all 0.2s ease;
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

.guide-card {
  margin-top: 20rpx;
  padding: 26rpx;
}

.guide-title {
  display: block;
  color: #18332d;
  font-size: 32rpx;
  font-weight: 900;
  margin-bottom: 16rpx;
}

.guide-list {
  display: flex;
  flex-direction: column;
  gap: 14rpx;
}

.guide-item {
  display: flex;
  align-items: flex-start;
  gap: 14rpx;
}

.guide-badge {
  flex: 0 0 48rpx;
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 900;
}

.guide-line {
  flex: 1;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.55;
  padding-top: 6rpx;
}

.note-card {
  margin-top: 20rpx;
  padding: 24rpx 26rpx;
  background: #fff7e8;
  color: #76541c;
  font-size: 30rpx;
  line-height: 1.5;
}
</style>
