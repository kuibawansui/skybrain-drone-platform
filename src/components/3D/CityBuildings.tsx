'use client';

import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BuildingProps {
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color?: string;
}

const Building: React.FC<BuildingProps> = ({ 
  position, 
  height, 
  width, 
  depth, 
  color = '#2c3e50' 
}) => {
  const meshRef = React.useRef<THREE.Mesh>(null);

  // 建筑物材质
  const buildingMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      color: color,
      transparent: true,
      opacity: 0.8,
    });
  }, [color]);

  // 建筑物顶部发光效果
  const roofMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#1890FF',
      transparent: true,
      opacity: 0.3,
    });
  }, []);

  return (
    <group position={position}>
      {/* 建筑主体 */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        material={buildingMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
      </mesh>
      
      {/* 建筑顶部发光层 */}
      <mesh
        position={[0, height + 0.1, 0]}
        material={roofMaterial}
      >
        <boxGeometry args={[width + 0.2, 0.2, depth + 0.2]} />
      </mesh>
      
      {/* 建筑物窗户效果 */}
      {Array.from({ length: Math.floor(height / 2) }, (_, i) => (
        <group key={i}>
          {Array.from({ length: 3 }, (_, j) => (
            <mesh
              key={j}
              position={[
                (j - 1) * (width / 4),
                i * 2 + 1,
                width / 2 + 0.01
              ]}
            >
              <boxGeometry args={[0.3, 0.4, 0.02]} />
              <meshBasicMaterial 
                color={Math.random() > 0.7 ? '#FAAD14' : '#1890FF'} 
                transparent
                opacity={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

export const CityBuildings: React.FC = () => {
  // 生成城市建筑布局
  const buildings = useMemo(() => {
    const buildingData: BuildingProps[] = [];
    
    // 创建网格状城市布局
    for (let x = -15; x <= 15; x += 4) {
      for (let z = -15; z <= 15; z += 4) {
        // 跳过中心区域，为无人机飞行留出空间
        if (Math.abs(x) < 3 && Math.abs(z) < 3) continue;
        
        const height = Math.random() * 8 + 2; // 2-10米高度
        const width = Math.random() * 1.5 + 1.5; // 1.5-3米宽度
        const depth = Math.random() * 1.5 + 1.5; // 1.5-3米深度
        
        // 根据距离中心的远近调整建筑颜色
        const distance = Math.sqrt(x * x + z * z);
        const colors = ['#34495e', '#2c3e50', '#3498db', '#2980b9'];
        const colorIndex = Math.floor(distance / 5) % colors.length;
        
        buildingData.push({
          position: [x + (Math.random() - 0.5), 0, z + (Math.random() - 0.5)],
          height,
          width,
          depth,
          color: colors[colorIndex],
        });
      }
    }
    
    // 添加几个标志性高楼
    const landmarks = [
      { position: [-12, 0, -12], height: 15, width: 3, depth: 3, color: '#e74c3c' },
      { position: [12, 0, 12], height: 18, width: 2.5, depth: 2.5, color: '#9b59b6' },
      { position: [-10, 0, 10], height: 12, width: 4, depth: 2, color: '#f39c12' },
      { position: [10, 0, -10], height: 14, width: 2, depth: 4, color: '#27ae60' },
    ];
    
    return [...buildingData, ...landmarks];
  }, []);

  return (
    <group>
      {buildings.map((building, index) => (
        <Building 
          key={index} 
          position={building.position as [number, number, number]}
          height={building.height}
          width={building.width}
          depth={building.depth}
          color={building.color}
        />
      ))}
      
      {/* 地面 */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[40, 1, 40]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      
      {/* 道路系统 */}
      <group>
        {/* 主干道 - X方向 */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[40, 0.02, 2]} />
          <meshBasicMaterial color="#404040" />
        </mesh>
        
        {/* 主干道 - Z方向 */}
        <mesh position={[0, 0.01, 0]}>
          <boxGeometry args={[2, 0.02, 40]} />
          <meshBasicMaterial color="#404040" />
        </mesh>
        
        {/* 次干道 */}
        {[-8, 8].map(pos => (
          <group key={pos}>
            <mesh position={[pos, 0.01, 0]}>
              <boxGeometry args={[40, 0.02, 1]} />
              <meshBasicMaterial color="#303030" />
            </mesh>
            <mesh position={[0, 0.01, pos]}>
              <boxGeometry args={[1, 0.02, 40]} />
              <meshBasicMaterial color="#303030" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
};