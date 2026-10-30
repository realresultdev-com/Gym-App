import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { ApiClient } from '../services/api';

export function TrainerDashboardView() {
  const [clients, setClients] = useState<any[]>([
    {
      id: 'usr-member-0001',
      first_name: 'Martin',
      last_name: 'Vance',
      email: 'member@gym.com',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
      fitness_goal: 'Build lean muscle and improve core stability',
      target_weight_kg: 78.0,
      plan_name: 'Quarterly Pro Athlete',
      subscription_status: 'ACTIVE',
    },
  ]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadClients = async () => {
    setIsRefreshing(true);
    const res = await ApiClient.get('/api/trainers/me/clients');
    if (res.success && res.data && res.data.length > 0) {
      setClients(res.data);
    }
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadClients();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gym-bg px-5 pt-3 pb-8"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadClients} />}
    >
      <View className="mb-4">
        <Text className="text-white text-2xl font-black">Trainer Studio</Text>
        <Text className="text-neutral-400 text-xs">Coach Alex Hunter • Certified CSCS</Text>
      </View>

      {/* Summary Banner */}
      <View className="bg-gym-card rounded-3xl p-5 border border-neutral-800 mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-neutral-400 text-xs font-semibold">Assigned Athletes</Text>
          <Text className="text-white text-3xl font-black mt-1">{clients.length}</Text>
          <Text className="text-gym-lime text-[11px] font-bold mt-1">All programs active</Text>
        </View>
        <View className="w-14 h-14 rounded-2xl bg-gym-lime/10 border border-gym-lime/30 items-center justify-center">
          <Text className="text-2xl">💪</Text>
        </View>
      </View>

      {/* Assigned Clients List */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-sm font-bold">My Assigned Members</Text>
        <Text className="text-gym-lime text-xs font-semibold">Active</Text>
      </View>

      <View className="space-y-3 gap-3 mb-8">
        {clients.map((client) => (
          <View
            key={client.id}
            className="bg-gym-card rounded-3xl p-4 border border-neutral-800"
          >
            <View className="flex-row items-center space-x-3 gap-3 mb-3">
              <Image
                source={{
                  uri:
                    client.avatar_url ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200',
                }}
                className="w-12 h-12 rounded-full border border-neutral-700 bg-neutral-800"
              />
              <View className="flex-1">
                <Text className="text-white text-sm font-bold">
                  {client.first_name} {client.last_name}
                </Text>
                <Text className="text-neutral-400 text-xs">{client.plan_name}</Text>
                <Text className="text-gym-lime text-[11px] font-semibold mt-0.5">
                  Goal: {client.fitness_goal}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center justify-between pt-3 border-t border-neutral-800/80">
              <TouchableOpacity
                onPress={() => alert(`Reviewing ${client.first_name}'s workout progress`)}
                className="px-4 py-2 rounded-xl bg-neutral-900 border border-neutral-700"
              >
                <Text className="text-neutral-300 text-xs font-bold">View History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => alert(`Custom workout builder opened for ${client.first_name}`)}
                className="px-4 py-2 rounded-xl bg-gym-lime"
                style={{ backgroundColor: '#bbf451' }}
              >
                <Text className="text-black text-xs font-black">Assign Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

