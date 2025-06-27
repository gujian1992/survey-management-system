<template>
  <div class="test-container">
    <h1>按钮悬停效果测试</h1>
    
    <div class="test-section">
      <h2>原始SearchPanel组件测试</h2>
      <SearchPanel
        :search-model="testSearchForm"
        @search="handleSearch"
        @reset="handleReset"
      >
        <template #search-fields>
          <div class="search-field">
            <label>测试字段</label>
            <el-input v-model="testSearchForm.test" placeholder="测试输入" />
          </div>
        </template>
      </SearchPanel>
    </div>
    
    <div class="test-section">
      <h2>直接按钮测试</h2>
      <div class="direct-buttons">
        <el-button
          ref="directSearchBtn"
          type="primary"
          class="test-search-btn"
        >
          <el-icon><Search /></el-icon>
          直接搜索按钮
        </el-button>
        
        <el-button
          ref="directResetBtn"
          class="test-reset-btn"
        >
          <el-icon><RefreshLeft /></el-icon>
          直接重置按钮
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import SearchPanel from '@/components/base/SearchPanel.vue'

const testSearchForm = ref({
  test: ''
})

const directSearchBtn = ref(null)
const directResetBtn = ref(null)

const handleSearch = () => {
  console.log('Search triggered')
}

const handleReset = () => {
  console.log('Reset triggered')
}

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      console.log('🧪 HoverTest mounted - applying direct button effects')
      
      // 直接测试按钮
      const testSearchBtn = document.querySelector('.test-search-btn')
      const testResetBtn = document.querySelector('.test-reset-btn')
      
      console.log('Test buttons found:')
      console.log('testSearchBtn:', testSearchBtn)
      console.log('testResetBtn:', testResetBtn)
      
      if (testSearchBtn) {
        console.log('✅ Setting up test search button hover')
        
        testSearchBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        testSearchBtn.style.border = 'none'
        testSearchBtn.style.borderRadius = '12px'
        testSearchBtn.style.padding = '8px 20px'
        testSearchBtn.style.color = 'white'
        testSearchBtn.style.transition = 'all 0.3s ease'
        
        testSearchBtn.addEventListener('mouseenter', () => {
          console.log('🔥🔥🔥 TEST SEARCH BUTTON HOVER ENTER!')
          testSearchBtn.style.background = 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)'
          testSearchBtn.style.transform = 'translateY(-2px)'
          testSearchBtn.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)'
        })
        
        testSearchBtn.addEventListener('mouseleave', () => {
          console.log('🔥🔥🔥 TEST SEARCH BUTTON HOVER LEAVE!')
          testSearchBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          testSearchBtn.style.transform = 'translateY(0)'
          testSearchBtn.style.boxShadow = 'none'
        })
      }
      
      if (testResetBtn) {
        console.log('✅ Setting up test reset button hover')
        
        testResetBtn.style.background = 'rgba(255, 255, 255, 0.9)'
        testResetBtn.style.border = '1px solid rgba(156, 163, 175, 0.3)'
        testResetBtn.style.borderRadius = '12px'
        testResetBtn.style.padding = '8px 20px'
        testResetBtn.style.color = '#6b7280'
        testResetBtn.style.transition = 'all 0.3s ease'
        
        testResetBtn.addEventListener('mouseenter', () => {
          console.log('🔥🔥🔥 TEST RESET BUTTON HOVER ENTER!')
          testResetBtn.style.background = 'rgba(248, 250, 252, 0.95)'
          testResetBtn.style.borderColor = 'rgba(102, 126, 234, 0.3)'
          testResetBtn.style.color = '#4a5568'
          testResetBtn.style.transform = 'translateY(-1px)'
          testResetBtn.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)'
        })
        
        testResetBtn.addEventListener('mouseleave', () => {
          console.log('🔥🔥🔥 TEST RESET BUTTON HOVER LEAVE!')
          testResetBtn.style.background = 'rgba(255, 255, 255, 0.9)'
          testResetBtn.style.borderColor = 'rgba(156, 163, 175, 0.3)'
          testResetBtn.style.color = '#6b7280'
          testResetBtn.style.transform = 'translateY(0)'
          testResetBtn.style.boxShadow = 'none'
        })
      }
    }, 200)
  })
})
</script>

<style scoped>
.test-container {
  padding: 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.test-section h2 {
  color: #374151;
  margin-bottom: 20px;
}

.direct-buttons {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-field label {
  font-weight: 600;
  color: #374151;
}
</style> 