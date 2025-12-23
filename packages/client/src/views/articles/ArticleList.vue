<template>
  <div class="article-list">
    <!-- 权限不足提示 -->
    <PermissionDenied v-if="isPermissionDenied" requiredPermission="article:list" />

    <template v-else>
      <div class="page-header">
        <h1 class="page-title">文章管理</h1>
        <router-link to="/articles/create" class="btn btn-primary">
          + 新增文章
        </router-link>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="search-bar">
            <input
              v-model="searchForm.keyword"
              type="text"
              class="form-input"
              placeholder="搜索标题或内容"
            />
            <select v-model="searchForm.status" class="form-select">
              <option value="">全部状态</option>
              <option value="0">草稿</option>
              <option value="1">已发布</option>
              <option value="2">已下架</option>
            </select>
            <select v-model="searchForm.featured" class="form-select">
              <option value="">是否推荐</option>
              <option value="true">推荐</option>
              <option value="false">普通</option>
            </select>
            <button class="btn btn-secondary" @click="handleSearch">搜索</button>
            <button class="btn btn-secondary" @click="resetSearch">重置</button>
          </div>

          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>标题</th>
                <th>分类</th>
                <th>作者</th>
                <th>状态</th>
                <th>推荐</th>
                <th>浏览</th>
                <th>发布时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in articles" :key="article.id">
                <td>{{ article.id }}</td>
                <td>
                  <div>{{ article.title }}</div>
                  <small style="color: #999;">{{ article.slug }}</small>
                </td>
                <td>{{ article.category || '-' }}</td>
                <td>{{ article.author }}</td>
                <td>
                  <span
                    :class="[
                      'status-badge',
                      article.status === 1 ? 'status-active' :
                      article.status === 0 ? 'status-draft' : 'status-inactive'
                    ]"
                  >
                    {{ article.status === 1 ? '已发布' : article.status === 0 ? '草稿' : '已下架' }}
                  </span>
                </td>
                <td>
                  <span v-if="article.featured" class="badge badge-warning">推荐</span>
                  <span v-else class="badge badge-secondary">普通</span>
                </td>
                <td>{{ article.viewCount }}</td>
                <td>{{ formatDate(article.publishedAt) }}</td>
                <td>
                  <router-link
                    :to="`/articles/${article.id}/edit`"
                    class="btn btn-secondary"
                    style="margin-right: 8px;"
                  >
                    编辑
                  </router-link>
                  <button
                    class="btn btn-danger"
                    @click="handleDelete(article.id)"
                  >
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
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
import PermissionDenied from '@/components/PermissionDenied.vue'
import { useApiError } from '@/composables/useErrorHandler'
import type { ArticleListItem, PaginatedResponse } from '@types'

const articles = ref<ArticleListItem[]>([])
const pagination = ref({
  total: 0,
  page: 1,
  pageSize: 10,
  totalPages: 0
})

const searchForm = ref({
  keyword: '',
  status: '',
  featured: ''
})

const { isPermissionDenied, handleError } = useApiError()

const fetchArticles = async () => {
  try {
    const params: any = {
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }

    if (searchForm.value.keyword) params.keyword = searchForm.value.keyword
    if (searchForm.value.status !== '') params.status = parseInt(searchForm.value.status)
    if (searchForm.value.featured !== '') {
      params.featured = searchForm.value.featured === 'true'
    }

    const response = await api.get<PaginatedResponse<ArticleListItem>>('/articles', {
      params
    })

    articles.value = response.data.data.items
    pagination.value = response.data.data
  } catch (error) {
    handleError(error, '获取文章列表失败')
  }
}

const handleSearch = () => {
  pagination.value.page = 1
  fetchArticles()
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    status: '',
    featured: ''
  }
  pagination.value.page = 1
  fetchArticles()
}

const handlePageChange = (page: number) => {
  pagination.value.page = page
  fetchArticles()
}

const handleDelete = async (id: number) => {
  if (!confirm('确定要删除这篇文章吗？')) return

  try {
    await api.delete(`/articles/${id}`)
    alert('删除成功')
    fetchArticles()
  } catch (error) {
    console.error('删除文章失败:', error)
    alert('删除文章失败')
  }
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  fetchArticles()
})
</script>

<style scoped>
.article-list {
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

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #d4edda;
  color: #155724;
}

.status-draft {
  background-color: #fff3cd;
  color: #856404;
}

.status-inactive {
  background-color: #f8d7da;
  color: #721c24;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.badge-warning {
  background-color: #ffc107;
  color: #000;
}

.badge-secondary {
  background-color: #6c757d;
  color: #fff;
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
