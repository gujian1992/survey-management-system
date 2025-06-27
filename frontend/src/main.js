import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 引入全局样式系统
import './styles/index.css'
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

// 🚀 导入高级按钮增强插件系统 - 安全模式
import { AdvancedButtonEnhancerPlugin, PRESET_THEMES, ThemeConfig, ENHANCEMENT_STRATEGIES } from '@/plugins/AdvancedButtonEnhancer.js'

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
app.use(ElementPlus)
app.use(pinia)
app.use(router)

// 🎨 注册高级按钮增强插件 - 安全模式
app.use(AdvancedButtonEnhancerPlugin, {
  strategy: ENHANCEMENT_STRATEGIES.HYBRID,
  enableAnimation: true,
  debugMode: import.meta.env.MODE === 'development',
  performanceMode: false,
  safeMode: true // 强制启用安全模式
})

// 🎯 简化的主题注册（只注册基础主题）
const enhancer = app.config.globalProperties.$advancedButtonEnhancer

if (enhancer) {
  // 注册简化的企业级主题
  enhancer.registerTheme(new ThemeConfig('primary', {
    default: {
      background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hover: {
      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
    },
    active: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.5)'
    },
    strategy: ENHANCEMENT_STRATEGIES.HYBRID
  }))

  enhancer.registerTheme(new ThemeConfig('secondary', {
    default: {
      background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.3)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hover: {
      background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(107, 114, 128, 0.4)'
    },
    active: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(107, 114, 128, 0.5)'
    },
    strategy: ENHANCEMENT_STRATEGIES.HYBRID
  }))

  console.log('[Main] 高级按钮增强系统初始化完成（安全模式）')
}

app.mount('#app') 