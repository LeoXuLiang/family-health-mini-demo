<template>
  <view class="page">
    <PageHeader title="饮食" action-text="拍" @action="chooseMealImage" />
    <MemberSelector v-model="selectedMemberId" :visible-members="visibleMembers" />

    <view class="content">
      <view class="camera-card card">
        <view>
          <text class="card-label">饮食分析</text>
          <text class="camera-title">拍下这一餐</text>
          <text class="camera-desc">识别菜品和搭配，结合近期指标给出家庭营养建议。</text>
        </view>
        <button class="camera-button" @click="chooseMealImage">拍照或上传</button>
      </view>

      <view v-if="mealImage" class="preview-card card">
        <image class="meal-image" :src="mealImage" mode="aspectFill" />
        <view class="preview-copy">
          <text class="preview-title">已选择餐食照片</text>
          <text class="preview-desc">Demo 使用本地模拟识别结果，真实版本会走云函数分析。</text>
        </view>
      </view>

      <view class="analysis-card card">
        <view class="analysis-header">
          <view>
            <text class="card-label">{{ selectedMember.name }} {{ activeAnalysis.mealType }}</text>
            <text class="analysis-title">{{ activeAnalysis.title }}</text>
          </view>
          <text class="score-chip">匹配度 {{ activeAnalysis.score }}</text>
        </view>

        <view class="plate-grid">
          <text>主食</text>
          <text>蔬菜</text>
          <text>蛋白</text>
          <text>汤饮</text>
        </view>

        <view class="nutrition-grid">
          <view
            v-for="macro in activeMacros"
            :key="macro.label"
            class="nutrition-item"
            :class="`accent-${macro.accent}`"
          >
            <text>{{ macro.label }}</text>
            <text>{{ macro.value }}</text>
          </view>
        </view>

        <view class="advice-box">
          <text class="advice-title">家庭营养师建议</text>
          <text class="advice-text">{{ activeAnalysis.advice }}</text>
        </view>

        <button class="secondary-button" @click="correctMeal">修正菜品和份量</button>
      </view>

      <view class="section-title">
        <text class="section-title-text">历史餐食</text>
      </view>

      <view v-if="memberMeals.length > 0" class="meal-list">
        <view v-for="meal in memberMeals" :key="meal.id" class="meal-row card">
          <view>
            <text class="meal-name">{{ meal.mealType }} {{ meal.title }}</text>
            <text class="meal-advice">{{ meal.advice }}</text>
          </view>
          <text class="status-chip">{{ meal.score }}</text>
        </view>
      </view>
      <view v-else class="empty-history card">
        <text class="meal-name">暂无历史餐食记录</text>
        <text class="meal-advice">拍照上传第一餐后，这里会自动沉淀历史记录与营养建议。</text>
      </view>
    </view>

    <MedicalNote />
    <OnboardingPanel />
    <TabBar :active="2" />
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
import { getMember } from "../../data/demoData";
import { appState } from "../../state/appState";
import { uploadMealPhoto, saveMealRecord, listMealRecords, listMembers } from "../../services/cloudService";

const selectedMemberId = ref(appState.viewerId || "me");
const mealImage = ref("");
const mealRecords = ref([]);
const visibleMembers = ref([]);
const analysisOverride = ref(null);

const fallbackAnalysis = computed(() => ({
  id: "empty-meal",
  memberId: selectedMemberId.value,
  mealType: "今日餐食",
  score: "--",
  title: "尚未上传餐食照片",
  macros: [
    { label: "碳水", value: "待分析", accent: "blue" },
    { label: "蛋白", value: "待分析", accent: "green" },
    { label: "蔬菜", value: "待分析", accent: "gold" }
  ],
  advice: "请拍照上传一餐，系统会结合近期健康指标生成饮食匹配建议。"
}));

const selectedMember = computed(() => visibleMembers.value.find((member) => member.id === selectedMemberId.value) || getMember(selectedMemberId.value));
const memberMeals = computed(() => mealRecords.value.filter((meal) => meal.memberId === selectedMemberId.value));
const activeAnalysis = computed(() => analysisOverride.value || memberMeals.value[0] || fallbackAnalysis.value);
const activeMacros = computed(() => Array.isArray(activeAnalysis.value.macros) ? activeAnalysis.value.macros : fallbackAnalysis.value.macros);

async function loadMeals() {
  await loadMembers();
  mealRecords.value = await listMealRecords(appState.viewerId, selectedMemberId.value);
}

onShow(loadMeals);

async function loadMembers() {
  visibleMembers.value = await listMembers(appState.viewerId);
  if (!visibleMembers.value.some((member) => member.id === selectedMemberId.value)) {
    selectedMemberId.value = visibleMembers.value[0]?.id || appState.viewerId || "me";
  }
}

async function chooseMealImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    async success(result) {
      const tempPath = result.tempFilePaths[0];
      mealImage.value = tempPath;
      uni.showLoading({ title: "上传中..." });

      try {
        const fileID = await uploadMealPhoto(tempPath);
        const meal = await saveMealRecord(appState.viewerId, {
          memberId: selectedMemberId.value,
          photoFileID: fileID
        });
        analysisOverride.value = meal;
        mealRecords.value.unshift(meal);
        uni.hideLoading();
        uni.showToast({ title: "照片已保存", icon: "success" });
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: "上传失败，请重试", icon: "none" });
      }
    }
  });
}

function correctMeal() {
  uni.showModal({
    title: "修正入口",
    content: "可补充菜品名称和份量，AI 识别功能需接入腾讯云图像分析服务后启用。",
    showCancel: false
  });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.camera-card {
  min-height: 330rpx;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background:
    linear-gradient(180deg, rgba(24, 51, 45, 0.06), rgba(24, 51, 45, 0.58)),
    linear-gradient(135deg, #f4d38e, #a9d8c2 52%, #e18472);
}

.card-label {
  display: block;
  color: #4a5c55;
  font-size: 30rpx;
}

.camera-card .card-label,
.camera-desc,
.camera-title {
  color: #ffffff;
}

.camera-title {
  display: block;
  margin-top: 10rpx;
  font-size: 44rpx;
  font-weight: 900;
}

.camera-desc {
  display: block;
  margin-top: 12rpx;
  font-size: 30rpx;
  line-height: 1.5;
}

.camera-button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92rpx;
  border-radius: 8rpx;
  background: #ffffff;
  color: #2f8f72;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.preview-card {
  margin-top: 20rpx;
  overflow: hidden;
  display: flex;
}

.meal-image {
  width: 220rpx;
  height: 160rpx;
  flex: 0 0 220rpx;
  background: #dce8e2;
}

.preview-copy {
  min-width: 0;
  padding: 22rpx;
}

.preview-title {
  display: block;
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.preview-desc {
  display: block;
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.analysis-card {
  margin-top: 22rpx;
  padding: 28rpx;
}

.analysis-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.analysis-title {
  display: block;
  margin-top: 8rpx;
  color: #18332d;
  font-size: 34rpx;
  font-weight: 900;
  line-height: 1.35;
}

.score-chip {
  min-width: 138rpx;
  min-height: 60rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 900;
}

.plate-grid {
  height: 230rpx;
  margin-top: 24rpx;
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 12rpx;
}

.plate-grid text {
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #20443a;
  background: #dff2ea;
  font-size: 30rpx;
  font-weight: 900;
}

.plate-grid text:nth-child(2) {
  background: #d8efd0;
}

.plate-grid text:nth-child(3) {
  background: #fae5df;
}

.plate-grid text:nth-child(4) {
  background: #fff1cf;
}

.nutrition-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14rpx;
  margin-top: 20rpx;
}

.nutrition-item {
  min-height: 112rpx;
  padding: 18rpx;
  border-radius: 8rpx;
}

.nutrition-item text {
  display: block;
}

.nutrition-item text:first-child {
  font-size: 30rpx;
}

.nutrition-item text:last-child {
  margin-top: 8rpx;
  font-size: 30rpx;
  font-weight: 900;
}

.advice-box {
  margin: 22rpx 0;
  padding: 22rpx;
  border-radius: 8rpx;
  background: #f5faf7;
}

.advice-title,
.advice-text {
  display: block;
}

.advice-title {
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.advice-text {
  margin-top: 10rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.55;
}

.meal-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.empty-history {
  padding: 24rpx;
}

.meal-row {
  min-height: 138rpx;
  padding: 22rpx;
  display: flex;
  justify-content: space-between;
  gap: 16rpx;
}

.meal-name,
.meal-advice {
  display: block;
}

.meal-name {
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.meal-advice {
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}
</style>
