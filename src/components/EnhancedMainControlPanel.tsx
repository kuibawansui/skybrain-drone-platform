'use client';

import React from 'react';
import { Row, Col, Tabs } from 'antd';
import { ClientOnly } from './ClientOnly';
import { EnhancedCityScene3D } from './3D/EnhancedCityScene3D';
import { EnhancedRealTimeDataPanel } from './EnhancedRealTimeDataPanel';
import { EnhancedRiskHeatMap } from './EnhancedRiskHeatMap';
import { RiskAssessmentPanel } from './RiskAssessmentPanel';
import { MultiAgentControlPanel } from './MultiAgentControlPanel';
import { PathPlanningVisualization } from './PathPlanningVisualization';
import { MultiModalSensorSystem } from './MultiModalSensorSystem';
import { DroneFleetScheduler } from './DroneFleetScheduler';
import { RiskAnalysisWarningSystem } from './RiskAnalysisWarningSystem';
import { BusinessManagementPlatform } from './BusinessManagementPlatform';

export const EnhancedMainControlPanel: React.FC = () => {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Row gutter={[16, 16]} style={{ flex: 1 }}>
        {/* 3D城市仿真主视区 */}
        <Col span={12} style={{ height: '100%' }}>
          <div className="glass-panel" style={{ height: '100%', minHeight: '600px', position: 'relative', zIndex: 1 }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #303030' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>
                🌆 3D城市仿真
              </h2>
              <p style={{ fontSize: '14px', color: '#8C8C8C', margin: '4px 0 0 0' }}>
                实时无人机集群状态监控
              </p>
            </div>
            <div style={{ height: 'calc(100% - 80px)', position: 'relative', zIndex: 1, overflow: 'hidden' }}>
              <ClientOnly fallback={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%', 
                  color: 'white',
                  background: 'rgba(0, 20, 40, 0.9)',
                  borderRadius: '8px'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', marginBottom: '8px' }}>🌆 加载3D城市场景中...</div>
                    <div style={{ fontSize: '12px', color: '#8C8C8C' }}>正在初始化Three.js渲染引擎</div>
                  </div>
                </div>
              }>
                <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                  <EnhancedCityScene3D />
                </div>
              </ClientOnly>
            </div>
          </div>
        </Col>

        {/* 右侧面板 - 使用标签页 */}
        <Col span={12} style={{ height: '100%' }}>
          <div className="glass-panel" style={{ height: '100%', position: 'relative', zIndex: 2 }}>
            <Tabs 
              defaultActiveKey="realtime" 
              style={{ height: '100%' }}
              tabBarStyle={{ 
                padding: '0 16px',
                borderBottom: '1px solid #303030',
                marginBottom: 0
              }}
              items={[
                {
                  key: 'realtime',
                  label: (
                    <span style={{ color: 'white' }}>
                      📊 实时监控
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <EnhancedRealTimeDataPanel />
                    </div>
                  )
                },
                {
                  key: 'risk',
                  label: (
                    <span style={{ color: 'white' }}>
                      🧠 风险评估
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <RiskAssessmentPanel 
                        droneId="UAV-001"
                        location={{ lat: 39.9042, lng: 116.4074, altitude: 120 }}
                      />
                    </div>
                  )
                },
                {
                  key: 'multiagent',
                  label: (
                    <span style={{ color: 'white' }}>
                      🤖 多智能体
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <MultiAgentControlPanel />
                    </div>
                  )
                },
                {
                  key: 'pathplanning',
                  label: (
                    <span style={{ color: 'white' }}>
                      🛣️ 路径规划
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <PathPlanningVisualization />
                    </div>
                  )
                },
                {
                  key: 'multimodal',
                  label: (
                    <span style={{ color: 'white' }}>
                      🔗 多模态感知
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <MultiModalSensorSystem />
                    </div>
                  )
                },
                {
                  key: 'scheduler',
                  label: (
                    <span style={{ color: 'white' }}>
                      🚁 集群调度
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <DroneFleetScheduler />
                    </div>
                  )
                },
                {
                  key: 'risk-warning',
                  label: (
                    <span style={{ color: 'white' }}>
                      ⚠️ 风险预警
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto', padding: '16px' }}>
                      <RiskAnalysisWarningSystem />
                    </div>
                  )
                },
                {
                  key: 'business',
                  label: (
                    <span style={{ color: 'white' }}>
                      💼 商业管理
                    </span>
                  ),
                  children: (
                    <div style={{ height: 'calc(100vh - 200px)', overflow: 'auto' }}>
                      <BusinessManagementPlatform />
                    </div>
                  )
                }
              ]}
            />
          </div>
        </Col>
      </Row>

      {/* 底部区域 - 风险热力图和预测 */}
      <Row gutter={[16, 16]}>
        {/* 实时风险热力图 - 扩大显示区域 */}
        <Col span={16}>
          <div className="glass-panel" style={{ height: '450px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #303030' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>
                🗺️ 实时风险热力图
              </h2>
              <p style={{ fontSize: '14px', color: '#8C8C8C', margin: '4px 0 0 0' }}>
                基于动态贝叶斯网络的风险概率分布
              </p>
            </div>
            <div style={{ height: 'calc(100% - 80px)' }}>
              <EnhancedRiskHeatMap />
            </div>
          </div>
        </Col>
        
        {/* 风险趋势预测面板 */}
        <Col span={8}>
          <div className="glass-panel" style={{ height: '450px' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid #303030' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'white', margin: 0 }}>
                📈 风险趋势预测 (未来1小时)
              </h2>
              <p style={{ fontSize: '14px', color: '#8C8C8C', margin: '4px 0 0 0' }}>
                基于机器学习的风险预测模型
              </p>
            </div>
            <div style={{ height: 'calc(100% - 80px)', padding: '16px' }}>
              <RiskAssessmentPanel 
                droneId="UAV-001"
                location={{ lat: 39.9042, lng: 116.4074, altitude: 120 }}
              />
            </div>
          </div>
        </Col>
      </Row>
    </div>
  );
};