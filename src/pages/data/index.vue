<template>
  <view class="page">
    <PageHeader title="数据管理" action-text="清" @action="resetDemo" />

    <view class="content">
      <view class="summary-card card">
        <text class="label">{{ member.name }}</text>
        <text class="title">隐私、导出和删除</text>
        <text class="desc">成员可删除自己的健康记录、餐食照片，也可退出家庭。正式版需要后端执行真实删除。</text>
      </view>

      <view v-for="item in dataChecklist" :key="item.key" class="data-row card">
        <view>
          <text class="row-title">{{ item.title }}</text>
          <text class="row-desc">{{ item.status }}</text>
        </view>
        <button @click="handleDataAction(item)">管理</button>
      </view>

      <button class="danger-button" @click="deleteMemberData">删除{{ member.name }}的餐食照片和健康记录</button>
      <button class="secondary-button" @click="exportData">导出给医生查看</button>
    </view>

    <MedicalNote />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import { dataChecklist, getMember } from "../../data/demoData";
import { resetDemoState, appState } from "../../state/appState";
import { requestDataDeletion } from "../../services/mockBackend";

const memberId = ref("me");
onLoad((query) => {
  memberId.value = query.id || "me";
});

const member = computed(() => getMember(memberId.value));

function handleDataAction(item) {
  uni.showModal({ title: item.title, content: `当前状态：${item.status}。正式版会进入细分管理页。`, showCancel: false });
}

async function deleteMemberData() {
  const result = await requestDataDeletion(appState.viewerId, memberId.value, "metrics-and-meals");
  uni.showModal({ title: "删除申请", content: result.status, showCancel: false });
}

function exportData() {
  uni.showModal({ title: "导出数据", content: "正式版会导出 PDF 或 Excel，方便复诊时给医生查看。", showCancel: false });
}

function resetDemo() {
  resetDemoState();
  uni.reLaunch({ url: "/pages/today/index" });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.summary-card,
.data-row {
  padding: 26rpx;
  margin-bottom: 16rpx;
}

.label,
.title,
.desc,
.row-title,
.row-desc {
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
.row-desc {
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.row-title {
  color: #18332d;
  font-size: 31rpx;
  font-weight: 900;
}

.data-row button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 104rpx;
  min-height: 62rpx;
  border-radius: 999rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.danger-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 92rpx;
  margin: 18rpx 0 14rpx;
  border-radius: 8rpx;
  background: #fae5df;
  color: #b94f3a;
  font-size: 30rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}
</style>
