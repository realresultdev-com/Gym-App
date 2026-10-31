import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface AdminDashboardViewProps {
  onPreviewExerciseCourse?: () => void;
}

export function AdminDashboardView({ onPreviewExerciseCourse }: AdminDashboardViewProps) {
  const [partnerBalance, setPartnerBalance] = useState(48250);
  const [todayCheckIns, setTodayCheckIns] = useState(86);
  const [isGymOpen, setIsGymOpen] = useState(true);

  const handleWithdraw = () => {
    Alert.alert(
      'Instant Bank Payout',
      `Request withdrawal of ₹${partnerBalance.toLocaleString()} to HDFC Bank (A/C: ••••4921)?\nFunds typically deposit within 2 hours.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw Now',
          onPress: () => {
            Alert.alert('Payout Initiated! 🚀', `₹${partnerBalance.toLocaleString()} is on its way to your verified bank account.`);
            setPartnerBalance(0);
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-[#FBFBFC] px-5 pt-3 pb-12"
      showsVerticalScrollIndicator={false}
    >
      {/* FitSquare Partner Status Banner */}
      <View className="bg-slate-950 rounded-3xl p-5 mb-5 shadow-sm">
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center space-x-2 gap-2">
            <View className="w-8 h-8 rounded-lg bg-[#FF5A36] items-center justify-center">
              <MaterialCommunityIcons name="shield-check" size={18} color="#FFFFFF" />
            </View>
            <View>
              <Text className="text-white font-black text-sm tracking-wide">
                REAL FIT PARTNER
              </Text>
              <Text className="text-white/60 text-[10px] font-semibold">
                ID: RF-BLR-0042 • Elite Tier
              </Text>
            </View>
          </View>

          {/* Live Open/Closed Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setIsGymOpen(!isGymOpen)}
            className={`px-3 py-1 rounded-full ${
              isGymOpen ? 'bg-emerald-500/20 border border-emerald-400' : 'bg-rose-500/20 border border-rose-400'
            }`}
          >
            <Text className={`text-[11px] font-black ${isGymOpen ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isGymOpen ? '● STUDIO OPEN' : '○ TEMPORARY CLOSED'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-white/90 text-xl font-black">
          FitPulse Elite Athletic Studio
        </Text>
        <Text className="text-white/60 text-xs font-medium mt-0.5">
          Indiranagar 100ft Rd, Bengaluru • Hours: 06:00 AM – 10:00 PM
        </Text>
      </View>

      {/* Free Exercise Course Value Add for Gym Owners */}
      <View className="bg-[#FFF6F4] border border-[#FF5A36]/30 rounded-3xl p-5 mb-5 shadow-xs">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 mr-3">
            <View className="flex-row items-center space-x-1.5 gap-1.5 mb-1">
              <Text className="text-[11px] font-black text-[#FF5A36] uppercase tracking-wider">
                🎁 Free Course Included With Management
              </Text>
            </View>
            <Text className="text-slate-900 font-black text-base">
              10 Foundational Movement Guides
            </Text>
            <Text className="text-slate-600 text-xs font-medium leading-relaxed mt-1">
              All 142 of your registered gym members receive our step-by-step Push-Up, Shoulder Press, Lat Pulldown & Plank animated courses completely free.
            </Text>
          </View>
          <View className="w-12 h-12 rounded-2xl bg-[#FF5A36] items-center justify-center shrink-0 shadow-md shadow-[#FF5A36]/30">
            <MaterialCommunityIcons name="dumbbell" size={24} color="#FFFFFF" />
          </View>
        </View>

        {onPreviewExerciseCourse && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPreviewExerciseCourse}
            className="mt-3 py-2.5 px-4 rounded-xl bg-[#FF5A36] flex-row items-center justify-center space-x-1.5 gap-1.5"
          >
            <Text className="text-white font-black text-xs uppercase tracking-wider">
              Preview Exercise Course
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </View>

      {/* FitSquare Partner Payouts & Earnings Card */}
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs mb-5">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-slate-400 text-xs font-black uppercase tracking-wider">
            Partner Payout Balance
          </Text>
          <View className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
            <Text className="text-emerald-700 text-[10px] font-black">₹0 Platform Fees</Text>
          </View>
        </View>

        <Text className="text-slate-900 text-3xl font-black">
          ₹{partnerBalance.toLocaleString()}
        </Text>
        <Text className="text-slate-400 text-xs font-medium mt-1">
          Settlement linked to HDFC Bank (A/C ••••4921)
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={handleWithdraw}
          disabled={partnerBalance === 0}
          className={`mt-4 py-3.5 rounded-2xl items-center justify-center shadow-md ${
            partnerBalance > 0
              ? 'bg-[#FF5A36] shadow-[#FF5A36]/25'
              : 'bg-slate-200 shadow-none'
          }`}
        >
          <Text className="text-white font-black text-xs uppercase tracking-wider">
            {partnerBalance > 0 ? 'Withdraw to Bank Account' : 'Funds Withdrawn (Up to Date)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Key Real-Time Facility Metrics */}
      <Text className="text-slate-900 font-black text-lg mb-3">Live Studio Operations</Text>
      <View className="flex-row space-x-3 gap-3 mb-5">
        {/* Footfall */}
        <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <View className="flex-row items-center justify-between">
            <Text className="text-slate-400 text-[11px] font-black uppercase">Live Footfall</Text>
            <View className="w-2 h-2 rounded-full bg-emerald-500" />
          </View>
          <Text className="text-slate-900 text-2xl font-black mt-2">26</Text>
          <Text className="text-emerald-600 text-[11px] font-bold mt-1">Inside Studio</Text>
        </View>

        {/* Today's QR Check-Ins */}
        <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <Text className="text-slate-400 text-[11px] font-black uppercase">QR Check-Ins</Text>
          <Text className="text-slate-900 text-2xl font-black mt-2">{todayCheckIns}</Text>
          <Text className="text-slate-500 text-[11px] font-bold mt-1">Today's Visits</Text>
        </View>

        {/* Active Members */}
        <View className="flex-1 bg-white p-4 rounded-2xl border border-slate-100 shadow-2xs">
          <Text className="text-slate-400 text-[11px] font-black uppercase">Members</Text>
          <Text className="text-slate-900 text-2xl font-black mt-2">142</Text>
          <Text className="text-blue-600 text-[11px] font-bold mt-1">Registered</Text>
        </View>
      </View>

      {/* Recent QR Entry Log */}
      <View className="bg-white rounded-3xl p-5 border border-slate-100 shadow-2xs mb-6">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-slate-900 font-black text-base">Real-Time QR Turnstile Scans</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => setTodayCheckIns(todayCheckIns + 1)}>
            <Text className="text-[#FF5A36] text-xs font-black">+ Simulate Scan</Text>
          </TouchableOpacity>
        </View>

        <View className="space-y-3 gap-3">
          <View className="flex-row items-center justify-between py-1 border-b border-slate-50">
            <View className="flex-row items-center space-x-3 gap-3">
              <View className="w-8 h-8 rounded-full bg-slate-900 items-center justify-center">
                <Text className="text-white text-xs font-black">MV</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-xs">Martin Vance</Text>
                <Text className="text-slate-400 text-[11px]">Pro Athlete Plan • 07:15 AM</Text>
              </View>
            </View>
            <Text className="text-emerald-500 font-black text-xs">VERIFIED</Text>
          </View>

          <View className="flex-row items-center justify-between py-1 border-b border-slate-50">
            <View className="flex-row items-center space-x-3 gap-3">
              <View className="w-8 h-8 rounded-full bg-slate-700 items-center justify-center">
                <Text className="text-white text-xs font-black">SC</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-xs">Sarah Connor</Text>
                <Text className="text-slate-400 text-[11px]">Quarterly Pass • 07:42 AM</Text>
              </View>
            </View>
            <Text className="text-emerald-500 font-black text-xs">VERIFIED</Text>
          </View>

          <View className="flex-row items-center justify-between py-1">
            <View className="flex-row items-center space-x-3 gap-3">
              <View className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center">
                <Text className="text-white text-xs font-black">AH</Text>
              </View>
              <View>
                <Text className="text-slate-900 font-bold text-xs">Alex Hunter</Text>
                <Text className="text-slate-400 text-[11px]">VIP Annual • 08:05 AM</Text>
              </View>
            </View>
            <Text className="text-emerald-500 font-black text-xs">VERIFIED</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
