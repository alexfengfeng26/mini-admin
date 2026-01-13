<template>
  <div class="main-layout">
    <aside class="sidebar">
      <div class="logo">
        <h2>Mini Admin</h2>
      </div>
      <nav class="nav">
        <!-- 仪表盘 - 所有用户都可以访问 -->
        <router-link to="/" class="nav-item">
          仪表盘
        </router-link>

        <!-- 基于用户菜单权限显示的导航项 -->
        <template v-for="menu in processedMenus" :key="menu.id">
          <!-- 有子菜单的一级菜单 -->
          <template v-if="menu.children && menu.children.length > 0">
            <div class="nav-group">
              <div class="nav-item nav-title" @click="toggleMenu(menu.id)">
                <span class="nav-icon">{{ getIconDisplay(menu.icon) }}</span>
                {{ menu.name }}
                <span class="arrow" :class="{ expanded: expandedMenus[menu.id] }">
                  {{ expandedMenus[menu.id] ? '▼' : '▶' }}
                </span>
              </div>
              <!-- 子菜单 -->
              <div v-show="expandedMenus[menu.id]" class="nav-children">
                <template v-for="child in menu.children" :key="child.id">
                  <router-link v-if="child && child.type === 1 && child.path" :to="child.path" class="nav-item nav-child">
                    <span class="nav-icon">{{ getIconDisplay(child.icon) }}</span>
                    {{ child.name }}
                  </router-link>
                </template>
              </div>
            </div>
          </template>

          <!-- 直接的菜单项 -->
          <router-link v-else-if="menu.type === 1 && menu.path" :to="menu.path" class="nav-item">
            <span class="nav-icon">{{ getIconDisplay(menu.icon) }}</span>
            {{ menu.name }}
          </router-link>
        </template>
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
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { api } from '@/utils/api'

const authStore = useAuthStore()
const router = useRouter()

// 用户菜单数据
const userMenus = ref<any[]>([])

// 菜单展开/折叠状态
const expandedMenus = ref<Record<number, boolean>>({})

// 切换菜单展开/折叠
const toggleMenu = (menuId: number) => {
  expandedMenus.value[menuId] = !expandedMenus.value[menuId]
}

// 获取用户菜单
const fetchUserMenus = async () => {
  try {
    const response = await api.get('/menus/user')
    userMenus.value = response.data.data || []

    // 默认展开所有有子菜单的菜单
    userMenus.value.forEach(menu => {
      if (menu.children && menu.children.length > 0) {
        expandedMenus.value[menu.id] = true
      }
    })
  } catch (error) {
    console.warn('获取用户菜单失败:', error)
    // 如果获取失败，显示默认的空菜单
    userMenus.value = []
  }
}

// 转换菜单数据结构，处理API返回的树形数据
const processedMenus = computed(() => {
  const rootMenus: any[] = []

  // 直接使用API返回的树形结构
  userMenus.value.forEach(menu => {
    // 只显示有路径的目录类型菜单
    if (menu.type === 1) {
      // 如果菜单有路径，显示为可点击的菜单项
      if (menu.path) {
        rootMenus.push(menu)
      } else if (menu.children && menu.children.length > 0) {
        // 如果是父级目录，确保显示
        rootMenus.push(menu)
      }
    }
  })

  return rootMenus
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}

// 图标映射函数
const getIconDisplay = (iconStr: string) => {
  const iconMap: Record<string, string> = {
    'SettingOutlined': '⚙️',
    'UserOutlined': '👤',
    'TeamOutlined': '👥',
    'MenuOutlined': '📋',
    'DashboardOutlined': '📊',
    'EditOutlined': '✏️',
    'DeleteOutlined': '🗑️',
    'PlusOutlined': '➕',
    'SearchOutlined': '🔍',
    'HomeOutlined': '🏠'
  }
  return iconMap[iconStr] || '📄'
}

onMounted(() => {
  fetchUserMenus()
})
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
  border: none;
  outline: none;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.router-link-active {
  background: #1890ff;
  color: white;
  border: none;
  outline: none;
}

.nav-item:focus {
  outline: none;
  box-shadow: none;
}

.nav-group {
  margin-bottom: 8px;
}

.nav-title {
  font-weight: 500;
  background: rgba(255, 255, 255, 0.05);
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.nav-title:hover {
  background: rgba(255, 255, 255, 0.1);
}

.arrow {
  margin-left: auto;
  font-size: 10px;
  transition: transform 0.3s;
}

.arrow.expanded {
  transform: rotate(90deg);
}

.nav-children {
  overflow: hidden;
  transition: all 0.3s ease-in-out;
}

.nav-child {
  padding-left: 48px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.55);
}

.nav-child:hover {
  color: rgba(255, 255, 255, 0.85);
}

.nav-child.router-link-active {
  color: white;
  background: rgba(24, 144, 255, 0.8);
}

.nav-icon {
  margin-right: 8px;
  font-size: 16px;
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
