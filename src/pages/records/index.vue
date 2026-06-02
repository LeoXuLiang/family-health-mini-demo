<template>
  <view class="page">
    <PageHeader title="记录" action-text="记" @action="startRecord" />
    <MemberSelector v-model="selectedMemberId" :visible-members="visibleMembers" />

    <view class="content">
      <view v-if="recordingStarted" class="metric-chooser card">
        <text class="card-label">选择记录项目</text>
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
          <button class="voice-button" :class="{ active: isRecording }" @click="toggleVoiceInput">
            {{ isRecording ? "正在听..." : "语音录入备注" }}
          </button>
          <text>老人可直接说：“昨晚醒了一次”或“今天饭后测的”。</text>
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
        <TrendBars :values="selectedSummary.trend" />
        <text class="trend-desc">
          {{ selectedMember.name }}近 {{ period }} 天{{ selectedMetric.label }}记录整体{{ selectedSummary.status }}。
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
import { computed, ref } from "vue";
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
  sleepOptions,
  todaySummaries
} from "../../data/demoData";
import { appState, consumePendingMetric, visibleMembers } from "../../state/appState";
import { saveMetricRecord, listMetricRecords } from "../../services/cloudService";

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
const recordingStarted = ref(false);

const metricLabels = metricTypes.map((metric) => metric.label);
const selectedMetric = computed(() => metricTypes[selectedMetricIndex.value] || metricTypes[0]);
const selectedMember = computed(() => getMember(selectedMemberId.value));
const selectedSummary = computed(() => todaySummaries[selectedMemberId.value] || todaySummaries.me);

const visibleRecords = computed(() => {
  const visibleIds = new Set(visibleMembers.value.map((member) => member.id));
  return savedRecords.value.filter((record) => visibleIds.has(record.memberId)).slice(0, 8);
});

function changeMetric(event) {
  setMetricByIndex(Number(event.detail.value));
}

function startRecord() {
  recordingStarted.value = true;
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

onShow(async () => {
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
}

function toggleVoiceInput() {
  isRecording.value = true;
  uni.showToast({ title: "正在模拟语音转文字", icon: "none" });

  setTimeout(() => {
    const voiceText =
      selectedMetric.value.key === "sleep"
        ? "语音备注：昨晚中间醒了一次，早上精神还可以。"
        : `语音备注：刚刚给${selectedMember.value.name}记录${selectedMetric.value.label}，状态正常。`;
    note.value = note.value ? `${note.value}\n${voiceText}` : voiceText;
    isRecording.value = false;
  }, 700);
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.input-card {
  padding: 30rpx;
}

.metric-chooser {
  margin-bottom: 20rpx;
  padding: 24rpx;
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
  background: #2f8f72;
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
