<template>
  <BaseForm
    :title="isEdit ? '编辑用户' : '创建用户'"
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
import type { CreateUserDto, UpdateUserDto, Role } from '@types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const userId = computed(() => parseInt(route.params.id as string))
const backUrl = '/system/users'

// 表单数据
const form = ref<CreateUserDto & UpdateUserDto>({
  username: '',
  email: '',
  password: '',
  nickname: '',
  phone: '',
  status: 1,
  roleIds: []
})

// 动态表单字段配置
const formFields = computed(() => [
  [
    {
      key: 'username',
      type: 'text',
      label: '用户名',
      placeholder: '请输入用户名',
      required: true,
      disabled: isEdit.value,
      validator: (value: string) => {
        if (!value) return '用户名不能为空'
        if (value.length < 3) return '用户名至少3个字符'
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return '用户名只能包含字母、数字和下划线'
        return null
      }
    },
    {
      key: 'email',
      type: 'email',
      label: '邮箱',
      placeholder: '请输入邮箱',
      required: true,
      validator: (value: string) => {
        if (!value) return '邮箱不能为空'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) return '请输入有效的邮箱地址'
        return null
      }
    }
  ],
  [
    {
      key: 'nickname',
      type: 'text',
      label: '昵称',
      placeholder: '请输入昵称'
    },
    {
      key: 'phone',
      type: 'text',
      label: '手机号',
      placeholder: '请输入手机号',
      validator: (value: string) => {
        if (value && !/^1[3-9]\d{9}$/.test(value)) {
          return '请输入有效的手机号'
        }
        return null
      }
    }
  ],
  [
    {
      key: 'password',
      type: 'password',
      label: isEdit.value ? '新密码' : '密码',
      placeholder: isEdit.value ? '留空表示不修改密码' : '请输入密码',
      required: !isEdit.value,
      validator: (value: string) => {
        if (!isEdit.value && !value) return '密码不能为空'
        if (value && value.length < 6) return '密码至少6个字符'
        return null
      }
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
      key: 'roleIds',
      type: 'checkbox',
      label: '分配角色',
      options: roles.value.map(role => ({
        label: role.name,
        value: role.id
      })),
      validator: (value: number[]) => {
        if (value.length === 0) return '请至少选择一个角色'
        return null
      }
    }
  ]
])

// 角色数据
const roles = ref<Role[]>([])
const loading = ref(false)

// 获取角色列表
const fetchRoles = async () => {
  try {
    const response = await api.get('/roles', { params: { pageSize: 100 } })
    roles.value = response.data.data.items
  } catch (error) {
    console.error('获取角色列表失败:', error)
  }
}

// 获取用户信息（编辑时）
const fetchUser = async () => {
  if (!isEdit.value) return

  try {
    const response = await api.get(`/users/${userId.value}`)
    const user = response.data.data

    form.value = {
      username: user.username,
      email: user.email,
      password: '',
      nickname: user.nickname,
      phone: user.phone,
      status: user.status,
      roleIds: user.userRoles?.map((ur: any) => ur.role.id) || []
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    alert('获取用户信息失败')
  }
}

// 处理表单提交
const handleSubmit = async (formData: typeof form.value) => {
  try {
    loading.value = true

    if (isEdit.value) {
      // 编辑时，密码为空表示不修改密码
      const updateData = { ...formData }
      if (!updateData.password) {
        delete updateData.password
      }
      await api.put(`/users/${userId.value}`, updateData)
      alert('更新成功')
    } else {
      await api.post('/users', formData)
      alert('创建成功')
    }

    router.push(backUrl)
  } catch (error: any) {
    console.error('保存用户失败:', error)
    alert(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    password: '',
    nickname: '',
    phone: '',
    status: 1,
    roleIds: []
  }
}

onMounted(() => {
  fetchRoles()
  fetchUser()
})
</script>