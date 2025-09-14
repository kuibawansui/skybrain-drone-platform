'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FlightPathProps {
  points: THREE.Vector3[];
  color: string;
  opacity: number;
  animated?: boolean;
}

const FlightPath: React.FC<FlightPathProps> = ({ 
  points, 
  color, 
  opacity, 
  animated = false 
}) => {
  const lineRef = useRef<THREE.Line>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);

  // 创建路径几何体
  const geometry = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points);
    const pathPoints = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
    return geometry;
  }, [points]);

  // 动画效果
  useFrame((state) => {
    if (animated && materialRef.current) {
      // 创建流动效果
      const time = state.clock.elapsedTime;
      materialRef.current.opacity = opacity * (0.5 + 0.5 * Math.sin(time * 2));
    }
  });

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({
      color: color,
      opacity: opacity,
      transparent: true,
      linewidth: 2
    }))} />
  );
};

export const FlightPaths: React.FC = () => {
  // 生成飞行路径数据
  const flightPaths = useMemo(() => {
    const paths = [];
    
    // 主要配送路径
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const radius = 6 + Math.random() * 4;
      const height = 4 + Math.random() * 3;
      
      const startPoint = new THREE.Vector3(
        Math.cos(angle) * 2,
        height,
        Math.sin(angle) * 2
      );
      
      const midPoint = new THREE.Vector3(
        Math.cos(angle) * radius * 0.6,
        height + Math.random() * 2,
        Math.sin(angle) * radius * 0.6
      );
      
      const endPoint = new THREE.Vector3(
        Math.cos(angle) * radius,
        height - 1,
        Math.sin(angle) * radius
      );
      
      paths.push({
        points: [startPoint, midPoint, endPoint],
        color: '#1890FF',
        opacity: 0.6,
        animated: true,
      });
    }
    
    // 紧急路径
    const emergencyPath = {
      points: [
        new THREE.Vector3(-8, 6, -8),
        new THREE.Vector3(0, 8, 0),
        new THREE.Vector3(8, 6, 8),
      ],
      color: '#FF4D4F',
      opacity: 0.8,
      animated: true,
    };
    paths.push(emergencyPath);
    
    // 返航路径
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const radius = 10;
      const height = 2;
      
      const points = [
        new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        new THREE.Vector3(
          Math.cos(angle) * radius * 0.5,
          height + 2,
          Math.sin(angle) * radius * 0.5
        ),
        new THREE.Vector3(0, height + 1, 0),
      ];
      
      paths.push({
        points,
        color: '#52C41A',
        opacity: 0.4,
        animated: false,
      });
    }
    
    return paths;
  }, []);

  return (
    <group>
      {flightPaths.map((path, index) => (
        <FlightPath key={index} {...path} />
      ))}
      
      {/* 路径节点标记 */}
      {flightPaths.map((path, pathIndex) =>
        path.points.map((point, pointIndex) => (
          <mesh key={`${pathIndex}-${pointIndex}`} position={point}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial
              color={path.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        ))
      )}
      
      {/* 空域边界 */}
      <group>
        {/* 安全飞行高度指示 */}
        <mesh position={[0, 5, 0]}>
          <ringGeometry args={[15, 15.2, 32]} />
          <meshBasicMaterial
            color="#FAAD14"
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>
        
        <mesh position={[0, 3, 0]}>
          <ringGeometry args={[12, 12.2, 32]} />
          <meshBasicMaterial
            color="#52C41A"
            transparent
            opacity={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>
    </group>
  );
};