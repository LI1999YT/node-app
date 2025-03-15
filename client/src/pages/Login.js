import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login, clearError } from '../store/slices/authSlice';
import { auth } from '../services/api';
import CryptoJS from 'crypto-js';

const Login = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [captchaImage, setCaptchaImage] = useState('');
  const [captchaKey, setCaptchaKey] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    refreshCaptcha();
  }, []);

  useEffect(() => {
    if (error) {
      if (typeof error === 'string') {
        message.error(error);
      } else if (error.message) {
        message.error(error.message);
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const refreshCaptcha = async () => {
    try {
      const response = await auth.getCaptcha();
      if (response.code === 0) {
        const key = response.data.key;
        const image = response.data.image;
        setCaptchaKey(key);
        setCaptchaImage(image);
      } else {
        message.error('获取验证码失败');
      }
    } catch (err) {
      console.error('获取验证码失败:', err);
      message.error('获取验证码失败');
    }
  };

  const onFinish = async (values) => {
    try {
      const encryptedPassword = CryptoJS.MD5(values.password).toString();
      
      await dispatch(login({ 
        ...values, 
        password: encryptedPassword,
        captchaKey,
        captchaCode: values.captcha 
      })).unwrap();
      
      message.success('登录成功');
      navigate('/');
    } catch (err) {
      refreshCaptcha();
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2 className="auth-title">用户登录</h2>
        <Form
          form={form}
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="邮箱"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="captcha"
            rules={[{ required: true, message: '请输入验证码' }]}
          >
            <div style={{ display: 'flex', gap: '10px' }}>
              <Input
                placeholder="验证码"
                size="large"
                style={{ flex: 1 }}
              />
              <div
                style={{
                  width: '120px',
                  height: '40px',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  backgroundColor: '#f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onClick={refreshCaptcha}
                dangerouslySetInnerHTML={{ __html: captchaImage }}
              />
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Link to="/register">还没有账号？立即注册</Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login; 