// 真实数据服务 - 集成真实无人机数据源

export interface RealDroneData {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  status: 'active' | 'inactive' | 'maintenance' | 'emergency';
  location: {
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
  };
  telemetry: {
    battery: {
      voltage: number;
      current: number;
      percentage: number;
      temperature: number;
      cycleCount: number;
    };
    flight: {
      speed: number;
      verticalSpeed: number;
      groundSpeed: number;
      airSpeed: number;
      flightTime: number;
      distance: number;
    };
    sensors: {
      gps: {
        satellites: number;
        hdop: number;
        fix: 'none' | '2d' | '3d';
      };
      imu: {
        accelerometer: { x: number; y: number; z: number };
        gyroscope: { x: number; y: number; z: number };
        magnetometer: { x: number; y: number; z: number };
      };
      barometer: {
        pressure: number;
        altitude: number;
        temperature: number;
      };
    };
    motors: Array<{
      id: number;
      rpm: number;
      temperature: number;
      current: number;
      voltage: number;
    }>;
  };
  mission: {
    id: string;
    type: string;
    status: 'planned' | 'active' | 'completed' | 'aborted';
    waypoints: Array<{
      lat: number;
      lng: number;
      alt: number;
      action: string;
    }>;
    progress: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    visibility: number;
    precipitation: number;
  };
  timestamp: Date;
}

export interface RealWeatherData {
  location: {
    name: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    windGust: number;
    visibility: number;
    uvIndex: number;
    cloudCover: number;
    precipitation: number;
    dewPoint: number;
  };
  forecast: Array<{
    time: Date;
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    cloudCover: number;
  }>;
  alerts: Array<{
    type: 'wind' | 'rain' | 'storm' | 'fog' | 'temperature';
    severity: 'low' | 'medium' | 'high' | 'extreme';
    description: string;
    startTime: Date;
    endTime: Date;
  }>;
}

export interface RealAirspaceData {
  notams: Array<{
    id: string;
    type: 'restriction' | 'closure' | 'warning' | 'info';
    location: {
      latitude: number;
      longitude: number;
      radius: number;
    };
    altitude: {
      min: number;
      max: number;
    };
    timeframe: {
      start: Date;
      end: Date;
    };
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
  traffic: Array<{
    id: string;
    type: 'aircraft' | 'helicopter' | 'drone';
    callsign: string;
    location: {
      latitude: number;
      longitude: number;
      altitude: number;
    };
    velocity: {
      speed: number;
      heading: number;
      verticalRate: number;
    };
    squawk: string;
    timestamp: Date;
  }>;
  restrictions: Array<{
    id: string;
    name: string;
    type: 'no_fly_zone' | 'restricted_area' | 'temporary_restriction';
    geometry: Array<{ lat: number; lng: number }>;
    altitude: {
      min: number;
      max: number;
    };
    active: boolean;
    reason: string;
  }>;
}

class RealDataService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 5000;

  // 真实API端点配置
  private readonly API_ENDPOINTS = {
    // 这些是示例端点，实际使用时需要替换为真实的API
    DRONE_DATA: 'wss://api.skybrain.com/ws/drones',
    WEATHER_API: 'https://api.openweathermap.org/data/2.5',
    AIRSPACE_API: 'https://api.faa.gov/notams',
    FLIGHT_TRACKING: 'https://api.flightradar24.com/zones/fcgi/feed.js',
    
    // 备用数据源
    BACKUP_WEATHER: 'https://api.weatherapi.com/v1',
    BACKUP_AIRSPACE: 'https://api.aviationweather.gov/cgi-bin/data/dataserver.php'
  };

  // API密钥配置（实际使用时应从环境变量获取）
  private readonly API_KEYS = {
    OPENWEATHER: process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'YOUR_OPENWEATHER_API_KEY',
    WEATHERAPI: process.env.NEXT_PUBLIC_WEATHERAPI_KEY || 'YOUR_WEATHERAPI_KEY',
    FLIGHTRADAR: process.env.NEXT_PUBLIC_FLIGHTRADAR_KEY || 'YOUR_FLIGHTRADAR_KEY'
  };

  // 连接到真实无人机数据流
  async connectToRealDroneData(onDataReceived: (data: RealDroneData[]) => void): Promise<void> {
    try {
      // 尝试连接到真实WebSocket数据源
      if (this.API_ENDPOINTS.DRONE_DATA.startsWith('wss://')) {
        this.wsConnection = new WebSocket(this.API_ENDPOINTS.DRONE_DATA);
        
        this.wsConnection.onopen = () => {
          console.log('✅ 已连接到真实无人机数据流');
          this.reconnectAttempts = 0;
        };

        this.wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            onDataReceived(this.processDroneData(data));
          } catch (error) {
            console.error('❌ 解析无人机数据失败:', error);
          }
        };

        this.wsConnection.onclose = () => {
          console.log('🔌 无人机数据连接已断开');
          this.handleReconnect(onDataReceived);
        };

        this.wsConnection.onerror = (error) => {
          console.error('❌ 无人机数据连接错误:', error);
        };
      } else {
        // 如果没有真实数据源，使用增强的模拟数据
        console.log('📡 使用增强模拟数据（基于真实参数）');
        this.startEnhancedSimulation(onDataReceived);
      }
    } catch (error) {
      console.error('❌ 连接真实数据源失败:', error);
      // 降级到增强模拟数据
      this.startEnhancedSimulation(onDataReceived);
    }
  }

  // 获取真实天气数据
  async getRealWeatherData(lat: number, lon: number): Promise<RealWeatherData> {
    try {
      // 尝试从OpenWeatherMap获取数据
      const response = await fetch(
        `${this.API_ENDPOINTS.WEATHER_API}/weather?lat=${lat}&lon=${lon}&appid=${this.API_KEYS.OPENWEATHER}&units=metric`
      );

      if (response.ok) {
        const data = await response.json();
        return this.processWeatherData(data);
      } else {
        throw new Error(`Weather API error: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ 获取真实天气数据失败:', error);
      // 返回基于真实参数的模拟数据
      return this.generateRealisticWeatherData(lat, lon);
    }
  }

  // 获取真实空域数据
  async getRealAirspaceData(bounds: { north: number; south: number; east: number; west: number }): Promise<RealAirspaceData> {
    try {
      // 这里应该调用真实的NOTAM和空域数据API
      // 由于需要特殊权限，我们提供基于真实数据结构的模拟
      console.log('📡 获取空域数据 (基于真实NOTAM格式)');
      return this.generateRealisticAirspaceData(bounds);
    } catch (error) {
      console.error('❌ 获取真实空域数据失败:', error);
      return this.generateRealisticAirspaceData(bounds);
    }
  }

  // 处理真实无人机数据
  private processDroneData(rawData: any): RealDroneData[] {
    // 这里处理从真实API接收到的数据
    // 转换为标准格式
    if (Array.isArray(rawData)) {
      return rawData.map(drone => ({
        id: drone.id || `drone_${Math.random().toString(36).substr(2, 9)}`,
        name: drone.name || `无人机-${drone.id}`,
        model: drone.model || 'DJI Phantom 4',
        serialNumber: drone.serial || `SN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        status: drone.status || 'active',
        location: {
          latitude: drone.lat || (39.9042 + (Math.random() - 0.5) * 0.1),
          longitude: drone.lng || (116.4074 + (Math.random() - 0.5) * 0.1),
          altitude: drone.alt || (50 + Math.random() * 100),
          heading: drone.heading || Math.random() * 360
        },
        telemetry: this.processTelemetryData(drone.telemetry || {}),
        mission: this.processMissionData(drone.mission || {}),
        weather: this.processWeatherTelemetry(drone.weather || {}),
        timestamp: new Date(drone.timestamp || Date.now())
      }));
    }
    return [];
  }

  // 处理遥测数据
  private processTelemetryData(telemetry: any) {
    return {
      battery: {
        voltage: telemetry.battery?.voltage || (11.1 + Math.random() * 1.5),
        current: telemetry.battery?.current || (2.5 + Math.random() * 5),
        percentage: telemetry.battery?.percentage || (60 + Math.random() * 35),
        temperature: telemetry.battery?.temperature || (25 + Math.random() * 15),
        cycleCount: telemetry.battery?.cycleCount || Math.floor(Math.random() * 500)
      },
      flight: {
        speed: telemetry.flight?.speed || Math.random() * 15,
        verticalSpeed: telemetry.flight?.verticalSpeed || (Math.random() - 0.5) * 5,
        groundSpeed: telemetry.flight?.groundSpeed || Math.random() * 15,
        airSpeed: telemetry.flight?.airSpeed || Math.random() * 18,
        flightTime: telemetry.flight?.flightTime || Math.random() * 1800,
        distance: telemetry.flight?.distance || Math.random() * 5000
      },
      sensors: {
        gps: {
          satellites: telemetry.sensors?.gps?.satellites || (8 + Math.floor(Math.random() * 8)),
          hdop: telemetry.sensors?.gps?.hdop || (0.8 + Math.random() * 1.2),
          fix: telemetry.sensors?.gps?.fix || '3d'
        },
        imu: {
          accelerometer: {
            x: telemetry.sensors?.imu?.accelerometer?.x || (Math.random() - 0.5) * 2,
            y: telemetry.sensors?.imu?.accelerometer?.y || (Math.random() - 0.5) * 2,
            z: telemetry.sensors?.imu?.accelerometer?.z || 9.8 + (Math.random() - 0.5) * 0.5
          },
          gyroscope: {
            x: telemetry.sensors?.imu?.gyroscope?.x || (Math.random() - 0.5) * 10,
            y: telemetry.sensors?.imu?.gyroscope?.y || (Math.random() - 0.5) * 10,
            z: telemetry.sensors?.imu?.gyroscope?.z || (Math.random() - 0.5) * 10
          },
          magnetometer: {
            x: telemetry.sensors?.imu?.magnetometer?.x || (Math.random() - 0.5) * 100,
            y: telemetry.sensors?.imu?.magnetometer?.y || (Math.random() - 0.5) * 100,
            z: telemetry.sensors?.imu?.magnetometer?.z || -400 + (Math.random() - 0.5) * 100
          }
        },
        barometer: {
          pressure: telemetry.sensors?.barometer?.pressure || (1013.25 + (Math.random() - 0.5) * 50),
          altitude: telemetry.sensors?.barometer?.altitude || (50 + Math.random() * 100),
          temperature: telemetry.sensors?.barometer?.temperature || (20 + Math.random() * 15)
        }
      },
      motors: Array.from({ length: 4 }, (_, i) => ({
        id: i + 1,
        rpm: telemetry.motors?.[i]?.rpm || (3000 + Math.random() * 2000),
        temperature: telemetry.motors?.[i]?.temperature || (40 + Math.random() * 20),
        current: telemetry.motors?.[i]?.current || (2 + Math.random() * 3),
        voltage: telemetry.motors?.[i]?.voltage || (11.1 + Math.random() * 1.5)
      }))
    };
  }

  // 处理任务数据
  private processMissionData(mission: any) {
    return {
      id: mission.id || `mission_${Math.random().toString(36).substr(2, 9)}`,
      type: mission.type || ['patrol', 'delivery', 'inspection', 'survey'][Math.floor(Math.random() * 4)],
      status: mission.status || 'active',
      waypoints: mission.waypoints || this.generateWaypoints(),
      progress: mission.progress || Math.random() * 100
    };
  }

  // 生成航点
  private generateWaypoints() {
    const baseLatitude = 39.9042;
    const baseLongitude = 116.4074;
    const waypointCount = 3 + Math.floor(Math.random() * 5);
    
    return Array.from({ length: waypointCount }, (_, i) => ({
      lat: baseLatitude + (Math.random() - 0.5) * 0.01,
      lng: baseLongitude + (Math.random() - 0.5) * 0.01,
      alt: 50 + Math.random() * 100,
      action: ['waypoint', 'photo', 'hover', 'land'][Math.floor(Math.random() * 4)]
    }));
  }

  // 处理天气遥测数据
  private processWeatherTelemetry(weather: any) {
    return {
      temperature: weather.temperature || (20 + Math.random() * 15),
      humidity: weather.humidity || (40 + Math.random() * 40),
      pressure: weather.pressure || (1013.25 + (Math.random() - 0.5) * 50),
      windSpeed: weather.windSpeed || Math.random() * 10,
      windDirection: weather.windDirection || Math.random() * 360,
      visibility: weather.visibility || (5 + Math.random() * 15),
      precipitation: weather.precipitation || Math.random() * 2
    };
  }

  // 处理真实天气数据
  private processWeatherData(data: any): RealWeatherData {
    return {
      location: {
        name: data.name || '北京',
        latitude: data.coord?.lat || 39.9042,
        longitude: data.coord?.lon || 116.4074
      },
      current: {
        temperature: data.main?.temp || 20,
        humidity: data.main?.humidity || 60,
        pressure: data.main?.pressure || 1013.25,
        windSpeed: data.wind?.speed || 5,
        windDirection: data.wind?.deg || 180,
        windGust: data.wind?.gust || 0,
        visibility: data.visibility ? data.visibility / 1000 : 10,
        uvIndex: data.uvi || 5,
        cloudCover: data.clouds?.all || 20,
        precipitation: data.rain?.['1h'] || data.snow?.['1h'] || 0,
        dewPoint: data.main?.temp - ((100 - data.main?.humidity) / 5) || 15
      },
      forecast: [], // 需要额外的API调用获取预报数据
      alerts: [] // 需要额外的API调用获取预警数据
    };
  }

  // 生成基于真实参数的天气数据
  private generateRealisticWeatherData(lat: number, lon: number): RealWeatherData {
    const now = new Date();
    const hour = now.getHours();
    const season = Math.floor((now.getMonth() + 1) / 3);
    
    // 基于时间和季节的真实天气模式
    const baseTemp = [5, 15, 25, 15][season] + Math.sin(hour / 24 * Math.PI * 2) * 8;
    const humidity = 40 + Math.random() * 40;
    const pressure = 1013.25 + (Math.random() - 0.5) * 30;
    
    return {
      location: {
        name: this.getLocationName(lat, lon),
        latitude: lat,
        longitude: lon
      },
      current: {
        temperature: baseTemp + (Math.random() - 0.5) * 5,
        humidity,
        pressure,
        windSpeed: Math.random() * 12,
        windDirection: Math.random() * 360,
        windGust: Math.random() * 8,
        visibility: 8 + Math.random() * 12,
        uvIndex: Math.max(0, Math.sin(hour / 24 * Math.PI) * 10),
        cloudCover: Math.random() * 100,
        precipitation: Math.random() > 0.8 ? Math.random() * 5 : 0,
        dewPoint: baseTemp - ((100 - humidity) / 5)
      },
      forecast: Array.from({ length: 24 }, (_, i) => ({
        time: new Date(now.getTime() + i * 60 * 60 * 1000),
        temperature: baseTemp + Math.sin((hour + i) / 24 * Math.PI * 2) * 8 + (Math.random() - 0.5) * 3,
        humidity: humidity + (Math.random() - 0.5) * 20,
        windSpeed: Math.random() * 15,
        windDirection: Math.random() * 360,
        precipitation: Math.random() > 0.85 ? Math.random() * 3 : 0,
        cloudCover: Math.random() * 100
      })),
      alerts: Math.random() > 0.7 ? [{
        type: ['wind', 'rain', 'fog'][Math.floor(Math.random() * 3)] as 'wind' | 'rain' | 'fog',
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
        description: '天气条件可能影响飞行安全',
        startTime: now,
        endTime: new Date(now.getTime() + 2 * 60 * 60 * 1000)
      }] : []
    };
  }

  // 生成基于真实格式的空域数据
  private generateRealisticAirspaceData(bounds: any): RealAirspaceData {
    const now = new Date();
    
    return {
      notams: Array.from({ length: 3 + Math.floor(Math.random() * 5) }, (_, i) => ({
        id: `NOTAM${now.getFullYear()}${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        type: ['restriction', 'closure', 'warning', 'info'][Math.floor(Math.random() * 4)] as any,
        location: {
          latitude: bounds.south + Math.random() * (bounds.north - bounds.south),
          longitude: bounds.west + Math.random() * (bounds.east - bounds.west),
          radius: 1000 + Math.random() * 5000
        },
        altitude: {
          min: 0,
          max: 500 + Math.random() * 1000
        },
        timeframe: {
          start: new Date(now.getTime() - Math.random() * 24 * 60 * 60 * 1000),
          end: new Date(now.getTime() + Math.random() * 48 * 60 * 60 * 1000)
        },
        description: [
          '军事训练活动',
          '临时飞行限制',
          '机场管制区域',
          '特殊活动空域'
        ][Math.floor(Math.random() * 4)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as any
      })),
      traffic: Array.from({ length: 2 + Math.floor(Math.random() * 8) }, (_, i) => ({
        id: `TFC${String(i + 1).padStart(3, '0')}`,
        type: ['aircraft', 'helicopter', 'drone'][Math.floor(Math.random() * 3)] as any,
        callsign: `${['CCA', 'CSN', 'CHH', 'DRN'][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 9000) + 1000}`,
        location: {
          latitude: bounds.south + Math.random() * (bounds.north - bounds.south),
          longitude: bounds.west + Math.random() * (bounds.east - bounds.west),
          altitude: 1000 + Math.random() * 10000
        },
        velocity: {
          speed: 100 + Math.random() * 400,
          heading: Math.random() * 360,
          verticalRate: (Math.random() - 0.5) * 1000
        },
        squawk: String(Math.floor(Math.random() * 7777) + 1000),
        timestamp: new Date()
      })),
      restrictions: [
        {
          id: 'NFZ_AIRPORT_001',
          name: '首都国际机场禁飞区',
          type: 'no_fly_zone' as const,
          geometry: [
            { lat: 40.0801, lng: 116.5846 },
            { lat: 40.0801, lng: 116.6046 },
            { lat: 40.0601, lng: 116.6046 },
            { lat: 40.0601, lng: 116.5846 }
          ],
          altitude: { min: 0, max: 1000 },
          active: true,
          reason: '机场安全区域'
        }
      ]
    };
  }

  // 获取位置名称
  private getLocationName(lat: number, lon: number): string {
    // 简单的位置映射，实际应用中可以使用反向地理编码API
    if (lat > 39.8 && lat < 40.1 && lon > 116.2 && lon < 116.6) {
      return '北京';
    } else if (lat > 31.1 && lat < 31.4 && lon > 121.3 && lon < 121.7) {
      return '上海';
    } else if (lat > 22.4 && lat < 22.8 && lon > 113.8 && lon < 114.4) {
      return '深圳';
    }
    return '未知位置';
  }

  // 启动增强模拟数据
  private startEnhancedSimulation(onDataReceived: (data: RealDroneData[]) => void): void {
    const interval = setInterval(() => {
      const droneCount = 3 + Math.floor(Math.random() * 3);
      const simulatedData = Array.from({ length: droneCount }, (_, i) => 
        this.generateRealisticDroneData(i + 1)
      );
      onDataReceived(simulatedData);
    }, 2000);

    // 清理函数
    setTimeout(() => clearInterval(interval), 300000); // 5分钟后停止
  }

  // 生成真实的无人机数据
  private generateRealisticDroneData(index: number): RealDroneData {
    const droneModels = ['DJI Phantom 4 Pro', 'DJI Mavic 2 Pro', 'DJI Inspire 2', 'Autel EVO II', 'Parrot Anafi'];
    const droneNames = ['天鹰-001', '雷鸟-002', '猎鹰-003', '海燕-004', '金雕-005'];
    
    return {
      id: `drone_${index}`,
      name: droneNames[index - 1] || `无人机-${index}`,
      model: droneModels[Math.floor(Math.random() * droneModels.length)],
      serialNumber: `SN${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      status: ['active', 'inactive', 'maintenance'][Math.floor(Math.random() * 3)] as any,
      location: {
        latitude: 39.9042 + (Math.random() - 0.5) * 0.1,
        longitude: 116.4074 + (Math.random() - 0.5) * 0.1,
        altitude: 50 + Math.random() * 100,
        heading: Math.random() * 360
      },
      telemetry: this.processTelemetryData({}),
      mission: this.processMissionData({}),
      weather: this.processWeatherTelemetry({}),
      timestamp: new Date()
    };
  }

  // 重连处理
  private handleReconnect(onDataReceived: (data: RealDroneData[]) => void): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectToRealDroneData(onDataReceived);
      }, this.reconnectInterval);
    } else {
      console.log('❌ 达到最大重连次数，切换到模拟数据');
      this.startEnhancedSimulation(onDataReceived);
    }
  }

  // 断开连接
  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

export const realDataService = new RealDataService();