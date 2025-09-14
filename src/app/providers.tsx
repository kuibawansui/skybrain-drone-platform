'use client';

import { Provider } from 'react-redux';
import { ConfigProvider, theme } from 'antd';
import { store } from '@/store';
import zhCN from 'antd/locale/zh_CN';

const darkTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#1890FF',
    colorBgBase: '#0A1628',
    colorBgContainer: 'rgba(255, 255, 255, 0.05)',
    colorBorder: '#303030',
    colorText: '#FFFFFF',
    colorTextSecondary: '#8C8C8C',
    borderRadius: 8,
    wireframe: false,
  },
  components: {
    Layout: {
      bodyBg: 'transparent',
      headerBg: 'rgba(10, 22, 40, 0.9)',
      siderBg: 'rgba(10, 22, 40, 0.9)',
    },
    Card: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorderSecondary: 'rgba(255, 255, 255, 0.1)',
    },
    Button: {
      colorPrimary: '#1890FF',
      colorPrimaryHover: '#40a9ff',
      colorPrimaryActive: '#096dd9',
    },
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ConfigProvider theme={darkTheme} locale={zhCN}>
        {children}
      </ConfigProvider>
    </Provider>
  );
}