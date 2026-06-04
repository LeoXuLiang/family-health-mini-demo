<template>
  <view class="page">
    <PageHeader title="记录" action-text="记" @action="startRecord" />
    <MemberSelector v-model="selectedMemberId" :visible-members="visibleMembers" />

    <view class="content">
      <view v-if="!recordingStarted" class="record-hero card">
        <view>
          <text class="card-label">今日记录</text>
          <text class="hero-title">{{ selectedMember.name }}已记录 {{ todayMetricCount }} 项</text>
          <text class="hero-desc">{{ recordHeroDesc }}</text>
        </view>
        <button class="hero-action" @click="startRecord">新增记录</button>
      </view>

      <view v-if="!recordingStarted" class="quick-record-grid">
        <button
          v-for="(metric, index) in metricTypes"
          :key="metric.key"
          class="quick-record card"
          @click="setMetricByIndex(index)"
        >
          <text class="quick-title">{{ metric.label }}</text>
          <text class="quick-desc">立即记录</text>
        </button>
      </view>

      <view v-if="recordingStarted" class="metric-chooser card">
        <view class="form-head">
          <view>
            <text class="card-label">新增记录</text>
            <text class="form-title">{{ selectedMember.name }}的{{ selectedMetric.label }}</text>
          </view>
          <button class="close-form" @click="cancelRecord">收起</button>
        </view>
        <view class="metric-grid">
          <button
            v-for="(metric, index) in metricTypes"
            :key="metric.key"
            :class="{ active: selectedMetricIndex === index }"
            @click="setMetricByIndex(index)"
          >
            {{ metric.label }}
          </button>
        </view>
      </view>

      <view v-if="recordingStarted" class="input-card card">
        <text class="card-label">帮谁记录</text>
        <view class="member-confirm">
          <text class="confirm-name">{{ selectedMember.name }}</text>
          <text class="confirm-note">保存前会确认成员，避免录错</text>
        </view>

        <view class="field-block">
          <text class="field-label">记录项目</text>
          <picker :range="metricLabels" :value="selectedMetricIndex" @change="changeMetric">
            <view class="picker-field">
              <text>{{ selectedMetric.label }}</text>
              <text class="picker-arrow">切换</text>
            </view>
          </picker>
        </view>

        <view v-if="selectedMetric.key === 'bloodPressure'" class="bp-row">
          <label class="number-field">
            <text>收缩压</text>
            <input type="number" :value="systolic" @input="systolic = $event.detail.value" />
          </label>
          <label class="number-field">
            <text>舒张压</text>
            <input type="number" :value="diastolic" @input="diastolic = $event.detail.value" />
          </label>
        </view>

        <view v-else-if="selectedMetric.key === 'sleep'" class="sleep-block">
          <text class="field-label">睡眠状态</text>
          <view class="sleep-options">
            <button
              v-for="option in sleepOptions"
              :key="option.key"
              :class="{ active: sleepStatus === option.label }"
              @click="sleepStatus = option.label"
            >
              <text>{{ option.label }}</text>
              <text>{{ option.detail }}</text>
            </button>
          </view>
        </view>

        <label v-else class="number-field single">
          <text>{{ selectedMetric.label }}数值</text>
          <input type="digit" :value="metricValue" @input="metricValue = $event.detail.value" />
        </label>

        <view class="voice-row">
          <button
            class="voice-button"
            :class="{ active: voiceState === 'recording', done: voiceState === 'stopped' }"
            @click="handleVoiceButton"
          >
            <text v-if="voiceState === 'idle'">语音录入备注</text>
            <text v-else-if="voiceState === 'recording'">录音中 {{ recordingDuration }}s</text>
            <text v-else>播放录音</text>
          </button>
          <text v-if="voiceState === 'idle'">点击录音，说完后再点一次停止</text>
          <text v-else-if="voiceState === 'recording'">正在录制，点击停止</text>
          <text v-else>录音完成，点击播放</text>
        </view>

        <textarea
          class="note-input"
          placeholder="备注，可手写或用语音转文字"
          :value="note"
          @input="note = $event.detail.value"
        />

        <button class="primary-button save-button" @click="saveRecord">
          确认保存{{ selectedMember.name }}的{{ selectedMetric.label }}
        </button>
      </view>

      <view class="section-title">
        <text class="section-title-text">最近趋势</text>
        <view class="period-switch">
          <button :class="{ active: period === 7 }" @click="period = 7">7天</button>
          <button :class="{ active: period === 30 }" @click="period = 30">30天</button>
        </view>
      </view>

      <view class="trend-card card">
        <TrendBars :values="trendValues" />
        <text class="trend-desc">
          {{ selectedMember.name }}近 {{ period }} 天{{ selectedMetric.label }}{{ trendStatus }}。
        </text>
      </view>

      <view class="section-title">
        <text class="section-title-text">最近记录</text>
      </view>

      <view v-if="visibleRecords.length > 0" class="record-list">
        <view v-for="record in visibleRecords" :key="record.id" class="record-row card">
          <view>
            <text class="record-time">{{ record.time }}</text>
            <text class="record-value">{{ getMember(record.memberId).name }} {{ record.metric }} {{ record.value }}</text>
          </view>
          <text class="status-chip">{{ record.status }}</text>
        </view>
      </view>
      <view v-else class="empty-record card">
        <text class="card-label">当前暂无历史记录</text>
        <text class="trend-desc">点击右上角“记”或选择快捷项目开始录入第一条健康数据。</text>
      </view>
    </view>

    <MedicalNote />
    <OnboardingPanel />
    <TabBar :active="1" />
  </view>
</template>

<script setup>
import { computed, onUnmounted, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MemberSelector from "../../components/MemberSelector.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import OnboardingPanel from "../../components/OnboardingPanel.vue";
import TabBar from "../../components/TabBar.vue";
import TrendBars from "../../components/TrendBars.vue";
import {
  getMember,
  metricTypes,
  sleepOptions
} from "../../data/demoData";
import { appState, consumePendingMetric } from "../../state/appState";
import { saveMetricRecord, listMetricRecords, listMembers } from "../../services/cloudService";

const selectedMemberId = ref(appState.viewerId || "me");
const selectedMetricIndex = ref(0);
const systolic = ref("128");
const diastolic = ref("78");
const metricValue = ref("6.2");
const sleepStatus = ref("睡得好");
const note = ref("");
const isRecording = ref(false);
const period = ref(7);
const savedRecords = ref([]);
const visibleMembers = ref([]);
const recordingStarted = ref(false);

const metricLabels = metricTypes.map((metric) => metric.label);
const selectedMetric = computed(() => metricTypes[selectedMetricIndex.value] || metricTypes[0]);
const selectedMember = computed(() => visibleMembers.value.find((member) => member.id === selectedMemberId.value) || getMember(selectedMemberId.value));
const trendValues = computed(() => computeTrendValues(savedRecords.value, selectedMemberId.value, selectedMetric.value.label, period.value));
const trendStatus = computed(() => {
  const total = trendValues.value.reduce((sum, value) => sum + value, 0);
  if (total === 0) return "暂无走势";
  return `已有 ${total} 次记录`;
});
const todayMemberRecords = computed(() => {
  const today = localDateStr(new Date());
  return savedRecords.value.filter((record) => {
    if (record.memberId !== selectedMemberId.value || !record.createdAt) return false;
    return localDateStr(new Date(record.createdAt)) === today;
  });
});
const todayMetricCount = computed(() => new Set(todayMemberRecords.value.map((record) => record.metric)).size);
const recordHeroDesc = computed(() => {
  if (todayMetricCount.value === 0) {
    return "选择一个项目开始记录，保存后会回到这里查看趋势。";
  }
  const latest = todayMemberRecords.value[0];
  return `最近保存：${latest.metric} ${latest.value}`;
});

const visibleRecords = computed(() => {
  const visibleIds = new Set(visibleMembers.value.map((member) => member.id));
  return savedRecords.value.filter((record) => visibleIds.has(record.memberId)).slice(0, 8);
});

function changeMetric(event) {
  setMetricByIndex(Number(event.detail.value));
}

function startRecord() {
  setMetricByIndex(selectedMetricIndex.value);
}

function setMetricByIndex(index) {
  recordingStarted.value = true;
  selectedMetricIndex.value = index;
  const metric = selectedMetric.value;
  metricValue.value = metric.defaultValue || "";
  if (metric.key === "sleep") {
    sleepStatus.value = metric.defaultValue;
  }
}

function resetRecordForm() {
  const metric = selectedMetric.value;
  systolic.value = "128";
  diastolic.value = "78";
  metricValue.value = metric.defaultValue || "";
  sleepStatus.value = metric.key === "sleep" ? metric.defaultValue : "睡得好";
  note.value = "";
  voiceState.value = "idle";
  recordingDuration.value = 0;
  voiceFilePath.value = "";
}

function cancelRecord() {
  recordingStarted.value = false;
  resetRecordForm();
}

onShow(async () => {
  await loadMembers();
  await loadRecords();

  const pendingMetricKey = consumePendingMetric();
  if (!pendingMetricKey) {
    return;
  }

  const index = metricTypes.findIndex((metric) => metric.key === pendingMetricKey);
  if (index >= 0) {
    setMetricByIndex(index);
  }
});

async function loadRecords() {
  savedRecords.value = await listMetricRecords(appState.viewerId);
}

async function loadMembers() {
  visibleMembers.value = await listMembers(appState.viewerId);
  if (!visibleMembers.value.some((member) => member.id === selectedMemberId.value)) {
    selectedMemberId.value = visibleMembers.value[0]?.id || appState.viewerId || "me";
  }
}

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function computeTrendValues(records, memberId, metricLabel, days) {
  const counts = Array.from({ length: days }, () => 0);
  const today = new Date(localDateStr(new Date()));

  for (const record of records) {
    if (record.memberId !== memberId || record.metric !== metricLabel || !record.createdAt) continue;
    const recordDay = new Date(localDateStr(new Date(record.createdAt)));
    const diff = Math.floor((today - recordDay) / 86400000);
    if (diff >= 0 && diff < days) counts[days - 1 - diff] += 1;
  }

  return counts;
}

async function saveRecord() {
  const metric = selectedMetric.value;

  if (metric.key === "bloodPressure") {
    const sys = Number(systolic.value);
    const dia = Number(diastolic.value);
    if (!sys || !dia || sys < 60 || sys > 250 || dia < 30 || dia > 150) {
      uni.showToast({ title: "请填写合理的血压数值", icon: "none" });
      return;
    }
  } else if (metric.key === "bloodGlucose") {
    const val = Number(metricValue.value);
    if (!val || val < 1 || val > 35) {
      uni.showToast({ title: "请填写合理的血糖数值（1-35 mmol/L）", icon: "none" });
      return;
    }
  } else if (metric.key === "weight") {
    const val = Number(metricValue.value);
    if (!val || val < 20 || val > 300) {
      uni.showToast({ title: "请填写合理的体重数值（20-300 kg）", icon: "none" });
      return;
    }
  } else if (metric.key === "heartRate") {
    const val = Number(metricValue.value);
    if (!val || val < 30 || val > 250) {
      uni.showToast({ title: "请填写合理的心率数值（30-250 次/分）", icon: "none" });
      return;
    }
  }

  let value = `${metricValue.value} ${metric.unit}`.trim();

  if (metric.key === "bloodPressure") {
    value = `${systolic.value} / ${diastolic.value} ${metric.unit}`;
  }

  if (metric.key === "sleep") {
    value = sleepStatus.value;
  }

  const savedRecord = await saveMetricRecord(appState.viewerId, {
    memberId: selectedMemberId.value,
    metric: metric.label,
    value,
    time: "刚刚",
    status: "已保存"
  });

  savedRecords.value.unshift(savedRecord);

  uni.showToast({ title: `已保存${selectedMember.value.name}的${metric.label}`, icon: "success" });
  cancelRecord();
}

const recordingDuration = ref(0);
const voiceState = ref("idle");
const voiceFilePath = ref("");
let recorderManager = null;
let audioContext = null;
let durationTimer = null;

function getRecorderManager() {
  if (typeof wx === "undefined" || !wx.getRecorderManager) {
    uni.showToast({ title: "当前环境不支持录音", icon: "none" });
    return null;
  }

  if (!recorderManager) {
    recorderManager = wx.getRecorderManager();
    recorderManager.onStop((res) => {
      voiceFilePath.value = res.tempFilePath;
      voiceState.value = "stopped";
      if (durationTimer) clearInterval(durationTimer);
      uni.showToast({ title: "录音完成", icon: "success" });
    });
    recorderManager.onError(() => {
      voiceState.value = "idle";
      if (durationTimer) clearInterval(durationTimer);
      uni.showToast({ title: "录音失败，请重试", icon: "none" });
    });
  }
  return recorderManager;
}

function getAudioContext() {
  if (typeof wx === "undefined" || !wx.createInnerAudioContext) {
    uni.showToast({ title: "当前环境不支持播放录音", icon: "none" });
    return null;
  }

  if (!audioContext) {
    audioContext = wx.createInnerAudioContext();
    audioContext.onEnded(() => {
      uni.showToast({ title: "播放完毕", icon: "none" });
    });
  }
  return audioContext;
}

function handleVoiceButton() {
  const rm = getRecorderManager();
  if (!rm) return;

  if (voiceState.value === "idle") {
    voiceState.value = "recording";
    recordingDuration.value = 0;
    rm.start({ duration: 60000, format: "mp3" });
    durationTimer = setInterval(() => recordingDuration.value++, 1000);
  } else if (voiceState.value === "recording") {
    rm.stop();
  } else if (voiceState.value === "stopped") {
    const ac = getAudioContext();
    if (!ac) return;
    ac.src = voiceFilePath.value;
    ac.play();
    uni.showToast({ title: "正在播放", icon: "none" });
  }
}

// Cleanup
onUnmounted(() => {
  if (durationTimer) clearInterval(durationTimer);
  if (audioContext) audioContext.destroy();
});
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.record-hero {
  padding: 30rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22rpx;
  border-color: #b7dccf;
  background: linear-gradient(180deg, #ffffff, #edf8f3);
}

.hero-title {
  display: block;
  margin-top: 10rpx;
  color: #18332d;
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.28;
}

.hero-desc {
  display: block;
  margin-top: 10rpx;
  color: #4a5c55;
  font-size: 29rpx;
  line-height: 1.45;
}

.hero-action {
  flex: 0 0 174rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 88rpx;
  border-radius: 8rpx;
  background: #2f8f72;
  color: #ffffff;
  font-size: 31rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
  box-shadow: 0 16rpx 34rpx rgba(47, 143, 114, 0.22);
}

.quick-record-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
  margin-top: 18rpx;
}

.quick-record {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 126rpx;
  padding: 24rpx;
  text-align: left;
}

.quick-title {
  display: block;
  color: #18332d;
  font-size: 34rpx;
  font-weight: 900;
}

.quick-desc {
  display: block;
  margin-top: 8rpx;
  color: #2f8f72;
  font-size: 29rpx;
  font-weight: 800;
}

.input-card {
  padding: 30rpx;
}

.metric-chooser {
  margin-bottom: 20rpx;
  padding: 24rpx;
}

.form-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.form-title {
  display: block;
  margin-top: 8rpx;
  color: #18332d;
  font-size: 36rpx;
  font-weight: 900;
}

.close-form {
  flex: 0 0 108rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 62rpx;
  border-radius: 999rpx;
  background: #e7f0eb;
  color: #2f8f72;
  font-size: 29rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 16rpx;
}

.metric-grid button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 76rpx;
  border-radius: 8rpx;
  background: #e7f0eb;
  color: #38564e;
  font-size: 29rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.metric-grid button.active {
  background: #2f8f72;
  color: #ffffff;
}

.card-label,
.field-label {
  display: block;
  color: #4a5c55;
  font-size: 30rpx;
}

.member-confirm {
  margin-top: 12rpx;
  padding: 22rpx;
  border-radius: 8rpx;
  background: #f5faf7;
}

.confirm-name {
  display: block;
  color: #18332d;
  font-size: 42rpx;
  font-weight: 900;
}

.confirm-note {
  display: block;
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
}

.field-block {
  margin-top: 28rpx;
}

.picker-field {
  min-height: 96rpx;
  margin-top: 12rpx;
  padding: 0 22rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fbfdfc;
  color: #18332d;
  font-size: 34rpx;
  font-weight: 800;
}

.picker-arrow {
  color: #2f8f72;
  font-size: 30rpx;
}

.bp-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
  margin-top: 24rpx;
}

.number-field {
  display: block;
}

.number-field text {
  display: block;
  margin-bottom: 12rpx;
  color: #4a5c55;
  font-size: 30rpx;
}

.number-field input {
  width: 100%;
  height: 104rpx;
  padding: 0 20rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  background: #fbfdfc;
  color: #18332d;
  font-size: 46rpx;
  font-weight: 900;
}

.number-field.single {
  margin-top: 24rpx;
}

.sleep-block {
  margin-top: 24rpx;
}

.sleep-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 14rpx;
}

.sleep-options button {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 112rpx;
  padding: 18rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  background: #fbfdfc;
  text-align: left;
  line-height: 1.2;
}

.sleep-options button.active {
  border-color: #2f8f72;
  background: #dff2ea;
}

.sleep-options text {
  display: block;
}

.sleep-options text:first-child {
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.sleep-options text:last-child {
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
}

.voice-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
  margin-top: 24rpx;
  padding: 18rpx;
  border-radius: 8rpx;
  background: #f5faf7;
}

.voice-row text {
  flex: 1;
  min-width: 0;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.voice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 190rpx;
  min-height: 70rpx;
  border-radius: 999rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.voice-button.active {
  background: #d96a55;
  color: #ffffff;
}

.voice-button.done {
  background: #3a73c9;
  color: #ffffff;
}

.note-input {
  width: 100%;
  min-height: 120rpx;
  margin: 24rpx 0 18rpx;
  padding: 20rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  background: #fbfdfc;
  color: #18332d;
  font-size: 30rpx;
}

.save-button {
  position: sticky;
  bottom: 24rpx;
  z-index: 5;
  box-shadow: 0 16rpx 34rpx rgba(47, 143, 114, 0.22);
}

.period-switch {
  display: flex;
  gap: 8rpx;
  padding: 6rpx;
  border-radius: 999rpx;
  background: #e7f0eb;
}

.period-switch button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 86rpx;
  min-height: 58rpx;
  border-radius: 999rpx;
  color: #4a5c55;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}

.period-switch button.active {
  background: #2f8f72;
  color: #ffffff;
}

.trend-card {
  padding: 24rpx;
}

.trend-desc {
  display: block;
  margin-top: 18rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.5;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-row {
  min-height: 112rpx;
  padding: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.record-time,
.record-value {
  display: block;
}

.record-time {
  color: #4a5c55;
  font-size: 30rpx;
}

.record-value {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.35;
}

.empty-record {
  padding: 24rpx;
}
</style>
