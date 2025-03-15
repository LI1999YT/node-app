import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Input, Pagination, Spin, Empty, message } from 'antd';
import { SearchOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { fetchProducts, searchProducts } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';

const { Meta } = Card;
const { Search } = Input;

const Home = () => {
  console.log('Home component rendered');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: products, totalCount, loading, error } = useSelector((state) => {
    console.log('Products from store:', state.products);
    return state.products;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);

  const loadProducts = async () => {
    console.log('Loading products with params:', { page: currentPage, limit: pageSize });
    try {
      const result = await dispatch(fetchProducts({
        page: currentPage,
        limit: pageSize
      })).unwrap();
      console.log('Products loaded:', result);
    } catch (err) {
      console.error('Error loading products:', err);
      message.error('加载商品失败，请刷新页面重试');
    }
  };

  useEffect(() => {
    console.log('useEffect triggered with:', { currentPage, pageSize });
    loadProducts();
  }, [currentPage, pageSize, dispatch]);

  useEffect(() => {
    if (error) {
      console.error('Error from store:', error);
      message.error(error);
    }
  }, [error]);

  const onSearch = (value) => {
    if (value) {
      dispatch(searchProducts(value));
    } else {
      loadProducts();
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation(); // 阻止事件冒泡
    try {
      // 检查用户是否登录
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('请先登录');
        navigate('/login');
        return;
      }

      console.log('Adding to cart:', { productId });
      await dispatch(addToCart({ productId, quantity: 1 })).unwrap();
      message.success('已添加到购物车');
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err.code === 401) {
        message.error('请先登录');
        navigate('/login');
      } else {
        message.error(err.message || '添加失败，请重试');
      }
    }
  };

  const handleProductClick = (productId) => {
    console.log('Navigating to product:', productId);
    navigate(`/products/${productId}`);
  };

  const renderProducts = () => {
    console.log('Rendering products:', { loading, productsLength: products?.length });
    if (loading) {
      return (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      );
    }

    if (!products?.length) {
      return (
        <Empty description="暂无商品" />
      );
    }

    return (
      <Row gutter={[16, 16]}>
        {products.map(product => (
          <Col xs={24} sm={12} md={8} lg={6} key={product._id}>
            <Card
              hoverable
              onClick={() => handleProductClick(product._id)}
              cover={
                <img
                  alt={product.name}
                  src={product.images[0]}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
              actions={[
                <ShoppingCartOutlined 
                  key="cart" 
                  onClick={(e) => handleAddToCart(e, product._id)}
                  style={{ fontSize: '20px' }}
                />
              ]}
            >
              <Meta
                title={product.name}
                description={
                  <div>
                    <div style={{ color: '#f5222d', fontSize: '16px', marginBottom: '8px' }}>
                      ¥{product.price.toFixed(2)}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                      已售 {product.sales}
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  return (
    <div className="container">
      <div style={{ padding: '20px 0' }}>
        <Search
          placeholder="搜索商品"
          enterButton={<SearchOutlined />}
          size="large"
          onSearch={onSearch}
          style={{ maxWidth: 500, margin: '0 auto' }}
        />
      </div>

      {renderProducts()}

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <Pagination
          current={currentPage}
          total={totalCount}
          pageSize={pageSize}
          onChange={setCurrentPage}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default Home; 