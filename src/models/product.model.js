const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['手机', '电脑', '平板', '配件', '其他']
  },
  tags: [{
    type: String
  }],
  specs: [{
    name: String,
    value: String
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 5
  },
  sales: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 添加全文搜索索引
productSchema.index({
  name: 'text',
  description: 'text',
  'specs.value': 'text'
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product; 