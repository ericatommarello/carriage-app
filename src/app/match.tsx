import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { WeddingFonts, WeddingPalette, WeddingShadows } from '@/constants/wedding-theme';
import { useResponsive } from '@/hooks/use-responsive';
import { useWedding } from '@/context/wedding-context';
import {
  clearPendingMatchProfile,
  hasPendingQuizCompletionFlag,
  loadPendingMatchProfile,
  markQuizCompletedForCurrentUser,
  persistPendingMatchProfile,
  setPendingQuizCompletionFlag,
} from '@/lib/couple-profile';
import { supabase } from '@/lib/supabase';
import type { BeliefsKey, MatchProfile, WeddingSize } from '@/types/match-profile';

/** Number of progress dots / quiz screens (indices 0 … TOTAL_STEPS - 1). */
const TOTAL_STEPS = 5;
/** Location step (step 5 in copy, zero-based index 4). Capping skip/advance with TOTAL_STEPS-1 is easy to drift; keep explicit. */
const LOCATION_STEP_INDEX = 4;
const AUTO_ADVANCE_MS = 420;
const MATCH_MAX_WIDTH = 512;
const TRANSITION_MS = 2000;

const VIBE_OPTIONS: {
  value: MatchProfile['vibe'];
  emoji: string;
  title: string;
  desc: string;
}[] = [
  {
    value: 'warm-intimate',
    emoji: '🌿',
    title: 'Warm & intimate',
    desc: 'Small guest list, personal touches, lots of happy tears',
  },
  {
    value: 'joyful',
    emoji: '✨',
    title: 'Joyful & celebratory',
    desc: 'Big energy, big smiles, a room full of love',
  },
  {
    value: 'calm-sacred',
    emoji: '🕊️',
    title: 'Calm & sacred',
    desc: 'Meaningful pauses, reverent tone, timeless words',
  },
  {
    value: 'unexpected',
    emoji: '🎭',
    title: 'Unexpected & us',
    desc: 'Non-traditional, quirky, fully our own thing',
  },
];

const BELIEFS_OPTIONS: {
  value: BeliefsKey;
  emoji: string;
  title: string;
  desc: string;
}[] = [
  { value: 'secular', emoji: '🌎', title: 'Secular all the way', desc: 'No religious elements, please' },
  {
    value: 'spiritual',
    emoji: '🌙',
    title: 'Spiritual, not religious',
    desc: 'Meaningful and soulful, but not tied to a tradition',
  },
  { value: 'faith', emoji: '✝️', title: 'Rooted in faith', desc: 'Our tradition matters and should be honored' },
  {
    value: 'interfaith',
    emoji: '🤝',
    title: 'Blended or interfaith',
    desc: 'We come from different backgrounds and want both represented',
  },
  { value: 'open', emoji: '💛', title: 'Totally open', desc: 'Whatever feels right for the moment' },
];

const SIZE_OPTIONS: {
  value: WeddingSize;
  emoji: string;
  title: string;
  desc: string;
}[] = [
  { value: 'micro', emoji: '💐', title: 'Micro / elopement', desc: 'Under 30 guests, maybe just us' },
  { value: 'intimate', emoji: '🌳', title: 'Intimate gathering', desc: '30–75 people, close circle' },
  { value: 'full', emoji: '🎊', title: 'Full celebration', desc: '75–150, the whole crew' },
  { value: 'grand', emoji: '🏛️', title: 'Grand affair', desc: '150+ guests, go big' },
];

const MUST_HAVE_OPTIONS: { key: string; label: string }[] = [
  { key: 'lgbtq-affirming', label: 'LGBTQ+ affirming' },
  { key: 'bilingual', label: 'Bilingual ceremony' },
  { key: 'vow-writing', label: 'Vow writing help' },
  { key: 'mic-coaching', label: 'Mic & public speaking coaching' },
  { key: 'outdoor', label: 'Outdoor & nature ceremonies' },
  { key: 'military', label: 'Military or veteran honors' },
  { key: 'interfaith', label: 'Interfaith experience' },
  { key: 'destination', label: 'Destination weddings' },
];

function MatchTransition({
  onDone,
  horizontalGutter,
}: {
  onDone: () => void;
  horizontalGutter: number;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [barW, setBarW] = useState(0);

  useEffect(() => {
    if (barW <= 0) return;
    progress.setValue(0);
    const t = Animated.timing(progress, {
      toValue: 1,
      duration: TRANSITION_MS,
      useNativeDriver: false,
    });
    t.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => t.stop();
  }, [barW, onDone, progress]);

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(barW, 1)] });

  return (
    <SafeAreaView style={styles.transitionSafe} edges={['top', 'bottom']}>
      <View style={[styles.transitionInner, { paddingHorizontal: horizontalGutter }]}>
        <Text style={styles.transitionSpark}>✦</Text>
        <Text style={styles.transitionHeading}>Finding your people...</Text>
        <Text style={styles.transitionSub}>Sorting celebrants who fit your day.</Text>
        <View
          style={styles.progressTrack}
          onLayout={(e) => setBarW(e.nativeEvent.layout.width)}>
          <Animated.View style={[styles.progressFill, barW > 0 && { width: barWidth }]} />
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function CoupleMatchScreen() {
  const router = useRouter();
  const { setMatchProfile, matchProfile } = useWedding();
  const { horizontalGutter, isDesktop, isTopNavLayout, width } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);
  const contentMax = Math.min(MATCH_MAX_WIDTH, width - horizontalGutter * 2);

  const [step, setStep] = useState(0);
  const [showTransition, setShowTransition] = useState(false);
  const [vibe, setVibe] = useState<MatchProfile['vibe'] | null>(null);
  const [beliefs, setBeliefs] = useState<BeliefsKey | null>(null);
  const [weddingSize, setWeddingSize] = useState<WeddingSize | null>(null);
  const [mustHaves, setMustHaves] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [pendingPick, setPendingPick] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current != null) {
      clearTimeout(advanceTimerRef.current);
      advanceTimerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearAdvanceTimer(), [clearAdvanceTimer]);

  useEffect(() => {
    setPendingPick(null);
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  useEffect(() => {
    if (!matchProfile) return;
    setVibe(matchProfile.vibe);
    setBeliefs(matchProfile.beliefs);
    setWeddingSize(matchProfile.weddingSize);
    setMustHaves(matchProfile.mustHaves);
    setLocation(matchProfile.location);
  }, [matchProfile]);

  /** Return users who already finished the quiz (pending flag) to sign-in; restore draft answers from storage. */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const pendingComplete = await hasPendingQuizCompletionFlag();
      if (cancelled) return;

      if (pendingComplete && !session?.user?.id) {
        router.replace('/(couple)/sign-in');
        return;
      }

      if (matchProfile) return;

      const draft = await loadPendingMatchProfile();
      if (cancelled || !draft) return;
      setMatchProfile(draft);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, matchProfile, setMatchProfile]);

  const skipForward = () => {
    clearAdvanceTimer();
    setStep((s) => Math.min(s + 1, LOCATION_STEP_INDEX));
  };

  const goToLocationStep = useCallback(() => {
    clearAdvanceTimer();
    setStep(LOCATION_STEP_INDEX);
  }, [clearAdvanceTimer]);

  const scheduleAdvance = () => {
    clearAdvanceTimer();
    advanceTimerRef.current = setTimeout(() => {
      advanceTimerRef.current = null;
      setStep((s) => Math.min(s + 1, LOCATION_STEP_INDEX));
    }, AUTO_ADVANCE_MS);
  };

  const pickCard = <T extends string>(value: T, setter: (v: T) => void) => {
    setter(value);
    setPendingPick(value);
    scheduleAdvance();
  };

  const toggleMustHave = (key: string) => {
    setMustHaves((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const clearMustHaves = () => setMustHaves([]);

  const submit = () => {
    clearAdvanceTimer();
    const profile: MatchProfile = {
      vibe: vibe ?? 'joyful',
      beliefs: beliefs ?? 'open',
      weddingSize: weddingSize ?? 'intimate',
      mustHaves,
      location: location.trim(),
    };
    void (async () => {
      await persistPendingMatchProfile(profile);
      setMatchProfile(profile);
      setShowTransition(true);
    })();
  };

  const finishTransition = useCallback(() => {
    void (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user?.id) {
          await setPendingQuizCompletionFlag();
          router.replace('/(couple)/sign-in');
          return;
        }
        const ok = await markQuizCompletedForCurrentUser();
        if (ok) await clearPendingMatchProfile();
        router.replace('/(couple)/browse');
      } catch {
        setShowTransition(false);
      }
    })();
  }, [router]);

  const stepLabels = ['YOUR DAY', 'YOUR BELIEFS', 'YOUR CELEBRATION', 'YOUR NEEDS', 'YOUR LOCATION'];

  if (showTransition) {
    return <MatchTransition onDone={finishTransition} horizontalGutter={horizontalGutter} />;
  }

  return (
    <SafeAreaView style={styles.safe} edges={safeEdges}>
      <ScrollView
        ref={scrollRef}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={[
          styles.scroll,
          {
            paddingHorizontal: horizontalGutter,
            paddingBottom: isDesktop || isTopNavLayout ? 48 : 32,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.column, { maxWidth: contentMax, alignSelf: 'center', width: '100%' }]}>
          <View style={styles.progressRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressDot,
                  i === step && styles.progressDotActive,
                  i < step && styles.progressDotDone,
                ]}
              />
            ))}
          </View>
          <View style={styles.thinBarWrap}>
            <View style={[styles.thinBarFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
          </View>

          {step === 0 ? (
            <StepShell kicker={stepLabels[0]} heading="How do you want your ceremony to feel?">
              {VIBE_OPTIONS.map((o) => (
                <AnswerCard
                  key={o.value}
                  emoji={o.emoji}
                  title={o.title}
                  description={o.desc}
                  selected={vibe === o.value}
                  dim={pendingPick !== null && pendingPick !== o.value}
                  onPress={() => pickCard(o.value, setVibe)}
                />
              ))}
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell kicker={stepLabels[1]} heading="What's your spiritual take?">
              {BELIEFS_OPTIONS.map((o) => (
                <AnswerCard
                  key={o.value}
                  emoji={o.emoji}
                  title={o.title}
                  description={o.desc}
                  selected={beliefs === o.value}
                  dim={pendingPick !== null && pendingPick !== o.value}
                  onPress={() => pickCard(o.value, setBeliefs)}
                />
              ))}
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell kicker={stepLabels[2]} heading="What kind of wedding is it?">
              {SIZE_OPTIONS.map((o) => (
                <AnswerCard
                  key={o.value}
                  emoji={o.emoji}
                  title={o.title}
                  description={o.desc}
                  selected={weddingSize === o.value}
                  dim={pendingPick !== null && pendingPick !== o.value}
                  onPress={() => pickCard(o.value, setWeddingSize)}
                />
              ))}
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              kicker={stepLabels[3]}
              heading="Any must-haves for your officiant?"
              sub="Pick all that apply — or skip if you're open.">
              <View style={styles.chipWrap}>
                {MUST_HAVE_OPTIONS.map((o) => {
                  const on = mustHaves.includes(o.key);
                  return (
                    <Pressable
                      key={o.key}
                      onPress={() => toggleMustHave(o.key)}
                      style={({ pressed }) => [
                        styles.chip,
                        on && styles.chipOn,
                        pressed && styles.chipPressed,
                      ]}>
                      <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{o.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable onPress={clearMustHaves} style={styles.noneChip}>
                <Text style={styles.noneChipText}>None of these / just find me a great fit</Text>
              </Pressable>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={goToLocationStep}
                accessibilityRole="button"
                accessibilityLabel="Continue to wedding location"
                style={[styles.continueBtn, WeddingShadows.button]}>
                <LinearGradient
                  colors={[WeddingPalette.primary, WeddingPalette.primaryPressed]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.continueGradient}>
                  <Text style={styles.continueLabel}>Continue →</Text>
                </LinearGradient>
              </TouchableOpacity>
              <SkipRow onSkip={goToLocationStep} label="Skip →" />
            </StepShell>
          ) : null}

          {step === 4 ? (
            <StepShell kicker={stepLabels[4]} heading="Where's your wedding?">
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder="City, state or region — or 'destination'"
                placeholderTextColor={WeddingPalette.textMuted}
                style={styles.locationInput}
              />
              <Text style={styles.locationHint}>We'll prioritize officiants who serve your area.</Text>
              <TouchableOpacity
                activeOpacity={0.92}
                onPress={submit}
                accessibilityRole="button"
                accessibilityLabel="Find my matches"
                style={[styles.submitBtn, WeddingShadows.button]}>
                <LinearGradient
                  colors={[WeddingPalette.primary, WeddingPalette.primaryPressed]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}>
                  <Text style={styles.submitLabel}>Find my matches →</Text>
                </LinearGradient>
              </TouchableOpacity>
            </StepShell>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StepShell({
  kicker,
  heading,
  sub,
  children,
}: {
  kicker: string;
  heading: string;
  sub?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.stepShell}>
      <Text style={styles.kicker}>✦ {kicker}</Text>
      <Text style={styles.heading}>{heading}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
      <View style={styles.stepBody}>{children}</View>
    </View>
  );
}

function AnswerCard({
  emoji,
  title,
  description,
  selected,
  dim,
  onPress,
}: {
  emoji: string;
  title: string;
  description: string;
  selected: boolean;
  dim: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        styles.card,
        Platform.OS === 'web' && hovered && !selected && styles.cardHover,
        selected && styles.cardSelected,
        dim && styles.cardDim,
        pressed && styles.cardPressed,
      ]}>
      <Text style={styles.cardEmoji}>{emoji}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardDesc}>{description}</Text>
    </Pressable>
  );
}

function SkipRow({ onSkip, label = 'Skip →' }: { onSkip: () => void; label?: string }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onSkip()}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={styles.skipWrap}>
      <Text style={styles.skipText}>{label}</Text>
    </TouchableOpacity>
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
  column: {},
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 10,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WeddingPalette.borderStrong,
  },
  progressDotActive: {
    backgroundColor: WeddingPalette.primary,
    transform: [{ scale: 1.15 }],
  },
  progressDotDone: {
    backgroundColor: WeddingPalette.primaryGlow,
  },
  thinBarWrap: {
    height: 3,
    borderRadius: 2,
    backgroundColor: WeddingPalette.border,
    marginBottom: 28,
    overflow: 'hidden',
  },
  thinBarFill: {
    height: '100%',
    backgroundColor: WeddingPalette.primary,
    borderRadius: 2,
  },
  stepShell: {
    width: '100%',
  },
  kicker: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 1.6,
    color: WeddingPalette.coralDeep,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heading: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 28,
    lineHeight: 34,
    color: WeddingPalette.text,
    marginBottom: 8,
  },
  sub: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 16,
    lineHeight: 24,
    color: WeddingPalette.textSecondary,
    marginBottom: 18,
  },
  stepBody: {
    gap: 12,
  },
  card: {
    backgroundColor: WeddingPalette.surface,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  cardHover: {
    backgroundColor: WeddingPalette.primaryMuted,
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: WeddingPalette.primary,
    backgroundColor: WeddingPalette.primaryMuted,
  },
  cardDim: {
    opacity: 0.55,
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.994 }],
  },
  cardEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  cardTitle: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 18,
    color: WeddingPalette.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: WeddingFonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: WeddingPalette.textSecondary,
  },
  skipWrap: {
    alignSelf: 'flex-end',
    marginTop: 6,
    marginBottom: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  skipText: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 15,
    color: WeddingPalette.primary,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: WeddingPalette.borderStrong,
    backgroundColor: WeddingPalette.surface,
  },
  chipOn: {
    borderColor: WeddingPalette.primary,
    backgroundColor: WeddingPalette.primaryMuted,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipLabel: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 14,
    color: WeddingPalette.text,
  },
  chipLabelOn: {
    color: WeddingPalette.primaryDark,
  },
  noneChip: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  noneChipText: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    color: WeddingPalette.textMuted,
  },
  continueBtn: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'stretch',
    minHeight: 52,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.onAccent,
  },
  locationInput: {
    borderWidth: 2,
    borderColor: WeddingPalette.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: WeddingFonts.sans,
    fontSize: 17,
    color: WeddingPalette.text,
    backgroundColor: WeddingPalette.surface,
  },
  locationHint: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textMuted,
    marginTop: 10,
  },
  submitBtn: {
    marginTop: 22,
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'stretch',
    minHeight: 54,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  submitGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitLabel: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 18,
    color: WeddingPalette.onAccent,
  },
  transitionSafe: {
    flex: 1,
    backgroundColor: WeddingPalette.background,
    justifyContent: 'center',
  },
  transitionInner: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  transitionSpark: {
    fontSize: 48,
    color: WeddingPalette.accent,
    marginBottom: 20,
  },
  transitionHeading: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 32,
    lineHeight: 38,
    color: WeddingPalette.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  transitionSub: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 17,
    lineHeight: 26,
    color: WeddingPalette.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: WeddingPalette.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: WeddingPalette.primary,
    borderRadius: 3,
  },
});
