const Router = require('@koa/router');
const Order = require('../models/order.model');
const auth = require('../middlewares/auth');

const router = new Router({ prefix: '/api/orders' });

// 添加认证中间件
router.use(auth());

// 创建订单
router.post('/', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { items, shippingAddress } = ctx.request.body;

    // 计算订单总金额
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = new Order({
      user: userId,
      items,
      shippingAddress,
      totalAmount,
      status: 'pending'
    });

    await order.save();

    ctx.body = {
      code: 0,
      data: order,
      message: '订单创建成功'
    };
  } catch (error) {
    console.error('Error creating order:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '创建订单失败'
    };
  }
});

// 获取订单列表
router.get('/', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { page = 1, limit = 10 } = ctx.query;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product'),
      Order.countDocuments({ user: userId })
    ]);

    ctx.body = {
      code: 0,
      data: {
        list: orders,
        totalCount: total
      },
      message: 'Success'
    };
  } catch (error) {
    console.error('Error getting orders:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '获取订单列表失败'
    };
  }
});

// 获取订单详情
router.get('/:id', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { id } = ctx.params;

    const order = await Order.findOne({
      _id: id,
      user: userId
    }).populate('items.product');

    if (!order) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '订单不存在'
      };
      return;
    }

    ctx.body = {
      code: 0,
      data: order,
      message: 'Success'
    };
  } catch (error) {
    console.error('Error getting order:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '获取订单详情失败'
    };
  }
});

// 取消订单
router.put('/:id/cancel', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { id } = ctx.params;

    const order = await Order.findOne({
      _id: id,
      user: userId,
      status: 'pending'
    });

    if (!order) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '订单不存在或无法取消'
      };
      return;
    }

    order.status = 'cancelled';
    order.cancelTime = new Date();
    await order.save();

    ctx.body = {
      code: 0,
      data: order,
      message: '订单已取消'
    };
  } catch (error) {
    console.error('Error cancelling order:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '取消订单失败'
    };
  }
});

// 支付订单
router.post('/:id/pay', async (ctx) => {
  try {
    const userId = ctx.state.user._id;
    const { id } = ctx.params;
    const { paymentMethod } = ctx.request.body;

    const order = await Order.findOne({
      _id: id,
      user: userId,
      status: 'pending'
    });

    if (!order) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '订单不存在或无法支付'
      };
      return;
    }

    // 模拟支付过程
    order.status = 'paid';
    order.paymentMethod = paymentMethod;
    order.paymentTime = new Date();
    await order.save();

    ctx.body = {
      code: 0,
      data: order,
      message: '支付成功'
    };
  } catch (error) {
    console.error('Error paying order:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '支付失败'
    };
  }
});

module.exports = router; 