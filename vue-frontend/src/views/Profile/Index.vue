<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>个人资料</span>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="profile-form"
      >
        <el-form-item label="账号" prop="account">
          <el-input v-model="form.account" disabled />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>

        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>

        <el-divider>修改密码</el-divider>

        <el-form-item label="原密码" prop="oldPassword">
          <el-input
            v-model="form.oldPassword"
            type="password"
            placeholder="请输入原密码"
            show-password
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码（至少6位）"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            保存修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { authAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const loading = ref(false)
const formRef = ref(null)

const form = reactive({
  account: '',
  name: '',
  phone: '',
  email: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== form.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const fetchProfile = async () => {
  try {
    const { data } = await authAPI.getUserInfo()
    form.account = data.account || ''
    form.name = data.name || ''
    form.phone = data.phone || ''
    form.email = data.email || ''
  } catch (error) {
    console.error('Failed to fetch profile:', error)
    ElMessage.error('获取个人资料失败')
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()

    if (form.newPassword && !form.oldPassword) {
      ElMessage.warning('修改密码需要输入原密码')
      return
    }

    loading.value = true

    const updateData = {
      name: form.name,
      phone: form.phone,
      email: form.email
    }

    if (form.oldPassword && form.newPassword) {
      updateData.oldPassword = form.oldPassword
      updateData.newPassword = form.newPassword
    }

    await authAPI.updateProfile(updateData)

    ElMessage.success('保存成功')

    form.oldPassword = ''
    form.newPassword = ''
    form.confirmPassword = ''

    await fetchProfile()
  } catch (error) {
    if (error.errorFields) return
    console.error('Failed to update profile:', error)
    ElMessage.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

<style scoped>
.profile-container {
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  font-size: 18px;
  font-weight: 500;
}

.profile-form {
  margin-top: 20px;
}

.el-divider {
  margin: 30px 0 20px;
}
</style>