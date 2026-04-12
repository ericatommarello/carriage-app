import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

/** Set when the user finishes the quiz without a session; cleared after we upsert quiz_completed post sign-in. */
export const PENDING_QUIZ_SYNC_KEY = 'carriage_pending_quiz_sync';

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
