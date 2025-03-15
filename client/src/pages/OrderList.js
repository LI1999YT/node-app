import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Card, Tag, Button, message } from 'antd';
import { fetchOrders, cancelOrder } from '../store/slices/orderSlice';

const OrderList = () => {
  const dispatch = useDispatch();
  const { list: orders, totalCount, loading, error } = useSelector((state) => state.orders);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const loadOrders = () => {
    dispatch(fetchOrders({
      page: currentPage,
      limit: pageSize
    }));
  };

  const handleCancel = async (orderId) => {
    try {
      await dispatch(cancelOrder(orderId)).unwrap();
      message.success('订单已取消');
    } catch (err) {
      message.error('取消订单失败，请重试');
    }
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

  const columns = [
    {
      title: '订单编号',
      dataIndex: '_id',
      render: (id) => <Link to={`/orders/${id}`}>{id}</Link>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (date) => new Date(date).toLocaleString()
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (status) => getStatusTag(status)
    },
    {
      title: '商品数量',
      dataIndex: 'items',
      render: (items) => items.reduce((sum, item) => sum + item.quantity, 0)
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      render: (amount) => `¥${amount.toFixed(2)}`
    },
    {
      title: '操作',
      render: (_, record) => {
        if (record.status === 'pending') {
          return (
            <>
              <Link to={`/orders/${record._id}`}>
                <Button type="link">付款</Button>
              </Link>
              <Button
                type="link"
                danger
                onClick={() => handleCancel(record._id)}
              >
                取消订单
              </Button>
            </>
          );
        }
        return (
          <Link to={`/orders/${record._id}`}>
            <Button type="link">查看详情</Button>
          </Link>
        );
      }
    }
  ];

  return (
    <div className="container" style={{ padding: '20px' }}>
      <Card title="我的订单">
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="_id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total: totalCount,
            onChange: setCurrentPage
          }}
        />
      </Card>
    </div>
  );
};

export default OrderList; 