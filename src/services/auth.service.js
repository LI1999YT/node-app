const jwt = require('jsonwebtoken');
const Redis = require('ioredis');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const svgCaptcha = require('svg-captcha');
const User = require('../models/user.model');
const logger = require('../utils/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT
});

class AuthService {
  static instance;

  static getInstance() {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // 生成JWT token
  generateToken(user) {
    return jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  // 生成验证码
  generateCaptcha() {
    return svgCaptcha.create({
      size: 4,
      noise: 2,
      color: true
    });
  }

  // 保存验证码到Redis
  async saveCaptcha(key, value) {
    await redis.set(key, value.toLowerCase(), 'EX', 300); // 5分钟过期
  }

  // 验证验证码
  async verifyCaptcha(key, value) {
    const storedValue = await redis.get(key);
    return storedValue === value.toLowerCase();
  }

  // 发送验证邮件
  async sendVerificationEmail(user) {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    const verificationUrl = `${process.env.APP_URL}/verify-email?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: user.email,
      subject: '请验证您的邮箱',
      html: `
        <h1>邮箱验证</h1>
        <p>您好 ${user.username}，</p>
        <p>请点击下面的链接验证您的邮箱：</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>此链接将在24小时后过期。</p>
        <p>如果这不是您的操作，请忽略此邮件。</p>
      `
    });
  }

  // 验证邮箱
  async verifyEmail(token) {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error('无效的验证令牌');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return user;
  }

  // 用户注册
  async register(userData) {
    const { email, password, username } = userData;

    // 检查邮箱是否已被注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('该邮箱已被注册');
    }

    // 创建新用户
    const user = new User({
      email,
      password,
      username
    });

    await user.save();
    await this.sendVerificationEmail(user);

    return user;
  }

  // 用户登录
  async login(email, password) {
    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('用户不存在');
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new Error('密码错误');
    }

    // 检查邮箱验证状态
    if (!user.isVerified) {
      throw new Error('请先验证邮箱');
    }

    // 生成token
    const token = this.generateToken(user);

    return { user, token };
  }
}

module.exports = AuthService;