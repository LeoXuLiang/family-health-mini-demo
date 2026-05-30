export const metricTypes = [
  { key: "bloodPressure", label: "血压", unit: "mmHg", accent: "green", defaultValue: "128" },
  { key: "bloodGlucose", label: "血糖", unit: "mmol/L", accent: "blue", defaultValue: "6.2" },
  { key: "weight", label: "体重", unit: "kg", accent: "coral", defaultValue: "74.6" },
  { key: "heartRate", label: "心率", unit: "次/分", accent: "gold", defaultValue: "72" },
  { key: "sleep", label: "睡眠", unit: "", accent: "mint", defaultValue: "睡得好" }
];

export const sleepOptions = [
  { key: "good", label: "睡得好", detail: "整晚较安稳" },
  { key: "deep", label: "深度睡眠多", detail: "醒来精神较好" },
  { key: "wake", label: "中间醒了", detail: "夜里醒来一次或多次" },
  { key: "light", label: "睡得浅", detail: "容易被声音吵醒" },
  { key: "hard", label: "入睡困难", detail: "超过 30 分钟入睡" },
  { key: "early", label: "早醒", detail: "醒得早且难再睡" }
];

export const members = [
  {
    id: "me",
    name: "丈夫",
    shortName: "丈夫",
    role: "家庭管理员",
    isAdmin: true,
    group: "self",
    spouseId: "wife",
    careTargets: [],
    defaultCaregivers: [],
    age: 39,
    gender: "男",
    birthDate: "1987-01-01",
    heightCm: 176,
    weightKg: 74.6,
    bloodType: "A",
    baselineBloodPressure: { systolic: 120, diastolic: 80 },
    baselineBloodGlucose: { fasting: 5.6, postprandial: 7.8 },
    chronicConditions: [],
    drugAllergies: [],
    foodAllergies: [],
    emergencyContact: { name: "妻子", relation: "配偶", phone: "待补充" },
    lastCheckDate: "",
    bmiTarget: "22.0-24.0",
    tags: ["体重管理", "久坐"],
    visibleScope: "可查看全家",
    allergyNote: "无已知过敏",
    medicationNote: "无长期用药",
    doctorNote: "年度体检关注体重和血脂"
  },
  {
    id: "wife",
    name: "妻子",
    shortName: "妻子",
    role: "家庭管理员",
    isAdmin: true,
    group: "self",
    spouseId: "me",
    careTargets: [],
    defaultCaregivers: [],
    age: 37,
    gender: "女",
    birthDate: "1989-01-01",
    heightCm: 164,
    weightKg: 56.2,
    bloodType: "B",
    baselineBloodPressure: { systolic: 115, diastolic: 75 },
    baselineBloodGlucose: { fasting: 5.3, postprandial: 7.2 },
    chronicConditions: [],
    drugAllergies: ["青霉素过敏史待确认"],
    foodAllergies: [],
    emergencyContact: { name: "丈夫", relation: "配偶", phone: "待补充" },
    lastCheckDate: "",
    bmiTarget: "20.0-23.0",
    tags: ["睡眠关注"],
    visibleScope: "可查看全家",
    allergyNote: "青霉素过敏史待确认",
    medicationNote: "无长期用药",
    doctorNote: "关注睡眠和运动恢复"
  },
  {
    id: "dad",
    name: "公公",
    shortName: "公公",
    role: "长辈成员",
    isAdmin: false,
    group: "parentsA",
    spouseId: "mom",
    careTargets: [],
    defaultCaregivers: ["mom"],
    age: 68,
    gender: "男",
    birthDate: "1958-01-01",
    heightCm: 170,
    weightKg: 68.0,
    bloodType: "O",
    baselineBloodPressure: { systolic: 130, diastolic: 80 },
    baselineBloodGlucose: { fasting: 5.8, postprandial: 7.8 },
    chronicConditions: ["高血压"],
    drugAllergies: [],
    foodAllergies: [],
    emergencyContact: { name: "婆婆", relation: "配偶", phone: "待补充" },
    lastCheckDate: "",
    bmiTarget: "22.0-25.0",
    tags: ["血压关注", "低盐"],
    visibleScope: "可看本人和婆婆，仅可操作本人",
    allergyNote: "无已知过敏",
    medicationNote: "按医生建议记录降压药服用情况",
    doctorNote: "复诊时带 30 天血压记录"
  },
  {
    id: "mom",
    name: "婆婆",
    shortName: "婆婆",
    role: "长辈照护者",
    isAdmin: false,
    group: "parentsA",
    spouseId: "dad",
    careTargets: ["dad"],
    defaultCaregivers: [],
    age: 66,
    gender: "女",
    birthDate: "1960-01-01",
    heightCm: 158,
    weightKg: 58.0,
    bloodType: "A",
    baselineBloodPressure: { systolic: 120, diastolic: 78 },
    baselineBloodGlucose: { fasting: 5.6, postprandial: 7.8 },
    chronicConditions: [],
    drugAllergies: [],
    foodAllergies: ["海鲜"],
    emergencyContact: { name: "公公", relation: "配偶", phone: "待补充" },
    lastCheckDate: "",
    bmiTarget: "21.0-24.0",
    tags: ["睡眠关注", "补钙"],
    visibleScope: "可看本人和公公，可操作本人和公公",
    allergyNote: "海鲜过敏",
    medicationNote: "钙片按医嘱记录",
    doctorNote: "关注睡眠、骨密度和运动"
  },
  {
    id: "fatherInLaw",
    name: "岳父",
    shortName: "岳父",
    role: "长辈成员",
    isAdmin: false,
    group: "parentsB",
    spouseId: "motherInLaw",
    careTargets: [],
    defaultCaregivers: ["motherInLaw"],
    age: 70,
    gender: "男",
    birthDate: "1956-01-01",
    heightCm: 168,
    weightKg: 66.0,
    bloodType: "AB",
    baselineBloodPressure: { systolic: 125, diastolic: 78 },
    baselineBloodGlucose: { fasting: 6.1, postprandial: 8.5 },
    chronicConditions: ["糖代谢异常"],
    drugAllergies: [],
    foodAllergies: [],
    emergencyContact: { name: "岳母", relation: "配偶", phone: "待补充" },
    lastCheckDate: "",
    bmiTarget: "22.0-25.0",
    tags: ["血糖关注", "餐后记录"],
    visibleScope: "可看本人和岳母，仅可操作本人",
    allergyNote: "无已知过敏",
    medicationNote: "按医生建议记录控糖相关用药",
    doctorNote: "建议带空腹和餐后血糖记录复诊"
  },
  {
    id: "motherInLaw",
    name: "岳母",
    shortName: "岳母",
    role: "长辈照护者",
    isAdmin: false,
    group: "parentsB",
    spouseId: "fatherInLaw",
    careTargets: ["fatherInLaw"],
    defaultCaregivers: [],
    age: 67,
    gender: "女",
    birthDate: "1959-01-01",
    heightCm: 156,
    weightKg: 57.0,
    bloodType: "O",
    baselineBloodPressure: { systolic: 120, diastolic: 76 },
    baselineBloodGlucose: { fasting: 5.8, postprandial: 8.0 },
    chronicConditions: [],
    drugAllergies: [],
    foodAllergies: [],
    emergencyContact: { name: "岳父", relation: "配偶", phone: "待补充" },
    lastCheckDate: "",
    bmiTarget: "21.0-24.0",
    tags: ["血糖关注", "控糖饮食"],
    visibleScope: "可看本人和岳父，可操作本人和岳父",
    allergyNote: "无已知过敏",
    medicationNote: "按医嘱记录用药，不自行调整",
    doctorNote: "关注餐后血糖和饮食结构"
  }
];

export const viewerOptions = [
  { id: "me", name: "丈夫", description: "管理员，可查看和操作全家" },
  { id: "wife", name: "妻子", description: "管理员，可查看和操作全家" },
  { id: "dad", name: "公公", description: "可看本人与婆婆，仅可操作本人" },
  { id: "mom", name: "婆婆", description: "可操作本人与公公" },
  { id: "fatherInLaw", name: "岳父", description: "可看本人与岳母，仅可操作本人" },
  { id: "motherInLaw", name: "岳母", description: "可操作本人与岳父" }
];

export const todaySummaries = {
  me: {
    completion: 0,
    status: "待记录",
    primary: "今日暂无记录",
    secondary: "可先记录体重或睡眠",
    trend: [0, 0, 0, 0, 0, 0, 0]
  },
  wife: {
    completion: 0,
    status: "待记录",
    primary: "今日暂无记录",
    secondary: "建议先补一项基础指标",
    trend: [0, 0, 0, 0, 0, 0, 0]
  },
  dad: {
    completion: 0,
    status: "待记录",
    primary: "今日暂无记录",
    secondary: "建议先记录血压",
    trend: [0, 0, 0, 0, 0, 0, 0]
  },
  mom: {
    completion: 0,
    status: "待记录",
    primary: "今日暂无记录",
    secondary: "建议先记录睡眠",
    trend: [0, 0, 0, 0, 0, 0, 0]
  },
  fatherInLaw: {
    completion: 0,
    status: "待记录",
    primary: "今日暂无记录",
    secondary: "建议先记录血糖",
    trend: [0, 0, 0, 0, 0, 0, 0]
  },
  motherInLaw: {
    completion: 0,
    status: "待记录",
    primary: "今日暂无记录",
    secondary: "建议先记录餐后血糖",
    trend: [0, 0, 0, 0, 0, 0, 0]
  }
};

export const reminders = [];

export const reminderPlans = [];

export const recentRecords = [];

export const metricRanges = {
  bloodPressure: { label: "血压关注范围", value: "收缩压 90-139，舒张压 60-89", note: "仅用于家庭提醒，不作为诊断标准。" },
  bloodGlucose: { label: "血糖关注范围", value: "空腹和餐后分别记录", note: "范围请按医生建议设置。" },
  weight: { label: "体重目标", value: "每周观察变化", note: "避免用单日波动作判断。" }
};

export const mealAnalyses = [];

export const visitRecords = [];

export const medicationLogs = [];

export const dataChecklist = [
  { key: "profile", title: "成员档案", status: "已建立家庭基础档案" },
  { key: "metrics", title: "健康指标", status: "当前无预置记录" },
  { key: "meals", title: "餐食照片", status: "当前无预置照片" },
  { key: "visits", title: "就医用药", status: "当前无预置就医用药记录" },
  { key: "privacy", title: "隐私授权", status: "可撤回授权" }
];

export const quickActions = [
  { key: "bloodPressure", title: "记血压", subtitle: "早晚各一次", icon: "压", accent: "green" },
  { key: "bloodGlucose", title: "记血糖", subtitle: "餐前或餐后", icon: "糖", accent: "blue" },
  { key: "weight", title: "称体重", subtitle: "体重变化", icon: "重", accent: "coral" },
  { key: "sleep", title: "记睡眠", subtitle: "选择睡眠状态", icon: "眠", accent: "mint" },
  { key: "meal", title: "拍一餐", subtitle: "分析搭配", icon: "餐", accent: "gold" }
];

const memberIdSet = new Set(members.map((member) => member.id));

function dedupeValidMemberIds(ids) {
  return Array.from(new Set(ids.filter((id) => memberIdSet.has(id))));
}

function resolveViewableMemberIds(viewerId) {
  const viewer = members.find((member) => member.id === viewerId);
  if (!viewer) {
    return members.map((member) => member.id);
  }

  if (viewer.isAdmin) {
    return members.map((member) => member.id);
  }

  return dedupeValidMemberIds([viewer.id, viewer.spouseId]);
}

function resolveOperableMemberIds(viewerId) {
  const viewer = members.find((member) => member.id === viewerId);
  if (!viewer) {
    return members.map((member) => member.id);
  }

  if (viewer.isAdmin) {
    return members.map((member) => member.id);
  }

  return dedupeValidMemberIds([viewer.id, ...(viewer.careTargets || [])]);
}

export function getVisibleMembers(viewerId = "me") {
  const visibleIds = new Set(resolveViewableMemberIds(viewerId));
  return members.filter((member) => visibleIds.has(member.id));
}

export function getMember(memberId) {
  return members.find((member) => member.id === memberId) || members[0];
}

export function canViewMember(viewerId, memberId) {
  return resolveViewableMemberIds(viewerId).includes(memberId);
}

export function canOperateMember(viewerId, memberId) {
  return resolveOperableMemberIds(viewerId).includes(memberId);
}

export function normalizeRemindTo(remindTo, memberId) {
  const list = Array.isArray(remindTo) ? remindTo : remindTo ? [remindTo] : [memberId];
  return dedupeValidMemberIds(list.length ? list : [memberId]);
}

export function getDefaultRemindTo(memberId) {
  const member = getMember(memberId);
  return normalizeRemindTo([member.id, ...(member.defaultCaregivers || [])], member.id);
}

export function canReceiveReminder(viewerId, reminder) {
  const receivers = normalizeRemindTo(reminder.remindTo, reminder.memberId);
  return receivers.includes(viewerId) || canOperateMember(viewerId, reminder.memberId);
}
