'use client';

import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Select, Switch, Space, Typography } from 'antd';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart
} from 'recharts';

const { Option } = Select;
const { Title } = Typography;

interface WeatherDataPoint {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pressure: number;
  visibility: number;
  precipitation: number;
  uvIndex: number;
}

interface RadarDataPoint {
  subject: string;
  value: number;
  fullMark: 100;
}

const WeatherChartsPanel: React.FC = () => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'composed'>('line');
  const [showAnimation, setShowAnimation] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('6h');
  const [historicalData, setHistoricalData] = useState<WeatherDataPoint[]>([]);
  const [radarData, setRadarData] = useState<RadarDataPoint[]>([]);

  // 生成历史数据
  const generateHistoricalData = (range: string) => {
    const data: WeatherDataPoint[] = [];
    let points = 0;
    let interval = '';

    switch (range) {
      case '1h':
        points = 12; // 每5分钟一个点
        interval = '5min';
        break;
      case '6h':
        points = 24; // 每15分钟一个点
        interval = '15min';
        break;
      case '24h':
        points = 24; // 每小时一个点
        interval = '1h';
        break;
      case '7d':
        points = 7; // 每天一个点
        interval = '1d';
        break;
    }

    const now = new Date();
    for (let i = points - 1; i >= 0; i--) {
      const time = new Date(now);
      
      switch (range) {
        case '1h':
          time.setMinutes(time.getMinutes() - i * 5);
          break;
        case '6h':
          time.setMinutes(time.getMinutes() - i * 15);
          break;
        case '24h':
          time.setHours(time.getHours() - i);
          break;
        case '7d':
          time.setDate(time.getDate() - i);
          break;
      }

      // 模拟真实的天气数据变化
      const baseTemp = 20;
      const tempVariation = Math.sin(i * 0.3) * 5 + Math.random() * 3;
      
      data.push({
        time: range === '7d' 
          ? time.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
          : time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        temperature: baseTemp + tempVariation,
        humidity: 50 + Math.sin(i * 0.2) * 20 + Math.random() * 10,
        windSpeed: Math.abs(Math.sin(i * 0.4) * 8 + Math.random() * 3),
        pressure: 1013 + Math.sin(i * 0.1) * 15 + Math.random() * 5,
        visibility: 8 + Math.sin(i * 0.15) * 3 + Math.random() * 2,
        precipitation: Math.max(0, Math.sin(i * 0.6) * 3 + Math.random() * 2 - 1.5),
        uvIndex: Math.max(0, Math.sin(i * 0.25) * 6 + Math.random() * 2)
      });
    }

    return data;
  };

  // 生成雷达图数据
  const generateRadarData = () => {
    const currentWeather = historicalData[historicalData.length - 1];
    if (!currentWeather) return [];

    return [
      {
        subject: '温度适宜性',
        value: Math.max(0, 100 - Math.abs(currentWeather.temperature - 22) * 5),
        fullMark: 100
      },
      {
        subject: '湿度舒适度',
        value: Math.max(0, 100 - Math.abs(currentWeather.humidity - 60) * 2),
        fullMark: 100
      },
      {
        subject: '风速安全性',
        value: Math.max(0, 100 - currentWeather.windSpeed * 8),
        fullMark: 100
      },
      {
        subject: '能见度',
        value: Math.min(100, currentWeather.visibility * 10),
        fullMark: 100
      },
      {
        subject: '气压稳定性',
        value: Math.max(0, 100 - Math.abs(currentWeather.pressure - 1013) * 2),
        fullMark: 100
      },
      {
        subject: '飞行适宜度',
        value: Math.max(0, 100 - currentWeather.precipitation * 20),
        fullMark: 100
      }
    ];
  };

  useEffect(() => {
    const data = generateHistoricalData(timeRange);
    setHistoricalData(data);
  }, [timeRange]);

  useEffect(() => {
    if (historicalData.length > 0) {
      setRadarData(generateRadarData());
    }
  }, [historicalData]);

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{`时间: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}${entry.unit || ''}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // 渲染主图表
  const renderMainChart = () => {
    const commonProps = {
      width: '100%',
      height: 300,
      data: historicalData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    const animationProps = showAnimation ? {
      animationBegin: 0,
      animationDuration: 1500
    } : {};

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="temperature" 
                stackId="1" 
                stroke="#ff7300" 
                fill="#ff7300" 
                name="温度(°C)"
                {...animationProps}
              />
              <Area 
                type="monotone" 
                dataKey="humidity" 
                stackId="2" 
                stroke="#387908" 
                fill="#387908" 
                name="湿度(%)"
                {...animationProps}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="windSpeed" 
                fill="#8884d8" 
                name="风速(m/s)"
                {...animationProps}
              />
              <Bar 
                dataKey="precipitation" 
                fill="#82ca9d" 
                name="降水量(mm)"
                {...animationProps}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'composed':
        return (
          <ResponsiveContainer {...commonProps}>
            <ComposedChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="humidity" 
                fill="#8884d8" 
                stroke="#8884d8"
                name="湿度(%)"
                {...animationProps}
              />
              <Bar 
                yAxisId="right"
                dataKey="precipitation" 
                fill="#413ea0" 
                name="降水量(mm)"
                {...animationProps}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="temperature" 
                stroke="#ff7300" 
                strokeWidth={3}
                name="温度(°C)"
                {...animationProps}
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default: // line
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="temperature" 
                stroke="#ff7300" 
                strokeWidth={2}
                name="温度(°C)"
                dot={{ fill: '#ff7300', strokeWidth: 2, r: 4 }}
                {...animationProps}
              />
              <Line 
                type="monotone" 
                dataKey="humidity" 
                stroke="#387908" 
                strokeWidth={2}
                name="湿度(%)"
                dot={{ fill: '#387908', strokeWidth: 2, r: 4 }}
                {...animationProps}
              />
              <Line 
                type="monotone" 
                dataKey="windSpeed" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="风速(m/s)"
                dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                {...animationProps}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div style={{ height: '100%' }}>
      {/* 控制面板 */}
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Row gutter={[16, 8]} align="middle">
          <Col>
            <Space>
              <span>图表类型:</span>
              <Select 
                value={chartType} 
                onChange={setChartType}
                style={{ width: 120 }}
              >
                <Option value="line">折线图</Option>
                <Option value="area">面积图</Option>
                <Option value="bar">柱状图</Option>
                <Option value="composed">组合图</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <span>时间范围:</span>
              <Select 
                value={timeRange} 
                onChange={setTimeRange}
                style={{ width: 100 }}
              >
                <Option value="1h">1小时</Option>
                <Option value="6h">6小时</Option>
                <Option value="24h">24小时</Option>
                <Option value="7d">7天</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Space>
              <span>动画效果:</span>
              <Switch 
                checked={showAnimation} 
                onChange={setShowAnimation}
                size="small"
              />
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* 主要趋势图表 */}
        <Col span={16}>
          <Card title="📈 气象数据趋势分析" size="small">
            {renderMainChart()}
          </Card>
        </Col>

        {/* 雷达图 - 飞行条件评估 */}
        <Col span={8}>
          <Card title="🎯 飞行条件雷达图" size="small">
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={false}
                />
                <Radar
                  name="适宜度"
                  dataKey="value"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, '适宜度']}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 详细数据图表 */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col span={12}>
          <Card title="🌡️ 气压变化" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} hPa`, '气压']}
                />
                <Line 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#ff4d4f" 
                  strokeWidth={2}
                  dot={{ fill: '#ff4d4f', strokeWidth: 2, r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="👁️ 能见度变化" size="small">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)} km`, '能见度']}
                />
                <Area 
                  type="monotone" 
                  dataKey="visibility" 
                  stroke="#52c41a" 
                  fill="#52c41a"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default WeatherChartsPanel;