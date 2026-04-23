<template>
  <div class="lease-form">
    <el-card>
      <template #header>
        <span>创建租约</span>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="房源" prop="propertyId">
          <el-select v-model="form.propertyId" placeholder="请选择房源" style="width: 100%">
            <el-option v-for="item in properties" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="租客" prop="tenantId">
          <el-select v-model="form.tenantId" placeholder="请选择租客" style="width: 100%">
            <el-option v-for="item in tenants" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker v-model="form.startDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker v-model="form.endDate" type="date" placeholder="选择日期" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="月租金(元)" prop="rent">
              <el-input-number v-model="form.rent" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="押金(元)" prop="deposit">
              <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="付款方式" prop="paymentMode">
          <el-select v-model="form.paymentMode" placeholder="请选择付款方式" style="width: 100%">
            <el-option label="押一付三" value="押一付三" />
            <el-option label="押一付一" value="押一付一" />
            <el-option label="年付" value="年付" />
            <el-option label="半年付" value="半年付" />
          </el-select>
        </el-form-item>

        <el-form-item label="特殊条款">
          <el-input v-model="form.specialTerms" type="textarea" :rows="4" placeholder="请输入特殊条款" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">创建租约</el-button>
          <el-button @click="$router.back()">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { leaseAPI, propertyAPI, tenantAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const router = useRouter()
const formRef = ref(null)
const submitting = ref(false)

const properties = ref([])
const tenants = ref([])

const form = reactive({
  propertyId: '',
  tenantId: '',
  startDate: '',
  endDate: '',
  rent: null,
  deposit: null,
  paymentMode: '押一付三',
  specialTerms: ''
})

const rules = {
  propertyId: [{ required: true, message: '请选择房源', trigger: 'change' }],
  tenantId: [{ required: true, message: '请选择租客', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  rent: [{ required: true, message: '请输入月租金', trigger: 'blur' }],
  deposit: [{ required: true, message: '请输入押金', trigger: 'blur' }],
  paymentMode: [{ required: true, message: '请选择付款方式', trigger: 'change' }]
}

const loadOptions = async () => {
  try {
    const [propRes, tenantRes] = await Promise.all([
      propertyAPI.getList({ page: 0, size: 100, status: '空闲' }),
      tenantAPI.getList({ page: 0, size: 100 })
    ])
    properties.value = propRes.data.list ?? propRes.data.content ?? []
    tenants.value = tenantRes.data.list ?? tenantRes.data.content ?? []
  } catch (error) {
    console.error('Failed to load options:', error)
  }
}

const toDateStr = (v) => {
  if (!v) return ''
  if (typeof v === 'string') return v.slice(0, 10)
  const d = new Date(v)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

const handleSubmit = async () => {
  try {
    const valid = await formRef.value.validate()
    if (!valid) return

    submitting.value = true
    const payload = {
      propertyId: form.propertyId,
      tenantId: form.tenantId,
      startDate: toDateStr(form.startDate),
      endDate: toDateStr(form.endDate),
      rent: form.rent,
      deposit: form.deposit,
      paymentMode: form.paymentMode,
      specialTerms: form.specialTerms
    }
    await leaseAPI.create(payload)
    ElMessage.success('创建成功')
    router.push('/leases')
  } catch (error) {
    console.error('Failed to submit:', error)
    ElMessage.error(error?.response?.data?.message || error?.message || '创建失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadOptions()
})
</script>
