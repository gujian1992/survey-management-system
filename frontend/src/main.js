import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
// 🌏 Element Plus 中文国际化
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

// 样式导入顺序很重要
// 1. 基础变量和重置样式
import './styles/base/variables.css'
import './styles/base/reset.css'

// 2. Element Plus 基础样式
import 'element-plus/dist/index.css'

// 3. 自定义组件样式
import './styles/components/form.css'
import './styles/components/button.css'
import './styles/components/card.css'

// 4. Element Plus 主题覆盖和增强
import './styles/themes/element-plus-override.css'
import './styles/themes/scrollbar.css'

// 5. 全局工具类和通用样式
import './styles/base/utilities.css'
import './styles/index.css'

// 导入 Element Plus 图标
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import ECharts from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 暂时注释掉可能有问题的高级插件
// import { AdvancedButtonEnhancerPlugin, PRESET_THEMES, ThemeConfig, ENHANCEMENT_STRATEGIES } from '@/plugins/AdvancedButtonEnhancer.js'
// import { installTechAlert } from '@/utils/techAlert.js'
// import { installModernDialog } from '@/utils/modernDialog.js'
// import { installPremiumDialog } from '@/utils/premiumDialog.js'

import { useUserStore } from './store/user'

use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.component('v-chart', ECharts)
app.use(ElementPlus, {
  locale: zhCn,
})
app.use(pinia)
app.use(router)

// 暂时注释掉高级插件的注册
// app.use(AdvancedButtonEnhancerPlugin, {
//   strategy: ENHANCEMENT_STRATEGIES.HYBRID,
//   enableAnimation: true,
//   debugMode: import.meta.env.MODE === 'development',
//   performanceMode: false,
//   safeMode: true
// })

// installTechAlert(app)
// installModernDialog(app)
// installPremiumDialog(app)

console.log('Vue应用开始初始化...')

// 初始化应用
async function initApp() {
  try {
    console.log('开始初始化用户状态...')
    // 初始化用户状态
    const userStore = useUserStore(pinia)
    if (userStore.initUserState) {
      await userStore.initUserState()
      console.log('用户状态初始化完成')
    }

    // 挂载应用
    console.log('挂载Vue应用...')
    app.mount('#app')
    console.log('Vue应用启动成功!')
  } catch (error) {
    console.error('应用初始化失败:', error)
    // 即使初始化失败也要挂载应用，只是没有用户状态
    app.mount('#app')
  }
}

initApp() 