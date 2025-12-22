import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'system',
          name: 'System',
          meta: { title: '系统管理', permission: 'system:access' },
          children: [
            {
              path: 'users',
              name: 'Users',
              meta: { title: '用户管理', permission: 'user:list' },
              children: [
                {
                  path: '',
                  name: 'UserList',
                  component: () => import('@/views/users/UserList.vue')
                },
                {
                  path: 'create',
                  name: 'UserCreate',
                  component: () => import('@/views/users/UserForm.vue'),
                  meta: { title: '创建用户', permission: 'user:create' }
                },
                {
                  path: ':id/edit',
                  name: 'UserEdit',
                  component: () => import('@/views/users/UserForm.vue'),
                  meta: { title: '编辑用户', permission: 'user:update' }
                }
              ]
            },
            {
              path: 'roles',
              name: 'Roles',
              meta: { title: '角色管理', permission: 'role:list' },
              children: [
                {
                  path: '',
                  name: 'RoleList',
                  component: () => import('@/views/roles/RoleList.vue')
                },
                {
                  path: 'create',
                  name: 'RoleCreate',
                  component: () => import('@/views/roles/RoleForm.vue'),
                  meta: { title: '创建角色', permission: 'role:create' }
                },
                {
                  path: ':id/edit',
                  name: 'RoleEdit',
                  component: () => import('@/views/roles/RoleForm.vue'),
                  meta: { title: '编辑角色', permission: 'role:update' }
                }
              ]
            },
            {
              path: 'menus',
              name: 'Menus',
              meta: { title: '菜单管理', permission: 'menu:list' },
              children: [
                {
                  path: '',
                  name: 'MenuList',
                  component: () => import('@/views/menus/MenuList.vue')
                },
                {
                  path: 'create',
                  name: 'MenuCreate',
                  component: () => import('@/views/menus/MenuForm.vue'),
                  meta: { title: '创建菜单', permission: 'menu:create' }
                },
                {
                  path: ':id/edit',
                  name: 'MenuEdit',
                  component: () => import('@/views/menus/MenuForm.vue'),
                  meta: { title: '编辑菜单', permission: 'menu:update' }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // 检查是否需要认证
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
    return
  }

  // 检查权限
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission as string)) {
    next({ name: 'Dashboard' })
    return
  }

  // 已登录用户访问登录页，跳转到首页
  if (to.name === 'Login' && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }

  next()
})

export default router
