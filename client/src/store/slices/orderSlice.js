import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orders } from '../../services/api';

// 异步action：创建订单
export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (orderData) => {
    const response = await orders.create(orderData);
    return response.data;
  }
);

// 异步action：获取订单列表
export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params) => {
    const response = await orders.getList(params);
    return response.data;
  }
);

// 异步action：获取订单详情
export const fetchOrderDetail = createAsyncThunk(
  'orders/fetchOrderDetail',
  async (id) => {
    const response = await orders.getDetail(id);
    return response.data;
  }
);

// 异步action：取消订单
export const cancelOrder = createAsyncThunk(
  'orders/cancelOrder',
  async (id) => {
    const response = await orders.cancel(id);
    return response.data;
  }
);

// 异步action：支付订单
export const payOrder = createAsyncThunk(
  'orders/payOrder',
  async ({ id, paymentData }) => {
    const response = await orders.pay(id, paymentData);
    return response.data;
  }
);

const initialState = {
  list: [],
  currentOrder: null,
  totalCount: 0,
  loading: false,
  error: null,
  paymentLoading: false,
  paymentError: null
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
      state.paymentError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 创建订单
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 获取订单列表
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.orders;
        state.totalCount = action.payload.totalCount;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 获取订单详情
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 取消订单
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.list = state.list.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      // 支付订单
      .addCase(payOrder.pending, (state) => {
        state.paymentLoading = true;
        state.paymentError = null;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.paymentLoading = false;
        state.currentOrder = action.payload;
        state.list = state.list.map(order =>
          order._id === action.payload._id ? action.payload : order
        );
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.paymentLoading = false;
        state.paymentError = action.error.message;
      });
  }
});

export const { clearCurrentOrder, clearError } = orderSlice.actions;
export default orderSlice.reducer; 