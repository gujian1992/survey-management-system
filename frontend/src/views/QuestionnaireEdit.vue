<template>
  <div class="questionnaire-edit">
    <el-card v-loading="loading">
      <template #header>
        <span>编辑问卷</span>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="问卷标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入问卷标题" maxlength="200" show-word-limit />
        </el-form-item>

        <el-form-item label="问卷描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入问卷描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="form.startTime"
            type="datetime"
            placeholder="选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :locale="locale"
          />
        </el-form-item>

        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="form.endTime"
            type="datetime"
            placeholder="选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            :locale="locale"
          />
        </el-form-item>

        <!-- 问题列表 -->
        <el-form-item label="问题设置">
          <div class="questions-container">
            <div v-for="(question, index) in form.questions" :key="index" class="question-item">
              <el-card>
                <template #header>
                  <div class="question-header">
                    <span>问题 {{ index + 1 }}</span>
                    <el-button type="danger" size="small" @click="removeQuestion(index)">删除</el-button>
                  </div>
                </template>

                <el-form-item label="问题标题">
                  <el-input v-model="question.title" placeholder="请输入问题标题" />
                </el-form-item>

                <el-form-item label="问题类型">
                  <el-select v-model="question.type" @change="onQuestionTypeChange(question)">
                    <el-option label="单选题" :value="1" />
                    <el-option label="多选题" :value="2" />
                    <el-option label="填空题" :value="3" />
                    <el-option label="下拉选择" :value="4" />
                    <el-option label="评分题" :value="5" />
                  </el-select>
                </el-form-item>

                <el-form-item v-if="[1, 2, 4].includes(question.type)" label="选项设置">
                  <div class="options-container">
                    <div v-for="(option, optionIndex) in question.options" :key="optionIndex" class="option-item">
                      <span class="option-label">{{ getOptionLabel(optionIndex) }}.</span>
                      <el-input 
                        v-model="question.options[optionIndex]" 
                        placeholder="请输入选项内容" 
                        @input="updateOptionText(question, optionIndex, $event)"
                      />
                      <el-button type="danger" size="small" @click="removeOption(question, optionIndex)">删除</el-button>
                    </div>
                    <el-button type="primary" size="small" @click="addOption(question)">添加选项</el-button>
                  </div>
                </el-form-item>

                <el-form-item v-if="question.type === 5" label="评分范围">
                  <el-radio-group v-model="question.scoreRange">
                    <el-radio label="1-5">1-5分</el-radio>
                    <el-radio label="1-10">1-10分</el-radio>
                  </el-radio-group>
                </el-form-item>

                <el-form-item label="是否必填">
                  <el-switch v-model="question.required" />
                </el-form-item>
              </el-card>
            </div>

            <el-button type="primary" @click="addQuestion" class="add-question-btn">
              <el-icon><Plus /></el-icon>
              添加问题
            </el-button>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">保存问卷</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { questionnaireAPI } from '../api'
import { validateTimeRange } from '@/utils/time'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const locale = zhCn
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  questions: []
})

const rules = {
  title: [
    { required: true, message: '请输入问卷标题', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入问卷描述', trigger: 'blur' }
  ],
  endTime: [
    {
      validator: (rule, value, callback) => {
        const validation = validateTimeRange(form.startTime, form.endTime)
        if (!validation.valid) {
          callback(new Error(validation.message))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 生成选项标签（A、B、C、D...）
const getOptionLabel = (index) => {
  return String.fromCharCode(65 + index) // 65是'A'的ASCII码
}

// 更新选项文本时同步更新新格式数据
const updateOptionText = (question, index, newText) => {
  if (question.optionList && question.optionList[index]) {
    question.optionList[index].text = newText
  }
}

const loadQuestionnaire = async () => {
  loading.value = true
  try {
    const id = route.params.id
    console.log('正在加载问卷, id:', id)
    const response = await questionnaireAPI.getDetail(id)
    console.log('问卷数据响应:', response)

    if (response.code === 200 && response.data) {
      const data = response.data
      form.id = data.id
      form.title = data.title
      form.description = data.description
      form.startTime = data.startTime
      form.endTime = data.endTime
      form.questions = data.questions || []
      
      // 处理选项数据，兼容新旧格式
      form.questions.forEach(question => {
        if (question.options) {
          // 如果options是对象数组（新格式），提取text字段作为旧格式
          if (Array.isArray(question.options) && question.options.length > 0 && typeof question.options[0] === 'object') {
            // 保存原始的新格式数据
            question.optionList = question.options
            // 提取text字段作为旧格式，用于编辑界面显示
            question.options = question.options.map(option => option.text || option)
          } else if (!question.optionList) {
            // 如果是旧格式，生成新格式数据
            question.optionList = question.options.map((text, index) => ({
              label: getOptionLabel(index),
              text: text,
              value: getOptionLabel(index),
              order: index
            }))
          }
        }
      })
    } else {
      ElMessage.error('问卷不存在或已过期')
      router.back()
    }
  } catch (error) {
    console.error('加载问卷失败:', error)
    ElMessage.error('加载问卷失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const addQuestion = () => {
  const newQuestion = {
    title: '',
    type: 1,
    options: ['选项1', '选项2'],
    required: false,
    scoreRange: '1-5'
  }
  
  // 同时生成新格式的选项数据
  newQuestion.optionList = newQuestion.options.map((text, index) => ({
    label: getOptionLabel(index),
    text: text,
    value: getOptionLabel(index),
    order: index
  }))
  
  form.questions.push(newQuestion)
}

const removeQuestion = (index) => {
  form.questions.splice(index, 1)
}

const onQuestionTypeChange = (question) => {
  if ([1, 2, 4].includes(question.type)) {
    if (!question.options || question.options.length === 0) {
      question.options = ['选项1', '选项2']
      // 生成新格式的选项数据
      question.optionList = question.options.map((text, index) => ({
        label: getOptionLabel(index),
        text: text,
        value: getOptionLabel(index),
        order: index
      }))
    }
  } else if (question.type === 5) {
    question.options = []
    question.optionList = []
    question.scoreRange = '1-5'
  } else {
    question.options = []
    question.optionList = []
  }
}

const addOption = (question) => {
  const newIndex = question.options.length
  const newText = `选项${newIndex + 1}`
  
  question.options.push(newText)
  
  // 同时更新新格式的选项数据
  if (!question.optionList) {
    question.optionList = []
  }
  question.optionList.push({
    label: getOptionLabel(newIndex),
    text: newText,
    value: getOptionLabel(newIndex),
    order: newIndex
  })
}

const removeOption = (question, index) => {
  if (question.options.length > 1) {
    question.options.splice(index, 1)
    
    // 同时更新新格式的选项数据
    if (question.optionList) {
      question.optionList.splice(index, 1)
      // 重新生成标签和顺序
      question.optionList.forEach((option, i) => {
        option.label = getOptionLabel(i)
        option.value = getOptionLabel(i)
        option.order = i
      })
    }
  } else {
    ElMessage.warning('至少保留一个选项')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    if (form.questions.length === 0) {
      ElMessage.warning('请至少添加一个问题')
      return
    }

    submitting.value = true
    
    // 打印调试信息
    console.log('提交的表单数据:', form)
    console.log('问题数据:', form.questions)
    
    // 直接传递包含ID的完整表单数据
    const submitData = JSON.parse(JSON.stringify(form))
    console.log('序列化后的数据:', submitData)
    
    await questionnaireAPI.update(submitData)
    ElMessage.success('问卷更新成功')
    
    // 触发全局数据刷新事件
    window.dispatchEvent(new CustomEvent('questionnaireDataChanged'))
    
    router.push('/questionnaire')
  } catch (error) {
    console.error('更新问卷失败:', error)
    ElMessage.error('更新问卷失败: ' + (error.response?.data?.message || error.message))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadQuestionnaire()
})
</script>

<style scoped>
.questionnaire-edit {
  padding: 0;
}

.questions-container {
  width: 100%;
}

.question-item {
  margin-bottom: 20px;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.options-container {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
}

.option-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.option-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: #409eff;
  color: white;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.option-item .el-input {
  margin-right: 10px;
  flex: 1;
}

.add-question-btn {
  width: 100%;
  margin-top: 20px;
}
</style> 