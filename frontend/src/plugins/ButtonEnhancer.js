/**
 * 🚀 企业级按钮增强插件系统
 * 作者：顶级前端工程师
 * 功能：提供可扩展、可配置的按钮样式增强解决方案
 */

import { nextTick, ref, onMounted, onUnmounted } from 'vue'

// 🎯 按钮样式主题配置
const BUTTON_THEMES = {
  // 搜索按钮主题
  search: {
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
    }
  },
  
  // 重置按钮主题
  reset: {
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
    }
  },

  // 危险操作按钮主题
  danger: {
    default: {
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hover: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)'
    }
  },

  // 成功操作按钮主题
  success: {
    default: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      border: 'none',
      borderRadius: '12px',
      color: 'white',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    },
    hover: {
      background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(16, 185, 129, 0.4)'
    }
  }
}

// 🔧 样式应用工具类
class StyleApplier {
  static toCSSProperty(jsProperty) {
    return jsProperty.replace(/([A-Z])/g, '-$1').toLowerCase()
  }

  static applyStyles(element, styles, priority = 'important') {
    if (!element || !styles) return false

    try {
      const actualElement = element.$el || element
      
      Object.entries(styles).forEach(([property, value]) => {
        const cssProperty = this.toCSSProperty(property)
        actualElement.style.setProperty(cssProperty, value, priority)
      })
      
      return true
    } catch (error) {
      console.warn('[ButtonEnhancer] 样式应用失败:', error)
      return false
    }
  }

  static removeStyles(element, properties) {
    if (!element || !properties) return

    try {
      const actualElement = element.$el || element
      
      properties.forEach(property => {
        const cssProperty = this.toCSSProperty(property)
        actualElement.style.removeProperty(cssProperty)
      })
    } catch (error) {
      console.warn('[ButtonEnhancer] 样式移除失败:', error)
    }
  }
}

// 🎨 按钮增强器核心类
class ButtonEnhancer {
  constructor(options = {}) {
    this.options = {
      enableAnimation: true,
      enableRipple: false,
      enableSound: false,
      debugMode: false,
      ...options
    }
    
    this.enhancedButtons = new Map()
    this.globalListeners = new Map()
    
    if (this.options.debugMode) {
      console.log('[ButtonEnhancer] 插件初始化完成')
    }
  }

  // 🔌 注册按钮增强
  enhance(buttonRef, config) {
    return new Promise((resolve) => {
      nextTick(() => {
        try {
          const enhancement = this._createEnhancement(buttonRef, config)
          if (enhancement) {
            this.enhancedButtons.set(buttonRef, enhancement)
            this._bindEvents(buttonRef, enhancement)
            
            if (this.options.debugMode) {
              console.log(`[ButtonEnhancer] 按钮增强注册成功: ${config.theme}`)
            }
            
            resolve(enhancement)
          } else {
            resolve(null)
          }
        } catch (error) {
          console.error('[ButtonEnhancer] 按钮增强失败:', error)
          resolve(null)
        }
      })
    })
  }

  // 🗑️ 移除按钮增强
  remove(buttonRef) {
    const enhancement = this.enhancedButtons.get(buttonRef)
    if (enhancement) {
      this._unbindEvents(buttonRef, enhancement)
      this.enhancedButtons.delete(buttonRef)
      
      if (this.options.debugMode) {
        console.log('[ButtonEnhancer] 按钮增强已移除')
      }
    }
  }

  // 🧹 清理所有增强
  cleanup() {
    for (const [buttonRef, enhancement] of this.enhancedButtons) {
      this._unbindEvents(buttonRef, enhancement)
    }
    this.enhancedButtons.clear()
    
    if (this.options.debugMode) {
      console.log('[ButtonEnhancer] 所有增强已清理')
    }
  }

  // 🎯 创建增强配置
  _createEnhancement(buttonRef, config) {
    const theme = BUTTON_THEMES[config.theme]
    if (!theme) {
      console.warn(`[ButtonEnhancer] 未知主题: ${config.theme}`)
      return null
    }

    return {
      buttonRef,
      config: {
        theme: config.theme,
        customStyles: config.customStyles || {},
        enableAnimation: config.enableAnimation ?? this.options.enableAnimation,
        enableRipple: config.enableRipple ?? this.options.enableRipple,
        ...config
      },
      theme,
      currentState: 'default',
      isAnimating: false
    }
  }

  // 🔗 绑定事件监听器
  _bindEvents(buttonRef, enhancement) {
    const handlers = {
      mouseenter: () => this._handleStateChange(enhancement, 'hover'),
      mouseleave: () => this._handleStateChange(enhancement, 'default'),
      mousedown: () => this._handleStateChange(enhancement, 'active'),
      mouseup: () => this._handleStateChange(enhancement, 'hover'),
      focus: () => this._handleFocus(enhancement),
      blur: () => this._handleBlur(enhancement)
    }

    // 存储处理器引用以便后续清理
    enhancement.handlers = handlers

    // 绑定事件
    nextTick(() => {
      const element = buttonRef.value?.$el || buttonRef.value
      if (element) {
        Object.entries(handlers).forEach(([event, handler]) => {
          element.addEventListener(event, handler)
        })

        // 应用默认样式
        this._applyThemeStyles(enhancement, 'default')
      }
    })
  }

  // 🔓 解绑事件监听器
  _unbindEvents(buttonRef, enhancement) {
    const element = buttonRef.value?.$el || buttonRef.value
    if (element && enhancement.handlers) {
      Object.entries(enhancement.handlers).forEach(([event, handler]) => {
        element.removeEventListener(event, handler)
      })
    }
  }

  // 🎭 处理状态变化
  _handleStateChange(enhancement, newState) {
    if (enhancement.isAnimating && newState !== 'default') return

    enhancement.currentState = newState
    this._applyThemeStyles(enhancement, newState)

    // 动画标记
    if (enhancement.config.enableAnimation && newState !== 'default') {
      enhancement.isAnimating = true
      setTimeout(() => {
        enhancement.isAnimating = false
      }, 300)
    }

    if (this.options.debugMode) {
      console.log(`[ButtonEnhancer] 状态变化: ${newState}`)
    }
  }

  // 🎨 应用主题样式
  _applyThemeStyles(enhancement, state) {
    const styles = {
      ...enhancement.theme[state],
      ...enhancement.config.customStyles[state]
    }

    const success = StyleApplier.applyStyles(
      enhancement.buttonRef.value,
      styles
    )

    if (!success && this.options.debugMode) {
      console.warn('[ButtonEnhancer] 样式应用失败')
    }
  }

  // 🎯 焦点处理
  _handleFocus(enhancement) {
    const element = enhancement.buttonRef.value?.$el || enhancement.buttonRef.value
    if (element) {
      element.style.outline = '2px solid rgba(102, 126, 234, 0.5)'
      element.style.outlineOffset = '2px'
    }
  }

  // 🎯 失焦处理
  _handleBlur(enhancement) {
    const element = enhancement.buttonRef.value?.$el || enhancement.buttonRef.value
    if (element) {
      element.style.outline = 'none'
    }
  }
}

// 🎪 全局增强器实例
let globalEnhancer = null

// 🔌 Vue插件接口
export const ButtonEnhancerPlugin = {
  install(app, options = {}) {
    globalEnhancer = new ButtonEnhancer(options)
    
    // 全局属性
    app.config.globalProperties.$buttonEnhancer = globalEnhancer
    
    // 全局提供
    app.provide('buttonEnhancer', globalEnhancer)
    
    console.log('[ButtonEnhancer] Vue插件已安装')
  }
}

// 🎯 Composition API 钩子
export function useButtonEnhancer(options = {}) {
  const enhancer = globalEnhancer || new ButtonEnhancer(options)
  const enhancedButtons = ref(new Map())

  // 增强按钮
  const enhance = async (buttonRef, config) => {
    if (!buttonRef.value) {
      console.warn('[useButtonEnhancer] 按钮引用无效')
      return null
    }

    const enhancement = await enhancer.enhance(buttonRef, config)
    if (enhancement) {
      enhancedButtons.value.set(buttonRef, enhancement)
    }
    return enhancement
  }

  // 移除增强
  const remove = (buttonRef) => {
    enhancer.remove(buttonRef)
    enhancedButtons.value.delete(buttonRef)
  }

  // 批量增强
  const enhanceMultiple = async (configurations) => {
    const results = await Promise.all(
      configurations.map(({ buttonRef, config }) => enhance(buttonRef, config))
    )
    return results.filter(Boolean)
  }

  // 清理函数
  const cleanup = () => {
    for (const [buttonRef] of enhancedButtons.value) {
      remove(buttonRef)
    }
    enhancedButtons.value.clear()
  }

  // 组件卸载时自动清理
  onUnmounted(() => {
    cleanup()
  })

  return {
    enhance,
    remove,
    enhanceMultiple,
    cleanup,
    enhancedButtons: enhancedButtons.value,
    enhancer
  }
}

// 🎨 主题管理器
export class ThemeManager {
  static registerTheme(name, theme) {
    BUTTON_THEMES[name] = theme
    console.log(`[ThemeManager] 主题已注册: ${name}`)
  }

  static getTheme(name) {
    return BUTTON_THEMES[name]
  }

  static getAllThemes() {
    return { ...BUTTON_THEMES }
  }

  static updateTheme(name, updates) {
    if (BUTTON_THEMES[name]) {
      BUTTON_THEMES[name] = {
        ...BUTTON_THEMES[name],
        ...updates
      }
      console.log(`[ThemeManager] 主题已更新: ${name}`)
    }
  }
}

// 🚀 导出
export {
  ButtonEnhancer,
  StyleApplier,
  BUTTON_THEMES
}

export default ButtonEnhancer 