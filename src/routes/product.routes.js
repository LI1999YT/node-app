const Router = require('@koa/router');
const Product = require('../models/product.model');

const router = new Router({
  prefix: '/products'
});

// 获取商品列表
router.get('/', async (ctx) => {
  console.log('Received request for product list:', {
    query: ctx.query,
    headers: ctx.headers
  });
  try {
    const { page = 1, limit = 12 } = ctx.query;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find({ isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments({ isActive: true })
    ]);

    console.log('Found products:', {
      count: products.length,
      total,
      page,
      limit
    });

    ctx.body = {
      code: 0,
      data: {
        products,
        totalCount: total
      },
      message: 'Success'
    };
  } catch (error) {
    console.error('Error getting product list:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

// 搜索商品
router.get('/search', async (ctx) => {
  console.log('Received search request:', {
    query: ctx.query,
    headers: ctx.headers
  });
  try {
    const { keyword } = ctx.query;
    const products = await Product.find(
      { 
        $text: { $search: keyword },
        isActive: true 
      },
      { 
        score: { $meta: 'textScore' } 
      }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20);

    console.log('Search results:', {
      keyword,
      count: products.length
    });

    ctx.body = {
      code: 0,
      data: {
        products,
        totalCount: products.length
      },
      message: 'Success'
    };
  } catch (error) {
    console.error('Error searching products:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

// 获取商品详情
router.get('/:id', async (ctx) => {
  console.log('Received product detail request:', {
    params: ctx.params,
    headers: ctx.headers
  });
  try {
    const { id } = ctx.params;
    const product = await Product.findById(id);
    
    if (!product) {
      console.log('Product not found:', id);
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '商品不存在'
      };
      return;
    }

    console.log('Found product:', {
      id: product._id,
      name: product.name
    });

    ctx.body = {
      code: 0,
      data: product,
      message: 'Success'
    };
  } catch (error) {
    console.error('Error getting product detail:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

module.exports = router; 