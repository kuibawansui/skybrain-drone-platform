'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Cloud, 
  Sky, 
  Environment, 
  Text, 
  Billboard, 
  Sphere, 
  Box,
  Plane,
  OrbitControls,
  PerspectiveCamera
} from '@react-three/drei';
import * as THREE from 'three';

interface WeatherVisualization3DProps {
  weatherData?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    pressure: number;
    weatherCondition: string;
    precipitation: number;
    cloudCover: number;
  };
}

// 雨滴粒子系统
const RainParticles: React.FC<{ intensity: number }> = ({ intensity }) => {
  const points = useRef<THREE.Points>(null);
  const particleCount = Math.floor(intensity * 1000);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = -Math.random() * 2 - 1;
      velocities[i * 3 + 2] = 0;
    }
    
    return { positions, velocities };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!points.current) return;
    
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta * 10;
      
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 50;
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="#4A90E2"
        transparent
        opacity={0.6}
      />
    </points>
  );
};

// 雪花粒子系统
const SnowParticles: React.FC<{ intensity: number }> = ({ intensity }) => {
  const points = useRef<THREE.Points>(null);
  const particleCount = Math.floor(intensity * 500);
  
  const particles = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 1] = Math.random() * 50 + 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = -Math.random() * 0.5 - 0.2;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    return { positions, velocities };
  }, [particleCount]);

  useFrame((state, delta) => {
    if (!points.current) return;
    
    const positions = points.current.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += particles.velocities[i * 3] * delta * 10;
      positions[i * 3 + 1] += particles.velocities[i * 3 + 1] * delta * 10;
      positions[i * 3 + 2] += particles.velocities[i * 3 + 2] * delta * 10;
      
      if (positions[i * 3 + 1] < -5) {
        positions[i * 3 + 1] = 50;
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      }
    }
    
    points.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.2}
        color="#FFFFFF"
        transparent
        opacity={0.8}
      />
    </points>
  );
};

// 风向指示器
const WindIndicator: React.FC<{ 
  windSpeed: number; 
  windDirection: number; 
}> = ({ windSpeed, windDirection }) => {
  const arrowRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (arrowRef.current) {
      arrowRef.current.rotation.y = (windDirection * Math.PI) / 180;
      const scale = Math.max(0.5, windSpeed / 10);
      arrowRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={arrowRef} position={[0, 15, 0]}>
      {/* 风向箭头 */}
      <mesh position={[0, 0, 2]}>
        <coneGeometry args={[0.5, 3, 8]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 4]} />
        <meshStandardMaterial color="#FF6B6B" />
      </mesh>
      
      {/* 风速标签 */}
      <Billboard position={[0, 3, 0]}>
        <Text
          fontSize={1}
          color="#FF6B6B"
          anchorX="center"
          anchorY="middle"
        >
          {windSpeed.toFixed(1)} m/s
        </Text>
      </Billboard>
    </group>
  );
};

// 温度可视化球体
const TemperatureSphere: React.FC<{ temperature: number }> = ({ temperature }) => {
  const sphereRef = useRef<THREE.Mesh>(null);
  
  const color = useMemo(() => {
    // 温度颜色映射：蓝色(冷) -> 绿色 -> 黄色 -> 红色(热)
    if (temperature < 0) return '#4A90E2';
    if (temperature < 10) return '#5CB3CC';
    if (temperature < 20) return '#7ED321';
    if (temperature < 30) return '#F5A623';
    return '#D0021B';
  }, [temperature]);

  useFrame((state) => {
    if (sphereRef.current) {
      sphereRef.current.rotation.y += 0.01;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      sphereRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[-15, 10, 0]}>
      <mesh ref={sphereRef}>
        <sphereGeometry args={[2, 32, 32]} />
        <meshStandardMaterial 
          color={color} 
          transparent 
          opacity={0.8}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      <Billboard position={[0, -4, 0]}>
        <Text
          fontSize={1.5}
          color={color}
          anchorX="center"
          anchorY="middle"
        >
          {temperature.toFixed(1)}°C
        </Text>
      </Billboard>
    </group>
  );
};

// 湿度可视化
const HumidityVisualization: React.FC<{ humidity: number }> = ({ humidity }) => {
  const groupRef = useRef<THREE.Group>(null);
  const dropletCount = Math.floor(humidity / 10);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  return (
    <group ref={groupRef} position={[15, 10, 0]}>
      {Array.from({ length: dropletCount }, (_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / dropletCount) * Math.PI * 2) * 3,
            Math.sin(i * 0.5) * 2,
            Math.sin((i / dropletCount) * Math.PI * 2) * 3
          ]}
        >
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial 
            color="#4A90E2" 
            transparent 
            opacity={0.7}
          />
        </mesh>
      ))}
      <Billboard position={[0, -4, 0]}>
        <Text
          fontSize={1.5}
          color="#4A90E2"
          anchorX="center"
          anchorY="middle"
        >
          {humidity.toFixed(0)}%
        </Text>
      </Billboard>
    </group>
  );
};

// 气压可视化柱状图
const PressureVisualization: React.FC<{ pressure: number }> = ({ pressure }) => {
  const barRef = useRef<THREE.Mesh>(null);
  const normalizedHeight = ((pressure - 980) / 50) * 10; // 标准化到0-10范围

  useFrame((state) => {
    if (barRef.current) {
      const targetHeight = Math.max(1, normalizedHeight);
      barRef.current.scale.y = THREE.MathUtils.lerp(barRef.current.scale.y, targetHeight, 0.05);
    }
  });

  return (
    <group position={[0, 0, -15]}>
      <mesh ref={barRef} position={[0, normalizedHeight / 2, 0]}>
        <boxGeometry args={[2, 1, 2]} />
        <meshStandardMaterial 
          color="#9013FE" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      <Billboard position={[0, normalizedHeight + 2, 0]}>
        <Text
          fontSize={1}
          color="#9013FE"
          anchorX="center"
          anchorY="middle"
        >
          {pressure.toFixed(1)} hPa
        </Text>
      </Billboard>
    </group>
  );
};

// 主要3D场景组件
const WeatherScene: React.FC<{ weatherData: WeatherVisualization3DProps['weatherData'] }> = ({ 
  weatherData 
}) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (camera) {
      camera.position.set(0, 20, 30);
      camera.lookAt(0, 10, 0);
    }
  }, [camera]);

  if (!weatherData) return null;

  const showRain = weatherData.weatherCondition.includes('雨') && weatherData.precipitation > 0;
  const showSnow = weatherData.weatherCondition.includes('雪');
  const cloudOpacity = weatherData.cloudCover / 100;

  return (
    <>
      {/* 环境光照 */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color="#4A90E2" intensity={0.5} />

      {/* 天空盒 */}
      <Sky 
        distance={450000}
        sunPosition={[0, 1, 0]}
        inclination={0}
        azimuth={0.25}
      />

      {/* 云层 */}
      {cloudOpacity > 0.1 && (
        <Cloud
          opacity={cloudOpacity}
          speed={0.4}
          width={20}
          depth={1.5}
          segments={20}
          position={[0, 25, 0]}
        />
      )}

      {/* 降雨效果 */}
      {showRain && (
        <RainParticles intensity={weatherData.precipitation / 10} />
      )}

      {/* 降雪效果 */}
      {showSnow && (
        <SnowParticles intensity={0.5} />
      )}

      {/* 温度可视化 */}
      <TemperatureSphere temperature={weatherData.temperature} />

      {/* 湿度可视化 */}
      <HumidityVisualization humidity={weatherData.humidity} />

      {/* 风向风速指示器 */}
      <WindIndicator 
        windSpeed={weatherData.windSpeed} 
        windDirection={weatherData.windDirection} 
      />

      {/* 气压可视化 */}
      <PressureVisualization pressure={weatherData.pressure} />

      {/* 地面 */}
      <Plane 
        args={[100, 100]} 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -2, 0]}
      >
        <meshStandardMaterial 
          color="#2E7D32" 
          transparent 
          opacity={0.3}
        />
      </Plane>

      {/* 标题 */}
      <Billboard position={[0, 35, 0]}>
        <Text
          fontSize={3}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
        >
          实时气象3D可视化
        </Text>
      </Billboard>

      {/* 相机控制 */}
      <OrbitControls 
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
      />
    </>
  );
};

const WeatherVisualization3D: React.FC<WeatherVisualization3DProps> = ({ weatherData }) => {
  return (
    <div style={{ width: '100%', height: '500px', borderRadius: '12px', overflow: 'hidden' }}>
      <Canvas
        camera={{ position: [0, 20, 30], fov: 75 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #98D8E8 100%)' }}
      >
        <WeatherScene weatherData={weatherData} />
      </Canvas>
    </div>
  );
};

export default WeatherVisualization3D;