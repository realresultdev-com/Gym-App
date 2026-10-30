import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAttendanceStore } from '../store/attendance.store';

const WEEK_DAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

export function PeakHoursTimeline() {
  const [activeDay, setActiveDay] = useState('DO'); // Thursday as in Image 2
  const liveOccupancy = useAttendanceStore((s) => s.liveOccupancy);

  return (
    <View className="mx-5 my-2 p-4 rounded-3xl bg-gym-card border border-neutral-800">
      {/* Title */}
      <Text className="text-white text-base font-bold mb-3">Stoßzeiten</Text>

      {/* Week Day Pills */}
      <View className="flex-row items-center justify-between mb-4">
        {WEEK_DAYS.map((day) => {
          const isActive = day === activeDay;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setActiveDay(day)}
              className={`w-9 h-9 rounded-full items-center justify-center ${
                isActive
                  ? 'bg-gym-coral shadow-sm shadow-red-500/30'
                  : 'bg-neutral-900 border border-neutral-800'
              }`}
              style={isActive ? { backgroundColor: '#f43f5e' } : undefined}
            >
              <Text
                className={`text-[11px] font-bold ${
                  isActive ? 'text-white' : 'text-neutral-400'
                }`}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Live Occupancy Status */}
      <View className="flex-row items-center bg-neutral-900/90 px-3 py-2.5 rounded-2xl border border-neutral-800">
        <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
        <Text className="text-neutral-300 text-xs font-semibold flex-1">
          Live: {liveOccupancy.crowding_status}
        </Text>
        <Text className="text-neutral-400 text-xs font-mono">
          {liveOccupancy.active_occupants} / {liveOccupancy.capacity_limit} ({liveOccupancy.occupancy_percentage}%)
        </Text>
      </View>
    </View>
  );
}

