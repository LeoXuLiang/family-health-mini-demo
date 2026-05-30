<template>
  <view v-if="!appState.privacyAccepted" class="overlay">
    <view class="panel">
      <text class="eyebrow">首次使用</text>
      <text class="title">绑定身份并授权健康数据</text>
      <text class="desc">
        小程序会保存家庭成员档案、健康指标、餐食照片、提醒、就医和用药记录。数据仅用于家庭健康管理，不替代医生诊断。
      </text>

      <view class="privacy-list">
        <text>会使用：微信登录、相机/相册、健康记录、提醒设置。</text>
        <text>可撤回：成员可在数据管理中删除记录或退出家庭。</text>
        <text>用药边界：仅记录医生医嘱，不提供剂量调整建议。</text>
      </view>

      <text class="field-label">我的身份</text>
      <picker :range="memberNames" :value="selectedIndex" @change="selectedIndex = Number($event.detail.value)">
        <view class="picker-field">
          <text>{{ selectedMember.name }}</text>
          <text>切换</text>
        </view>
      </picker>

      <button class="primary-button" @click="confirm">同意并进入</button>
      <button class="ghost-button" @click="previewAsAdmin">先以管理员预览</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { members } from "../data/demoData";
import { acceptPrivacy } from "../state/appState";
import { bindMember, loginWithWechat } from "../services/mockBackend";
import { appState } from "../state/appState";

const selectedIndex = ref(0);
const memberNames = members.map((member) => member.name);
const selectedMember = computed(() => members[selectedIndex.value]);

async function confirm() {
  await loginWithWechat();
  await bindMember(selectedMember.value.id);
  acceptPrivacy(selectedMember.value.id);
  uni.showToast({ title: "已完成身份绑定", icon: "none" });
}

function previewAsAdmin() {
  selectedIndex.value = 0;
  confirm();
}
</script>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 32rpx;
  background: rgba(15, 33, 28, 0.34);
}

.panel {
  width: calc(100vw - 64rpx);
  max-height: 88vh;
  box-sizing: border-box;
  overflow-y: auto;
  padding: 34rpx;
  border-radius: 18rpx;
  background: #ffffff;
  box-shadow: 0 24rpx 80rpx rgba(24, 51, 45, 0.22);
}

.eyebrow,
.desc,
.field-label {
  display: block;
  color: #66756f;
  font-size: 26rpx;
}

.title {
  display: block;
  margin-top: 8rpx;
  color: #18332d;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1.24;
}

.desc {
  margin-top: 16rpx;
  line-height: 1.55;
}

.privacy-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin: 24rpx 0;
  padding: 22rpx;
  border-radius: 8rpx;
  background: #f5faf7;
  color: #38564e;
  font-size: 26rpx;
  line-height: 1.5;
}

.picker-field {
  width: 100%;
  box-sizing: border-box;
  min-height: 92rpx;
  margin: 12rpx 0 24rpx;
  padding: 0 22rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #18332d;
  font-size: 32rpx;
  font-weight: 800;
}

.primary-button,
.ghost-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
  min-height: 92rpx;
  border-radius: 8rpx;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.primary-button {
  background: #2f8f72;
  color: #ffffff;
}

.ghost-button {
  margin-top: 14rpx;
  background: #e7f0eb;
  color: #2f8f72;
}
</style>
