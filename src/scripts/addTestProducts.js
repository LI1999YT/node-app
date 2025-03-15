const mongoose = require('mongoose');
const Product = require('../models/product.model');
require('dotenv').config();

const MONGO_URI = 'mongodb://localhost:27017/xiaoli-shop';

const testProducts = [
  {
    name: 'iPhone 14 Pro',
    description: '最新款iPhone，搭载A16芯片，4800万像素主摄，超瓷晶面板。',
    price: 7999,
    originalPrice: 8999,
    stock: 100,
    images: [
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-finish-select-202209-6-7inch-deeppurple?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1663703841896',
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/iphone-14-pro-model-unselect-gallery-2-202209?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660753617559'
    ],
    category: '手机',
    tags: ['苹果', '新品', '5G'],
    specs: [
      { name: '颜色', value: '暗紫色' },
      { name: '存储', value: '256GB' },
      { name: '网络', value: '5G' }
    ],
    rating: 4.9,
    sales: 1000
  },
  {
    name: 'MacBook Pro 14',
    description: 'M2 Pro芯片，14英寸视网膜显示屏，专业级性能。',
    price: 14999,
    originalPrice: 15999,
    stock: 50,
    images: [
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-select-202301?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1671304673229',
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/mbp14-spacegray-gallery1-202301?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1670625201272'
    ],
    category: '电脑',
    tags: ['苹果', '笔记本', 'M2'],
    specs: [
      { name: '颜色', value: '深空灰' },
      { name: '内存', value: '16GB' },
      { name: '存储', value: '512GB' }
    ],
    rating: 4.8,
    sales: 500
  },
  {
    name: 'iPad Air 5',
    description: 'M1芯片，10.9英寸全面屏，支持第二代Apple Pencil。',
    price: 4499,
    originalPrice: 4799,
    stock: 80,
    images: [
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/ipad-air-select-wifi-blue-202203?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1645065732688',
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/ipad-air-storage-select-202203-space-gray-wifi?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1645722432931'
    ],
    category: '平板',
    tags: ['苹果', '平板', 'M1'],
    specs: [
      { name: '颜色', value: '星光色' },
      { name: '存储', value: '64GB' },
      { name: '网络', value: 'WiFi' }
    ],
    rating: 4.7,
    sales: 800
  },
  {
    name: 'AirPods Pro 2',
    description: '主动降噪，空间音频，MagSafe充电盒。',
    price: 1799,
    originalPrice: 1999,
    stock: 200,
    images: [
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660803972361',
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MQD83_AV1?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660803974666'
    ],
    category: '配件',
    tags: ['苹果', '耳机', '降噪'],
    specs: [
      { name: '颜色', value: '白色' },
      { name: '连接', value: '蓝牙5.0' },
      { name: '充电', value: 'MagSafe' }
    ],
    rating: 4.6,
    sales: 2000
  },
  {
    name: 'Apple Watch Series 8',
    description: '先进的健康功能，全天候视网膜显示屏，游泳防水。',
    price: 3199,
    originalPrice: 3499,
    stock: 150,
    images: [
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MPNW3ref_VW_34FR+watch-45-alum-midnight-nc-8s_VW_34FR_WF_CO?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660778411615,1661969389924',
      'https://store.storeimages.cdn-apple.com/8756/as-images.apple.com/is/MPNW3_VW_PF+watch-45-alum-midnight-nc-8s_VW_PF_WF_CO?wid=800&hei=800&fmt=jpeg&qlt=90&.v=1660778411485,1661969389916'
    ],
    category: '配件',
    tags: ['苹果', '智能手表', '运动'],
    specs: [
      { name: '颜色', value: '午夜色' },
      { name: '尺寸', value: '45mm' },
      { name: '网络', value: 'GPS' }
    ],
    rating: 4.7,
    sales: 1200
  }
];

async function addTestProducts() {
  try {
    // 连接数据库
    console.log('Connecting to MongoDB:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // 删除现有商品
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // 添加测试商品
    const products = await Product.insertMany(testProducts);
    console.log('Added test products:', products.length);

    console.log('Test products added successfully');
  } catch (error) {
    console.error('Error adding test products:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addTestProducts(); 