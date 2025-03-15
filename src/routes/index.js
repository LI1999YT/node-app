const Router = require('@koa/router');
const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const cartRoutes = require('./cart.routes');
const orderRoutes = require('./order.routes');
const userRoutes = require('./user.routes');

const router = new Router({
  prefix: '/api'
});

// Register all routes
router.use(authRoutes.routes());
router.use(productRoutes.routes());
router.use(cartRoutes.routes());
router.use(orderRoutes.routes());
router.use(userRoutes.routes());

// API health check
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
});

module.exports = router; 