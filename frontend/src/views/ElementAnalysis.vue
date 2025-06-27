<template>
  <div class="element-analysis">
    <h1>🔍 Element Plus 按钮深度分析</h1>
    
    <div class="analysis-section">
      <h2>1. DOM结构分析</h2>
      <div class="button-test-area">
        <el-button type="primary" ref="testButton" @click="analyzeDOM">
          分析按钮DOM结构
        </el-button>
        <el-button @click="testEventBinding">测试事件绑定</el-button>
        <el-button @click="testStyleOverride">测试样式覆盖</el-button>
      </div>
      
      <div class="analysis-result">
        <h3>DOM结构分析结果：</h3>
        <pre>{{ domAnalysis }}</pre>
      </div>
    </div>

    <div class="analysis-section">
      <h2>2. 事件机制分析</h2>
      <div class="event-test">
        <el-button 
          ref="eventButton"
          type="primary"
          @mouseenter="onMouseEnter"
          @mouseleave="onMouseLeave"
          @mousedown="onMouseDown"
          @mouseup="onMouseUp"
          @focus="onFocus"
          @blur="onBlur"
        >
          事件测试按钮
        </el-button>
        
        <div class="event-log">
          <h4>事件触发日志：</h4>
          <div class="log-entries">
            <div v-for="(log, index) in eventLogs" :key="index" class="log-entry">
              <span class="timestamp">{{ log.timestamp }}</span>
              <span class="event-type">{{ log.type }}</span>
              <span class="target">{{ log.target }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analysis-section">
      <h2>3. 样式优先级分析</h2>
      <div class="style-test">
        <el-button 
          ref="styleButton"
          type="primary"
          class="test-style-button"
          :style="inlineStyles"
        >
          样式测试按钮
        </el-button>
        
        <div class="style-controls">
          <h4>样式控制：</h4>
          <el-button @click="applyInlineStyle">应用内联样式</el-button>
          <el-button @click="applyImportantStyle">应用!important样式</el-button>
          <el-button @click="applyDirectStyle">直接操作DOM样式</el-button>
          <el-button @click="resetStyles">重置样式</el-button>
        </div>
        
        <div class="computed-styles">
          <h4>计算样式：</h4>
          <pre>{{ computedStyles }}</pre>
        </div>
      </div>
    </div>

    <div class="analysis-section">
      <h2>4. Vue组件生命周期分析</h2>
      <div class="lifecycle-test">
        <el-button 
          ref="lifecycleButton"
          type="primary"
          v-if="showLifecycleButton"
        >
          生命周期测试按钮
        </el-button>
        
        <div class="lifecycle-controls">
          <el-button @click="toggleButton">切换按钮显示</el-button>
          <el-button @click="forceUpdate">强制更新</el-button>
        </div>
        
        <div class="lifecycle-log">
          <h4>生命周期日志：</h4>
          <div class="log-entries">
            <div v-for="(log, index) in lifecycleLogs" :key="index" class="log-entry">
              <span class="timestamp">{{ log.timestamp }}</span>
              <span class="phase">{{ log.phase }}</span>
              <span class="details">{{ log.details }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUpdated, onUnmounted, nextTick } from 'vue'

const testButton = ref(null)
const eventButton = ref(null)
const styleButton = ref(null)
const lifecycleButton = ref(null)

const domAnalysis = ref('')
const eventLogs = ref([])
const lifecycleLogs = ref([])
const computedStyles = ref('')
const showLifecycleButton = ref(true)

const inlineStyles = ref({
  background: 'red',
  color: 'white',
  border: '2px solid blue'
})

// 添加日志
const addEventLog = (type, target) => {
  eventLogs.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    type,
    target
  })
}

const addLifecycleLog = (phase, details) => {
  lifecycleLogs.value.unshift({
    timestamp: new Date().toLocaleTimeString(),
    phase,
    details
  })
}

// DOM结构分析
const analyzeDOM = async () => {
  await nextTick()
  const button = testButton.value
  
  if (!button) {
    domAnalysis.value = '按钮引用无效'
    return
  }

  let analysis = '=== Element Plus 按钮DOM结构分析 ===\n\n'
  
  // 1. Vue组件实例
  analysis += `1. Vue组件实例:\n`
  analysis += `   - 组件类型: ${button.$.type.name}\n`
  analysis += `   - 组件引用: ${button}\n`
  analysis += `   - $el属性: ${button.$el}\n\n`
  
  // 2. 实际DOM元素
  const actualElement = button.$el
  analysis += `2. 实际DOM元素:\n`
  analysis += `   - 标签名: ${actualElement.tagName}\n`
  analysis += `   - 类名: ${actualElement.className}\n`
  analysis += `   - ID: ${actualElement.id}\n`
  analysis += `   - 内联样式: ${actualElement.getAttribute('style')}\n\n`
  
  // 3. 内部结构
  analysis += `3. 内部DOM结构:\n`
  analysis += `   - 子元素数量: ${actualElement.children.length}\n`
  for (let i = 0; i < actualElement.children.length; i++) {
    const child = actualElement.children[i]
    analysis += `   - 子元素${i}: ${child.tagName} (${child.className})\n`
  }
  analysis += `\n`
  
  // 4. 计算样式
  const computedStyle = getComputedStyle(actualElement)
  analysis += `4. 关键计算样式:\n`
  analysis += `   - background: ${computedStyle.background}\n`
  analysis += `   - color: ${computedStyle.color}\n`
  analysis += `   - border: ${computedStyle.border}\n`
  analysis += `   - transition: ${computedStyle.transition}\n`
  analysis += `   - transform: ${computedStyle.transform}\n\n`
  
  // 5. CSS规则
  analysis += `5. 应用的CSS规则:\n`
  const allRules = []
  for (let i = 0; i < document.styleSheets.length; i++) {
    try {
      const sheet = document.styleSheets[i]
      const rules = sheet.cssRules || sheet.rules
      for (let j = 0; j < rules.length; j++) {
        const rule = rules[j]
        if (rule.selectorText && actualElement.matches(rule.selectorText)) {
          allRules.push(`${rule.selectorText} { ${rule.style.cssText} }`)
        }
      }
    } catch (e) {
      // 跨域样式表会报错，忽略
    }
  }
  analysis += allRules.slice(0, 10).join('\n')
  
  domAnalysis.value = analysis
}

// 事件测试
const onMouseEnter = (event) => {
  addEventLog('mouseenter', event.target.tagName)
  console.log('🔥 MouseEnter事件触发', event.target)
}

const onMouseLeave = (event) => {
  addEventLog('mouseleave', event.target.tagName)
  console.log('🔥 MouseLeave事件触发', event.target)
}

const onMouseDown = (event) => {
  addEventLog('mousedown', event.target.tagName)
}

const onMouseUp = (event) => {
  addEventLog('mouseup', event.target.tagName)
}

const onFocus = (event) => {
  addEventLog('focus', event.target.tagName)
}

const onBlur = (event) => {
  addEventLog('blur', event.target.tagName)
}

const testEventBinding = () => {
  const button = eventButton.value
  if (button && button.$el) {
    // 直接绑定事件到DOM元素
    button.$el.addEventListener('mouseenter', () => {
      addEventLog('direct-mouseenter', 'DOM直接绑定')
      console.log('🔥 直接DOM事件绑定生效')
    })
  }
}

// 样式测试
const applyInlineStyle = () => {
  const button = styleButton.value
  if (button && button.$el) {
    button.$el.style.background = 'purple'
    button.$el.style.color = 'yellow'
    button.$el.style.transform = 'scale(1.2)'
    updateComputedStyles()
  }
}

const applyImportantStyle = () => {
  const button = styleButton.value
  if (button && button.$el) {
    button.$el.style.setProperty('background', 'orange', 'important')
    button.$el.style.setProperty('color', 'black', 'important')
    button.$el.style.setProperty('transform', 'rotate(10deg)', 'important')
    updateComputedStyles()
  }
}

const applyDirectStyle = () => {
  const button = styleButton.value
  if (button && button.$el) {
    // 使用CSSStyleDeclaration直接操作
    const style = button.$el.style
    style.cssText += '; background: green !important; color: white !important; transform: translateY(-10px) !important;'
    updateComputedStyles()
  }
}

const resetStyles = () => {
  const button = styleButton.value
  if (button && button.$el) {
    button.$el.style.cssText = ''
    updateComputedStyles()
  }
}

const updateComputedStyles = () => {
  const button = styleButton.value
  if (button && button.$el) {
    const computed = getComputedStyle(button.$el)
    computedStyles.value = `background: ${computed.background}\ncolor: ${computed.color}\ntransform: ${computed.transform}\ntransition: ${computed.transition}`
  }
}

const testStyleOverride = () => {
  updateComputedStyles()
}

// 生命周期测试
const toggleButton = () => {
  showLifecycleButton.value = !showLifecycleButton.value
}

const forceUpdate = () => {
  // 强制组件重新渲染
  showLifecycleButton.value = false
  nextTick(() => {
    showLifecycleButton.value = true
  })
}

// 生命周期钩子
onMounted(() => {
  addLifecycleLog('onMounted', '组件已挂载')
  console.log('🔥 组件已挂载')
})

onUpdated(() => {
  addLifecycleLog('onUpdated', '组件已更新')
  console.log('🔥 组件已更新')
})

onUnmounted(() => {
  addLifecycleLog('onUnmounted', '组件已卸载')
  console.log('🔥 组件已卸载')
})
</script>

<style scoped>
.element-analysis {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.element-analysis h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 40px;
  font-size: 2.5rem;
}

.analysis-section {
  margin-bottom: 60px;
  padding: 30px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.analysis-section h2 {
  color: #2d3748;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.button-test-area {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.analysis-result {
  background: #1a202c;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
  max-height: 400px;
  overflow-y: auto;
}

.analysis-result pre {
  margin: 0;
  white-space: pre-wrap;
  line-height: 1.5;
}

.event-test {
  display: flex;
  gap: 40px;
  align-items: flex-start;
}

.event-log {
  flex: 1;
  background: #1a202c;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
}

.event-log h4 {
  color: #63b3ed;
  margin-bottom: 16px;
}

.log-entries {
  max-height: 300px;
  overflow-y: auto;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid rgba(45, 55, 72, 0.5);
}

.timestamp {
  color: #a0aec0;
  min-width: 80px;
  font-size: 0.8rem;
}

.event-type {
  color: #68d391;
  min-width: 120px;
}

.target {
  color: #f6e05e;
  flex: 1;
}

.style-test {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.style-controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.computed-styles {
  background: #1a202c;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9rem;
}

.computed-styles pre {
  margin: 0;
  line-height: 1.5;
}

.lifecycle-test {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.lifecycle-controls {
  display: flex;
  gap: 12px;
}

.lifecycle-log {
  background: #1a202c;
  color: #e2e8f0;
  padding: 20px;
  border-radius: 12px;
}

.lifecycle-log h4 {
  color: #63b3ed;
  margin-bottom: 16px;
}

.phase {
  color: #68d391;
  min-width: 100px;
}

.details {
  color: #f6e05e;
  flex: 1;
}

/* 测试样式 */
.test-style-button {
  background: red !important;
  color: white !important;
  border: 2px solid blue !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .element-analysis {
    padding: 20px 16px;
  }
  
  .analysis-section {
    padding: 20px;
  }
  
  .event-test {
    flex-direction: column;
  }
  
  .button-test-area {
    flex-direction: column;
  }
  
  .style-controls {
    flex-direction: column;
  }
  
  .lifecycle-controls {
    flex-direction: column;
  }
}
</style> 