<template>
  <div class="property-form">
    <el-card>
      <template #header>
        <span>{{ isEdit ? '编辑房源' : '新增房源' }}</span>
      </template>

      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" v-loading="loading">
        <el-form-item label="房源名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入房源名称" />
        </el-form-item>

        <el-form-item label="房源类型" prop="propertyType">
          <el-select v-model="form.propertyType" placeholder="请选择类型" style="width: 100%">
            <el-option label="住宅" value="住宅" />
            <el-option label="商铺" value="商铺" />
            <el-option label="写字楼" value="写字楼" />
            <el-option label="厂房" value="厂房" />
            <el-option label="仓库" value="仓库" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <el-form-item label="详细地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入详细地址" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="面积(㎡)" prop="area">
              <el-input-number v-model="form.area" :min="0" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="租金(元/月)" prop="rent">
              <el-input-number v-model="form.rent" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="押金(元)" prop="deposit">
              <el-input-number v-model="form.deposit" :min="0" :precision="2" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="楼层">
              <el-input v-model="form.floor" placeholder="如: 5/18" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="配套设施">
          <el-checkbox-group v-model="form.facilities">
            <el-checkbox label="空调" />
            <el-checkbox label="冰箱" />
            <el-checkbox label="洗衣机" />
            <el-checkbox label="热水器" />
            <el-checkbox label="床" />
            <el-checkbox label="衣柜" />
            <el-checkbox label="宽带" />
            <el-checkbox label="停车位" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="房源描述">
          <el-input v-model="form.description" type="textarea" :rows="4" placeholder="请输入房源描述" />
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
import { propertyAPI } from '@/api/modules'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const isEdit = computed(() => !!route.params.id)

const form = reactive({
  name: '',
  propertyType: '',
  address: '',
  area: null,
  rent: null,
  deposit: null,
  floor: '',
  facilities: [],
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入房源名称', trigger: 'blur' }],
  propertyType: [{ required: true, message: '请选择房源类型', trigger: 'change' }],
  address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
  area: [{ required: true, message: '请输入面积', trigger: 'blur' }],
  rent: [{ required: true, message: '请输入租金', trigger: 'blur' }]
}

const loadProperty = async () => {
  if (!isEdit.value) return
  
  try {
    loading.value = true
    const { data } = await propertyAPI.getById(route.params.id)
    Object.assign(form, data)
    form.facilities = data.facilities || []
  } catch (error) {
    ElMessage.error('加载房源信息失败')
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
      await propertyAPI.update({ id: route.params.id, property: form })
      ElMessage.success('更新成功')
    } else {
      await propertyAPI.create(form)
      ElMessage.success('创建成功')
    }
    
    router.push('/properties')
  } catch (error) {
    console.error('Failed to submit:', error)
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadProperty()
})
</script>
