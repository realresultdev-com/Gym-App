import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface DailyChallengeCardProps {
  onPress?: () => void;
}

export function DailyChallengeCard({ onPress }: DailyChallengeCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="mx-5 my-3 rounded-3xl bg-gym-lime p-5 relative overflow-hidden shadow-lg shadow-lime-500/20"
      style={{ backgroundColor: '#bbf451' }}
    >
      {/* Top Bookmark Icon */}
      <View className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 items-center justify-center">
        <Text className="text-black text-sm">🔖</Text>
      </View>

      <View className="max-w-[65%]">
        <Text className="text-black text-2xl font-black tracking-tight leading-7">
          Daily{'\n'}Challenge
        </Text>
        <Text className="text-neutral-900 text-xs font-semibold mt-2 mb-4">
          Do your plan before 09:00 AM
        </Text>

        {/* Stacked Avatars */}
        <View className="flex-row items-center">
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100' }}
            className="w-7 h-7 rounded-full border-2 border-white -mr-2"
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100' }}
            className="w-7 h-7 rounded-full border-2 border-white -mr-2"
          />
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100' }}
            className="w-7 h-7 rounded-full border-2 border-white -mr-2"
          />
          <View className="w-7 h-7 rounded-full bg-black/75 items-center justify-center border-2 border-white">
            <Text className="text-white text-[10px] font-bold">+4</Text>
          </View>
        </View>
      </View>

      {/* Fitness Athlete Image on Right */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400' }}
        className="absolute -right-4 -bottom-6 w-36 h-44 rounded-2xl opacity-95"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}

