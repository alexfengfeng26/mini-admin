<template>
  <div class="product-form">
    <div class="page-header"><h1>{{isEdit?'编辑':'新增'}}产品</h1></div>
    <div class="card"><div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="form-group"><label>产品名称 <span class="required">*</span></label><input v-model="form.name" class="form-input" required /></div>
        <div class="form-row"><div class="form-group"><label>产品编码 <span class="required">*</span></label><input v-model="form.code" class="form-input" required /></div><div class="form-group"><label>价格</label><input v-model.number="form.price" type="number" step="0.01" class="form-input" /></div><div class="form-group"><label>库存</label><input v-model.number="form.stock" type="number" class="form-input" /></div></div>
        <div class="form-group"><label>分类</label><select v-model="form.categoryId" class="form-select"><option value="">请选择</option><option v-for="c in categories" :key="c.id" :value="c.id">{{c.name}}</option></select></div>
        <div class="form-group"><label>描述</label><textarea v-model="form.description" class="form-textarea" rows="5"></textarea></div>
        <div class="form-group"><label>图片URLs（逗号分隔）</label><input v-model="imagesInput" class="form-input" placeholder="http://..." /></div>
        <div class="form-group"><label>标签</label><input v-model="tagInput" class="form-input" placeholder="标签,逗号分隔" @blur="handleTags" /></div>
        <div class="form-actions"><button type="submit" class="btn btn-primary">{{isEdit?'更新':'创建'}}</button><button type="button" class="btn btn-secondary" @click="$router.push('/products')">取消</button></div>
      </form>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted,computed } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { api } from '@/utils/api'
const route=useRoute(),router=useRouter(),isEdit=computed(()=>!!route.params.id)
const form=ref({name:'',code:'',slug:'',description:'',price:undefined,stock:0,categoryId:undefined,status:1,images:[] as string[],tagNames:[]})
const imagesInput=ref(''),tagInput=ref(''),categories=ref([])
const handleTags=()=>{if(!tagInput.value)return;form.value.tagNames=[...new Set([...form.value.tagNames,...tagInput.value.split(',').map(t=>t.trim()).filter(t=>t)])];tagInput.value=''}
const handleSubmit=async()=>{try{if(imagesInput.value)form.value.images=imagesInput.value.split(',').map(s=>s.trim());isEdit.value?await api.put(`/products/${route.params.id}`,form.value):await api.post('/products',form.value);alert('成功');router.push('/products')}catch(e:any){alert(e.response?.data?.message||'失败')}}
onMounted(async()=>{const c=await api.get('/categories',{params:{type:'product',pageSize:100}});categories.value=c.data.data.items;if(isEdit.value){const p=await api.get(`/products/${route.params.id}`);Object.assign(form.value,p.data.data);if(p.data.data.images)imagesInput.value=p.data.data.images.join(',')}})
</script>

<style scoped>
.product-form{max-width:900px}.page-header{margin-bottom:24px}.form-row{display:flex;gap:16px}.form-group{margin-bottom:20px}.form-group>label{display:block;margin-bottom:8px;font-weight:500}.required{color:#dc3545}.form-input,.form-select,.form-textarea{width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:4px}.form-textarea{resize:vertical}.form-actions{display:flex;gap:12px;margin-top:24px}.btn{padding:10px 24px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background:#007bff;color:#fff}.btn-secondary{background:#6c757d;color:#fff}
</style>
