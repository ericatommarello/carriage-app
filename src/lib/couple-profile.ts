import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { MatchProfile } from '@/types/match-profile';

/** Set when the user finishes the quiz without a session; cleared after we upsert quiz_completed post sign-in. */
export const PENDING_QUIZ_SYNC_KEY = 'carriage_pending_quiz_sync';

/** Draft quiz answers while signed out; survives web OAuth reload. */
const PENDING_MATCH_PROFILE_KEY = 'carriage_pending_match_profile';

function parseStoredMatchProfile(raw: string): MatchProfile | null {
  try {
    const o = JSON.parse(raw) as Partial<MatchProfile>;
    if (!o || typeof o !== 'object') return null;
    if (
      typeof o.vibe !== 'string' ||
      typeof o.beliefs !== 'string' ||
      typeof o.weddingSize !== 'string' ||
      !Array.isArray(o.mustHaves) ||
      typeof o.location !== 'string'
    ) {
      return null;
    }
    return {
      vibe: o.vibe as MatchProfile['vibe'],
      beliefs: o.beliefs as MatchProfile['beliefs'],
      weddingSize: o.weddingSize as MatchProfile['weddingSize'],
      mustHaves: o.mustHaves as string[],
      location: o.location,
    };
  } catch {
    return null;
  }
}

export async function persistPendingMatchProfile(profile: MatchProfile): Promise<void> {
  const raw = JSON.stringify(profile);
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PENDING_MATCH_PROFILE_KEY, raw);
    } catch {
      /* ignore */
    }
    return;
  }
  await AsyncStorage.setItem(PENDING_MATCH_PROFILE_KEY, raw);
}

export async function loadPendingMatchProfile(): Promise<MatchProfile | null> {
  let raw: string | null = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      raw = window.localStorage.getItem(PENDING_MATCH_PROFILE_KEY);
    } catch {
      raw = null;
    }
  } else {
    raw = await AsyncStorage.getItem(PENDING_MATCH_PROFILE_KEY);
  }
  if (!raw) return null;
  return parseStoredMatchProfile(raw);
}

export async function clearPendingMatchProfile(): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(PENDING_MATCH_PROFILE_KEY);
    } catch {
      /* ignore */
    }
    return;
  }
  await AsyncStorage.removeItem(PENDING_MATCH_PROFILE_KEY);
}

export async function hasPendingQuizCompletionFlag(): Promise<boolean> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      return window.localStorage.getItem(PENDING_QUIZ_SYNC_KEY) === '1';
    } catch {
      return false;
    }
  }
  return (await AsyncStorage.getItem(PENDING_QUIZ_SYNC_KEY)) === '1';
}

export async function getProfileQuizCompleted(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('quiz_completed')
    .eq('id', userId)
    .maybeSingle();

  if (error) return false;
  return data?.quiz_completed === true;
}

export async function markQuizCompletedForCurrentUser(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return false;

  const { error } = await supabase.from('profiles').upsert(
    { id: userId, quiz_completed: true },
    { onConflict: 'id' },
  );
  if (error) {
    console.warn('[profiles] quiz_completed upsert', error.message);
    return false;
  }
  return true;
}

/** Call when the user finishes the quiz while signed out (before browse → sign-in). Survives web OAuth full-page reload. */
export async function setPendingQuizCompletionFlag(): Promise<void> {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(PENDING_QUIZ_SYNC_KEY, '1');
    } catch {
      /* ignore */
    }
    return;
  }
  await AsyncStorage.setItem(PENDING_QUIZ_SYNC_KEY, '1');
}

/**
 * If the user completed the quiz anonymously, persist quiz_completed now that we have a session.
 * Returns true if a sync was applied (caller may re-fetch profile).
 */
export async function applyPendingQuizCompletionIfNeeded(): Promise<boolean> {
  let pending = false;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      pending = window.localStorage.getItem(PENDING_QUIZ_SYNC_KEY) === '1';
    } catch {
      pending = false;
    }
  } else {
    pending = (await AsyncStorage.getItem(PENDING_QUIZ_SYNC_KEY)) === '1';
  }

  if (!pending) return false;

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.id) return false;

  const synced = await markQuizCompletedForCurrentUser();
  if (!synced) return false;

  await clearPendingMatchProfile();

  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(PENDING_QUIZ_SYNC_KEY);
    } catch {
      /* ignore */
    }
  } else {
    await AsyncStorage.removeItem(PENDING_QUIZ_SYNC_KEY);
  }

  return true;
}
