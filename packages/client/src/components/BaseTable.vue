<template>
  <div class="table-container">
    <!-- 表格头部工具栏 -->
    <div class="table-toolbar" v-if="showToolbar">
      <div class="toolbar-left">
        <slot name="toolbar-left">
          <button class="btn btn-primary" @click="$emit('add')">
            <span class="btn-icon">+</span>
            {{ addText }}
          </button>
        </slot>
      </div>
      <div class="toolbar-right">
        <slot name="toolbar-right">
          <!-- 搜索框 -->
          <div class="search-box" v-if="searchable">
            <input
              v-model="searchKeyword"
              type="text"
              class="form-input"
              :placeholder="searchPlaceholder"
              @input="handleSearch"
            />
            <button class="search-btn" @click="handleSearch">
              🔍
            </button>
          </div>
        </slot>
      </div>
    </div>

    <!-- 表格 -->
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="{
                'sortable': column.sortable,
                'text-left': column.align === 'left',
                'text-center': column.align === 'center',
                'text-right': column.align === 'right'
              }"
              @click="handleSort(column)"
            >
              {{ column.title }}
              <span
                v-if="column.sortable"
                class="sort-icon"
                :class="{
                  'sort-asc': sortBy === column.key && sortOrder === 'asc',
                  'sort-desc': sortBy === column.key && sortOrder === 'desc'
                }"
              >
                ⇅
              </span>
            </th>
            <th v-if="showActions" class="text-center">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="columnCount" class="text-center">
              <div class="loading-wrapper">
                <div class="loading-spinner"></div>
                <span>{{ loadingText }}</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="data.length === 0">
            <td :colspan="columnCount" class="text-center empty-state">
              <div class="empty-content">
                <div class="empty-icon">📭</div>
                <div class="empty-text">{{ emptyText }}</div>
                <button v-if="showEmptyAdd" class="btn btn-primary" @click="$emit('add')">
                  {{ addText }}
                </button>
              </div>
            </td>
          </tr>
          <tr v-else v-for="(item, index) in data" :key="getRowKey(item, index)">
            <!-- 数据列 -->
            <td
              v-for="column in columns"
              :key="column.key"
              :class="{
                'text-left': column.align === 'left',
                'text-center': column.align === 'center',
                'text-right': column.align === 'right'
              }"
            >
              <!-- 自定义插槽 -->
              <slot
                :name="`cell-${column.key}`"
                :record="item"
                :value="getNestedValue(item, column.key)"
                :index="index"
              >
                <!-- 默认渲染 -->
                <span v-if="column.render">
                  {{ column.render(getNestedValue(item, column.key), item) }}
                </span>
                <span v-else-if="column.type === 'status'">
                  <span
                    class="status-badge"
                    :class="{
                      'status-active': getNestedValue(item, column.key) === 1,
                      'status-inactive': getNestedValue(item, column.key) === 0
                    }"
                  >
                    {{ getNestedValue(item, column.key) === 1 ? '启用' : '禁用' }}
                  </span>
                </span>
                <span v-else-if="column.type === 'date'">
                  {{ formatDate(getNestedValue(item, column.key)) }}
                </span>
                <span v-else-if="column.type === 'datetime'">
                  {{ formatDateTime(getNestedValue(item, column.key)) }}
                </span>
                <span v-else>
                  {{ getNestedValue(item, column.key) }}
                </span>
              </slot>
            </td>
            <!-- 操作列 -->
            <td v-if="showActions" class="text-center">
              <slot name="actions" :record="item" :index="index">
                <button
                  class="btn btn-sm btn-link"
                  @click="$emit('edit', item, index)"
                  v-if="!hideEdit"
                >
                  编辑
                </button>
                <button
                  class="btn btn-sm btn-link btn-danger"
                  @click="$emit('delete', item, index)"
                  v-if="!hideDelete"
                >
                  删除
                </button>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 分页 -->
    <div class="table-pagination" v-if="showPagination && totalPages > 1">
      <div class="pagination-info">
        显示第 {{ (currentPage - 1) * pageSize + 1 }} 到第 {{ Math.min(currentPage * pageSize, total) }} 条，
        共 {{ total }} 条
      </div>
      <div class="pagination-controls">
        <button
          class="btn btn-sm"
          :disabled="currentPage <= 1"
          @click="$emit('page-change', currentPage - 1)"
        >
          上一页
        </button>
        <span class="pagination-current">{{ currentPage }} / {{ totalPages }}</span>
        <button
          class="btn btn-sm"
          :disabled="currentPage >= totalPages"
          @click="$emit('page-change', currentPage + 1)"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface TableColumn {
  key: string
  title: string
  type?: 'text' | 'status' | 'date' | 'datetime'
  align?: 'left' | 'center' | 'right'
  sortable?: boolean
  render?: (value: any, record: any) => string
  width?: string
}

interface Props {
  columns: TableColumn[]
  data: any[]
  loading?: boolean
  loadingText?: string
  emptyText?: string
  showEmptyAdd?: boolean
  showToolbar?: boolean
  showPagination?: boolean
  showActions?: boolean
  hideEdit?: boolean
  hideDelete?: boolean
  addText?: string
  searchable?: boolean
  searchPlaceholder?: string
  currentPage?: number
  pageSize?: number
  total?: number
  rowKey?: string | ((record: any, index: number) => string)
}

interface Emits {
  (e: 'add'): void
  (e: 'edit', record: any, index: number): void
  (e: 'delete', record: any, index: number): void
  (e: 'sort', key: string, order: 'asc' | 'desc'): void
  (e: 'search', keyword: string): void
  (e: 'page-change', page: number): void
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingText: '加载中...',
  emptyText: '暂无数据',
  showEmptyAdd: true,
  showToolbar: true,
  showPagination: true,
  showActions: true,
  hideEdit: false,
  hideDelete: false,
  addText: '新增',
  searchable: false,
  searchPlaceholder: '请输入关键词搜索',
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const emit = defineEmits<Emits>()

// 搜索关键词
const searchKeyword = ref('')

// 排序状态
const sortBy = ref('')
const sortOrder = ref<'asc' | 'desc'>('desc')

// 计算属性
const columnCount = computed(() => {
  return props.columns.length + (props.showActions ? 1 : 0)
})

const totalPages = computed(() => {
  return Math.ceil(props.total / props.pageSize)
})

// 获取嵌套对象的值
const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// 获取行键
const getRowKey = (record: any, index: number) => {
  if (typeof props.rowKey === 'string') {
    return record[props.rowKey]
  }
  if (typeof props.rowKey === 'function') {
    return props.rowKey(record, index)
  }
  return index
}

// 格式化日期
const formatDate = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (date: string | Date) => {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('zh-CN')
}

// 处理排序
const handleSort = (column: TableColumn) => {
  if (!column.sortable) return

  if (sortBy.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = column.key
    sortOrder.value = 'asc'
  }

  emit('sort', sortBy.value, sortOrder.value)
}

// 处理搜索
const handleSearch = () => {
  emit('search', searchKeyword.value)
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.toolbar-left {
  display: flex;
  gap: 12px;
}

.toolbar-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-box {
  display: flex;
  position: relative;
}

.search-box .form-input {
  width: 250px;
  padding-right: 40px;
}

.search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #f0f0f0;
}

.table th {
  background-color: #fafafa;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  user-select: none;
}

.table th.sortable {
  cursor: pointer;
  position: relative;
  padding-right: 24px;
}

.table th.sortable:hover {
  background-color: #f0f0f0;
}

.sort-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  font-size: 12px;
}

.sort-icon.sort-asc,
.sort-icon.sort-desc {
  color: #1890ff;
}

.table td {
  font-size: 14px;
  color: #666;
}

.table tbody tr:hover {
  background-color: #f5f5f5;
}

.text-left {
  text-align: left;
}

.text-center {
  text-align: center;
}

.text-right {
  text-align: right;
}

.btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-link {
  background: none;
  color: #1890ff;
  text-decoration: underline;
}

.btn-link:hover {
  color: #40a9ff;
}

.btn-danger {
  color: #ff4d4f;
}

.btn-danger:hover {
  color: #ff7875;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #999;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #1890ff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  padding: 40px 20px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-icon {
  font-size: 48px;
  opacity: 0.5;
}

.empty-text {
  color: #999;
  font-size: 14px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background-color: #f6ffed;
  color: #52c41a;
}

.status-inactive {
  background-color: #fff1f0;
  color: #ff4d4f;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pagination-current {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.btn-icon {
  margin-right: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>