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
  const [selectedDate, setSelectedDate] = useState(25); // Thu 25 selected as in Image 1

  return (
    <View className="px-5 my-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexDirection: 'row', gap: 8 }}
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
                  ? 'bg-gym-lime shadow-md shadow-lime-400/20'
                  : 'bg-gym-card border border-neutral-800'
              }`}
              style={isSelected ? { backgroundColor: '#bbf451' } : undefined}
            >
              <Text
                className={`text-xs font-semibold ${
                  isSelected ? 'text-black' : 'text-neutral-400'
                }`}
              >
                {item.day}
              </Text>
              <Text
                className={`text-sm font-black mt-1 ${
                  isSelected ? 'text-black' : 'text-white'
                }`}
              >
                {item.date}
              </Text>

              {/* Dot indicator */}
              {isSelected && (
                <View className="w-1.5 h-1.5 rounded-full bg-black mt-1" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

