<template>
  <div class="category-manage">
    <div class="page-header"><h1 class="page-title">分类管理</h1></div>
    <div class="card"><div class="card-body">
      <div class="form-row" style="margin-bottom:24px;">
        <select v-model="selectedType" class="form-select" style="width:200px" @change="fetchCategories">
          <option value="">选择类型</option>
          <option value="article">文章</option>
          <option value="page">页面</option>
          <option value="product">产品</option>
          <option value="document">文档</option>
        </select>
        <button class="btn btn-primary" @click="showCreateModal=true">+ 新增分类</button>
      </div>
      <table class="table" v-if="categories.length"><thead><tr><th>ID</th><th>名称</th><th>Slug</th><th>父分类</th><th>排序</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="cat in categories" :key="cat.id"><td>{{cat.id}}</td><td>{{cat.name}}</td><td>{{cat.slug}}</td><td>{{cat.parentName||'-'}}</td><td>{{cat.sort}}</td><td>{{cat.status?'启用':'禁用'}}</td><td><button class="btn btn-secondary" @click="editCategory(cat)">编辑</button><button class="btn btn-danger" @click="handleDelete(cat.id)">删除</button></td></tr></tbody></table>
      <div v-else style="text-align:center;padding:40px;color:#999">请选择类型查看分类</div>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/utils/api'
const selectedType=ref(''),categories=ref([])
const fetchCategories=async()=>{if(!selectedType.value)return;try{const r=await api.get('/categories',{params:{type:selectedType.value,pageSize:100}});categories.value=r.data.data.items}catch(e){console.error(e)}}
const showCreateModal=ref(false),editData=ref<any>(null)
const editCategory=(cat:any)=>{editData.value={...cat};showCreateModal.value=true}
const handleDelete=async(id:number)=>{if(!confirm('确定删除?'))return;try{await api.delete(`/categories/${id}`);fetchCategories()}catch(e){console.error(e)}}
</script>

<style scoped>
.category-manage{max-width:1200px}.page-header{margin-bottom:24px}.form-row{display:flex;gap:12px}.form-select{padding:8px;border:1px solid #ddd;border-radius:4px}.table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.btn{padding:6px 12px;margin-right:8px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background:#007bff;color:#fff}.btn-secondary{background:#6c757d;color:#fff}.btn-danger{background:#dc3545;color:#fff}
</style>
