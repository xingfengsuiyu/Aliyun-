<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="login-title">房东租房管理系统</h2>
      </template>

      <el-form :model="loginForm" :rules="rules" ref="formRef" @submit.prevent="handleLogin">
        <el-form-item prop="account">
          <el-input
            v-model="loginForm.account"
            placeholder="请输入账号"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            size="large"
            style="width: 100%"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>

        <div class="footer-link">
          <el-link type="primary" @click="showForgotDialog">忘记密码？</el-link>
          <span class="divider">|</span>
          <span>还没有账号？</span>
          <el-link type="primary" @click="router.push('/register')">立即注册</el-link>
        </div>
      </el-form>
    </el-card>

    <!-- Forgot Password Dialog -->
    <el-dialog v-model="forgotDialogVisible" title="忘记密码" width="400px" :close-on-click-modal="false">
      <el-form :model="forgotForm" :rules="forgotRules" ref="forgotFormRef" label-width="80px">
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="forgotForm.email" placeholder="请输入注册邮箱" />
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="code-input-wrapper">
            <el-input v-model="forgotForm.code" placeholder="请输入验证码" />
            <el-button
              @click="handleSendCode"
              :disabled="countdown > 0"
              style="margin-left: 10px"
            >
              {{ countdown > 0 ? `${countdown}s后重发` : '发送验证码' }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="forgotForm.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="forgotForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="forgotDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleResetPassword" :loading="forgotLoading">重置密码</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'
import api from '@/api'

const router = useRouter()
const userStore = useUserStore()
const formRef = ref(null)
const loading = ref(false)
const forgotDialogVisible = ref(false)
const forgotFormRef = ref(null)
const forgotLoading = ref(false)
const countdown = ref(0)

const loginForm = reactive({
  account: '',
  password: ''
})

const forgotForm = reactive({
  email: '',
  code: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== forgotForm.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const forgotRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    loading.value = true
    await userStore.login(loginForm)
    ElMessage.success('登录成功')
    router.push('/')
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    loading.value = false
  }
}

const showForgotDialog = () => {
  forgotForm.email = ''
  forgotForm.code = ''
  forgotForm.newPassword = ''
  forgotForm.confirmPassword = ''
  forgotDialogVisible.value = true
}

const handleSendCode = async () => {
  if (!forgotForm.email) {
    ElMessage.warning('请输入邮箱')
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotForm.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  try {
    await api.post('/auth/send-code', forgotForm.email, {
      headers: { 'Content-Type': 'text/plain' }
    })
    ElMessage.success('验证码已发送，请查收邮件')

    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error) {
    console.error('Failed to send code:', error)
    ElMessage.error(error.message || '发送验证码失败')
  }
}

const handleResetPassword = async () => {
  try {
    const valid = await forgotFormRef.value.validate()
    if (!valid) return

    forgotLoading.value = true

    await api.post('/auth/reset-password', {
      email: forgotForm.email,
      verificationCode: forgotForm.code,
      newPassword: forgotForm.newPassword
    })

    ElMessage.success('密码重置成功，请使用新密码登录')
    forgotDialogVisible.value = false
  } catch (error) {
    console.error('Failed to reset password:', error)
    ElMessage.error(error.message || '重置密码失败')
  } finally {
    forgotLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 400px;
}

.login-title {
  text-align: center;
  margin: 0;
  color: #303133;
}

.footer-link {
  text-align: center;
  font-size: 14px;
  color: #606266;
}

.footer-link .el-link {
  margin-left: 4px;
}

.divider {
  margin: 0 8px;
  color: #dcdfe6;
}

.code-input-wrapper {
  display: flex;
  align-items: center;
}

.code-input-wrapper .el-input {
  flex: 1;
}
</style>