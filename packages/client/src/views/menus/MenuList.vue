<template>
  <div class="menu-list">
    <div class="page-header">
      <h1 class="page-title">菜单管理</h1>
      <router-link to="/menus/create" class="btn btn-primary">
        + 新增菜单
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>菜单名称</th>
              <th>路径</th>
              <th>类型</th>
              <th>排序</th>
              <th>状态</th>
              <th>权限标识</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="menu in menuTree" :key="menu.id">
              <tr>
                <td>{{ menu.id }}</td>
                <td>{{ menu.name }}</td>
                <td>{{ menu.path || '-' }}</td>
                <td>
                  <span class="status-badge" :class="menu.type === 1 ? 'status-active' : 'status-inactive'">
                    {{ menu.type === 1 ? '菜单' : '按钮' }}
                  </span>
                </td>
                <td>{{ menu.sort }}</td>
                <td>
                  <span
                    :class="[
                      'status-badge',
                      menu.status === 1 ? 'status-active' : 'status-inactive'
                    ]"
                  >
                    {{ menu.status === 1 ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>{{ menu.permission || '-' }}</td>
                <td>{{ formatDate(menu.createdAt) }}</td>
                <td>
                  <router-link
                    :to="`/menus/${menu.id}/edit`"
                    class="btn btn-secondary"
                    style="margin-right: 8px;"
                  >
                    编辑
                  </router-link>
                  <button class="btn btn-danger" @click="handleDelete(menu.id)">
                    删除
                  </button>
                </td>
              </tr>
              <tr v-if="menu.children && menu.children.length > 0">
                <td colspan="9" style="padding: 0;">
                  <table class="table" style="margin: 0;">
                    <tbody>
                      <tr v-for="child in menu.children" :key="child.id">
                        <td>{{ child.id }}</td>
                        <td>　├─ {{ child.name }}</td>
                        <td>{{ child.path || '-' }}</td>
                        <td>
                          <span class="status-badge" :class="child.type === 1 ? 'status-active' : 'status-inactive'">
                            {{ child.type === 1 ? '菜单' : '按钮' }}
                          </span>
                        </td>
                        <td>{{ child.sort }}</td>
                        <td>
                          <span
                            :class="[
                              'status-badge',
                              child.status === 1 ? 'status-active' : 'status-inactive'
                            ]"
                          >
                            {{ child.status === 1 ? '启用' : '禁用' }}
                          </span>
                        </td>
                        <td>{{ child.permission || '-' }}</td>
                        <td>{{ formatDate(child.createdAt) }}</td>
                        <td>
                          <router-link
                            :to="`/menus/${child.id}/edit`"
                            class="btn btn-secondary"
                            style="margin-right: 8px;"
                          >
                            编辑
                          </router-link>
                          <button class="btn btn-danger" @click="handleDelete(child.id)">
                            删除
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
import type { Menu } from '@types'

const menuTree = ref<Menu[]>([])

const fetchMenus = async () => {
  try {
    const response = await api.get('/menus/tree')
    menuTree.value = response.data.data
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    alert('获取菜单列表失败')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个菜单吗？')) return

  try {
    await api.delete(`/menus/${id}`)
    alert('删除成功')
    fetchMenus()
  } catch (error: any) {
    console.error('删除菜单失败:', error)
    alert(error.response?.data?.message || '删除菜单失败')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchMenus()
})
</script>

<style scoped>
.menu-list {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.table .table {
  background: #fafafa;
}
</style>
