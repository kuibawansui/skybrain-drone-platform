// 全局类型定义

export interface DroneData {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  status: 'idle' | 'flying' | 'delivering' | 'returning' | 'emergency';
  battery: number;
  payload: number;
  mission?: string;
  lastUpdate: string;
}

export interface RiskZone {
  id: string;
  position: [number, number, number];
  radius: number;
  height: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskType: 'weather' | 'obstacle' | 'crowd' | 'electromagnetic' | 'other';
  label: string;
  probability: number;
  lastUpdate: string;
}

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
}

export interface WeatherConditions {
  temperature: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  precipitation: number;
}

export interface BayesianNode {
  id: string;
  name: string;
  probability: number;
  dependencies: string[];
}