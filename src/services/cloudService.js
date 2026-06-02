import {
  canOperateMember,
  canViewMember,
  getMember,
  getVisibleMembers,
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

  const result = await coll("health_records").add({ data: doc });
  return { ...doc, _id: result._id, id: result._id };
}

export async function listMetricRecords(viewerId) {
  if (!cloudReady()) return fallback.listMetricRecords(viewerId);

  const visibleIds = getVisibleMembers(viewerId).map((m) => m.id);
  if (visibleIds.length === 0) return [];

  const result = await coll("health_records")
    .where({ memberId: db().command.in(visibleIds) })
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

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

  const result = await coll("medications").add({ data: doc });
  return { ...doc, _id: result._id, id: result._id };
}

export async function listMedicationTasks(viewerId, memberId = "") {
  if (!cloudReady()) return fallback.listMedicationTasks(viewerId, memberId);

  const visibleIds = getVisibleMembers(viewerId).map((m) => m.id);
  if (visibleIds.length === 0) return [];

  let query = coll("medications").where({
    memberId: db().command.in(visibleIds),
    enabled: true
  });

  if (memberId) {
    ensureCanView(viewerId, memberId);
    query = coll("medications").where({ memberId, enabled: true });
  }

  const result = await query.orderBy("time", "asc").limit(50).get();

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

  const result = await coll("medications").doc(medicationId).get();
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

  const result = await coll("care_records").add({ data: doc });
  return { ...doc, _id: result._id, id: result._id };
}

export async function listCareRecords(viewerId, memberId) {
  if (!cloudReady()) return fallback.listCareRecords(viewerId, memberId);

  ensureCanView(viewerId, memberId);

  const result = await coll("care_records")
    .where({ memberId })
    .orderBy("createdAt", "desc")
    .limit(20)
    .get();

  return {
    visits: result.data.map((doc) => ({ ...doc, id: doc._id })),
    medications: [],
    reminders: []
  };
}

// ============ Pass-through (non-cloud) ============

export { loginWithWechat, bindMember, listVisibleMembers, analyzeMealImage, requestDataDeletion } from "./mockBackend";
