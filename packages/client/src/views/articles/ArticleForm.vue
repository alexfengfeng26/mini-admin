<template>
  <div class="article-form">
    <div class="page-header">
      <h1 class="page-title">{{ isEdit ? '编辑文章' : '新增文章' }}</h1>
    </div>

    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label class="form-label">标题 <span class="required">*</span></label>
            <input
              v-model="form.title"
              type="text"
              class="form-input"
              placeholder="请输入文章标题"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Slug（URL友好名称）</label>
            <input
              v-model="form.slug"
              type="text"
              class="form-input"
              placeholder="自动生成，也可手动输入"
            />
            <small class="form-text">留空则自动从标题生成</small>
          </div>

          <div class="form-row">
            <div class="form-group" style="flex: 1;">
              <label class="form-label">分类</label>
              <select v-model="form.categoryId" class="form-select">
                <option value="">请选择分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group" style="flex: 1;">
              <label class="form-label">状态</label>
              <select v-model="form.status" class="form-select">
                <option :value="0">草稿</option>
                <option :value="1">已发布</option>
                <option :value="2">已下架</option>
              </select>
            </div>

            <div class="form-group" style="flex: 1;">
              <label class="form-label">推荐</label>
              <select v-model="form.featured" class="form-select">
                <option :value="false">普通</option>
                <option :value="true">推荐</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">摘要</label>
            <textarea
              v-model="form.excerpt"
              class="form-textarea"
              rows="3"
              placeholder="请输入文章摘要"
            ></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">封面图 URL</label>
            <input
              v-model="form.coverImage"
              type="text"
              class="form-input"
              placeholder="请输入封面图URL"
            />
          </div>

          <div class="form-group">
            <label class="form-label">标签</label>
            <input
              v-model="tagInput"
              type="text"
              class="form-input"
              placeholder="输入标签，用逗号分隔"
              @blur="handleTagInput"
            />
            <div v-if="form.tagNames && form.tagNames.length > 0" class="tag-list">
              <span
                v-for="(tag, index) in form.tagNames"
                :key="index"
                class="tag-badge"
              >
                {{ tag }}
                <button type="button" @click="removeTag(index)" class="tag-close">×</button>
              </span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">内容 <span class="required">*</span></label>
            <!-- TODO: 集成富文本编辑器（Tiptap） -->
            <textarea
              v-model="form.content"
              class="form-textarea"
              rows="15"
              placeholder="请输入文章内容"
              required
            ></textarea>
            <small class="form-text">富文本编辑器将在后续版本中集成</small>
          </div>

          <div class="form-section">
            <h3 class="form-section-title">SEO 设置</h3>

            <div class="form-group">
              <label class="form-label">SEO 标题</label>
              <input
                v-model="form.seoTitle"
                type="text"
                class="form-input"
                placeholder="留空则使用文章标题"
              />
            </div>

            <div class="form-group">
              <label class="form-label">SEO 描述</label>
              <textarea
                v-model="form.seoDescription"
                class="form-textarea"
                rows="2"
                placeholder="请输入SEO描述"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">SEO 关键词</label>
              <input
                v-model="form.seoKeywords"
                type="text"
                class="form-input"
                placeholder="多个关键词用逗号分隔"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary">
              {{ isEdit ? '更新' : '创建' }}
            </button>
            <button type="button" class="btn btn-secondary" @click="handleCancel">
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/utils/api'
import type { CreateArticleDto, Article } from '@types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const articleId = computed(() => route.params.id ? parseInt(route.params.id as string) : null)

const form = ref<CreateArticleDto>({
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  coverImage: '',
  categoryId: undefined,
  status: 0,
  featured: false,
  tagNames: [],
  seoTitle: '',
  seoDescription: '',
  seoKeywords: '',
  metadata: {}
})

const tagInput = ref('')
const categories = ref<any[]>([])

const fetchCategories = async () => {
  try {
    const response = await api.get('/categories', {
      params: { type: 'article', pageSize: 100 }
    })
    categories.value = response.data.data.items
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

const fetchArticle = async () => {
  if (!articleId.value) return

  try {
    const response = await api.get(`/articles/${articleId.value}`)
    const article = response.data.data

    form.value = {
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content,
      coverImage: article.coverImage || '',
      categoryId: article.categoryId || undefined,
      status: article.status,
      featured: article.featured,
      tagNames: article.tagNames || [],
      seoTitle: article.seoTitle || '',
      seoDescription: article.seoDescription || '',
      seoKeywords: article.seoKeywords || '',
      metadata: article.metadata || {}
    }
  } catch (error) {
    console.error('获取文章详情失败:', error)
    alert('获取文章详情失败')
  }
}

const handleTagInput = () => {
  if (!tagInput.value.trim()) return

  const tags = tagInput.value
    .split(',')
    .map(t => t.trim())
    .filter(t => t)

  form.value.tagNames = [...new Set([...form.value.tagNames, ...tags])]
  tagInput.value = ''
}

const removeTag = (index: number) => {
  form.value.tagNames?.splice(index, 1)
}

const handleSubmit = async () => {
  try {
    if (isEdit.value) {
      await api.put(`/articles/${articleId.value}`, form.value)
      alert('更新成功')
    } else {
      await api.post('/articles', form.value)
      alert('创建成功')
    }
    router.push('/articles')
  } catch (error: any) {
    console.error('提交失败:', error)
    alert(error.response?.data?.message || '提交失败')
  }
}

const handleCancel = () => {
  router.push('/articles')
}

onMounted(async () => {
  await fetchCategories()
  if (isEdit.value) {
    await fetchArticle()
  }
})
</script>

<style scoped>
.article-form {
  max-width: 900px;
}

.page-header {
  margin-bottom: 24px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.required {
  color: #dc3545;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
}

.form-text {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: #666;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  background-color: #e9ecef;
  border-radius: 16px;
  font-size: 13px;
}

.tag-close {
  background: none;
  border: none;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 16px;
  height: 16px;
}

.tag-close:hover {
  color: #dc3545;
}

.form-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}
</style>
