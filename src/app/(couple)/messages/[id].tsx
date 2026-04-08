import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useWedding } from '@/context/wedding-context';
import { useResponsive } from '@/hooks/use-responsive';

export default function CoupleThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);
  const { isDesktop, horizontalGutter } = useResponsive();
  const { getThreadById, sendMessage, officiants } = useWedding();
  const thread = id ? getThreadById(id) : undefined;
  const officiantName = useMemo(() => {
    if (!thread) return 'Officiant';
    return officiants.find((o) => o.id === thread.officiantId)?.name ?? 'Officiant';
  }, [thread, officiants]);

  const messages = thread?.messages ?? [];
  const canSend = draft.trim().length > 0;

  const onSend = () => {
    if (!thread || !draft.trim()) return;
    sendMessage(thread.id, draft, 'couple');
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  if (!thread) {
    return (
      <View style={styles.missingWrap}>
        <Text style={styles.missing}>Conversation not found.</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}>
      <View style={[styles.column, isDesktop && styles.columnDesktop]}>
        <View style={[styles.threadHeader, { paddingHorizontal: horizontalGutter }]}>
          <Text style={styles.sub}>{officiantName}</Text>
          <Text style={styles.subTag}>You&apos;ve got this ✦</Text>
        </View>
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom: 12 + insets.bottom,
              paddingHorizontal: horizontalGutter,
            },
          ]}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.from === 'couple';
            return (
              <View style={[styles.bubbleWrap, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleBgMine : styles.bubbleBgTheirs]}>
                  <Text style={[styles.bubbleText, mine ? styles.bubbleTextMine : styles.bubbleTextTheirs]}>
                    {item.body}
                  </Text>
                </View>
              </View>
            );
          }}
        />
        <View
          style={[
            styles.composer,
            { paddingBottom: 8 + insets.bottom, paddingHorizontal: horizontalGutter },
          ]}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Share your date, your vibe, your questions…"
            placeholderTextColor={WeddingPalette.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            onPress={onSend}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSend }}
            style={({ pressed }) => [
              styles.send,
              canSend ? styles.sendActive : styles.sendInactive,
              canSend && WeddingShadows.button,
              canSend && pressed && styles.sendPressed,
            ]}>
            <Text style={[styles.sendLabel, !canSend && styles.sendLabelInactive]}>Send</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
    alignItems: 'stretch',
  },
  column: {
    flex: 1,
    width: '100%',
  },
  columnDesktop: {
    maxWidth: 820,
    alignSelf: 'center',
    width: '100%',
  },
  threadHeader: {
    paddingTop: 6,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: WeddingPalette.border,
    backgroundColor: WeddingPalette.surfaceWarm,
  },
  sub: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 18,
    color: WeddingPalette.text,
  },
  subTag: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    color: WeddingPalette.coralDeep,
    marginTop: 4,
  },
  listContent: {
    paddingTop: 12,
  },
  bubbleWrap: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  bubbleMine: {
    justifyContent: 'flex-end',
  },
  bubbleTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleBgMine: {
    backgroundColor: WeddingPalette.primary,
    borderBottomRightRadius: 6,
    ...WeddingShadows.soft,
    shadowOpacity: 0.1,
  },
  bubbleBgTheirs: {
    backgroundColor: WeddingPalette.surface,
    borderWidth: 1.5,
    borderColor: WeddingPalette.borderStrong,
    borderBottomLeftRadius: 6,
  },
  bubbleText: {
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  bubbleTextMine: {
    color: WeddingPalette.onAccent,
  },
  bubbleTextTheirs: {
    color: WeddingPalette.text,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: WeddingPalette.border,
    backgroundColor: WeddingPalette.surface,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    color: WeddingPalette.text,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: WeddingPalette.backgroundWarm,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: WeddingPalette.border,
  },
  send: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendActive: {
    backgroundColor: WeddingPalette.primary,
  },
  sendInactive: {
    backgroundColor: WeddingPalette.primaryMuted,
    borderWidth: 1,
    borderColor: WeddingPalette.borderStrong,
  },
  sendPressed: {
    backgroundColor: WeddingPalette.primaryPressed,
  },
  sendLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 15,
    color: WeddingPalette.onAccent,
  },
  sendLabelInactive: {
    color: WeddingPalette.textMuted,
  },
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WeddingPalette.background,
    padding: 24,
  },
  missing: {
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    color: WeddingPalette.textSecondary,
  },
});
