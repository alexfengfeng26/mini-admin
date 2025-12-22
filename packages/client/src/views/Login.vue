<template>
  <div class="login-container">
    <div class="login-box">
      <h1 class="login-title">Mini Admin</h1>
      <p class="login-subtitle">后台管理系统</p>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">用户名</label>
          <input
            v-model="form.username"
            type="text"
            class="form-input"
            placeholder="请输入用户名"
            required
          />
        </div>
        <div class="form-group">
          <label class="form-label">密码</label>
          <input
            v-model="form.password"
            type="password"
            class="form-input"
            placeholder="请输入密码"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary login-btn" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
      <div class="login-hint">
        <p>默认管理员账户：admin / admin123</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = ref({
  username: '',
  password: ''
})

const loading = ref(false)

onMounted(() => {
  // 如果已登录，直接跳转
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})

const handleLogin = async () => {
  try {
    loading.value = true
    await authStore.login(form.value)
    const redirect = route.query.redirect as string || '/'
    router.push(redirect)
  } catch (error: any) {
    alert(error.response?.data?.message || '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 100%;
  max-width: 400px;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.login-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 32px;
}

.login-form {
  margin-bottom: 24px;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 8px;
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-hint {
  text-align: center;
  color: #999;
  font-size: 14px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.login-hint p {
  margin: 0;
}
</style>
