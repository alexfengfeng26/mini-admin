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
        <button class="btn btn-primary" @click="openCreateModal">+ 新增分类</button>
      </div>
      <table class="table" v-if="categories.length"><thead><tr><th>ID</th><th>名称</th><th>Slug</th><th>父分类</th><th>排序</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="cat in categories" :key="cat.id"><td>{{cat.id}}</td><td>{{cat.name}}</td><td>{{cat.slug}}</td><td>{{cat.parentName||'-'}}</td><td>{{cat.sort}}</td><td>{{cat.status?'启用':'禁用'}}</td><td><button class="btn btn-secondary" @click="editCategory(cat)">编辑</button><button class="btn btn-danger" @click="handleDelete(cat.id)">删除</button></td></tr></tbody></table>
      <div v-else style="text-align:center;padding:40px;color:#999">请选择类型查看分类</div>
    </div></div>

    <!-- Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h2>{{ editData ? '编辑分类' : '新增分类' }}</h2>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>名称 *</label>
            <input v-model="formData.name" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>Slug</label>
            <input v-model="formData.slug" type="text" class="form-input" placeholder="自动生成" />
          </div>
          <div class="form-group">
            <label>父分类</label>
            <select v-model="formData.parentId" class="form-select">
              <option :value="null">无</option>
              <option v-for="cat in categories.filter(c=>c.id!==formData.id)" :key="cat.id" :value="cat.id">{{cat.name}}</option>
            </select>
          </div>
          <div class="form-group">
            <label>排序</label>
            <input v-model.number="formData.sort" type="number" class="form-input" />
          </div>
          <div class="form-group">
            <label>状态</label>
            <select v-model="formData.status" class="form-select">
              <option :value="1">启用</option>
              <option :value="0">禁用</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">{{ editData ? '更新' : '创建' }}</button>
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api } from '@/utils/api'
const selectedType=ref('article'),categories=ref([])
const fetchCategories=async()=>{if(!selectedType.value)return;try{const r=await api.get('/categories',{params:{type:selectedType.value,pageSize:100}});categories.value=r.data.data.items}catch(e){console.error(e)}}
const showCreateModal=ref(false),editData=ref<any>(null)
const formData=ref({name:'',slug:'',parentId:null,sort:0,status:1})
const openCreateModal=()=>{editData.value=null;formData.value={name:'',slug:'',parentId:null,sort:0,status:1};showCreateModal.value=true}
const closeModal=()=>{showCreateModal.value=false;formData.value={name:'',slug:'',parentId:null,sort:0,status:1}}
const editCategory=(cat:any)=>{editData.value={...cat};formData.value={...cat};showCreateModal.value=true}
const handleSubmit=async()=>{try{if(editData.value){await api.put(`/categories/${editData.value.id}`,{...formData.value,type:selectedType.value})}else{formData.value.type=selectedType.value;await api.post('/categories',formData.value)}closeModal();fetchCategories()}catch(e){console.error(e)}}
const handleDelete=async(id:number)=>{if(!confirm('确定删除?'))return;try{await api.delete(`/categories/${id}`);fetchCategories()}catch(e){console.error(e)}}
onMounted(fetchCategories)
</script>

<style scoped>
.category-manage{max-width:1200px}.page-header{margin-bottom:24px}.form-row{display:flex;gap:12px}.form-group{margin-bottom:16px}.form-group label{display:block;margin-bottom:4px;font-weight:500}.form-input,.form-select{width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;box-sizing:border-box}.form-actions{display:flex;gap:12px;margin-top:24px}.modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000}.modal-content{background:white;padding:24px;border-radius:8px;width:100%;max-width:500px;box-shadow:0 4px 6px rgba(0,0,0,0.1)}.modal-content h2{margin-top:0;margin-bottom:20px}.table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.btn{padding:6px 12px;margin-right:8px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background:#007bff;color:#fff}.btn-secondary{background:#6c757d;color:#fff}.btn-danger{background:#dc3545;color:#fff}
</style>
