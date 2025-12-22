<template>
  <teleport to="body">
    <div class="modal-overlay" v-if="visible" @click="handleOverlayClick">
      <div class="modal" :class="[sizeClass]" @click.stop>
        <!-- 头部 -->
        <div class="modal-header" v-if="showHeader">
          <h3 class="modal-title">{{ title }}</h3>
          <button class="modal-close" @click="handleClose" v-if="showClose">
            ×
          </button>
        </div>

        <!-- 内容 -->
        <div class="modal-body" :class="{ 'modal-body-scroll': scrollable }">
          <slot />
        </div>

        <!-- 底部 -->
        <div class="modal-footer" v-if="showFooter">
          <slot name="footer">
            <button class="btn btn-secondary" @click="handleClose" :disabled="loading">
              {{ cancelText }}
            </button>
            <button
              class="btn btn-primary"
              @click="handleConfirm"
              :disabled="loading || !confirmEnabled"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? loadingText : confirmText }}
            </button>
          </slot>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  visible: boolean
  title?: string
  size?: 'small' | 'medium' | 'large'
  confirmText?: string
  cancelText?: string
  loadingText?: string
  loading?: boolean
  confirmEnabled?: boolean
  showHeader?: boolean
  showFooter?: boolean
  showClose?: boolean
  closable?: boolean
  scrollable?: boolean
  maskClosable?: boolean
}

interface Emits {
  (e: 'update:visible', visible: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: 'medium',
  confirmText: '确定',
  cancelText: '取消',
  loadingText: '处理中...',
  loading: false,
  confirmEnabled: true,
  showHeader: true,
  showFooter: true,
  showClose: true,
  closable: true,
  scrollable: true,
  maskClosable: true
})

const emit = defineEmits<Emits>()

// 计算尺寸样式类
const sizeClass = computed(() => {
  return `modal-${props.size}`
})

// 处理关闭
const handleClose = () => {
  if (props.closable && !props.loading) {
    emit('update:visible', false)
    emit('close')
    emit('cancel')
  }
}

// 处理确认
const handleConfirm = () => {
  if (!props.loading && props.confirmEnabled) {
    emit('confirm')
  }
}

// 处理遮罩层点击
const handleOverlayClick = () => {
  if (props.maskClosable) {
    handleClose()
  }
}

// 监听键盘事件
watch(() => props.visible, (visible) => {
  if (visible) {
    document.addEventListener('keydown', handleKeydown)
  } else {
    document.removeEventListener('keydown', handleKeydown)
  }
})

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    handleClose()
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.modal {
  background: white;
  border-radius: 8px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-small {
  width: 400px;
}

.modal-medium {
  width: 600px;
}

.modal-large {
  width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.3s;
}

.modal-close:hover {
  background-color: #f0f0f0;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
}

.modal-body-scroll {
  max-height: calc(90vh - 140px);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #d9d9d9;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>