const Router = require('@koa/router');
const Cart = require('../models/cart.model');
const Product = require('../models/product.model');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/api/cart' });

// 添加认证中间件
router.use(auth());

// 获取购物车
router.get('/', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    console.log('Getting cart for user:', userId);
    
    const cart = await Cart.findOne({ user: userId })
      .populate('items.product');

    if (cart) {
      await cart.updateTotalAmount();
    }

    ctx.body = {
      code: 0,
      data: cart || { items: [], totalAmount: 0 },
      message: 'Success'
    };
  } catch (error) {
    console.error('Error getting cart:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

// 添加商品到购物车
router.post('/', async (ctx) => {
  console.log('Adding to cart:', {
    body: ctx.request.body,
    user: ctx.state.user._id
  });
  
  try {
    const userId = ctx.state.user._id;
    const { productId, quantity = 1 } = ctx.request.body;

    if (!productId) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '商品ID不能为空'
      };
      return;
    }

    // 检查商品是否存在
    const product = await Product.findById(productId);
    if (!product) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '商品不存在'
      };
      return;
    }

    // 获取或创建购物车
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ 
        user: userId, 
        items: [],
        totalAmount: 0
      });
    }

    // 检查商品是否已在购物车中
    const existingItem = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (existingItem) {
      // 更新数量
      existingItem.quantity += quantity;
    } else {
      // 添加新商品
      cart.items.push({
        product: productId,
        quantity
      });
    }

    // 更新总金额
    await cart.updateTotalAmount();
    await cart.save();

    // 重新获取购物车并填充商品信息
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product');

    console.log('Cart updated successfully:', {
      userId,
      productId,
      quantity,
      totalItems: updatedCart.items.length
    });

    ctx.body = {
      code: 0,
      data: updatedCart,
      message: 'Success'
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '添加到购物车失败'
    };
  }
});

// 更新购物车商品数量
router.put('/quantity', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { productId, quantity } = ctx.request.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '购物车不存在'
      };
      return;
    }

    const item = cart.items.find(item => 
      item.product.toString() === productId
    );

    if (!item) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '商品不在购物车中'
      };
      return;
    }

    item.quantity = quantity;
    await cart.updateTotalAmount();
    await cart.save();

    // 重新获取购物车并填充商品信息
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product');

    ctx.body = {
      code: 0,
      data: updatedCart,
      message: 'Success'
    };
  } catch (error) {
    console.error('Error updating quantity:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

// 从购物车中删除商品
router.delete('/:id', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const productId = ctx.params.id;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '购物车不存在'
      };
      return;
    }

    cart.items = cart.items.filter(item => 
      item.product.toString() !== productId
    );

    await cart.updateTotalAmount();
    await cart.save();

    // 重新获取购物车并填充商品信息
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product');

    ctx.body = {
      code: 0,
      data: updatedCart,
      message: 'Success'
    };
  } catch (error) {
    console.error('Error removing from cart:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

// 选择购物车商品
router.put('/select', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { productIds, selected } = ctx.request.body;

    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '购物车不存在'
      };
      return;
    }

    // 更新选中状态
    cart.items.forEach(item => {
      if (productIds.includes(item.product.toString())) {
        item.selected = selected;
      }
    });

    await cart.updateTotalAmount();
    await cart.save();

    // 重新获取购物车并填充商品信息
    const updatedCart = await Cart.findById(cart._id)
      .populate('items.product');

    ctx.body = {
      code: 0,
      data: updatedCart,
      message: 'Success'
    };
  } catch (error) {
    console.error('Error selecting items:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '选择商品失败'
    };
  }
});

module.exports = router; 