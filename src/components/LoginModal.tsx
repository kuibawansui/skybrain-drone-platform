'use client';

import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  Tabs, 
  message, 
  Space,
  Divider,
  Typography,
  Card
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onLoginSuccess: (userInfo: any) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ visible, onClose, onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  // 模拟登录
  const handleLogin = async (values: any) => {
    setLoading(true);
    
    // 模拟API调用
    setTimeout(() => {
      const userInfo = {
        id: 1,
        username: values.username,
        email: values.email || `${values.username}@skybrain.ai`,
        role: values.username === 'admin' ? 'administrator' : 'researcher',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${values.username}`,
        permissions: ['ai_algorithms', 'data_analysis', 'system_monitor'],
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('skybrainUser', JSON.stringify(userInfo));
      message.success('登录成功！欢迎使用SkyBrain AI算法平台');
      onLoginSuccess(userInfo);
      onClose();
      setLoading(false);
    }, 1500);
  };

  // 模拟注册
  const handleRegister = async (values: any) => {
    setLoading(true);
    
    setTimeout(() => {
      message.success('注册成功！请使用新账号登录');
      setActiveTab('login');
      setLoading(false);
    }, 1500);
  };

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      centered
      bodyStyle={{ padding: 0 }}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px'
      }}
    >
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '30px',
        borderRadius: '12px'
      }}>
        {/* 头部标题 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '10px'
          }}>🧠</div>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            SkyBrain AI平台
          </Title>
          <Text style={{ color: 'rgba(255,255,255,0.8)' }}>
            智能无人机算法研究平台
          </Text>
        </div>

        <Card style={{ borderRadius: '8px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            centered
            items={[
              {
                key: 'login',
                label: (
                  <span>
                    <UserOutlined /> 登录
                  </span>
                )
              },
              {
                key: 'register',
                label: (
                  <span>
                    <ExperimentOutlined /> 注册
                  </span>
                )
              }
            ]}
          />

          {activeTab === 'login' && (
            <Form
              name="login"
              onFinish={handleLogin}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名 (试试: admin 或 researcher)" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码 (任意密码)" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    height: '45px',
                    fontSize: '16px'
                  }}
                >
                  登录到AI算法平台
                </Button>
              </Form.Item>

              <Divider>快速登录</Divider>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block 
                  onClick={() => handleLogin({ username: 'admin', password: 'admin' })}
                  style={{ height: '40px' }}
                >
                  <SafetyOutlined /> 管理员登录
                </Button>
                <Button 
                  block 
                  onClick={() => handleLogin({ username: 'researcher', password: 'demo' })}
                  style={{ height: '40px' }}
                >
                  <ExperimentOutlined /> 研究员登录
                </Button>
              </Space>
            </Form>
          )}

          {activeTab === 'register' && (
            <Form
              name="register"
              onFinish={handleRegister}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名!' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                />
              </Form.Item>

              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined />} 
                  placeholder="邮箱地址" 
                />
              </Form.Item>

              <Form.Item
                name="phone"
                rules={[{ required: true, message: '请输入手机号!' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="手机号码" 
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="设置密码" 
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                dependencies={['password']}
                rules={[
                  { required: true, message: '请确认密码!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致!'));
                    },
                  }),
                ]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="确认密码" 
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  style={{
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    border: 'none',
                    height: '45px',
                    fontSize: '16px'
                  }}
                >
                  注册账号
                </Button>
              </Form.Item>
            </Form>
          )}
        </Card>

        {/* 底部说明 */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px' }}>
            登录后可访问完整的AI算法展示、性能分析和仿真验证功能
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default LoginModal;