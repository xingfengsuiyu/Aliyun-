# 🔌 API 测试指南

## 完整的 API 接口测试文档

---

## 📋 目录

1. [测试工具准备](#测试工具准备)
2. [认证接口](#1-认证接口)
3. [房源管理接口](#2-房源管理接口)
4. [租客管理接口](#3-租客管理接口)
5. [租约管理接口](#4-租约管理接口)
6. [账单管理接口](#5-账单管理接口)
7. [消息沟通接口](#6-消息沟通接口)
8. [常见错误处理](#常见错误处理)

---

## 🛠️ 测试工具准备

### 方式 1: cURL (命令行)
所有示例都提供 cURL 命令

### 方式 2: Postman
1. 下载 Postman: https://www.postman.com/downloads/
2. 导入示例请求
3. 设置环境变量

### 方式 3: HTTPie
```bash
# 安装
pip install httpie

# 使用
http POST http://localhost:8080/api/auth/login account=admin password=admin123
```

---

## 🔐 认证说明

所有接口（除登录/注册外）都需要在请求头中添加 Token:

```
Authorization: Bearer <your-token>
```

### 获取 Token

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'
```

**响应示例:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "user": {
      "id": "landlord-001",
      "account": "admin",
      "name": "张三房东"
    }
  }
}
```

**保存 Token 供后续使用:**
```bash
# Linux/Mac
export TOKEN="eyJhbGciOiJIUzUxMiJ9..."

# Windows PowerShell
$TOKEN = "eyJhbGciOiJIUzUxMiJ9..."
```

---

## 1. 认证接口

### 1.1 用户登录

**请求:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin",
    "password": "admin123"
  }'
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": "landlord-001",
      "account": "admin",
      "name": "张三房东",
      "phone": "13800138000",
      "email": "admin@rental.com"
    }
  }
}
```

**失败响应 (401):**
```json
{
  "success": false,
  "message": "账号或密码错误"
}
```

### 1.2 用户注册

**请求:**
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "account": "newuser",
    "password": "password123",
    "name": "新房东",
    "phone": "13900139000",
    "email": "new@rental.com"
  }'
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "id": "landlord-003",
    "account": "newuser",
    "name": "新房东"
  }
}
```

### 1.3 获取当前用户信息

**请求:**
```bash
curl -X GET http://localhost:8080/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "landlord-001",
    "account": "admin",
    "name": "张三房东",
    "phone": "13800138000",
    "email": "admin@rental.com",
    "status": "正常"
  }
}
```

---

## 2. 房源管理接口

### 2.1 获取房源列表

**请求:**
```bash
curl -X GET "http://localhost:8080/api/properties?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": "prop-001",
        "name": "阳光花园小区 3号楼 501",
        "propertyType": "住宅",
        "status": "空闲",
        "address": "北京市朝阳区阳光花园小区3号楼501室",
        "area": 89.5,
        "rent": 4500.00,
        "deposit": 9000.00,
        "floor": "5/18",
        "facilities": ["空调", "冰箱", "洗衣机"],
        "createdAt": "2026-04-10T10:00:00"
      }
    ],
    "page": 0,
    "size": 10,
    "totalElements": 5,
    "totalPages": 1
  }
}
```

### 2.2 搜索房源

**请求:**
```bash
curl -X GET "http://localhost:8080/api/properties/search?name=阳光&status=空闲&propertyType=住宅" \
  -H "Authorization: Bearer $TOKEN"
```

**查询参数:**
- `name`: 房源名称（模糊搜索）
- `status`: 状态（草稿/空闲/已出租/维护中）
- `propertyType`: 类型（住宅/商铺/写字楼/厂房/仓库）
- `page`: 页码（从0开始）
- `size`: 每页大小

### 2.3 获取房源详情

**请求:**
```bash
curl -X GET http://localhost:8080/api/properties/prop-001 \
  -H "Authorization: Bearer $TOKEN"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "prop-001",
    "name": "阳光花园小区 3号楼 501",
    "propertyType": "住宅",
    "status": "空闲",
    "address": "北京市朝阳区阳光花园小区3号楼501室",
    "area": 89.5,
    "rent": 4500.00,
    "deposit": 9000.00,
    "floor": "5/18",
    "description": "南北通透，精装修，拎包入住",
    "facilities": ["空调", "冰箱", "洗衣机", "热水器", "床", "衣柜", "宽带"],
    "images": [
      "https://example.com/images/prop001_1.jpg",
      "https://example.com/images/prop001_2.jpg"
    ],
    "createdAt": "2026-04-10T10:00:00",
    "updatedAt": "2026-04-10T10:00:00"
  }
}
```

### 2.4 创建房源

**请求:**
```bash
curl -X POST http://localhost:8080/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "新建房源示例",
    "propertyType": "住宅",
    "address": "北京市海淀区新建路100号",
    "area": 100.0,
    "rent": 5000.00,
    "deposit": 10000.00,
    "floor": "10/20",
    "description": "精装修新房",
    "facilities": ["空调", "冰箱", "洗衣机", "宽带"]
  }'
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "id": "prop-006",
    "name": "新建房源示例",
    "propertyType": "住宅",
    "status": "草稿"
  }
}
```

### 2.5 更新房源

**请求:**
```bash
curl -X PUT http://localhost:8080/api/properties/prop-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "更新后的房源名称",
    "propertyType": "住宅",
    "address": "更新后的地址",
    "area": 95.0,
    "rent": 4800.00,
    "deposit": 9600.00,
    "floor": "5/18",
    "description": "更新后的描述",
    "facilities": ["空调", "冰箱", "洗衣机", "热水器", "床"]
  }'
```

### 2.6 删除房源

**请求:**
```bash
curl -X DELETE http://localhost:8080/api/properties/prop-001 \
  -H "Authorization: Bearer $TOKEN"
```

**成功响应 (200):**
```json
{
  "success": true,
  "message": "删除成功"
}
```

### 2.7 更新房源状态

**请求:**
```bash
curl -X PATCH http://localhost:8080/api/properties/prop-001/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "status": "空闲"
  }'
```

**可选状态:** `草稿`, `空闲`, `已出租`, `维护中`

---

## 3. 租客管理接口

### 3.1 获取租客列表

**请求:**
```bash
curl -X GET "http://localhost:8080/api/tenants?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 3.2 获取租客详情

**请求:**
```bash
curl -X GET http://localhost:8080/api/tenants/tenant-001 \
  -H "Authorization: Bearer $TOKEN"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "id": "tenant-001",
    "name": "李明",
    "gender": "男",
    "phone": "13600136000",
    "idCard": "110101199001011234",
    "emergencyContactName": "李华",
    "emergencyContactPhone": "13700137000",
    "status": "在住",
    "notes": "IT工程师，爱干净",
    "createdAt": "2026-04-10T10:00:00"
  }
}
```

### 3.3 创建租客

**请求:**
```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "新房客",
    "gender": "女",
    "phone": "13500135000",
    "idCard": "110101199505051234",
    "emergencyContactName": "紧急联系人",
    "emergencyContactPhone": "13400134000",
    "notes": "备注信息"
  }'
```

### 3.4 更新租客信息

**请求:**
```bash
curl -X PUT http://localhost:8080/api/tenants/tenant-001 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "更新姓名",
    "gender": "男",
    "phone": "13600136000",
    "idCard": "110101199001011234",
    "emergencyContactName": "新联系人",
    "emergencyContactPhone": "13700137000",
    "notes": "更新备注"
  }'
```

### 3.5 标记退租

**请求:**
```bash
curl -X PATCH http://localhost:8080/api/tenants/tenant-001/move-out \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. 租约管理接口

### 4.1 获取租约列表

**请求:**
```bash
curl -X GET "http://localhost:8080/api/leases?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 4.2 获取活跃租约

**请求:**
```bash
curl -X GET http://localhost:8080/api/leases/active \
  -H "Authorization: Bearer $TOKEN"
```

### 4.3 获取即将到期租约

**请求:**
```bash
curl -X GET http://localhost:8080/api/leases/expiring \
  -H "Authorization: Bearer $TOKEN"
```

### 4.4 创建租约

**请求:**
```bash
curl -X POST http://localhost:8080/api/leases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "propertyId": "prop-001",
    "tenantId": "tenant-001",
    "startDate": "2026-05-01",
    "endDate": "2027-04-30",
    "rent": 4500.00,
    "deposit": 9000.00,
    "paymentMethod": "押一付三",
    "specialTerms": "特殊条款"
  }'
```

**成功响应 (201):**
```json
{
  "success": true,
  "data": {
    "id": "lease-004",
    "propertyId": "prop-001",
    "tenantId": "tenant-001",
    "status": "生效中",
    "message": "租约创建成功，房源状态已更新为已出租"
  }
}
```

### 4.5 续租

**请求:**
```bash
curl -X POST http://localhost:8080/api/leases/lease-001/renew \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "months": 12
  }'
```

**说明:** 续租会创建新租约，旧租约标记为已终止

### 4.6 终止租约

**请求:**
```bash
curl -X POST http://localhost:8080/api/leases/lease-001/terminate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "reason": "提前退租",
    "terminationDate": "2026-04-30"
  }'
```

**说明:** 终止租约后，房源状态自动恢复为空闲

---

## 5. 账单管理接口

### 5.1 获取账单列表

**请求:**
```bash
curl -X GET "http://localhost:8080/api/bills?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

### 5.2 搜索账单

**请求:**
```bash
curl -X GET "http://localhost:8080/api/bills/search?billType=租金&status=待支付" \
  -H "Authorization: Bearer $TOKEN"
```

**查询参数:**
- `billType`: 账单类型（租金/水电费/物业费/其他）
- `status`: 状态（待支付/已支付/逾期）
- `startDate`: 开始日期
- `endDate`: 结束日期

### 5.3 获取账单统计

**请求:**
```bash
curl -X GET http://localhost:8080/api/bills/statistics \
  -H "Authorization: Bearer $TOKEN"
```

**成功响应 (200):**
```json
{
  "success": true,
  "data": {
    "pendingAmount": 13850.00,
    "paidAmount": 21500.00,
    "overdueAmount": 8200.00,
    "overdueCount": 1,
    "totalAmount": 43550.00,
    "monthlyIncome": 21500.00
  }
}
```

### 5.4 创建账单

**请求:**
```bash
curl -X POST http://localhost:8080/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "leaseId": "lease-001",
    "billType": "水电费",
    "amount": 350.00,
    "dueDate": "2026-05-20",
    "notes": "4月份水电费"
  }'
```

### 5.5 记录付款

**请求:**
```bash
curl -X POST http://localhost:8080/api/bills/bill-004/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 8000.00,
    "paymentMethod": "银行转账",
    "notes": "5月份租金"
  }'
```

**成功响应 (200):**
```json
{
  "success": true,
  "message": "收款记录成功",
  "data": {
    "id": "bill-004",
    "status": "已支付",
    "paidDate": "2026-04-10",
    "paymentMethod": "银行转账"
  }
}
```

---

## 6. 消息沟通接口

### 6.1 获取消息列表

**请求:**
```bash
curl -X GET "http://localhost:8080/api/messages?page=0&size=10" \
  -H "Authorization: Bearer $TOKEN"
```

**查询参数:**
- `tenantId`: 租客ID（筛选特定租客）
- `isRead`: 是否已读（true/false）
- `page`: 页码
- `size`: 每页大小

### 6.2 发送消息

**请求:**
```bash
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "tenantId": "tenant-001",
    "content": "你好，5月份的租金请按时缴纳。",
    "messageType": "文字"
  }'
```

**消息类型:** `文字`, `图片`, `文件`

### 6.3 标记消息已读

**请求:**
```bash
curl -X PATCH http://localhost:8080/api/messages/msg-003/read \
  -H "Authorization: Bearer $TOKEN"
```

### 6.4 全部标记已读

**请求:**
```bash
curl -X PATCH http://localhost:8080/api/messages/read-all/tenant-001 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 常见错误处理

### 401 Unauthorized

**原因:** Token 无效或过期

**解决:**
```bash
# 重新登录获取新 Token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'
```

### 403 Forbidden

**原因:** 权限不足

**解决:** 检查用户角色和权限

### 404 Not Found

**原因:** 资源不存在

**解决:** 检查 ID 是否正确

### 500 Internal Server Error

**原因:** 服务器内部错误

**解决:** 查看后端日志，检查错误堆栈

### 请求参数错误 (400)

**示例:**
```json
{
  "success": false,
  "message": "参数验证失败",
  "errors": [
    {
      "field": "name",
      "message": "房源名称不能为空"
    }
  ]
}
```

---

## 📊 完整测试流程

### 测试场景 1: 完整租约流程

```bash
# 1. 登录
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}' | jq -r '.data.token')

# 2. 创建房源
PROPERTY_ID=$(curl -s -X POST http://localhost:8080/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"测试房源","propertyType":"住宅","address":"测试地址","area":80,"rent":4000,"deposit":8000,"floor":"5/10"}' | jq -r '.data.id')

# 3. 创建租客
TENANT_ID=$(curl -s -X POST http://localhost:8080/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"测试租客","gender":"男","phone":"13900139000","idCard":"110101199001011234","emergencyContactName":"联系人","emergencyContactPhone":"13800138000"}' | jq -r '.data.id')

# 4. 创建租约
LEASE_ID=$(curl -s -X POST http://localhost:8080/api/leases \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"propertyId\":\"$PROPERTY_ID\",\"tenantId\":\"$TENANT_ID\",\"startDate\":\"2026-05-01\",\"endDate\":\"2027-04-30\",\"rent\":4000,\"deposit\":8000,\"paymentMethod\":\"押一付三\"}" | jq -r '.data.id')

# 5. 创建账单
BILL_ID=$(curl -s -X POST http://localhost:8080/api/bills \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"leaseId\":\"$LEASE_ID\",\"billType\":\"租金\",\"amount\":4000,\"dueDate\":\"2026-05-15\"}" | jq -r '.data.id')

# 6. 记录付款
curl -X POST http://localhost:8080/api/bills/$BILL_ID/payment \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"amount":4000,"paymentMethod":"银行转账","notes":"5月租金"}'

# 7. 发送消息
curl -X POST http://localhost:8080/api/messages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"tenantId\":\"$TENANT_ID\",\"content\":\"租金已收到，谢谢！\",\"messageType\":\"文字\"}"
```

---

## 🎯 Postman 集合导入

### 环境变量设置

在 Postman 中创建环境变量:

```json
{
  "base_url": "http://localhost:8080",
  "token": "your-token-here"
}
```

### 请求头设置

```
Content-Type: application/json
Authorization: Bearer {{token}}
```

---

## 💡 测试技巧

### 1. 使用 jq 解析 JSON

```bash
# 安装 jq
# Windows: choco install jq
# Mac: brew install jq
# Linux: sudo apt install jq

# 提取 Token
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}' | jq -r '.data.token')

# 提取 ID
ID=$(curl -s http://localhost:8080/api/properties \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.content[0].id')
```

### 2. 保存和复用响应

```bash
# 保存完整响应到文件
curl -X GET http://localhost:8080/api/properties \
  -H "Authorization: Bearer $TOKEN" > properties.json

# 查看文件
cat properties.json | jq .
```

### 3. 批量测试

创建 shell 脚本:

```bash
#!/bin/bash
# test-api.sh

BASE_URL="http://localhost:8080"
TOKEN="your-token"

echo "Testing properties API..."
curl -s "$BASE_URL/api/properties" -H "Authorization: Bearer $TOKEN" | jq .

echo "Testing tenants API..."
curl -s "$BASE_URL/api/tenants" -H "Authorization: Bearer $TOKEN" | jq .
```

---

## 📝 测试检查清单

- [ ] 登录成功
- [ ] 获取用户信息
- [ ] 创建房源
- [ ] 查询房源列表
- [ ] 更新房源
- [ ] 删除房源
- [ ] 创建租客
- [ ] 查询租客列表
- [ ] 创建租约
- [ ] 查询租约列表
- [ ] 创建账单
- [ ] 查询账单列表
- [ ] 记录付款
- [ ] 发送消息
- [ ] 查询消息列表
- [ ] 获取统计数据

---

**测试愉快！** 🔌
