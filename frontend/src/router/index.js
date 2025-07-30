import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'
import { measureRouteChange } from '@/utils/performance'
import { beforePageLeave, afterPageEnter } from '@/utils/cacheManager'
import { ElMessageBox } from 'element-plus'

// 懒加载组件
const Dashboard = () => import('../views/Dashboard.vue')
const Login = () => import('../views/Login.vue')
const MyAnswerRecords = () => import('../views/MyAnswerRecords.vue')
const AnswerRecordDetail = () => import('../views/AnswerRecordDetail.vue')

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
const SystemUpgrade = () => import('../views/SystemUpgrade.vue')
const TableDebug = () => import('../views/TableDebug.vue')
const TestConsole = () => import('../views/TestConsole.vue')

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { hideLayout: true }
  },
  {
    path: '/',
    redirect: '/start-answer'
  },
  {
    path: '/start-answer',
    name: 'StartAnswer',
    component: () => import('@/views/StartAnswer.vue')
  },
  {
    path: '/answer-session/:sessionCode',
    name: 'AnswerQuestion',
    component: () => import('@/views/AnswerQuestion.vue'),
    props: true
  },

  {
    path: '/answer-records',
    redirect: '/my-answer-records'
  },
  {
    path: '/my-answer-records',
    name: 'MyAnswerRecords',
    component: () => import('@/views/MyAnswerRecords.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/answer-records/:sessionCode',
    name: 'AnswerRecordDetail',
    component: AnswerRecordDetail,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/answer-session-manage',
    name: 'AnswerSessionManage',
    component: () => import('@/views/AnswerSessionManage.vue')
  },
  {
    path: '/scoring-manage',
    name: 'ScoringManage',
    component: () => import('@/views/ScoringManage.vue')
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/question-bank',
    name: 'QuestionBankManage',
    component: () => import('@/views/QuestionBankManage.vue'),
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/system-upgrade',
    name: 'SystemUpgrade',
    component: () => import('@/views/SystemUpgrade.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/table-debug',
    name: 'TableDebug',
    component: () => import('@/views/TableDebug.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test-console',
    name: 'TestConsole',
    component: () => import('@/views/TestConsole.vue'),
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
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
  console.log(`路由切换完成: ${from?.path || '无'} -> ${to.path}`)
})

export default router 