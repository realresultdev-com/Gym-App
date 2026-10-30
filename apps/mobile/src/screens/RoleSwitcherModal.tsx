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
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-white rounded-t-3xl p-6 border-t border-slate-200 shadow-2xl">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-slate-900 text-lg font-black">Switch Role / User</Text>
              <Text className="text-slate-500 text-xs font-semibold">
                Active role: <Text className="text-slate-900 font-bold">{role || 'MEMBER'}</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Text className="text-slate-400 font-bold text-base">✕</Text>
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
                    ? 'bg-slate-900 border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className="text-2xl">🏋️</Text>
                <View className="flex-1">
                  <Text className={`text-sm font-black ${role === 'MEMBER' ? 'text-white' : 'text-slate-900'}`}>
                    Martin Vance (Member)
                  </Text>
                  <Text className={`text-xs ${role === 'MEMBER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    White Dashboard, Challenge, Exercise Tracking, Check-In
                  </Text>
                </View>
                {role === 'MEMBER' && <Text className="text-amber-400 font-black text-sm">✓</Text>}
              </TouchableOpacity>

              {/* Trainer Card */}
              <TouchableOpacity
                onPress={() => handleSelectRole('TRAINER')}
                disabled={isLoading}
                className={`p-4 rounded-2xl border flex-row items-center space-x-3 gap-3 ${
                  role === 'TRAINER'
                    ? 'bg-slate-900 border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className="text-2xl">💪</Text>
                <View className="flex-1">
                  <Text className={`text-sm font-black ${role === 'TRAINER' ? 'text-white' : 'text-slate-900'}`}>
                    Alex Hunter (Trainer)
                  </Text>
                  <Text className={`text-xs ${role === 'TRAINER' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Assigned clients, workout plan assignment, athlete attendance
                  </Text>
                </View>
                {role === 'TRAINER' && <Text className="text-amber-400 font-black text-sm">✓</Text>}
              </TouchableOpacity>

              {/* Admin Card */}
              <TouchableOpacity
                onPress={() => handleSelectRole('ADMIN')}
                disabled={isLoading}
                className={`p-4 rounded-2xl border flex-row items-center space-x-3 gap-3 ${
                  role === 'ADMIN'
                    ? 'bg-slate-900 border-slate-900 shadow-sm'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <Text className="text-2xl">👑</Text>
                <View className="flex-1">
                  <Text className={`text-sm font-black ${role === 'ADMIN' ? 'text-white' : 'text-slate-900'}`}>
                    Sarah Connor (Admin)
                  </Text>
                  <Text className={`text-xs ${role === 'ADMIN' ? 'text-slate-300' : 'text-slate-500'}`}>
                    Revenue, Cloudflare Free-Tier monitor, members & reception QR
                  </Text>
                </View>
                {role === 'ADMIN' && <Text className="text-amber-400 font-black text-sm">✓</Text>}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowManualLogin(true)}
                className="py-3 items-center justify-center rounded-2xl border border-slate-200 bg-slate-100"
              >
                <Text className="text-slate-700 text-xs font-bold">
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
                placeholderTextColor="#94a3b8"
                className="bg-slate-50 text-slate-900 p-3.5 rounded-2xl border border-slate-200 text-sm font-medium"
                autoCapitalize="none"
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                className="bg-slate-50 text-slate-900 p-3.5 rounded-2xl border border-slate-200 text-sm font-medium"
              />

              {error && <Text className="text-red-500 text-xs font-bold">{error}</Text>}

              <TouchableOpacity
                onPress={handleManualLogin}
                className="py-3.5 rounded-2xl bg-slate-900 items-center justify-center shadow-md"
              >
                <Text className="text-white font-black text-sm">Sign In</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setShowManualLogin(false)}
                className="py-2 items-center"
              >
                <Text className="text-slate-500 text-xs font-semibold">Back to demo roles</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
