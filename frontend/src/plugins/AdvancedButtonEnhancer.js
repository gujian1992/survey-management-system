/**
 * 🚀 企业级高级按钮增强系统 - 修复版本
 * 作者：顶级前端工程师
 * 修复全局样式冲突问题，确保只影响指定按钮
 */

import { nextTick, ref, onMounted, onUnmounted, watch } from 'vue'

// 🎯 增强策略枚举
export const ENHANCEMENT_STRATEGIES = {
  INLINE_STYLE: 'inline_style',           // 内联样式策略
  CSS_OVERRIDE: 'css_override',           // CSS覆盖策略
  DOM_MANIPULATION: 'dom_manipulation',   // DOM操作策略
  HYBRID: 'hybrid'                        // 混合策略
}

// 🎨 主题配置类
export class ThemeConfig {
  constructor(name, config) {
    this.name = name
    this.states = {
      default: { ...config.default },
      hover: { ...config.hover },
      active: { ...config.active },
      focus: { ...config.focus },
      disabled: { ...config.disabled }
    }
    this.strategy = config.strategy || ENHANCEMENT_STRATEGIES.HYBRID
    this.priority = config.priority || 'normal'
    this.transitions = config.transitions || {}
  }
}

// 🔧 样式应用器 - 安全版本
class StyleApplier {
  constructor(strategy = ENHANCEMENT_STRATEGIES.HYBRID) {
    this.strategy = strategy
    this.styleCache = new Map()
    this.appliedElements = new WeakSet()
    this.enhancedClass = 'enhanced-button-active'
  }

  // 应用样式到元素 - 安全版本
  apply(element, styles, state = 'default') {
    if (!element) return false

    const actualElement = element.$el || element
    if (!actualElement) return false
    
    // 🛡️ 安全检查：只处理带有增强标记的按钮
    if (!this.isEnhancedButton(actualElement)) {
      console.warn('[StyleApplier] 尝试增强非指定按钮，跳过处理')
      return false
    }
    
    try {
      // 根据策略应用样式
      switch (this.strategy) {
        case ENHANCEMENT_STRATEGIES.INLINE_STYLE:
          return this.applyInlineStyle(actualElement, styles)
        case ENHANCEMENT_STRATEGIES.CSS_OVERRIDE:
          return this.applyCSSOverride(actualElement, styles, state)
        case ENHANCEMENT_STRATEGIES.DOM_MANIPULATION:
          return this.applyDOMManipulation(actualElement, styles)
        case ENHANCEMENT_STRATEGIES.HYBRID:
          return this.applyHybridStyle(actualElement, styles, state)
        default:
          return this.applyHybridStyle(actualElement, styles, state)
      }
    } catch (error) {
      console.error('[StyleApplier] 样式应用失败:', error)
      return false
    }
  }

  // 🛡️ 检查是否为增强按钮
  isEnhancedButton(element) {
    return element.classList.contains('enhanced-button') || 
           element.classList.contains('search-btn') || 
           element.classList.contains('reset-btn') ||
           element.dataset.enhanced === 'true'
  }

  // 内联样式策略 - 更安全的版本
  applyInlineStyle(element, styles) {
    // 标记为增强按钮
    element.dataset.enhanced = 'true'
    element.classList.add(this.enhancedClass)
    
    Object.entries(styles).forEach(([property, value]) => {
      const cssProperty = this.toCSSProperty(property)
      // 只对增强按钮应用!important
      element.style.setProperty(cssProperty, value, 'important')
    })
    
    this.appliedElements.add(element)
    return true
  }

  // CSS覆盖策略 - 精确选择器
  applyCSSOverride(element, styles, state) {
    const uniqueClass = `enhanced-btn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    element.classList.add(uniqueClass)
    element.dataset.enhanced = 'true'
    
    const styleSheet = this.getOrCreateStyleSheet()
    const cssText = Object.entries(styles)
      .map(([property, value]) => `${this.toCSSProperty(property)}: ${value} !important;`)
      .join(' ')
    
    // 使用更精确的选择器，避免影响其他元素
    const rule = `.${uniqueClass}[data-enhanced="true"] { ${cssText} }`
    styleSheet.insertRule(rule, styleSheet.cssRules.length)
    
    this.appliedElements.add(element)
    return true
  }

  // DOM操作策略
  applyDOMManipulation(element, styles) {
    element.dataset.enhanced = 'true'
    element.classList.add(this.enhancedClass)
    
    Object.entries(styles).forEach(([property, value]) => {
      element.style[property] = value
    })
    
    this.appliedElements.add(element)
    return true
  }

  // 混合策略 - 安全版本
  applyHybridStyle(element, styles, state) {
    // 标记元素
    element.dataset.enhanced = 'true'
    element.classList.add(this.enhancedClass)
    
    // 1. 安全地禁用Element Plus的部分样式（仅针对标记元素）
    this.safelyDisableElementPlusStyles(element)
    
    // 2. 应用内联样式
    this.applyInlineStyle(element, styles)
    
    // 3. 创建CSS覆盖规则（备用保险）
    this.applyCSSOverride(element, styles, state)
    
    this.appliedElements.add(element)
    return true
  }

  // 🛡️ 安全地禁用Element Plus样式
  safelyDisableElementPlusStyles(element) {
    // 只处理已标记的增强按钮
    if (!element.dataset.enhanced) return
    
    // 保存原始类名
    if (!element.dataset.originalClasses) {
      element.dataset.originalClasses = element.className
    }
    
    // 仅为增强按钮设置CSS变量覆盖
    element.style.setProperty('--el-button-hover-bg-color', 'transparent', 'important')
    element.style.setProperty('--el-button-hover-border-color', 'transparent', 'important')
    element.style.setProperty('--el-button-hover-text-color', 'inherit', 'important')
    element.style.setProperty('--el-button-active-bg-color', 'transparent', 'important')
    element.style.setProperty('--el-button-active-border-color', 'transparent', 'important')
    element.style.setProperty('--el-button-active-text-color', 'inherit', 'important')
  }

  // 获取或创建样式表
  getOrCreateStyleSheet() {
    let styleElement = document.getElementById('advanced-button-enhancer-styles')
    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = 'advanced-button-enhancer-styles'
      styleElement.setAttribute('data-enhanced-button', 'true')
      // 添加注释说明
      styleElement.textContent = '/* Advanced Button Enhancer Styles - Only affects marked buttons */\n'
      document.head.appendChild(styleElement)
    }
    return styleElement.sheet
  }

  // 清理样式 - 完全恢复
  cleanup(element) {
    if (!element) return
    
    const actualElement = element.$el || element
    if (!actualElement) return
    
    // 恢复原始类名
    if (actualElement.dataset.originalClasses) {
      actualElement.className = actualElement.dataset.originalClasses
      delete actualElement.dataset.originalClasses
    }
    
    // 清理增强标记
    delete actualElement.dataset.enhanced
    actualElement.classList.remove(this.enhancedClass)
    
    // 清理内联样式
    actualElement.style.cssText = ''
    
    // 移除动态类名
    const classes = Array.from(actualElement.classList)
    classes.forEach(cls => {
      if (cls.startsWith('enhanced-btn-')) {
        actualElement.classList.remove(cls)
      }
    })
    
    this.appliedElements.delete(actualElement)
  }

  // 工具方法
  toCSSProperty(jsProperty) {
    return jsProperty.replace(/([A-Z])/g, '-$1').toLowerCase()
  }
}

// 🎭 状态管理器
class StateManager {
  constructor() {
    this.states = new Map()
    this.transitions = new Map()
  }

  registerState(elementId, state) {
    this.states.set(elementId, state)
  }

  updateState(elementId, newState) {
    const currentState = this.states.get(elementId)
    if (currentState !== newState) {
      this.states.set(elementId, newState)
      return { from: currentState, to: newState }
    }
    return null
  }

  getState(elementId) {
    return this.states.get(elementId) || 'default'
  }

  cleanup(elementId) {
    this.states.delete(elementId)
    this.transitions.delete(elementId)
  }
}

// 🎪 事件管理器 - 更安全的版本
class EventManager {
  constructor() {
    this.proxyHandlers = new Map()
    this.originalHandlers = new Map()
  }

  bind(element, handlers) {
    const actualElement = element.$el || element
    if (!actualElement) return false

    // 只处理增强按钮
    if (!actualElement.dataset.enhanced && !actualElement.classList.contains('enhanced-button')) {
      return false
    }

    const elementId = this.getElementId(actualElement)
    const proxyHandlers = {}
    
    Object.entries(handlers).forEach(([event, handler]) => {
      const proxyHandler = (e) => {
        // 只阻止当前元素的默认行为，不影响全局
        if (e.target === actualElement || actualElement.contains(e.target)) {
          e.stopPropagation()
          handler(e)
        }
      }
      
      proxyHandlers[event] = proxyHandler
      actualElement.addEventListener(event, proxyHandler, { passive: false })
    })
    
    this.proxyHandlers.set(elementId, proxyHandlers)
    return true
  }

  unbind(element) {
    const actualElement = element.$el || element
    if (!actualElement) return
    
    const elementId = this.getElementId(actualElement)
    const proxyHandlers = this.proxyHandlers.get(elementId)
    
    if (proxyHandlers) {
      Object.entries(proxyHandlers).forEach(([event, handler]) => {
        actualElement.removeEventListener(event, handler)
      })
      this.proxyHandlers.delete(elementId)
    }
  }

  getElementId(element) {
    return element.id || element.dataset.enhancedId || `enhanced-${Date.now()}`
  }

  cleanup() {
    this.proxyHandlers.clear()
    this.originalHandlers.clear()
  }
}

// 🚀 高级按钮增强器核心类 - 安全版本
export class AdvancedButtonEnhancer {
  constructor(options = {}) {
    this.options = {
      strategy: ENHANCEMENT_STRATEGIES.HYBRID,
      enableAnimation: true,
      debugMode: false,
      performanceMode: false,
      safeMode: true, // 默认启用安全模式
      ...options
    }
    
    // 核心组件
    this.styleApplier = new StyleApplier(this.options.strategy)
    this.stateManager = new StateManager()
    this.eventManager = new EventManager()
    
    // 增强记录
    this.enhancedButtons = new Map()
    this.themes = new Map()
    
    if (this.options.debugMode) {
      console.log('[AdvancedButtonEnhancer] 安全模式系统初始化完成')
    }
  }

  // 注册主题
  registerTheme(themeConfig) {
    if (themeConfig instanceof ThemeConfig) {
      this.themes.set(themeConfig.name, themeConfig)
      if (this.options.debugMode) {
        console.log(`[AdvancedButtonEnhancer] 主题已注册: ${themeConfig.name}`)
      }
      return true
    }
    return false
  }

  // 增强按钮 - 安全版本
  async enhance(buttonRef, config) {
    return new Promise((resolve) => {
      nextTick(async () => {
        try {
          const enhancement = await this._createEnhancement(buttonRef, config)
          if (enhancement) {
            this.enhancedButtons.set(buttonRef, enhancement)
            await this._applyEnhancement(enhancement)
            
            if (this.options.debugMode) {
              console.log(`[AdvancedButtonEnhancer] 按钮增强成功: ${config.theme}`)
            }
            
            resolve(enhancement)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.error('[AdvancedButtonEnhancer] 增强失败:', error)
          resolve(null)
        }
      })
    })
  }

  // 移除增强
  remove(buttonRef) {
    const enhancement = this.enhancedButtons.get(buttonRef)
    if (enhancement) {
      this._cleanupEnhancement(enhancement)
      this.enhancedButtons.delete(buttonRef)
      
      if (this.options.debugMode) {
        console.log('[AdvancedButtonEnhancer] 按钮增强已移除')
      }
    }
  }

  // 清理所有增强
  cleanup() {
    for (const [buttonRef, enhancement] of this.enhancedButtons) {
      this._cleanupEnhancement(enhancement)
    }
    this.enhancedButtons.clear()
    this.eventManager.cleanup()
    
    // 清理样式表
    const styleElement = document.getElementById('advanced-button-enhancer-styles')
    if (styleElement) {
      styleElement.remove()
    }
    
    if (this.options.debugMode) {
      console.log('[AdvancedButtonEnhancer] 所有增强已清理')
    }
  }

  // 创建增强配置
  async _createEnhancement(buttonRef, config) {
    const theme = this.themes.get(config.theme)
    if (!theme) {
      console.warn(`[AdvancedButtonEnhancer] 未知主题: ${config.theme}`)
      return null
    }

    const element = buttonRef.value?.$el || buttonRef.value
    if (!element) {
      console.warn('[AdvancedButtonEnhancer] 按钮元素无效')
      return null
    }

    // 🛡️ 安全标记按钮
    element.dataset.enhanced = 'true'
    element.classList.add('enhanced-button')

    return {
      buttonRef,
      element,
      config: {
        theme: config.theme,
        customStyles: config.customStyles || {},
        enableAnimation: config.enableAnimation ?? this.options.enableAnimation,
        strategy: config.strategy || theme.strategy,
        ...config
      },
      theme,
      currentState: 'default',
      isAnimating: false,
      elementId: this._getElementId(element)
    }
  }

  // 应用增强
  async _applyEnhancement(enhancement) {
    // 1. 应用默认样式
    await this._applyState(enhancement, 'default')
    
    // 2. 绑定事件
    this._bindEvents(enhancement)
    
    // 3. 注册状态
    this.stateManager.registerState(enhancement.elementId, 'default')
  }

  // 应用状态
  async _applyState(enhancement, state) {
    const { element, theme, config } = enhancement
    
    // 合并主题样式和自定义样式
    const themeStyles = theme.states[state] || {}
    const customStyles = config.customStyles[state] || {}
    const mergedStyles = { ...themeStyles, ...customStyles }
    
    // 应用样式
    const success = this.styleApplier.apply(element, mergedStyles, state)
    
    if (success) {
      enhancement.currentState = state
      
      // 更新状态管理器
      const stateChange = this.stateManager.updateState(enhancement.elementId, state)
      
      if (stateChange && this.options.debugMode) {
        console.log(`[AdvancedButtonEnhancer] 状态变化: ${stateChange.from} -> ${stateChange.to}`)
      }
    }
    
    return success
  }

  // 绑定事件
  _bindEvents(enhancement) {
    const handlers = {
      mouseenter: () => this._handleStateChange(enhancement, 'hover'),
      mouseleave: () => this._handleStateChange(enhancement, 'default'),
      mousedown: () => this._handleStateChange(enhancement, 'active'),
      mouseup: () => this._handleStateChange(enhancement, 'hover'),
      focus: () => this._handleStateChange(enhancement, 'focus'),
      blur: () => this._handleStateChange(enhancement, 'default')
    }

    this.eventManager.bind(enhancement.buttonRef, handlers)
  }

  // 处理状态变化
  _handleStateChange(enhancement, newState) {
    if (enhancement.isAnimating && newState !== 'default') return

    this._applyState(enhancement, newState)

    // 动画标记
    if (enhancement.config.enableAnimation && newState !== 'default') {
      enhancement.isAnimating = true
      setTimeout(() => {
        enhancement.isAnimating = false
      }, 300)
    }
  }

  // 清理增强
  _cleanupEnhancement(enhancement) {
    this.styleApplier.cleanup(enhancement.buttonRef)
    this.eventManager.unbind(enhancement.buttonRef)
    this.stateManager.cleanup(enhancement.elementId)
  }

  // 工具方法
  _getElementId(element) {
    return element.id || element.className || `enhanced-${Date.now()}`
  }

  // 获取统计信息
  getStats() {
    return {
      enhancedButtons: this.enhancedButtons.size,
      registeredThemes: this.themes.size,
      activeStates: this.stateManager.states.size,
      eventListeners: this.eventManager.proxyHandlers.size
    }
  }
}

// 全局增强器实例
let globalAdvancedEnhancer = null

// Vue插件接口
export const AdvancedButtonEnhancerPlugin = {
  install(app, options = {}) {
    globalAdvancedEnhancer = new AdvancedButtonEnhancer({
      safeMode: true, // 强制启用安全模式
      ...options
    })
    
    app.config.globalProperties.$advancedButtonEnhancer = globalAdvancedEnhancer
    app.provide('advancedButtonEnhancer', globalAdvancedEnhancer)
    
    console.log('[AdvancedButtonEnhancer] Vue插件已安装（安全模式）')
  }
}

// Composition API 钩子
export function useAdvancedButtonEnhancer(options = {}) {
  const enhancer = globalAdvancedEnhancer || new AdvancedButtonEnhancer({
    safeMode: true,
    ...options
  })
  const enhancedButtons = ref(new Map())

  const enhance = async (buttonRef, config) => {
    if (!buttonRef.value) {
      console.warn('[useAdvancedButtonEnhancer] 按钮引用无效')
      return null
    }

    const enhancement = await enhancer.enhance(buttonRef, config)
    if (enhancement) {
      enhancedButtons.value.set(buttonRef, enhancement)
    }
    return enhancement
  }

  const remove = (buttonRef) => {
    enhancer.remove(buttonRef)
    enhancedButtons.value.delete(buttonRef)
  }

  const enhanceMultiple = async (configurations) => {
    const results = await Promise.all(
      configurations.map(({ buttonRef, config }) => enhance(buttonRef, config))
    )
    return results.filter(Boolean)
  }

  const registerTheme = (themeConfig) => {
    return enhancer.registerTheme(themeConfig)
  }

  const cleanup = () => {
    for (const [buttonRef] of enhancedButtons.value) {
      remove(buttonRef)
    }
    enhancedButtons.value.clear()
  }

  onUnmounted(() => {
    cleanup()
  })

  return {
    enhance,
    remove,
    enhanceMultiple,
    registerTheme,
    cleanup,
    enhancedButtons: enhancedButtons.value,
    enhancer
  }
}

// 预设主题
export const PRESET_THEMES = {
  search: new ThemeConfig('search', {
    default: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hover: {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)'
    },
    active: {
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(102, 126, 234, 0.5)'
    },
    strategy: ENHANCEMENT_STRATEGIES.HYBRID
  }),

  reset: new ThemeConfig('reset', {
    default: {
      background: 'rgba(255, 255, 255, 0.9)',
      border: '1px solid rgba(156, 163, 175, 0.3)',
      borderRadius: '12px',
      color: '#6b7280',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hover: {
      background: 'rgba(248, 250, 252, 0.95)',
      borderColor: 'rgba(102, 126, 234, 0.3)',
      color: '#4a5568',
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    },
    active: {
      transform: 'translateY(0)',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
    },
    strategy: ENHANCEMENT_STRATEGIES.HYBRID
  })
}

export default AdvancedButtonEnhancer 