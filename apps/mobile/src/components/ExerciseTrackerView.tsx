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
    <ScrollView className="flex-1 bg-white px-5 pt-3 pb-8" showsVerticalScrollIndicator={false}>
      {/* Exercise Image Hero with Overlays */}
      <View className="h-64 w-full rounded-3xl overflow-hidden bg-slate-100 relative mb-4 border border-slate-200 shadow-sm">
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?q=80&w=600',
          }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Top Header Tag */}
        <View className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-sm">
          <Text className="text-slate-900 text-xs font-black">Quick Exercise</Text>
        </View>

        {/* Live Timer Pill */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={toggleTimer}
          className="absolute bottom-4 left-4 bg-white/95 px-4 py-2 rounded-2xl border border-slate-200 flex-row items-center space-x-2 gap-2 shadow-md"
        >
          <Text className="text-amber-500 text-xs font-bold">
            {isTimerRunning ? '⏸' : '▶'}
          </Text>
          <Text className="text-slate-900 text-sm font-mono font-black tracking-wider">
            ⏱ {formatTimer(timerSeconds)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Title */}
      <View className="flex-row items-center justify-between mb-1">
        <Text className="text-slate-900 text-2xl font-black">
          {activeExercise.name}
        </Text>
        <View className="bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
          <Text className="text-slate-900 text-xs font-black">Set 3 of 4</Text>
        </View>
      </View>
      <Text className="text-slate-500 text-xs font-bold mb-4">
        Target: {activeExercise.target_muscle}
      </Text>

      {/* Posture Cues (Numbered Yellow Badges from Image 2) */}
      <Text className="text-slate-900 text-sm font-black mb-2.5">Posture & Form Cues</Text>
      <View className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3 gap-3 mb-5 shadow-sm">
        {activeExercise.tips.map((tip, idx) => (
          <View key={idx} className="flex-row items-start space-x-3 gap-3">
            <View className="w-5 h-5 rounded-full bg-amber-400 items-center justify-center mt-0.5 shadow-sm">
              <Text className="text-black text-[11px] font-black">{idx + 1}</Text>
            </View>
            <Text className="text-slate-700 text-xs font-bold flex-1 leading-4">
              {tip}
            </Text>
          </View>
        ))}
      </View>

      {/* Logged Sets Table */}
      <Text className="text-slate-900 text-sm font-black mb-2.5">Set Performance</Text>
      <View className="bg-white rounded-2xl p-3 border border-slate-200 mb-6 shadow-sm">
        <View className="flex-row justify-between pb-2 border-b border-slate-100 px-2">
          <Text className="text-slate-400 text-xs font-black w-12">SET</Text>
          <Text className="text-slate-400 text-xs font-black w-16 text-center">REPS</Text>
          <Text className="text-slate-400 text-xs font-black w-20 text-center">WEIGHT</Text>
          <Text className="text-slate-400 text-xs font-black w-16 text-right">STATUS</Text>
        </View>

        {loggedSets.map((s) => (
          <View
            key={s.set_number}
            className="flex-row items-center justify-between py-2.5 px-2 border-b border-slate-50"
          >
            <Text className="text-slate-900 text-xs font-black w-12">#{s.set_number}</Text>
            <Text className="text-slate-700 text-xs font-bold w-16 text-center">
              {s.reps} reps
            </Text>
            <Text className="text-slate-700 text-xs font-bold w-20 text-center">
              {s.weight_kg > 0 ? `${s.weight_kg} kg` : 'Bodyweight'}
            </Text>
            <TouchableOpacity
              onPress={() => logSet(s.set_number, s.reps, s.weight_kg)}
              className={`w-16 py-1 rounded-lg items-center ${
                s.completed ? 'bg-emerald-100 border border-emerald-300' : 'bg-slate-100'
              }`}
            >
              <Text
                className={`text-[11px] font-black ${
                  s.completed ? 'text-emerald-800' : 'text-slate-500'
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
        className="w-full py-4 rounded-2xl bg-slate-900 items-center justify-center shadow-lg shadow-slate-900/20 mb-10"
      >
        <Text className="text-white font-black text-sm uppercase tracking-wider">
          Complete Workout
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
