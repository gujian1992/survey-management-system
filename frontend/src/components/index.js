/**
 * 组件统一导出文件
 * 方便其他模块导入和使用组件
 */

// 布局组件
export { default as PageContainer } from './layout/PageContainer.vue'

// 基础组件
export { default as PageHeader } from './base/PageHeader.vue'
export { default as SearchPanel } from './base/SearchPanel.vue'
export { default as DataTable } from './base/DataTable.vue'

// 业务组件 (待添加)
// export { default as QuestionForm } from './business/QuestionForm.vue'
// export { default as QuestionPreview } from './business/QuestionPreview.vue'

// Statistics Components
export { default as MetricCard } from './statistics/MetricCard.vue'
export { default as ChartCard } from './statistics/ChartCard.vue'
export { default as DifficultyIndicator } from './statistics/DifficultyIndicator.vue'
export { default as RankBadge } from './statistics/RankBadge.vue' 