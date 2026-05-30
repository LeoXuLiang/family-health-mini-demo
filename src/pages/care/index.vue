<template>
  <view class="page">
    <PageHeader title="就医记录" action-text="加" @action="showForm = true" />

    <view class="content">
      <view class="summary-card card">
        <text class="label">{{ member.name }}</text>
        <text class="title">就医、诊断、检查和复诊记录</text>
        <text class="desc">用于家庭归档和复诊准备，不替代医生诊断。涉及用药调整请咨询医生或药师。</text>
      </view>

      <view v-if="showForm" class="form-card card">
        <text class="form-title">新增就医记录</text>

        <view class="section-subtitle">基本就医信息</view>
        <view class="field-grid">
          <view class="field">
            <text class="field-label">就医日期</text>
            <picker mode="date" :value="form.visitDate" @change="form.visitDate = $event.detail.value">
              <view class="picker-field">{{ form.visitDate }}</view>
            </picker>
          </view>
          <label class="field">
            <text class="field-label">就医医院</text>
            <input v-model="form.hospital" placeholder="请输入医院名称" />
          </label>
        </view>

        <view class="field-grid">
          <label class="field">
            <text class="field-label">就医科室</text>
            <input v-model="form.department" placeholder="例如：心内科" />
          </label>
          <view class="field">
            <text class="field-label">就医类型</text>
            <picker :range="visitTypes" :value="visitTypeIndex" @change="changeVisitType">
              <view class="picker-field">{{ form.visitType }}</view>
            </picker>
          </view>
        </view>

        <view class="section-subtitle">诊断结果</view>
        <label class="field">
          <text class="field-label">诊断病名</text>
          <input v-model="form.diagnosisName" placeholder="医生诊断名称" />
        </label>
        <label class="field">
          <text class="field-label">医生建议</text>
          <textarea v-model="form.doctorAdvice" placeholder="记录医生建议、注意事项和复诊准备" />
        </label>

        <view class="section-subtitle">开药记录</view>
        <label class="field">
          <text class="field-label">药品名称</text>
          <input v-model="form.medicineName" placeholder="按处方或药盒填写" />
        </label>
        <view class="field-grid">
          <label class="field">
            <text class="field-label">服药剂量</text>
            <input v-model="form.medicineDosage" placeholder="例如：每次 1 片" />
          </label>
          <label class="field">
            <text class="field-label">服药频率</text>
            <input v-model="form.medicineFrequency" placeholder="例如：每日 2 次" />
          </label>
        </view>

        <view class="section-subtitle">检查记录</view>
        <label class="field">
          <text class="field-label">检查项目</text>
          <input v-model="form.examItem" placeholder="例如：血常规、心电图" />
        </label>
        <button class="secondary-button report-button" @click="chooseReportImage">
          {{ form.reportImage ? "更换报告单图片" : "上传报告单图片" }}
        </button>
        <image v-if="form.reportImage" class="report-image" :src="form.reportImage" mode="aspectFill" />

        <view class="section-subtitle">复诊提醒</view>
        <view class="field-grid">
          <view class="field">
            <text class="field-label">复诊日期</text>
            <picker mode="date" :value="form.followUpDate" @change="form.followUpDate = $event.detail.value">
              <view class="picker-field">{{ form.followUpDate || "待确定" }}</view>
            </picker>
          </view>
          <label class="field">
            <text class="field-label">费用</text>
            <input v-model="form.cost" type="digit" placeholder="例如：268" />
          </label>
        </view>
        <label class="field">
          <text class="field-label">复诊备注</text>
          <textarea v-model="form.followUpNote" placeholder="例如：带血压记录、空腹抽血" />
        </label>

        <view class="section-subtitle">补充信息</view>
        <label class="field">
          <text class="field-label">备注</text>
          <textarea v-model="form.remark" placeholder="记录检查前后注意事项、家属观察等" />
        </label>

        <view class="form-actions">
          <button class="secondary-button" @click="cancelForm">取消</button>
          <button class="primary-button" @click="saveCareRecord">保存记录</button>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">历史就医记录</text>
        <button class="link-button" @click="showForm = true">新增</button>
      </view>

      <view v-if="records.visits.length > 0" class="record-list">
        <view v-for="visit in records.visits" :key="visit.id" class="record-card card">
          <view class="record-head">
            <view>
              <text class="record-title">{{ visit.visitDate }} {{ visit.department || "未填写科室" }}</text>
              <text class="record-desc">{{ visit.hospital || "未填写医院" }} · {{ visit.visitType }}</text>
            </view>
            <text class="type-chip">{{ visit.visitType }}</text>
          </view>

          <view class="detail-box">
            <text class="detail-title">诊断结果</text>
            <text class="detail-line">诊断病名：{{ visit.diagnosisName || "待补充" }}</text>
            <text class="detail-line">医生建议：{{ visit.doctorAdvice || "待补充" }}</text>
          </view>

          <view class="detail-box">
            <text class="detail-title">开药记录</text>
            <text class="detail-line">药品名称：{{ visit.medicineName || "未开药或待补充" }}</text>
            <text class="detail-line">服药剂量：{{ visit.medicineDosage || "待补充" }}</text>
            <text class="detail-line">服药频率：{{ visit.medicineFrequency || "待补充" }}</text>
          </view>

          <view class="detail-box">
            <text class="detail-title">检查记录</text>
            <text class="detail-line">检查项目：{{ visit.examItem || "待补充" }}</text>
            <image v-if="visit.reportImage" class="record-report" :src="visit.reportImage" mode="aspectFill" />
          </view>

          <view class="detail-box">
            <text class="detail-title">复诊提醒</text>
            <text class="detail-line">复诊日期：{{ visit.followUpDate || "待确定" }}</text>
            <text class="detail-line">复诊备注：{{ visit.followUpNote || "待补充" }}</text>
          </view>

          <view class="detail-box">
            <text class="detail-title">补充信息</text>
            <text class="detail-line">备注：{{ visit.remark || "无" }}</text>
            <text class="detail-line">费用：{{ visit.cost ? `${visit.cost} 元` : "待补充" }}</text>
          </view>
        </view>
      </view>

      <view v-else class="empty-card card">
        <text class="record-title">暂无就医记录</text>
        <text class="record-desc">点击“新增”记录就医、诊断、开药、检查和复诊信息。</text>
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
import { getMember } from "../../data/demoData";
import { appState } from "../../state/appState";
import { createCareRecord, listCareRecords } from "../../services/mockBackend";

const visitTypes = ["门诊", "复诊", "急诊", "住院", "体检"];
const memberId = ref("dad");
const records = reactive({ visits: [], medications: [], reminders: [] });
const showForm = ref(false);
const form = reactive(createEmptyForm());

const member = computed(() => getMember(memberId.value));
const visitTypeIndex = computed(() => Math.max(visitTypes.indexOf(form.visitType), 0));

onLoad(async (query) => {
  memberId.value = query.id || "dad";
  await loadRecords();
});

function createEmptyForm() {
  return {
    visitDate: new Date().toISOString().slice(0, 10),
    hospital: "",
    department: "",
    visitType: "门诊",
    diagnosisName: "",
    doctorAdvice: "",
    medicineName: "",
    medicineDosage: "",
    medicineFrequency: "",
    examItem: "",
    reportImage: "",
    followUpDate: "",
    followUpNote: "",
    remark: "",
    cost: ""
  };
}

async function loadRecords() {
  const result = await listCareRecords(appState.viewerId, memberId.value);
  records.visits = result.visits;
  records.medications = result.medications;
  records.reminders = result.reminders;
}

function changeVisitType(event) {
  form.visitType = visitTypes[Number(event.detail.value)] || "门诊";
}

function chooseReportImage() {
  uni.chooseImage({
    count: 1,
    sizeType: ["compressed"],
    sourceType: ["album", "camera"],
    success(result) {
      form.reportImage = result.tempFilePaths[0];
    }
  });
}

function cancelForm() {
  Object.assign(form, createEmptyForm());
  showForm.value = false;
}

async function saveCareRecord() {
  if (!form.visitDate || !form.hospital) {
    uni.showToast({ title: "请填写日期和医院", icon: "none" });
    return;
  }

  await createCareRecord(appState.viewerId, {
    memberId: memberId.value,
    ...form
  });

  Object.assign(form, createEmptyForm());
  showForm.value = false;
  await loadRecords();
  uni.showToast({ title: "已保存就医记录", icon: "success" });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.summary-card,
.form-card,
.record-card,
.empty-card {
  padding: 26rpx;
  margin-bottom: 16rpx;
}

.label,
.title,
.desc,
.form-title,
.section-subtitle,
.field-label,
.record-title,
.record-desc,
.detail-title,
.detail-line {
  display: block;
}

.label {
  color: #2f8f72;
  font-size: 26rpx;
  font-weight: 800;
}

.title,
.form-title {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1.28;
}

.desc,
.record-desc {
  margin-top: 8rpx;
  color: #66756f;
  font-size: 26rpx;
  line-height: 1.45;
}

.section-subtitle {
  margin: 30rpx 0 16rpx;
  color: #18332d;
  font-size: 32rpx;
  font-weight: 900;
}

.section-subtitle:first-of-type {
  margin-top: 22rpx;
}

.field {
  display: block;
  min-width: 0;
  margin-bottom: 18rpx;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18rpx;
}

.field-label {
  color: #66756f;
  font-size: 25rpx;
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

.report-button {
  margin-bottom: 16rpx;
}

.report-image,
.record-report {
  width: 100%;
  height: 260rpx;
  border-radius: 8rpx;
  background: #dce8e2;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 14rpx;
  margin-top: 26rpx;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.record-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18rpx;
}

.record-title {
  color: #18332d;
  font-size: 31rpx;
  font-weight: 900;
  line-height: 1.35;
}

.type-chip {
  min-width: 86rpx;
  min-height: 52rpx;
  padding: 0 16rpx;
  border-radius: 999rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 24rpx;
  font-weight: 900;
}

.detail-box {
  margin-top: 18rpx;
  padding: 20rpx;
  border-radius: 8rpx;
  background: #f5faf7;
}

.detail-title {
  color: #18332d;
  font-size: 28rpx;
  font-weight: 900;
}

.detail-line {
  margin-top: 8rpx;
  color: #66756f;
  font-size: 26rpx;
  line-height: 1.45;
}

.record-report {
  margin-top: 12rpx;
}
</style>
