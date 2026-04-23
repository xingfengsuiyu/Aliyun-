/**
 * 用户状态管理模块
 * 负责用户登录、登出、自动登录等状态管理
 * 使用 Redux Toolkit 简化 Redux 开发
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../api';

/**
 * 用户登录异步操作
 * 调用后端登录接口，保存 Token 和用户信息到本地存储
 */
export const register = createAsyncThunk(
  'user/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(payload);
      if (response.code !== 200) {
        return rejectWithValue(response.message || '注册失败');
      }
      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        '注册失败';
      return rejectWithValue(msg);
    }
  }
);

export const login = createAsyncThunk(
  'user/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      if (response.code !== 200) {
        return rejectWithValue(response.message || '登录失败');
      }
      const { token, user } = response.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));

      return { token, user };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        '登录失败';
      return rejectWithValue(msg);
    }
  }
);

/**
 * 加载用户信息异步操作
 * 应用启动时检查本地存储，实现自动登录
 */
export const loadUser = createAsyncThunk(
  'user/loadUser',
  async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userInfo = await AsyncStorage.getItem('userInfo');

      if (token && userInfo) {
        return { token, user: JSON.parse(userInfo) };
      }
      return null;
    } catch (error) {
      return null;
    }
  }
);

// 创建用户状态切片
const userSlice = createSlice({
  name: 'user',
  initialState: {
    token: null,
    userInfo: null,
    isLoggedIn: false,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.token = null;
      state.userInfo = null;
      state.isLoggedIn = false;
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('userInfo');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.userInfo = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.token = action.payload.token;
        state.userInfo = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.userInfo = action.payload.user;
          state.isLoggedIn = true;
        }
      });
  },
});

export const { logout } = userSlice.actions;
export default userSlice.reducer;