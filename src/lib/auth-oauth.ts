import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

void WebBrowser.maybeCompleteAuthSession();

/** Production web origin; OAuth redirect must match Supabase “Redirect URLs” (e.g. …/sign-in). */
const CARRIAGE_WEB_ORIGIN = 'https://www.carriage.app';

/** Parse OAuth return URL and establish Supabase session (native PKCE / implicit). */
export async function finalizeSupabaseOAuthFromUrl(callbackUrl: string): Promise<void> {
  const codeMatch = callbackUrl.match(/[?&#]code=([^&#]+)/);
  if (codeMatch) {
    const code = decodeURIComponent(codeMatch[1]);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    return;
  }

  const hashIdx = callbackUrl.indexOf('#');
  if (hashIdx < 0) return;

  const params = new URLSearchParams(callbackUrl.slice(hashIdx + 1));
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (access_token && refresh_token) {
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
  }
}

/**
 * `redirectTo` for `signInWithOAuth`. PKCE requires the post-login URL to stay on the same origin
 * as the tab that started login (except we send production users to the canonical carriage.app host).
 */
export function getGoogleOAuthRedirectTo(): string {
  if (Platform.OS !== 'web') {
    return Linking.createURL('sign-in');
  }

  const envOrigin = process.env.EXPO_PUBLIC_SITE_URL?.replace(/\/$/, '');

  if (typeof window !== 'undefined' && window.location?.origin) {
    const o = window.location.origin;
    const isLocalDev =
      /^https?:\/\/localhost\b/i.test(o) || /^https?:\/\/127\.0\.0\.1\b/i.test(o);
    if (isLocalDev) {
      return `${o}/sign-in`;
    }
    if (envOrigin && o === envOrigin) {
      return `${o}/sign-in`;
    }
  }

  return `${envOrigin ?? CARRIAGE_WEB_ORIGIN}/sign-in`;
}

/**
 * Starts Google OAuth. After redirect, the sign-in screen exchanges the PKCE code (web) or
 * `finalizeSupabaseOAuthFromUrl` (native), then `onAuthStateChange` with `SIGNED_IN` / `INITIAL_SESSION`
 * runs browse-vs-quiz routing in `src/app/(couple)/sign-in.tsx`.
 */
export async function signInWithGoogleOAuth(): Promise<void> {
  const redirectTo = getGoogleOAuthRedirectTo();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  if (error) throw error;

  if (Platform.OS === 'web') {
    if (data.url && typeof window !== 'undefined') {
      window.location.assign(data.url);
    }
    return;
  }

  if (!data?.url) return;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success' || !('url' in result) || !result.url) {
    return;
  }

  await finalizeSupabaseOAuthFromUrl(result.url);
}
