<template>
  <!-- 登录页面不显示布局 -->
  <div v-if="$route.meta.hideLayout">
    <router-view />
  </div>
  
  <!-- 主应用布局 -->
  <el-container v-else class="app-container">
    <el-aside width="250px" class="sidebar">
      <div class="logo">
        <h2>问卷系统</h2>
      </div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <!-- 管理员菜单 -->
        <template v-if="userStore.isAdmin">
          <el-menu-item index="/dashboard">
            <el-icon><DataBoard /></el-icon>
            <span>仪表盘</span>
          </el-menu-item>
          <el-menu-item index="/question-bank">
            <el-icon><Document /></el-icon>
            <span>题库管理</span>
          </el-menu-item>
          <el-menu-item index="/answer-sessions">
            <el-icon><List /></el-icon>
            <span>答题会话</span>
          </el-menu-item>
          <el-menu-item index="/scoring">
            <el-icon><Edit /></el-icon>
            <span>评分管理</span>
          </el-menu-item>
          <el-menu-item index="/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>数据统计</span>
          </el-menu-item>
        </template>
        
        <!-- 普通用户菜单 -->
        <template v-else>
          <el-menu-item index="/start-answer">
            <el-icon><Edit /></el-icon>
            <span>开始答题</span>
          </el-menu-item>
          <el-menu-item index="/my-records">
            <el-icon><Document /></el-icon>
            <span>我的记录</span>
          </el-menu-item>
        </template>
      </el-menu>
    </el-aside>
    
    <el-container style="height: 100%;">
      <el-header class="header">
        <div class="user-info">
          <el-dropdown>
            <span class="user-name">
              <el-icon><User /></el-icon>
              {{ userStore.realName || userStore.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <span class="role-badge">{{ userStore.isAdmin ? '管理员' : '用户' }}</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <el-main class="main-content" style="height: calc(100vh - 60px); overflow-y: auto;">
        <router-view v-slot="{ Component, route }">
          <transition 
            name="fade-transform" 
            mode="out-in"
            @before-leave="handleBeforeLeave"
            @after-enter="handleAfterEnter"
          >
            <keep-alive :include="keepAliveComponents">
              <component :is="Component" :key="generateRouteKey(route)" />
            </keep-alive>
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCachedComponents, getRouteKey } from '@/utils/cacheManager'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

// 智能缓存管理 - 使用缓存管理器
const keepAliveComponents = computed(() => {
  return getCachedComponents(userStore.role)
})



const getPageTitle = () => {
  const titleMap = {
    '/dashboard': '仪表盘',
    '/question-bank': '题库管理',
    '/answer-sessions': '答题会话',
    '/scoring': '评分管理',
    '/statistics': '数据统计',
    '/start-answer': '开始答题',
    '/answer': '答题中',
    '/my-records': '我的记录'
  }
  
  // 处理动态路由
  const path = route.path
  for (const key in titleMap) {
    if (path.startsWith(key)) {
      return titleMap[key]
    }
  }
  
  return '问卷系统'
}

// 使用智能缓存管理器生成路由key
const generateRouteKey = (route) => {
  return getRouteKey(route, route.name)
}

const handleBeforeLeave = () => {
  // 页面离开前的清理逻辑
  const currentRoute = route
  
  // 清理可能导致重叠的组件状态
  const cleanupRoutes = ['QuestionnaireAnswer', 'QuestionnaireFill', 'QuestionnaireCreate', 'QuestionnaireEdit']
  if (cleanupRoutes.includes(currentRoute.name)) {
    // 触发全局清理事件
    window.dispatchEvent(new CustomEvent('pageStateCleanup', {
      detail: { route: currentRoute.name }
    }))
  }
}

const handleAfterEnter = () => {
  // 页面进入后的初始化逻辑
  const currentRoute = route
  
  // 确保页面状态正确初始化
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('pageStateInit', {
      detail: { route: currentRoute.name }
    }))
  }, 50)
}

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await userStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch (error) {
    // 用户取消操作
  }
}
</script>

<style scoped>
/* 🚀 现代化应用设计 */
.app-container {
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.app-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(102, 126, 234, 0.1) 0%, transparent 40%);
  pointer-events: none;
  z-index: 0;
}

/* 🎨 侧边栏现代化设计 */
.sidebar {
  background: rgba(48, 65, 86, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
  position: relative !important;
  z-index: 10 !important;
  box-shadow: 
    4px 0 20px rgba(0, 0, 0, 0.1),
    inset -1px 0 0 rgba(255, 255, 255, 0.1) !important;
}

.logo {
  padding: 20px;
  text-align: center;
  color: #fff;
  border-bottom: 1px solid #434c5e;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
}

.header-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #303133;
  cursor: pointer;
  padding: 10px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
  font-size: 14px;
  font-weight: 500;
  min-width: 120px;
  white-space: nowrap;
}

.user-name .el-icon {
  font-size: 18px;
  color: #667eea;
  flex-shrink: 0;
}

.user-name:hover {
  background-color: #f5f7fa;
}

.role-badge {
  color: #409EFF;
  font-weight: 500;
}

.main-content {
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
}

/* 页面切换动画 - 优化以避免重叠问题 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.25s ease;
  position: relative;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 确保离开的页面在下层，进入的页面在上层 */
.fade-transform-leave-active {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow-y: auto;
}

.fade-transform-enter-active {
  z-index: 1;
  min-height: 100%;
}


</style>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

#app {
  height: 100vh;
}
</style> 