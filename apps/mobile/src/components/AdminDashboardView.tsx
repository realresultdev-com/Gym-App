import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { ApiClient } from '../services/api';

export function AdminDashboardView() {
  const [metrics, setMetrics] = useState({
    total_members: 120,
    active_subscriptions: 98,
    today_checkins: 42,
    monthly_revenue: 8450,
  });
  const [usage, setUsage] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    setIsRefreshing(true);
    const [mRes, uRes] = await Promise.all([
      ApiClient.get('/api/admin/metrics'),
      ApiClient.get('/api/admin/usage'),
    ]);
    if (mRes.success && mRes.data) setMetrics(mRes.data);
    if (uRes.success && uRes.data) setUsage(uRes.data);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ScrollView
      className="flex-1 bg-gym-bg px-5 pt-3 pb-8"
      refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={loadData} />}
    >
      <View className="mb-4">
        <Text className="text-white text-2xl font-black">Admin Command Center</Text>
        <Text className="text-neutral-400 text-xs">Cloudflare Serverless Management</Text>
      </View>

      {/* Metric Cards Grid */}
      <View className="flex-row flex-wrap justify-between mb-4">
        <View className="w-[48%] bg-gym-card p-4 rounded-3xl border border-neutral-800 mb-3">
          <Text className="text-neutral-400 text-xs font-semibold">Active Members</Text>
          <Text className="text-white text-2xl font-black mt-1">{metrics.total_members}</Text>
          <Text className="text-gym-lime text-[11px] font-bold mt-1">↑ 14% this month</Text>
        </View>

        <View className="w-[48%] bg-gym-card p-4 rounded-3xl border border-neutral-800 mb-3">
          <Text className="text-neutral-400 text-xs font-semibold">Active Subscriptions</Text>
          <Text className="text-white text-2xl font-black mt-1">{metrics.active_subscriptions}</Text>
          <Text className="text-gym-lime text-[11px] font-bold mt-1">98% Retention</Text>
        </View>

        <View className="w-[48%] bg-gym-card p-4 rounded-3xl border border-neutral-800">
          <Text className="text-neutral-400 text-xs font-semibold">Today Check-Ins</Text>
          <Text className="text-white text-2xl font-black mt-1">{metrics.today_checkins}</Text>
          <Text className="text-neutral-400 text-[11px] font-medium mt-1">Peak: 18:00 - 20:00</Text>
        </View>

        <View className="w-[48%] bg-gym-card p-4 rounded-3xl border border-neutral-800">
          <Text className="text-neutral-400 text-xs font-semibold">Monthly Revenue</Text>
          <Text className="text-gym-lime text-2xl font-black mt-1">${metrics.monthly_revenue}</Text>
          <Text className="text-neutral-400 text-[11px] font-medium mt-1">All-Access & Pro</Text>
        </View>
      </View>

      {/* Cloudflare Free Tier Optimization Card */}
      <View className="bg-neutral-900 rounded-3xl p-5 border border-purple-900/50 mb-5">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center space-x-2 gap-2">
            <Text className="text-base">⚡</Text>
            <Text className="text-white text-sm font-bold">Cloudflare Free-Tier Health</Text>
          </View>
          <View className="bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500">
            <Text className="text-emerald-300 text-[10px] font-bold">100% Free Tier</Text>
          </View>
        </View>

        <Text className="text-neutral-400 text-xs mb-3">
          All API logic executes on Cloudflare Workers edge nodes. Relational data is indexed in D1 with KV caching.
        </Text>

        <View className="space-y-2 gap-2">
          <View>
            <View className="flex-row justify-between text-xs mb-1">
              <Text className="text-neutral-400 text-xs">Workers Daily Requests</Text>
              <Text className="text-neutral-300 text-xs font-mono">&lt; 1% of 100,000</Text>
            </View>
            <View className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <View className="h-full bg-gym-lime rounded-full w-[2%]" />
            </View>
          </View>

          <View>
            <View className="flex-row justify-between text-xs mb-1">
              <Text className="text-neutral-400 text-xs">D1 SQLite Storage</Text>
              <Text className="text-neutral-300 text-xs font-mono">&lt; 1MB of 500MB</Text>
            </View>
            <View className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <View className="h-full bg-purple-500 rounded-full w-[1%]" />
            </View>
          </View>
        </View>
      </View>

      {/* Quick Admin Actions */}
      <Text className="text-white text-sm font-bold mb-3">Quick Management</Text>
      <View className="bg-gym-card rounded-3xl p-3 border border-neutral-800 space-y-2 gap-2 mb-10">
        <TouchableOpacity
          onPress={async () => {
            const res = await ApiClient.get('/api/attendance/qr/generate');
            if (res.success) alert('Dynamic QR generated for reception display!');
          }}
          className="flex-row items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-800"
        >
          <View className="flex-row items-center space-x-3 gap-3">
            <Text className="text-lg">🎟</Text>
            <View>
              <Text className="text-white text-xs font-bold">Generate Reception QR Code</Text>
              <Text className="text-neutral-400 text-[10px]">120s rotating front-desk dynamic token</Text>
            </View>
          </View>
          <Text className="text-neutral-400 text-xs">→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            const res = await ApiClient.post('/api/notifications/broadcast', {
              title: 'Gym Announcement',
              message: 'Join Coach Alex for the HIIT workshop this Saturday at 10 AM!',
            });
            if (res.success) alert('Broadcast sent to all active members!');
          }}
          className="flex-row items-center justify-between p-3 rounded-2xl bg-neutral-900 border border-neutral-800"
        >
          <View className="flex-row items-center space-x-3 gap-3">
            <Text className="text-lg">📢</Text>
            <View>
              <Text className="text-white text-xs font-bold">Send Gym Broadcast</Text>
              <Text className="text-neutral-400 text-[10px]">Instant notification to all active members</Text>
            </View>
          </View>
          <Text className="text-neutral-400 text-xs">→</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

