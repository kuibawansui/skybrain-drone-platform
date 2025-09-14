'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface RiskZoneProps {
  position: [number, number, number];
  radius: number;
  height: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  label: string;
}

const RiskZone: React.FC<RiskZoneProps> = ({
  position,
  radius,
  height,
  riskLevel,
  label,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // 根据风险等级确定颜色
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return '#52C41A';
      case 'medium': return '#FAAD14';
      case 'high': return '#FF7A00';
      case 'critical': return '#FF4D4F';
      default: return '#8C8C8C';
    }
  };

  const riskColor = getRiskColor(riskLevel);
  const opacity = riskLevel === 'critical' ? 0.6 : 0.3;

  // 动画效果
  useFrame((state) => {
    if (meshRef.current && riskLevel === 'critical') {
      // 高风险区域脉冲效果
      const pulse = 0.8 + 0.2 * Math.sin(state.clock.elapsedTime * 3);
      meshRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group position={position}>
      {/* 风险区域圆柱体 */}
      <mesh ref={meshRef}>
        <cylinderGeometry args={[radius, radius, height, 16]} />
        <meshBasicMaterial
          color={riskColor}
          transparent
          opacity={opacity}
        />
      </mesh>
      
      {/* 边界线 */}
      <mesh position={[0, height / 2, 0]}>
        <ringGeometry args={[radius - 0.1, radius + 0.1, 32]} />
        <meshBasicMaterial
          color={riskColor}
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 风险等级标签 */}
      <Text
        position={[0, height + 0.5, 0]}
        fontSize={0.3}
        color={riskColor}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
      
      {/* 风险等级指示器 */}
      <mesh position={[0, height + 1, 0]}>
        <sphereGeometry args={[0.2]} />
        <meshBasicMaterial color={riskColor} />
      </mesh>
    </group>
  );
};

export const RiskZones: React.FC = () => {
  // 生成风险区域数据
  const riskZones = useMemo(() => {
    return [
      {
        position: [-10, 0, -10] as [number, number, number],
        radius: 2,
        height: 8,
        riskLevel: 'high' as const,
        label: '强风区域',
      },
      {
        position: [8, 0, -12] as [number, number, number],
        radius: 1.5,
        height: 6,
        riskLevel: 'medium' as const,
        label: '鸟类活动',
      },
      {
        position: [-6, 0, 8] as [number, number, number],
        radius: 3,
        height: 4,
        riskLevel: 'critical' as const,
        label: '紧急避让',
      },
      {
        position: [12, 0, 6] as [number, number, number],
        radius: 2.5,
        height: 5,
        riskLevel: 'low' as const,
        label: '人群密集',
      },
      {
        position: [0, 0, -15] as [number, number, number],
        radius: 1.8,
        height: 7,
        riskLevel: 'medium' as const,
        label: '电磁干扰',
      },
      {
        position: [15, 0, 0] as [number, number, number],
        radius: 2.2,
        height: 6,
        riskLevel: 'high' as const,
        label: '建筑施工',
      },
    ];
  }, []);

  return (
    <group>
      {riskZones.map((zone, index) => (
        <RiskZone key={index} {...zone} />
      ))}
      
      {/* 全局风险热力图网格 */}
      <group>
        {Array.from({ length: 10 }, (_, x) =>
          Array.from({ length: 10 }, (_, z) => {
            const posX = (x - 4.5) * 4;
            const posZ = (z - 4.5) * 4;
            
            // 计算该点的风险值
            let riskValue = 0;
            riskZones.forEach(zone => {
              const distance = Math.sqrt(
                Math.pow(posX - zone.position[0], 2) +
                Math.pow(posZ - zone.position[2], 2)
              );
              if (distance < zone.radius * 2) {
                const riskWeight = zone.riskLevel === 'critical' ? 4 :
                                zone.riskLevel === 'high' ? 3 :
                                zone.riskLevel === 'medium' ? 2 : 1;
                riskValue += riskWeight * (1 - distance / (zone.radius * 2));
              }
            });
            
            if (riskValue > 0.1) {
              const color = riskValue > 2 ? '#FF4D4F' :
                          riskValue > 1 ? '#FF7A00' :
                          riskValue > 0.5 ? '#FAAD14' : '#52C41A';
              
              return (
                <mesh
                  key={`${x}-${z}`}
                  position={[posX, 0.1, posZ]}
                >
                  <planeGeometry args={[3, 3]} />
                  <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={Math.min(riskValue * 0.3, 0.6)}
                  />
                </mesh>
              );
            }
            return null;
          })
        )}
      </group>
      
      {/* 风险等级图例 */}
      <group position={[-18, 5, 0]}>
        <Text
          position={[0, 2, 0]}
          fontSize={0.4}
          color="#FFFFFF"
          anchorX="center"
        >
          风险等级
        </Text>
        
        {[
          { level: '低风险', color: '#52C41A', y: 1 },
          { level: '中风险', color: '#FAAD14', y: 0 },
          { level: '高风险', color: '#FF7A00', y: -1 },
          { level: '极高风险', color: '#FF4D4F', y: -2 },
        ].map((item, index) => (
          <group key={index} position={[0, item.y, 0]}>
            <mesh position={[-1, 0, 0]}>
              <sphereGeometry args={[0.1]} />
              <meshBasicMaterial color={item.color} />
            </mesh>
            <Text
              position={[0, 0, 0]}
              fontSize={0.2}
              color="#FFFFFF"
              anchorX="left"
            >
              {item.level}
            </Text>
          </group>
        ))}
      </group>
    </group>
  );
};