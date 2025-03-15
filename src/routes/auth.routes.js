const Router = require('@koa/router');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const { generateCaptcha, saveCaptcha, verifyCaptcha } = require('../utils/captcha');
const { sendVerificationEmail } = require('../utils/email');

const router = new Router({ prefix: '/auth' });

// 获取验证码
router.get('/captcha', async (ctx) => {
  try {
    const captchaKey = Math.random().toString(36).substring(2, 15);
    const captcha = generateCaptcha();
    
    // 保存验证码到 Redis
    await saveCaptcha(captchaKey, captcha.text);

    // 设置响应头
    ctx.set('Content-Type', 'application/json');
    ctx.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    ctx.set('Pragma', 'no-cache');
    ctx.set('Expires', '0');
    
    ctx.body = {
      code: 0,
      data: {
        key: captchaKey,
        image: captcha.data
      },
      message: 'Success'
    };
  } catch (error) {
    console.error('Error generating captcha:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '生成验证码失败'
    };
  }
});

// 注册
router.post('/register', async (ctx) => {
  try {
    console.log('Registration request body:', ctx.request.body);
    const { email, password, username, captchaKey, captchaCode } = ctx.request.body;

    // 验证必填字段
    if (!email || !password || !username || !captchaKey || !captchaCode) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '请填写所有必填字段'
      };
      return;
    }

    // 验证验证码
    const isCaptchaValid = await verifyCaptcha(captchaKey, captchaCode);
    if (!isCaptchaValid) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '验证码错误或已过期'
      };
      return;
    }

    // 检查邮箱是否已注册
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '该邮箱已被注册'
      };
      return;
    }

    // 创建新用户（密码已在前端加密）
    const user = new User({
      email,
      password, // 前端已经进行了 MD5 加密
      username
    });

    await user.save();
    console.log('User saved successfully:', user._id);

    // 生成验证邮件 token
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 发送验证邮件
    try {
      await sendVerificationEmail(email, verificationToken);
      console.log('Verification email sent successfully');
    } catch (emailError) {
      console.error('Error sending verification email:', emailError);
      // 即使邮件发送失败，我们仍然允许注册成功
    }

    ctx.body = {
      code: 0,
      data: user.toProfile(),
      message: '注册成功，请查收验证邮件'
    };
  } catch (error) {
    console.error('Error in register:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message || '注册失败，请稍后重试'
    };
  }
});

// 登录
router.post('/login', async (ctx) => {
  try {
    const { email, password, captchaKey, captchaCode } = ctx.request.body;

    // 验证必填字段
    if (!email || !password || !captchaKey || !captchaCode) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '请填写所有必填字段'
      };
      return;
    }

    // 验证验证码
    const isCaptchaValid = await verifyCaptcha(captchaKey, captchaCode);
    if (!isCaptchaValid) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '验证码错误或已过期'
      };
      return;
    }

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '用户不存在'
      };
      return;
    }

    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '密码错误'
      };
      return;
    }

    // 生成 token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    ctx.body = {
      code: 0,
      data: {
        token,
        user: user.toProfile()
      },
      message: 'Success'
    };
  } catch (error) {
    console.error('Error in login:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

// 验证邮箱
router.get('/verify-email', async (ctx) => {
  try {
    const { token } = ctx.query;
    if (!token) {
      ctx.status = 400;
      ctx.body = {
        code: 400,
        message: '验证token不能为空'
      };
      return;
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        code: 404,
        message: '用户不存在'
      };
      return;
    }

    // 更新验证状态
    user.isVerified = true;
    await user.save();

    ctx.body = {
      code: 0,
      message: '邮箱验证成功'
    };
  } catch (error) {
    console.error('Error in verify email:', error);
    ctx.status = 500;
    ctx.body = {
      code: 500,
      message: error.message
    };
  }
});

module.exports = router; 