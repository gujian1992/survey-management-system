/**
 * Element Plus 表格滚动条调试器
 * 用于深度分析和检测双滚动条问题
 */

export class ScrollbarDebugger {
  constructor() {
    this.debugInfo = []
    this.isDebugging = false
  }

  /**
   * 开始调试模式
   */
  startDebugging() {
    this.isDebugging = true
    this.debugInfo = []
    console.log('🔍 Element Plus 滚动条调试器启动')
  }

  /**
   * 停止调试模式
   */
  stopDebugging() {
    this.isDebugging = false
    console.log('✅ Element Plus 滚动条调试器停止')
  }

  /**
   * 分析表格的滚动条结构
   * @param {Element} tableElement - 表格元素
   */
  analyzeTable(tableElement) {
    if (!tableElement) {
      console.error('❌ 未找到表格元素')
      return null
    }

    const analysis = {
      timestamp: new Date().toISOString(),
      tableInfo: this.getTableInfo(tableElement),
      scrollbarElements: this.findScrollbarElements(tableElement),
      fixedColumns: this.analyzeFixedColumns(tableElement),
      recommendations: []
    }

    // 生成修复建议
    analysis.recommendations = this.generateRecommendations(analysis)

    if (this.isDebugging) {
      this.debugInfo.push(analysis)
      this.logAnalysis(analysis)
    }

    return analysis
  }

  /**
   * 获取表格基本信息
   */
  getTableInfo(tableElement) {
    const rect = tableElement.getBoundingClientRect()
    return {
      width: rect.width,
      height: rect.height,
      overflow: getComputedStyle(tableElement).overflow,
      position: getComputedStyle(tableElement).position,
      className: tableElement.className,
      hasFixedColumns: tableElement.querySelectorAll('.el-table__fixed, .el-table__fixed-right').length > 0
    }
  }

  /**
   * 查找所有滚动条相关元素
   */
  findScrollbarElements(tableElement) {
    const scrollbarSelectors = [
      '.el-scrollbar',
      '.el-scrollbar__bar',
      '.el-scrollbar__thumb',
      '.el-scrollbar__wrap',
      '.el-table__body-wrapper'
    ]

    const elements = []

    scrollbarSelectors.forEach(selector => {
      const found = tableElement.querySelectorAll(selector)
      found.forEach(element => {
        const rect = element.getBoundingClientRect()
        const computedStyle = getComputedStyle(element)
        
        elements.push({
          selector,
          element,
          visible: rect.width > 0 && rect.height > 0,
          position: {
            left: rect.left,
            top: rect.top,
            width: rect.width,
            height: rect.height
          },
          styles: {
            display: computedStyle.display,
            visibility: computedStyle.visibility,
            opacity: computedStyle.opacity,
            overflow: computedStyle.overflow,
            overflowX: computedStyle.overflowX,
            overflowY: computedStyle.overflowY
          }
        })
      })
    })

    return elements
  }

  /**
   * 分析固定列
   */
  analyzeFixedColumns(tableElement) {
    const fixedLeft = tableElement.querySelectorAll('.el-table__fixed')
    const fixedRight = tableElement.querySelectorAll('.el-table__fixed-right')

    return {
      hasFixedLeft: fixedLeft.length > 0,
      hasFixedRight: fixedRight.length > 0,
      fixedLeftCount: fixedLeft.length,
      fixedRightCount: fixedRight.length,
      fixedLeftElements: Array.from(fixedLeft).map(el => ({
        rect: el.getBoundingClientRect(),
        overflow: getComputedStyle(el).overflow
      })),
      fixedRightElements: Array.from(fixedRight).map(el => ({
        rect: el.getBoundingClientRect(),
        overflow: getComputedStyle(el).overflow
      }))
    }
  }

  /**
   * 生成修复建议
   */
  generateRecommendations(analysis) {
    const recommendations = []

    // 检查是否有可见的滚动条
    const visibleScrollbars = analysis.scrollbarElements.filter(el => 
      el.visible && el.selector.includes('scrollbar') && 
      (el.styles.display !== 'none' && el.styles.visibility !== 'hidden')
    )

    if (visibleScrollbars.length > 1) {
      recommendations.push({
        level: 'critical',
        issue: '检测到多个可见滚动条',
        solution: '应用深层CSS隐藏策略'
      })
    }

    // 检查固定列滚动冲突
    if (analysis.fixedColumns.hasFixedRight && visibleScrollbars.length > 0) {
      recommendations.push({
        level: 'high',
        issue: '右侧固定列可能导致双滚动条',
        solution: '禁用固定列区域的独立滚动'
      })
    }

    return recommendations
  }

  /**
   * 输出调试信息
   */
  logAnalysis(analysis) {
    console.group('📊 表格滚动条分析报告')
    
    console.log('🔧 表格信息:', analysis.tableInfo)
    console.log('📏 滚动条元素:', analysis.scrollbarElements.length)
    console.log('🔒 固定列信息:', analysis.fixedColumns)
    
    if (analysis.recommendations.length > 0) {
      console.group('💡 修复建议')
      analysis.recommendations.forEach(rec => {
        console.log(`${rec.level === 'critical' ? '🚨' : '⚠️'} ${rec.issue}`)
        console.log(`   解决方案: ${rec.solution}`)
      })
      console.groupEnd()
    }
    
    console.groupEnd()
  }

  /**
   * 应用临时修复
   */
  applyQuickFix(tableElement) {
    if (!tableElement) return false

    try {
      // 查找所有滚动条元素并隐藏
      const scrollbars = tableElement.querySelectorAll('.el-scrollbar__bar')
      scrollbars.forEach(bar => {
        bar.style.display = 'none'
        bar.style.visibility = 'hidden'
        bar.style.opacity = '0'
      })

      // 处理固定列滚动
      const fixedRightWrappers = tableElement.querySelectorAll('.el-table__fixed-right .el-table__body-wrapper')
      fixedRightWrappers.forEach(wrapper => {
        wrapper.style.overflow = 'visible'
      })

      console.log('✅ 应用临时修复成功')
      return true
    } catch (error) {
      console.error('❌ 应用临时修复失败:', error)
      return false
    }
  }

  /**
   * 生成调试总结
   */
  generateSummary() {
    if (this.debugInfo.length === 0) {
      return { message: '暂无调试数据' }
    }

    const lastAnalysis = this.debugInfo[this.debugInfo.length - 1]
    const visibleScrollbars = lastAnalysis.scrollbarElements.filter(el => el.visible)
    
    return {
      hasIssues: visibleScrollbars.length > 1,
      scrollbarCount: visibleScrollbars.length,
      hasFixedColumns: lastAnalysis.fixedColumns.hasFixedLeft || lastAnalysis.fixedColumns.hasFixedRight,
      recommendationCount: lastAnalysis.recommendations.length,
      severity: this.calculateSeverity(lastAnalysis)
    }
  }

  /**
   * 计算问题严重程度
   */
  calculateSeverity(analysis) {
    const criticalIssues = analysis.recommendations.filter(r => r.level === 'critical').length
    const highIssues = analysis.recommendations.filter(r => r.level === 'high').length
    
    if (criticalIssues > 0) return 'critical'
    if (highIssues > 0) return 'high'
    return 'low'
  }
}

// 创建全局调试器实例
export const scrollbarDebugger = new ScrollbarDebugger()

// 开发环境自动启用调试
if (import.meta.env.DEV) {
  scrollbarDebugger.startDebugging()
  
  // 添加全局快捷键
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', (e) => {
      // Ctrl + Shift + D 触发调试
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        const tables = document.querySelectorAll('.el-table')
        if (tables.length > 0) {
          scrollbarDebugger.analyzeTable(tables[0])
        }
      }
    })
  }
}

export default ScrollbarDebugger 