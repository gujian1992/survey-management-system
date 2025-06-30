<template>
  <el-dialog
    v-model="visible"
    :title="title"
    width="400px"
    :close-on-click-modal="false"
    :show-close="false"
    class="session-error-dialog"
  >
    <div class="error-content">
      <el-icon class="error-icon" :size="48"><WarningFilled /></el-icon>
      <div class="error-message">{{ message }}</div>
      <div class="error-submessage" v-if="subMessage">{{ subMessage }}</div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleReturnHome">返回首页</el-button>
        <el-button @click="handleRestart" type="primary">重新开始考试</el-button>
        <el-button @click="handleSupport" type="info">联系客服</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { ElIcon } from "element-plus"
import { WarningFilled } from "@element-plus/icons-vue"

const router = useRouter()
const visible = ref(false)
const title = ref("提示")
const message = ref("")
const subMessage = ref("")

const show = (msg, subMsg = "") => {
  message.value = msg
  subMessage.value = subMsg
  visible.value = true
}

const handleReturnHome = () => {
  visible.value = false
  router.push("/")
}

const handleRestart = () => {
  visible.value = false
  router.push("/start-answer")
}

const handleSupport = () => {
  // 这里可以根据实际需求修改联系客服的方式
  window.open("mailto:support@example.com", "_blank")
}

defineExpose({
  show
})
</script>

<style scoped>
.session-error-dialog :deep(.el-dialog__header) {
  text-align: center;
  margin-right: 0;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.error-icon {
  color: #e6a23c;
  margin-bottom: 15px;
}

.error-message {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
}

.error-submessage {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 10px;
}
</style>
