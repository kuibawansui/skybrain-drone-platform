'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Row, Col, Statistic, Progress, Tag, Space, Tooltip, Badge, Button, Tabs } from 'antd';
import WeatherVisualization3D from './3D/WeatherVisualization3D';
import WeatherChartsPanel from './WeatherChartsPanel';
import { 
  CloudOutlined, 
  ThunderboltOutlined, 
  EyeOutlined,
  DashboardOutlined,
  EnvironmentOutlined,
  WarningOutlined,
  ReloadOutlined,
  SunOutlined,
  CompassOutlined,
  ExperimentOutlined
} from '@ant-design/icons';

const { TabPane } = Tabs;

// 增强气象数据接口
interface EnhancedWeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  windGust: number;
  visibility: number;
  pressure: number;
  weatherCondition: string;
  uvIndex: number;
  precipitation: number;
  cloudCover: number;
  dewPoint: number;
  feelsLike: number;
  airQuality: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  forecast: WeatherForecast[];
}

interface WeatherForecast {
  time: string;
  temperature: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
}

// 飞行风险评估
interface FlightRisk {
  overall: number;
  windRisk: number;
  visibilityRisk: number;
  weatherRisk: number;
  precipitationRisk: number;
  recommendation: string;
  safetyLevel: 'safe' | 'caution' | 'dangerous' | 'prohibited';
}

const EnhancedWeatherPanel: React.FC = () => {
  const [weatherData, setWeatherData] = useState<EnhancedWeatherData | null>(null);
  const [flightRisk, setFlightRisk] = useState<FlightRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const [animationFrame, setAnimationFrame] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 动画效果
  useEffect(() => {
    const animate = () => {
      setAnimationFrame(prev => prev + 1);
    };
    const interval = setInterval(animate, 100);
    return () => clearInterval(interval);
  }, []);

  // 获取气象数据
  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const now = new Date();
      const mockWeatherData: EnhancedWeatherData = {
        temperature: 18 + Math.random() * 12,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 12,
        windDirection: Math.random() * 360,
        windGust: Math.random() * 18,
        visibility: 5 + Math.random() * 10,
        pressure: 1008 + Math.random() * 25,
        weatherCondition: ['晴朗', '多云', '阴天', '小雨', '雷阵雨'][Math.floor(Math.random() * 5)],
        uvIndex: Math.random() * 11,
        precipitation: Math.random() * 8,
        cloudCover: Math.random() * 100,
        dewPoint: 10 + Math.random() * 15,
        feelsLike: 16 + Math.random() * 14,
        airQuality: 20 + Math.random() * 80,
        riskLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        lastUpdated: now.toLocaleString('zh-CN'),
        forecast: generateForecast()
      };

      setWeatherData(mockWeatherData);
      setFlightRisk(calculateFlightRisk(mockWeatherData));
      
    } catch (err) {
      console.error('Weather data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // 生成预报数据
  const generateForecast = (): WeatherForecast[] => {
    const forecast = [];
    for (let i = 1; i <= 6; i++) {
      const time = new Date();
      time.setHours(time.getHours() + i);
      forecast.push({
        time: time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        temperature: 18 + Math.random() * 10,
        windSpeed: Math.random() * 10,
        precipitation: Math.random() * 5,
        condition: ['☀️', '⛅', '☁️', '🌧️', '⛈️'][Math.floor(Math.random() * 5)]
      });
    }
    return forecast;
  };

  // 计算飞行风险
  const calculateFlightRisk = (data: EnhancedWeatherData): FlightRisk => {
    // 风速风险
    let windRisk = 0;
    if (data.windSpeed > 15) windRisk = 95;
    else if (data.windSpeed > 10) windRisk = 70;
    else if (data.windSpeed > 6) windRisk = 40;
    else windRisk = 10;

    // 能见度风险
    let visibilityRisk = 0;
    if (data.visibility < 2) visibilityRisk = 90;
    else if (data.visibility < 5) visibilityRisk = 60;
    else if (data.visibility < 8) visibilityRisk = 30;
    else visibilityRisk = 5;

    // 天气条件风险
    let weatherRisk = 0;
    switch (data.weatherCondition) {
      case '晴朗': weatherRisk = 5; break;
      case '多云': weatherRisk = 15; break;
      case '阴天': weatherRisk = 35; break;
      case '小雨': weatherRisk = 70; break;
      case '雷阵雨': weatherRisk = 95; break;
      default: weatherRisk = 50;
    }

    // 降水风险
    let precipitationRisk = 0;
    if (data.precipitation > 5) precipitationRisk = 85;
    else if (data.precipitation > 2) precipitationRisk = 50;
    else if (data.precipitation > 0.5) precipitationRisk = 25;
    else precipitationRisk = 0;

    const overall = Math.round((windRisk + visibilityRisk + weatherRisk + precipitationRisk) / 4);
    
    let safetyLevel: FlightRisk['safetyLevel'] = 'safe';
    let recommendation = '';

    if (overall >= 80) {
      safetyLevel = 'prohibited';
      recommendation = '🚫 严禁飞行！天气条件极其恶劣，存在重大安全风险。';
    } else if (overall >= 60) {
      safetyLevel = 'dangerous';
      recommendation = '⚠️ 危险！不建议飞行，如必须执行任务请采取额外安全措施。';
    } else if (overall >= 30) {
      safetyLevel = 'caution';
      recommendation = '⚡ 谨慎飞行，密切关注天气变化，准备应急预案。';
    } else {
      safetyLevel = 'safe';
      recommendation = '✅ 天气条件良好，适合飞行作业。';
    }

    return {
      overall,
      windRisk,
      visibilityRisk,
      weatherRisk,
      precipitationRisk,
      recommendation,
      safetyLevel
    };
  };

  // 获取天气图标
  const getWeatherIcon = (condition: string) => {
    const iconMap: Record<string, string> = {
      '晴朗': '☀️',
      '多云': '⛅',
      '阴天': '☁️',
      '小雨': '🌧️',
      '雷阵雨': '⛈️'
    };
    return iconMap[condition] || '🌤️';
  };

  // 获取风向指示
  const getWindDirection = (degrees: number) => {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  };

  // 获取风险颜色
  const getRiskColor = (risk: number) => {
    if (risk >= 80) return '#ff4d4f';
    if (risk >= 60) return '#fa8c16';
    if (risk >= 30) return '#faad14';
    return '#52c41a';
  };

  // 获取安全等级样式
  const getSafetyLevelStyle = (level: FlightRisk['safetyLevel']) => {
    const styles = {
      safe: { color: '#52c41a', background: 'rgba(82, 196, 26, 0.1)' },
      caution: { color: '#faad14', background: 'rgba(250, 173, 20, 0.1)' },
      dangerous: { color: '#fa8c16', background: 'rgba(250, 140, 22, 0.1)' },
      prohibited: { color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)' }
    };
    return styles[level];
  };

  useEffect(() => {
    fetchWeatherData();
    
    // 每2分钟自动更新
    intervalRef.current = setInterval(fetchWeatherData, 2 * 60 * 1000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  if (loading) {
    return (
      <Card 
        title="🌤️ 智能气象监测系统" 
        style={{ height: '100%' }}
        extra={
          <Button 
            icon={<ReloadOutlined spin />} 
            size="small" 
            disabled
          >
            更新中
          </Button>
        }
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '400px',
          flexDirection: 'column'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌍</div>
          <div style={{ fontSize: '16px', color: '#1890ff' }}>正在获取实时气象数据...</div>
        </div>
      </Card>
    );
  }

  if (!weatherData || !flightRisk) return null;

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* 主要气象数据卡片 */}
      <Card 
        title={
          <Space>
            <span style={{ fontSize: '18px' }}>🌤️ 智能气象监测系统</span>
            <Badge 
              status={flightRisk.safetyLevel === 'safe' ? 'success' : 
                     flightRisk.safetyLevel === 'caution' ? 'warning' : 'error'} 
              text={`${flightRisk.safetyLevel.toUpperCase()}`}
            />
          </Space>
        }
        extra={
          <Button 
            icon={<ReloadOutlined />} 
            size="small" 
            onClick={fetchWeatherData}
            loading={loading}
          >
            刷新
          </Button>
        }
        style={{ marginBottom: '16px' }}
      >
        {/* 当前天气概览 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={8}>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                {getWeatherIcon(weatherData.weatherCondition)}
              </div>
              <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                {weatherData.temperature.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                体感 {weatherData.feelsLike.toFixed(1)}°C
              </div>
              <div style={{ fontSize: '16px', marginTop: '8px' }}>
                {weatherData.weatherCondition}
              </div>
            </div>
          </Col>
          
          <Col span={8}>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <CloudOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {weatherData.windSpeed.toFixed(1)} m/s
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                阵风 {weatherData.windGust.toFixed(1)} m/s
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                <CompassOutlined 
                  style={{ 
                    transform: `rotate(${weatherData.windDirection}deg)`,
                    transition: 'transform 0.5s ease'
                  }} 
                /> {getWindDirection(weatherData.windDirection)}风
              </div>
            </div>
          </Col>
          
          <Col span={8}>
            <div style={{ 
              textAlign: 'center', 
              padding: '20px',
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px',
              color: 'white'
            }}>
              <EyeOutlined style={{ fontSize: '32px', marginBottom: '8px' }} />
              <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
                {weatherData.visibility.toFixed(1)} km
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                能见度
              </div>
              <div style={{ fontSize: '14px', marginTop: '8px' }}>
                云量 {weatherData.cloudCover.toFixed(0)}%
              </div>
            </div>
          </Col>
        </Row>

        {/* 详细气象参数 */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Statistic
              title={<><CloudOutlined /> 湿度</>}
              value={weatherData.humidity}
              precision={0}
              suffix="%"
              valueStyle={{ color: weatherData.humidity > 80 ? '#fa8c16' : '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<><DashboardOutlined /> 气压</>}
              value={weatherData.pressure}
              precision={1}
              suffix="hPa"
              valueStyle={{ color: weatherData.pressure < 1000 ? '#fa8c16' : '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<><SunOutlined /> 紫外线</>}
              value={weatherData.uvIndex}
              precision={1}
              valueStyle={{ color: weatherData.uvIndex > 7 ? '#ff4d4f' : '#3f8600' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title={<><ExperimentOutlined /> 空气质量</>}
              value={weatherData.airQuality}
              precision={0}
              suffix="AQI"
              valueStyle={{ color: weatherData.airQuality > 100 ? '#fa8c16' : '#3f8600' }}
            />
          </Col>
        </Row>

        {/* 降水信息 */}
        {weatherData.precipitation > 0 && (
          <div style={{ 
            padding: '16px', 
            background: 'rgba(24, 144, 255, 0.1)', 
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <Space>
              <CloudOutlined style={{ color: '#1890ff' }} />
              <span>降水量: {weatherData.precipitation.toFixed(1)} mm</span>
              <span>露点: {weatherData.dewPoint.toFixed(1)}°C</span>
            </Space>
          </div>
        )}
      </Card>

      {/* 飞行风险评估 */}
      <Card 
        title="🛡️ 飞行安全评估" 
        style={{ marginBottom: '16px' }}
      >
        <div style={{ 
          padding: '20px', 
          borderRadius: '12px',
          ...getSafetyLevelStyle(flightRisk.safetyLevel)
        }}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: 'bold' }}>
                  {flightRisk.overall}%
                </div>
                <div style={{ fontSize: '16px', marginTop: '8px' }}>
                  综合风险指数
                </div>
              </div>
            </Col>
            <Col span={12}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <span>风速风险: </span>
                  <Progress 
                    percent={flightRisk.windRisk} 
                    size="small" 
                    strokeColor={getRiskColor(flightRisk.windRisk)}
                    showInfo={false}
                  />
                  <span style={{ color: getRiskColor(flightRisk.windRisk) }}>
                    {flightRisk.windRisk}%
                  </span>
                </div>
                <div>
                  <span>能见度风险: </span>
                  <Progress 
                    percent={flightRisk.visibilityRisk} 
                    size="small" 
                    strokeColor={getRiskColor(flightRisk.visibilityRisk)}
                    showInfo={false}
                  />
                  <span style={{ color: getRiskColor(flightRisk.visibilityRisk) }}>
                    {flightRisk.visibilityRisk}%
                  </span>
                </div>
                <div>
                  <span>天气风险: </span>
                  <Progress 
                    percent={flightRisk.weatherRisk} 
                    size="small" 
                    strokeColor={getRiskColor(flightRisk.weatherRisk)}
                    showInfo={false}
                  />
                  <span style={{ color: getRiskColor(flightRisk.weatherRisk) }}>
                    {flightRisk.weatherRisk}%
                  </span>
                </div>
                <div>
                  <span>降水风险: </span>
                  <Progress 
                    percent={flightRisk.precipitationRisk} 
                    size="small" 
                    strokeColor={getRiskColor(flightRisk.precipitationRisk)}
                    showInfo={false}
                  />
                  <span style={{ color: getRiskColor(flightRisk.precipitationRisk) }}>
                    {flightRisk.precipitationRisk}%
                  </span>
                </div>
              </Space>
            </Col>
          </Row>
          
          <div style={{ 
            marginTop: '16px', 
            padding: '12px', 
            background: 'rgba(255, 255, 255, 0.8)', 
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            {flightRisk.recommendation}
          </div>
        </div>
      </Card>

      {/* 可视化展示区域 */}
      <Card title="📊 气象数据可视化" style={{ marginBottom: '16px' }}>
        <Tabs defaultActiveKey="3d" type="card">
          <TabPane tab="🌍 3D可视化" key="3d">
            <WeatherVisualization3D weatherData={weatherData} />
          </TabPane>
          
          <TabPane tab="📈 数据图表" key="charts">
            <WeatherChartsPanel />
          </TabPane>
          
          <TabPane tab="📊 未来预报" key="forecast">
            <Row gutter={[8, 8]}>
              {weatherData.forecast.map((item, index) => (
                <Col span={4} key={index}>
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '12px', 
                    background: 'rgba(24, 144, 255, 0.05)',
                    borderRadius: '8px',
                    border: '1px solid rgba(24, 144, 255, 0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 144, 255, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  >
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {item.time}
                    </div>
                    <div style={{ fontSize: '24px', margin: '8px 0' }}>
                      {item.condition}
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold' }}>
                      {item.temperature.toFixed(0)}°C
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {item.windSpeed.toFixed(1)} m/s
                    </div>
                    {item.precipitation > 0 && (
                      <div style={{ fontSize: '12px', color: '#1890ff' }}>
                        {item.precipitation.toFixed(1)}mm
                      </div>
                    )}
                  </div>
                </Col>
              ))}
            </Row>
          </TabPane>
        </Tabs>
      </Card>

      {/* 更新时间 */}
      <div style={{ 
        textAlign: 'center', 
        color: '#666', 
        fontSize: '12px', 
        marginTop: '16px' 
      }}>
        最后更新: {weatherData.lastUpdated}
      </div>
    </div>
  );
};

export default EnhancedWeatherPanel;