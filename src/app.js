require('dotenv').config();
const Koa = require('koa');
const cors = require('@koa/cors');
const { koaBody } = require('koa-body');
const serve = require('koa-static');
const views = require('koa-views');
const path = require('path');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const logger = require('./utils/logger');
const errorHandler = require('./middlewares/errorHandler');
const router = require('./routes');

const app = new Koa();

// 连接MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => logger.info('MongoDB connected successfully'))
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });

// 连接Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

redis.on('error', err => {
  logger.error('Redis connection error:', err);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

// 中间件
app.use(cors());
app.use(koaBody({
  multipart: true,
  formidable: {
    maxFileSize: 200 * 1024 * 1024 // 设置上传文件大小最大限制，默认200M
  }
}));

// 静态文件服务
app.use(serve(path.join(__dirname, '../public')));

// 模板引擎设置
app.use(views(path.join(__dirname, 'views'), {
  extension: 'ejs'
}));

// 错误处理
app.use(errorHandler());

// 路由
app.use(router.routes()).use(router.allowedMethods());

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});