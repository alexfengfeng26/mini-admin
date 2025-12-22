import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/utils/api'
import type { LoginRequest, LoginResponse, User } from '@types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)

  // 计算属性
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const hasPermission = (permission: string): boolean => {
    if (!user.value) return false
    // 简单实现，实际应该从用户权限中检查
    return true
  }

  // 登录
  const login = async (credentials: LoginRequest) => {
    const response = await api.post<LoginResponse>('/auth/login', credentials)
    const { token: tokenValue, user: userData } = response.data.data

    token.value = tokenValue
    user.value = userData

    // 存储到localStorage
    localStorage.setItem('token', tokenValue)
    localStorage.setItem('user', JSON.stringify(userData))

    return response.data
  }

  // 登出
  const logout = async () => {
    try {
      // 可以调用登出API
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }

  // 初始化认证状态
  const initAuth = () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      token.value = savedToken
      user.value = JSON.parse(savedUser)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    hasPermission,
    login,
    logout,
    initAuth
  }
})
