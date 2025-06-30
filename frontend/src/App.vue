<template>
  <!-- 登录页面不显示布局 -->
  <div v-if="$route.meta.hideLayout">
    <router-view />
  </div>
  
  <!-- 主应用布局 -->
  <div v-else class="app-container">
    <div class="sidebar">
      <div class="logo">
        <h2>问卷系统</h2>
      </div>
      <div class="menu-container">
        <!-- 管理员菜单 -->
        <template v-if="userStore.isAdmin">
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/dashboard' }"
            @click="navigateTo('/dashboard')"
          >
            仪表盘
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/question-bank' }"
            @click="navigateTo('/question-bank')"
          >
            题库管理
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/answer-sessions' }"
            @click="navigateTo('/answer-sessions')"
          >
            答题会话
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/scoring' }"
            @click="navigateTo('/scoring')"
          >
            评分管理
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/statistics' }"
            @click="navigateTo('/statistics')"
          >
            数据统计
          </div>
        </template>
        
        <!-- 普通用户菜单 -->
        <template v-else>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/start-answer' }"
            @click="navigateTo('/start-answer')"
          >
            开始答题
          </div>
          <div 
            class="menu-item" 
            :class="{ active: $route.path === '/my-records' }"
            @click="navigateTo('/my-records')"
          >
            我的记录
          </div>
        </template>
      </div>
    </div>
    
    <div class="main-container">
      <div class="header">
        <div class="user-info">
          <el-dropdown>
            <span class="user-name">
              <el-icon><User /></el-icon>
              {{ userStore.realName || userStore.username }}
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item>
                  <span class="role-badge">{{ userStore.isAdmin ? '系统管理员' : '普通用户' }}</span>
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <div class="main-content">
        <RouteTransitionMonitor>
          <router-view />
        </RouteTransitionMonitor>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { 
  User, 
  SwitchButton,
  Menu,
  Setting,
  Document,
  Timer,
  DataAnalysis
} from '@element-plus/icons-vue'
import RouteTransitionMonitor from '@/components/RouteTransitionMonitor.vue'
import { SimplePremiumDialog } from '@/utils/simplePremiumDialog.js'
import { ElMessage } from 'element-plus'
import { onMounted, nextTick } from 'vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const navigateTo = (path) => {
  if (route.path !== path) {
    router.push(path)
  }
}

const handleLogout = async () => {
  try {
    await SimplePremiumDialog.confirmLogout()
    
    try {
      // 先清除用户状态
      await userStore.logout()
      console.log('退出登录成功')
      
      // 等待下一个tick，确保状态更新完成
      await nextTick()
      
      // 然后再跳转到登录页
      await router.push('/login')
    } catch (error) {
      console.error('退出登录失败:', error)
      ElMessage.error('网络异常，退出失败，请重试')
    }
  } catch (error) {
    // 用户取消退出，不需要处理
  }
}

onMounted(() => {
  console.log('应用已启动')
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.sidebar {
  width: 250px;
  background: rgba(48, 65, 86, 0.95);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #434c5e;
}

.logo h2 {
  margin: 0;
  font-size: 18px;
  color: white;
}

.menu-container {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  padding: 12px 20px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
  font-size: 14px;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(2px);
}

.menu-item.active {
  background-color: rgba(64, 158, 255, 0.2);
  border-left-color: #409EFF;
  color: #409EFF;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
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
  flex: 1;
  background-color: #f5f5f5;
  padding: 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .menu-container {
    display: flex;
    overflow-x: auto;
    padding: 10px;
  }
  
  .menu-item {
    white-space: nowrap;
    min-width: 80px;
    text-align: center;
  }
}
</style>

<style>
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}

#app {
  height: 100vh;
}
</style> 