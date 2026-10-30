import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Header } from '../components/Header';
import { DailyChallengeCard } from '../components/DailyChallengeCard';
import { WeekCalendarStrip } from '../components/WeekCalendarStrip';
import { CategoryPills } from '../components/CategoryPills';
import { WorkoutProgramCard } from '../components/WorkoutProgramCard';
import { FitpulseCheckInCard } from '../components/FitpulseCheckInCard';
import { PeakHoursTimeline } from '../components/PeakHoursTimeline';

interface MemberDashboardScreenProps {
  onOpenWorkout: () => void;
  onOpenRoleSwitch: () => void;
}

export function MemberDashboardScreen({
  onOpenWorkout,
  onOpenRoleSwitch,
}: MemberDashboardScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState('All Type');

  return (
    <ScrollView className="flex-1 bg-gym-bg" showsVerticalScrollIndicator={false}>
      {/* Top Header */}
      <Header
        onPressRoleSwitch={onOpenRoleSwitch}
        onPressNotification={() => Alert.alert('Notifications', 'No pending payment reminders or alerts.')}
        onPressProfile={() => Alert.alert('Profile', 'Member Martin Vance • FITPULSE All-Access VIP')}
      />

      {/* Hero Daily Challenge Card (Image 1 Left) */}
      <DailyChallengeCard onPress={onOpenWorkout} />

      {/* Week Calendar Strip (Image 1 Left) */}
      <WeekCalendarStrip />

      {/* Daily Program Header (Image 1 Left) */}
      <View className="flex-row items-center justify-between px-5 pt-3 pb-1">
        <Text className="text-white text-base font-bold">Daily Program</Text>
        <TouchableOpacity activeOpacity={0.7}>
          <Text className="text-neutral-400 text-xs font-semibold">See All</Text>
        </TouchableOpacity>
      </View>

      {/* Program Type Filter Pills (Image 1 Left) */}
      <CategoryPills
        categories={['All Type', 'Chest', 'Arms', 'Cardio', 'Yoga']}
        activeColor="lime"
        onSelect={(cat) => setSelectedCategory(cat)}
      />

      {/* Horizontal Program Cards (Image 1 Left) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 8 }}
      >
        <WorkoutProgramCard
          title="Chest Program"
          subtitle="Focus on proper form"
          duration="12 min"
          repsText="3 x 16 reps"
          imageUrl="https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=400"
          onPress={onOpenWorkout}
        />

        <WorkoutProgramCard
          title="Arms Program"
          subtitle="Increase weight gradually"
          duration="10 min"
          repsText="3 x 12 reps"
          imageUrl="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=400"
          onPress={onOpenWorkout}
        />

        <WorkoutProgramCard
          title="Pull-Up Mastery"
          subtitle="Lat & scapular control"
          duration="15 min"
          repsText="4 x 10 reps"
          imageUrl="https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=400"
          onPress={onOpenWorkout}
        />
      </ScrollView>

      {/* FITPULSE Check-In Interface (Image 2 Left) */}
      <View className="pt-2">
        <FitpulseCheckInCard onOpenQRScanner={() => Alert.alert('Check-In', 'Scanned QR successfully! Check-in recorded on Cloudflare D1.')} />
      </View>

      {/* Peak Hours Timeline (Image 2 Left) */}
      <PeakHoursTimeline />

      <View className="h-10" />
    </ScrollView>
  );
}

