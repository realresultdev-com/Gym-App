import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../store/auth.store';

interface HeaderProps {
  onPressProfile?: () => void;
  onPressNotification?: () => void;
  onPressRoleSwitch?: () => void;
}

export function Header({ onPressProfile, onPressNotification, onPressRoleSwitch }: HeaderProps) {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <View className="flex-row items-center justify-between px-5 pt-3 pb-2 bg-gym-bg">
      <View className="flex-row items-center space-x-3 gap-3">
        {/* Profile Avatar */}
        <TouchableOpacity onPress={onPressProfile} activeOpacity={0.8}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            }}
            className="w-11 h-11 rounded-full border border-neutral-700 bg-neutral-800"
          />
        </TouchableOpacity>

        {/* User Greeting */}
        <View>
          <Text className="text-white text-base font-bold">
            Hello, {user?.first_name || 'Martin'}
          </Text>
          <Text className="text-neutral-400 text-xs font-medium">
            Today {formattedDate}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-2 gap-2">
        {/* Role Badge / Switcher */}
        <TouchableOpacity
          onPress={onPressRoleSwitch}
          activeOpacity={0.7}
          className={`px-2.5 py-1 rounded-full border ${
            role === 'ADMIN'
              ? 'bg-purple-950/60 border-purple-600'
              : role === 'TRAINER'
              ? 'bg-blue-950/60 border-blue-600'
              : 'bg-lime-950/60 border-gym-lime'
          }`}
        >
          <Text
            className={`text-xs font-bold ${
              role === 'ADMIN'
                ? 'text-purple-400'
                : role === 'TRAINER'
                ? 'text-blue-400'
                : 'text-gym-lime'
            }`}
          >
            {role || 'MEMBER'}
          </Text>
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onPressNotification}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 items-center justify-center relative"
        >
          <Text className="text-white text-base">🔔</Text>
          <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-gym-lime" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

