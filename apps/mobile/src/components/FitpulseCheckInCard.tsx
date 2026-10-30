import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAttendanceStore } from '../store/attendance.store';

interface FitpulseCheckInCardProps {
  onOpenQRScanner?: () => void;
}

export function FitpulseCheckInCard({ onOpenQRScanner }: FitpulseCheckInCardProps) {
  const { isCheckedIn, checkIn, checkOut, durationSeconds, isLoading } = useAttendanceStore();

  const handleAction = () => {
    if (isCheckedIn) {
      checkOut();
    } else {
      if (onOpenQRScanner) {
        onOpenQRScanner();
      } else {
        checkIn('APP_CHECKIN');
      }
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <View
      className="mx-5 my-3 rounded-3xl p-5 shadow-xl shadow-red-500/20 relative overflow-hidden"
      style={{ backgroundColor: isCheckedIn ? '#1c1c1e' : '#f43f5e' }}
    >
      {/* Background Decor */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="w-10 h-10 rounded-2xl bg-white/20 items-center justify-center">
          <Text className="text-white text-lg">📱</Text>
        </View>

        {isCheckedIn && (
          <View className="flex-row items-center px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500">
            <View className="w-2 h-2 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
            <Text className="text-emerald-300 text-xs font-bold">Session Active</Text>
          </View>
        )}
      </View>

      <Text className="text-white text-2xl font-black tracking-tight">
        {isCheckedIn ? 'Checked In' : 'Check-In'}
      </Text>
      <Text className="text-white/80 text-xs font-medium mt-1 mb-5">
        {isCheckedIn
          ? `Workout duration: ${formatDuration(durationSeconds)}`
          : 'Schnell einchecken und Training starten'}
      </Text>

      {/* Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleAction}
        disabled={isLoading}
        className={`w-full py-3.5 rounded-2xl items-center justify-center ${
          isCheckedIn ? 'bg-red-600' : 'bg-white shadow-md'
        }`}
      >
        <Text
          className={`text-sm font-black ${
            isCheckedIn ? 'text-white' : 'text-neutral-900'
          }`}
        >
          {isLoading
            ? 'Processing...'
            : isCheckedIn
            ? 'Session Beenden / Check-Out'
            : 'QR Check-In öffnen'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

