/**
 * 组件统一导出文件
 * 方便其他模块导入和使用组件
 */

// 导入所有组件
import PageContainer from './layout/PageContainer.vue'
import PageHeader from './base/PageHeader.vue'
import SearchPanel from './base/SearchPanel.vue'
import DataTable from './base/DataTable.vue'
import TechAlert from './base/TechAlert.vue'
import ModernDialog from './base/ModernDialog.vue'
import PremiumDialog from './base/PremiumDialog.vue'
import MetricCard from './statistics/MetricCard.vue'
import ChartCard from './statistics/ChartCard.vue'
import DifficultyIndicator from './statistics/DifficultyIndicator.vue'
import RankBadge from './statistics/RankBadge.vue'

// 注册全局组件
export function registerComponents(app) {
  app.component('PageContainer', PageContainer)
  app.component('PageHeader', PageHeader)
  app.component('SearchPanel', SearchPanel)
  app.component('DataTable', DataTable)
  app.component('TechAlert', TechAlert)
  app.component('ModernDialog', ModernDialog)
  app.component('PremiumDialog', PremiumDialog)
}

// 统一导出所有组件
export {
  PageContainer,
  PageHeader,
  SearchPanel,
  DataTable,
  TechAlert,
  ModernDialog,
  PremiumDialog,
  MetricCard,
  ChartCard,
  DifficultyIndicator,
  RankBadge
} 