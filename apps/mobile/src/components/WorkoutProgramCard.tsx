import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface WorkoutProgramCardProps {
  title: string;
  subtitle: string;
  duration: string;
  repsText: string;
  imageUrl: string;
  onPress?: () => void;
}

export function WorkoutProgramCard({
  title,
  subtitle,
  duration,
  repsText,
  imageUrl,
  onPress,
}: WorkoutProgramCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="w-44 rounded-3xl bg-white p-3 mr-3.5 border border-slate-200 shadow-sm"
    >
      {/* Program Thumbnail */}
      <View className="h-32 w-full rounded-2xl overflow-hidden bg-slate-100 mb-3 relative">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Play Icon Overlay */}
        <View className="absolute inset-0 bg-black/10 items-center justify-center">
          <View className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md items-center justify-center shadow-md">
            <Text className="text-slate-900 text-xs ml-0.5">▶</Text>
          </View>
        </View>
      </View>

      {/* Program Info */}
      <Text className="text-slate-900 font-black text-sm tracking-tight" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-slate-500 text-[11px] font-semibold mt-0.5 mb-2.5" numberOfLines={1}>
        {subtitle}
      </Text>

      {/* Badges */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
          <Text className="text-slate-700 text-[10px] font-bold">⏱ {duration}</Text>
        </View>
        <View className="flex-row items-center bg-slate-100 px-2 py-1 rounded-lg border border-slate-200">
          <Text className="text-slate-700 text-[10px] font-bold">{repsText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
