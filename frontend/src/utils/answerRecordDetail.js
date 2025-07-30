import { ref, computed, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { answerRecordApi } from '@/api/answerRecord'
import { answerSessionApi } from '@/api/answerSession'

export const getQuestionTypeName = (type) => {
    const typeMap = {
        1: '单选题',
        2: '多选题',
        3: '判断题',
        4: '填空题',
        5: '问答题',
        6: '评分题'
    }
    return typeMap[type] || '未知题型'
}

export const getQuestionTypeColor = (type) => {
    const colorMap = {
        1: 'primary',
        2: 'success',
        3: 'warning',
        4: 'info',
        5: 'danger',
        6: 'primary'
    }
    return colorMap[type] || 'info'
}

export const getOptionLabel = (index) => {
    return String.fromCharCode(65 + index)
}

export const parseOptions = (optionsString) => {
    if (!optionsString) return []
    if (Array.isArray(optionsString)) return optionsString

    try {
        const parsed = JSON.parse(optionsString)
        return Array.isArray(parsed) ? parsed : []
    } catch {
        return optionsString.split('\n').filter(opt => opt.trim())
    }
}

export const getOptionsData = (item) => {
    return item.options || item.questionOptions || item.optionsList || item.optionsData || ''
}

export const shouldShowOptions = (item) => {
    const hasOptions = getOptionsData(item)
    return hasOptions && [1, 2, 6].includes(item.questionType)
}

export const getOptionClass = (item, option, optionIndex) => {
    const correctAnswer = item.correctAnswer
    const label = getOptionLabel(optionIndex)

    const classes = ['option-item']

    // 只检查正确答案，用绿色标注
    if (correctAnswer) {
        if (isCorrectOption(item, correctAnswer, label)) {
            classes.push('correct-option')
        }
    }

    return classes.join(' ')
}

// 检查某个选项是否是正确答案
const isCorrectOption = (item, correctAnswer, label) => {
    if (!correctAnswer || !label) return false

    // 方法1: 通过convertAnswerToLabels转换后匹配
    const options = parseOptions(getOptionsData(item))
    if (options && options.length > 0) {
        const correctLabels = convertAnswerToLabels(correctAnswer, options)
        if (correctLabels) {
            const labelArray = correctLabels.split(',').map(l => l.trim())
            return labelArray.includes(label)
        }
    }

    // 方法2: 直接字母匹配（备用）
    return isAnswerContainsOption(correctAnswer, label)
}

// 辅助函数：检查答案是否包含某个选项标签
const isAnswerContainsOption = (answer, label) => {
    if (!answer || !label) return false

    // 如果答案就是单个字母
    if (answer === label) return true

    // 如果答案是多个字母组合（如 A,C）
    const answerLabels = answer.split(/[,，、；;]/).map(l => l.trim().toUpperCase())
    return answerLabels.includes(label.toUpperCase())
}

export const getDataSource = (item) => {
    if (item.score !== undefined || item.userScore !== undefined) return 'score'
    if (item.isCorrect !== undefined) return 'isCorrect'
    return 'calculated'
}

export const isAnswerCorrect = (item) => {
    const userAnswer = String(item.userAnswer || '').trim()
    const correctAnswer = String(item.correctAnswer || '').trim()

    if (!userAnswer || !correctAnswer) {
        return false
    }

    if (userAnswer === correctAnswer) {
        return true
    }

    const userLabels = convertAnswerToLabels(userAnswer, parseOptions(getOptionsData(item)))
    const correctLabels = convertAnswerToLabels(correctAnswer, parseOptions(getOptionsData(item)))

    if (userLabels && correctLabels) {
        return userLabels === correctLabels
    }

    return userAnswer.toLowerCase() === correctAnswer.toLowerCase()
}

export const convertAnswerToLabels = (answer, options) => {
    if (!answer || !options || options.length === 0) return null

    let answerParts = []

    // 处理JSON数组格式的答案 ["MySQL", "PostgreSQL", "Oracle"]
    if (answer.startsWith('[') && answer.endsWith(']')) {
        try {
            const jsonArray = JSON.parse(answer)
            if (Array.isArray(jsonArray)) {
                answerParts = jsonArray.map(item => String(item).trim())
            }
        } catch (e) {
            // JSON解析失败，按普通字符串处理
        }
    }

    // 如果不是JSON数组，按普通分隔符处理
    if (answerParts.length === 0) {
        answerParts = answer.split(/[,，、；;]/).map(part => part.trim()).filter(part => part)
    }

    // 首先尝试处理已经是字母格式的答案（如 "A,C" 或 "A" 等）
    const directLetterMatch = answer.match(/\b[A-Za-z]\b/g)
    if (directLetterMatch && directLetterMatch.length <= options.length && !answer.includes('[')) {
        const uniqueLetters = [...new Set(directLetterMatch.map(letter => letter.toUpperCase()))]
        // 验证字母是否在有效范围内
        const validLetters = uniqueLetters.filter(letter => {
            const index = letter.charCodeAt(0) - 65 // A=0, B=1, etc.
            return index >= 0 && index < options.length
        })
        if (validLetters.length > 0) {
            return validLetters.sort().join(',')
        }
    }

    // 按选项内容匹配转换为字母标签
    const labels = []

    answerParts.forEach(answerPart => {
        if (/^[A-Z]$/.test(answerPart)) {
            const index = answerPart.charCodeAt(0) - 65
            if (index >= 0 && index < options.length && !labels.includes(answerPart)) {
                labels.push(answerPart)
            }
        } else if (/^[a-z]$/.test(answerPart)) {
            const upperCase = answerPart.toUpperCase()
            const index = upperCase.charCodeAt(0) - 65
            if (index >= 0 && index < options.length && !labels.includes(upperCase)) {
                labels.push(upperCase)
            }
        } else {
            const optionIndex = options.findIndex(option =>
                option && option.toString().trim().toLowerCase() === answerPart.toLowerCase()
            )

            if (optionIndex !== -1) {
                const label = getOptionLabel(optionIndex)
                if (!labels.includes(label)) {
                    labels.push(label)
                }
            }
        }
    })

    return labels.length > 0 ? labels.sort().join(',') : null
}

export const getFormattedAnswer = (item, answer, type) => {
    if (!answer) return type === 'user' ? '未作答' : ''

    // 对于选择题（单选、多选、评分题），始终显示字母标签
    if ([1, 2, 6].includes(item.questionType)) {
        const options = parseOptions(getOptionsData(item))
        if (options && options.length > 0) {
            const labels = convertAnswerToLabels(answer, options)
            if (labels) {
                return labels
            }

            // 如果转换失败，尝试直接处理已经是单个字母的情况（如 "A,C" 或 "A" 等）
            const singleLetterMatch = answer.match(/\b[A-Za-z]\b/g)
            if (singleLetterMatch) {
                const uniqueLetters = [...new Set(singleLetterMatch.map(letter => letter.toUpperCase()))]
                return uniqueLetters.sort().join(',')
            }
        }
    }

    return answer
}

export const getItemScore = (item) => {
    const backendScore = item.score !== undefined ? item.score : item.userScore

    if (backendScore !== undefined) {
        const maxScore = item.maxScore || item.totalScore || item.points || 1
        let score = Number(backendScore) || 0

        if (item.isCorrect === true && score === 0) {
            score = maxScore
        }

        return score
    }

    const maxScore = item.maxScore || item.totalScore || item.points || 1
    const calculated = isAnswerCorrect(item)

    if (calculated) {
        return maxScore
    } else {
        return 0
    }
}

export const getAnswerItemClass = (item) => {
    // 优先使用我们的答案判断逻辑
    const isCorrect = isAnswerCorrect(item)

    if (isCorrect) {
        return 'correct'
    }

    // 如果答案不正确，检查是否有部分分数
    const score = getItemScore(item)
    const maxScore = item.maxScore || item.totalScore || item.points || 1

    if (score > 0 && score < maxScore) {
        return 'partial'
    } else {
        return 'incorrect'
    }
}

export const getScoreClass = (item) => {
    const score = getItemScore(item)
    const maxScore = item.maxScore || item.totalScore || item.points || 1

    if (item.isCorrect !== undefined) {
        return item.isCorrect ? 'score-correct' : 'score-incorrect'
    }

    if (score === maxScore) {
        return 'score-correct'
    } else if (score > 0) {
        return 'score-partial'
    } else {
        return 'score-incorrect'
    }
}

export const getStatusIcon = (item) => {
    // 优先使用我们的答案判断逻辑，而不是后端的isCorrect字段
    const isCorrect = isAnswerCorrect(item)

    if (isCorrect) {
        return 'CircleCheck'
    }

    // 如果答案不正确，检查是否有部分分数
    const score = getItemScore(item)
    const maxScore = item.maxScore || item.totalScore || item.points || 1

    if (score > 0 && score < maxScore) {
        return 'Warning'
    } else {
        return 'CloseBold'
    }
}

export const getStatusIconClass = (item) => {
    const icon = getStatusIcon(item)

    if (icon === 'CircleCheck') {
        return 'correct-icon'
    } else if (icon === 'Warning') {
        return 'partial-icon'
    } else {
        return 'incorrect-icon'
    }
}

export const calculateTotalScore = (answerDetails) => {
    if (!answerDetails || answerDetails.length === 0) return 0

    let totalScore = 0
    let totalMaxScore = 0

    answerDetails.forEach(item => {
        const maxScore = item.maxScore || item.totalScore || item.points || 1
        totalMaxScore += maxScore

        let actualScore = getItemScore(item)
        totalScore += actualScore
    })

    return totalScore
}

export function useAnswerRecordDetail() {
    const route = useRoute()
    const router = useRouter()

    const loading = ref(false)
    const sessionCode = ref(route.params.sessionCode || '')
    const sessionDetail = ref(null)
    const answerDetails = ref([])
    const statistics = ref(null)
    const feedback = ref(null)
    const errorMessage = ref('')

    // 添加数据稳定性控制
    const dataReady = ref(false)
    const contentReady = ref(false) // 统一的内容显示控制
    const stableSessionDetail = ref(null)
    const stableAnswerDetails = ref([])
    const stableStatistics = ref(null)

    const statusInfo = computed(() => {
        const detail = dataReady.value ? stableSessionDetail.value : sessionDetail.value
        if (!detail) {
            return { label: '未知', type: 'info' }
        }

        const status = detail.status
        const statusMap = {
            0: { label: '未开始', type: 'info' },
            1: { label: '答题中', type: 'warning' },
            2: { label: '已完成', type: 'success' },
            3: { label: '已超时', type: 'danger' }
        }

        return statusMap[status] || { label: '未知', type: 'info' }
    })

    const gradeInfo = computed(() => {
        const detail = dataReady.value ? stableSessionDetail.value : sessionDetail.value
        if (!detail || detail.status !== 2) {
            return { label: '未完成', type: 'info' }
        }

        const totalScore = detail.totalScore || 0
        const maxScore = detail.maxScore || 100
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

        if (percentage >= 90) {
            return { label: '优秀', type: 'success' }
        } else if (percentage >= 80) {
            return { label: '良好', type: 'success' }
        } else if (percentage >= 70) {
            return { label: '中等', type: 'warning' }
        } else if (percentage >= 60) {
            return { label: '及格', type: 'warning' }
        } else {
            return { label: '不及格', type: 'danger' }
        }
    })

    const scorePercentage = computed(() => {
        const detail = dataReady.value ? stableSessionDetail.value : sessionDetail.value
        if (!detail || detail.status !== 2) {
            return 0
        }

        const totalScore = detail.totalScore || 0
        const maxScore = detail.maxScore || 100

        return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0
    })

    const calculatedStats = computed(() => {
        const details = dataReady.value ? stableAnswerDetails.value : answerDetails.value
        if (!details || details.length === 0) {
            return { correctCount: 0, wrongCount: 0, unansweredCount: 0 }
        }

        let correctCount = 0
        let wrongCount = 0
        let unansweredCount = 0

        details.forEach(item => {
            if (!item.userAnswer || item.userAnswer.trim() === '') {
                unansweredCount++
            } else if (item.isCorrect !== undefined) {
                if (item.isCorrect) {
                    correctCount++
                } else {
                    wrongCount++
                }
            } else {
                const score = getItemScore(item)
                const maxScore = item.maxScore || item.totalScore || item.points || 1

                if (score === maxScore) {
                    correctCount++
                } else {
                    wrongCount++
                }
            }
        })

        return { correctCount, wrongCount, unansweredCount }
    })

    const answerProgress = computed(() => {
        const details = dataReady.value ? stableAnswerDetails.value : answerDetails.value
        if (!details || details.length === 0) return 0

        const answeredCount = details.filter(item =>
            item.userAnswer && item.userAnswer.trim() !== ''
        ).length

        return Math.round((answeredCount / details.length) * 100)
    })

    const progressColor = computed(() => {
        const progress = answerProgress.value
        if (progress >= 80) return '#67c23a'
        if (progress >= 60) return '#e6a23c'
        return '#f56c6c'
    })

    const goBack = () => {
        router.push('/my-answer-records')
    }

    const getFormattedDuration = () => {
        // 优先使用稳定数据，回退到原始数据
        const session = dataReady.value ? stableSessionDetail.value : sessionDetail.value

        if (!session) {
            return '0分0秒'
        }

        let duration = 0

        // 尝试从多个字段获取时长
        if (session.duration !== undefined && session.duration !== null) {
            duration = session.duration
        } else if (session.usedTime !== undefined && session.usedTime !== null) {
            duration = session.usedTime
        } else if (session.startTime && session.endTime) {
            // 计算时间差（毫秒转秒）
            const startTime = new Date(session.startTime).getTime()
            const endTime = new Date(session.endTime).getTime()
            duration = Math.floor((endTime - startTime) / 1000)
        }

        if (duration <= 0) {
            return '0分0秒'
        }

        const hours = Math.floor(duration / 3600)
        const minutes = Math.floor((duration % 3600) / 60)
        const seconds = duration % 60

        if (hours > 0) {
            return `${hours}小时${minutes}分${seconds}秒`
        } else if (minutes > 0) {
            return `${minutes}分${seconds}秒`
        } else {
            return `${seconds}秒`
        }
    }

    const getTotalScore = () => {
        // 优先使用稳定数据，回退到原始数据
        const session = dataReady.value ? stableSessionDetail.value : sessionDetail.value
        const answers = dataReady.value ? stableAnswerDetails.value : answerDetails.value

        if (session && session.totalScore !== undefined) {
            return session.totalScore
        }

        return calculateTotalScore(answers)
    }

    const loadSessionDetail = async () => {
        try {
            const response = await answerSessionApi.getSessionDetail(sessionCode.value)
            if (response.code === 200 && response.data) {
                sessionDetail.value = response.data
            } else {
                throw new Error(response.message || '获取会话详情失败')
            }
        } catch (error) {
            sessionDetail.value = null
            throw error
        }
    }

    const loadAnswerDetails = async () => {
        try {
            const response = await answerSessionApi.getSessionAnswers(sessionCode.value)
            if (response.code === 200 && response.data) {
                answerDetails.value = Array.isArray(response.data) ? response.data : []
            } else {
                throw new Error(response.message || '获取答题详情失败')
            }
        } catch (error) {
            answerDetails.value = []
            throw error
        }
    }

    const loadStatistics = async () => {
        try {
            // 如果有会话详情且包含ID，则获取会话统计
            if (sessionDetail.value && sessionDetail.value.id) {
                const response = await answerRecordApi.getSessionAnswerStats(sessionDetail.value.id)
                if (response.code === 200 && response.data) {
                    statistics.value = response.data
                } else {
                    statistics.value = calculatedStats.value
                }
            } else {
                // 如果没有会话ID，直接使用计算的统计
                statistics.value = calculatedStats.value
            }
        } catch (error) {
            statistics.value = calculatedStats.value
        }
    }

    const loadAllData = async () => {
        if (!sessionCode.value) {
            errorMessage.value = '会话编码不能为空'
            return
        }

        console.log('🔄 开始加载数据')
        loading.value = true
        dataReady.value = false
        contentReady.value = false
        errorMessage.value = ''

        // 重置稳定数据
        stableSessionDetail.value = null
        stableAnswerDetails.value = []
        stableStatistics.value = null

        try {
            console.log('📡 加载会话详情...')
            // 先加载会话详情，获取会话ID
            await loadSessionDetail()
            console.log('✅ 会话详情加载完成:', sessionDetail.value?.id)

            console.log('📡 并行加载答题详情和统计...')
            // 然后并行加载答题详情和统计信息
            await Promise.all([
                loadAnswerDetails(),
                loadStatistics()
            ])
            console.log('✅ 所有数据加载完成:', {
                answerCount: answerDetails.value?.length,
                hasStatistics: !!statistics.value
            })

            console.log('🔄 准备稳定数据...')
            // 先准备好所有数据
            const preparedSession = JSON.parse(JSON.stringify(sessionDetail.value))
            const preparedAnswers = JSON.parse(JSON.stringify(answerDetails.value))
            const preparedStats = JSON.parse(JSON.stringify(statistics.value))
            console.log('✅ 数据准备完成')

            // 确保DOM已经更新
            await nextTick()
            console.log('✅ nextTick 完成')

            // 先设置loading为false，让骨架屏显示
            loading.value = false
            console.log('✅ loading 设置为 false')

            // 等待一帧以确保骨架屏渲染完成
            await nextTick()

            // 减少等待时间，让过渡更平滑
            await new Promise(resolve => setTimeout(resolve, 50))

            // 一次性更新所有数据和状态
            stableSessionDetail.value = preparedSession
            stableAnswerDetails.value = preparedAnswers
            stableStatistics.value = preparedStats
            dataReady.value = true
            
            // 延迟设置contentReady，让动画更平滑
            await new Promise(resolve => setTimeout(resolve, 100))
            contentReady.value = true
            console.log('🎉 所有数据和状态同时更新完成')
        } catch (error) {
            console.error('❌ 数据加载失败:', error)
            errorMessage.value = error.message || '加载数据失败，请稍后重试'
            ElMessage.error(errorMessage.value)
            loading.value = false
        }
    }

    onMounted(async () => {
        await loadAllData()
    })

    return {
        loading,
        dataReady,
        contentReady,
        sessionCode,
        sessionDetail,
        answerDetails,
        statistics,
        feedback,
        errorMessage,
        stableSessionDetail,
        stableAnswerDetails,
        stableStatistics,
        statusInfo,
        gradeInfo,
        scorePercentage,
        calculatedStats,
        answerProgress,
        progressColor,
        goBack,
        loadAllData,
        getFormattedDuration,
        getTotalScore,
        getQuestionTypeName,
        getQuestionTypeColor,
        shouldShowOptions,
        getOptionsData,
        parseOptions,
        getOptionLabel,
        getOptionClass,
        getDataSource,
        getFormattedAnswer,
        getItemScore,
        getAnswerItemClass,
        getScoreClass,
        getStatusIcon,
        getStatusIconClass
    }
} 