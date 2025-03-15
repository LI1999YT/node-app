import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Button, InputNumber, Card, message, Empty } from 'antd';
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';
import {
  fetchCart,
  updateQuantity,
  removeFromCart,
  selectItems
} from '../store/slices/cartSlice';
import { createOrder } from '../store/slices/orderSlice';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, loading, error } = useSelector((state) => state.cart);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handleQuantityChange = async (productId, quantity) => {
    try {
      await dispatch(updateQuantity({ productId, quantity })).unwrap();
    } catch (err) {
      message.error('更新数量失败，请重试');
    }
  };

  const handleRemove = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      message.success('商品已移除');
    } catch (err) {
      message.error('移除失败，请重试');
    }
  };

  const handleSelect = async (productIds, selected) => {
    try {
      await dispatch(selectItems({ productIds, selected })).unwrap();
    } catch (err) {
      message.error('操作失败，请重试');
    }
  };

  const handleCheckout = async () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      message.warning('请选择要结算的商品');
      return;
    }

    try {
      const orderData = {
        items: selectedItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.price
        }))
      };
      const result = await dispatch(createOrder(orderData)).unwrap();
      navigate(`/orders/${result._id}`);
    } catch (err) {
      message.error('创建订单失败，请重试');
    }
  };

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'product',
      render: (product) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={product.images[0]}
            alt={product.name}
            style={{ width: 80, height: 80, objectFit: 'cover', marginRight: 16 }}
          />
          <div>
            <div>{product.name}</div>
            <div style={{ color: '#f5222d' }}>¥{product.price.toFixed(2)}</div>
          </div>
        </div>
      )
    },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 150,
      render: (quantity, record) => (
        <InputNumber
          min={1}
          max={record.product.stock}
          value={quantity}
          onChange={(value) => handleQuantityChange(record.product._id, value)}
        />
      )
    },
    {
      title: '小计',
      dataIndex: 'subtotal',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#f5222d' }}>
          ¥{(record.product.price * record.quantity).toFixed(2)}
        </span>
      )
    },
    {
      title: '操作',
      width: 100,
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.product._id)}
        >
          删除
        </Button>
      )
    }
  ];

  const rowSelection = {
    selectedRowKeys: items.filter(item => item.selected).map(item => item.product._id),
    onChange: (selectedRowKeys) => {
      const allProductIds = items.map(item => item.product._id);
      const selected = selectedRowKeys.length > 0;
      handleSelect(allProductIds, selected);
    },
    onSelect: (record, selected) => {
      handleSelect([record.product._id], selected);
    },
    onSelectAll: (selected, selectedRows, changeRows) => {
      const changeProductIds = changeRows.map(item => item.product._id);
      handleSelect(changeProductIds, selected);
    }
  };

  if (!items.length) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <Empty
          image={<ShoppingOutlined style={{ fontSize: 64 }} />}
          description="购物车是空的"
        >
          <Button type="primary" onClick={() => navigate('/')}>
            去购物
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '20px' }}>
      <Card title="购物车">
        <Table
          rowKey={(record) => record.product._id}
          columns={columns}
          dataSource={items}
          rowSelection={rowSelection}
          pagination={false}
          loading={loading}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginTop: 16
          }}
        >
          <div style={{ marginRight: 24 }}>
            <span>已选商品 </span>
            <span style={{ fontSize: 16, color: '#f5222d', margin: '0 8px' }}>
              {items.filter(item => item.selected).length}
            </span>
            <span>件，合计：</span>
            <span style={{ fontSize: 20, color: '#f5222d', marginLeft: 8 }}>
              ¥{totalAmount.toFixed(2)}
            </span>
          </div>
          <Button
            type="primary"
            size="large"
            onClick={handleCheckout}
            disabled={!items.some(item => item.selected)}
          >
            结算
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Cart; 