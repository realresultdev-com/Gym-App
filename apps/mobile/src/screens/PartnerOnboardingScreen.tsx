import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface PartnerOnboardingScreenProps {
  onContinue: () => void;
  onSwitchToMember?: () => void;
}

const SLIDES = [
  {
    tag: 'PARTNER WITH REAL FIT!',
    titleLine1: 'Run Your Gym.',
    titleLine2: 'Smarter.',
    description:
      'Manage members, track performance, and grow your gym - all from one powerful dashboard.',
  },
  {
    tag: 'MEMBER VALUE INCLUDED!',
    titleLine1: 'Free Exercise',
    titleLine2: 'Course.',
    description:
      'Every member gets our 10 foundational movement guides with step-by-step animations - 100% free for your gym.',
  },
  {
    tag: 'ZERO ONBOARDING FEES!',
    titleLine1: 'Instant Payouts &',
    titleLine2: 'QR Check-In.',
    description:
      'Track real-time footfall with staff-friendly QR scans and withdraw session earnings directly to your bank.',
  },
];

export function PartnerOnboardingScreen({
  onContinue,
  onSwitchToMember,
}: PartnerOnboardingScreenProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const handleNext = () => {
    if (currentSlideIndex < SLIDES.length - 1) {
      setCurrentSlideIndex((prev) => prev + 1);
    } else {
      onContinue();
    }
  };

  const slide = SLIDES[currentSlideIndex];

  return (
    <View className="flex-1 bg-white">
      {/* Gym Photo Hero - Exact layout from Fit Square screenshot */}
      <View className="flex-1 w-full relative">
        <Image
          source={require('../../assets/partner-gym.jpg')}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Gradient overlay to smoothly transition to white content below */}
        <LinearGradient
          colors={['rgba(255,255,255,0.85)', 'rgba(255,255,255,0.0)', 'rgba(255,255,255,0.95)', '#FFFFFF']}
          locations={[0, 0.25, 0.75, 1]}
          className="absolute inset-0"
        />

        {/* Top Header Logo: Hexagon Icon + FIT SQUARE */}
        <SafeAreaView className="absolute top-2 left-6 right-6">
          <View className="flex-row items-center justify-between pt-2">
            <View className="flex-row items-center space-x-2.5 gap-2.5">
              {/* Hexagonal Brand Symbol */}
              <View className="w-9 h-9 rounded-xl bg-slate-950 items-center justify-center shadow-md">
                <MaterialCommunityIcons name="cube-scan" size={22} color="#FF5A36" />
              </View>
              <View>
                <Text className="text-slate-950 text-base font-black tracking-widest font-sans">
                  REAL FIT
                </Text>
                <Text className="text-slate-400 text-[9px] font-bold tracking-widest uppercase">
                  PARTNER PLATFORM
                </Text>
              </View>
            </View>

            {onSwitchToMember && (
              <TouchableOpacity
                onPress={onSwitchToMember}
                activeOpacity={0.7}
                className="px-3 py-1 rounded-full bg-black/5 border border-black/10"
              >
                <Text className="text-slate-700 font-bold text-xs">Member Mode</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>

        {/* Floating Content Area (Bottom Section Matching Screenshot) */}
        <View className="absolute bottom-6 left-6 right-6">
          {/* Partner Tag Badge */}
          <Text className="text-[#FF5A36] text-xs font-black uppercase tracking-wider mb-2">
            {slide.tag}
          </Text>

          {/* Headline with Brush Highlight */}
          <View className="mb-3">
            <Text className="text-slate-950 text-4xl font-black tracking-tight leading-tight">
              {slide.titleLine1}
            </Text>
            <View className="relative inline-flex">
              <Text className="text-slate-950 text-4xl font-black tracking-tight leading-tight">
                {slide.titleLine2}
              </Text>
              {/* Stylish Orange Underline Accent matching screenshot */}
              <View className="h-1.5 w-36 bg-[#FF5A36] rounded-full mt-0.5 opacity-90" />
            </View>
          </View>

          {/* Description Paragraph */}
          <Text className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
            {slide.description}
          </Text>

          {/* Carousel Dots */}
          <View className="flex-row items-center space-x-2 gap-2 mb-6">
            {SLIDES.map((_, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => setCurrentSlideIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  currentSlideIndex === idx
                    ? 'w-7 bg-slate-950'
                    : 'w-2.5 bg-slate-300'
                }`}
              />
            ))}
          </View>

          {/* Big Orange Continue Button */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleNext}
            className="w-full py-4 rounded-2xl bg-[#FF5A36] items-center justify-center shadow-lg shadow-[#FF5A36]/30 mb-2"
          >
            <Text className="text-white font-black text-base tracking-wide">
              {currentSlideIndex === SLIDES.length - 1 ? 'Launch Partner Dashboard' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

