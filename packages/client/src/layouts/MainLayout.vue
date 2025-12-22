<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>Mini Admin</h2>
      </div>
      <nav class="nav">
        <router-link to="/" class="nav-item">
          仪表盘
        </router-link>
        <router-link to="/users" class="nav-item">
          用户管理
        </router-link>
        <router-link to="/roles" class="nav-item">
          角色管理
        </router-link>
        <router-link to="/menus" class="nav-item">
          菜单管理
        </router-link>
      </nav>
    </aside>
    <div class="main-content">
      <header class="header">
        <div class="header-right">
          <span class="username">{{ authStore.user?.username }}</span>
          <button class="btn btn-secondary" @click="handleLogout">
            登出
          </button>
        </div>
      </header>
      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 240px;
  background: #001529;
  color: white;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 16px;
  text-align: center;
  border-bottom: 1px solid #303030;
}

.logo h2 {
  font-size: 20px;
  margin: 0;
}

.nav {
  flex: 1;
  padding: 16px 0;
}

.nav-item {
  display: block;
  padding: 12px 24px;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: #1890ff;
  color: white;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 64px;
  background: white;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 24px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.username {
  color: #666;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: #f0f2f5;
}
</style>
