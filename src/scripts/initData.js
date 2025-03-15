require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product.model');

const products = [
  {
    name: 'iPhone 15 Pro',
    description: '最新款 iPhone，搭载 A17 Pro 芯片，采用钛金属机身设计',
    price: 7999,
    originalPrice: 8999,
    stock: 100,
    images: [
      'https://img.alicdn.com/imgextra/i4/O1CN01Rqb1yc1YtfZQpLFYE_!!6000000003115-0-tps-800-800.jpg'
    ],
    category: '手机',
    tags: ['苹果', '新品', '5G'],
    specs: [
      { name: '颜色', value: '原色钛金属' },
      { name: '存储', value: '256GB' },
      { name: '处理器', value: 'A17 Pro' }
    ],
    rating: 4.9,
    sales: 1000
  },
  {
    name: 'MacBook Pro 14',
    description: '搭载 M3 Pro 芯片的专业级笔记本电脑',
    price: 14999,
    originalPrice: 15999,
    stock: 50,
    images: [
      'https://img.alicdn.com/imgextra/i2/O1CN01sQtHxp1tEoKX2SuKe_!!6000000005870-0-tps-800-800.jpg'
    ],
    category: '电脑',
    tags: ['苹果', '笔记本', 'M3'],
    specs: [
      { name: '颜色', value: '深空灰色' },
      { name: '内存', value: '16GB' },
      { name: '存储', value: '512GB' }
    ],
    rating: 4.8,
    sales: 500
  },
  {
    name: 'iPad Air',
    description: 'M1 芯片驱动的轻薄平板电脑',
    price: 4799,
    originalPrice: 4999,
    stock: 200,
    images: [
      'https://img.alicdn.com/imgextra/i3/O1CN01Z5Qj1q1nx1BYm6ZKz_!!6000000005151-0-tps-800-800.jpg'
    ],
    category: '平板',
    tags: ['苹果', '平板', 'M1'],
    specs: [
      { name: '颜色', value: '星光色' },
      { name: '存储', value: '64GB' },
      { name: '连接', value: 'WiFi' }
    ],
    rating: 4.7,
    sales: 800
  },
  {
    name: 'AirPods Pro 2',
    description: '主动降噪无线耳机，支持空间音频',
    price: 1799,
    originalPrice: 1999,
    stock: 300,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '配件',
    tags: ['苹果', '耳机', '降噪'],
    specs: [
      { name: '颜色', value: '白色' },
      { name: '连接', value: 'USB-C' },
      { name: '功能', value: '主动降噪' }
    ],
    rating: 4.6,
    sales: 2000
  },
  // 添加更多手机
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: '三星最新旗舰手机，搭载骁龙 8 Gen 3 处理器，支持AI功能',
    price: 9999,
    originalPrice: 10999,
    stock: 80,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '手机',
    tags: ['三星', '新品', '5G', 'AI'],
    specs: [
      { name: '颜色', value: '钛灰色' },
      { name: '存储', value: '512GB' },
      { name: '处理器', value: '骁龙 8 Gen 3' }
    ],
    rating: 4.8,
    sales: 500
  },
  {
    name: 'OPPO Find X7 Ultra',
    description: '影像旗舰，搭载双潜望式镜头，支持1英寸大底主摄',
    price: 6999,
    originalPrice: 7499,
    stock: 150,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '手机',
    tags: ['OPPO', '新品', '5G', '影像'],
    specs: [
      { name: '颜色', value: '微醺金' },
      { name: '存储', value: '512GB' },
      { name: '处理器', value: '天玑 9300' }
    ],
    rating: 4.7,
    sales: 300
  },
  // 添加更多电脑
  {
    name: 'ROG 魔霸新锐',
    description: '搭载RTX 4090显卡的顶级游戏本，支持MUX直连',
    price: 19999,
    originalPrice: 21999,
    stock: 30,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '电脑',
    tags: ['华硕', '游戏本', 'RTX4090'],
    specs: [
      { name: '颜色', value: '暗夜黑' },
      { name: '内存', value: '32GB' },
      { name: '显卡', value: 'RTX 4090' }
    ],
    rating: 4.9,
    sales: 100
  },
  {
    name: 'ThinkPad X1 Carbon',
    description: '轻薄商务本的标杆，极致便携性能兼备',
    price: 12999,
    originalPrice: 13999,
    stock: 60,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '电脑',
    tags: ['联想', '商务本', '轻薄本'],
    specs: [
      { name: '颜色', value: '碳纤维黑' },
      { name: '内存', value: '16GB' },
      { name: '处理器', value: 'i7-13700H' }
    ],
    rating: 4.7,
    sales: 400
  },
  // 添加更多平板
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    description: '超大屏幕的生产力平板，支持S Pen手写',
    price: 7999,
    originalPrice: 8499,
    stock: 100,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '平板',
    tags: ['三星', '平板', 'S Pen'],
    specs: [
      { name: '颜色', value: '石墨灰' },
      { name: '存储', value: '256GB' },
      { name: '屏幕', value: '14.6英寸' }
    ],
    rating: 4.6,
    sales: 200
  },
  // 添加更多配件
  {
    name: 'Sony WH-1000XM5',
    description: '索尼旗舰降噪耳机，8麦克风降噪系统',
    price: 2999,
    originalPrice: 3299,
    stock: 200,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '配件',
    tags: ['索尼', '耳机', '降噪'],
    specs: [
      { name: '颜色', value: '银色' },
      { name: '连接', value: '蓝牙5.2' },
      { name: '续航', value: '30小时' }
    ],
    rating: 4.8,
    sales: 1500
  },
  {
    name: 'Apple Watch Series 9',
    description: '最新一代 Apple Watch，支持双击手势操作',
    price: 3299,
    originalPrice: 3599,
    stock: 150,
    images: [
      'https://img.alicdn.com/imgextra/i1/O1CN01KYW2Pu1yx3LyQhDT6_!!6000000006642-0-tps-800-800.jpg'
    ],
    category: '配件',
    tags: ['苹果', '智能手表', '运动'],
    specs: [
      { name: '颜色', value: '午夜色' },
      { name: '尺寸', value: '45mm' },
      { name: '连接', value: 'GPS' }
    ],
    rating: 4.7,
    sales: 800
  }
];

async function initData() {
  try {
    // 连接数据库
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 清空现有数据
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // 插入新数据
    await Product.insertMany(products);
    console.log('Inserted sample products');

    console.log('Data initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Error initializing data:', error);
    process.exit(1);
  }
}

initData(); 