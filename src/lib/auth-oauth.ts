import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

void WebBrowser.maybeCompleteAuthSession();

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

/** Deep link path (group segments omitted) must match Supabase Auth redirect allowlist. */
const SIGN_IN_REDIRECT_PATH = 'sign-in';

export async function signInWithGoogleOAuth(): Promise<void> {
  const redirectTo = Linking.createURL(SIGN_IN_REDIRECT_PATH);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: Platform.OS !== 'web',
    },
  });
  if (error) throw error;

  if (Platform.OS === 'web') {
    if (data.url) {
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
