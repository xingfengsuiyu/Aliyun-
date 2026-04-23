<template>
  <div class="tenant-form">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑租客' : '新增租客' }}</span>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-loading="loading">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="男">男</el-radio>
                <el-radio label="女">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="手机号" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入手机号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="紧急联系人姓名" prop="emergencyContactName">
          <el-input v-model="form.emergencyContactName" placeholder="请输入紧急联系人姓名" />
        </el-form-item>

        <el-form-item label="紧急联系人电话" prop="emergencyContactPhone">
          <el-input v-model="form.emergencyContactPhone" placeholder="请输入紧急联系人电话" />
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="form.notes" type="textarea" :rows="3" placeholder="请输入备注" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新' : '创建' }}
          </el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { tenantAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  gender: '男',
  phone: '',
  idCard: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  notes: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
}

const loadTenant = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const { data } = await tenantAPI.getById(route.params.id)
    Object.assign(form, data)
  } catch (error) {
    ElMessage.error('加载租客信息失败')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true
    
    if (isEdit.value) {
      await tenantAPI.update({ id: route.params.id, tenant: form })
      ElMessage.success('更新成功')
    } else {
      await tenantAPI.create(form)
      ElMessage.success('创建成功')
    }
    
    router.push('/tenants')
  } catch (error) {
    console.error('Failed to submit:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadTenant()
})
</script>
