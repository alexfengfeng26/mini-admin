<template>
  <div class="dashboard">
    <h1 class="page-title">仪表盘</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: #e6f7ff;">
          <span style="color: #1890ff;">👤</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.users }}</div>
          <div class="stat-label">用户总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #f6ffed;">
          <span style="color: #52c41a;">👥</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.roles }}</div>
          <div class="stat-label">角色总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: #fff7e6;">
          <span style="color: #fa8c16;">📋</span>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stats.menus }}</div>
          <div class="stat-label">菜单总数</div>
        </div>
      </div>
    </div>
    <div class="welcome-card">
      <h2>欢迎使用 Mini Admin 后台管理系统</h2>
      <p>这是一个基于 Vue 3 + Express + Prisma 构建的现代化后台管理系统</p>
      <div class="feature-list">
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>用户管理 - 完整的用户CRUD操作</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>角色管理 - RBAC权限模型</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>菜单管理 - 支持无限级嵌套</span>
        </div>
        <div class="feature-item">
          <span class="feature-icon">✓</span>
          <span>JWT认证 - 安全的身份验证</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'

const stats = ref({
  users: 0,
  roles: 0,
  menus: 0
})

onMounted(async () => {
  try {
    // 获取统计数据
    const [usersRes, rolesRes, menusRes] = await Promise.all([
      api.get('/users', { params: { pageSize: 1 } }),
      api.get('/roles', { params: { pageSize: 1 } }),
      api.get('/menus', { params: { pageSize: 1 } })
    ])

    stats.value.users = usersRes.data.data.total
    stats.value.roles = rolesRes.data.data.total
    stats.value.menus = menusRes.data.data.total
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
})
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.welcome-card {
  background: white;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.welcome-card h2 {
  font-size: 24px;
  margin-bottom: 16px;
  color: #333;
}

.welcome-card p {
  color: #666;
  margin-bottom: 24px;
  line-height: 1.6;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.feature-icon {
  width: 20px;
  height: 20px;
  background: #52c41a;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
</style>
