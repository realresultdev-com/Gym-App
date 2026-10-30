import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

const DAYS = [
  { day: 'Mon', date: 22 },
  { day: 'Tue', date: 23 },
  { day: 'Wed', date: 24 },
  { day: 'Thu', date: 25 },
  { day: 'Fri', date: 26 },
  { day: 'Sat', date: 27 },
  { day: 'Sun', date: 28 },
];

export function WeekCalendarStrip() {
  const [selectedDate, setSelectedDate] = useState(25); // Thu 25 selected

  return (
    <View className="px-5 my-2">
      {/* 12 Days Streak Card (from Image 1 Right) */}
      <View className="flex-row items-center justify-between p-3.5 mb-2.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm">
        <View className="flex-row items-center space-x-2.5 gap-2.5">
          <View className="w-8 h-8 rounded-full bg-emerald-100 items-center justify-center border border-emerald-300">
            <Text className="text-emerald-700 font-bold text-xs">⚡</Text>
          </View>
          <View>
            <Text className="text-slate-900 text-sm font-black">12 Days Active Streak</Text>
            <Text className="text-slate-500 text-[11px] font-semibold">Keep it up! 3 days to gold badge</Text>
          </View>
        </View>
        <Text className="text-slate-400 font-bold text-sm">›</Text>
      </View>

      {/* Week Day Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 2 }}
      >
        {DAYS.map((item) => {
          const isSelected = item.date === selectedDate;
          return (
            <TouchableOpacity
              key={`${item.day}-${item.date}`}
              activeOpacity={0.8}
              onPress={() => setSelectedDate(item.date)}
              className={`w-12 py-3 rounded-2xl items-center justify-center ${
                isSelected
                  ? 'bg-slate-900 shadow-md shadow-slate-900/20'
                  : 'bg-white border border-slate-200 shadow-sm'
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  isSelected ? 'text-slate-300' : 'text-slate-400'
                }`}
              >
                {item.day}
              </Text>
              <Text
                className={`text-sm font-black mt-1 ${
                  isSelected ? 'text-white' : 'text-slate-800'
                }`}
              >
                {item.date}
              </Text>

              {/* Dot indicator */}
              <View
                className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isSelected ? 'bg-amber-400' : 'bg-transparent'
                }`}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
