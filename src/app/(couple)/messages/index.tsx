import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useWedding } from '@/context/wedding-context';

export default function CoupleMessagesListScreen() {
  const router = useRouter();
  const { threads, officiants } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();

  const rows = useMemo(() => {
    return [...threads].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
  }, [threads]);

  const labelForThread = (officiantId: string) => {
    return officiants.find((o) => o.id === officiantId)?.name ?? 'Officiant';
  };

  const snippet = (threadId: string) => {
    const t = threads.find((x) => x.id === threadId);
    const last = t?.messages[t.messages.length - 1];
    return last?.body ?? 'Your hello is waiting—send the first note!';
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalGutter,
            paddingTop: 8,
            paddingBottom: isDesktop || isTopNavLayout ? 48 : 24,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <ScreenHeader
          eyebrow="Inbox"
          title="Conversations"
          subtitle="Real humans, real timelines—follow up here while the excitement is fresh."
        />
        {rows.length === 0 ? (
          <View style={[styles.empty, WeddingShadows.soft, isDesktop && styles.emptyDesktop]}>
            <Text style={styles.emptyEmoji}>💌</Text>
            <Text style={styles.emptyTitle}>No threads yet</Text>
            <Text style={styles.emptyBody}>
              Fall for an officiant profile, tap Message, and introduce yourselves. The good vibes start
              with one brave sentence.
            </Text>
          </View>
        ) : (
          <View style={[styles.list, isDesktop && styles.listDesktop]}>
            {rows.map((thread) => (
              <Pressable
                key={thread.id}
                onPress={() =>
                  router.push({ pathname: '/(couple)/messages/[id]', params: { id: thread.id } })
                }
                style={({ pressed }) => [styles.row, WeddingShadows.soft, pressed && styles.rowPressed]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{labelForThread(thread.officiantId).charAt(0)}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={styles.rowTitle}>{labelForThread(thread.officiantId)}</Text>
                  <Text style={styles.rowHint} numberOfLines={2}>
                    {snippet(thread.id)}
                  </Text>
                </View>
                <Text style={styles.chev}>→</Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
  },
  scroll: {
    width: '100%',
    maxWidth: '100%',
  },
  list: {
    gap: 14,
  },
  listDesktop: {
    maxWidth: 900,
    alignSelf: 'flex-start',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WeddingPalette.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: WeddingPalette.borderStrong,
  },
  rowPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.992 }],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: WeddingPalette.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: WeddingPalette.primaryGlow,
  },
  avatarText: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 20,
    color: WeddingPalette.primaryDark,
  },
  rowText: {
    flex: 1,
    gap: 5,
  },
  rowTitle: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 19,
    color: WeddingPalette.text,
  },
  rowHint: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textSecondary,
  },
  chev: {
    fontSize: 20,
    color: WeddingPalette.coral,
    marginLeft: 6,
    fontWeight: '600',
  },
  empty: {
    paddingVertical: 36,
    paddingHorizontal: 22,
    borderRadius: 20,
    backgroundColor: WeddingPalette.surface,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    alignItems: 'center',
  },
  emptyDesktop: {
    maxWidth: 640,
    alignSelf: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 24,
    color: WeddingPalette.text,
    marginBottom: 10,
  },
  emptyBody: {
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    lineHeight: 24,
    color: WeddingPalette.textSecondary,
    textAlign: 'center',
  },
});
