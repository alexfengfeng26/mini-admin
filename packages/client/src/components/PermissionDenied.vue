<template>
  <div class="permission-denied">
    <div class="permission-card">
      <div class="permission-icon">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="32" fill="#ff4d4f" fill-opacity="0.1"/>
          <path d="M32 40C34.2091 40 36 38.2091 36 36C36 33.7909 34.2091 32 32 32C29.7909 32 28 33.7909 28 36C28 38.2091 29.7909 40 32 40Z" fill="#ff4d4f"/>
          <path d="M32 18C33.1046 18 34 18.8954 34 20V28C34 29.1046 33.1046 30 32 30C30.8954 30 30 29.1046 30 28V20C30 18.8954 30.8954 18 32 18Z" fill="#ff4d4f"/>
          <path d="M16 20C16 17.7909 17.7909 16 20 16H44C46.2091 16 48 17.7909 48 20V44C48 46.2091 46.2091 48 44 48H20C17.7909 48 16 46.2091 16 44V20ZM20 20V44H44V20H20Z" fill="#ff4d4f"/>
        </svg>
      </div>

      <h2 class="permission-title">权限不足</h2>

      <p class="permission-message">
        抱歉，您没有访问此功能的权限。
      </p>

      <p class="permission-suggestion">
        如需访问此功能，请联系系统管理员为您分配相应权限。
      </p>

      <div class="permission-actions">
        <button @click="goBack" class="btn btn-secondary">
          返回上一页
        </button>
        <router-link to="/" class="btn btn-primary">
          返回首页
        </router-link>
      </div>

      <div class="permission-details" v-if="requiredPermission">
        <small>所需权限：{{ requiredPermission }}</small>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  requiredPermission?: string
}

const props = withDefaults(defineProps<Props>(), {
  requiredPermission: ''
})

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.permission-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.permission-card {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.permission-icon {
  margin-bottom: 24px;
}

.permission-title {
  font-size: 24px;
  font-weight: 600;
  color: #ff4d4f;
  margin: 0 0 16px 0;
}

.permission-message {
  font-size: 16px;
  color: #333;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.permission-suggestion {
  font-size: 14px;
  color: #666;
  margin: 0 0 32px 0;
  line-height: 1.5;
}

.permission-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 24px;
}

.permission-details {
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.permission-details small {
  color: #999;
  font-size: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s;
  min-width: 80px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
  border: 1px solid #1890ff;
}

.btn-primary:hover {
  background-color: #40a9ff;
  border-color: #40a9ff;
}

.btn-secondary {
  background-color: white;
  color: #333;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  border-color: #40a9ff;
  color: #40a9ff;
}
</style>