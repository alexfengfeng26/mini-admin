<template>
  <div class="page-form">
    <div class="page-header"><h1 class="page-title">{{ isEdit ? '编辑页面' : '新增页面' }}</h1></div>
    <div class="card"><div class="card-body">
      <form @submit.prevent="handleSubmit">
        <div class="form-group"><label class="form-label">标题 <span class="required">*</span></label><input v-model="form.title" type="text" class="form-input" required /></div>
        <div class="form-row">
          <div class="form-group" style="flex:1"><label class="form-label">Slug</label><input v-model="form.slug" type="text" class="form-input" /></div>
          <div class="form-group" style="flex:1"><label class="form-label">模板</label><input v-model="form.template" type="text" class="form-input" placeholder="例如: default, home" /></div>
        </div>
        <div class="form-group"><label class="form-label">分类</label><select v-model="form.categoryId" class="form-select"><option value="">请选择</option><option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option></select></div>
        <div class="form-group"><label class="form-label">内容 <span class="required">*</span></label><textarea v-model="form.content" class="form-textarea" rows="15" required></textarea></div>
        <div class="form-group"><label class="form-label">标签</label><input v-model="tagInput" type="text" class="form-input" placeholder="输入标签，用逗号分隔" @blur="handleTagInput" /><div v-if="form.tagNames?.length" class="tag-list"><span v-for="(tag,i) in form.tagNames" :key="i" class="tag-badge">{{ tag }}<button type="button" @click="removeTag(i)" class="tag-close">×</button></span></div></div>
        <div class="form-actions"><button type="submit" class="btn btn-primary">{{ isEdit ? '更新' : '创建' }}</button><button type="button" class="btn btn-secondary" @click="$router.push('/pages')">取消</button></div>
      </form>
    </div></div>
  </div>
</template>

<script setup lang="ts">
import { ref,onMounted,computed } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import { api } from '@/utils/api'
const route=useRoute(),router=useRouter()
const isEdit=computed(()=>!!route.params.id)
const form=ref({title:'',slug:'',content:'',template:'',categoryId:undefined,status:0,tagNames:[],seoTitle:'',seoDescription:'',seoKeywords:'',metadata:{}})
const tagInput=ref(''),categories=ref([])
const handleTagInput=()=>{if(!tagInput.value.trim())return;const tags=tagInput.value.split(',').map(t=>t.trim()).filter(t=>t);form.value.tagNames=[...new Set([...(form.value.tagNames||[]),...tags])];tagInput.value=''}
const removeTag=(i:number)=>form.value.tagNames?.splice(i,1)
const handleSubmit=async()=>{try{isEdit.value?await api.put(`/pages/${route.params.id}`,form.value):await api.post('/pages',form.value);alert('成功');router.push('/pages')}catch(e:any){alert(e.response?.data?.message||'失败')}}
onMounted(async()=>{const c=await api.get('/categories',{params:{type:'page',pageSize:100}});categories.value=c.data.data.items;if(isEdit.value){const a=await api.get(`/pages/${route.params.id}`);Object.assign(form.value,a.data.data)}})
</script>

<style scoped>
.page-form{max-width:900px}.page-header{margin-bottom:24px}.form-row{display:flex;gap:16px}.form-group{margin-bottom:20px}.form-label{display:block;margin-bottom:8px;font-weight:500}.required{color:#dc3545}.form-input,.form-select,.form-textarea{width:100%;padding:8px 12px;border:1px solid #ddd;border-radius:4px}.form-textarea{resize:vertical;font-family:inherit}.tag-list{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.tag-badge{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:#e9ecef;border-radius:16px;font-size:13px}.tag-close{background:none;border:none;font-size:18px;cursor:pointer;color:#666;padding:0;width:16px;height:16px}.form-actions{display:flex;gap:12px;margin-top:32px}.btn{padding:10px 24px;border:none;border-radius:4px;cursor:pointer}.btn-primary{background:#007bff;color:#fff}.btn-secondary{background:#6c757d;color:#fff}
</style>
