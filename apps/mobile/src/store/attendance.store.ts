import { create } from 'zustand';
import { ApiClient } from '../services/api';

interface AttendanceState {
  isCheckedIn: boolean;
  activeAttendanceId: string | null;
  checkInTime: string | null;
  durationSeconds: number;
  liveOccupancy: {
    active_occupants: number;
    capacity_limit: number;
    occupancy_percentage: number;
    crowding_status: string;
  };
  isLoading: boolean;
  error: string | null;

  fetchLiveOccupancy: () => Promise<void>;
  checkIn: (method?: 'APP_CHECKIN' | 'QR_CODE') => Promise<boolean>;
  checkOut: () => Promise<boolean>;
  incrementDuration: () => void;
}

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  isCheckedIn: false,
  activeAttendanceId: null,
  checkInTime: null,
  durationSeconds: 0,
  liveOccupancy: {
    active_occupants: 14,
    capacity_limit: 120,
    occupancy_percentage: 12,
    crowding_status: 'Nicht zu stark besucht',
  },
  isLoading: false,
  error: null,

  fetchLiveOccupancy: async () => {
    const res = await ApiClient.get('/api/attendance/live-occupancy');
    if (res.success && res.data) {
      set({ liveOccupancy: res.data });
    }
  },

  checkIn: async (method = 'APP_CHECKIN') => {
    set({ isLoading: true, error: null });
    const res = await ApiClient.post('/api/attendance/check-in', { method });
    if (res.success && res.data) {
      set({
        isCheckedIn: true,
        activeAttendanceId: res.data.attendance_id,
        checkInTime: res.data.check_in_time,
        durationSeconds: 0,
        isLoading: false,
      });
      await get().fetchLiveOccupancy();
      return true;
    } else {
      // Local optimistic toggle for testing
      set({
        isCheckedIn: true,
        activeAttendanceId: 'local-att-1',
        checkInTime: new Date().toISOString(),
        durationSeconds: 0,
        isLoading: false,
      });
      return true;
    }
  },

  checkOut: async () => {
    set({ isLoading: true, error: null });
    const res = await ApiClient.post('/api/attendance/check-out', {
      attendance_id: get().activeAttendanceId,
    });
    set({
      isCheckedIn: false,
      activeAttendanceId: null,
      checkInTime: null,
      durationSeconds: 0,
      isLoading: false,
    });
    await get().fetchLiveOccupancy();
    return true;
  },

  incrementDuration: () => {
    if (get().isCheckedIn) {
      set((state) => ({ durationSeconds: state.durationSeconds + 1 }));
    }
  },
}));

