import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { auth } from '../../services/api';

// 异步action：登录
export const login = createAsyncThunk(
  'auth/login',
  async (credentials) => {
    const response = await auth.login(credentials);
    localStorage.setItem('token', response.data.token);
    return response.data;
  }
);

// 异步action：注册
export const register = createAsyncThunk(
  'auth/register',
  async (userData) => {
    const response = await auth.register(userData);
    return response.data;
  }
);

// 异步action：验证邮箱
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token) => {
    const response = await auth.verifyEmail(token);
    return response.data;
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 登录
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 注册
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 验证邮箱
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer; 