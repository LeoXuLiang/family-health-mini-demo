<template>
  <view class="page">
    <PageHeader title="邀请家人" action-text="发" @action="shareInvite" />

    <view class="content">
      <view class="invite-card card">
        <text class="label">家庭邀请码</text>
        <text class="code">HEALTH-2026</text>
        <text class="desc">正式版会生成微信小程序分享卡片。家人进入后选择身份，管理员确认后完成绑定。</text>
      </view>

      <view class="step-card card">
        <text class="step-title">邀请流程</text>
        <text>1. 管理员发送小程序卡片。</text>
        <text>2. 家人选择“丈夫/妻子/公公/婆婆/岳父/岳母”。</text>
        <text>3. 管理员确认身份和可见范围。</text>
        <text>4. 后端写入成员绑定关系。</text>
      </view>

      <button class="primary-button" @click="shareInvite">生成邀请卡片</button>
    </view>
  </view>
</template>

<script setup>
import PageHeader from "../../components/PageHeader.vue";

function shareInvite() {
  uni.showModal({
    title: "邀请卡片",
    content: "Demo 展示流程。正式版会使用微信分享能力携带家庭 ID 和一次性邀请码。",
    showCancel: false
  });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.invite-card,
.step-card {
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.label,
.code,
.desc,
.step-title,
.step-card text {
  display: block;
}

.label {
  color: #4a5c55;
  font-size: 30rpx;
}

.code {
  margin-top: 14rpx;
  color: #18332d;
  font-size: 52rpx;
  font-weight: 900;
  letter-spacing: 0;
}

.desc,
.step-card text {
  margin-top: 12rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.5;
}

.step-title {
  color: #18332d !important;
  font-size: 34rpx !important;
  font-weight: 900;
}
</style>
