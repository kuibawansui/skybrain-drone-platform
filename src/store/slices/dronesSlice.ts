import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DroneData {
  id: string;
  position: [number, number, number];
  target: [number, number, number];
  status: 'idle' | 'flying' | 'delivering' | 'returning' | 'emergency';
  battery: number;
  payload: number;
  mission?: string;
  lastUpdate: string;
}

interface DronesState {
  fleet: DroneData[];
  totalDrones: number;
  activeDrones: number;
  completedMissions: number;
  successRate: number;
}

const initialState: DronesState = {
  fleet: [],
  totalDrones: 20,
  activeDrones: 18,
  completedMissions: 156,
  successRate: 98.5,
};

const dronesSlice = createSlice({
  name: 'drones',
  initialState,
  reducers: {
    updateDroneData: (state, action: PayloadAction<DroneData>) => {
      const index = state.fleet.findIndex(drone => drone.id === action.payload.id);
      if (index !== -1) {
        state.fleet[index] = action.payload;
      } else {
        state.fleet.push(action.payload);
      }
    },
    updateDroneStatus: (state, action: PayloadAction<{ id: string; status: DroneData['status'] }>) => {
      const drone = state.fleet.find(d => d.id === action.payload.id);
      if (drone) {
        drone.status = action.payload.status;
        drone.lastUpdate = new Date().toISOString();
      }
    },
    updateDroneBattery: (state, action: PayloadAction<{ id: string; battery: number }>) => {
      const drone = state.fleet.find(d => d.id === action.payload.id);
      if (drone) {
        drone.battery = action.payload.battery;
        drone.lastUpdate = new Date().toISOString();
      }
    },
    updateDronePosition: (state, action: PayloadAction<{ id: string; position: [number, number, number] }>) => {
      const drone = state.fleet.find(d => d.id === action.payload.id);
      if (drone) {
        drone.position = action.payload.position;
        drone.lastUpdate = new Date().toISOString();
      }
    },
    setFleetStats: (state, action: PayloadAction<Partial<Pick<DronesState, 'totalDrones' | 'activeDrones' | 'completedMissions' | 'successRate'>>>) => {
      Object.assign(state, action.payload);
    },
    removeDrone: (state, action: PayloadAction<string>) => {
      state.fleet = state.fleet.filter(drone => drone.id !== action.payload);
    },
    clearFleet: (state) => {
      state.fleet = [];
    },
  },
});

export const {
  updateDroneData,
  updateDroneStatus,
  updateDroneBattery,
  updateDronePosition,
  setFleetStats,
  removeDrone,
  clearFleet,
} = dronesSlice.actions;

export default dronesSlice.reducer;