import { computed, reactive } from "vue";
import { getVisibleMembers } from "../data/demoData";

const STORAGE_KEY = "family-health-demo-state";

function readStorage() {
  try {
    return uni.getStorageSync(STORAGE_KEY) || {};
  } catch (error) {
    return {};
  }
}

const persisted = readStorage();

export const appState = reactive({
  privacyAccepted: persisted.privacyAccepted || false,
  boundMemberId: persisted.boundMemberId || "",
  viewerId: persisted.viewerId || "me",
  largeText: persisted.largeText || false,
  pendingMetricKey: ""
});

export const visibleMembers = computed(() => getVisibleMembers(appState.viewerId));

export function persistAppState() {
  uni.setStorageSync(STORAGE_KEY, {
    privacyAccepted: appState.privacyAccepted,
    boundMemberId: appState.boundMemberId,
    viewerId: appState.viewerId,
    largeText: appState.largeText
  });
}

export function acceptPrivacy(memberId) {
  appState.privacyAccepted = true;
  appState.boundMemberId = memberId;
  appState.viewerId = memberId;
  persistAppState();
}

export function switchViewer(memberId) {
  appState.viewerId = memberId;
  persistAppState();
}

export function setPendingMetric(metricKey) {
  appState.pendingMetricKey = metricKey;
}

export function consumePendingMetric() {
  const metricKey = appState.pendingMetricKey;
  appState.pendingMetricKey = "";
  return metricKey;
}

export function resetDemoState() {
  appState.privacyAccepted = false;
  appState.boundMemberId = "";
  appState.viewerId = "me";
  appState.largeText = false;
  uni.removeStorageSync(STORAGE_KEY);
}
