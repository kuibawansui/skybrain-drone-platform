'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, Text, Html } from '@react-three/drei';
import { Button, Space, Slider } from 'antd';
import { 
  PlayCircleOutlined, 
  PauseCircleOutlined, 
  ReloadOutlined,
  FullscreenOutlined,
  CameraOutlined
} from '@ant-design/icons';
import * as THREE from 'three';
import { CityBuildings } from './CityBuildings';
import { DroneFleet } from './DroneFleet';
import { FlightPaths } from './FlightPaths';
import { RiskZones } from './RiskZones';

const SceneControls: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);

  return (
    <Html position={[-8, 6, 8]} className="select-none">
      <div className="glass-panel p-4 min-w-[300px]">
        <h3 className="text-white text-sm font-semibold mb-3">场景控制</h3>
        <Space direction="vertical" className="w-full">
          <Space>
            <Button
              type={isPlaying ? 'primary' : 'default'}
              icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
              onClick={() => setIsPlaying(!isPlaying)}
              size="small"
            >
              {isPlaying ? '暂停' : '播放'}
            </Button>
            <Button icon={<ReloadOutlined />} size="small">
              重置
            </Button>
            <Button icon={<CameraOutlined />} size="small">
              截图
            </Button>
            <Button icon={<FullscreenOutlined />} size="small">
              全屏
            </Button>
          </Space>
          
          <div className="w-full">
            <div className="text-white text-xs mb-2">仿真速度: {speed}x</div>
            <Slider
              min={0.1}
              max={5}
              step={0.1}
              value={speed}
              onChange={setSpeed}
              className="w-full"
            />
          </div>
        </Space>
      </div>
    </Html>
  );
};

const CameraController: React.FC = () => {
  const controlsRef = useRef<any>();
  
  useFrame(() => {
    if (controlsRef.current) {
      // 自动旋转相机以展示全景
      controlsRef.current.azimuthAngle += 0.001;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      minPolarAngle={Math.PI / 6}
      maxPolarAngle={Math.PI / 2}
      target={[0, 0, 0]}
    />
  );
};

const LoadingFallback: React.FC = () => (
  <Html center>
    <div className="glass-panel p-6 text-center">
      <div className="text-white text-lg mb-2">加载3D场景中...</div>
      <div className="text-gray-400 text-sm">正在初始化城市模型和无人机集群</div>
    </div>
  </Html>
);

export const CityScene3D: React.FC = () => {
  return (
    <div className="w-full h-full scene-container">
      <Canvas
        camera={{ 
          position: [15, 15, 15], 
          fov: 60,
          near: 0.1,
          far: 1000
        }}
        shadows
        className="w-full h-full"
      >
        {/* 环境光照 */}
        <ambientLight intensity={0.3} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-20}
          shadow-camera-right={20}
          shadow-camera-top={20}
          shadow-camera-bottom={-20}
        />
        
        {/* 点光源模拟城市灯光 */}
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#1890FF" />
        <pointLight position={[10, 5, 10]} intensity={0.3} color="#FF7A00" />
        <pointLight position={[-10, 5, -10]} intensity={0.3} color="#52C41A" />

        {/* 相机控制 */}
        <CameraController />

        {/* 环境贴图 */}
        <Environment preset="night" />

        {/* 地面网格 */}
        <Grid
          position={[0, -0.01, 0]}
          args={[50, 50]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#1890FF"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#40a9ff"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={true}
        />

        <Suspense fallback={<LoadingFallback />}>
          {/* 城市建筑 */}
          <CityBuildings />
          
          {/* 无人机集群 */}
          <DroneFleet />
          
          {/* 飞行路径 */}
          <FlightPaths />
          
          {/* 风险区域 */}
          <RiskZones />
          
          {/* 场景控制面板 */}
          <SceneControls />
        </Suspense>

        {/* 坐标轴指示器 */}
        <axesHelper args={[2]} position={[-8, 0, -8]} />
        
        {/* 场景标题 */}
        <Text
          position={[0, 8, -10]}
          fontSize={1}
          color="#1890FF"
          anchorX="center"
          anchorY="middle"
          font="/fonts/inter-bold.woff"
        >
          SkyBrain 城市低空物流仿真
        </Text>
      </Canvas>
    </div>
  );
};