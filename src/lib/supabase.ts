import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupportedStorage } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Avoid AsyncStorage during static SSR / Node — it expects `window` and crashes the web export. */
function createAuthStorage(): SupportedStorage {
  if (Platform.OS === 'web') {
    return {
      getItem: (key) => {
        if (typeof window === 'undefined') return Promise.resolve(null);
        try {
          return Promise.resolve(window.localStorage.getItem(key));
        } catch {
          return Promise.resolve(null);
        }
      },
      setItem: (key, value) => {
        if (typeof window === 'undefined') return Promise.resolve();
        try {
          window.localStorage.setItem(key, value);
        } catch {
          /* ignore quota / private mode */
        }
        return Promise.resolve();
      },
      removeItem: (key) => {
        if (typeof window === 'undefined') return Promise.resolve();
        try {
          window.localStorage.removeItem(key);
        } catch {
          /* ignore */
        }
        return Promise.resolve();
      },
    };
  }

  return AsyncStorage;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    flowType: 'pkce',
  },
});

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}
