<template>
  <div class="role-list">
    <!-- 权限不足提示 -->
    <PermissionDenied v-if="isPermissionDenied" requiredPermission="role:list" />

    <template v-else>
      <div class="page-header">
        <h1 class="page-title">角色管理</h1>
        <router-link to="/roles/create" class="btn btn-primary">
          + 新增角色
        </router-link>
      </div>

      <div class="card">
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>角色名称</th>
                <th>角色编码</th>
                <th>描述</th>
                <th>状态</th>
                <th>用户数</th>
                <th>权限数</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="role in roles" :key="role.id">
                <td>{{ role.id }}</td>
                <td>{{ role.name }}</td>
                <td>{{ role.code }}</td>
                <td>{{ role.description || '-' }}</td>
                <td>
                  <span
                    :class="[
                      'status-badge',
                      role.status === 1 ? 'status-active' : 'status-inactive'
                    ]"
                  >
                    {{ role.status === 1 ? '启用' : '禁用' }}
                  </span>
                </td>
                <td>{{ role.userCount }}</td>
                <td>{{ role.menuCount }}</td>
                <td>{{ formatDate(role.createdAt) }}</td>
                <td>
                  <router-link
                    :to="`/roles/${role.id}/edit`"
                    class="btn btn-secondary"
                    style="margin-right: 8px;"
                  >
                    编辑
                  </router-link>
                  <button class="btn btn-danger" @click="handleDelete(role.id)">
                    删除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
import PermissionDenied from '@/components/PermissionDenied.vue'
import { useApiError } from '@/composables/useErrorHandler'
import type { RoleListItem, PaginatedResponse } from '@types'

const roles = ref<RoleListItem[]>([])

const { isPermissionDenied, handleError } = useApiError()

const fetchRoles = async () => {
  try {
    const response = await api.get<PaginatedResponse<RoleListItem>>('/roles', {
      params: { pageSize: 100 }
    })
    roles.value = response.data.data.items
  } catch (error) {
    handleError(error, '获取角色列表失败')
  }
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个角色吗？')) return

  try {
    await api.delete(`/roles/${id}`)
    alert('删除成功')
    fetchRoles()
  } catch (error: any) {
    console.error('删除角色失败:', error)
    alert(error.response?.data?.message || '删除角色失败')
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchRoles()
})
</script>

<style scoped>
.role-list {
  max-width: 1400px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
</style>
