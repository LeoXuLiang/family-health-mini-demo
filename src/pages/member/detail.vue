<template>
  <view class="page">
    <PageHeader :title="profile.name || member.name" action-text="存" @action="saveProfile" />

    <view class="content">
      <view class="profile-card card">
        <view>
          <text class="role">{{ member.role }}</text>
          <text class="name">{{ profile.name || member.name }}</text>
          <text class="scope">{{ member.visibleScope }}</text>
        </view>
        <view class="basic">
          <text>{{ profile.gender }}</text>
          <text>{{ ageText }}</text>
          <text>{{ profile.heightCm || "待补充" }}cm / {{ profile.weightKg || "待补充" }}kg</text>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">基础资料</text>
      </view>

      <view class="form-card card">
        <label class="field">
          <text class="label">姓名</text>
          <input v-model="profile.name" placeholder="请输入姓名" />
        </label>

        <view class="field-grid">
          <view class="field">
            <text class="label">性别</text>
            <picker :range="genderOptions" :value="genderIndex" @change="changeGender">
              <view class="picker-field">{{ profile.gender }}</view>
            </picker>
          </view>
          <view class="field">
            <text class="label">出生日期</text>
            <picker mode="date" :value="profile.birthDate" @change="profile.birthDate = $event.detail.value">
              <view class="picker-field">{{ profile.birthDate || "待补充" }}</view>
            </picker>
          </view>
        </view>

        <view class="field-grid">
          <label class="field">
            <text class="label">身高 cm</text>
            <input v-model="profile.heightCm" type="digit" placeholder="例如 170" />
          </label>
          <label class="field">
            <text class="label">体重 kg</text>
            <input v-model="profile.weightKg" type="digit" placeholder="例如 65" />
          </label>
        </view>

        <view class="stat-grid">
          <view class="stat-item">
            <text class="label">BMI</text>
            <text class="value">{{ bmiValue }}</text>
          </view>
          <view class="stat-item">
            <text class="label">目标 BMI</text>
            <text class="value">{{ profile.bmiTarget || "待设定" }}</text>
          </view>
        </view>

        <view class="field-grid">
          <view class="field">
            <text class="label">血型</text>
            <picker :range="bloodTypeOptions" :value="bloodTypeIndex" @change="changeBloodType">
              <view class="picker-field">{{ profile.bloodType || "待补充" }}</view>
            </picker>
          </view>
          <label class="field">
            <text class="label">最近体检</text>
            <input v-model="profile.lastCheckDate" placeholder="例如 2026-05-30" />
          </label>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">个人标签</text>
      </view>

      <view class="form-card card">
        <view class="tags-display">
          <view
            v-for="(tag, i) in profile.tags"
            :key="i"
            class="tag-chip"
            @click="removeTag(i)"
          >
            <text>{{ tag }}</text>
            <text class="tag-remove">×</text>
          </view>
          <text v-if="profile.tags.length === 0" class="tag-empty">暂无标签，可从下方选择或自定义添加</text>
        </view>

        <text class="label" style="margin-top: 20rpx;">常用标签</text>
        <view class="tag-presets">
          <button
            v-for="preset in availablePresets"
            :key="preset"
            class="tag-preset-btn"
            @click="addTag(preset)"
          >
            {{ preset }}
          </button>
        </view>

        <view class="tag-custom-row">
          <input
            v-model="tagInput"
            class="tag-input"
            placeholder="输入自定义标签"
            @confirm="addCustomTag"
          />
          <button class="tag-add-btn" @click="addCustomTag">添加</button>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">健康基准</text>
      </view>

      <view class="form-card card">
        <view class="baseline-title">
          <text>血压基准值</text>
          <text>用于家庭提醒，不作为诊断标准</text>
        </view>
        <view class="field-grid">
          <label class="field">
            <text class="label">收缩压 mmHg</text>
            <input v-model="profile.systolic" type="number" placeholder="例如 120" />
          </label>
          <label class="field">
            <text class="label">舒张压 mmHg</text>
            <input v-model="profile.diastolic" type="number" placeholder="例如 80" />
          </label>
        </view>

        <view class="baseline-title second">
          <text>血糖基准值</text>
          <text>按医生建议调整记录范围</text>
        </view>
        <view class="field-grid">
          <label class="field">
            <text class="label">空腹 mmol/L</text>
            <input v-model="profile.fastingGlucose" type="digit" placeholder="例如 5.6" />
          </label>
          <label class="field">
            <text class="label">餐后 mmol/L</text>
            <input v-model="profile.postprandialGlucose" type="digit" placeholder="例如 7.8" />
          </label>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">病史与过敏</text>
      </view>

      <view class="form-card card">
        <label class="field">
          <text class="label">慢性病列表</text>
          <textarea v-model="profile.chronicConditionsText" placeholder="例如：高血压、糖尿病。无则填写无" />
        </label>
        <label class="field">
          <text class="label">药物过敏史</text>
          <textarea v-model="profile.drugAllergiesText" placeholder="例如：青霉素。无则填写无" />
        </label>
        <label class="field">
          <text class="label">食物过敏史</text>
          <textarea v-model="profile.foodAllergiesText" placeholder="例如：海鲜、花生。无则填写无" />
        </label>
        <label class="field">
          <text class="label">常用药备注</text>
          <textarea v-model="profile.medicationNote" placeholder="记录长期用药或医生医嘱" />
        </label>
      </view>

      <view class="section-title">
        <text class="section-title-text">紧急联系人</text>
      </view>

      <view class="form-card card">
        <view class="field-grid">
          <label class="field">
            <text class="label">联系人</text>
            <input v-model="profile.emergencyName" placeholder="姓名" />
          </label>
          <label class="field">
            <text class="label">关系</text>
            <input v-model="profile.emergencyRelation" placeholder="例如 配偶/子女" />
          </label>
        </view>
        <label class="field">
          <text class="label">联系电话</text>
          <input v-model="profile.emergencyPhone" type="number" placeholder="手机号或固定电话" />
        </label>
      </view>

      <view class="section-title">
        <text class="section-title-text">就医记录</text>
        <button class="link-button" @click="goCare">管理</button>
      </view>

      <view v-if="memberVisits.length > 0" class="visit-list">
        <view v-for="visit in memberVisits" :key="visit.id" class="visit-card card">
          <text class="visit-title">{{ visit.date }} {{ visit.department }}</text>
          <text class="visit-desc">{{ visit.hospital }} · {{ visit.doctor }}</text>
          <text class="visit-desc">{{ visit.summary }}</text>
        </view>
      </view>
      <view v-else class="form-card card">
        <text class="value">暂无就医记录</text>
        <text class="note">可点击“管理”进入就医用药页维护复诊、检查和用药记录。</text>
      </view>

      <view class="save-row">
        <button class="secondary-button" @click="goBack">取消</button>
        <button class="primary-button" @click="saveProfile">保存档案</button>
      </view>
    </view>

    <MedicalNote />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import { getMember, visitRecords } from "../../data/demoData";
import { appState } from "../../state/appState";
import { getMemberProfile, updateMemberProfile } from "../../services/cloudService";

const genderOptions = ["男", "女", "其他"];
const bloodTypeOptions = ["待补充", "A", "B", "AB", "O"];

const allTagPresets = [
  "血压关注", "血糖关注", "体重管理", "低盐饮食", "控糖饮食",
  "睡眠关注", "久坐提醒", "补钙", "运动恢复", "餐后记录",
  "低脂饮食", "高纤维", "少食多餐", "戒烟", "限酒"
];

const profile = reactive(createProfile(getMember("me")));
const memberId = ref("me");
const tagInput = ref("");

onLoad(async (query) => {
  memberId.value = query.id || "me";
  const loaded = await getMemberProfile(appState.viewerId, memberId.value);
  Object.assign(profile, createProfile(loaded));
});

const member = computed(() => getMember(memberId.value));
const genderIndex = computed(() => Math.max(genderOptions.indexOf(profile.gender), 0));
const bloodTypeIndex = computed(() => Math.max(bloodTypeOptions.indexOf(profile.bloodType || "待补充"), 0));
const memberVisits = computed(() => visitRecords.filter((record) => record.memberId === memberId.value));
const availablePresets = computed(() => allTagPresets.filter((tag) => !profile.tags.includes(tag)));

const bmiValue = computed(() => {
  const height = Number(profile.heightCm);
  const weight = Number(profile.weightKg);
  if (!height || !weight) {
    return "待补充";
  }
  const heightM = height / 100;
  return (weight / (heightM * heightM)).toFixed(1);
});

const ageText = computed(() => {
  if (!profile.birthDate) {
    return `${member.value.age || "--"}岁`;
  }
  const birthYear = Number(profile.birthDate.slice(0, 4));
  if (!birthYear) {
    return `${member.value.age || "--"}岁`;
  }
  return `${new Date().getFullYear() - birthYear}岁`;
});

function createProfile(source) {
  return {
    name: source.name || "",
    gender: source.gender || "男",
    birthDate: source.birthDate || "",
    heightCm: source.heightCm || "",
    weightKg: source.weightKg || "",
    bloodType: source.bloodType || "待补充",
    bmiTarget: source.bmiTarget || "",
    lastCheckDate: source.lastCheckDate || "",
    systolic: source.baselineBloodPressure?.systolic || "",
    diastolic: source.baselineBloodPressure?.diastolic || "",
    fastingGlucose: source.baselineBloodGlucose?.fasting || "",
    postprandialGlucose: source.baselineBloodGlucose?.postprandial || "",
    chronicConditionsText: listToText(source.chronicConditions),
    drugAllergiesText: listToText(source.drugAllergies),
    foodAllergiesText: listToText(source.foodAllergies),
    medicationNote: source.medicationNote || "",
    emergencyName: source.emergencyContact?.name || "",
    emergencyRelation: source.emergencyContact?.relation || "",
    emergencyPhone: source.emergencyContact?.phone || "",
    tags: [...(source.tags || [])]
  };
}

function addTag(tag) {
  if (!tag || profile.tags.includes(tag)) return;
  profile.tags.push(tag);
}

function removeTag(index) {
  profile.tags.splice(index, 1);
}

function addCustomTag() {
  const val = tagInput.value.trim();
  if (!val) return;
  if (profile.tags.includes(val)) {
    uni.showToast({ title: "标签已存在", icon: "none" });
    return;
  }
  profile.tags.push(val);
  tagInput.value = "";
}

function listToText(list) {
  return Array.isArray(list) && list.length > 0 ? list.join("、") : "无";
}

function textToList(text) {
  const normalized = String(text || "").trim();
  if (!normalized || normalized === "无") {
    return [];
  }
  return normalized
    .split(/[、,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function changeGender(event) {
  profile.gender = genderOptions[Number(event.detail.value)] || "男";
}

function changeBloodType(event) {
  const value = bloodTypeOptions[Number(event.detail.value)] || "待补充";
  profile.bloodType = value === "待补充" ? "" : value;
}

function buildProfilePayload(target) {
  const drugAllergies = textToList(profile.drugAllergiesText);
  const foodAllergies = textToList(profile.foodAllergiesText);

  return {
    name: profile.name || target.name,
    shortName: profile.name || target.shortName,
    gender: profile.gender,
    birthDate: profile.birthDate,
    heightCm: Number(profile.heightCm) || 0,
    weightKg: Number(profile.weightKg) || 0,
    bloodType: profile.bloodType,
    bmiTarget: profile.bmiTarget,
    lastCheckDate: profile.lastCheckDate,
    baselineBloodPressure: {
      systolic: Number(profile.systolic) || 0,
      diastolic: Number(profile.diastolic) || 0
    },
    baselineBloodGlucose: {
      fasting: Number(profile.fastingGlucose) || 0,
      postprandial: Number(profile.postprandialGlucose) || 0
    },
    age: Number(ageText.value.replace("岁", "")) || target.age,
    chronicConditions: textToList(profile.chronicConditionsText),
    drugAllergies,
    foodAllergies,
    allergyNote: [
      ...drugAllergies.map((item) => `药物：${item}`),
      ...foodAllergies.map((item) => `食物：${item}`)
    ].join("；") || "无已知过敏",
    medicationNote: profile.medicationNote,
    emergencyContact: {
      name: profile.emergencyName,
      relation: profile.emergencyRelation,
      phone: profile.emergencyPhone
    },
    tags: [...profile.tags]
  };
}

async function saveProfile() {
  const target = getMember(memberId.value);
  const payload = buildProfilePayload(target);

  try {
    const saved = await updateMemberProfile(appState.viewerId, memberId.value, payload);
    Object.assign(target, saved);
  } catch (error) {
    uni.showToast({ title: error.message || "档案保存失败", icon: "none" });
    return;
  }

  uni.showToast({ title: "档案已保存", icon: "success" });
  setTimeout(() => {
    uni.navigateBack();
  }, 600);
}

function goBack() {
  uni.navigateBack();
}

function goCare() {
  uni.navigateTo({ url: `/pages/care/index?id=${memberId.value}` });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.profile-card {
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.role,
.name,
.scope,
.basic text,
.label,
.value,
.note,
.visit-title,
.visit-desc {
  display: block;
}

.role {
  color: #2f8f72;
  font-size: 30rpx;
  font-weight: 800;
}

.name {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 52rpx;
  font-weight: 900;
}

.scope {
  margin-top: 10rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.basic {
  min-width: 176rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.6;
  text-align: right;
}

.form-card,
.visit-card {
  margin-bottom: 16rpx;
  padding: 24rpx;
}

.field {
  display: block;
  min-width: 0;
  margin-bottom: 20rpx;
}

.field:last-child {
  margin-bottom: 0;
}

.field-grid,
.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.field input,
.field textarea,
.picker-field {
  width: 100%;
  min-height: 82rpx;
  margin-top: 10rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  background: #fbfdfc;
  color: #18332d;
  font-size: 29rpx;
  font-weight: 800;
}

.field textarea {
  min-height: 126rpx;
  padding: 18rpx;
  line-height: 1.45;
}

.picker-field {
  display: flex;
  align-items: center;
}

.label {
  color: #4a5c55;
  font-size: 30rpx;
}

.value {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.45;
}

.note {
  margin-top: 8rpx;
  color: #9a6d1d;
  font-size: 30rpx;
  line-height: 1.4;
}

.stat-item {
  padding: 20rpx;
  border-radius: 8rpx;
  background: #f5faf7;
}

.baseline-title {
  margin-bottom: 16rpx;
}

.baseline-title.second {
  margin-top: 28rpx;
}

.baseline-title text:first-child {
  display: block;
  color: #18332d;
  font-size: 31rpx;
  font-weight: 900;
}

.baseline-title text:last-child {
  display: block;
  margin-top: 6rpx;
  color: #4a5c55;
  font-size: 30rpx;
}

.visit-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.visit-title {
  color: #18332d;
  font-size: 31rpx;
  font-weight: 900;
}

.visit-desc {
  margin-top: 8rpx;
  color: #4a5c55;
  font-size: 30rpx;
  line-height: 1.45;
}

.save-row {
  display: grid;
  grid-template-columns: 0.7fr 1.3fr;
  gap: 16rpx;
  margin-top: 24rpx;
}

.tags-display {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 6rpx;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  background: #fff1cf;
  color: #8a641c;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
}

.tag-remove {
  font-size: 32rpx;
  font-weight: 900;
  color: #b98926;
  margin-left: 2rpx;
}

.tag-empty {
  color: #4a5c55;
  font-size: 30rpx;
}

.tag-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 12rpx;
}

.tag-preset-btn {
  padding: 10rpx 20rpx;
  border-radius: 999rpx;
  background: #e7f0eb;
  color: #2b5d50;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.2;
}

.tag-custom-row {
  display: flex;
  gap: 12rpx;
  margin-top: 16rpx;
}

.tag-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  background: #fbfdfc;
  font-size: 30rpx;
}

.tag-add-btn {
  flex: 0 0 auto;
  padding: 0 28rpx;
  height: 72rpx;
  border-radius: 8rpx;
  background: #2f8f72;
  color: #ffffff;
  font-size: 30rpx;
  font-weight: 800;
  line-height: 1.2;
}
</style>
