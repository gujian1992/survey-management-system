<template>
  <div class="data-table-container">
    <div v-if="showHeader" class="table-header">
      <div class="table-title">
        <el-icon v-if="icon" :color="iconColor"><component :is="icon" /></el-icon>
        {{ title }}
        <el-tag v-if="showTotal" type="info" size="small" class="count-tag">
          {{ totalText }}
        </el-tag>
      </div>
      
      <div v-if="showBatchActions && selectedRows.length > 0" class="batch-actions">
        <el-tag type="warning" size="large" class="selection-tag">
          已选择 {{ selectedRows.length }} 项
        </el-tag>
        <slot name="batch-actions" :selectedRows="selectedRows"></slot>
      </div>
      
      <div v-if="$slots.actions" class="table-actions">
        <slot name="actions"></slot>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table
        ref="tableRef"
        v-bind="tableProps"
        :data="data"
        :loading="loading"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
        class="modern-table"
        :header-cell-style="headerCellStyle"
        :row-class-name="getRowClassName"
        :max-height="null"
        :height="null"
        :scrollbar-always-on="false"
        table-layout="auto"
        style="width: 100%"
      >
        <slot></slot>
      </el-table>
    </div>

    <div v-if="showPagination && pagination" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="pagination.current"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="pageSizes"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="modern-pagination"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs } from 'vue'

const props = defineProps({
  // 表格基础属性
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  
  // 头部配置
  showHeader: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: '数据列表'
  },
  icon: {
    type: [String, Object],
    default: null
  },
  iconColor: {
    type: String,
    default: '#667eea'
  },
  showTotal: {
    type: Boolean,
    default: true
  },
  totalText: {
    type: String,
    default: ''
  },
  
  // 批量操作
  showBatchActions: {
    type: Boolean,
    default: false
  },
  
  // 分页配置
  showPagination: {
    type: Boolean,
    default: true
  },
  pagination: {
    type: Object,
    default: null
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  paginationLayout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  },
  
  // 表格属性透传
  tableProps: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits([
  'selection-change',
  'row-click', 
  'size-change',
  'current-change'
])

const tableRef = ref()
const selectedRows = ref([])

const computedTotalText = computed(() => {
  if (props.totalText) return props.totalText
  if (props.pagination) return `${props.pagination.total} 条记录`
  return `${props.data.length} 条记录`
})

// 表格样式
const headerCellStyle = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  color: '#4a5568',
  fontWeight: '600',
  fontSize: '14px',
  padding: '16px 12px'
}

const getRowClassName = (params) => {
  // 支持外部传入的row-class-name函数
  if (props.tableProps && props.tableProps.rowClassName) {
    return props.tableProps.rowClassName(params)
  }
  
  // 默认斑马纹样式
  const { rowIndex } = params
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 事件处理
const handleSelectionChange = (selection) => {
  selectedRows.value = selection
  emit('selection-change', selection)
}

const handleRowClick = (row, column, event) => {
  emit('row-click', row, column, event)
}

const handleSizeChange = (size) => {
  emit('size-change', size)
}

const handleCurrentChange = (current) => {
  emit('current-change', current)
}

// 公开方法
const clearSelection = () => {
  tableRef.value?.clearSelection()
}

const toggleRowSelection = (row, selected) => {
  tableRef.value?.toggleRowSelection(row, selected)
}

defineExpose({
  clearSelection,
  toggleRowSelection,
  tableRef
})
</script>

<style scoped>
/* 🚀 顶级科技感数据表格设计 */
.data-table-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
  position: relative;
  z-index: var(--z-dropdown);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.data-table-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.02) 0%, 
    rgba(118, 75, 162, 0.02) 50%,
    rgba(83, 109, 254, 0.02) 100%);
  pointer-events: none;
  z-index: -1;
}

.data-table-container:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 24px 48px rgba(0, 0, 0, 0.12),
    0 12px 20px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

/* 🎨 现代化表头设计 */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 2px solid transparent;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  background-size: 100% 2px;
  background-repeat: no-repeat;
  background-position: bottom;
  flex-wrap: wrap;
  gap: 16px;
}

.table-title {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 20px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.table-title .el-icon {
  color: #667eea;
  font-size: 24px;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
}

.count-tag {
  background: linear-gradient(135deg, #e6fffa 0%, #f0fff4 100%);
  color: #10b981;
  border: none;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
  backdrop-filter: blur(10px);
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.selection-tag {
  background: linear-gradient(135deg, #fff5e6 0%, #ffeaa7 100%);
  color: #f59e0b;
  border: none;
  font-weight: 600;
  padding: 12px 20px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.2);
  backdrop-filter: blur(10px);
}

.table-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* 🔮 科技感表格包装器 */
.table-wrapper {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(102, 126, 234, 0.1);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(10px);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

/* ✨ 现代化表格样式 */
:deep(.modern-table) {
  border-radius: 20px;
  overflow: visible;
  background: transparent;
}

/* 彻底移除表格内部滚动条，提升美观度 */
:deep(.modern-table .el-table__body-wrapper) {
  overflow: visible !important; /* 强制移除内部垂直滚动 */
  overflow-x: visible !important; /* 强制移除内部水平滚动 */
  max-height: none !important; /* 移除最大高度限制 */
}

:deep(.modern-table .el-table__header-wrapper) {
  overflow: visible !important;
  overflow-x: visible !important;
}

/* 确保表格内容完整显示 */
:deep(.modern-table .el-table__body) {
  width: 100% !important;
  overflow: visible !important;
}

:deep(.modern-table .el-table__header) {
  overflow: visible !important;
}

/* 表格固定高度设置为自动，让内容决定高度 */
:deep(.modern-table.el-table--fit) {
  height: auto !important;
  max-height: none !important;
}

:deep(.modern-table .el-table__fixed),
:deep(.modern-table .el-table__fixed-right) {
  height: auto !important;
  max-height: none !important;
}

/* 移除所有可能的滚动条 */
:deep(.modern-table .el-scrollbar) {
  overflow: visible !important;
}

:deep(.modern-table .el-scrollbar__wrap) {
  overflow: visible !important;
  max-height: none !important;
}

:deep(.modern-table .el-scrollbar__view) {
  overflow: visible !important;
}

/* 彻底移除Element Plus表格的所有滚动条 */
:deep(.modern-table) {
  overflow: visible !important;
}

:deep(.modern-table *) {
  overflow: visible !important;
  max-height: none !important;
}

/* 移除表格容器的滚动条 */
:deep(.modern-table .el-table) {
  overflow: visible !important;
}

:deep(.modern-table .el-table__inner-wrapper) {
  overflow: visible !important;
}

/* 确保表格适应内容高度 */
:deep(.modern-table.el-table--scrollable-x) {
  overflow-x: visible !important;
}

:deep(.modern-table.el-table--scrollable-y) {
  overflow-y: visible !important;
}

/* 移除虚拟滚动相关的滚动条 */
:deep(.modern-table .el-table__empty-block),
:deep(.modern-table .el-table__append-wrapper) {
  overflow: visible !important;
}

:deep(.modern-table .el-table__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  backdrop-filter: blur(10px);
}

:deep(.modern-table .el-table__header th) {
  background: transparent;
  border: none;
  padding: 20px 16px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4a5568;
}

:deep(.modern-table .el-table__row) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(10px);
}

:deep(.modern-table .el-table__row:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  transform: translateX(4px);
  box-shadow: 
    8px 0 24px rgba(102, 126, 234, 0.15),
    0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.modern-table .el-table__row td) {
  border: none;
  padding: 20px 16px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.08);
}

:deep(.modern-table .even-row) {
  background: var(--color-gray-50);
}

:deep(.modern-table .odd-row) {
  background: var(--color-white);
}

:deep(.modern-table .el-table__cell) {
  border-bottom: 1px solid var(--color-gray-100);
}

/* 分页样式 */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-2xl);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--color-gray-200);
}

.modern-pagination {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md) var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-table-container {
    padding: var(--spacing-lg);
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .batch-actions,
  .table-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .pagination-wrapper {
    overflow-x: auto;
  }
}

/* 最强优先级：彻底隐藏所有滚动条 */
:deep(.data-table-container) {
  overflow: visible !important;
}

:deep(.data-table-container *) {
  overflow: visible !important;
  max-height: none !important;
}

/* 专门针对Element Plus的滚动条组件 */
:deep(.el-scrollbar__bar) {
  display: none !important;
}

:deep(.el-scrollbar__thumb) {
  display: none !important;
}

:deep(.el-table .el-scrollbar__bar) {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

/* 强制移除所有Element UI的滚动相关类 */
:deep(.el-table--scrollable-x .el-table__body-wrapper),
:deep(.el-table--scrollable-y .el-table__body-wrapper) {
  overflow: visible !important;
}

/* 修复表格选择框对齐问题 */
:deep(.modern-table .el-table__header .el-table__cell.el-table-column--selection) {
  text-align: center !important;
  vertical-align: middle !important;
  padding: 12px 0 !important;
}

:deep(.modern-table .el-table__body .el-table__cell.el-table-column--selection) {
  text-align: center !important;
  vertical-align: middle !important;
  padding: 12px 0 !important;
}

:deep(.modern-table .el-table__header .el-table__cell.el-table-column--selection .cell) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
}

:deep(.modern-table .el-table__body .el-table__cell.el-table-column--selection .cell) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
}

:deep(.modern-table .el-checkbox) {
  margin: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

:deep(.modern-table .el-checkbox__input) {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

/* 修复表格头部文字排列问题 */
:deep(.modern-table .el-table__header-wrapper .el-table__header .el-table__cell) {
  padding: 12px 8px !important;
  text-align: center !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  color: #4a5568 !important;
  min-width: 60px !important;
}

:deep(.modern-table .el-table__header-wrapper .el-table__header .el-table__cell .cell) {
  padding: 0 !important;
  text-align: center !important;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  height: 100% !important;
  width: 100% !important;
}

/* 确保表体文字也是水平排列 */
:deep(.modern-table .el-table__body-wrapper .el-table__body .el-table__cell) {
  padding: 12px 8px !important;
  text-align: center !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
}

:deep(.modern-table .el-table__body-wrapper .el-table__body .el-table__cell .cell) {
  text-align: center !important;
  white-space: nowrap !important;
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
}

/* 强制所有表格文字水平排列 - 解决竖排问题 */
:deep(.modern-table th),
:deep(.modern-table td),
:deep(.modern-table .el-table__header th),
:deep(.modern-table .el-table__body td) {
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  direction: ltr !important;
}

:deep(.modern-table .el-table__header th .cell),
:deep(.modern-table .el-table__body td .cell) {
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  direction: ltr !important;
  text-align: center !important;
  display: inline-block !important;
  width: 100% !important;
}

/* 专门针对Element Plus表格的文字方向修复 */
:deep(.modern-table) * {
  writing-mode: horizontal-tb !important;
  text-orientation: mixed !important;
  direction: ltr !important;
}

/* 确保表头单元格有足够宽度显示水平文字 */
:deep(.modern-table .el-table__header .el-table__cell) {
  min-width: 60px !important;
  width: auto !important;
  text-align: center !important;
}
</style> 