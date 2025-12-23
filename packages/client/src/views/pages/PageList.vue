<template>
  <div class="page-list">
    <PermissionDenied v-if="isPermissionDenied" requiredPermission="page:list" />

    <template v-else>
      <div class="page-header">
        <h1 class="page-title">页面管理</h1>
        <router-link to="/cms/pages/create" class="btn btn-primary">+ 新增页面</router-link>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="search-bar">
            <input v-model="searchForm.keyword" type="text" class="form-input" placeholder="搜索标题或内容" />
            <select v-model="searchForm.status" class="form-select">
              <option value="">全部状态</option>
              <option value="0">草稿</option>
              <option value="1">已发布</option>
              <option value="2">已下架</option>
            </select>
            <button class="btn btn-secondary" @click="handleSearch">搜索</button>
            <button class="btn btn-secondary" @click="resetSearch">重置</button>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>Slug</th>
                <th>模板</th>
                <th>状态</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="page in pages" :key="page.id">
                <td>{{ page.id }}</td>
                <td>{{ page.title }}</td>
                <td>{{ page.slug }}</td>
                <td>{{ page.template || '-' }}</td>
                <td>
                  <span :class="['status-badge', page.status === 1 ? 'status-active' : 'status-draft']">
                    {{ page.status === 1 ? '已发布' : '草稿' }}
                  </span>
                </td>
                <td>{{ formatDate(page.createdAt) }}</td>
                <td>
                  <router-link :to="`/cms/pages/${page.id}/edit`" class="btn btn-secondary" style="margin-right: 8px;">编辑</router-link>
                  <button class="btn btn-danger" @click="handleDelete(page.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="pagination">
            <button class="btn btn-secondary" :disabled="pagination.page <= 1" @click="handlePageChange(pagination.page - 1)">上一页</button>
            <span class="pagination-info">第 {{ pagination.page }} / {{ pagination.totalPages }} 页，共 {{ pagination.total }} 条</span>
            <button class="btn btn-secondary" :disabled="pagination.page >= pagination.totalPages" @click="handlePageChange(pagination.page + 1)">下一页</button>
          </div>
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
import type { PageListItem, PaginatedResponse } from '@types'

const pages = ref<PageListItem[]>([])
const pagination = ref({ total: 0, page: 1, pageSize: 10, totalPages: 0 })
const searchForm = ref({ keyword: '', status: '' })
const { isPermissionDenied, handleError } = useApiError()

const fetchPages = async () => {
  try {
    const params: any = { page: pagination.value.page, pageSize: pagination.value.pageSize }
    if (searchForm.value.keyword) params.keyword = searchForm.value.keyword
    if (searchForm.value.status !== '') params.status = parseInt(searchForm.value.status)

    const response = await api.get<PaginatedResponse<PageListItem>>('/pages', { params })
    pages.value = response.data.data.items
    pagination.value = response.data.data
  } catch (error) {
    handleError(error, '获取页面列表失败')
  }
}

const handleSearch = () => { pagination.value.page = 1; fetchPages() }
const resetSearch = () => { searchForm.value = { keyword: '', status: '' }; pagination.value.page = 1; fetchPages() }
const handlePageChange = (page: number) => { pagination.value.page = page; fetchPages() }
const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这个页面吗？')) return
  try { await api.delete(`/pages/${id}`); alert('删除成功'); fetchPages() }
  catch (error) { console.error('删除失败:', error); alert('删除失败') }
}
const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('zh-CN')
onMounted(fetchPages)
</script>

<style scoped>
.page-list { max-width: 1400px; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.search-bar { display: flex; gap: 12px; margin-bottom: 24px; }
.search-bar .form-input, .search-bar .form-select { width: 200px; }
.status-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.status-active { background-color: #d4edda; color: #155724; }
.status-draft { background-color: #fff3cd; color: #856404; }
.pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 24px; }
.pagination-info { color: #666; font-size: 14px; }
</style>
