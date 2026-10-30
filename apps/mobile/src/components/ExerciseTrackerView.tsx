import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useWorkoutStore } from '../store/workout.store';

export function ExerciseTrackerView() {
  const {
    activeExercise,
    timerSeconds,
    isTimerRunning,
    toggleTimer,
    incrementTimer,
    loggedSets,
    logSet,
    finishSession,
  } = useWorkoutStore();

  useEffect(() => {
    const interval = setInterval(() => {
      incrementTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSec: number) => {
    const hours = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hours.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView className="flex-1 bg-gym-bg px-5 pt-3 pb-8">
      {/* Exercise Image Hero with Overlays */}
      <View className="h-64 w-full rounded-3xl overflow-hidden bg-neutral-900 relative mb-4 border border-neutral-800">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600',
          }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Top Header Tag */}
        <View className="absolute top-4 left-4 bg-black/60 px-3 py-1.5 rounded-full border border-white/10">
          <Text className="text-white text-xs font-bold">Quick Exercise</Text>
        </View>

        {/* Live Timer Pill */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTimer}
          className="absolute bottom-4 left-4 bg-black/75 px-4 py-2 rounded-2xl border border-neutral-700 flex-row items-center space-x-2 gap-2 shadow-lg"
        >
          <Text className="text-gym-yellow text-xs font-bold">
            {isTimerRunning ? '⏸' : '▶'}
          </Text>
          <Text className="text-white text-sm font-mono font-bold tracking-wider">
            ⏱ {formatTimer(timerSeconds)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Title */}
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-white text-2xl font-black">
          {activeExercise.name}
        </Text>
        <View className="bg-gym-card px-3 py-1 rounded-full border border-neutral-800">
          <Text className="text-gym-lime text-xs font-bold">Set 3 of 4</Text>
        </View>
      </View>
      <Text className="text-neutral-400 text-xs font-medium mb-4">
        Target: {activeExercise.target_muscle}
      </Text>

      {/* Posture Cues (Numbered Yellow Badges from Image 2) */}
      <Text className="text-white text-sm font-bold mb-2.5">Posture & Form Cues</Text>
      <View className="bg-gym-card rounded-2xl p-4 border border-neutral-800 space-y-3 gap-3 mb-5">
        {activeExercise.tips.map((tip, idx) => (
          <View key={idx} className="flex-row items-start space-x-3 gap-3">
            <View className="w-5 h-5 rounded-full bg-gym-yellow items-center justify-center mt-0.5">
              <Text className="text-black text-[11px] font-black">{idx + 1}</Text>
            </View>
            <Text className="text-neutral-300 text-xs font-medium flex-1 leading-4">
              {tip}
            </Text>
          </View>
        ))}
      </View>

      {/* Logged Sets Table */}
      <Text className="text-white text-sm font-bold mb-2.5">Set Performance</Text>
      <View className="bg-gym-card rounded-2xl p-3 border border-neutral-800 mb-6">
        <View className="flex-row justify-between pb-2 border-b border-neutral-800 px-2">
          <Text className="text-neutral-500 text-xs font-bold w-12">SET</Text>
          <Text className="text-neutral-500 text-xs font-bold w-16 text-center">REPS</Text>
          <Text className="text-neutral-500 text-xs font-bold w-20 text-center">WEIGHT</Text>
          <Text className="text-neutral-500 text-xs font-bold w-16 text-right">STATUS</Text>
        </View>

        {loggedSets.map((s) => (
          <View
            key={s.set_number}
            className="flex-row items-center justify-between py-2.5 px-2 border-b border-neutral-800/40"
          >
            <Text className="text-white text-xs font-bold w-12">#{s.set_number}</Text>
            <Text className="text-neutral-200 text-xs font-medium w-16 text-center">
              {s.reps} reps
            </Text>
            <Text className="text-neutral-200 text-xs font-medium w-20 text-center">
              {s.weight_kg > 0 ? `${s.weight_kg} kg` : 'Bodyweight'}
            </Text>
            <TouchableOpacity
              onPress={() => logSet(s.set_number, s.reps, s.weight_kg)}
              className={`w-16 py-1 rounded-lg items-center ${
                s.completed ? 'bg-gym-lime/20 border border-gym-lime' : 'bg-neutral-800'
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  s.completed ? 'text-gym-lime' : 'text-neutral-400'
                }`}
              >
                {s.completed ? '✓ Done' : 'Log'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Finish Workout Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={finishSession}
        className="w-full py-4 rounded-2xl bg-gym-lime items-center justify-center shadow-lg shadow-lime-500/20 mb-10"
        style={{ backgroundColor: '#bbf451' }}
      >
        <Text className="text-black font-black text-sm uppercase tracking-wider">
          Complete Workout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

