import { supabase } from '@/lib/supabase';

export async function getProfileQuizCompleted(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('quiz_completed')
    .eq('id', userId)
    .maybeSingle();

  if (error) return false;
  return data?.quiz_completed === true;
}

export async function markQuizCompletedForCurrentUser(): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return;

  const { error } = await supabase.from('profiles').upsert(
    { id: userId, quiz_completed: true },
    { onConflict: 'id' },
  );
  if (error) console.warn('[profiles] quiz_completed upsert', error.message);
}
