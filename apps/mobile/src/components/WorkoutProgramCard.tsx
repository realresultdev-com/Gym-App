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
      className="w-44 rounded-3xl bg-gym-card p-3 mr-3 border border-neutral-800/80 shadow-md"
    >
      {/* Program Thumbnail */}
      <View className="h-32 w-full rounded-2xl overflow-hidden bg-neutral-900 mb-3 relative">
        <Image
          source={{ uri: imageUrl }}
          className="w-full h-full"
          resizeMode="cover"
        />
        {/* Play Icon Overlay */}
        <View className="absolute inset-0 bg-black/20 items-center justify-center">
          <View className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md items-center justify-center">
            <Text className="text-white text-xs ml-0.5">▶</Text>
          </View>
        </View>
      </View>

      {/* Program Info */}
      <Text className="text-white font-bold text-sm tracking-tight" numberOfLines={1}>
        {title}
      </Text>
      <Text className="text-neutral-400 text-[11px] font-medium mt-0.5 mb-2.5" numberOfLines={1}>
        {subtitle}
      </Text>

      {/* Badges */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
          <Text className="text-neutral-300 text-[10px] font-medium">⏱ {duration}</Text>
        </View>
        <View className="flex-row items-center bg-neutral-900 px-2 py-1 rounded-lg border border-neutral-800">
          <Text className="text-neutral-300 text-[10px] font-medium">{repsText}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

