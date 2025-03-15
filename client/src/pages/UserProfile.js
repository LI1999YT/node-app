import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Tabs,
  List,
  Modal,
  Popconfirm
} from 'antd';
import { UserOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
import { user } from '../services/api';

const { TabPane } = Tabs;

const UserProfile = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [addressForm] = Form.useForm();
  const [editingAddress, setEditingAddress] = useState(null);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await user.getAddresses();
      setAddresses(response.data);
    } catch (err) {
      message.error('获取地址列表失败');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await user.updateProfile(values);
      message.success('个人信息更新成功');
    } catch (err) {
      message.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    addressForm.resetFields();
    setAddressModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    addressForm.setFieldsValue(address);
    setAddressModalVisible(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      await user.deleteAddress(id);
      message.success('地址删除成功');
      loadAddresses();
    } catch (err) {
      message.error('删除失败，请重试');
    }
  };

  const handleAddressSubmit = async () => {
    try {
      const values = await addressForm.validateFields();
      if (editingAddress) {
        await user.updateAddress(editingAddress._id, values);
        message.success('地址更新成功');
      } else {
        await user.addAddress(values);
        message.success('地址添加成功');
      }
      setAddressModalVisible(false);
      loadAddresses();
    } catch (err) {
      message.error('操作失败，请重试');
    }
  };

  return (
    <div className="container" style={{ padding: '20px' }}>
      <Card>
        <Tabs defaultActiveKey="profile">
          <TabPane tab="个人信息" key="profile">
            <Form
              form={form}
              layout="vertical"
              initialValues={currentUser}
              onFinish={onFinish}
              style={{ maxWidth: 600, margin: '0 auto' }}
            >
              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input prefix={<UserOutlined />} disabled />
              </Form.Item>

              <Form.Item
                name="username"
                label="用户名"
                rules={[
                  { required: true, message: '请输入用户名' },
                  { min: 2, message: '用户名至少2个字符' }
                ]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号码"
                rules={[
                  { required: true, message: '请输入手机号码' },
                  { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
                ]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} block>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="收货地址" key="address">
            <Button
              type="primary"
              onClick={handleAddAddress}
              style={{ marginBottom: 16 }}
            >
              添加新地址
            </Button>

            <List
              dataSource={addresses}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Button type="link" onClick={() => handleEditAddress(item)}>
                      编辑
                    </Button>,
                    <Popconfirm
                      title="确定要删除这个地址吗？"
                      onConfirm={() => handleDeleteAddress(item._id)}
                    >
                      <Button type="link" danger>
                        删除
                      </Button>
                    </Popconfirm>
                  ]}
                >
                  <List.Item.Meta
                    avatar={<HomeOutlined />}
                    title={`${item.name} ${item.phone}`}
                    description={item.address}
                  />
                </List.Item>
              )}
            />
          </TabPane>
        </Tabs>
      </Card>

      <Modal
        title={editingAddress ? '编辑地址' : '添加新地址'}
        open={addressModalVisible}
        onOk={handleAddressSubmit}
        onCancel={() => setAddressModalVisible(false)}
      >
        <Form form={addressForm} layout="vertical">
          <Form.Item
            name="name"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人姓名' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号码' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile; 