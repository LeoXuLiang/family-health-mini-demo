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
            <text class="age-text">{{ member.age }}岁</text>
          </view>
          <text class="person-name">{{ member.name }}</text>
          <text class="person-scope">{{ member.visibleScope }}</text>
          <view class="tag-row">
            <text v-for="tag in member.tags" :key="tag">{{ tag }}</text>
          </view>
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
  </view>
</template>

<script setup>
import { computed } from "vue";
import PageHeader from "../../components/PageHeader.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import OnboardingPanel from "../../components/OnboardingPanel.vue";
import { viewerOptions } from "../../data/demoData";
import { appState, switchViewer, visibleMembers } from "../../state/appState";

const currentViewerId = computed({
  get: () => appState.viewerId,
  set: (value) => switchViewer(value)
});

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
  color: #66756f;
  font-size: 26rpx;
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
  color: #66756f;
  font-size: 27rpx;
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
  color: #66756f;
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
  color: #66756f;
  font-size: 26rpx;
}

.family-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.person-card {
  min-height: 244rpx;
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
  font-size: 22rpx;
  font-weight: 800;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.age-text {
  color: #66756f;
  font-size: 23rpx;
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
  color: #66756f;
  font-size: 25rpx;
  line-height: 1.36;
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
  font-size: 21rpx;
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
  font-size: 26rpx;
}
</style>
