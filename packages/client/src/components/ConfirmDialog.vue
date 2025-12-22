<template>
  <BaseModal
    v-model:visible="visible"
    :title="title"
    size="small"
    :confirm-text="confirmText"
    :cancel-text="cancelText"
    :loading="loading"
    :loading-text="loadingText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    @close="handleCancel"
  >
    <div class="confirm-content">
      <div class="confirm-icon" :class="iconClass">{{ icon }}</div>
      <div class="confirm-message">{{ message }}</div>
      <div class="confirm-description" v-if="description">{{ description }}</div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseModal from './BaseModal.vue'

interface Props {
  visible?: boolean
  title?: string
  message: string
  description?: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'question'
  confirmText?: string
  cancelText?: string
  loading?: boolean
  loadingText?: string
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '',
  type: 'question',
  confirmText: '确定',
  cancelText: '取消',
  loading: false,
  loadingText: '处理中...'
})

const emit = defineEmits<Emits>()

// 根据类型获取图标
const icon = computed(() => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    question: '❓'
  }
  return icons[props.type]
})

// 根据类型获取图标样式类
const iconClass = computed(() => {
  return `confirm-icon-${props.type}`
})

// 处理确认
const handleConfirm = () => {
  emit('confirm')
}

// 处理取消
const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16px;
  padding: 20px 0;
}

.confirm-icon {
  font-size: 48px;
}

.confirm-icon-info {
  color: #1890ff;
}

.confirm-icon-success {
  color: #52c41a;
}

.confirm-icon-warning {
  color: #faad14;
}

.confirm-icon-error {
  color: #ff4d4f;
}

.confirm-icon-question {
  color: #1890ff;
}

.confirm-message {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  line-height: 1.5;
}

.confirm-description {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  max-width: 400px;
}
</style>