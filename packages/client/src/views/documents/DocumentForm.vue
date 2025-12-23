<template>
  <div class="document-form">
    <div class="page-header"><h1>{{isEdit?'编辑':'新增'}}文档</h1></div>
    <div class="card"><div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="form-group"><label>标题 <span class="required">*</span></label><input v-model="form.title" class="form-input" required /></div>
        <div class="form-row"><div class="form-group"><label>版本 <span class="required">*</span></label><input v-model="form.version" class="form-input" required /></div><div class="form-group"><label>文件大小</label><input v-model.number="form.fileSize" type="number" class="form-input" /></div></div>
        <div class="form-group"><label>分类</label><select v-model="form.categoryId" class="form-select"><option value="">请选择</option><option v-for="c in categories" :key="c.id" :value="c.id">{{c.name}}</option></select></div>
        <div class="form-group"><label>文件URL</label><input v-model="form.fileUrl" class="form-input" placeholder="http://..." /></div>
        <div class="form-group"><label>内容 <span class="required">*</span></label><textarea v-model="form.content" class="form-textarea" rows="12" required></textarea></div>
        <div class="form-group"><label>标签</label><input v-model="tagInput" class="form-input" placeholder="标签,逗号分隔" @blur="handleTags" /></div>
        <div class="form-actions"><button type="submit" class="btn btn-primary">{{isEdit?'更新':'创建'}}</button><button type="button" class="btn btn-secondary" @click="$router.push('/cms/documents')">取消</button></div>
      </form>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted,computed } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { api } from '@/utils/api'
const route=useRoute(),router=useRouter(),isEdit=computed(()=>!!route.params.id)
const form=ref({title:'',slug:'',content:'',version:'',categoryId:undefined,fileUrl:'',fileSize:undefined,status:0,tagNames:[]})
const tagInput=ref(''),categories=ref([])
const handleTags=()=>{if(!tagInput.value)return;form.value.tagNames=[...new Set([...form.value.tagNames,...tagInput.value.split(',').map(t=>t.trim()).filter(t=>t)])];tagInput.value=''}
const handleSubmit=async()=>{try{isEdit.value?await api.put(`/documents/${route.params.id}`,form.value):await api.post('/documents',form.value);alert('成功');router.push('/cms/documents')}catch(e:any){alert(e.response?.data?.message||'失败')}}
onMounted(async()=>{const c=await api.get('/categories',{params:{type:'document',pageSize:100}});categories.value=c.data.data.items;if(isEdit.value){const d=await api.get(`/documents/${route.params.id}`);Object.assign(form.value,d.data.data)}})
</script>

<style scoped>
.document-form{max-width:900px}.page-header{margin-bottom:24px}.form-row{display:flex;gap:16px}.form-group{margin-bottom:20px}.form-group>label{display:block;margin-bottom:8px;font-weight:500}.required{color:#dc3545}.form-input,.form-select,.form-textarea{width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:4px}.form-textarea{resize:vertical}.form-actions{display:flex;gap:12px;margin-top:24px}.btn{padding:10px 24px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background:#007bff;color:#fff}.btn-secondary{background:#6c757d;color:#fff}
</style>
