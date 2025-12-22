<template>
  <BaseForm
    :title="isEdit ? '编辑角色' : '创建角色'"
    :form="form"
    :fields="formFields"
    :back-url="backUrl"
    :loading="loading"
    @submit="handleSubmit"
    @reset="resetForm"
  >
    <template #custom-fields>
      <!-- 菜单权限字段需要特殊处理 -->
      <div class="form-group">
        <label class="form-label">菜单权限</label>
        <div class="menu-tree">
          <div
            v-for="menu in menuTree"
            :key="menu.id"
            class="menu-item"
          >
            <label class="checkbox-label">
              <input
                type="checkbox"
                :value="menu.id"
                v-model="form.menuIds"
                @change="handleParentChange(menu)"
              />
              {{ menu.name }}
            </label>
            <div
              v-if="menu.children && menu.children.length > 0"
              class="menu-children"
            >
              <div
                v-for="child in menu.children"
                :key="child.id"
                class="menu-child-item"
              >
                <label class="checkbox-label">
                  <input
                    type="checkbox"
                    :value="child.id"
                    v-model="form.menuIds"
                  />
                  {{ child.name }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </BaseForm>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/utils/api'
import BaseForm from '@/components/BaseForm.vue'
import type { CreateRoleDto, UpdateRoleDto, Menu } from '@types'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => !!route.params.id)
const roleId = computed(() => parseInt(route.params.id as string))
const backUrl = '/roles'

// 表单数据
const form = ref<CreateRoleDto & UpdateRoleDto>({
  name: '',
  code: '',
  description: '',
  status: 1,
  menuIds: []
})

// 动态表单字段配置
const formFields = computed(() => [
  [
    {
      key: 'name',
      type: 'text',
      label: '角色名称',
      placeholder: '请输入角色名称',
      required: true,
      validator: (value: string) => {
        if (!value) return '角色名称不能为空'
        if (value.length < 2) return '角色名称至少2个字符'
        return null
      }
    },
    {
      key: 'code',
      type: 'text',
      label: '角色编码',
      placeholder: '请输入角色编码',
      required: true,
      disabled: isEdit.value,
      validator: (value: string) => {
        if (!value) return '角色编码不能为空'
        if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
          return '角色编码必须以字母开头，只能包含字母、数字和下划线'
        }
        return null
      }
    }
  ],
  [
    {
      key: 'description',
      type: 'textarea',
      label: '描述',
      placeholder: '请输入角色描述',
      rows: 3,
      fullWidth: true
    }
  ],
  [
    {
      key: 'status',
      type: 'select',
      label: '状态',
      options: [
        { label: '启用', value: 1 },
        { label: '禁用', value: 0 }
      ]
    }
  ]
])

// 菜单树数据
const menuTree = ref<Menu[]>([])
const loading = ref(false)

// 获取菜单树
const fetchMenuTree = async () => {
  try {
    const response = await api.get('/menus/tree')
    menuTree.value = response.data.data
  } catch (error) {
    console.error('获取菜单树失败:', error)
  }
}

// 获取角色信息（编辑时）
const fetchRole = async () => {
  if (!isEdit.value) return

  try {
    const response = await api.get(`/roles/${roleId.value}`)
    const role = response.data.data

    form.value = {
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status,
      menuIds: role.roleMenus?.map((rm: any) => rm.menu.id) || []
    }
  } catch (error) {
    console.error('获取角色信息失败:', error)
    alert('获取角色信息失败')
  }
}

// 处理父级菜单变化（自动选中/取消子菜单）
const handleParentChange = (parentMenu: Menu) => {
  if (parentMenu.children && parentMenu.children.length > 0) {
    const isParentSelected = form.value.menuIds.includes(parentMenu.id)
    const childIds = parentMenu.children.map(child => child.id)

    if (isParentSelected) {
      // 父级被选中，自动选中所有子级
      childIds.forEach(id => {
        if (!form.value.menuIds.includes(id)) {
          form.value.menuIds.push(id)
        }
      })
    } else {
      // 父级被取消，自动取消所有子级
      form.value.menuIds = form.value.menuIds.filter(id => !childIds.includes(id))
    }
  }
}

// 处理表单提交
const handleSubmit = async (formData: typeof form.value) => {
  try {
    loading.value = true

    if (isEdit.value) {
      await api.put(`/roles/${roleId.value}`, formData)
      alert('更新成功')
    } else {
      await api.post('/roles', formData)
      alert('创建成功')
    }

    router.push(backUrl)
  } catch (error: any) {
    console.error('保存角色失败:', error)
    alert(error.response?.data?.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.value = {
    name: '',
    code: '',
    description: '',
    status: 1,
    menuIds: []
  }
}

onMounted(() => {
  fetchMenuTree()
  fetchRole()
})
</script>

<style scoped>
.menu-tree {
  padding: 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
}

.menu-item {
  margin-bottom: 8px;
}

.menu-children {
  margin-left: 24px;
  margin-top: 4px;
}

.menu-child-item {
  margin-bottom: 4px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  cursor: pointer;
}

.form-group-full {
  grid-column: 1 / -1;
}
</style>