// 真实数据Hook - 管理真实数据的获取和状态

import { useState, useEffect, useCallback } from 'react';
import { realDataService, type RealDroneData, type RealWeatherData, type RealAirspaceData } from '../services/realDataService';

export interface RealDataState {
  drones: RealDroneData[];
  weather: RealWeatherData | null;
  airspace: RealAirspaceData | null;
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts: number;
  dataSource: 'real' | 'enhanced_simulation' | 'basic_simulation';
}

export interface UseRealDataOptions {
  enableDroneData?: boolean;
  enableWeatherData?: boolean;
  enableAirspaceData?: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
  updateInterval?: number;
  onDataUpdate?: (data: RealDataState) => void;
  onError?: (error: Error) => void;
}

export const useRealData = (options: UseRealDataOptions = {}) => {
  const {
    enableDroneData = true,
    enableWeatherData = true,
    enableAirspaceData = true,
    location = { latitude: 39.9042, longitude: 116.4074 }, // 默认北京
    updateInterval = 5000,
    onDataUpdate,
    onError
  } = options;

  const [state, setState] = useState<RealDataState>({
    drones: [],
    weather: null,
    airspace: null,
    isConnected: false,
    lastUpdate: null,
    connectionAttempts: 0,
    dataSource: 'basic_simulation'
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 更新状态的辅助函数
  const updateState = useCallback((updates: Partial<RealDataState>) => {
    setState(prev => {
      const newState = { ...prev, ...updates, lastUpdate: new Date() };
      onDataUpdate?.(newState);
      return newState;
    });
  }, [onDataUpdate]);

  // 处理错误
  const handleError = useCallback((err: Error, context: string) => {
    console.error(`❌ ${context}:`, err);
    setError(`${context}: ${err.message}`);
    onError?.(err);
  }, [onError]);

  // 初始化真实数据连接
  const initializeRealData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🚀 初始化真实数据连接...');

      // 连接无人机数据流
      if (enableDroneData) {
        await realDataService.connectToRealDroneData((droneData) => {
          updateState({
            drones: droneData,
            isConnected: true,
            dataSource: droneData.length > 0 ? 'enhanced_simulation' : 'basic_simulation'
          });
        });
      }

      // 获取天气数据
      if (enableWeatherData) {
        try {
          const weatherData = await realDataService.getRealWeatherData(
            location.latitude,
            location.longitude
          );
          updateState({ weather: weatherData });
          console.log('✅ 天气数据获取成功');
        } catch (err) {
          handleError(err as Error, '获取天气数据失败');
        }
      }

      // 获取空域数据
      if (enableAirspaceData) {
        try {
          const bounds = {
            north: location.latitude + 0.1,
            south: location.latitude - 0.1,
            east: location.longitude + 0.1,
            west: location.longitude - 0.1
          };
          const airspaceData = await realDataService.getRealAirspaceData(bounds);
          updateState({ airspace: airspaceData });
          console.log('✅ 空域数据获取成功');
        } catch (err) {
          handleError(err as Error, '获取空域数据失败');
        }
      }

      setLoading(false);
      console.log('✅ 真实数据初始化完成');

    } catch (err) {
      handleError(err as Error, '初始化真实数据连接失败');
      setLoading(false);
    }
  }, [enableDroneData, enableWeatherData, enableAirspaceData, location, updateState, handleError]);

  // 刷新数据
  const refreshData = useCallback(async () => {
    if (enableWeatherData && location) {
      try {
        const weatherData = await realDataService.getRealWeatherData(
          location.latitude,
          location.longitude
        );
        updateState({ weather: weatherData });
      } catch (err) {
        handleError(err as Error, '刷新天气数据失败');
      }
    }

    if (enableAirspaceData && location) {
      try {
        const bounds = {
          north: location.latitude + 0.1,
          south: location.latitude - 0.1,
          east: location.longitude + 0.1,
          west: location.longitude - 0.1
        };
        const airspaceData = await realDataService.getRealAirspaceData(bounds);
        updateState({ airspace: airspaceData });
      } catch (err) {
        handleError(err as Error, '刷新空域数据失败');
      }
    }
  }, [enableWeatherData, enableAirspaceData, location, updateState, handleError]);

  // 设置定期刷新
  useEffect(() => {
    if (!enableWeatherData && !enableAirspaceData) return;

    const interval = setInterval(refreshData, updateInterval);
    return () => clearInterval(interval);
  }, [refreshData, updateInterval, enableWeatherData, enableAirspaceData]);

  // 初始化
  useEffect(() => {
    initializeRealData();

    // 清理函数
    return () => {
      realDataService.disconnect();
    };
  }, [initializeRealData]);

  // 获取数据统计
  const getDataStats = useCallback(() => {
    const activeDrones = state.drones.filter(d => d.status === 'active').length;
    const totalFlightTime = state.drones.reduce((sum, d) => sum + d.telemetry.flight.flightTime, 0);
    const avgBattery = state.drones.length > 0 
      ? state.drones.reduce((sum, d) => sum + d.telemetry.battery.percentage, 0) / state.drones.length 
      : 0;

    const weatherAlerts = state.weather?.alerts.length || 0;
    const airspaceRestrictions = state.airspace?.notams.filter(n => n.type === 'restriction').length || 0;

    return {
      totalDrones: state.drones.length,
      activeDrones,
      totalFlightTime: Math.round(totalFlightTime / 60), // 转换为分钟
      avgBattery: Math.round(avgBattery),
      weatherAlerts,
      airspaceRestrictions,
      dataFreshness: state.lastUpdate ? Date.now() - state.lastUpdate.getTime() : 0
    };
  }, [state]);

  // 获取风险评估
  const getRiskAssessment = useCallback(() => {
    let riskLevel = 0;
    const riskFactors: string[] = [];

    // 无人机状态风险
    const emergencyDrones = state.drones.filter(d => d.status === 'emergency').length;
    const lowBatteryDrones = state.drones.filter(d => d.telemetry.battery.percentage < 20).length;
    
    if (emergencyDrones > 0) {
      riskLevel += 0.4;
      riskFactors.push(`${emergencyDrones}架无人机处于紧急状态`);
    }
    
    if (lowBatteryDrones > 0) {
      riskLevel += 0.2;
      riskFactors.push(`${lowBatteryDrones}架无人机电量不足`);
    }

    // 天气风险
    if (state.weather) {
      const { windSpeed, precipitation, visibility } = state.weather.current;
      
      if (windSpeed > 10) {
        riskLevel += 0.2;
        riskFactors.push(`风速过大 (${windSpeed.toFixed(1)} m/s)`);
      }
      
      if (precipitation > 1) {
        riskLevel += 0.3;
        riskFactors.push(`降水影响 (${precipitation.toFixed(1)} mm/h)`);
      }
      
      if (visibility < 5) {
        riskLevel += 0.2;
        riskFactors.push(`能见度不佳 (${visibility.toFixed(1)} km)`);
      }
    }

    // 空域风险
    if (state.airspace) {
      const highSeverityNotams = state.airspace.notams.filter(n => n.severity === 'high').length;
      const activeTraffic = state.airspace.traffic.length;
      
      if (highSeverityNotams > 0) {
        riskLevel += 0.3;
        riskFactors.push(`${highSeverityNotams}个高风险空域限制`);
      }
      
      if (activeTraffic > 5) {
        riskLevel += 0.1;
        riskFactors.push(`空域交通繁忙 (${activeTraffic}架飞行器)`);
      }
    }

    return {
      level: Math.min(riskLevel, 1),
      factors: riskFactors,
      recommendation: riskLevel > 0.7 ? '建议暂停飞行' : 
                     riskLevel > 0.4 ? '谨慎飞行，加强监控' : 
                     '飞行条件良好'
    };
  }, [state]);

  return {
    // 数据状态
    ...state,
    loading,
    error,
    
    // 操作函数
    refreshData,
    initializeRealData,
    
    // 计算属性
    stats: getDataStats(),
    riskAssessment: getRiskAssessment(),
    
    // 辅助函数
    clearError: () => setError(null),
    isDataFresh: (maxAge: number = 30000) => {
      return state.lastUpdate ? Date.now() - state.lastUpdate.getTime() < maxAge : false;
    }
  };
};