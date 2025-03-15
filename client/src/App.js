import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge, Avatar } from 'antd';
import {
  HomeOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  OrderedListOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import OrderList from './pages/OrderList';
import OrderDetail from './pages/OrderDetail';
import UserProfile from './pages/UserProfile';

const { Header, Content, Footer } = Layout;

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const AppHeader = () => {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%', padding: '0 50px' }}>
      <div style={{ float: 'left', color: '#fff', fontSize: '18px', marginRight: '50px' }}>
        小黎商城
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={[location.pathname]}
      >
        <Menu.Item key="/" icon={<HomeOutlined />}>
          <Link to="/">首页</Link>
        </Menu.Item>
        {isAuthenticated ? (
          <>
            <Menu.Item key="/cart" icon={
              <Badge count={cartItemCount} size="small">
                <ShoppingCartOutlined style={{ fontSize: '16px', color: '#fff' }} />
              </Badge>
            }>
              <Link to="/cart">购物车</Link>
            </Menu.Item>
            <Menu.Item key="/orders" icon={<OrderedListOutlined />}>
              <Link to="/orders">我的订单</Link>
            </Menu.Item>
            <Menu.Item key="/profile" icon={<UserOutlined />}>
              <Link to="/profile">个人中心</Link>
            </Menu.Item>
          </>
        ) : (
          <>
            <Menu.Item key="/login">
              <Link to="/login">登录</Link>
            </Menu.Item>
            <Menu.Item key="/register">
              <Link to="/register">注册</Link>
            </Menu.Item>
          </>
        )}
      </Menu>
    </Header>
  );
};

const App = () => {
  return (
    <Router>
      <Layout>
        <AppHeader />
        <Content style={{ padding: '0 50px', marginTop: 64 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <Cart />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <OrderList />
                </PrivateRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <PrivateRoute>
                  <OrderDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserProfile />
                </PrivateRoute>
              }
            />
          </Routes>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          小黎商城 ©{new Date().getFullYear()} Created by 小黎
        </Footer>
      </Layout>
    </Router>
  );
};

export default App;
