import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export interface WorkoutItem {
  id: string;
  tag: string;
  title: string;
  durationMin: number;
  caloriesKcal: number;
  category: 'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY';
  imageSource: any;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const WORKOUT_ITEMS: WorkoutItem[] = [
  {
    id: 'w1',
    tag: 'ADVANCED STRENGTH',
    title: 'Full Body Power',
    durationMin: 45,
    caloriesKcal: 520,
    category: 'STRENGTH',
    imageSource: require('../../assets/workouts/full-body-power.jpg'),
    difficulty: 'Advanced',
  },
  {
    id: 'w2',
    tag: 'INTERMEDIATE HIIT',
    title: 'Burn & Sweat',
    durationMin: 20,
    caloriesKcal: 310,
    category: 'HIIT',
    imageSource: require('../../assets/workouts/burn-and-sweat.jpg'),
    difficulty: 'Intermediate',
  },
  {
    id: 'w3',
    tag: 'BEGINNER FLOW',
    title: 'Morning Flow',
    durationMin: 15,
    caloriesKcal: 140,
    category: 'MOBILITY',
    imageSource: require('../../assets/workouts/morning-flow.jpg'),
    difficulty: 'Beginner',
  },
];

interface WorkoutsScreenProps {
  onSelectWorkout?: (workout: WorkoutItem) => void;
}

export function WorkoutsScreen({ onSelectWorkout }: WorkoutsScreenProps) {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY'>('ALL');

  const filteredWorkouts = activeCategory === 'ALL'
    ? WORKOUT_ITEMS
    : WORKOUT_ITEMS.filter((w) => w.category === activeCategory);

  const categories: Array<{ id: 'ALL' | 'STRENGTH' | 'HIIT' | 'MOBILITY'; label: string }> = [
    { id: 'ALL', label: 'ALL' },
    { id: 'STRENGTH', label: 'STRENGTH' },
    { id: 'HIIT', label: 'HIIT' },
    { id: 'MOBILITY', label: 'MOBILITY' },
  ];

  return (
    <View className="flex-1 bg-[#FBFBFC]">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 28 }}
      >
        {/* Header Title - Exactly matching the screenshot */}
        <View className="px-5 pt-3 pb-3">
          <Text className="text-slate-900 text-3xl font-black tracking-tight">
            Workouts
          </Text>
        </View>

        {/* Category Pills Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="pl-5 mb-5"
          contentContainerStyle={{ paddingRight: 24 }}
        >
          {categories.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                activeOpacity={0.85}
                onPress={() => setActiveCategory(cat.id)}
                className={`mr-3 px-6 py-2.5 rounded-full flex-row items-center justify-center ${
                  isSelected
                    ? 'bg-[#FF5A36] shadow-md shadow-[#FF5A36]/30'
                    : 'bg-white border border-slate-100 shadow-2xs'
                }`}
              >
                <Text
                  className={`text-xs font-black uppercase tracking-wider ${
                    isSelected ? 'text-white' : 'text-slate-800'
                  }`}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Workout Cards Stack */}
        <View className="px-5 space-y-4 gap-4">
          {filteredWorkouts.map((workout) => (
            <TouchableOpacity
              key={workout.id}
              activeOpacity={0.92}
              onPress={() => onSelectWorkout && onSelectWorkout(workout)}
              className="w-full h-52 rounded-[28px] overflow-hidden bg-slate-900 relative"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 12,
                elevation: 4,
              }}
            >
              {/* Background Photography */}
              <Image
                source={workout.imageSource}
                className="w-full h-full absolute inset-0"
                resizeMode="cover"
              />

              {/* Dark Gradient Overlay for razor-sharp legibility */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0.85)']}
                locations={[0, 0.45, 1]}
                className="absolute inset-0"
              />

              {/* Card Bottom-Left Content */}
              <View className="absolute bottom-5 left-5 right-5">
                {/* Category Tag */}
                <Text className="text-white/80 text-[11px] font-black uppercase tracking-widest mb-1">
                  {workout.tag}
                </Text>

                {/* Workout Title */}
                <Text className="text-white text-2xl font-black tracking-tight mb-2">
                  {workout.title}
                </Text>

                {/* Meta Row: Duration & Calories with Coral Flame Icons */}
                <View className="flex-row items-center space-x-4 gap-4">
                  {/* Duration */}
                  <View className="flex-row items-center space-x-1.5 gap-1.5">
                    <Ionicons name="flame" size={14} color="#FF5A36" />
                    <Text className="text-white font-bold text-xs tracking-wide">
                      {workout.durationMin} MIN
                    </Text>
                  </View>

                  {/* Calories */}
                  <View className="flex-row items-center space-x-1.5 gap-1.5">
                    <Ionicons name="flame" size={14} color="#FF5A36" />
                    <Text className="text-white font-bold text-xs tracking-wide">
                      {workout.caloriesKcal} KCAL
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
