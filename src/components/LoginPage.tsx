'use client';

import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface LoginPageProps {
  onLogin: (userInfo: { username: string; role: string }) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (values: { username: string; password: string }) => {
    setLoading(true);
    setError('');

    try {
      // 模拟登录验证
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 简单的用户验证逻辑
      const users = {
        'admin': { password: 'admin123', role: '系统管理员' },
        'operator': { password: 'op123', role: '操作员' },
        'viewer': { password: 'view123', role: '观察员' },
        'guest': { password: 'guest', role: '访客' }
      };

      const user = users[values.username as keyof typeof users];
      
      if (user && user.password === values.password) {
        onLogin({
          username: values.username,
          role: user.role
        });
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 rounded-2xl overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <SafetyCertificateOutlined className="text-2xl text-white" />
            </div>
            <Title level={2} className="mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              SkyBrain Wiki
            </Title>
            <Text type="secondary" className="text-base">
              智能无人机管理平台知识库
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              className="mb-6 rounded-lg"
            />
          )}

          <Form
            name="login"
            onFinish={handleLogin}
            layout="vertical"
            size="large"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                prefix={<UserOutlined className="text-gray-400" />}
                placeholder="用户名"
                className="rounded-lg h-12"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-400" />}
                placeholder="密码"
                className="rounded-lg h-12"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-base font-medium"
              >
                {loading ? '登录中...' : '登录'}
              </Button>
            </Form.Item>
          </Form>

          <Divider className="my-6">
            <Text type="secondary">演示账户</Text>
          </Divider>

          <Space direction="vertical" className="w-full" size="small">
            <div className="bg-gray-50 p-3 rounded-lg">
              <Text strong className="text-blue-600">管理员:</Text>
              <Text className="ml-2">admin / admin123</Text>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Text strong className="text-green-600">操作员:</Text>
              <Text className="ml-2">operator / op123</Text>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Text strong className="text-orange-600">观察员:</Text>
              <Text className="ml-2">viewer / view123</Text>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <Text strong className="text-purple-600">访客:</Text>
              <Text className="ml-2">guest / guest</Text>
            </div>
          </Space>

          <div className="text-center mt-6 pt-4 border-t border-gray-100">
            <Text type="secondary" className="text-sm">
              © 2024 SkyBrain Platform. All rights reserved.
            </Text>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;