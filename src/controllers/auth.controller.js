const AuthService = require('../services/auth.service');
const logger = require('../utils/logger');

class AuthController {
  static instance;
  
  constructor() {
    this.authService = AuthService.getInstance();
  }

  static getInstance() {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }
    return AuthController.instance;
  }

  // 获取验证码
  getCaptcha = async (ctx) => {
    try {
      const captcha = this.authService.generateCaptcha();
      const key = `captcha:${Date.now()}`;
      await this.authService.saveCaptcha(key, captcha.text);

      ctx.type = 'image/svg+xml';
      ctx.body = captcha.data;
      ctx.cookies.set('captchaKey', key, { maxAge: 300000 }); // 5分钟过期
    } catch (error) {
      logger.error('Generate captcha error:', error);
      ctx.status = 500;
      ctx.body = { success: false, message: '生成验证码失败' };
    }
  };

  // 用户注册
  register = async (ctx) => {
    try {
      const { email, password, username, captcha } = ctx.request.body;
      const captchaKey = ctx.cookies.get('captchaKey');

      // 验证验证码
      if (!captchaKey || !await this.authService.verifyCaptcha(captchaKey, captcha)) {
        ctx.status = 400;
        ctx.body = { success: false, message: '验证码错误' };
        return;
      }

      const user = await this.authService.register({ email, password, username });
      
      ctx.status = 201;
      ctx.body = {
        success: true,
        message: '注册成功，请查收验证邮件',
        data: {
          email: user.email,
          username: user.username
        }
      };
    } catch (error) {
      logger.error('Register error:', error);
      ctx.status = 400;
      ctx.body = { success: false, message: error.message };
    }
  };

  // 用户登录
  login = async (ctx) => {
    try {
      const { email, password, captcha } = ctx.request.body;
      const captchaKey = ctx.cookies.get('captchaKey');

      // 验证验证码
      if (!captchaKey || !await this.authService.verifyCaptcha(captchaKey, captcha)) {
        ctx.status = 400;
        ctx.body = { success: false, message: '验证码错误' };
        return;
      }

      const { user, token } = await this.authService.login(email, password);

      ctx.body = {
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username
          }
        }
      };
    } catch (error) {
      logger.error('Login error:', error);
      ctx.status = 401;
      ctx.body = { success: false, message: error.message };
    }
  };

  // 验证邮箱
  verifyEmail = async (ctx) => {
    try {
      const { token } = ctx.query;
      if (!token) {
        throw new Error('验证令牌不能为空');
      }

      const user = await this.authService.verifyEmail(token);
      
      ctx.body = {
        success: true,
        message: '邮箱验证成功',
        data: {
          email: user.email
        }
      };
    } catch (error) {
      logger.error('Verify email error:', error);
      ctx.status = 400;
      ctx.body = { success: false, message: error.message };
    }
  };
}

module.exports = AuthController; 