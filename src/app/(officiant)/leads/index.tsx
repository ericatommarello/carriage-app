import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import type { MessageThread } from '@/context/wedding-context';
import { useWedding } from '@/context/wedding-context';
import { useResponsive } from '@/hooks/use-responsive';

function needsReply(thread: MessageThread) {
  const last = thread.messages[thread.messages.length - 1];
  return !last || last.from === 'couple';
}

export default function OfficiantLeadsScreen() {
  const router = useRouter();
  const { threads } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout } = useResponsive();

  const rows = useMemo(() => [...threads].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)), [threads]);

  const snippet = (thread: MessageThread) => {
    const last = thread.messages[thread.messages.length - 1];
    return last?.body ?? 'Fresh energy in your inbox—pop in with a warm hello.';
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
          eyebrow="Pipeline"
          title="Your leads"
          subtitle="Every thread here is a couple betting on your voice—answer while the confetti’s still in the air."
        />

        <View style={[styles.inlineTipRow, isDesktop && styles.inlineTipRowDesktop]}>
          <Text style={styles.inlineTipSpark}>✦</Text>
          <Text style={[styles.inlineTipText, isDesktop && styles.inlineTipTextDesktop]}>
            Reply sweetly, reply swiftly — couples feel the momentum when you respond first.
          </Text>
        </View>

        {rows.length === 0 ? (
          <View style={[styles.empty, WeddingShadows.soft, isDesktop && styles.emptyDesktop]}>
            <Text style={styles.emptyEmoji}>☀️</Text>
            <Text style={styles.emptyTitle}>Inbox is quiet—for now</Text>
            <Text style={styles.emptyBody}>
              When Carriage couples reach out, they’ll land here with names, notes, and butterflies. Keep
              notifications on!
            </Text>
          </View>
        ) : (
          <View style={[styles.list, isDesktop && styles.listDesktop]}>
            {rows.map((thread) => {
              const reply = needsReply(thread);
              return (
                <Pressable
                  key={thread.id}
                  accessibilityRole="link"
                  accessibilityLabel={`Open thread with ${thread.coupleLabel}`}
                  onPress={() =>
                    router.push({ pathname: '/(officiant)/leads/[id]', params: { id: thread.id } })
                  }
                  style={({ pressed }) => [styles.row, WeddingShadows.soft, pressed && styles.rowPressed]}>
                  <View style={[styles.avatar, reply && styles.avatarHot]}>
                    <Text style={styles.avatarText}>{thread.coupleLabel.charAt(0)}</Text>
                  </View>
                  <View style={styles.rowMain}>
                    <Text style={styles.coupleName}>{thread.coupleLabel}</Text>
                    <Text style={styles.snippet} numberOfLines={2}>
                      {snippet(thread)}
                    </Text>
                  </View>
                  <Text style={styles.chev}>→</Text>
                </Pressable>
              );
            })}
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
  inlineTipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 20,
  },
  inlineTipRowDesktop: {
    maxWidth: 960,
    alignSelf: 'center',
  },
  inlineTipSpark: {
    fontSize: 14,
    lineHeight: 22,
    color: WeddingPalette.accent,
    marginTop: 2,
  },
  inlineTipText: {
    flex: 1,
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 15,
    lineHeight: 23,
    color: WeddingPalette.textSecondary,
  },
  inlineTipTextDesktop: {
    fontSize: 16,
    lineHeight: 24,
  },
  list: {
    gap: 14,
  },
  listDesktop: {
    maxWidth: 960,
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
    opacity: 0.95,
    transform: [{ scale: 0.993 }],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: WeddingPalette.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    borderWidth: 2,
    borderColor: WeddingPalette.border,
  },
  avatarHot: {
    borderColor: WeddingPalette.coral,
  },
  avatarText: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 20,
    color: WeddingPalette.primaryDark,
  },
  rowMain: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  coupleName: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 19,
    color: WeddingPalette.text,
  },
  snippet: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textSecondary,
  },
  chev: {
    fontSize: 20,
    color: WeddingPalette.coral,
    fontWeight: '600',
    marginLeft: 6,
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
