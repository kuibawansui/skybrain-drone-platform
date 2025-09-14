'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

interface DroneProps {
  id: string;
  position: THREE.Vector3;
  target: THREE.Vector3;
  status: 'idle' | 'flying' | 'delivering' | 'returning' | 'emergency';
  battery: number;
  payload: number;
}

const Drone: React.FC<DroneProps> = ({ 
  id, 
  position, 
  target, 
  status, 
  battery, 
  payload 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const propellerRefs = useRef<THREE.Mesh[]>([]);
  
  // 根据状态确定颜色
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return '#52C41A';
      case 'flying': return '#1890FF';
      case 'delivering': return '#FAAD14';
      case 'returning': return '#722ED1';
      case 'emergency': return '#FF4D4F';
      default: return '#8C8C8C';
    }
  };

  const statusColor = getStatusColor(status);

  // 动画更新
  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 螺旋桨旋转
    propellerRefs.current.forEach((propeller) => {
      if (propeller) {
        propeller.rotation.y += delta * 50; // 高速旋转
      }
    });

    // 无人机飞行动画
    if (status === 'flying' || status === 'delivering') {
      // 轻微的上下浮动
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime * 3) * 0.01;
      
      // 轻微的倾斜效果
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 1.5) * 0.03;
    }

    // 紧急状态闪烁
    if (status === 'emergency') {
      const flash = Math.sin(state.clock.elapsedTime * 10) > 0;
      meshRef.current.visible = flash;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* 无人机主体 */}
      <mesh>
        <boxGeometry args={[1.2, 0.3, 1.2]} />
        <meshStandardMaterial 
          color={statusColor} 
          emissive={statusColor}
          emissiveIntensity={0.4}
          metalness={0.2}
          roughness={0.1}
        />
      </mesh>
      
      {/* 四个螺旋桨臂 */}
      {[
        [-0.6, 0, -0.6],
        [0.6, 0, -0.6],
        [0.6, 0, 0.6],
        [-0.6, 0, 0.6],
      ].map((pos, index) => (
        <group key={index} position={pos as [number, number, number]}>
          {/* 螺旋桨臂 */}
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.6]} />
            <meshStandardMaterial 
              color="#ffaa00" 
              emissive="#ffaa00"
              emissiveIntensity={0.2}
            />
          </mesh>
          
          {/* 螺旋桨 */}
          <mesh
            ref={(el) => {
              if (el) propellerRefs.current[index] = el;
            }}
            position={[0, 0.2, 0]}
          >
            <cylinderGeometry args={[0.4, 0.4, 0.03]} />
            <meshStandardMaterial 
              color="#00aaff" 
              emissive="#00aaff"
              emissiveIntensity={0.5}
              transparent 
              opacity={0.8} 
            />
          </mesh>
        </group>
      ))}
      
      {/* 载荷指示器 */}
      {payload > 0 && (
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[0.3, 0.1, 0.3]} />
          <meshLambertMaterial color="#FF7A00" />
        </mesh>
      )}
      
      {/* LED状态灯 */}
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.08]} />
        <meshStandardMaterial 
          color={statusColor} 
          emissive={statusColor}
          emissiveIntensity={0.8}
        />
      </mesh>
      
      {/* 信息标签 */}
      <Html position={[0, 1.2, 0]} center>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '1px 4px',
          borderRadius: '3px',
          fontSize: '8px',
          whiteSpace: 'nowrap',
          border: `1px solid ${statusColor}`,
          minWidth: '60px'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '1px' }}>{id}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '7px' }}>
            <span>电量: {battery}%</span>
            <span style={{ color: status === 'emergency' ? '#ff4d4f' : '#52c41a' }}>
              {status}
            </span>
          </div>
        </div>
      </Html>
      
      {/* 飞行轨迹线 */}
      {status === 'flying' && (
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([
                position.x, position.y, position.z,
                target.x, target.y, target.z,
              ])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color="#1890FF" opacity={0.5} transparent />
        </line>
      )}
    </group>
  );
};

export const DroneFleet: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const drones = useSelector((state: RootState) => state.drones.fleet);
  
  // 确保只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // 生成模拟无人机数据
  const simulatedDrones = useMemo(() => {
    const droneData: DroneProps[] = [];
    
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const radius = 5 + Math.random() * 8;
      const height = 3 + Math.random() * 4;
      
      const statuses: DroneProps['status'][] = ['idle', 'flying', 'delivering', 'returning'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      // 紧急状态概率较低
      const finalStatus = Math.random() < 0.05 ? 'emergency' : randomStatus;
      
      droneData.push({
        id: `UAV-${String(i + 1).padStart(3, '0')}`,
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        target: new THREE.Vector3(
          Math.cos(angle + 1) * (radius + 2),
          height + Math.random() * 2,
          Math.sin(angle + 1) * (radius + 2)
        ),
        status: finalStatus,
        battery: Math.floor(Math.random() * 40) + 60, // 60-100%
        payload: Math.random() > 0.3 ? Math.floor(Math.random() * 5) + 1 : 0,
      });
    }
    
    return droneData;
  }, []);

  // 防止服务端渲染不匹配
  if (!isClient) {
    return null;
  }

  return (
    <group>
      {simulatedDrones.map((drone) => (
        <Drone key={drone.id} {...drone} />
      ))}
      
      {/* 集群中心标记 */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.1]} />
        <meshBasicMaterial color="#1890FF" transparent opacity={0.3} />
      </mesh>
      
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.5}
        color="#1890FF"
        anchorX="center"
        anchorY="middle"
      >
        集群中心
      </Text>
    </group>
  );
};