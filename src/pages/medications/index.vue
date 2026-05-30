<template>
  <view class="page">
    <PageHeader title="用药" action-text="加" @action="addMedication" />
    <MemberSelector v-model="selectedMemberId" :visible-members="visibleMembers" />

    <view class="content">
      <view class="summary-card card">
        <view>
          <text class="label">今日用药</text>
          <text class="title">{{ selectedMember.name }}有 {{ memberTasks.length }} 项用药提醒</text>
          <text class="desc">只做按医嘱服药提醒和确认记录，不提供剂量调整建议。</text>
        </view>
        <view class="summary-count">
          <text>{{ pendingCount }}</text>
          <text>未确认</text>
        </view>
      </view>

      <view class="section-title">
        <text class="section-title-text">今日用药清单</text>
        <button class="link-button" @click="addMedication">新增</button>
      </view>

      <view v-if="memberTasks.length > 0" class="checklist-card card">
        <view v-for="task in memberTasks" :key="`summary-${task.id}`" class="checklist-row">
          <text class="check-time">{{ task.time }}</text>
          <view class="check-main">
            <text class="check-medicine">{{ task.medicine }}</text>
            <text class="check-dosage">{{ task.dosage }}</text>
          </view>
          <text class="check-status" :class="task.todayStatus">{{ statusText(task) }}</text>
        </view>
      </view>

      <view v-if="showAddForm" class="form-card card">
        <text class="form-title">手动添加药物提醒</text>

        <view class="form-field">
          <text class="field-label">提醒谁</text>
          <picker :range="memberNames" :value="formMemberIndex" @change="changeFormMember">
            <view class="picker-field">
              <text>{{ formMember.name }}</text>
              <text>切换</text>
            </view>
          </picker>
        </view>

        <label class="form-field">
          <text class="field-label">药品名称</text>
          <input v-model="form.medicine" placeholder="例如：降压药" />
        </label>

        <label class="form-field">
          <text class="field-label">剂量/服法说明</text>
          <input v-model="form.dosage" placeholder="按医生医嘱填写" />
        </label>

        <view class="form-grid">
          <view class="form-field">
            <text class="field-label">服药时间</text>
            <picker mode="time" :value="form.time" @change="form.time = $event.detail.value">
              <view class="picker-field">
                <text>{{ form.time }}</text>
              </view>
            </picker>
          </view>

          <view class="form-field">
            <text class="field-label">重复规则</text>
            <picker :range="repeatOptions" :value="repeatIndex" @change="changeRepeat">
              <view class="picker-field">
                <text>{{ form.repeat }}</text>
              </view>
            </picker>
          </view>
        </view>

        <label class="form-field">
          <text class="field-label">医嘱备注</text>
          <textarea v-model="form.doctorNote" placeholder="例如：早餐后按医生医嘱服用" />
        </label>

        <view class="form-actions">
          <button class="secondary-button" @click="cancelAdd">取消</button>
          <button class="primary-button" @click="saveMedication">保存提醒</button>
        </view>
      </view>

      <view v-if="memberTasks.length === 0" class="empty-card card">
        <text>今天暂无用药提醒。</text>
        <text>可由本人、照护人或管理员手动添加药物提醒。</text>
      </view>

      <view class="section-title" v-if="memberTasks.length > 0">
        <text class="section-title-text">逐项确认</text>
      </view>

      <view v-for="task in memberTasks" :key="task.id" class="medication-card card">
        <view class="medication-head">
          <view>
            <text class="time">{{ task.time }}</text>
            <text class="medicine">{{ task.medicine }}</text>
          </view>
          <text class="status-chip" :class="task.todayStatus">
            {{ statusText(task) }}
          </text>
        </view>

        <view class="detail-box">
          <text>{{ task.dosage }}</text>
          <text>{{ task.repeat }}提醒 {{ receiverNames(task.remindTo) }}</text>
          <text>{{ task.doctorNote }}</text>
        </view>

        <button
          class="confirm-button"
          :class="{ done: task.todayStatus === 'confirmed', disabled: task.todayStatus === 'not_due' }"
          :disabled="task.todayStatus !== 'pending'"
          @click="confirmTask(task)"
        >
          {{ actionText(task) }}
        </button>
      </view>

      <view class="section-title">
        <text class="section-title-text">全部可见用药</text>
      </view>

      <view v-for="task in allTasks" :key="`all-${task.id}`" class="compact-row card">
        <view>
          <text class="compact-title">{{ getMember(task.memberId).name }} {{ task.medicine }}</text>
          <text class="compact-desc">{{ task.time }} · {{ statusText(task) }}</text>
        </view>
        <text class="mini-chip">{{ task.repeat }}</text>
      </view>
    </view>

    <MedicalNote />
    <OnboardingPanel />
  </view>
</template>

<script setup>
import { computed, ref } from "vue";
import { onShow } from "@dcloudio/uni-app";
import PageHeader from "../../components/PageHeader.vue";
import MemberSelector from "../../components/MemberSelector.vue";
import MedicalNote from "../../components/MedicalNote.vue";
import OnboardingPanel from "../../components/OnboardingPanel.vue";
import { getMember } from "../../data/demoData";
import { appState, visibleMembers } from "../../state/appState";
import { confirmMedication, createMedicationReminder, listMedicationTasks } from "../../services/mockBackend";

const selectedMemberId = ref(appState.viewerId || "me");
const allTasks = ref([]);
const simulatedReminderShown = ref(false);
const showAddForm = ref(false);
const repeatOptions = ["每天", "工作日", "每周", "仅一次"];
const repeatIndex = ref(0);
const formMemberIndex = ref(0);
const form = ref({
  memberId: selectedMemberId.value,
  medicine: "",
  dosage: "按医生医嘱填写",
  time: "08:00",
  repeat: "每天",
  doctorNote: "按医生医嘱服用，如需调整请咨询医生或药师。"
});

const selectedMember = computed(() => getMember(selectedMemberId.value));
const memberNames = computed(() => visibleMembers.value.map((member) => member.name));
const formMember = computed(() => visibleMembers.value[formMemberIndex.value] || visibleMembers.value[0] || selectedMember.value);
const memberTasks = computed(() => allTasks.value.filter((task) => task.memberId === selectedMemberId.value));
const pendingCount = computed(() => memberTasks.value.filter((task) => task.todayStatus === "pending").length);

onShow(loadTasks);

async function loadTasks() {
  allTasks.value = await listMedicationTasks(appState.viewerId);

  const selectedHasTask = allTasks.value.some((task) => task.memberId === selectedMemberId.value);
  if (!selectedHasTask && allTasks.value.length > 0) {
    selectedMemberId.value = allTasks.value[0].memberId;
  }

  const pendingTasks = allTasks.value.filter((task) => task.todayStatus === "pending");
  if (pendingTasks.length > 0 && !simulatedReminderShown.value) {
    simulatedReminderShown.value = true;
    uni.showToast({ title: `${pendingTasks.length}项用药待确认`, icon: "none" });
  }
}

function statusText(task) {
  if (task.todayStatus === "confirmed") {
    return task.confirmedAt ? `已确认 ${task.confirmedAt}` : "已确认";
  }

  if (task.todayStatus === "not_due") {
    return "未到时间";
  }

  return "未确认";
}

function actionText(task) {
  if (task.todayStatus === "confirmed") {
    return "已确认";
  }

  if (task.todayStatus === "not_due") {
    return "未到时间";
  }

  return "确认已服药";
}

function receiverNames(remindTo) {
  return remindTo.map((id) => getMember(id).name).join("、");
}

async function confirmTask(task) {
  const updated = await confirmMedication(appState.viewerId, task.id);
  allTasks.value = allTasks.value.map((item) => (item.id === task.id ? { ...item, ...updated } : item));
  uni.showToast({ title: "已确认", icon: "success" });
}

async function addMedication() {
  const index = visibleMembers.value.findIndex((member) => member.id === selectedMemberId.value);
  formMemberIndex.value = index >= 0 ? index : 0;
  form.value.memberId = selectedMemberId.value;
  showAddForm.value = true;
}

function changeFormMember(event) {
  formMemberIndex.value = Number(event.detail.value);
  form.value.memberId = formMember.value.id;
}

function changeRepeat(event) {
  repeatIndex.value = Number(event.detail.value);
  form.value.repeat = repeatOptions[repeatIndex.value];
}

function cancelAdd() {
  showAddForm.value = false;
}

async function saveMedication() {
  const medicine = form.value.medicine.trim();
  if (!medicine) {
    uni.showToast({ title: "请填写药品名称", icon: "none" });
    return;
  }

  const saved = await createMedicationReminder(appState.viewerId, {
    memberId: form.value.memberId,
    title: `${medicine}提醒`,
    medicine,
    dosage: form.value.dosage || "按医生医嘱填写",
    time: form.value.time,
    repeat: form.value.repeat,
    doctorNote: form.value.doctorNote || "按医生医嘱服用，如需调整请咨询医生或药师。",
    todayStatus: "pending"
  });

  selectedMemberId.value = saved.memberId;
  showAddForm.value = false;
  form.value = {
    memberId: saved.memberId,
    medicine: "",
    dosage: "按医生医嘱填写",
    time: "08:00",
    repeat: "每天",
    doctorNote: "按医生医嘱服用，如需调整请咨询医生或药师。"
  };
  repeatIndex.value = 0;
  await loadTasks();
  uni.showToast({ title: "已添加提醒", icon: "success" });
}
</script>

<style lang="scss" scoped>
@use "../../styles/shared.scss" as *;

.summary-card {
  padding: 28rpx;
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.label,
.title,
.desc,
.time,
.medicine,
.detail-box text,
.compact-title,
.compact-desc,
.empty-card text {
  display: block;
}

.label {
  color: #2f8f72;
  font-size: 26rpx;
  font-weight: 800;
}

.title {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 36rpx;
  font-weight: 900;
  line-height: 1.3;
}

.desc {
  margin-top: 10rpx;
  color: #66756f;
  font-size: 26rpx;
  line-height: 1.45;
}

.summary-count {
  min-width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fff1cf;
  color: #9a6d1d;
  font-weight: 900;
}

.summary-count text:first-child {
  font-size: 42rpx;
}

.summary-count text:last-child {
  font-size: 22rpx;
}

.empty-card {
  padding: 28rpx;
  color: #66756f;
  font-size: 28rpx;
  line-height: 1.5;
}

.checklist-card {
  padding: 10rpx 22rpx;
}

.checklist-row {
  min-height: 104rpx;
  display: flex;
  align-items: center;
  gap: 18rpx;
  border-bottom: 1rpx solid #dce8e2;
}

.checklist-row:last-child {
  border-bottom: 0;
}

.check-time {
  width: 92rpx;
  flex: 0 0 92rpx;
  color: #2f8f72;
  font-size: 31rpx;
  font-weight: 900;
}

.check-main {
  flex: 1;
  min-width: 0;
}

.check-medicine,
.check-dosage {
  display: block;
}

.check-medicine {
  color: #18332d;
  font-size: 30rpx;
  font-weight: 900;
}

.check-dosage {
  margin-top: 6rpx;
  color: #66756f;
  font-size: 24rpx;
}

.check-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 108rpx;
  padding: 8rpx 12rpx;
  border-radius: 999rpx;
  background: #fff1cf;
  color: #9a6d1d;
  font-size: 23rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.check-status.confirmed {
  background: #dff2ea;
  color: #2f8f72;
}

.check-status.not_due {
  background: #e7f0eb;
  color: #66756f;
}

.form-card {
  margin-bottom: 20rpx;
  padding: 26rpx;
}

.form-title {
  display: block;
  color: #18332d;
  font-size: 34rpx;
  font-weight: 900;
}

.form-field {
  display: block;
  margin-top: 20rpx;
}

.field-label {
  display: block;
  margin-bottom: 10rpx;
  color: #66756f;
  font-size: 25rpx;
}

.form-field input,
.form-field textarea,
.picker-field {
  width: 100%;
  min-height: 82rpx;
  padding: 0 18rpx;
  border: 1rpx solid #dce8e2;
  border-radius: 8rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fbfdfc;
  color: #18332d;
  font-size: 28rpx;
}

.form-field textarea {
  min-height: 120rpx;
  padding: 18rpx;
  line-height: 1.45;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16rpx;
}

.form-actions {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 14rpx;
  margin-top: 22rpx;
}

.medication-card {
  margin-bottom: 18rpx;
  padding: 26rpx;
}

.medication-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.time {
  color: #2f8f72;
  font-size: 32rpx;
  font-weight: 900;
}

.medicine {
  margin-top: 8rpx;
  color: #18332d;
  font-size: 38rpx;
  font-weight: 900;
}

.status-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 116rpx;
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #fff1cf;
  color: #9a6d1d;
  font-size: 24rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.status-chip.confirmed {
  background: #dff2ea;
  color: #2f8f72;
}

.status-chip.not_due {
  background: #e7f0eb;
  color: #66756f;
}

.detail-box {
  margin: 22rpx 0;
  padding: 22rpx;
  border-radius: 8rpx;
  background: #f5faf7;
  color: #66756f;
  font-size: 26rpx;
  line-height: 1.5;
}

.detail-box text + text {
  margin-top: 8rpx;
}

.confirm-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 88rpx;
  border-radius: 8rpx;
  background: #2f8f72;
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 900;
  line-height: 1.2;
  text-align: center;
}

.confirm-button.done {
  background: #dff2ea;
  color: #2f8f72;
}

.confirm-button.disabled {
  background: #e7f0eb;
  color: #66756f;
}

.compact-row {
  min-height: 106rpx;
  margin-bottom: 14rpx;
  padding: 22rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14rpx;
}

.compact-title {
  color: #18332d;
  font-size: 29rpx;
  font-weight: 900;
}

.compact-desc {
  margin-top: 8rpx;
  color: #66756f;
  font-size: 25rpx;
}

.mini-chip {
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #dff2ea;
  color: #2f8f72;
  font-size: 23rpx;
  font-weight: 900;
}
</style>
