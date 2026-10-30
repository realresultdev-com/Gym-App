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
    <View className="flex-row items-center justify-between px-5 pt-3 pb-2 bg-white">
      <View className="flex-row items-center space-x-3 gap-3">
        {/* Profile Avatar */}
        <TouchableOpacity onPress={onPressProfile} activeOpacity={0.8}>
          <Image
            source={{
              uri:
                user?.avatar_url ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
            }}
            className="w-11 h-11 rounded-full border border-slate-200 bg-slate-100"
          />
        </TouchableOpacity>

        {/* User Greeting */}
        <View>
          <Text className="text-slate-900 text-base font-black">
            Hello, {user?.first_name || 'Martin'}
          </Text>
          <Text className="text-slate-500 text-xs font-semibold">
            Today {formattedDate}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-2 gap-2">
        {/* Role Badge / Switcher */}
        <TouchableOpacity
          onPress={onPressRoleSwitch}
          activeOpacity={0.7}
          className={`px-3 py-1 rounded-full border ${
            role === 'ADMIN'
              ? 'bg-purple-50 border-purple-200'
              : role === 'TRAINER'
              ? 'bg-blue-50 border-blue-200'
              : 'bg-lime-50 border-lime-300'
          }`}
        >
          <Text
            className={`text-xs font-black ${
              role === 'ADMIN'
                ? 'text-purple-700'
                : role === 'TRAINER'
                ? 'text-blue-700'
                : 'text-lime-700'
            }`}
          >
            {role || 'MEMBER'}
          </Text>
        </TouchableOpacity>

        {/* Notification Bell */}
        <TouchableOpacity
          onPress={onPressNotification}
          activeOpacity={0.7}
          className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 items-center justify-center relative"
        >
          <Text className="text-slate-700 text-base">🔔</Text>
          <View className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-lime-500 ring-2 ring-white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
