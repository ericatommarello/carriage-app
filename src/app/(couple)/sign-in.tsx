import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { signInWithGoogleOAuth } from '@/lib/auth-oauth';
import {
  applyPendingQuizCompletionIfNeeded,
  clearPendingMatchProfile,
  getProfileQuizCompleted,
  loadPendingMatchProfile,
  markQuizCompletedForCurrentUser,
} from '@/lib/couple-profile';
import { useWedding } from '@/context/wedding-context';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const PROFILE_READ_RETRY_MS = 500;

export default function CoupleSignInScreen() {
  const router = useRouter();
  const { matchProfile, setMatchProfile } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);
  const [busy, setBusy] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const routingInFlight = useRef(false);

  const routeAfterSession = useCallback(
    async (userId: string) => {
      if (routingInFlight.current) return;
      routingInFlight.current = true;

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user?.id) {
          return;
        }

        const draft = await loadPendingMatchProfile();
        if (draft && !matchProfile) setMatchProfile(draft);
        const effectiveProfile = draft ?? matchProfile;

        await applyPendingQuizCompletionIfNeeded();

        let quizDone = await getProfileQuizCompleted(user.id);
        if (!quizDone && effectiveProfile) {
          await markQuizCompletedForCurrentUser();
          quizDone = await getProfileQuizCompleted(user.id);
        }
        if (!quizDone) {
          await new Promise((r) => setTimeout(r, PROFILE_READ_RETRY_MS));
          quizDone = await getProfileQuizCompleted(user.id);
        }

        if (quizDone) {
          await clearPendingMatchProfile();
        }

        router.replace(quizDone ? '/(couple)/browse' : '/match');
      } catch {
        /* route on retry via auth listener */
      } finally {
        routingInFlight.current = false;
      }
    },
    [router, matchProfile, setMatchProfile],
  );

  /** Web PKCE: exchange ?code= before relying on implicit URL detection (avoids racing profile read). */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const oauthErr = params.get('error_description') ?? params.get('error');
    if (oauthErr) {
      setConfigError(oauthErr);
      window.history.replaceState({}, '', window.location.pathname);
      return;
    }

    const code = params.get('code');
    if (!code) return;

    void (async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        setConfigError(error.message);
        routingInFlight.current = false;
        return;
      }
      window.history.replaceState({}, '', window.location.pathname);
    })();
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setConfigError('Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to use sign-in.');
      return;
    }

    let cancelled = false;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled || !session?.user?.id) return;
      void routeAfterSession(session.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event !== 'SIGNED_IN' && event !== 'INITIAL_SESSION') return;
      if (!session?.user?.id) return;
      void routeAfterSession(session.user.id);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [routeAfterSession]);

  const onGoogle = async () => {
    setConfigError(null);
    if (!isSupabaseConfigured()) {
      setConfigError('Supabase is not configured.');
      return;
    }
    setBusy(true);
    try {
      await signInWithGoogleOAuth();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign-in failed';
      setConfigError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <View style={[styles.inner, { paddingHorizontal: horizontalGutter, maxWidth: 560, alignSelf: 'center', width: '100%' }]}>
        <View style={styles.eyebrowRow}>
          <Text style={styles.spark}>✦</Text>
          <Text style={styles.eyebrow}>Carriage</Text>
        </View>
        <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Your matches are ready.</Text>
        <Text style={styles.subtitle}>
          Sign in to see your personalized results — we matched you based on your answers.
        </Text>

        {configError ? <Text style={styles.error}>{configError}</Text> : null}

        <Pressable
          onPress={() => void onGoogle()}
          disabled={busy || !isSupabaseConfigured()}
          style={({ pressed }) => [
            styles.googleBtn,
            WeddingShadows.soft,
            pressed && styles.googleBtnPressed,
            (busy || !isSupabaseConfigured()) && styles.googleBtnDisabled,
          ]}>
          {busy ? (
            <ActivityIndicator color={WeddingPalette.text} />
          ) : (
            <Text style={styles.googleLabel}>Continue with Google</Text>
          )}
        </Pressable>

        {Platform.OS !== 'web' ? (
          <Text style={styles.hint}>
            Use the same redirect URL in the Supabase dashboard (Authentication → URL configuration) as this app build prints from expo-linking, e.g. carriageapp://sign-in
          </Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 32,
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spark: {
    fontSize: 14,
    color: WeddingPalette.accent,
  },
  eyebrow: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: WeddingPalette.coralDeep,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 34,
    lineHeight: 40,
    color: WeddingPalette.text,
  },
  titleDesktop: {
    fontSize: 40,
    lineHeight: 46,
  },
  subtitle: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 17,
    lineHeight: 26,
    color: WeddingPalette.textSecondary,
  },
  error: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 15,
    color: WeddingPalette.primaryDark,
    lineHeight: 22,
  },
  googleBtn: {
    marginTop: 8,
    backgroundColor: WeddingPalette.surface,
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WeddingPalette.border,
  },
  googleBtnPressed: {
    opacity: 0.92,
  },
  googleBtnDisabled: {
    opacity: 0.55,
  },
  googleLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.text,
  },
  hint: {
    marginTop: 8,
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 12,
    lineHeight: 18,
    color: WeddingPalette.textMuted,
  },
});
