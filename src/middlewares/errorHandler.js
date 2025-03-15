const logger = require('../utils/logger');

module.exports = () => {
  return async (ctx, next) => {
    try {
      await next();
    } catch (err) {
      console.error('Error occurred:', err);

      // 设置跨域响应头
      ctx.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      });

      // 处理不同类型的错误
      if (err.name === 'ValidationError') {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: err.message
        };
        return;
      }

      if (err.name === 'CastError') {
        ctx.status = 400;
        ctx.body = {
          code: 400,
          message: '无效的ID格式'
        };
        return;
      }

      if (err.status === 401) {
        ctx.status = 401;
        ctx.body = {
          code: 401,
          message: '未授权访问'
        };
        return;
      }

      // 默认错误处理
      ctx.status = err.status || 500;
      ctx.body = {
        code: ctx.status,
        message: err.message || '服务器内部错误'
      };
    }
  };
}; 