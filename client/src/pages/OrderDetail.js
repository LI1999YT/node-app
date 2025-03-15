import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Descriptions,
  Table,
  Button,
  Steps,
  message,
  Tag,
  Divider,
  Modal
} from 'antd';
import {
  ShoppingOutlined,
  CreditCardOutlined,
  CarOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { fetchOrderDetail, payOrder, cancelOrder } from '../store/slices/orderSlice';

const { Step } = Steps;

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    currentOrder: order,
    loading,
    error,
    paymentLoading
  } = useSelector((state) => state.orders);

  useEffect(() => {
    if (id) {
      dispatch(fetchOrderDetail(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const handlePay = () => {
    Modal.confirm({
      title: '确认支付',
      content: `确定要支付订单金额 ¥${order.totalAmount.toFixed(2)} 吗？`,
      onOk: async () => {
        try {
          await dispatch(payOrder({ id, paymentData: { method: 'wallet' } })).unwrap();
          message.success('支付成功');
        } catch (err) {
          message.error('支付失败，请重试');
        }
      }
    });
  };

  const handleCancel = async () => {
    Modal.confirm({
      title: '取消订单',
      content: '确定要取消该订单吗？',
      onOk: async () => {
        try {
          await dispatch(cancelOrder(id)).unwrap();
          message.success('订单已取消');
        } catch (err) {
          message.error('取消订单失败，请重试');
        }
      }
    });
  };

  const getStatusStep = (status) => {
    const statusMap = {
      pending: 0,
      paid: 1,
      shipping: 2,
      completed: 3,
      cancelled: -1
    };
    return statusMap[status] || 0;
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { color: 'gold', text: '待付款' },
      paid: { color: 'green', text: '已付款' },
      shipping: { color: 'blue', text: '配送中' },
      completed: { color: 'green', text: '已完成' },
      cancelled: { color: 'red', text: '已取消' }
    };

    const { color, text } = statusMap[status] || { color: 'default', text: '未知状态' };
    return <Tag color={color}>{text}</Tag>;
  };

  if (!order) {
    return null;
  }

  const columns = [
    {
      title: '商品信息',
      dataIndex: 'product',
      render: (product) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={product.image}
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
      width: 100
    },
    {
      title: '小计',
      width: 120,
      render: (_, record) => (
        <span style={{ color: '#f5222d' }}>
          ¥{(record.price * record.quantity).toFixed(2)}
        </span>
      )
    }
  ];

  return (
    <div className="container" style={{ padding: '20px' }}>
      <Card loading={loading}>
        <Descriptions title="订单信息" bordered>
          <Descriptions.Item label="订单编号">{order._id}</Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(order.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            {getStatusTag(order.status)}
          </Descriptions.Item>
          <Descriptions.Item label="收货人">{order.shippingAddress?.name}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{order.shippingAddress?.phone}</Descriptions.Item>
          <Descriptions.Item label="收货地址">{order.shippingAddress?.address}</Descriptions.Item>
        </Descriptions>

        <Divider />

        <Steps current={getStatusStep(order.status)} status={order.status === 'cancelled' ? 'error' : 'process'}>
          <Step title="提交订单" icon={<ShoppingOutlined />} />
          <Step title="付款" icon={<CreditCardOutlined />} />
          <Step title="配送" icon={<CarOutlined />} />
          <Step title="完成" icon={<CheckCircleOutlined />} />
        </Steps>

        <Divider />

        <Table
          columns={columns}
          dataSource={order.items}
          pagination={false}
          rowKey={(record) => record.product._id}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: 24,
            padding: '24px 50px'
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: 8 }}>
              商品总额：
              <span style={{ color: '#f5222d', fontSize: 16 }}>
                ¥{order.totalAmount.toFixed(2)}
              </span>
            </div>
            <div>
              {order.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handlePay}
                    loading={paymentLoading}
                    style={{ marginRight: 16 }}
                  >
                    立即支付
                  </Button>
                  <Button size="large" onClick={handleCancel}>
                    取消订单
                  </Button>
                </>
              )}
              {order.status === 'completed' && (
                <Button type="primary" onClick={() => navigate('/')}>
                  再次购买
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderDetail; 