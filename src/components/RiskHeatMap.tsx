'use client';

import React, { useEffect, useRef } from 'react';
import { Card, Select, Slider, Space, Button } from 'antd';
import { ReloadOutlined, DownloadOutlined } from '@ant-design/icons';

const { Option } = Select;

export const RiskHeatMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [timeRange, setTimeRange] = React.useState(60); // 分钟
  const [riskType, setRiskType] = React.useState('all');

  // 生成热力图数据
  const generateHeatMapData = () => {
    const width = 800;
    const height = 400;
    const data = [];
    
    // 模拟城市区域的风险分布
    for (let x = 0; x < width; x += 10) {
      for (let y = 0; y < height; y += 10) {
        // 基于位置计算风险值
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        
        // 添加一些随机的高风险区域
        let riskValue = Math.max(0, 1 - distance / 200);
        
        // 模拟特定风险区域
        const riskZones = [
          { x: 150, y: 100, radius: 50, intensity: 0.8 },
          { x: 600, y: 150, radius: 40, intensity: 0.6 },
          { x: 400, y: 300, radius: 60, intensity: 0.9 },
          { x: 200, y: 250, radius: 35, intensity: 0.7 },
        ];
        
        riskZones.forEach(zone => {
          const zoneDistance = Math.sqrt(Math.pow(x - zone.x, 2) + Math.pow(y - zone.y, 2));
          if (zoneDistance < zone.radius) {
            riskValue = Math.max(riskValue, zone.intensity * (1 - zoneDistance / zone.radius));
          }
        });
        
        // 添加时间变化
        const timeVariation = Math.sin(Date.now() / 10000 + x / 100) * 0.2;
        riskValue = Math.max(0, Math.min(1, riskValue + timeVariation));
        
        data.push({ x, y, value: riskValue });
      }
    }
    
    return data;
  };

  // 绘制热力图
  const drawHeatMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制城市背景网格
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // 生成并绘制热力图数据
    const data = generateHeatMapData();
    
    data.forEach(point => {
      const intensity = point.value;
      if (intensity > 0.1) {
        // 根据风险值确定颜色
        let color;
        if (intensity > 0.8) {
          color = `rgba(255, 77, 79, ${intensity * 0.8})`;
        } else if (intensity > 0.6) {
          color = `rgba(255, 122, 0, ${intensity * 0.7})`;
        } else if (intensity > 0.4) {
          color = `rgba(250, 173, 20, ${intensity * 0.6})`;
        } else {
          color = `rgba(82, 196, 26, ${intensity * 0.5})`;
        }
        
        ctx.fillStyle = color;
        ctx.fillRect(point.x, point.y, 10, 10);
      }
    });
    
    // 绘制风险区域标签
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '12px Inter';
    ctx.fillText('CBD商务区', 140, 90);
    ctx.fillText('居民区', 590, 140);
    ctx.fillText('工业区', 390, 290);
    ctx.fillText('学校区域', 190, 240);
    
    // 绘制无人机位置
    const dronePositions = [
      { x: 200, y: 150 },
      { x: 350, y: 200 },
      { x: 500, y: 120 },
      { x: 650, y: 250 },
      { x: 300, y: 300 },
    ];
    
    dronePositions.forEach(pos => {
      ctx.fillStyle = '#1890FF';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
      ctx.fill();
      
      // 绘制无人机信号圈
      ctx.strokeStyle = 'rgba(24, 144, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 15, 0, 2 * Math.PI);
      ctx.stroke();
    });
  };

  // 定时更新热力图
  useEffect(() => {
    const interval = setInterval(() => {
      drawHeatMap();
    }, 2000);
    
    // 初始绘制
    drawHeatMap();
    
    return () => clearInterval(interval);
  }, [timeRange, riskType]);

  return (
    <div className="h-full flex flex-col">
      {/* 控制面板 */}
      <div className="flex justify-between items-center mb-4 px-4">
        <Space>
          <Select
            value={riskType}
            onChange={setRiskType}
            style={{ width: 120 }}
            size="small"
          >
            <Option value="all">全部风险</Option>
            <Option value="weather">天气风险</Option>
            <Option value="traffic">交通风险</Option>
            <Option value="obstacle">障碍物</Option>
            <Option value="crowd">人群密度</Option>
          </Select>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">时间范围:</span>
            <Slider
              value={timeRange}
              onChange={setTimeRange}
              min={10}
              max={180}
              step={10}
              style={{ width: 100 }}
              tooltip={{ formatter: (value) => `${value}分钟` }}
            />
          </div>
        </Space>
        
        <Space>
          <Button 
            icon={<ReloadOutlined />} 
            size="small"
            onClick={drawHeatMap}
          >
            刷新
          </Button>
          <Button 
            icon={<DownloadOutlined />} 
            size="small"
          >
            导出
          </Button>
        </Space>
      </div>
      
      {/* 热力图画布 */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={320}
          className="w-full h-full border border-gray-700 rounded-lg"
          style={{ background: 'rgba(10, 22, 40, 0.5)' }}
        />
        
        {/* 图例 */}
        <div className="absolute top-4 right-4 glass-panel p-3">
          <div className="text-sm font-semibold text-white mb-2">风险等级</div>
          <div className="space-y-1">
            {[
              { color: '#52C41A', label: '低风险', range: '0-40%' },
              { color: '#FAAD14', label: '中风险', range: '40-60%' },
              { color: '#FF7A00', label: '高风险', range: '60-80%' },
              { color: '#FF4D4F', label: '极高风险', range: '80-100%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-gray-300">{item.label}</span>
                <span className="text-xs text-gray-400">({item.range})</span>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-xs text-gray-300">无人机位置</span>
            </div>
          </div>
        </div>
        
        {/* 实时数据显示 */}
        <div className="absolute bottom-4 left-4 glass-panel p-3">
          <div className="text-sm font-semibold text-white mb-2">实时统计</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">高风险区域:</span>
              <span className="text-red-400">3个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">中风险区域:</span>
              <span className="text-yellow-400">7个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">安全区域:</span>
              <span className="text-green-400">15个</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">更新时间:</span>
              <span className="text-blue-400">2秒前</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};