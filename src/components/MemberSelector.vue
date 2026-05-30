<template>
  <scroll-view class="member-scroll" scroll-x :show-scrollbar="false">
    <button
      v-for="member in visibleMembers"
      :key="member.id"
      class="member-pill"
      :class="{ active: modelValue === member.id }"
      @click="$emit('update:modelValue', member.id)"
    >
      {{ member.shortName }}
    </button>
  </scroll-view>
</template>

<script setup>
defineProps({
  visibleMembers: {
    type: Array,
    required: true
  },
  modelValue: {
    type: String,
    required: true
  }
});

defineEmits(["update:modelValue"]);
</script>

<style scoped>
.member-scroll {
  width: 100%;
  white-space: nowrap;
  padding: 10rpx 32rpx 22rpx;
}

.member-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 112rpx;
  height: 72rpx;
  margin-right: 14rpx;
  border-radius: 999rpx;
  background: #e7f0eb;
  color: #64746e;
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
}

.member-pill.active {
  background: #2f8f72;
  color: #ffffff;
}
</style>
