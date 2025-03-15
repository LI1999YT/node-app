import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cart } from '../../services/api';

// 异步action：获取购物车
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async () => {
    const response = await cart.getCart();
    return response.data;
  }
);

// 异步action：添加到购物车
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (productData, { rejectWithValue }) => {
    try {
      console.log('Adding to cart:', productData);
      const response = await cart.addToCart(productData);
      return response.data;
    } catch (error) {
      console.error('Error in addToCart thunk:', error);
      return rejectWithValue(error);
    }
  }
);

// 异步action：更新购物车商品数量
export const updateQuantity = createAsyncThunk(
  'cart/updateQuantity',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      const response = await cart.updateQuantity({ productId, quantity });
      return response.data;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 异步action：从购物车移除商品
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (productId, { rejectWithValue }) => {
    try {
      await cart.removeFromCart(productId);
      return productId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// 异步action：选择购物车商品
export const selectItems = createAsyncThunk(
  'cart/selectItems',
  async ({ productIds, selected }) => {
    const response = await cart.selectItems({ productIds, selected });
    return response.data;
  }
);

const initialState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取购物车
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      // 添加到购物车
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '添加到购物车失败';
      })
      // 更新数量
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '更新数量失败';
      })
      // 移除商品
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.product._id !== action.payload);
        state.totalAmount = state.items.reduce((total, item) => {
          return total + (item.selected ? item.sku.price * item.quantity : 0);
        }, 0);
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || '移除商品失败';
      })
      // 选择商品
      .addCase(selectItems.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.totalAmount = action.payload.totalAmount;
      });
  }
});

export const { clearCart, clearError } = cartSlice.actions;
export default cartSlice.reducer; 