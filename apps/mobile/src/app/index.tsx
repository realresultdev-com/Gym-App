import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import { MemberDashboardScreen } from '../screens/MemberDashboardScreen';
import { ExerciseTrackerView } from '../components/ExerciseTrackerView';
import { FitpulseCheckInCard } from '../components/FitpulseCheckInCard';
import { PeakHoursTimeline } from '../components/PeakHoursTimeline';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { TrainerDashboardView } from '../components/TrainerDashboardView';
import { RoleSwitcherModal } from '../screens/RoleSwitcherModal';
import { Header } from '../components/Header';

export default function AppMain() {
  const { role, initAuth, isLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'home' | 'workout' | 'attendance'>('home');
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content Rendered by Role */}
      <View className="flex-1 bg-white">
        {role === 'ADMIN' ? (
          <View className="flex-1 bg-white">
            <Header
              onPressRoleSwitch={() => setRoleModalVisible(true)}
              onPressNotification={() => {}}
            />
            <AdminDashboardView />
          </View>
        ) : role === 'TRAINER' ? (
          <View className="flex-1 bg-white">
            <Header
              onPressRoleSwitch={() => setRoleModalVisible(true)}
              onPressNotification={() => {}}
            />
            <TrainerDashboardView />
          </View>
        ) : (
          /* MEMBER ROLE */
          <View className="flex-1 bg-white">
            {activeTab === 'home' && (
              <MemberDashboardScreen
                onOpenWorkout={() => setActiveTab('workout')}
                onOpenRoleSwitch={() => setRoleModalVisible(true)}
              />
            )}

            {activeTab === 'workout' && (
              <View className="flex-1 bg-white">
                <Header
                  onPressRoleSwitch={() => setRoleModalVisible(true)}
                  onPressNotification={() => {}}
                />
                <ExerciseTrackerView />
              </View>
            )}

            {activeTab === 'attendance' && (
              <View className="flex-1 bg-white">
                <Header
                  onPressRoleSwitch={() => setRoleModalVisible(true)}
                  onPressNotification={() => {}}
                />
                <View className="p-4 bg-white flex-1">
                  <Text className="text-slate-900 text-xl font-black mb-2">Studio Check-In</Text>
                  <FitpulseCheckInCard />
                  <PeakHoursTimeline />
                </View>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Clean White Bottom Navigation Bar */}
      <View className="bg-white/95 border-t border-slate-200 px-6 py-2.5 flex-row items-center justify-around shadow-sm">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-2xl flex-row items-center space-x-1.5 gap-1.5 ${
            activeTab === 'home' ? 'bg-slate-900 shadow-sm' : ''
          }`}
        >
          <Text className={`text-base ${activeTab === 'home' ? 'text-white' : 'text-slate-400'}`}>
            🏠
          </Text>
          {activeTab === 'home' && (
            <Text className="text-white font-black text-xs">Home</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('workout')}
          className={`px-4 py-2 rounded-2xl flex-row items-center space-x-1.5 gap-1.5 ${
            activeTab === 'workout' ? 'bg-slate-900 shadow-sm' : ''
          }`}
        >
          <Text className={`text-base ${activeTab === 'workout' ? 'text-white' : 'text-slate-400'}`}>
            🏋️
          </Text>
          {activeTab === 'workout' && (
            <Text className="text-white font-black text-xs">Workout</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveTab('attendance')}
          className={`px-4 py-2 rounded-2xl flex-row items-center space-x-1.5 gap-1.5 ${
            activeTab === 'attendance' ? 'bg-red-500 shadow-sm' : ''
          }`}
        >
          <Text className={`text-base ${activeTab === 'attendance' ? 'text-white' : 'text-slate-400'}`}>
            📱
          </Text>
          {activeTab === 'attendance' && (
            <Text className="text-white font-black text-xs">Check-In</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setRoleModalVisible(true)}
          className="px-3 py-2 rounded-2xl items-center"
        >
          <Text className="text-slate-400 text-base">👤</Text>
        </TouchableOpacity>
      </View>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
      />
    </SafeAreaView>
  );
}
