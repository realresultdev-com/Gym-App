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
      className="mx-5 my-3 rounded-3xl p-5 relative overflow-hidden shadow-lg shadow-amber-500/20"
      style={{ backgroundColor: '#fbbf24' }}
    >
      {/* Top Bookmark / Category Tag */}
      <View className="flex-row items-center justify-between mb-2">
        <View className="bg-black/80 px-3 py-1 rounded-full">
          <Text className="text-white text-[11px] font-black uppercase tracking-wider">Today</Text>
        </View>
        <View className="w-8 h-8 rounded-full bg-black/10 items-center justify-center">
          <Text className="text-black text-sm">🔖</Text>
        </View>
      </View>

      <View className="max-w-[65%] mt-1">
        <Text className="text-black text-2xl font-black tracking-tight leading-7">
          Full Body{'\n'}Challenge
        </Text>
        <Text className="text-neutral-900 text-xs font-bold mt-1.5 mb-4">
          Complete daily program • 35 min
        </Text>

        {/* Stacked Member Avatars */}
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
          <View className="w-7 h-7 rounded-full bg-black/80 items-center justify-center border-2 border-white">
            <Text className="text-white text-[10px] font-bold">+12</Text>
          </View>
        </View>
      </View>

      {/* Fitness Athlete Image on Right */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400' }}
        className="absolute -right-3 -bottom-5 w-36 h-44 rounded-2xl"
        resizeMode="cover"
      />
    </TouchableOpacity>
  );
}
