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

export const CORE_EXERCISES = [
  { id: 'ex-1', name: '1. Standard Push-Up', category: 'Push', target: '3 sets × 8–12 reps', muscles: 'Chest, Shoulders, Triceps, Core' },
  { id: 'ex-2', name: '2. Seated Dumbbell Shoulder Press', category: 'Push', target: '3 sets × 10 reps', muscles: 'Deltoids, Triceps' },
  { id: 'ex-3', name: '3. Machine Chest Press', category: 'Push', target: '3 sets × 12 reps', muscles: 'Chest, Triceps' },
  { id: 'ex-4', name: '4. Lat Pulldown', category: 'Pull', target: '3 sets × 10–12 reps', muscles: 'Lats, Upper Back, Biceps' },
  { id: 'ex-5', name: '5. Seated Cable Row', category: 'Pull', target: '3 sets × 10 reps', muscles: 'Middle Back, Lats, Biceps' },
  { id: 'ex-6', name: '6. Dumbbell Biceps Curl', category: 'Pull', target: '3 sets × 12 reps', muscles: 'Biceps Brachii' },
  { id: 'ex-7', name: '7. Leg Press Machine', category: 'Legs & Core', target: '3 sets × 10 reps', muscles: 'Quads, Glutes' },
  { id: 'ex-8', name: '8. Dumbbell Goblet Squat', category: 'Legs & Core', target: '3 sets × 10 reps', muscles: 'Quads, Glutes, Hamstrings, Core' },
  { id: 'ex-9', name: '9. Romanian Dumbbell Deadlift', category: 'Legs & Core', target: '3 sets × 10 reps', muscles: 'Hamstrings, Glutes, Lower Back' },
  { id: 'ex-10', name: '10. Forearm Plank', category: 'Legs & Core', target: '3 sets × 30–45s', muscles: 'Abdominals, Lower Back' },
];

interface WorkoutsScreenProps {
  onSelectWorkout?: (workout: WorkoutItem) => void;
  onOpenPartnerOnboarding?: () => void;
}

export function WorkoutsScreen({ onSelectWorkout, onOpenPartnerOnboarding }: WorkoutsScreenProps) {
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
        contentContainerStyle={{ paddingBottom: 36 }}
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

        {/* Foundational Exercises Integrated Directly inside Workout */}
        <View className="px-5 mt-8">
          <View className="flex-row items-center justify-between mb-3">
            <View>
              <Text className="text-slate-900 text-xl font-black tracking-tight">Exercise Library</Text>
              <Text className="text-slate-400 text-xs font-semibold mt-0.5">10 foundational movement guides</Text>
            </View>
            <View className="px-3 py-1 rounded-full bg-[#FF5A36]/10">
              <Text className="text-[#FF5A36] text-xs font-black">10 Exercises</Text>
            </View>
          </View>

          <View className="space-y-2.5 gap-2.5">
            {CORE_EXERCISES.map((ex) => (
              <TouchableOpacity
                key={ex.id}
                activeOpacity={0.8}
                onPress={() => onSelectWorkout && onSelectWorkout({
                  id: ex.id,
                  tag: ex.category.toUpperCase(),
                  title: ex.name,
                  durationMin: 15,
                  caloriesKcal: 120,
                  category: 'STRENGTH',
                  imageSource: require('../../assets/workouts/full-body-power.jpg'),
                  difficulty: 'Beginner',
                })}
                className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-2xs flex-row items-center justify-between"
              >
                <View className="flex-1 mr-2">
                  <View className="flex-row items-center space-x-2 gap-2 mb-0.5">
                    <Text className="text-[10px] font-black uppercase text-slate-400">{ex.category}</Text>
                    <Text className="text-[10px] font-bold text-[#FF5A36]">{ex.target}</Text>
                  </View>
                  <Text className="text-slate-900 font-black text-sm">{ex.name}</Text>
                  <Text className="text-slate-400 text-xs font-medium mt-0.5">{ex.muscles}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Real Fit Partner Network Banner (Matches Onboarding Mockup) */}
        {onOpenPartnerOnboarding && (
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={onOpenPartnerOnboarding}
            className="mx-5 mt-8 p-5 rounded-3xl bg-slate-950 shadow-lg shadow-black/20"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="px-2.5 py-0.5 rounded-full bg-[#FF5A36]">
                <Text className="text-white text-[10px] font-black uppercase tracking-wider">
                  Gym Owners & Partners
                </Text>
              </View>
              <Text className="text-[#FF5A36] text-xs font-bold">Explore Platform →</Text>
            </View>
            <Text className="text-white text-lg font-black tracking-tight mb-1">
              Run Your Gym. Smarter.
            </Text>
            <Text className="text-slate-400 text-xs leading-relaxed">
              Automate member check-ins, instant bank payouts & bundle free exercise courses for all members.
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
