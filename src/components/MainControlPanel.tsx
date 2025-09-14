'use client';

import React from 'react';
import { Row, Col } from 'antd';
import { ClientOnly } from './ClientOnly';
import { EnhancedCityScene3D } from './3D/EnhancedCityScene3D';
import { EnhancedRealTimeDataPanel } from './EnhancedRealTimeDataPanel';
import { EnhancedRiskHeatMap } from './EnhancedRiskHeatMap';

export const MainControlPanel: React.FC = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Row gutter={[16, 16]} style={{ flex: 1 }}>
        {/* 3D城市仿真主视区 */}
        <Col span={18} style={{ height: '100%' }}>
          <div className="glass-panel" style={{ height: '100%', minHeight: '600px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #303030' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>3D城市仿真</h2>
              <p style={{ fontSize: '14px', color: '#8C8C8C', margin: '4px 0 0 0' }}>实时无人机集群状态监控</p>
            </div>
            <div style={{ height: 'calc(100% - 80px)' }}>
              <ClientOnly fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white' }}>加载3D场景中...</div>}>
                <EnhancedCityScene3D />
              </ClientOnly>
            </div>
          </div>
        </Col>

        {/* 实时数据面板 */}
        <Col span={6} style={{ height: '100%' }}>
          <EnhancedRealTimeDataPanel />
        </Col>
      </Row>

      {/* 风险热力图区域 */}
      <Row>
        <Col span={24}>
          <div className="glass-panel" style={{ height: '320px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #303030' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>实时风险热力图</h2>
              <p style={{ fontSize: '14px', color: '#8C8C8C', margin: '4px 0 0 0' }}>基于动态贝叶斯网络的风险概率分布</p>
            </div>
            <div style={{ height: 'calc(100% - 80px)' }}>
              <EnhancedRiskHeatMap />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};