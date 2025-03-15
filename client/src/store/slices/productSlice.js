import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { products } from '../../services/api';

// 异步action：获取商品列表
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      console.log('fetchProducts thunk called with params:', params);
      const response = await products.getList(params);
      console.log('fetchProducts response:', response);
      if (response.code !== 0) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      console.error('fetchProducts error:', error);
      return rejectWithValue(error.message || '获取商品列表失败');
    }
  }
);

// 异步action：获取商品详情
export const fetchProductDetail = createAsyncThunk(
  'products/fetchProductDetail',
  async (id, { rejectWithValue }) => {
    try {
      const response = await products.getDetail(id);
      if (response.code !== 0) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || '获取商品详情失败');
    }
  }
);

// 异步action：搜索商品
export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (keyword, { rejectWithValue }) => {
    try {
      const response = await products.search(keyword);
      if (response.code !== 0) {
        return rejectWithValue(response.message);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || '搜索商品失败');
    }
  }
);

const initialState = {
  list: [],
  currentProduct: null,
  totalCount: 0,
  loading: false,
  error: null,
  searchResults: [],
  searchLoading: false
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // 获取商品列表
      .addCase(fetchProducts.pending, (state) => {
        console.log('fetchProducts.pending');
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        console.log('fetchProducts.fulfilled:', action.payload);
        state.loading = false;
        state.list = action.payload.products;
        state.totalCount = action.payload.totalCount;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        console.error('fetchProducts.rejected:', action.error);
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // 获取商品详情
      .addCase(fetchProductDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
        state.error = null;
      })
      .addCase(fetchProductDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })
      // 搜索商品
      .addCase(searchProducts.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload.products;
        state.error = null;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export const { clearCurrentProduct, clearSearchResults, clearError } = productSlice.actions;
export default productSlice.reducer; 