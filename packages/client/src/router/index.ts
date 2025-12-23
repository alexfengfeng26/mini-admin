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
          path: 'cms',
          name: 'CMS',
          meta: { title: '内容管理', permission: 'cms:access' },
          children: [
            {
              path: 'articles',
              name: 'Articles',
              meta: { title: '文章管理', permission: 'article:list' },
              children: [
                {
                  path: '',
                  name: 'ArticleList',
                  component: () => import('@/views/articles/ArticleList.vue')
                },
                {
                  path: 'create',
                  name: 'ArticleCreate',
                  component: () => import('@/views/articles/ArticleForm.vue'),
                  meta: { title: '新增文章', permission: 'article:create' }
                },
                {
                  path: ':id/edit',
                  name: 'ArticleEdit',
                  component: () => import('@/views/articles/ArticleForm.vue'),
                  meta: { title: '编辑文章', permission: 'article:update' }
                }
              ]
            },
            {
              path: 'pages',
              name: 'Pages',
              meta: { title: '页面管理', permission: 'page:list' },
              children: [
                {
                  path: '',
                  name: 'PageList',
                  component: () => import('@/views/pages/PageList.vue')
                },
                {
                  path: 'create',
                  name: 'PageCreate',
                  component: () => import('@/views/pages/PageForm.vue'),
                  meta: { title: '新增页面', permission: 'page:create' }
                },
                {
                  path: ':id/edit',
                  name: 'PageEdit',
                  component: () => import('@/views/pages/PageForm.vue'),
                  meta: { title: '编辑页面', permission: 'page:update' }
                }
              ]
            },
            {
              path: 'products',
              name: 'Products',
              meta: { title: '产品管理', permission: 'product:list' },
              children: [
                {
                  path: '',
                  name: 'ProductList',
                  component: () => import('@/views/products/ProductList.vue')
                },
                {
                  path: 'create',
                  name: 'ProductCreate',
                  component: () => import('@/views/products/ProductForm.vue'),
                  meta: { title: '新增产品', permission: 'product:create' }
                },
                {
                  path: ':id/edit',
                  name: 'ProductEdit',
                  component: () => import('@/views/products/ProductForm.vue'),
                  meta: { title: '编辑产品', permission: 'product:update' }
                }
              ]
            },
            {
              path: 'documents',
              name: 'Documents',
              meta: { title: '文档管理', permission: 'document:list' },
              children: [
                {
                  path: '',
                  name: 'DocumentList',
                  component: () => import('@/views/documents/DocumentList.vue')
                },
                {
                  path: 'create',
                  name: 'DocumentCreate',
                  component: () => import('@/views/documents/DocumentForm.vue'),
                  meta: { title: '新增文档', permission: 'document:create' }
                },
                {
                  path: ':id/edit',
                  name: 'DocumentEdit',
                  component: () => import('@/views/documents/DocumentForm.vue'),
                  meta: { title: '编辑文档', permission: 'document:update' }
                }
              ]
            },
            {
              path: 'categories',
              name: 'Categories',
              meta: { title: '分类管理', permission: 'category:list' },
              component: () => import('@/views/categories/CategoryManage.vue')
            },
            {
              path: 'tags',
              name: 'Tags',
              meta: { title: '标签管理', permission: 'tag:list' },
              component: () => import('@/views/tags/TagManage.vue')
            }
          ]
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
