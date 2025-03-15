const nodemailer = require('nodemailer');

// 创建邮件传输对象
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// 发送验证邮件
const sendVerificationEmail = async (to, token) => {
  console.log('Sending verification email to:', to);
  console.log('Email configuration:', {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    from: process.env.EMAIL_FROM
  });

  const transporter = createTransporter();
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: '验证您的邮箱',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>验证您的邮箱</h2>
        <p>感谢您注册我们的服务！请点击下面的链接验证您的邮箱：</p>
        <p>
          <a href="${verificationUrl}" 
             style="display: inline-block; 
                    padding: 10px 20px; 
                    background-color: #1890ff; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px;">
            验证邮箱
          </a>
        </p>
        <p>如果您没有注册账号，请忽略此邮件。</p>
        <p>此链接将在24小时后失效。</p>
        <p>如果按钮无法点击，请复制以下链接到浏览器：</p>
        <p>${verificationUrl}</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('发送验证邮件失败：' + error.message);
  }
};

// 发送重置密码邮件
const sendResetPasswordEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
    to,
    subject: '重置密码',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>重置密码</h2>
        <p>您收到此邮件是因为您（或其他人）请求重置密码。</p>
        <p>请点击下面的链接重置密码：</p>
        <p>
          <a href="${resetUrl}" 
             style="display: inline-block; 
                    padding: 10px 20px; 
                    background-color: #1890ff; 
                    color: white; 
                    text-decoration: none; 
                    border-radius: 4px;">
            重置密码
          </a>
        </p>
        <p>如果您没有请求重置密码，请忽略此邮件。</p>
        <p>此链接将在1小时后失效。</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail
}; 