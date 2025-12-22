<template>
  <div class="form-container">
    <div class="page-header">
      <h1 class="page-title">{{ title }}</h1>
      <router-link :to="backUrl" class="btn btn-secondary">
        返回列表
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- 动态表单字段 -->
          <div class="form-row" v-for="(row, rowIndex) in fields" :key="rowIndex">
            <div
              class="form-group"
              v-for="field in row"
              :key="field.key"
              :class="field.fullWidth ? 'form-group-full' : ''"
            >
              <label class="form-label" v-if="field.label">
                {{ field.label }} {{ field.required ? '*' : '' }}
                <span class="form-hint" v-if="field.hint">{{ field.hint }}</span>
              </label>

              <!-- 文本输入 -->
              <input
                v-if="field.type === 'text' || field.type === 'email'"
                v-model="form[field.key]"
                :type="field.type"
                class="form-input"
                :class="{ 'form-input-error': errors[field.key] }"
                :disabled="loading || field.disabled"
                :required="field.required"
                :placeholder="field.placeholder"
                :maxlength="field.maxlength"
                @blur="validateField(field)"
              />

              <!-- 密码输入 -->
              <input
                v-else-if="field.type === 'password'"
                v-model="form[field.key]"
                type="password"
                class="form-input"
                :class="{ 'form-input-error': errors[field.key] }"
                :disabled="loading || field.disabled"
                :required="field.required"
                :placeholder="field.placeholder"
                @blur="validateField(field)"
              />

              <!-- 数字输入 -->
              <input
                v-else-if="field.type === 'number'"
                v-model.number="form[field.key]"
                type="number"
                class="form-input"
                :class="{ 'form-input-error': errors[field.key] }"
                :disabled="loading || field.disabled"
                :required="field.required"
                :placeholder="field.placeholder"
                :min="field.min"
                :max="field.max"
                @blur="validateField(field)"
              />

              <!-- 文本域 -->
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="form[field.key]"
                class="form-input"
                :class="{ 'form-input-error': errors[field.key] }"
                :disabled="loading || field.disabled"
                :required="field.required"
                :placeholder="field.placeholder"
                :rows="field.rows || 3"
                @blur="validateField(field)"
              />

              <!-- 选择器 -->
              <select
                v-else-if="field.type === 'select'"
                v-model="form[field.key]"
                class="form-select"
                :class="{ 'form-input-error': errors[field.key] }"
                :disabled="loading || field.disabled"
                @change="validateField(field)"
              >
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>

              <!-- 复选框 -->
              <div v-else-if="field.type === 'checkbox'" class="checkbox-group">
                <label
                  v-for="option in field.options"
                  :key="option.value"
                  class="checkbox-label"
                >
                  <input
                    type="checkbox"
                    :value="option.value"
                    v-model="form[field.key]"
                    :disabled="loading"
                  />
                  {{ option.label }}
                </label>
              </div>

              <!-- 单选框 -->
              <div v-else-if="field.type === 'radio'" class="radio-group">
                <label
                  v-for="option in field.options"
                  :key="option.value"
                  class="radio-label"
                >
                  <input
                    type="radio"
                    :value="option.value"
                    v-model="form[field.key]"
                    :disabled="loading"
                  />
                  {{ option.label }}
                </label>
              </div>

              <!-- 错误信息 -->
              <div v-if="errors[field.key]" class="form-error">
                {{ errors[field.key] }}
              </div>
            </div>
          </div>

          <!-- 自定义插槽 -->
          <slot name="custom-fields" :form="form" :errors="errors" :validate-field="validateField" />

          <!-- 操作按钮 -->
          <div class="form-actions">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="loading || !isFormValid"
            >
              <span v-if="loading" class="loading-spinner"></span>
              {{ loading ? loadingText : submitText }}
            </button>
            <router-link :to="backUrl" class="btn btn-secondary" :disabled="loading">
              取消
            </router-link>
            <button
              v-if="showReset"
              type="button"
              class="btn btn-secondary"
              @click="resetForm"
              :disabled="loading"
            >
              重置
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

interface FormField {
  key: string
  type: 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio'
  label?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  fullWidth?: boolean
  options?: Array<{ label: string; value: any }>
  rows?: number
  min?: number
  max?: number
  maxlength?: number
  validator?: (value: any) => string | null
}

interface Props {
  title: string
  form: Record<string, any>
  fields: FormField[][]
  backUrl: string
  submitText?: string
  loadingText?: string
  loading?: boolean
  showReset?: boolean
  validateOnChange?: boolean
}

interface Emits {
  (e: 'submit', form: Record<string, any>): void
  (e: 'reset'): void
  (e: 'field-change', field: string, value: any): void
}

const props = withDefaults(defineProps<Props>(), {
  submitText: '保存',
  loadingText: '保存中...',
  loading: false,
  showReset: false,
  validateOnChange: true
})

const emit = defineEmits<Emits>()

const router = useRouter()

// 表单验证错误
const errors = reactive<Record<string, string>>({})

// 表单是否有效
const isFormValid = computed(() => {
  // 检查必填字段
  for (const row of props.fields) {
    for (const field of row) {
      if (field.required && !props.form[field.key]) {
        return false
      }
      if (errors[field.key]) {
        return false
      }
    }
  }
  return true
})

// 验证单个字段
const validateField = (field: FormField) => {
  const value = props.form[field.key]

  // 清除之前的错误
  delete errors[field.key]

  // 必填验证
  if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
    errors[field.key] = `${field.label} 不能为空`
    return
  }

  // 自定义验证
  if (field.validator && value) {
    const error = field.validator(value)
    if (error) {
      errors[field.key] = error
      return
    }
  }

  // 邮箱验证
  if (field.type === 'email' && value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value)) {
      errors[field.key] = '请输入有效的邮箱地址'
      return
    }
  }

  // 数字范围验证
  if (field.type === 'number' && value !== undefined) {
    if (field.min !== undefined && value < field.min) {
      errors[field.key] = `值不能小于 ${field.min}`
      return
    }
    if (field.max !== undefined && value > field.max) {
      errors[field.key] = `值不能大于 ${field.max}`
      return
    }
  }
}

// 验证整个表单
const validateForm = () => {
  for (const row of props.fields) {
    for (const field of row) {
      validateField(field)
    }
  }
  return Object.keys(errors).length === 0
}

// 处理表单提交
const handleSubmit = () => {
  if (!validateForm()) {
    return
  }
  emit('submit', { ...props.form })
}

// 重置表单
const resetForm = () => {
  // 清除错误
  Object.keys(errors).forEach(key => delete errors[key])
  emit('reset')
}

// 监听表单变化
if (props.validateOnChange) {
  watch(() => props.form, () => {
    // 可以在这里添加实时验证逻辑
  }, { deep: true })
}
</script>

<style scoped>
.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-group {
  position: relative;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
}

.form-hint {
  font-size: 12px;
  color: #666;
  font-weight: normal;
  margin-left: 4px;
}

.form-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input-error {
  border-color: #ff4d4f;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.checkbox-label,
.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.checkbox-label input[type="checkbox"],
.radio-label input[type="radio"] {
  cursor: pointer;
}

.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.form-error {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #f0f0f0;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>