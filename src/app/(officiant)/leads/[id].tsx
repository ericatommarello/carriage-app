import { useLocalSearchParams, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useLayoutEffect, useRef, useState } from 'react';
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

/** Received (couple) bubbles — soft blush, distinct from composer input. */
const INCOMING_BUBBLE_BG = '#FDF0F0';

export default function OfficiantLeadThreadScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList>(null);
  const { isDesktop, horizontalGutter } = useResponsive();
  const { getThreadById, sendMessage } = useWedding();
  const thread = id ? getThreadById(id) : undefined;

  const messages = thread?.messages ?? [];
  const canSend = draft.trim().length > 0;

  const onSend = () => {
    if (!thread || !draft.trim()) return;
    sendMessage(thread.id, draft, 'officiant');
    setDraft('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  useLayoutEffect(() => {
    if (!thread) return;
    navigation.setOptions({
      title: thread.coupleLabel,
      headerBackTitle: 'Your leads',
    });
  }, [navigation, thread]);

  if (!thread) {
    return (
      <View style={styles.missingWrap}>
        <Text style={styles.missing}>Lead not found.</Text>
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
          <Text style={styles.sub}>{thread.coupleLabel}</Text>
          <Text style={styles.subTag}>Lead · bring the warmth ✦</Text>
        </View>
        <FlatList
          ref={listRef}
          style={styles.list}
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
            const mine = item.from === 'officiant';
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
            placeholder="Celebrate their vision, then guide next steps…"
            placeholderTextColor={WeddingPalette.textMuted}
            style={styles.input}
            multiline
          />
          <Pressable
            disabled={!canSend}
            onPress={onSend}
            accessibilityRole="button"
            accessibilityHint={canSend ? undefined : 'Type a message to send'}
            style={({ pressed }) => [
              styles.sendOuter,
              canSend && pressed && styles.sendOuterPressed,
              Platform.OS === 'web' && canSend && styles.sendWebOpaque,
            ]}>
            {canSend ? (
              <LinearGradient
                colors={[WeddingPalette.primary, WeddingPalette.primaryPressed]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.sendGradient, WeddingShadows.button]}>
                <Text style={styles.sendLabel}>Send</Text>
              </LinearGradient>
            ) : (
              <View style={styles.sendMuted}>
                <Text style={styles.sendLabelInactive}>Send</Text>
              </View>
            )}
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
    fontSize: 19,
    color: WeddingPalette.text,
  },
  subTag: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    color: WeddingPalette.primaryDark,
    marginTop: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingTop: 8,
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
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  bubbleBgMine: {
    backgroundColor: WeddingPalette.ink,
    borderBottomRightRadius: 6,
    ...WeddingShadows.soft,
    shadowOpacity: 0.12,
  },
  bubbleBgTheirs: {
    backgroundColor: INCOMING_BUBBLE_BG,
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
  sendOuter: {
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 1,
  },
  /** Keeps enabled Send looking fully saturated on web (avoids dimmed button chrome). */
  sendWebOpaque: {
    opacity: 1,
  },
  sendOuterPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.99 }],
  },
  sendGradient: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendMuted: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WeddingPalette.primaryMuted,
    borderWidth: 1,
    borderColor: WeddingPalette.borderStrong,
  },
  sendLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 15,
    color: WeddingPalette.onAccent,
  },
  sendLabelInactive: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 15,
    color: WeddingPalette.textMuted,
  },
  missingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WeddingPalette.background,
  },
  missing: {
    fontFamily: WeddingFonts.sans,
    fontSize: 16,
    color: WeddingPalette.textSecondary,
  },
});
