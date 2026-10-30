import type { SafeUser, UserRole } from '@gym-app/shared-types';

export interface Env {
  DB: D1Database;
  STORAGE: R2Bucket;
  GYM_CACHE: KVNamespace;
  JWT_SECRET: string;
  ENVIRONMENT: string;
  DEFAULT_GYM_ID: string;
  APP_NAME?: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
}

export interface AppVariables {
  user: SafeUser;
  gym_id: string;
  role: UserRole;
  user_id: string;
}

export type AppContext = {
  Bindings: Env;
  Variables: AppVariables;
};

