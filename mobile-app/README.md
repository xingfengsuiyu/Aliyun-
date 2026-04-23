# 📱 房东租房管理 - 移动应用

基于 **React Native (Expo)** 的跨平台移动应用，支持 iOS 和 Android。

---

## 🌟 功能特性

### ✅ 已实现

- **用户认证**
  - ✅ 登录/登出
  - ✅ Token 自动管理
  - ✅ 自动登录
  - ✅ Redux 状态管理

- **首页仪表盘**
  - ✅ 统计数据展示
  - ✅ 快捷操作入口
  - ✅ 下拉刷新
  - ✅ 实时数据

- **房源管理**
  - ✅ 房源列表
  - ✅ 搜索功能
  - ✅ 状态筛选
  - ✅ 房源卡片展示
  - ✅ 上拉加载更多（预留）

### 🚧 开发中

- 租客管理页面
- 租约管理页面
- 账单管理页面
- 消息沟通页面
- 房源详情/编辑
- 创建房源表单
- 拍照上传
- 推送通知

---

## 🛠️ 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React Native | 0.73 | 核心框架 |
| Expo | ~50.0 | 开发工具链 |
| React Navigation | 6.x | 路由导航 |
| Redux Toolkit | 2.x | 状态管理 |
| React Native Paper | 5.x | UI 组件库 |
| Axios | 1.6 | HTTP 客户端 |
| Day.js | 1.11 | 日期处理 |

---

## 📦 安装和运行

### 前置要求

1. **Node.js 16+**
   ```bash
   node -v
   ```

2. **Expo CLI** (全局安装)
   ```bash
   npm install -g expo-cli
   ```

3. **Expo Go App** (手机测试用)
   - iOS: App Store 搜索 "Expo Go"
   - Android: Google Play 搜索 "Expo Go"

---

### 快速开始

#### 1. 安装依赖

```bash
cd mobile-app
npm install
```

#### 2. 启动开发服务器

```bash
npm start
```

会看到 Expo 开发工具界面。

#### 3. 运行应用

**方式 1: 模拟器/真机**
- 按 `i` - 打开 iOS 模拟器
- 按 `a` - 打开 Android 模拟器

**方式 2: 手机扫码**
1. 手机安装 Expo Go App
2. 确保手机和电脑在同一 WiFi
3. 用 Expo Go 扫描终端中的二维码

**方式 3: Web 浏览器**
```bash
npm run web
```

---

## 📁 项目结构

```
mobile-app/
├── 📱 src/
│   ├── api/
│   │   └── index.js              # API 接口封装
│   │
│   ├── store/
│   │   ├── index.js              # Redux store
│   │   └── userSlice.js          # 用户状态
│   │
│   ├── navigation/
│   │   └── AppNavigator.js       # 路由配置
│   │
│   └── screens/
│       ├── LoginScreen.js        # 登录页
│       ├── HomeScreen.js         # 首页
│       └── PropertiesScreen.js   # 房源列表
│
├── App.js                        # 应用入口
├── package.json
└── app.json                      # Expo 配置
```

---

## 🔧 配置

### API 地址

编辑 `src/api/index.js`:

```javascript
const API_BASE_URL = 'http://localhost:8080/api';
```

**注意:**
- 模拟器使用: `http://10.0.2.2:8080/api` (Android) 或 `http://localhost:8080/api` (iOS)
- 真机使用: `http://你的电脑IP:8080/api`

### 应用配置

编辑 `app.json`:

```json
{
  "expo": {
    "name": "房东租房管理",
    "slug": "rental-management",
    "version": "1.0.0"
  }
}
```

---

## 📱 屏幕截图

### 登录页
- 简洁的登录界面
- 账号密码输入
- 错误提示
- 默认账号提示

### 首页
- 欢迎信息
- 4个统计卡片
- 快捷操作按钮
- 下拉刷新

### 房源列表
- 搜索栏
- 状态筛选
- 房源卡片列表
- 悬浮添加按钮
- 下拉刷新

---

## 🚀 构建发布

### 构建 APK (Android)

```bash
# 1. 安装 EAS CLI
npm install -g eas-cli

# 2. 登录 Expo
eas login

# 3. 配置构建
eas build:configure

# 4. 构建 APK
eas build --platform android --profile preview
```

### 构建 IPA (iOS)

```bash
eas build --platform ios --profile preview
```

### 发布更新

```bash
eas update
```

---

## 🐛 常见问题

### 1. 启动报错

```bash
# 清除缓存
npm start -- --clear

# 或删除 node_modules 重新安装
rm -rf node_modules
npm install
```

### 2. 网络连接失败

**问题:** 无法连接后端 API

**解决:**
```javascript
// 检查 API 地址配置
const API_BASE_URL = 'http://你的电脑IP:8080/api';

// 查看电脑 IP
# Mac/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

### 3. Metro Bundler 错误

```bash
# 清除 Metro 缓存
expo start -c
```

### 4. 依赖安装失败

```bash
# 使用 yarn
npm install -g yarn
yarn install

# 或使用 cnpm (国内)
npm install -g cnpm --registry=https://registry.npm.taobao.org
cnpm install
```

---

## 📝 开发指南

### 添加新页面

1. 在 `src/screens/` 创建页面文件
2. 在 `AppNavigator.js` 中注册路由
3. 使用 React Native Paper 组件

**示例:**

```javascript
// src/screens/NewScreen.js
import React from 'react';
import { View, Text } from 'react-native';

export default function NewScreen() {
  return (
    <View>
      <Text>New Screen</Text>
    </View>
  );
}
```

注册路由:

```javascript
// AppNavigator.js
import NewScreen from './screens/NewScreen';

<Stack.Screen name="New" component={NewScreen} />
```

---

### API 调用

```javascript
import { propertyAPI } from '../api';

const fetchData = async () => {
  try {
    const response = await propertyAPI.getList({ page: 0, size: 10 });
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};
```

---

### 状态管理

```javascript
import { useSelector, useDispatch } from 'react-redux';

const MyComponent = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.user);
  
  return <Text>{userInfo?.name}</Text>;
};
```

---

## 🎨 UI 组件

使用 React Native Paper:

```javascript
import {
  Button,
  Card,
  Text,
  TextInput,
  FAB,
  ActivityIndicator,
} from 'react-native-paper';

// 按钮
<Button mode="contained" onPress={handlePress}>
  点击
</Button>

// 卡片
<Card>
  <Card.Content>
    <Text>内容</Text>
  </Card.Content>
</Card>

// 输入框
<TextInput label="用户名" value={text} onChangeText={setText} />
```

---

## 📊 当前进度

| 模块 | 状态 | 进度 |
|------|------|------|
| 项目结构 | ✅ 完成 | 100% |
| 用户认证 | ✅ 完成 | 100% |
| 首页 | ✅ 完成 | 100% |
| 房源列表 | ✅ 完成 | 80% |
| 房源详情 | 🚧 开发中 | 0% |
| 租客管理 | ⏳ 待开发 | 0% |
| 租约管理 | ⏳ 待开发 | 0% |
| 账单管理 | ⏳ 待开发 | 0% |
| 消息沟通 | ⏳ 待开发 | 0% |

**总体进度: 30%**

---

## 🎯 下一步

### Phase 1 (当前)
- ✅ 项目初始化
- ✅ 基础架构
- ✅ 登录认证
- ✅ 首页仪表盘
- ✅ 房源列表

### Phase 2 (进行中)
- [ ] 房源详情/编辑
- [ ] 创建房源表单
- [ ] 租客管理
- [ ] 租约管理

### Phase 3 (计划中)
- [ ] 账单管理
- [ ] 消息沟通
- [ ] 文件上传
- [ ] 推送通知

### Phase 4 (优化)
- [ ] 离线支持
- [ ] 数据缓存
- [ ] 性能优化
- [ ] 错误监控

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

---

## 📄 许可证

MIT

---

## 📞 支持

如有问题，请创建 Issue 或联系开发团队。

---

**📱 开始开发移动应用吧！**
