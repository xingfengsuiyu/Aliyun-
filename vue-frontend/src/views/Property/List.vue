<template>
  <div class="property-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>房源列表</span>
          <div>
            <el-button type="success" @click="handleBatchCreate">
              <el-icon><Plus /></el-icon>
              批量新增
            </el-button>
            <el-button type="warning" @click="handleBatchEdit" :disabled="!multipleSelection.length">
              <el-icon><Edit /></el-icon>
              批量编辑
            </el-button>
            <el-button type="primary" @click="$router.push('/properties/create')">
              <el-icon><Plus /></el-icon>
              新增房源
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="房源名称">
          <el-input v-model="searchForm.name" placeholder="请输入房源名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择状态" clearable>
            <el-option label="草稿" value="草稿" />
            <el-option label="空闲" value="空闲" />
            <el-option label="已出租" value="已出租" />
            <el-option label="维护中" value="维护中" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="searchForm.propertyType" placeholder="请选择类型" clearable>
            <el-option label="住宅" value="住宅" />
            <el-option label="商铺" value="商铺" />
            <el-option label="写字楼" value="写字楼" />
            <el-option label="厂房" value="厂房" />
            <el-option label="仓库" value="仓库" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        v-loading="loading"
        stripe
        @selection-change="handleSelectionChange"
        row-key="id"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="name" label="房源名称" min-width="150" />
        <el-table-column prop="propertyType" label="类型" width="120" />
        <el-table-column prop="address" label="地址" min-width="200" />
        <el-table-column prop="area" label="面积(㎡)" width="100" />
        <el-table-column prop="rent" label="租金(元/月)" width="120" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <el-dialog v-model="batchCreateDialogVisible" title="批量新增房源" width="600px" @close="handleBatchCreateClose">
      <el-form :model="batchCreateForm" label-width="100px">
        <el-form-item label="新增数量">
          <el-input-number v-model="batchCreateForm.count" :min="1" :max="100" />
        </el-form-item>
        <el-form-item label="房源名称">
          <el-input v-model="batchCreateForm.namePrefix" placeholder="如: 房源" />
          <span style="color: #999; margin-left: 10px">将生成: 房源101, 房源102, ...</span>
        </el-form-item>
        <el-form-item label="房源类型">
          <el-select v-model="batchCreateForm.propertyType" placeholder="请选择类型">
            <el-option label="住宅" value="住宅" />
            <el-option label="商铺" value="商铺" />
            <el-option label="写字楼" value="写字楼" />
            <el-option label="厂房" value="厂房" />
            <el-option label="仓库" value="仓库" />
          </el-select>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="batchCreateForm.address" placeholder="请输入详细地址" />
        </el-form-item>
        <el-form-item label="楼层">
          <el-input v-model="batchCreateForm.floor" placeholder="如: 1层" />
        </el-form-item>
        <el-form-item label="房间号前缀">
          <el-input v-model="batchCreateForm.roomNumberPrefix" placeholder="如: 101" style="width: 60%" />
          <span style="color: #999; margin-left: 10px">将自动加1生成: 101, 102, 103...</span>
        </el-form-item>
        <el-form-item label="面积(㎡)">
          <el-input-number v-model="batchCreateForm.area" :min="0" placeholder="面积" />
        </el-form-item>
        <el-form-item label="配套设施">
          <el-checkbox-group v-model="batchCreateForm.facilities">
            <el-checkbox label="空调">空调</el-checkbox>
            <el-checkbox label="热水器">热水器</el-checkbox>
            <el-checkbox label="冰箱">冰箱</el-checkbox>
            <el-checkbox label="洗衣机">洗衣机</el-checkbox>
            <el-checkbox label="床">床</el-checkbox>
            <el-checkbox label="沙发">沙发</el-checkbox>
            <el-checkbox label="衣柜">衣柜</el-checkbox>
            <el-checkbox label="电视">电视</el-checkbox>
            <el-checkbox label="宽带">宽带</el-checkbox>
            <el-checkbox label="暖气">暖气</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="默认租金">
          <el-input-number v-model="batchCreateForm.rent" :min="0" placeholder="默认租金" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchCreateDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchCreate" :loading="creating">确定</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="batchEditDialogVisible" title="批量编辑" width="600px" @close="handleBatchEditClose">
      <el-form :model="batchEditForm" label-width="100px">
        <el-form-item label="选中的房源">
          <span>已选中 {{ multipleSelection.length }} 条记录</span>
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="batchEditForm.propertyType" placeholder="留空则不修改">
            <el-option label="不修改" value="" />
            <el-option label="住宅" value="住宅" />
            <el-option label="商铺" value="商铺" />
            <el-option label="写字楼" value="写字楼" />
            <el-option label="厂房" value="厂房" />
            <el-option label="仓库" value="仓库" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="batchEditForm.status" placeholder="留空则不修改">
            <el-option label="不修改" value="" />
            <el-option label="草稿" value="草稿" />
            <el-option label="空闲" value="空闲" />
            <el-option label="已出租" value="已出租" />
            <el-option label="维护中" value="维护中" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="batchEditDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirmBatchEdit" :loading="saving">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { propertyAPI } from '@/api/modules'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)
const creating = ref(false)
const saving = ref(false)
const tableData = ref([])
const multipleSelection = ref([])

const searchForm = reactive({
  name: '',
  status: '',
  propertyType: ''
})

const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

const batchCreateDialogVisible = ref(false)
const batchCreateForm = reactive({
  count: 5,
  propertyType: '住宅',
  rent: 0,
  namePrefix: '房源',
  address: '',
  floor: '',
  roomNumberPrefix: '',
  area: 0,
  facilities: []
})

const batchEditDialogVisible = ref(false)
const batchEditForm = reactive({
  propertyType: '',
  status: ''
})

const getStatusType = (status) => {
  const typeMap = {
    '草稿': 'info',
    '空闲': 'success',
    '已出租': 'primary',
    '维护中': 'warning'
  }
  return typeMap[status] || 'info'
}

const fetchData = async () => {
  try {
    loading.value = true
    const params = {
      page: pagination.page,
      size: pagination.size,
      ...(searchForm.name && { name: searchForm.name }),
      ...(searchForm.status && { status: searchForm.status }),
      ...(searchForm.propertyType && { propertyType: searchForm.propertyType })
    }
    const res = await propertyAPI.search(params)
    tableData.value = res?.data?.list ?? []
    pagination.total = res?.data?.total ?? 0
  } catch (error) {
    console.error('Failed to fetch properties:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.page = 1
  fetchData()
}

const handleReset = () => {
  searchForm.name = ''
  searchForm.status = ''
  searchForm.propertyType = ''
  handleSearch()
}

const handleSelectionChange = (selection) => {
  multipleSelection.value = selection
}

const handleBatchCreate = () => {
  batchCreateDialogVisible.value = true
}

const handleConfirmBatchCreate = async () => {
  try {
    creating.value = true
    const properties = []
    const baseRoomNum = parseInt(batchCreateForm.roomNumberPrefix) || 1
    for (let i = 0; i < batchCreateForm.count; i++) {
      const roomNum = baseRoomNum + i
      properties.push({
        name: `${batchCreateForm.namePrefix}${roomNum}`,
        propertyType: batchCreateForm.propertyType,
        address: batchCreateForm.address,
        floor: batchCreateForm.floor,
        roomNumber: String(roomNum),
        area: batchCreateForm.area,
        facilities: batchCreateForm.facilities,
        rent: batchCreateForm.rent,
        status: '空闲'
      })
    }
    await propertyAPI.batchCreate(properties)
    ElMessage.success('批量创建成功')
    batchCreateDialogVisible.value = false
    handleBatchCreateClose()
    fetchData()
  } catch (error) {
    console.error('Failed to batch create:', error)
    ElMessage.error('批量创建失败')
  } finally {
    creating.value = false
  }
}

const handleBatchCreateClose = () => {
  batchCreateForm.count = 5
  batchCreateForm.propertyType = '住宅'
  batchCreateForm.rent = 0
  batchCreateForm.namePrefix = '房源'
  batchCreateForm.address = ''
  batchCreateForm.floor = ''
  batchCreateForm.roomNumberPrefix = ''
  batchCreateForm.area = 0
  batchCreateForm.facilities = []
}

const handleBatchEdit = () => {
  if (!multipleSelection.value.length) {
    ElMessage.warning('请先选择要编辑的房源')
    return
  }
  batchEditDialogVisible.value = true
}

const handleConfirmBatchEdit = async () => {
  try {
    saving.value = true
    const updates = multipleSelection.value.map(item => {
      const update = { id: item.id }
      if (batchEditForm.propertyType) {
        update.propertyType = batchEditForm.propertyType
      }
      if (batchEditForm.status) {
        update.status = batchEditForm.status
      }
      return update
    }).filter(u => Object.keys(u).length > 1)

    if (updates.length === 0) {
      ElMessage.warning('请至少选择一项要修改的内容')
      saving.value = false
      return
    }

    await propertyAPI.batchUpdate(updates)
    ElMessage.success('批量更新成功')
    batchEditDialogVisible.value = false
    multipleSelection.value = []
    fetchData()
  } catch (error) {
    console.error('Failed to batch update:', error)
    ElMessage.error('批量更新失败')
  } finally {
    saving.value = false
  }
}

const handleBatchEditClose = () => {
  batchEditForm.propertyType = ''
  batchEditForm.status = ''
}

const handleEdit = (row) => {
  router.push(`/properties/edit/${row.id}`)
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该房源吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await propertyAPI.delete(row.id)
    ElMessage.success('删除成功')
    fetchData()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Failed to delete:', error)
    }
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>