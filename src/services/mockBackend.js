import {
  canOperateMember,
  canViewMember,
  getDefaultRemindTo,
  getMember,
  getVisibleMembers,
  members,
  mealAnalyses,
  medicationLogs,
  normalizeRemindTo,
  recentRecords,
  reminderPlans,
  visitRecords
} from "../data/demoData";

const medicationTaskState = new Map();
const createdMedicationReminders = [];
const createdCareRecords = [];

function allMedicationReminders() {
  return [
    ...reminderPlans.filter((record) => record.type === "medication"),
    ...createdMedicationReminders
  ];
}

function ensureCanView(viewerId, memberId) {
  if (!canViewMember(viewerId, memberId)) {
    throw new Error("当前身份无权查看该成员数据");
  }
}

function ensureCanOperate(viewerId, memberId) {
  if (!canOperateMember(viewerId, memberId)) {
    throw new Error("当前身份无权操作该成员数据");
  }
}

export async function loginWithWechat() {
  return {
    openId: "mock-openid",
    unionId: "mock-unionid",
    nickName: "家庭成员"
  };
}

export async function bindMember(memberId) {
  return {
    userId: `user-${memberId}`,
    member: getMember(memberId)
  };
}

export async function listVisibleMembers(viewerId) {
  return getVisibleMembers(viewerId);
}

export async function listMembers(viewerId) {
  return getVisibleMembers(viewerId);
}

export async function getMemberProfile(viewerId, memberId) {
  ensureCanView(viewerId, memberId);
  return getMember(memberId);
}

export async function updateMemberProfile(viewerId, memberId, payload) {
  ensureCanOperate(viewerId, memberId);
  const target = members.find((member) => member.id === memberId);
  if (!target) {
    throw new Error("未找到成员档案");
  }

  Object.assign(target, {
    ...payload,
    id: memberId,
    updatedBy: viewerId,
    updatedAt: new Date().toISOString()
  });

  return target;
}

export async function listMetricRecords(viewerId) {
  const visibleIds = new Set(getVisibleMembers(viewerId).map((member) => member.id));
  return recentRecords.filter((record) => visibleIds.has(record.memberId));
}

export async function saveMetricRecord(viewerId, record) {
  ensureCanOperate(viewerId, record.memberId);
  const saved = {
    ...record,
    id: `saved-${Date.now()}`,
    createdBy: viewerId,
    createdAt: new Date().toISOString()
  };
  recentRecords.unshift(saved);
  return saved;
}

export async function analyzeMealImage(viewerId, memberId) {
  ensureCanView(viewerId, memberId);
  return (
    mealAnalyses.find((meal) => meal.memberId === memberId) || {
      id: `meal-${Date.now()}`,
      memberId,
      mealType: "本餐",
      score: 0,
      title: "待完善菜品信息",
      macros: [
        { label: "碳水", value: "待识别", accent: "blue" },
        { label: "蛋白", value: "待识别", accent: "green" },
        { label: "蔬菜", value: "待识别", accent: "gold" }
      ],
      advice: "已收到餐食照片。建议补全菜品和份量后再查看营养分析。"
    }
  );
}

export async function listCareRecords(viewerId, memberId) {
  ensureCanView(viewerId, memberId);
  const visits = [
    ...createdCareRecords,
    ...visitRecords
  ].filter((record) => record.memberId === memberId);

  return {
    visits,
    medications: medicationLogs.filter((record) => record.memberId === memberId),
    reminders: reminderPlans.filter((record) => record.memberId === memberId)
  };
}

export async function createCareRecord(viewerId, payload) {
  ensureCanOperate(viewerId, payload.memberId);
  const record = {
    id: `care-${Date.now()}`,
    createdBy: viewerId,
    createdAt: new Date().toISOString(),
    ...payload
  };
  createdCareRecords.unshift(record);
  return record;
}

export async function listMedicationTasks(viewerId, memberId = "") {
  const visibleIds = new Set(getVisibleMembers(viewerId).map((member) => member.id));
  const memberIds = memberId ? [memberId] : Array.from(visibleIds);

  memberIds.forEach((id) => ensureCanView(viewerId, id));

  return allMedicationReminders()
    .filter((record) => record.enabled && visibleIds.has(record.memberId))
    .filter((record) => !memberId || record.memberId === memberId)
    .filter((record) => {
      const receivers = normalizeRemindTo(record.remindTo, record.memberId);
      return receivers.includes(viewerId) || canOperateMember(viewerId, record.memberId);
    })
    .map((record) => {
      const override = medicationTaskState.get(record.id) || {};
      return {
        ...record,
        remindTo: normalizeRemindTo(record.remindTo, record.memberId),
        ...override
      };
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function confirmMedication(viewerId, medicationId) {
  const task = allMedicationReminders().find((record) => record.id === medicationId);
  if (!task) {
    throw new Error("未找到用药提醒");
  }

  ensureCanOperate(viewerId, task.memberId);

  const confirmedAt = "刚刚";
  medicationTaskState.set(medicationId, {
    todayStatus: "confirmed",
    confirmedAt
  });

  return {
    ...task,
    todayStatus: "confirmed",
    confirmedAt
  };
}

export async function createMedicationReminder(viewerId, payload) {
  ensureCanOperate(viewerId, payload.memberId);
  const remindTo =
    payload.remindTo === undefined
      ? getDefaultRemindTo(payload.memberId)
      : normalizeRemindTo(payload.remindTo, payload.memberId);

  const reminder = {
    id: `medication-${Date.now()}`,
    ...payload,
    remindTo,
    type: "medication",
    enabled: true,
    todayStatus: payload.todayStatus || "pending",
    confirmedAt: ""
  };

  createdMedicationReminders.unshift(reminder);
  return reminder;
}

export async function requestDataDeletion(viewerId, memberId, scope) {
  ensureCanOperate(viewerId, memberId);
  return {
    requestId: `delete-${Date.now()}`,
    memberId,
    scope,
    status: "已提交模拟删除申请"
  };
}
