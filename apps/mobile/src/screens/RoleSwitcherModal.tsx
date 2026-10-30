import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { useAuthStore } from '../store/auth.store';
import type { UserRole } from '@gym-app/shared-types';

interface RoleSwitcherModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RoleSwitcherModal({ visible, onClose }: RoleSwitcherModalProps) {
  const { role, switchDemoRole, login, isLoading, error } = useAuthStore();
  const [showManualLogin, setShowManualLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSelectRole = async (targetRole: UserRole) => {
    await switchDemoRole(targetRole);
    onClose();
  };

  const handleManualLogin = async () => {
    if (!email || !password) return;
    const ok = await login(email, password);
    if (ok) {
      setShowManualLogin(false);
      onClose();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/80 justify-end">
        <View className="bg-gym-card rounded-t-3xl p-6 border-t border-neutral-800">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-white text-lg font-black">Switch Role / User</Text>
              <Text className="text-neutral-400 text-xs">
                Active role: <Text className="text-gym-lime font-bold">{role || 'MEMBER'}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-neutral-400 font-bold text-base">✕</Text>
            </TouchableOpacity>
          </View>

          {!showManualLogin ? (
            <View className="space-y-3 gap-3 mb-4">
              {/* Member Card */}
              <TouchableOpacity
                onPress={() => handleSelectRole('MEMBER')}
                disabled={isLoading}
                className={`p-4 rounded-2xl border flex-row items-center space-x-3 gap-3 ${
                  role === 'MEMBER'
                    ? 'bg-gym-lime/10 border-gym-lime'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <Text className="text-2xl">🏋️</Text>
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">Martin Vance (Member)</Text>
                  <Text className="text-neutral-400 text-xs">
                    Dark Dashboard, Daily Challenges, Exercise Tracking, Check-In
                  </Text>
                </View>
                {role === 'MEMBER' && <Text className="text-gym-lime font-bold">✓</Text>}
              </TouchableOpacity>

              {/* Trainer Card */}
              <TouchableOpacity
                onPress={() => handleSelectRole('TRAINER')}
                disabled={isLoading}
                className={`p-4 rounded-2xl border flex-row items-center space-x-3 gap-3 ${
                  role === 'TRAINER'
                    ? 'bg-blue-950/40 border-blue-500'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <Text className="text-2xl">💪</Text>
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">Alex Hunter (Trainer)</Text>
                  <Text className="text-neutral-400 text-xs">
                    Assigned clients, workout plan assignment, athlete attendance
                  </Text>
                </View>
                {role === 'TRAINER' && <Text className="text-blue-400 font-bold">✓</Text>}
              </TouchableOpacity>

              {/* Admin Card */}
              <TouchableOpacity
                onPress={() => handleSelectRole('ADMIN')}
                disabled={isLoading}
                className={`p-4 rounded-2xl border flex-row items-center space-x-3 gap-3 ${
                  role === 'ADMIN'
                    ? 'bg-purple-950/40 border-purple-500'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
              >
                <Text className="text-2xl">👑</Text>
                <View className="flex-1">
                  <Text className="text-white text-sm font-bold">Sarah Connor (Admin)</Text>
                  <Text className="text-neutral-400 text-xs">
                    Revenue, Cloudflare Free-Tier monitor, members & broadcasts
                  </Text>
                </View>
                {role === 'ADMIN' && <Text className="text-purple-400 font-bold">✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowManualLogin(true)}
                className="py-3 items-center justify-center rounded-2xl border border-neutral-800"
              >
                <Text className="text-neutral-300 text-xs font-semibold">
                  Sign In with Custom Email & Password
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-3 gap-3 mb-4">
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email or phone"
                placeholderTextColor="#71717a"
                className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-800 text-sm"
                autoCapitalize="none"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#71717a"
                secureTextEntry
                className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-800 text-sm"
              />

              {error && <Text className="text-red-400 text-xs">{error}</Text>}

              <TouchableOpacity
                onPress={handleManualLogin}
                className="py-3.5 rounded-2xl bg-gym-lime items-center justify-center"
                style={{ backgroundColor: '#bbf451' }}
              >
                <Text className="text-black font-black text-sm">Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowManualLogin(false)}
                className="py-2 items-center"
              >
                <Text className="text-neutral-400 text-xs">Back to demo roles</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

