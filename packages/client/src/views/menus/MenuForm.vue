<template>
  <BaseForm
    :title="isEdit ? '编辑菜单' : '创建菜单'"
    :form="form"
    :fields="formFields"
    :back-url="backUrl"
    :loading="loading"
    @submit="handleSubmit"
    @reset="resetForm"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/utils/api'
import BaseForm from '@/components/BaseForm.vue'
import type { CreateMenuDto, UpdateMenuDto, Menu } from '@types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const menuId = computed(() => parseInt(route.params.id as string))
const backUrl = '/system/menus'

// 表单数据
const form = ref<CreateMenuDto & UpdateMenuDto>({
  name: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  parentId: undefined,
  status: 1,
  type: 1,
  permission: ''
})

// 父级菜单数据
const parentMenus = ref<Menu[]>([])
const loading = ref(false)

// 动态表单字段配置
const formFields = computed(() => [
  [
    {
      key: 'name',
      type: 'text',
      label: '菜单名称',
      placeholder: '请输入菜单名称',
      required: true,
      validator: (value: string) => {
        if (!value) return '菜单名称不能为空'
        if (value.length < 2) return '菜单名称至少2个字符'
        return null
      }
    },
    {
      key: 'parentId',
      type: 'select',
      label: '父级菜单',
      options: [
        { label: '无（顶级菜单）', value: undefined },
        ...parentMenus.value.map(menu => ({
          label: menu.name,
          value: menu.id
        }))
      ]
    }
  ],
  [
    {
      key: 'path',
      type: 'text',
      label: '路径',
      placeholder: '例如：/system/users',
      validator: (value: string) => {
        if (value && !value.startsWith('/')) {
          return '路径必须以 / 开头'
        }
        return null
      }
    },
    {
      key: 'component',
      type: 'text',
      label: '组件路径',
      placeholder: '例如：system/users/index'
    }
  ],
  [
    {
      key: 'icon',
      type: 'text',
      label: '图标',
      placeholder: '例如：UserOutlined'
    },
    {
      key: 'sort',
      type: 'number',
      label: '排序',
      placeholder: '数字越小越靠前',
      min: 0,
      validator: (value: number) => {
        if (value < 0) return '排序值不能小于0'
        return null
      }
    }
  ],
  [
    {
      key: 'type',
      type: 'select',
      label: '类型',
      options: [
        { label: '菜单', value: 1 },
        { label: '按钮', value: 2 }
      ]
    },
    {
      key: 'status',
      type: 'select',
      label: '状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ],
  [
    {
      key: 'permission',
      type: 'text',
      label: '权限标识',
      placeholder: '例如：user:create',
      fullWidth: true,
      validator: (value: string) => {
        if (value && !/^[a-z]+:[a-z]+$/.test(value)) {
          return '权限标识格式应为 module:action，例如 user:create'
        }
        return null
      }
    }
  ]
])

// 获取父级菜单列表
const fetchParentMenus = async () => {
  try {
    const response = await api.get('/menus', { params: { pageSize: 100 } })
    parentMenus.value = response.data.data.items.filter((menu: Menu) => menu.type === 1)
  } catch (error) {
    console.error('获取父级菜单失败:', error)
  }
}

// 获取菜单信息（编辑时）
const fetchMenu = async () => {
  if (!isEdit.value) return

  try {
    const response = await api.get(`/menus/${menuId.value}`)
    const menu = response.data.data

    form.value = {
      name: menu.name,
      path: menu.path || '',
      component: menu.component || '',
      icon: menu.icon || '',
      sort: menu.sort,
      parentId: menu.parentId || undefined,
      status: menu.status,
      type: menu.type,
      permission: menu.permission || ''
    }
  } catch (error) {
    console.error('获取菜单信息失败:', error)
    alert('获取菜单信息失败')
  }
}

// 处理表单提交
const handleSubmit = async (formData: typeof form.value) => {
  try {
    loading.value = true

    // 数据处理
    const submitData = {
      ...formData,
      parentId: formData.parentId || null,
      sort: formData.sort || 0
    }

    if (isEdit.value) {
      await api.put(`/menus/${menuId.value}`, submitData)
      alert('更新成功')
    } else {
      await api.post('/menus', submitData)
      alert('创建成功')
    }

    router.push(backUrl)
  } catch (error: any) {
    console.error('保存菜单失败:', error)
    alert(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    parentId: undefined,
    status: 1,
    type: 1,
    permission: ''
  }
}

onMounted(() => {
  fetchParentMenus()
  fetchMenu()
})
</script>