const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const auth = () => async (ctx, next) => {
  try {
    const authHeader = ctx.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '未登录或登录已过期'
      };
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    ctx.state.user = user;
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    ctx.status = 401;
    ctx.body = {
      code: 401,
      message: '认证失败'
    };
  }
};

module.exports = auth; 