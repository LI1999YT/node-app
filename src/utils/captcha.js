const Redis = require('ioredis');
const svgCaptcha = require('svg-captcha');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// 生成验证码
const generateCaptcha = () => {
  const captcha = svgCaptcha.create({
    size: 4, // 验证码长度
    noise: 2, // 干扰线条数
    color: true, // 验证码字符颜色
    background: '#f0f0f0', // 背景色
    width: 120,
    height: 40,
    fontSize: 40,
    ignoreChars: '0o1ilI', // 排除容易混淆的字符
    charPreset: '346789ABCDEFGHJKLMNPQRSTUVWXY' // 自定义字符集
  });

  return captcha;
};

// 保存验证码到 Redis
const saveCaptcha = async (key, code) => {
  // 验证码有效期5分钟
  await redis.set(`captcha:${key}`, code.toLowerCase(), 'EX', 300);
};

// 验证验证码
const verifyCaptcha = async (key, code) => {
  if (!key || !code) {
    return false;
  }
  
  const savedCode = await redis.get(`captcha:${key}`);
  if (!savedCode) {
    return false;
  }

  // 验证后立即删除验证码
  await redis.del(`captcha:${key}`);
  
  return savedCode === code.toLowerCase();
};

module.exports = {
  generateCaptcha,
  saveCaptcha,
  verifyCaptcha
}; 