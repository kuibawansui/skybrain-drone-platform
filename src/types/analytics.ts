// 历史数据分析相关类型定义

export interface FlightRecord {
  id: string;
  droneId: string;
  droneName: string;
  startTime: Date;
  endTime: Date;
  duration: number; // 分钟
  distance: number; // 公里
  maxAltitude: number; // 米
  avgSpeed: number; // km/h
  maxSpeed: number; // km/h
  batteryStart: number; // %
  batteryEnd: number; // %
  batteryConsumption: number; // %
  flightPath: Array<{
    timestamp: Date;
    lat: number;
    lng: number;
    altitude: number;
    speed: number;
    battery: number;
  }>;
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
  };
  riskEvents: Array<{
    timestamp: Date;
    type: 'warning' | 'error' | 'critical';
    description: string;
    riskLevel: number;
  }>;
  missionType: 'patrol' | 'delivery' | 'inspection' | 'emergency' | 'training';
  status: 'completed' | 'aborted' | 'emergency_landing';
}

export interface DronePerformanceMetrics {
  droneId: string;
  droneName: string;
  totalFlights: number;
  totalFlightTime: number; // 小时
  totalDistance: number; // 公里
  avgFlightDuration: number; // 分钟
  avgBatteryConsumption: number; // %
  successRate: number; // %
  maintenanceScore: number; // 0-100
  lastMaintenance: Date;
  nextMaintenance: Date;
  performanceTrend: 'improving' | 'stable' | 'declining';
  commonIssues: string[];
}

export interface AnalyticsTimeRange {
  start: Date;
  end: Date;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface FlightAnalytics {
  timeRange: AnalyticsTimeRange;
  totalFlights: number;
  totalFlightTime: number;
  totalDistance: number;
  avgFlightDuration: number;
  flightsByType: Record<string, number>;
  flightsByStatus: Record<string, number>;
  busyHours: Array<{ hour: number; flights: number }>;
  busyDays: Array<{ day: string; flights: number }>;
  riskAnalysis: {
    totalRiskEvents: number;
    riskByType: Record<string, number>;
    avgRiskLevel: number;
    riskTrends: Array<{ date: string; riskLevel: number }>;
  };
  weatherImpact: {
    flightsByWeather: Record<string, number>;
    weatherDelays: number;
    weatherCancellations: number;
  };
}

export interface MaintenanceRecord {
  id: string;
  droneId: string;
  date: Date;
  type: 'routine' | 'repair' | 'upgrade' | 'inspection';
  description: string;
  cost: number;
  duration: number; // 小时
  technician: string;
  partsReplaced: string[];
  nextMaintenanceDate: Date;
  status: 'completed' | 'pending' | 'in_progress';
}

export interface PredictiveAnalytics {
  droneId: string;
  predictions: {
    nextMaintenanceDate: Date;
    batteryLifeRemaining: number; // 天
    componentFailureRisk: Array<{
      component: string;
      riskLevel: number; // 0-1
      estimatedFailureDate: Date;
      confidence: number; // 0-1
    }>;
    performanceDecline: {
      predicted: boolean;
      timeframe: number; // 天
      factors: string[];
    };
  };
  recommendations: Array<{
    type: 'maintenance' | 'replacement' | 'optimization';
    priority: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    estimatedCost: number;
    estimatedBenefit: string;
  }>;
}

export interface ReportConfig {
  id: string;
  name: string;
  type: 'flight_summary' | 'performance_analysis' | 'maintenance_report' | 'risk_assessment' | 'custom';
  timeRange: AnalyticsTimeRange;
  droneIds: string[];
  includeCharts: boolean;
  includeRawData: boolean;
  format: 'pdf' | 'excel' | 'json';
  schedule: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly';
    recipients: string[];
  };
  filters: {
    missionTypes?: string[];
    riskLevels?: string[];
    weatherConditions?: string[];
  };
}

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'map';
  title: string;
  size: 'small' | 'medium' | 'large';
  position: { x: number; y: number };
  config: any;
  dataSource: string;
  refreshInterval: number; // 秒
}