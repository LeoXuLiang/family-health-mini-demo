<template>
  <view class="page">
    <PageHeader title="提醒设置" action-text="加" @action="addReminder" />

    <view class="content">
      <view class="summary-card card">
        <text class="label">{{ member.name }}</text>
        <text class="title">记录、复诊和用药提醒</text>
        <text class="desc">用药提醒只记录是否按医嘱服用，不提供剂量调整建议。</text>
      </view>

      <view class="section-title">
        <text class="section-title-text">健康记录提醒</text>
      </view>
      <view v-for="item in normalPlans" :key="item.id" class="reminder-card card">
        <view>
          <text class="reminder-title">{{ item.title }}</text>
          <text class="reminder-desc">{{ item.repeat }} {{ item.time }}</text>
        </view>
        <switch :checked="item.enabled" color="#2f8f72" @change="toggle(item)" />
      </view>

      <view class="section-title">
        <text class="section-title-text">服药提醒</text>
        <button class="link-button" @click="addMedicationReminder">新增</button>
      </view>
      <view v-for="item in medicationPlans" :key="item.id" class="med-card card">
        <view class="med-main">
          <text class="reminder-title">{{ item.title }}</text>
          <text class="medicine">{{ item.medicine }} · {{ item.dosage }}</text>
          <text class="reminder-desc">{{ item.repeat }} {{ item.time }} 提醒 {{ receiverNames(item.remindTo) }}</text>
          <text class="safe-note">仅提醒按医嘱服用，不建议自行调整剂量。</text>
        </view>
        <switch :checked="item.enabled" color="#2f8f72" @change="toggle(item)" />
      </view>
    </view>

    <MedicalNote />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import { getMember, reminderPlans } from "../../data/demoData";

const memberId = ref("dad");
onLoad((query) => {
  memberId.value = query.id || "dad";
});

const member = computed(() => getMember(memberId.value));
const plans = computed(() => reminderPlans.filter((item) => item.memberId === memberId.value));
const normalPlans = computed(() => plans.value.filter((item) => item.type !== "medication"));
const medicationPlans = computed(() => plans.value.filter((item) => item.type === "medication"));

function toggle(item) {
  item.enabled = !item.enabled;
}

function addReminder() {
  uni.showModal({ title: "新增提醒", content: "正式版会支持每日、每周和指定日期提醒，并接入微信订阅消息。", showCancel: false });
}

function addMedicationReminder() {
  uni.showModal({
    title: "新增服药提醒",
    content: "正式版会选择药品、服用时间、重复周期和提醒对象，到点通过微信订阅消息提醒本人或照护人。",
    showCancel: false
  });
}

function receiverNames(remindTo) {
  const ids = Array.isArray(remindTo) ? remindTo : [remindTo];
  return ids.map((id) => getMember(id).name).join("、");
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.summary-card,
.reminder-card,
.med-card {
  padding: 26rpx;
  margin-bottom: 16rpx;
}

.label,
.title,
.desc,
.reminder-title,
.reminder-desc {
  display: block;
}

.label {
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 800;
}

.title {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 36rpx;
  font-weight: 900;
}

.desc,
.reminder-desc {
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.reminder-card,
.med-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
}

.reminder-title {
  color: #18332d;
  font-size: 31rpx;
  font-weight: 900;
}

.med-main {
  flex: 1;
  min-width: 0;
}

.medicine {
  display: block;
  margin-top: 8rpx;
  color: #18332d;
  font-size: 30rpx;
  font-weight: 800;
}

.safe-note {
  display: block;
  margin-top: 8rpx;
  color: #9a6d1d;
  font-size: 30rpx;
  line-height: 1.45;
}
</style>
