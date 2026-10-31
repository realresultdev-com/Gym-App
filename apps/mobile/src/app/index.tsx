import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../store/auth.store';
import { MemberDashboardScreen } from '../screens/MemberDashboardScreen';
import { WorkoutsScreen, type WorkoutItem } from '../screens/WorkoutsScreen';
import { ExerciseTrackerView } from '../components/ExerciseTrackerView';
import { AdminDashboardView } from '../components/AdminDashboardView';
import { TrainerDashboardView } from '../components/TrainerDashboardView';
import { PartnerOnboardingScreen } from '../screens/PartnerOnboardingScreen';
import { RoleSwitcherModal } from '../screens/RoleSwitcherModal';
import { Header } from '../components/Header';

export default function AppMain() {
  const { role, initAuth, switchDemoRole } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'today' | 'workout' | 'progress' | 'history' | 'profile'>('workout');
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutItem | null>(null);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [showPartnerWelcome, setShowPartnerWelcome] = useState(false);

  useEffect(() => {
    initAuth();
  }, []);

  if (showPartnerWelcome) {
    return (
      <PartnerOnboardingScreen
        onContinue={() => {
          setShowPartnerWelcome(false);
          switchDemoRole('ADMIN');
        }}
        onSwitchToMember={() => setShowPartnerWelcome(false)}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Main Content Area */}
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
            {/* 1. TODAY TAB */}
            {activeTab === 'today' && (
              <MemberDashboardScreen
                onOpenWorkout={() => {
                  setActiveTab('workout');
                  setSelectedWorkout(null);
                }}
                onOpenRoleSwitch={() => setRoleModalVisible(true)}
              />
            )}

            {/* 2. WORKOUTS TAB - EXACT SCREEN FROM REFERENCE IMAGE */}
            {activeTab === 'workout' && (
              <View className="flex-1 bg-white">
                {selectedWorkout ? (
                  <View className="flex-1 bg-white">
                    {/* Sub-header to navigate back to Workouts list */}
                    <View className="px-5 py-3 border-b border-slate-100 flex-row items-center bg-white">
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedWorkout(null)}
                        className="flex-row items-center space-x-2 gap-2 py-1"
                      >
                        <Ionicons name="chevron-back" size={20} color="#0F172A" />
                        <Text className="text-slate-900 font-bold text-sm">Workouts</Text>
                      </TouchableOpacity>
                    </View>
                    <ExerciseTrackerView />
                  </View>
                ) : (
                  <WorkoutsScreen
                    onSelectWorkout={(workout) => setSelectedWorkout(workout)}
                    onOpenPartnerOnboarding={() => setShowPartnerWelcome(true)}
                  />
                )}
              </View>
            )}

            {/* 3. PROGRESS TAB */}
            {activeTab === 'progress' && (
              <ScrollView className="flex-1 bg-[#FBFBFC]" showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-4 pb-2">
                  <Text className="text-slate-900 text-3xl font-black tracking-tight">Progress</Text>
                  <Text className="text-slate-500 text-xs font-semibold mt-1">
                    Your personal records & weekly training volume
                  </Text>
                </View>

                {/* Summary Stat Cards */}
                <View className="px-5 py-3 grid grid-cols-2 flex-row space-x-3 gap-3">
                  <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                    <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Workouts</Text>
                    <Text className="text-slate-900 text-2xl font-black mt-1">18</Text>
                    <Text className="text-emerald-500 text-[11px] font-bold mt-1">↑ 12% this week</Text>
                  </View>
                  <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
                    <Text className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Active Burn</Text>
                    <Text className="text-slate-900 text-2xl font-black mt-1">4,820</Text>
                    <Text className="text-[#FF5A36] text-[11px] font-bold mt-1">KCAL</Text>
                  </View>
                </View>

                {/* Strength PRs */}
                <View className="px-5 pt-3">
                  <Text className="text-slate-900 font-black text-base mb-3">Strength Milestones</Text>
                  <View className="bg-white rounded-2xl p-4 border border-slate-100 space-y-3 gap-3 shadow-2xs">
                    <View className="flex-row items-center justify-between py-1">
                      <View>
                        <Text className="text-slate-900 font-bold text-sm">Push-Up Maximum</Text>
                        <Text className="text-slate-400 text-xs font-medium">Chest & Triceps</Text>
                      </View>
                      <Text className="text-[#FF5A36] font-black text-base">28 Reps</Text>
                    </View>
                    <View className="h-px bg-slate-100" />
                    <View className="flex-row items-center justify-between py-1">
                      <View>
                        <Text className="text-slate-900 font-bold text-sm">Leg Press</Text>
                        <Text className="text-slate-400 text-xs font-medium">Quads & Glutes</Text>
                      </View>
                      <Text className="text-[#FF5A36] font-black text-base">140 KG</Text>
                    </View>
                    <View className="h-px bg-slate-100" />
                    <View className="flex-row items-center justify-between py-1">
                      <View>
                        <Text className="text-slate-900 font-bold text-sm">Forearm Plank Hold</Text>
                        <Text className="text-slate-400 text-xs font-medium">Core Endurance</Text>
                      </View>
                      <Text className="text-[#FF5A36] font-black text-base">75 SEC</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* 4. HISTORY TAB */}
            {activeTab === 'history' && (
              <ScrollView className="flex-1 bg-[#FBFBFC]" showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-4 pb-2">
                  <Text className="text-slate-900 text-3xl font-black tracking-tight">History</Text>
                  <Text className="text-slate-500 text-xs font-semibold mt-1">
                    Completed workouts & studio check-in sessions
                  </Text>
                </View>

                <View className="px-5 py-3 space-y-3 gap-3">
                  <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3 gap-3">
                      <View className="w-10 h-10 rounded-xl bg-[#FF5A36]/10 items-center justify-center">
                        <MaterialCommunityIcons name="dumbbell" size={20} color="#FF5A36" />
                      </View>
                      <View>
                        <Text className="text-slate-900 font-black text-sm">Full Body Power</Text>
                        <Text className="text-slate-400 text-xs">Today, 08:30 AM • 45 min</Text>
                      </View>
                    </View>
                    <Text className="text-emerald-500 font-black text-xs">COMPLETED</Text>
                  </View>

                  <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3 gap-3">
                      <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center">
                        <Ionicons name="location-outline" size={20} color="#2563EB" />
                      </View>
                      <View>
                        <Text className="text-slate-900 font-black text-sm">Studio QR Check-In</Text>
                        <Text className="text-slate-400 text-xs">Yesterday, 07:15 AM • Downtown Gym</Text>
                      </View>
                    </View>
                    <Text className="text-slate-700 font-bold text-xs">VERIFIED</Text>
                  </View>

                  <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs flex-row items-center justify-between">
                    <View className="flex-row items-center space-x-3 gap-3">
                      <View className="w-10 h-10 rounded-xl bg-orange-50 items-center justify-center">
                        <MaterialCommunityIcons name="lightning-bolt" size={20} color="#EA580C" />
                      </View>
                      <View>
                        <Text className="text-slate-900 font-black text-sm">Burn & Sweat HIIT</Text>
                        <Text className="text-slate-400 text-xs">28 Oct, 06:00 PM • 20 min</Text>
                      </View>
                    </View>
                    <Text className="text-emerald-500 font-black text-xs">COMPLETED</Text>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* 5. PROFILE TAB */}
            {activeTab === 'profile' && (
              <ScrollView className="flex-1 bg-[#FBFBFC]" showsVerticalScrollIndicator={false}>
                <View className="px-5 pt-4 pb-2">
                  <Text className="text-slate-900 text-3xl font-black tracking-tight">Profile</Text>
                </View>

                {/* Profile Card */}
                <View className="px-5 py-3">
                  <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs items-center">
                    <View className="w-20 h-20 rounded-full bg-slate-900 items-center justify-center mb-3">
                      <Text className="text-white text-2xl font-black">MV</Text>
                    </View>
                    <Text className="text-slate-900 font-black text-xl">Martin Vance</Text>
                    <Text className="text-slate-400 text-xs font-semibold mb-3">martin.vance@fitpulse.com</Text>

                    <View className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                      <Text className="text-emerald-700 text-xs font-black uppercase tracking-wider">
                        Quarterly Pro Athlete • Active
                      </Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => setRoleModalVisible(true)}
                      className="mt-6 w-full py-3 rounded-2xl bg-slate-900 items-center justify-center"
                    >
                      <Text className="text-white font-black text-xs uppercase tracking-wider">
                        Switch App Role / Mode
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* FitSquare Partner Showcase for Gym Owners */}
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setShowPartnerWelcome(true)}
                    className="mt-4 bg-slate-950 rounded-3xl p-5 border border-slate-800 shadow-md"
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-[#FF5A36] text-[10px] font-black uppercase tracking-wider">
                        PARTNER WITH FIT SQUARE!
                      </Text>
                      <View className="px-2.5 py-0.5 rounded-full bg-[#FF5A36]/20">
                        <Text className="text-[#FF5A36] text-[10px] font-black">Gym Owners</Text>
                      </View>
                    </View>
                    <Text className="text-white text-lg font-black">
                      Run Your Gym. Smarter.
                    </Text>
                    <Text className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">
                      Manage members, track live QR check-ins, withdraw bank payouts, and offer bundled free exercise courses to every member.
                    </Text>
                    <View className="mt-4 py-3 rounded-2xl bg-[#FF5A36] items-center justify-center shadow-md shadow-[#FF5A36]/30">
                      <Text className="text-white font-black text-xs uppercase tracking-wider">
                        Explore Gym Owner Platform
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </View>

      {/* EXACT 5-TAB BOTTOM NAVIGATION BAR FROM REFERENCE SCREENSHOT */}
      <View className="bg-white border-t border-slate-100 px-2 py-2 flex-row items-center justify-around shadow-sm">
        {/* TAB 1: TODAY */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveTab('today');
            setSelectedWorkout(null);
          }}
          className="items-center justify-center py-1 flex-1"
        >
          <Ionicons
            name={activeTab === 'today' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'today' ? '#FF5A36' : '#94A3B8'}
          />
          <Text
            className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
              activeTab === 'today' ? 'text-[#FF5A36]' : 'text-slate-400'
            }`}
          >
            TODAY
          </Text>
        </TouchableOpacity>

        {/* TAB 2: WORKOUTS (ACTIVE) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveTab('workout');
          }}
          className="items-center justify-center py-1 flex-1"
        >
          <MaterialCommunityIcons
            name="dumbbell"
            size={22}
            color={activeTab === 'workout' ? '#FF5A36' : '#94A3B8'}
          />
          <Text
            className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
              activeTab === 'workout' ? 'text-[#FF5A36]' : 'text-slate-400'
            }`}
          >
            WORKOUTS
          </Text>
        </TouchableOpacity>

        {/* TAB 3: PROGRESS */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveTab('progress');
            setSelectedWorkout(null);
          }}
          className="items-center justify-center py-1 flex-1"
        >
          <Ionicons
            name="trending-up-outline"
            size={22}
            color={activeTab === 'progress' ? '#FF5A36' : '#94A3B8'}
          />
          <Text
            className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
              activeTab === 'progress' ? 'text-[#FF5A36]' : 'text-slate-400'
            }`}
          >
            PROGRESS
          </Text>
        </TouchableOpacity>

        {/* TAB 4: HISTORY */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveTab('history');
            setSelectedWorkout(null);
          }}
          className="items-center justify-center py-1 flex-1"
        >
          <MaterialCommunityIcons
            name="history"
            size={22}
            color={activeTab === 'history' ? '#FF5A36' : '#94A3B8'}
          />
          <Text
            className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
              activeTab === 'history' ? 'text-[#FF5A36]' : 'text-slate-400'
            }`}
          >
            HISTORY
          </Text>
        </TouchableOpacity>

        {/* TAB 5: PROFILE */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            setActiveTab('profile');
            setSelectedWorkout(null);
          }}
          className="items-center justify-center py-1 flex-1"
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#FF5A36' : '#94A3B8'}
          />
          <Text
            className={`text-[10px] font-black uppercase tracking-wider mt-1 ${
              activeTab === 'profile' ? 'text-[#FF5A36]' : 'text-slate-400'
            }`}
          >
            PROFILE
          </Text>
        </TouchableOpacity>
      </View>

      {/* Role Switcher Modal */}
      <RoleSwitcherModal
        visible={roleModalVisible}
        onClose={() => setRoleModalVisible(false)}
        onOpenPartnerOnboarding={() => setShowPartnerWelcome(true)}
      />
    </SafeAreaView>
  );
}
