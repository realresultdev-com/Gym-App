import { create } from 'zustand';
import { ApiClient } from '../services/api';
import type { SafeUser, UserRole } from '@gym-app/shared-types';

interface AuthState {
  user: SafeUser | null;
  role: UserRole | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  initAuth: () => Promise<void>;
  login: (identifier: string, password: string) => Promise<boolean>;
  switchDemoRole: (targetRole: UserRole) => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  token: null,
  isLoading: true,
  error: null,

  initAuth: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await ApiClient.getToken();
      if (!token) {
        // Default to Martin Vance (Member demo) if starting fresh
        await get().switchDemoRole('MEMBER');
        return;
      }

      const res = await ApiClient.get<SafeUser>('/api/auth/me');
      if (res.success && res.data) {
        set({
          user: res.data,
          role: res.data.role,
          token,
          isLoading: false,
        });
      } else {
        // Fallback to Member demo
        await get().switchDemoRole('MEMBER');
      }
    } catch (e: any) {
      set({ isLoading: false, error: e.message });
    }
  },

  login: async (identifier, password) => {
    set({ isLoading: true, error: null });
    const res = await ApiClient.post<{ user: SafeUser; token: string; refresh_token: string }>(
      '/api/auth/login',
      { identifier, password }
    );

    if (res.success && res.data) {
      await ApiClient.setToken(res.data.token);
      await ApiClient.setRefreshToken(res.data.refresh_token);
      set({
        user: res.data.user,
        role: res.data.user.role,
        token: res.data.token,
        isLoading: false,
      });
      return true;
    } else {
      set({
        isLoading: false,
        error: res.error?.message || 'Login failed',
      });
      return false;
    }
  },

  switchDemoRole: async (targetRole: UserRole) => {
    set({ isLoading: true, error: null });

    const credentials: Record<UserRole, { id: string; name: string; email: string }> = {
      ADMIN: {
        id: 'usr-admin-0001',
        name: 'Sarah Connor (Admin)',
        email: 'admin@gym.com',
      },
      TRAINER: {
        id: 'usr-trainer-0001',
        name: 'Alex Hunter (Coach)',
        email: 'trainer@gym.com',
      },
      MEMBER: {
        id: 'usr-member-0001',
        name: 'Martin Vance (Member)',
        email: 'member@gym.com',
      },
    };

    const target = credentials[targetRole];
    // Attempt live login against Cloudflare Worker API
    const res = await ApiClient.post<{ user: SafeUser; token: string; refresh_token: string }>(
      '/api/auth/login',
      { identifier: target.email, password: 'Password123!' }
    );

    if (res.success && res.data) {
      await ApiClient.setToken(res.data.token);
      await ApiClient.setRefreshToken(res.data.refresh_token);
      set({
        user: res.data.user,
        role: res.data.user.role,
        token: res.data.token,
        isLoading: false,
      });
      return true;
    } else {
      // Local fallback representation if offline
      const fallbackUser: SafeUser = {
        id: target.id,
        gym_id: '00000000-0000-0000-0000-000000000001',
        email: target.email,
        phone: '+1 555-0001',
        first_name: targetRole === 'ADMIN' ? 'Sarah' : targetRole === 'TRAINER' ? 'Alex' : 'Martin',
        last_name: targetRole === 'ADMIN' ? 'Connor' : targetRole === 'TRAINER' ? 'Hunter' : 'Vance',
        role: targetRole,
        status: 'ACTIVE',
        avatar_url: targetRole === 'MEMBER'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200'
          : targetRole === 'TRAINER'
          ? 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?q=80&w=200'
          : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      set({
        user: fallbackUser,
        role: targetRole,
        isLoading: false,
      });
      return true;
    }
  },

  logout: async () => {
    try {
      await ApiClient.post('/api/auth/logout');
    } catch {}
    await ApiClient.setToken(null);
    await ApiClient.setRefreshToken(null);
    set({ user: null, role: null, token: null });
  },
}));

