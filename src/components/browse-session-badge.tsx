import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { User } from '@supabase/supabase-js';

import { WeddingFonts, WeddingPalette } from '@/constants/wedding-theme';
import { supabase } from '@/lib/supabase';

function avatarUrlFromUser(user: User): string | undefined {
  const m = user.user_metadata as Record<string, unknown> | undefined;
  if (!m) return undefined;
  const a = m.avatar_url ?? m.picture ?? m.avatar;
  return typeof a === 'string' && a.length > 0 ? a : undefined;
}

export function BrowseSessionBadge() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!user) return null;

  const uri = avatarUrlFromUser(user);
  const initial = (user.email?.trim()?.[0] ?? '?').toUpperCase();
  const label = user.email ? `Signed in as ${user.email}` : 'Signed in';

  return (
    <View style={styles.wrap} accessibilityLabel={label} accessibilityRole="image">
      {uri ? (
        <Image source={{ uri }} style={styles.avatar} contentFit="cover" transition={120} />
      ) : (
        <Text style={styles.initial}>{initial}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: WeddingPalette.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
  },
  initial: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.primaryDark,
  },
});
