<template>
  <div class="user-list">
    <div class="page-header">
      <h1 class="page-title">用户管理</h1>
      <router-link to="/users/create" class="btn btn-primary">
        + 新增用户
      </router-link>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="search-bar">
          <input
            v-model="searchForm.username"
            type="text"
            class="form-input"
            placeholder="搜索用户名"
          />
          <input
            v-model="searchForm.email"
            type="text"
            class="form-input"
            placeholder="搜索邮箱"
          />
          <select v-model="searchForm.status" class="form-select">
            <option value="">全部状态</option>
            <option value="1">启用</option>
            <option value="0">禁用</option>
          </select>
          <button class="btn btn-secondary" @click="handleSearch">搜索</button>
          <button class="btn btn-secondary" @click="resetSearch">重置</button>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>用户名</th>
              <th>邮箱</th>
              <th>昵称</th>
              <th>状态</th>
              <th>角色</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.nickname || '-' }}</td>
              <td>
                <span
                  :class="[
                    'status-badge',
                    user.status === 1 ? 'status-active' : 'status-inactive'
                  ]"
                >
                  {{ user.status === 1 ? '启用' : '禁用' }}
                </span>
              </td>
              <td>{{ user.roleNames }}</td>
              <td>{{ formatDate(user.createdAt) }}</td>
              <td>
                <router-link
                  :to="`/users/${user.id}/edit`"
                  class="btn btn-secondary"
                  style="margin-right: 8px;"
                >
                  编辑
                </router-link>
                <button class="btn btn-danger" @click="handleDelete(user.id)">
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button
            class="btn btn-secondary"
            :disabled="pagination.page <= 1"
            @click="handlePageChange(pagination.page - 1)"
          >
            上一页
          </button>
          <span class="pagination-info">
            第 {{ pagination.page }} / {{ pagination.totalPages }} 页，共
            {{ pagination.total }} 条
          </span>
          <button
            class="btn btn-secondary"
            :disabled="pagination.page >= pagination.totalPages"
            @click="handlePageChange(pagination.page + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
import type { UserListItem, PaginatedResponse } from '@types'

const users = ref<UserListItem[]>([])
const pagination = ref({
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0
})

const searchForm = ref({
  username: '',
  email: '',
  status: ''
})

const fetchUsers = async () => {
  try {
    const params = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize,
      ...searchForm.value
    }

    const response = await api.get<PaginatedResponse<UserListItem>>('/users', {
      params
    })

    users.value = response.data.data.items
    pagination.value = response.data.data
  } catch (error) {
    console.error('获取用户列表失败:', error)
    alert('获取用户列表失败')
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchUsers()
}

const resetSearch = () => {
  searchForm.value = {
    username: '',
    email: '',
    status: ''
  }
  pagination.value.page = 1
  fetchUsers()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchUsers()
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个用户吗？')) return

  try {
    await api.delete(`/users/${id}`)
    alert('删除成功')
    fetchUsers()
  } catch (error) {
    console.error('删除用户失败:', error)
    alert('删除用户失败')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-list {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-bar .form-input,
.search-bar .form-select {
  width: 200px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}
</style>
