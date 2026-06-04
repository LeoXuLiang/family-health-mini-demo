const cloud = require("wx-server-sdk");

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const db = cloud.database();

const defaultMembers = [
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
    weightKg: 68,
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
    weightKg: 58,
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
    weightKg: 66,
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
    weightKg: 57,
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

exports.main = async () => {
  const results = {};

  const collections = ["members", "health_records", "medications", "care_records", "meals"];

  for (const name of collections) {
    try {
      const result = await db.collection(name).count();
      results[name] = { status: "exists", count: result.total };
    } catch {
      try {
        await db.createCollection(name);
        results[name] = { status: "created", count: 0 };
      } catch (err) {
        results[name] = { status: "error", message: err.message };
      }
    }
  }

  try {
    const memberCount = await db.collection("members").count();
    if (memberCount.total === 0) {
      const now = new Date().toISOString();
      for (const member of defaultMembers) {
        const { id, ...rest } = member;
        await db.collection("members").add({
          data: {
            ...rest,
            memberId: id,
            createdAt: now,
            updatedAt: now
          }
        });
      }
      results.membersSeed = { status: "seeded", count: defaultMembers.length };
    } else {
      results.membersSeed = { status: "skipped", count: memberCount.total };
    }
  } catch (err) {
    results.membersSeed = { status: "error", message: err.message };
  }

  return results;
};
