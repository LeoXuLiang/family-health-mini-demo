<template>
  <view class="page">
    <PageHeader title="今天" action-text="提醒" @action="showReminderList" />
    <MemberSelector v-model="selectedMemberId" :visible-members="visibleMembers" />

    <view class="content">
      <view class="hero-card card">
        <view class="hero-copy">
          <text class="eyebrow">今日概况</text>
          <text class="hero-title">{{ heroTitle }}</text>
          <text class="hero-desc">{{ heroDesc }}</text>
        </view>
        <view class="score-ring">
          <text>{{ selectedSummary.completion }}%</text>
        </view>
      </view>

      <view class="quick-grid">
        <button
          v-for="action in quickActions"
          :key="action.key"
          class="quick-action card"
          @click="handleQuickAction(action.key)"
        >
          <text class="quick-icon" :class="`accent-${action.accent}`">{{ action.icon }}</text>
          <text class="quick-title">{{ action.title }}</text>
          <text class="quick-subtitle">{{ action.subtitle }}</text>
        </button>
      </view>

      <view class="section-title">
        <text class="section-title-text">需要关注</text>
        <button class="link-button" @click="showReminderList">查看全部</button>
      </view>

      <view v-if="filteredReminders.length > 0">
        <view
          v-for="reminder in filteredReminders"
          :key="reminder.id"
          class="notice-card card"
          :class="{ warn: reminder.level === 'warn' }"
        >
          <view class="notice-copy">
            <text class="notice-title">{{ reminder.title }}</text>
            <text class="notice-detail">{{ reminder.detail }}</text>
          </view>
          <button class="notice-button" @click="goRecord(reminder.memberId)">
            {{ reminder.level === "warn" ? "去记录" : "知道了" }}
          </button>
        </view>
      </view>
      <view v-else class="notice-empty card">
        <text class="notice-title">当前无待办提醒</text>
        <text class="notice-detail">开始记录一项指标后，这里会自动汇总提醒。</text>
      </view>

      <view class="section-title">
        <text class="section-title-text">家庭快照</text>
      </view>

      <view class="snapshot-list">
        <view
          v-for="member in visibleMembers"
          :key="member.id"
          class="snapshot-card card"
          @click="selectMember(member.id)"
        >
          <view>
            <text class="person-name">{{ member.name }}</text>
            <text class="person-status">{{ summaries[member.id].status }}</text>
          </view>
          <view class="person-metric">
            <text>{{ summaries[member.id].primary }}</text>
            <text>{{ summaries[member.id].secondary }}</text>
          </view>
        </view>
      </view>
    </view>

    <MedicalNote />
    <OnboardingPanel />
    <TabBar :active="0" />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MemberSelector from "../../components/MemberSelector.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import OnboardingPanel from "../../components/OnboardingPanel.vue";
import TabBar from "../../components/TabBar.vue";
import { canReceiveReminder, getMember, quickActions, reminders } from "../../data/demoData";
import { appState, setPendingMetric, visibleMembers } from "../../state/appState";
import { listMedicationTasks, listMetricRecords } from "../../services/cloudService";

const selectedMemberId = ref(appState.viewerId || "me");
const summaries = reactive({});

const selectedSummary = computed(() => summaries[selectedMemberId.value] || defaultSummary());
const selectedMember = computed(() => visibleMembers.value.find((member) => member.id === selectedMemberId.value));
const availableReminders = computed(() => reminders.filter((reminder) => canReceiveReminder(appState.viewerId, reminder)));

const heroTitle = computed(() => {
  if (selectedMemberId.value === "me") {
    const completedCount = visibleMembers.value.filter((member) => {
      const summary = summaries[member.id];
      return summary && summary.completion > 0;
    }).length;
    if (completedCount === 0) {
      return "今天还没有新增记录";
    }
    return `${visibleMembers.value.length} 人中 ${completedCount} 人已完成记录`;
  }
  return `${selectedMember.value?.name || "成员"}今日完成度 ${selectedSummary.value.completion}%`;
});

const heroDesc = computed(() => {
  if (selectedMemberId.value === "me") {
    return availableReminders.value.length > 0
      ? "可先处理待办提醒，再补录健康指标。"
      : "可从体重、血压或睡眠开始记录今天的健康数据。";
  }
  return `${selectedSummary.value.primary}，${selectedSummary.value.secondary}。`;
});

function defaultSummary() {
  return { completion: 0, status: "待记录", primary: "今日暂无记录", secondary: "可先记录体重或睡眠", trend: [0, 0, 0, 0, 0, 0, 0] };
}

function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isToday(isoStr) {
  if (!isoStr) return false;
  return localDateStr(new Date(isoStr)) === localDateStr(new Date());
}

async function loadTodayData() {
  const records = await listMetricRecords(appState.viewerId);
  console.log("[today] loaded", records.length, "records from cloud");
  const todayStr = localDateStr(new Date());
  console.log("[today] local date:", todayStr);

  const todayRecords = records.filter((r) => {
    const recordDate = localDateStr(new Date(r.createdAt));
    console.log("[today] record", r.metric, r.createdAt, "→", recordDate);
    return recordDate === todayStr;
  });
  console.log("[today] todayRecords:", todayRecords.length);

  const allMembers = visibleMembers.value;
  for (const member of allMembers) {
    const memberRecords = todayRecords.filter((r) => r.memberId === member.id);
    if (memberRecords.length === 0) {
      summaries[member.id] = { ...defaultSummary() };
      continue;
    }
    const metrics = new Set(memberRecords.map((r) => r.metric));
    const completion = Math.min(Math.round((metrics.size / 5) * 100), 100);
    const latest = memberRecords.reduce((a, b) => (a.createdAt > b.createdAt ? a : b));
    const status = completion >= 80 ? "记录良好" : "已记录";
    summaries[member.id] = {
      completion,
      status,
      primary: latest.value,
      secondary: `已记录 ${metrics.size} 项指标`,
      trend: [0, 0, 0, 0, 0, 0, 0]
    };
  }
}

// 先用默认值填充，避免模板渲染时 summaries[member.id] 为 undefined
for (const m of visibleMembers.value) {
  summaries[m.id] = defaultSummary();
}
onShow(loadTodayData);

const filteredReminders = computed(() => {
  if (selectedMemberId.value === "me") {
    return availableReminders.value;
  }
  return availableReminders.value.filter((reminder) => reminder.memberId === selectedMemberId.value);
});

function handleQuickAction(key) {
  if (key === "meal") {
    uni.switchTab({ url: "/pages/meals/index" });
    return;
  }

  setPendingMetric(key);
  uni.switchTab({ url: "/pages/records/index" });
}

function goRecord(memberId) {
  selectedMemberId.value = memberId;
  uni.switchTab({ url: "/pages/records/index" });
}

function selectMember(memberId) {
  selectedMemberId.value = memberId;
}

async function showReminderList() {
  const metricItems = reminders
    .filter((item) => item.level === "warn")
    .filter((item) => canReceiveReminder(appState.viewerId, item))
    .map((item) => `· ${item.title}`);
  const medicationTasks = await listMedicationTasks(appState.viewerId);
  const medicationItems = medicationTasks
    .filter((item) => item.todayStatus === "pending")
    .map((item) => {
      const names = item.remindTo.map((id) => getMember(id).name).join("、");
      return `· ${names} ${item.time} ${item.medicine}未确认`;
    });
  const content = [...metricItems, ...medicationItems].join("\n");

  uni.showModal({
    title: "今日提醒",
    content: content || "今天没有待办提醒。",
    showCancel: medicationItems.length > 0,
    cancelText: "知道了",
    confirmText: medicationItems.length > 0 ? "去用药" : "知道了",
    success(result) {
      if (result.confirm && medicationItems.length > 0) {
        uni.switchTab({ url: "/pages/medications/index" });
      }
    }
  });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.hero-card {
  position: relative;
  padding: 30rpx;
}

.hero-copy {
  padding-right: 176rpx;
}

.eyebrow {
  display: block;
  color: #4a5c55;
  font-size: 30rpx;
}

.hero-title {
  display: block;
  margin-top: 10rpx;
  color: #18332d;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 1.24;
  white-space: normal;
}

.hero-desc {
  display: block;
  margin-top: 10rpx;
  color: #4a5c55;
  font-size: 29rpx;
  line-height: 1.5;
}

.score-ring {
  position: absolute;
  right: 64rpx;
  top: 50%;
  width: 128rpx;
  height: 128rpx;
  transform: translateY(-50%);
  border: 10rpx solid #2f8f72;
  border-left-color: #dce8e2;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2f8f72;
  font-size: 34rpx;
  font-weight: 900;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20rpx;
  margin-top: 24rpx;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  min-height: 208rpx;
  padding: 26rpx;
  text-align: left;
}

.quick-icon {
  width: 70rpx;
  height: 70rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30rpx;
  font-weight: 900;
}

.quick-title {
  display: block;
  margin-top: 22rpx;
  color: #142822;
  font-size: 34rpx;
  font-weight: 900;
}

.quick-subtitle {
  display: block;
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 29rpx;
  line-height: 1.35;
}

.notice-card {
  min-height: 144rpx;
  margin-bottom: 18rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.notice-card.warn {
  border-color: #f0d1a3;
  background: #fffaf0;
}

.notice-empty {
  min-height: 126rpx;
  margin-bottom: 18rpx;
  padding: 24rpx;
}

.notice-copy {
  flex: 1;
  min-width: 0;
}

.notice-title {
  display: block;
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.notice-detail {
  display: block;
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.notice-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 118rpx;
  height: 66rpx;
  border-radius: 999rpx;
  background: #d96a55;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}

.snapshot-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.snapshot-card {
  min-height: 128rpx;
  padding: 24rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.person-name,
.person-metric text {
  display: block;
}

.person-name {
  color: #18332d;
  font-size: 34rpx;
  font-weight: 900;
}

.person-status {
  display: inline-flex;
  margin-top: 12rpx;
  padding: 8rpx 16rpx;
  border-radius: 999rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 800;
}

.person-metric {
  min-width: 230rpx;
  text-align: right;
  color: #4a5c55;
  font-size: 29rpx;
  line-height: 1.5;
}
</style>
