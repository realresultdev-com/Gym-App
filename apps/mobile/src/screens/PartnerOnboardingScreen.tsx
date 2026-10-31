import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface PartnerOnboardingScreenProps {
  onContinue: () => void;
  onSwitchToMember?: () => void;
}

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

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
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* TOP HERO IMAGE (Takes ~56% of screen) */}
      <View style={styles.heroImageContainer}>
        <Image
          source={require('../../assets/partner-gym.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        />

        {/* Smooth Gradient Fade from image bottom to solid pure white */}
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.4)',
            'rgba(255, 255, 255, 0.0)',
            'rgba(255, 255, 255, 0.65)',
            '#FFFFFF',
          ]}
          locations={[0, 0.25, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* TOP BRAND HEADER (Logo + Brand Name) */}
        <SafeAreaView style={styles.headerSafeArea}>
          <View style={styles.headerRow}>
            <View style={styles.brandContainer}>
              {/* Official 3D Real Fit Logo */}
              <Image
                source={require('../../assets/images/real-fit-logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <View style={styles.brandTextContainer}>
                <Text style={styles.brandTitle}>REAL FIT</Text>
              </View>
            </View>

            {/* Optional switch for easy preview */}
            {onSwitchToMember && (
              <TouchableOpacity
                onPress={onSwitchToMember}
                activeOpacity={0.7}
                style={styles.modeSwitchBtn}
              >
                <Text style={styles.modeSwitchText}>Workouts</Text>
              </TouchableOpacity>
            )}
          </View>
        </SafeAreaView>
      </View>

      {/* BOTTOM CONTENT AREA (Pure Crisp White) */}
      <View style={styles.bottomContent}>
        {/* Category Tag */}
        <Text style={styles.tagText}>{slide.tag}</Text>

        {/* Headline */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>{slide.titleLine1}</Text>
          <View style={styles.titleRow}>
            <Text style={styles.titleText}>{slide.titleLine2}</Text>
          </View>
          {/* Hand-drawn style brush underline accent under "Smarter." */}
          <View style={styles.brushUnderline}>
            <View style={styles.brushMain} />
            <View style={styles.brushSecondary} />
          </View>
        </View>

        {/* Description */}
        <Text style={styles.descriptionText}>{slide.description}</Text>

        {/* Centered Pagination Dots */}
        <View style={styles.paginationRow}>
          {SLIDES.map((_, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => setCurrentSlideIndex(idx)}
              activeOpacity={0.7}
              style={[
                styles.dot,
                currentSlideIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Big Orange Continue Button (Full Pill) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleNext}
          style={styles.continueButton}
        >
          <Text style={styles.continueButtonText}>
            {currentSlideIndex === SLIDES.length - 1 ? 'Get Started' : 'Continue'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  heroImageContainer: {
    width: '100%',
    height: SCREEN_HEIGHT * 0.55,
    position: 'relative',
    backgroundColor: '#F8FAFC',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  headerSafeArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 44,
    height: 44,
    marginRight: 10,
  },
  brandTextContainer: {
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 1.5,
    fontFamily: 'System',
  },
  modeSwitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
  },
  modeSwitchText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
  },
  bottomContent: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingBottom: 36,
    paddingTop: 8,
  },
  tagText: {
    color: '#FF5A36',
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  titleContainer: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 40,
    letterSpacing: -0.5,
    fontFamily: 'System',
  },
  brushUnderline: {
    position: 'relative',
    marginTop: 3,
    width: 140,
    height: 6,
  },
  brushMain: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 130,
    height: 4,
    backgroundColor: '#FF5A36',
    borderRadius: 4,
    transform: [{ rotate: '-1.5deg' }],
  },
  brushSecondary: {
    position: 'absolute',
    left: 8,
    top: 2,
    width: 115,
    height: 3,
    backgroundColor: '#FF8A65',
    borderRadius: 4,
    opacity: 0.8,
  },
  descriptionText: {
    fontSize: 14.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 22,
    marginBottom: 12,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 8,
    backgroundColor: '#0F172A',
  },
  inactiveDot: {
    width: 8,
    backgroundColor: '#CBD5E1',
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF5A36',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF5A36',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
