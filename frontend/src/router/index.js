import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { measureRouteChange } from '@/utils/performance'
import { beforePageLeave, afterPageEnter } from '@/utils/cacheManager'

// 懒加载组件
const Dashboard = () => import('../views/Dashboard.vue')
const Login = () => import('../views/Login.vue')

// 新系统页面 - 管理员
const QuestionBankManage = () => import('../views/QuestionBankManage.vue')
const AnswerSessionManage = () => import('../views/AnswerSessionManage.vue')
const ScoringManage = () => import('../views/ScoringManage.vue')
const Statistics = () => import('../views/Statistics.vue')

// 新系统页面 - 用户
const StartAnswer = () => {
  console.log('正在加载StartAnswer组件...')
  return import('../views/StartAnswer.vue').then(module => {
    console.log('StartAnswer组件加载成功')
    return module
  }).catch(error => {
    console.error('StartAnswer组件加载失败:', error)
    throw error
  })
}
const AnswerQuestion = () => import('../views/AnswerQuestion.vue')
const MyAnswerRecords = () => import('../views/MyAnswerRecords.vue')
const SystemUpgrade = () => import('../views/SystemUpgrade.vue')
const TableDebug = () => import('../views/TableDebug.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { hideLayout: true }
  },
  {
    path: '/',
    name: 'Home',
    redirect: '/dashboard' // 默认重定向，会在路由守卫中根据角色调整
  },
  // 管理员路由 - 新系统
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/question-bank',
    name: 'QuestionBankManage',
    component: QuestionBankManage,
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/answer-sessions',
    name: 'AnswerSessionManage',
    component: AnswerSessionManage,
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/scoring',
    name: 'ScoringManage',
    component: ScoringManage,
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  
  // 用户路由 - 新系统
  {
    path: '/start-answer',
    name: 'StartAnswer',
    component: StartAnswer,
    meta: { requiresAuth: true, role: 'USER', keepAlive: true }
  },
  {
    path: '/answer-session/:sessionCode',
    name: 'AnswerQuestion',
    component: AnswerQuestion,
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/my-records',
    name: 'MyRecords',
    component: MyAnswerRecords,
    meta: { requiresAuth: true, role: 'USER', keepAlive: true }
  },

  
  // 系统升级页面
  {
    path: '/system-upgrade',
    name: 'SystemUpgrade',
    component: SystemUpgrade,
    meta: { requiresAuth: true }
  },
  
  // 调试页面
  {
    path: '/table-debug',
    name: 'TableDebug',
    component: TableDebug,
    meta: { requiresAuth: true }
  },
  
  // 旧系统路由重定向
  {
    path: '/questionnaire',
    redirect: '/system-upgrade'
  },
  {
    path: '/questionnaire/create',
    redirect: '/system-upgrade'
  },
  {
    path: '/questionnaire/edit/:id',
    redirect: '/system-upgrade'
  },
  {
    path: '/questionnaire/preview/:id',
    redirect: '/system-upgrade'
  },
  {
    path: '/questionnaire-records',
    redirect: '/system-upgrade'
  },
  {
    path: '/questionnaire-fill',
    redirect: '/system-upgrade'
  },
  {
    path: '/my-responses',
    redirect: '/system-upgrade'
  },
  {
    path: '/questionnaire/fill/:id',
    redirect: '/system-upgrade'
  },


]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 开始监控路由切换时间
  const measureEnd = measureRouteChange(from.path, to.path)
  
  const userStore = useUserStore()
  
  // 使用智能缓存管理器处理页面切换
  if (from.name) {
    beforePageLeave(from, to)
  }
  
  // 如果是登录页面，直接通过
  if (to.path === '/login') {
    // 如果已登录且有用户信息，重定向到首页
    if (userStore.isLoggedIn && userStore.userInfo) {
      next(userStore.isAdmin ? '/dashboard' : '/start-answer')
      return
    }
    next()
    return
  }
  
  // 初始化用户状态（仅在有token且没有用户信息时）
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.initUserState()
    } catch (error) {
      console.error('初始化用户状态失败:', error)
      // 如果初始化失败，清除状态并跳转到登录页
      await userStore.logout()
      next('/login')
      return
    }
  }
  
  // 处理根路径重定向
  if (to.path === '/') {
    next(userStore.isAdmin ? '/dashboard' : '/start-answer')
    return
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    next('/login')
    return
  }
  
  // 检查角色权限
  if (to.meta.role && userStore.role !== to.meta.role) {
    // 如果是管理员访问用户页面，重定向到管理员首页
    if (userStore.isAdmin) {
      next('/dashboard')
    } else {
      // 如果是用户访问管理员页面，重定向到用户首页
      next('/start-answer')
    }
    return
  }
  
  next()
})

// 路由切换完成后的监控
router.afterEach((to, from) => {
  // 使用智能缓存管理器处理页面进入
  afterPageEnter(to, from)
  
  console.log(`路由切换完成: ${from?.path || '无'} -> ${to.path}`)
})

export default router 