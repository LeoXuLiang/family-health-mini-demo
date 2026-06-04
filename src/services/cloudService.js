import {
  canOperateMember,
  canViewMember,
  getMember,
  getVisibleMembers,
  members,
  normalizeRemindTo
} from "../data/demoData";
import * as fallback from "./mockBackend";

const ENV_ID = "cloudbase-d6g9ez3uu31f0c644";

function cloudReady() {
  try {
    return !!(wx && wx.cloud && wx.cloud.database);
  } catch {
    return false;
  }
}

function db() {
  return wx.cloud.database();
}

function coll(name) {
  return db().collection(name);
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeMember(defaultMember, cloudMember = {}) {
  return {
    ...defaultMember,
    ...cloudMember,
    id: cloudMember.memberId || cloudMember.id || defaultMember.id,
    _id: cloudMember._id
  };
}

function normalizeMemberDoc(member) {
  const data = clone(member);
  data.memberId = member.id;
  delete data._id;
  return data;
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

function isCollectionNotExist(err) {
  return err && (err.errCode === -502005 || String(err.message || err.errMsg || "").includes("collection not exists"));
}

async function safeQuery(collName, fn) {
  try {
    return await fn();
  } catch (err) {
    if (isCollectionNotExist(err)) {
      console.warn(`[cloud] collection ${collName} not exist, return empty`);
      return { data: [] };
    }
    throw err;
  }
}

async function safeGet(collName, fn) {
  try {
    return await fn();
  } catch (err) {
    if (isCollectionNotExist(err)) {
      console.warn(`[cloud] collection ${collName} not exist, return null`);
      return { data: null };
    }
    throw err;
  }
}

async function seedMembersIfNeeded() {
  if (!cloudReady()) return false;

  const existing = await safeQuery("members", () => coll("members").limit(1).get());
  if (existing.data.length > 0) return true;

  try {
    for (const member of members) {
      await coll("members").add({
        data: {
          ...normalizeMemberDoc(member),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
    }
    return true;
  } catch (error) {
    if (isCollectionNotExist(error)) {
      console.warn("[cloud] collection members not exist, use local fallback");
      return false;
    }
    throw error;
  }
}

function visibleMemberIds(viewerId) {
  return getVisibleMembers(viewerId).map((member) => member.id);
}

// ============ Members ============

export async function listMembers(viewerId) {
  if (!cloudReady()) return fallback.listMembers(viewerId);

  const seeded = await seedMembersIfNeeded();
  if (!seeded) return fallback.listMembers(viewerId);

  const visibleIds = visibleMemberIds(viewerId);
  if (visibleIds.length === 0) return [];

  const result = await safeQuery("members", () =>
    coll("members")
      .where({ memberId: db().command.in(visibleIds) })
      .get()
  );

  if (result.data.length === 0) {
    return fallback.listMembers(viewerId);
  }

  const byId = new Map(result.data.map((doc) => [doc.memberId || doc.id, doc]));
  return visibleIds.map((id) => mergeMember(getMember(id), byId.get(id))).filter(Boolean);
}

export async function getMemberProfile(viewerId, memberId) {
  if (!cloudReady()) return fallback.getMemberProfile(viewerId, memberId);

  ensureCanView(viewerId, memberId);
  const seeded = await seedMembersIfNeeded();
  if (!seeded) return fallback.getMemberProfile(viewerId, memberId);

  const result = await safeQuery("members", () =>
    coll("members").where({ memberId }).limit(1).get()
  );
  const doc = result.data[0];

  return mergeMember(getMember(memberId), doc);
}

export async function updateMemberProfile(viewerId, memberId, payload) {
  if (!cloudReady()) return fallback.updateMemberProfile(viewerId, memberId, payload);

  ensureCanOperate(viewerId, memberId);
  const seeded = await seedMembersIfNeeded();
  if (!seeded) return fallback.updateMemberProfile(viewerId, memberId, payload);

  const now = new Date().toISOString();
  const data = {
    ...clone(payload),
    memberId,
    updatedBy: viewerId,
    updatedAt: now
  };
  delete data.id;
  delete data._id;

  const existing = await safeQuery("members", () =>
    coll("members").where({ memberId }).limit(1).get()
  );

  if (existing.data.length > 0) {
    const docId = existing.data[0]._id;
    await coll("members").doc(docId).update({ data });
    return mergeMember(getMember(memberId), { ...existing.data[0], ...data, _id: docId });
  }

  const created = await coll("members").add({
    data: {
      ...normalizeMemberDoc(getMember(memberId)),
      ...data,
      createdAt: now
    }
  });
  return mergeMember(getMember(memberId), { ...data, _id: created._id });
}

// ============ Health Records ============

export async function saveMetricRecord(viewerId, record) {
  if (!cloudReady()) return fallback.saveMetricRecord(viewerId, record);

  ensureCanOperate(viewerId, record.memberId);

  const doc = {
    memberId: record.memberId,
    metric: record.metric,
    value: record.value,
    time: record.time || "刚刚",
    status: record.status || "已保存",
    createdBy: viewerId,
    createdAt: new Date().toISOString()
  };

  try {
    const result = await coll("health_records").add({ data: doc });
    return { ...doc, _id: result._id, id: result._id };
  } catch (error) {
    if (isCollectionNotExist(error)) {
      console.warn("[cloud] collection health_records not exist, use local fallback");
      return fallback.saveMetricRecord(viewerId, record);
    }
    throw error;
  }
}

export async function listMetricRecords(viewerId) {
  if (!cloudReady()) return fallback.listMetricRecords(viewerId);

  const visibleIds = visibleMemberIds(viewerId);
  if (visibleIds.length === 0) return [];

  const result = await safeQuery("health_records", () =>
    coll("health_records")
      .where({ memberId: db().command.in(visibleIds) })
      .orderBy("createdAt", "desc")
      .limit(100)
      .get()
  );

  return result.data.map((doc) => ({ ...doc, id: doc._id }));
}

// ============ Medications ============

export async function createMedicationReminder(viewerId, payload) {
  if (!cloudReady()) return fallback.createMedicationReminder(viewerId, payload);

  ensureCanOperate(viewerId, payload.memberId);

  const remindTo = normalizeRemindTo(payload.remindTo, payload.memberId);

  const doc = {
    memberId: payload.memberId,
    type: "medication",
    title: payload.title || `${payload.medicine}提醒`,
    medicine: payload.medicine,
    dosage: payload.dosage || "",
    time: payload.time,
    repeat: payload.repeat || "每天",
    doctorNote: payload.doctorNote || "",
    enabled: true,
    remindTo,
    todayStatus: payload.todayStatus || "pending",
    confirmedAt: "",
    confirmedBy: "",
    createdBy: viewerId,
    createdAt: new Date().toISOString()
  };

  try {
    const result = await coll("medications").add({ data: doc });
    return { ...doc, _id: result._id, id: result._id };
  } catch (error) {
    if (isCollectionNotExist(error)) {
      console.warn("[cloud] collection medications not exist, use local fallback");
      return fallback.createMedicationReminder(viewerId, payload);
    }
    throw error;
  }
}

export async function listMedicationTasks(viewerId, memberId = "") {
  if (!cloudReady()) return fallback.listMedicationTasks(viewerId, memberId);

  const visibleIds = visibleMemberIds(viewerId);
  if (visibleIds.length === 0) return [];

  let query = coll("medications").where({
    memberId: db().command.in(visibleIds),
    enabled: true
  });

  if (memberId) {
    ensureCanView(viewerId, memberId);
    query = coll("medications").where({ memberId, enabled: true });
  }

  const result = await safeQuery("medications", () =>
    query.orderBy("time", "asc").limit(50).get()
  );

  return result.data
    .map((doc) => ({ ...doc, id: doc._id }))
    .filter((record) => {
      const receivers = normalizeRemindTo(record.remindTo, record.memberId);
      return receivers.includes(viewerId) || canOperateMember(viewerId, record.memberId);
    })
    .sort((a, b) => a.time.localeCompare(b.time));
}

export async function confirmMedication(viewerId, medicationId) {
  if (!cloudReady()) return fallback.confirmMedication(viewerId, medicationId);

  const result = await safeGet("medications", () =>
    coll("medications").doc(medicationId).get()
  );
  const task = result.data;
  if (!task) throw new Error("未找到用药提醒");

  ensureCanOperate(viewerId, task.memberId);

  const update = {
    todayStatus: "confirmed",
    confirmedAt: "刚刚",
    confirmedBy: viewerId
  };

  await coll("medications").doc(medicationId).update({ data: update });
  return { ...task, ...update, id: medicationId };
}

// ============ Care Records ============

export async function createCareRecord(viewerId, payload) {
  if (!cloudReady()) return fallback.createCareRecord(viewerId, payload);

  ensureCanOperate(viewerId, payload.memberId);

  const doc = {
    memberId: payload.memberId,
    visitDate: payload.visitDate || "",
    hospital: payload.hospital || "",
    department: payload.department || "",
    visitType: payload.visitType || "门诊",
    diagnosisName: payload.diagnosisName || "",
    doctorAdvice: payload.doctorAdvice || "",
    medicineName: payload.medicineName || "",
    medicineDosage: payload.medicineDosage || "",
    medicineFrequency: payload.medicineFrequency || "",
    examItem: payload.examItem || "",
    reportImage: payload.reportImage || "",
    followUpDate: payload.followUpDate || "",
    followUpNote: payload.followUpNote || "",
    remark: payload.remark || "",
    cost: payload.cost || "",
    createdBy: viewerId,
    createdAt: new Date().toISOString()
  };

  try {
    const result = await coll("care_records").add({ data: doc });
    return { ...doc, _id: result._id, id: result._id };
  } catch (error) {
    if (isCollectionNotExist(error)) {
      console.warn("[cloud] collection care_records not exist, use local fallback");
      return fallback.createCareRecord(viewerId, payload);
    }
    throw error;
  }
}

export async function listCareRecords(viewerId, memberId) {
  if (!cloudReady()) return fallback.listCareRecords(viewerId, memberId);

  ensureCanView(viewerId, memberId);

  const result = await safeQuery("care_records", () =>
    coll("care_records")
      .where({ memberId })
      .orderBy("createdAt", "desc")
      .limit(20)
      .get()
  );

  return {
    visits: result.data.map((doc) => ({ ...doc, id: doc._id })),
    medications: [],
    reminders: []
  };
}

// ============ Meals ============

export async function uploadMealPhoto(tempFilePath) {
  if (!cloudReady()) return "";
  const result = await wx.cloud.uploadFile({
    cloudPath: `meals/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`,
    filePath: tempFilePath
  });
  return result.fileID;
}

export async function saveMealRecord(viewerId, payload) {
  if (!cloudReady()) return fallback.analyzeMealImage(viewerId, payload.memberId);

  const doc = {
    memberId: payload.memberId,
    mealType: payload.mealType || "本餐",
    photoFileID: payload.photoFileID || "",
    score: "--",
    title: payload.title || "待分析（手动补全）",
    macros: payload.macros || [
      { label: "碳水", value: "待补充", accent: "blue" },
      { label: "蛋白", value: "待补充", accent: "green" },
      { label: "蔬菜", value: "待补充", accent: "gold" }
    ],
    advice: payload.advice || "照片已保存，请点击「修正」补充菜品和份量。",
    createdBy: viewerId,
    createdAt: new Date().toISOString()
  };

  try {
    const result = await coll("meals").add({ data: doc });
    return { ...doc, _id: result._id, id: result._id };
  } catch (error) {
    if (isCollectionNotExist(error)) {
      console.warn("[cloud] collection meals not exist, use local fallback");
      return fallback.analyzeMealImage(viewerId, payload.memberId);
    }
    throw error;
  }
}

export async function listMealRecords(viewerId, memberId) {
  if (!cloudReady()) return [];

  const result = await safeQuery("meals", () =>
    coll("meals")
      .where({ memberId })
      .orderBy("createdAt", "desc")
      .limit(10)
      .get()
  );

  return result.data.map((doc) => ({ ...doc, id: doc._id }));
}

// ============ Pass-through (non-cloud) ============

export async function listVisibleMembers(viewerId) {
  return listMembers(viewerId);
}

export { loginWithWechat, bindMember, analyzeMealImage, requestDataDeletion } from "./mockBackend";
