import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAttendanceStore } from '../store/attendance.store';

const WEEK_DAYS = ['MO', 'DI', 'MI', 'DO', 'FR', 'SA', 'SO'];

export function PeakHoursTimeline() {
  const [activeDay, setActiveDay] = useState('DO'); // Thursday
  const liveOccupancy = useAttendanceStore((s) => s.liveOccupancy);

  return (
    <View className="mx-5 my-2 p-4 rounded-3xl bg-white border border-slate-200 shadow-sm">
      {/* Title */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-slate-900 text-base font-black">Stoßzeiten</Text>
        <Text className="text-slate-400 text-xs font-semibold">Peak Hours</Text>
      </View>

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
                  ? 'bg-slate-900 shadow-sm'
                  : 'bg-slate-100 border border-slate-200'
              }`}
            >
              <Text
                className={`text-[11px] font-black ${
                  isActive ? 'text-white' : 'text-slate-600'
                }`}
              >
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Live Occupancy Status */}
      <View className="flex-row items-center bg-slate-50 px-3 py-2.5 rounded-2xl border border-slate-200">
        <View className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-2" />
        <Text className="text-slate-800 text-xs font-bold flex-1">
          Live: {liveOccupancy.crowding_status}
        </Text>
        <Text className="text-slate-500 text-xs font-mono font-bold">
          {liveOccupancy.active_occupants} / {liveOccupancy.capacity_limit} ({liveOccupancy.occupancy_percentage}%)
        </Text>
      </View>
    </View>
  );
}
