<template>
  <div class="product-list">
    <div class="page-header"><h1 class="page-title">产品管理</h1><router-link to="/cms/products/create" class="btn btn-primary">+ 新增产品</router-link></div>
    <div class="card"><div class="card-body">
      <div class="search-bar"><input v-model="searchForm.keyword" placeholder="搜索名称" class="form-input" /><select v-model="searchForm.status" class="form-select"><option value="">全部</option><option value="0">下架</option><option value="1">上架</option><option value="2">缺货</option></select><button class="btn btn-secondary" @click="fetch">搜索</button></div>
      <table class="table"><thead><tr><th>ID</th><th>名称</th><th>编码</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th></tr></thead><tbody><tr v-for="p in products" :key="p.id"><td>{{p.id}}</td><td>{{p.name}}</td><td>{{p.code}}</td><td>{{p.price||'-'}}</td><td>{{p.stock}}</td><td><span :class="['badge',p.status===1?'badge-success':p.status===2?'badge-warning':'badge-secondary']">{{p.status===1?'上架':p.status===2?'缺货':'下架'}}</span></td><td><router-link :to="`/cms/products/${p.id}/edit`" class="btn btn-secondary">编辑</router-link><button class="btn btn-danger" @click="handleDelete(p.id)">删除</button></td></tr></tbody></table>
      <div class="pagination"><button :disabled="pagination.page<=1" @click="pagination.page--">上一页</button><span>第{{pagination.page}}页</span><button :disabled="pagination.page>=pagination.totalPages" @click="pagination.page++">下一页</button></div>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted } from 'vue'
import { api } from '@/utils/api'
import type { ProductListItem,PaginatedResponse } from '@types'
const products=ref<ProductListItem[]>([]),pagination=ref({total:0,page:1,pageSize:10,totalPages:0}),searchForm=ref({keyword:'',status:''})
const fetch=async()=>{try{const params:any={page:pagination.value.page,pageSize:pagination.value.pageSize};if(searchForm.value.keyword)params.keyword=searchForm.value.keyword;if(searchForm.value.status!=='')params.status=parseInt(searchForm.value.status);const r=await api.get<PaginatedResponse<ProductListItem>>('/products',{params});products.value=r.data.data.items;pagination.value=r.data.data}catch(e){console.error(e)}}
const handleDelete=async(id:number)=>{if(!confirm('确定删除?'))return;try{await api.delete(`/products/${id}`);fetch()}catch(e){console.error(e)}}
onMounted(fetch)
</script>

<style scoped>
.product-list{max-width:1400px}.page-header{display:flex;justify-content:space-between;margin-bottom:24px}.search-bar{display:flex;gap:12px;margin-bottom:24px}.form-input,.form-select{padding:8px;border:1px solid #ddd;border-radius:4px}.badge{padding:4px 8px;border-radius:4px;font-size:12px}.badge-success{background:#d4edda;color:#155724}.badge-warning{background:#ffc107;color:#000}.badge-secondary{background:#6c757d;color:#fff}.table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}.btn{padding:6px 12px;margin-right:8px;border:none;border-radius:4px;cursor:pointer}.btn-secondary{background:#6c757d;color:#fff}.btn-danger{background:#dc3545;color:#fff}.btn-primary{background:#007bff;color:#fff}.pagination{display:flex;gap:16px;justify-content:center;margin-top:24px}
</style>
