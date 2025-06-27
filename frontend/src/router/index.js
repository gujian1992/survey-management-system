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
const StartAnswer = () => import('../views/StartAnswer.vue')
const AnswerQuestion = () => import('../views/AnswerQuestion.vue')


// 旧系统页面（保留备用）
const QuestionnaireList = () => import('../views/QuestionnaireList.vue')
const QuestionnaireCreate = () => import('../views/QuestionnaireCreate.vue')
const QuestionnaireEdit = () => import('../views/QuestionnaireEdit.vue')
const QuestionnairePreview = () => import('../views/QuestionnairePreview.vue')
const QuestionnaireFill = () => import('../views/QuestionnaireFill.vue')
const MyResponses = () => import('../views/MyResponses.vue')

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
    path: '/answer/:sessionCode',
    name: 'AnswerQuestion',
    component: AnswerQuestion,
    meta: { requiresAuth: true, role: 'USER' }
  },

  
  // 旧系统路由（保留备用）
  {
    path: '/questionnaire',
    name: 'QuestionnaireList',
    component: QuestionnaireList,
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/questionnaire/create',
    name: 'QuestionnaireCreate',
    component: QuestionnaireCreate,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/questionnaire/edit/:id',
    name: 'QuestionnaireEdit',
    component: QuestionnaireEdit,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/questionnaire/preview/:id',
    name: 'QuestionnairePreview',
    component: QuestionnairePreview,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/questionnaire-records',
    name: 'QuestionnaireRecords',
    component: () => import('../views/QuestionnaireRecords.vue'),
    meta: { requiresAuth: true, role: 'ADMIN', keepAlive: true }
  },
  {
    path: '/questionnaire-fill',
    name: 'QuestionnaireFill',
    component: QuestionnaireFill,
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/my-responses',
    name: 'MyResponses',
    component: MyResponses,
    meta: { requiresAuth: true, role: 'USER' }
  },
  {
    path: '/questionnaire/fill/:id',
    name: 'QuestionnaireAnswer',
    component: () => import('../views/QuestionnaireAnswer.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/api-test',
    name: 'ApiTest',
    component: () => import('../views/ApiTest.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/hover-test',
    name: 'HoverTest',
    component: () => import('../views/HoverTest.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/button-showcase',
    name: 'ButtonShowcase',
    component: () => import('../views/ButtonShowcase.vue'),
    meta: { 
      requiresAuth: false,
      title: '按钮增强插件演示'
    }
  }

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
  
  // 初始化用户状态
  if (userStore.token && !userStore.userInfo) {
    try {
      await userStore.initUserState()
    } catch (error) {
      console.error('初始化用户状态失败:', error)
    }
  }
  
  // 处理根路径重定向
  if (to.path === '/' && userStore.isLoggedIn) {
    next(userStore.isAdmin ? '/dashboard' : '/start-answer')
    return
  }
  
  // 如果访问登录页且已登录，重定向到首页
  if (to.path === '/login' && userStore.isLoggedIn) {
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