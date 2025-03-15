import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, InputNumber, Button, Descriptions, message, Spin } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { fetchProductDetail } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, loading, error } = useSelector((state) => state.products);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductDetail(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: id, quantity })).unwrap();
      message.success('已添加到购物车');
    } catch (err) {
      message.error('添加失败，请重试');
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <Card>
        <Row gutter={32}>
          <Col xs={24} md={12}>
            <img
              src={product.images[0]}
              alt={product.name}
              style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
            />
          </Col>
          <Col xs={24} md={12}>
            <h1 style={{ fontSize: '24px', marginBottom: '16px' }}>{product.name}</h1>
            <div style={{ color: '#f5222d', fontSize: '28px', margin: '16px 0' }}>
              ¥{product.price.toFixed(2)}
            </div>
            <Descriptions column={1} style={{ marginBottom: '24px' }}>
              <Descriptions.Item label="商品编号">{product._id}</Descriptions.Item>
              <Descriptions.Item label="库存">{product.stock}</Descriptions.Item>
              <Descriptions.Item label="销量">{product.sales}</Descriptions.Item>
              <Descriptions.Item label="分类">{product.category}</Descriptions.Item>
            </Descriptions>
            <div style={{ marginBottom: '24px' }}>
              <span style={{ marginRight: '12px' }}>数量：</span>
              <InputNumber
                min={1}
                max={product.stock}
                value={quantity}
                onChange={setQuantity}
              />
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                onClick={handleAddToCart}
              >
                加入购物车
              </Button>
              <Button
                type="primary"
                danger
                size="large"
                onClick={handleBuyNow}
              >
                立即购买
              </Button>
            </div>
          </Col>
        </Row>
        <div style={{ marginTop: '24px' }}>
          <h2>商品详情</h2>
          <div dangerouslySetInnerHTML={{ __html: product.description }} />
        </div>
      </Card>
    </div>
  );
};

export default ProductDetail; 