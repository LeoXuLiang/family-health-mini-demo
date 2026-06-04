<template>
  <view class="page">
    <PageHeader title="家庭" action-text="邀" @action="inviteMember" />

    <view class="content">
      <view class="overview-card card">
        <view>
          <text class="card-label">家庭权限</text>
          <text class="overview-title">6 位成员，2 位管理员</text>
          <text class="overview-desc">丈夫和妻子可看全家，婆婆可照护公公，岳母可照护岳父。</text>
        </view>
        <text class="status-chip">已配置</text>
      </view>

      <view class="viewer-card card">
        <text class="card-label">模拟当前登录人</text>
        <view class="viewer-buttons">
          <button
            v-for="viewer in viewerOptions"
            :key="viewer.id"
            :class="{ active: currentViewerId === viewer.id }"
            @click="currentViewerId = viewer.id"
          >
            {{ viewer.name }}
          </button>
        </view>
        <text class="viewer-note">当前可见 {{ visibleMembers.length }} 位成员</text>
      </view>

      <view class="section-title">
        <text class="section-title-text">成员档案</text>
        <button class="link-button" @click="addMember">新增</button>
      </view>

      <view class="family-grid">
        <view
          v-for="member in visibleMembers"
          :key="member.id"
          class="person-card card"
          :class="{ admin: member.isAdmin }"
          @click="openMember(member)"
        >
          <view class="person-top">
            <text class="role-chip">{{ member.role }}</text>
            <text class="age-text">{{ ageText(member) }}</text>
          </view>
          <text class="person-name">{{ member.name }}</text>
          <text class="person-scope">{{ member.visibleScope }}</text>
          <view class="profile-summary">
            <text>{{ member.gender || "性别待补充" }} · {{ member.heightCm || "待补充" }}cm / {{ member.weightKg || "待补充" }}kg</text>
            <text>病史：{{ listText(member.chronicConditions, "无慢性病记录") }}</text>
            <text>过敏：{{ allergyText(member) }}</text>
          </view>
          <view class="tag-row">
            <text v-for="tag in member.tags" :key="tag">{{ tag }}</text>
          </view>
          <button class="profile-link" @click.stop="openMember(member)">查看档案</button>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">家庭设置</text>
      </view>

      <button class="settings-row card" @click="openSetting('提醒设置')">
        <text>提醒设置</text>
        <text>12 个已开启</text>
      </button>
      <button class="settings-row card" @click="openSetting('隐私和授权')">
        <text>隐私和授权</text>
        <text>成员可撤回</text>
      </button>
      <button class="settings-row card" @click="openSetting('就医与用药记录')">
        <text>就医与用药记录</text>
        <text>仅记录医嘱</text>
      </button>
    </view>

    <MedicalNote />
    <OnboardingPanel />
    <TabBar :active="5" />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import OnboardingPanel from "../../components/OnboardingPanel.vue";
import TabBar from "../../components/TabBar.vue";
import { viewerOptions } from "../../data/demoData";
import { appState, switchViewer } from "../../state/appState";
import { listMembers } from "../../services/cloudService";

const visibleMembers = ref([]);

const currentViewerId = computed({
  get: () => appState.viewerId,
  set: async (value) => {
    switchViewer(value);
    await loadMembers();
  }
});

onShow(loadMembers);

async function loadMembers() {
  visibleMembers.value = await listMembers(appState.viewerId);
}

function calculateAge(birthDate, fallbackAge) {
  if (!birthDate) return fallbackAge || "--";
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return fallbackAge || "--";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function ageText(member) {
  return `${calculateAge(member.birthDate, member.age)}岁`;
}

function listText(list, emptyText) {
  return Array.isArray(list) && list.length > 0 ? list.join("、") : emptyText;
}

function allergyText(member) {
  const items = [
    ...(member.drugAllergies || []),
    ...(member.foodAllergies || [])
  ];
  return items.length > 0 ? items.join("、") : member.allergyNote || "无已知过敏";
}

function inviteMember() {
  uni.navigateTo({ url: "/pages/invite/index" });
}

function addMember() {
  uni.showToast({ title: "Demo 固定 6 位成员", icon: "none" });
}

function openMember(member) {
  uni.navigateTo({ url: `/pages/member/detail?id=${member.id}` });
}

function openSetting(title) {
  const target = {
    提醒设置: "/pages/reminders/index?id=dad",
    隐私和授权: "/pages/data/index?id=me",
    就医与用药记录: "/pages/care/index?id=dad"
  }[title];
  uni.navigateTo({ url: target });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.overview-card,
.viewer-card {
  padding: 28rpx;
}

.overview-card {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.card-label {
  display: block;
  color: #4a5c55;
  font-size: 30rpx;
}

.overview-title {
  display: block;
  margin-top: 8rpx;
  color: #18332d;
  font-size: 38rpx;
  font-weight: 900;
  line-height: 1.3;
}

.overview-desc {
  display: block;
  margin-top: 10rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.5;
}

.viewer-card {
  margin-top: 20rpx;
}

.viewer-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12rpx;
  margin-top: 18rpx;
}

.viewer-buttons button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 76rpx;
  border-radius: 8rpx;
  background: #e7f0eb;
  color: #4a5c55;
  font-size: 29rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
}

.viewer-buttons button.active {
  background: #2f8f72;
  color: #ffffff;
}

.viewer-note {
  display: block;
  margin-top: 16rpx;
  color: #4a5c55;
  font-size: 30rpx;
}

.family-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.person-card {
  min-height: 390rpx;
  padding: 22rpx;
}

.person-card.admin {
  border-color: #b7dccf;
  background: linear-gradient(180deg, #ffffff, #edf8f3);
}

.person-top {
  display: flex;
  justify-content: space-between;
  gap: 10rpx;
}

.role-chip {
  max-width: 160rpx;
  min-height: 42rpx;
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 800;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.age-text {
  color: #4a5c55;
  font-size: 30rpx;
}

.person-name {
  display: block;
  margin-top: 18rpx;
  color: #18332d;
  font-size: 38rpx;
  font-weight: 900;
}

.person-scope {
  display: block;
  min-height: 68rpx;
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.36;
}

.profile-summary {
  margin-top: 14rpx;
  padding: 14rpx;
  border-radius: 8rpx;
  background: #f5faf7;
}

.profile-summary text {
  display: block;
  color: #38564e;
  font-size: 27rpx;
  line-height: 1.42;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.profile-summary text + text {
  margin-top: 6rpx;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 12rpx;
}

.tag-row text {
  padding: 6rpx 10rpx;
  border-radius: 999rpx;
  background: #fff1cf;
  color: #8a641c;
  font-size: 30rpx;
}

.profile-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 68rpx;
  margin-top: 16rpx;
  border-radius: 8rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 29rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.settings-row {
  width: 100%;
  min-height: 98rpx;
  margin-bottom: 16rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #18332d;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
  text-align: left;
}

.settings-row text:last-child {
  color: #2f8f72;
  font-size: 30rpx;
}
</style>
