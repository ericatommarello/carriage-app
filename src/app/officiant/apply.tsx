import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
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
import {
  CEREMONY_STYLE_OPTIONS,
  TRAVEL_RADIUS_OPTIONS,
  splitStyleSelections,
  type TravelRadiusOption,
} from '@/data/officiant-apply-options';
import { useResponsive } from '@/hooks/use-responsive';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const TOTAL_STEPS = 8;
/** Step 1 (identity): name, email — index 0 */
const STEP_IDENTITY_INDEX = 0;
const MATCH_MAX_WIDTH = 512;

const STEP_KICKERS = [
  'YOUR IDENTITY',
  'YOUR FACE',
  'YOUR CEREMONIES',
  'YOUR STORY',
  'YOUR REACH',
  'YOUR PRICING',
  'YOUR COMMITMENT',
  'ALMOST THERE',
];

type AgreementState = {
  commission: boolean;
  escrow: boolean;
  noSolicit: boolean;
  minPrice: boolean;
};

const AGREEMENT_ITEMS: { key: keyof AgreementState; label: string }[] = [
  {
    key: 'commission',
    label:
      "I agree to Carriage's 15% commission on bookings I receive through the platform.",
  },
  {
    key: 'escrow',
    label: 'I understand that a portion of each payout is held in escrow until after the wedding date.',
  },
  {
    key: 'noSolicit',
    label: 'I will not solicit Carriage-generated leads to book outside the platform.',
  },
  {
    key: 'minPrice',
    label: 'My starting prices will be $350 or above.',
  },
];

const MIN_LISTING_PRICE = 350;

function parseMoney(raw: string): number | null {
  const n = parseInt(raw.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Inline error when a field has a parsed price below the platform minimum. */
function minListingPriceError(raw: string): string | undefined {
  const n = parseMoney(raw);
  if (n === null) return undefined;
  if (n < MIN_LISTING_PRICE) return 'Minimum listing price is $350.';
  return undefined;
}

function looksLikePhotoUrl(s: string): boolean {
  const t = s.trim().toLowerCase();
  return t.startsWith('http://') || t.startsWith('https://');
}

export default function OfficiantApplyScreen() {
  const router = useRouter();
  const { horizontalGutter, isDesktop, isTopNavLayout, width } = useResponsive();
  const safeEdges = isDesktop || isTopNavLayout ? ([] as const) : (['top'] as const);
  const contentMax = Math.min(MATCH_MAX_WIDTH, width - horizontalGutter * 2);
  const scrollRef = useRef<ScrollView>(null);

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [selectedStyleIds, setSelectedStyleIds] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [location, setLocation] = useState('');
  const [travelRadius, setTravelRadius] = useState<TravelRadiusOption | null>(null);
  const [priceMicro, setPriceMicro] = useState('');
  const [priceIntimate, setPriceIntimate] = useState('');
  const [priceFull, setPriceFull] = useState('');
  const [priceGrand, setPriceGrand] = useState('');
  const [agreements, setAgreements] = useState<AgreementState>({
    commission: false,
    escrow: false,
    noSolicit: false,
    minPrice: false,
  });

  const [styleContinueError, setStyleContinueError] = useState(false);
  const [pricingContinueError, setPricingContinueError] = useState(false);
  const [submitErrors, setSubmitErrors] = useState<{
    name?: string;
    email?: string;
    pricing?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);
  const [maxStepVisited, setMaxStepVisited] = useState(0);

  useEffect(() => {
    setMaxStepVisited((m) => Math.max(m, step));
  }, [step]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }, [step]);

  const goToStep = (index: number) => {
    const t = Math.max(0, Math.min(TOTAL_STEPS - 1, index));
    if (t > maxStepVisited) return;
    setStep(t);
  };

  const goBackOneStep = () => setStep((s) => Math.max(0, s - 1));

  const clearSubmitError = (key: 'name' | 'email') => {
    setSubmitErrors((e) => ({ ...e, [key]: undefined }));
  };

  const toggleStyleId = (id: string) => {
    setSelectedStyleIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setStyleContinueError(false);
  };

  const skipForward = () => {
    setStyleContinueError(false);
    setPricingContinueError(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const advance = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));

  const continueFromStyles = () => {
    if (selectedStyleIds.length < 1) {
      setStyleContinueError(true);
      return;
    }
    setStyleContinueError(false);
    advance();
  };

  const continueFromPricing = () => {
    const pm = [priceMicro, priceIntimate, priceFull, priceGrand].map(parseMoney);
    if (pm.some((x) => x === null)) {
      setPricingContinueError(true);
      return;
    }
    if (pm.some((x) => x! < MIN_LISTING_PRICE)) {
      setPricingContinueError(false);
      return;
    }
    setPricingContinueError(false);
    advance();
  };

  const submit = async () => {
    const { beliefsStyle, ceremonyTags } = splitStyleSelections(selectedStyleIds);
    const errs: { name?: string; email?: string; pricing?: string } = {};
    if (!fullName.trim()) errs.name = 'Please add your name.';
    const em = email.trim();
    if (!em) errs.email = 'Please add your email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) errs.email = 'Enter a valid email address.';

    const pm = [priceMicro, priceIntimate, priceFull, priceGrand].map(parseMoney);
    if (pm.some((x) => x === null)) {
      errs.pricing = 'Enter a positive number for all four wedding sizes.';
    } else if (pm.some((x) => x! < MIN_LISTING_PRICE)) {
      errs.pricing = 'Each listing price must be at least $350.';
    }

    setSubmitErrors(errs);
    if (Object.keys(errs).length > 0) return;

    if (!isSupabaseConfigured()) {
      Alert.alert(
        'Configuration needed',
        'Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your environment, then try again.',
      );
      return;
    }

    const yearsParsed = yearsExperience.trim() ? parseInt(yearsExperience.replace(/[^0-9]/g, ''), 10) : NaN;
    const yearsVal = Number.isFinite(yearsParsed) && yearsParsed >= 0 ? yearsParsed : null;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('officiant_applications').insert({
        name: fullName.trim(),
        business_name: businessName.trim(),
        specialty: specialty.trim(),
        bio: bio.trim(),
        location: location.trim(),
        travel_radius: travelRadius ?? '',
        photo_url: photoUrl.trim(),
        years_experience: yearsVal,
        ceremony_tags: ceremonyTags,
        beliefs_style: beliefsStyle,
        price_micro: pm[0]!,
        price_intimate: pm[1]!,
        price_full: pm[2]!,
        price_grand: pm[3]!,
        email: em.toLowerCase(),
        status: 'pending',
        is_active: false,
      });

      if (error) {
        Alert.alert('Could not submit', error.message ?? 'Please try again in a moment.');
        return;
      }
      router.replace('/officiant/pending');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedLabels = selectedStyleIds
    .map((id) => CEREMONY_STYLE_OPTIONS.find((o) => o.id === id)?.label)
    .filter(Boolean) as string[];

  const agreementsComplete = Object.values(agreements).every(Boolean);

  const toggleAgreement = (key: keyof AgreementState) => {
    setAgreements((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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
            paddingBottom: isDesktop || isTopNavLayout ? 48 : 36,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.column, { maxWidth: contentMax, alignSelf: 'center', width: '100%' }]}>
          <View style={styles.progressRow}>
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
              const reachable = i <= maxStepVisited;
              const isActive = i === step;
              const isDone = (i < step || (i > step && i <= maxStepVisited)) && !isActive;
              const isFuture = i > maxStepVisited;
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityLabel={`Step ${i + 1} of ${TOTAL_STEPS}`}
                  accessibilityState={{ disabled: !reachable }}
                  disabled={!reachable}
                  onPress={() => goToStep(i)}
                  hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
                  style={({ pressed }) => [
                    styles.progressDotHit,
                    pressed && reachable && styles.progressDotHitPressed,
                  ]}>
                  <View
                    style={[
                      styles.progressDot,
                      isActive && styles.progressDotActive,
                      isDone && styles.progressDotDone,
                      isFuture && styles.progressDotFuture,
                    ]}
                  />
                </Pressable>
              );
            })}
          </View>
          <View style={styles.thinBarWrap}>
            <View style={[styles.thinBarFill, { width: `${((step + 1) / TOTAL_STEPS) * 100}%` }]} />
          </View>

          {step === 0 ? (
            <StepShell kicker={STEP_KICKERS[0]} heading="Let's build your profile">
              <LabeledInput
                label="Full name"
                value={fullName}
                onChangeText={(t) => {
                  setFullName(t);
                  setSubmitErrors((e) => ({ ...e, name: undefined }));
                }}
                placeholder={"How you'd like to appear on Carriage"}
              />
              <LabeledInput
                label="Business or ministry name"
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="e.g. Ceremony Studio — or leave blank"
                optional
              />
              <LabeledInput
                label="Your specialty in one line"
                value={specialty}
                onChangeText={setSpecialty}
                placeholder="e.g. Interfaith & secular ceremonies"
              />
              <LabeledInput
                label="Email address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setSubmitErrors((e) => ({ ...e, email: undefined }));
                }}
                placeholder="For your approval notification"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <ContinueButton onPress={advance} isFirstStep />
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell
              kicker={STEP_KICKERS[1]}
              heading="Put a face to your name"
              sub="Couples connect with photos — this is the biggest trust signal on your card.">
              <View style={styles.photoPreviewOuter}>
                <View style={styles.photoPreviewRing}>
                  {looksLikePhotoUrl(photoUrl) ? (
                    <Image source={{ uri: photoUrl.trim() }} style={styles.photoPreviewImage} />
                  ) : (
                    <View style={styles.photoPreviewEmpty}>
                      <Text style={styles.photoPreviewCamera}>📷</Text>
                    </View>
                  )}
                </View>
              </View>
              <LabeledInput
                label="Photo link"
                value={photoUrl}
                onChangeText={setPhotoUrl}
                placeholder="Paste a link to your photo (JPG or PNG)"
                keyboardType="url"
                autoCapitalize="none"
              />
              <Text style={styles.fieldHelper}>
                A clear, warm headshot works best. We&apos;ll add direct upload soon.
              </Text>
              <StepBackLink onPress={goBackOneStep} />
              <ContinueButton onPress={advance} />
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell
              kicker={STEP_KICKERS[2]}
              heading="What kinds of ceremonies do you do?"
              sub="Pick all that apply.">
              <View style={styles.chipWrap}>
                {CEREMONY_STYLE_OPTIONS.map((o) => {
                  const on = selectedStyleIds.includes(o.id);
                  return (
                    <Pressable
                      key={o.id}
                      onPress={() => toggleStyleId(o.id)}
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
              {styleContinueError ? (
                <Text style={styles.inlineError}>Pick at least one to continue, or tap Skip →</Text>
              ) : null}
              <StepBackLink onPress={goBackOneStep} />
              <ContinueButton onPress={continueFromStyles} />
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              kicker={STEP_KICKERS[3]}
              heading="Why do couples love working with you?"
              sub="2–4 sentences. This is your pitch — make it warm and specific.">
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Warm, personal ceremonies that honor your story — whether spiritual, secular, or beautifully blended..."
                placeholderTextColor={WeddingPalette.textMuted}
                style={styles.bioInput}
                multiline
                textAlignVertical="top"
              />
              <LabeledInput
                label="Years officiating"
                value={yearsExperience}
                onChangeText={setYearsExperience}
                placeholder="e.g. 8"
                keyboardType="number-pad"
              />
              <StepBackLink onPress={goBackOneStep} />
              <ContinueButton onPress={advance} />
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 4 ? (
            <StepShell kicker={STEP_KICKERS[4]} heading="Where do you officiate?">
              <LabeledInput
                label="Primary location"
                value={location}
                onChangeText={setLocation}
                placeholder="City, state or region"
              />
              <Text style={styles.fieldLabel}>Travel radius</Text>
              <View style={styles.chipWrap}>
                {TRAVEL_RADIUS_OPTIONS.map((opt) => {
                  const on = travelRadius === opt;
                  return (
                    <Pressable
                      key={opt}
                      onPress={() => setTravelRadius(opt)}
                      style={({ pressed }) => [
                        styles.chip,
                        on && styles.chipOn,
                        pressed && styles.chipPressed,
                      ]}>
                      <Text style={[styles.chipLabel, on && styles.chipLabelOn]}>{opt}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <StepBackLink onPress={goBackOneStep} />
              <ContinueButton onPress={advance} />
              <SkipRow onSkip={skipForward} />
            </StepShell>
          ) : null}

          {step === 5 ? (
            <StepShell
              kicker={STEP_KICKERS[5]}
              heading="What do you charge?"
              sub="Set a price for each wedding size. Couples will see the price that matches their event.">
              <LabeledInput
                label="Elopement / under 30 guests"
                value={priceMicro}
                onChangeText={(t) => {
                  setPriceMicro(t);
                  setPricingContinueError(false);
                  setSubmitErrors((e) => ({ ...e, pricing: undefined }));
                }}
                placeholder="Amount in USD"
                keyboardType="number-pad"
                prefix="$"
                errorText={minListingPriceError(priceMicro)}
              />
              <LabeledInput
                label="Intimate (30–75 guests)"
                value={priceIntimate}
                onChangeText={(t) => {
                  setPriceIntimate(t);
                  setPricingContinueError(false);
                  setSubmitErrors((e) => ({ ...e, pricing: undefined }));
                }}
                placeholder="Amount in USD"
                keyboardType="number-pad"
                prefix="$"
                errorText={minListingPriceError(priceIntimate)}
              />
              <LabeledInput
                label="Full celebration (75–150 guests)"
                value={priceFull}
                onChangeText={(t) => {
                  setPriceFull(t);
                  setPricingContinueError(false);
                  setSubmitErrors((e) => ({ ...e, pricing: undefined }));
                }}
                placeholder="Amount in USD"
                keyboardType="number-pad"
                prefix="$"
                errorText={minListingPriceError(priceFull)}
              />
              <LabeledInput
                label="Grand affair (150+ guests)"
                value={priceGrand}
                onChangeText={(t) => {
                  setPriceGrand(t);
                  setPricingContinueError(false);
                  setSubmitErrors((e) => ({ ...e, pricing: undefined }));
                }}
                placeholder="Amount in USD"
                keyboardType="number-pad"
                prefix="$"
                errorText={minListingPriceError(priceGrand)}
              />
              <Text style={styles.pricingNote}>
                These are your starting rates — you can always discuss custom pricing in your first message.
              </Text>
              <Text style={styles.pricingTip}>
                💡 In Austin, most officiants earn $500–$700 for a full celebration.
              </Text>
              {pricingContinueError ? (
                <Text style={styles.inlineError}>Enter a positive amount for each tier to continue.</Text>
              ) : null}
              <StepBackLink onPress={goBackOneStep} />
              <ContinueButton onPress={continueFromPricing} />
              <SkipRow
                onSkip={() => {
                  setPricingContinueError(false);
                  skipForward();
                }}
              />
            </StepShell>
          ) : null}

          {step === 6 ? (
            <StepShell kicker={STEP_KICKERS[6]} heading="A few things before we make it official.">
              <View style={styles.agreementList}>
                {AGREEMENT_ITEMS.map((item) => {
                  const on = agreements[item.key];
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => toggleAgreement(item.key)}
                      style={({ pressed }) => [
                        styles.agreementRow,
                        on && styles.agreementRowOn,
                        pressed && styles.agreementRowPressed,
                      ]}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: on }}>
                      <View style={[styles.agreementCheck, on && styles.agreementCheckOn]}>
                        {on ? <Text style={styles.agreementCheckmark}>✓</Text> : null}
                      </View>
                      <Text style={[styles.agreementLabel, on && styles.agreementLabelOn]}>{item.label}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <StepBackLink onPress={goBackOneStep} />
              <ContinueButton onPress={advance} disabled={!agreementsComplete} />
            </StepShell>
          ) : null}

          {step === 7 ? (
            <StepShell kicker={STEP_KICKERS[7]} heading="Ready to join Carriage?">
              <View style={[styles.summaryCard, WeddingShadows.soft]}>
                <View style={styles.summaryPhotoRow}>
                  {looksLikePhotoUrl(photoUrl) ? (
                    <Image source={{ uri: photoUrl.trim() }} style={styles.summaryThumb} />
                  ) : (
                    <View style={[styles.summaryThumb, styles.summaryThumbPlaceholder]}>
                      <Text style={styles.summaryThumbLetter}>{fullName.trim().charAt(0) || '?'}</Text>
                    </View>
                  )}
                  <View style={styles.summaryHead}>
                    <Text style={styles.summaryName}>{fullName.trim() || 'Your name'}</Text>
                    <Text style={styles.summarySpecialty}>{specialty.trim() || 'Your specialty'}</Text>
                  </View>
                </View>
                {businessName.trim() ? (
                  <>
                    <Text style={styles.summaryLabel}>Business</Text>
                    <Text style={styles.summaryValue}>{businessName.trim()}</Text>
                  </>
                ) : null}
                <Text style={styles.summaryLabel}>Email</Text>
                <Text style={styles.summaryValue}>{email.trim() || '—'}</Text>
                <Text style={styles.summaryLabel}>Location</Text>
                <Text style={styles.summaryValue}>{location.trim() || '—'}</Text>
                {travelRadius ? (
                  <>
                    <Text style={styles.summaryLabel}>Travel</Text>
                    <Text style={styles.summaryValue}>{travelRadius}</Text>
                  </>
                ) : null}
                <Text style={styles.summaryLabel}>Styles & focus</Text>
                <View style={styles.summaryChipWrap}>
                  {selectedLabels.length ? (
                    selectedLabels.map((label) => (
                      <View key={label} style={styles.summaryChip}>
                        <Text style={styles.summaryChipText}>{label}</Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.summaryMuted}>—</Text>
                  )}
                </View>
                <Text style={styles.summaryLabel}>Pricing</Text>
                <Text style={styles.summaryPriceLine}>
                  Elopement · ${parseMoney(priceMicro) ?? '—'} · Intimate · ${parseMoney(priceIntimate) ?? '—'}
                </Text>
                <Text style={styles.summaryPriceLine}>
                  Full · ${parseMoney(priceFull) ?? '—'} · Grand · ${parseMoney(priceGrand) ?? '—'}
                </Text>
              </View>

              <StepBackLink onPress={goBackOneStep} />

              {submitErrors.name ? (
                <Pressable
                  onPress={() => {
                    setStep(STEP_IDENTITY_INDEX);
                    clearSubmitError('name');
                  }}
                  style={styles.submitErrorPress}
                  accessibilityRole="link"
                  accessibilityLabel="Go to name and email to fix this">
                  <Text style={styles.errorLink}>{submitErrors.name}</Text>
                </Pressable>
              ) : null}
              {submitErrors.email ? (
                <Pressable
                  onPress={() => {
                    setStep(STEP_IDENTITY_INDEX);
                    clearSubmitError('email');
                  }}
                  style={styles.submitErrorPress}
                  accessibilityRole="link"
                  accessibilityLabel="Go to email field to fix this">
                  <Text style={styles.errorLink}>{submitErrors.email}</Text>
                </Pressable>
              ) : null}
              {submitErrors.pricing ? (
                <Text style={styles.inlineError}>{submitErrors.pricing}</Text>
              ) : null}

              <TouchableOpacity
                activeOpacity={0.92}
                onPress={submit}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel="Submit my profile"
                style={[styles.submitBtn, WeddingShadows.button, submitting && styles.submitBtnDisabled]}>
                <LinearGradient
                  colors={[WeddingPalette.primary, WeddingPalette.primaryPressed]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitGradient}>
                  <Text style={styles.submitLabel}>{submitting ? 'Sending…' : 'Submit my profile →'}</Text>
                </LinearGradient>
              </TouchableOpacity>
              <Text style={styles.reviewFootnote}>
                We review every application personally. You&apos;ll hear from us within 2–3 business days.
              </Text>
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

function StepBackLink({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
      style={({ pressed }) => [styles.stepBackWrap, pressed && styles.stepBackPressed]}
      accessibilityRole="button"
      accessibilityLabel="Back to previous step">
      <Text style={styles.stepBackText}>← Back</Text>
    </Pressable>
  );
}

function ContinueButton({
  onPress,
  isFirstStep,
  disabled,
}: {
  onPress: () => void;
  isFirstStep?: boolean;
  disabled?: boolean;
}) {
  const dim = Boolean(disabled);
  return (
    <TouchableOpacity
      activeOpacity={dim ? 1 : 0.92}
      onPress={dim ? undefined : onPress}
      disabled={dim}
      accessibilityRole="button"
      accessibilityLabel="Continue"
      accessibilityState={{ disabled: dim }}
      style={[
        styles.continueBtn,
        isFirstStep ? styles.continueBtnFirstStep : styles.continueBtnAfterBack,
        !dim && WeddingShadows.button,
        dim && styles.continueBtnDimmed,
      ]}>
      {dim ? (
        <View style={[styles.continueGradient, styles.continueGradientDisabled]}>
          <Text style={styles.continueLabelDisabled}>Continue →</Text>
        </View>
      ) : (
        <LinearGradient
          colors={[WeddingPalette.primary, WeddingPalette.primaryPressed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.continueGradient}>
          <Text style={styles.continueLabel}>Continue →</Text>
        </LinearGradient>
      )}
    </TouchableOpacity>
  );
}

function SkipRow({ onSkip }: { onSkip: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onSkip}
      accessibilityRole="button"
      accessibilityLabel="Skip"
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={styles.skipWrap}>
      <Text style={styles.skipText}>Skip →</Text>
    </TouchableOpacity>
  );
}

function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  optional,
  keyboardType,
  autoCapitalize,
  multiline,
  prefix,
  errorText,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  optional?: boolean;
  keyboardType?: 'default' | 'email-address' | 'url' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences';
  multiline?: boolean;
  prefix?: string;
  errorText?: string;
}) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>
        {label}
        {optional ? <Text style={styles.optionalMark}> (optional)</Text> : null}
      </Text>
      <View style={prefix ? styles.inputRow : undefined}>
        {prefix ? <Text style={styles.inputPrefix}>{prefix}</Text> : null}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={WeddingPalette.textMuted}
          style={[styles.textInput, prefix && styles.textInputWithPrefix, multiline && styles.textInputMulti]}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
        />
      </View>
      {errorText ? <Text style={styles.fieldErrorBelow}>{errorText}</Text> : null}
    </View>
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
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 10,
  },
  progressDotHit: {
    paddingHorizontal: 6,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  progressDotHitPressed: {
    opacity: 0.85,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WeddingPalette.borderStrong,
  },
  progressDotFuture: {
    opacity: 0.35,
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
  fieldBlock: {
    gap: 6,
  },
  fieldLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 13,
    color: WeddingPalette.textSecondary,
  },
  optionalMark: {
    fontFamily: WeddingFonts.sans,
    color: WeddingPalette.textMuted,
  },
  fieldHelper: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textMuted,
    marginTop: -4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: WeddingPalette.borderStrong,
    borderRadius: 16,
    backgroundColor: WeddingPalette.surface,
    paddingLeft: 12,
  },
  inputPrefix: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 17,
    color: WeddingPalette.textSecondary,
    marginRight: 4,
  },
  textInput: {
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
  textInputWithPrefix: {
    flex: 1,
    borderWidth: 0,
    borderRadius: 0,
    paddingLeft: 0,
  },
  textInputMulti: {
    minHeight: 140,
    paddingTop: 14,
  },
  bioInput: {
    borderWidth: 2,
    borderColor: WeddingPalette.borderStrong,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: WeddingFonts.sans,
    fontSize: 17,
    lineHeight: 24,
    color: WeddingPalette.text,
    backgroundColor: WeddingPalette.surface,
    minHeight: 160,
  },
  photoPreviewOuter: {
    alignItems: 'center',
    marginBottom: 8,
  },
  photoPreviewRing: {
    width: 168,
    height: 168,
    borderRadius: 84,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: WeddingPalette.borderStrong,
    backgroundColor: WeddingPalette.primaryMuted,
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  photoPreviewEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WeddingPalette.primaryMuted,
  },
  photoPreviewCamera: {
    fontSize: 44,
    opacity: 0.85,
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
  inlineError: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 14,
    color: WeddingPalette.coralDeep,
    marginTop: 4,
  },
  submitErrorPress: {
    alignSelf: 'flex-start',
    marginTop: 6,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  errorLink: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 14,
    color: WeddingPalette.primary,
    textDecorationLine: 'underline',
  },
  stepBackWrap: {
    alignSelf: 'flex-start',
    marginTop: 8,
    marginBottom: 2,
    paddingVertical: 4,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  stepBackPressed: {
    opacity: 0.75,
  },
  stepBackText: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 15,
    color: WeddingPalette.textMuted,
  },
  pricingNote: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: WeddingPalette.textMuted,
    marginTop: 4,
  },
  pricingTip: {
    fontFamily: WeddingFonts.serifItalic,
    fontSize: 13,
    lineHeight: 20,
    color: WeddingPalette.textMuted,
    marginTop: 6,
  },
  fieldErrorBelow: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: WeddingPalette.coralDeep,
    marginTop: 2,
  },
  agreementList: {
    gap: 10,
    marginBottom: 4,
  },
  agreementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: WeddingPalette.borderStrong,
    backgroundColor: WeddingPalette.surface,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  agreementRowOn: {
    borderColor: WeddingPalette.primary,
    borderWidth: 2,
    paddingVertical: 13,
    paddingHorizontal: 15,
    backgroundColor: WeddingPalette.primaryMuted,
  },
  agreementRowPressed: {
    opacity: 0.92,
  },
  agreementCheck: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: WeddingPalette.borderStrong,
    backgroundColor: WeddingPalette.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  agreementCheckOn: {
    borderColor: WeddingPalette.primary,
    backgroundColor: WeddingPalette.surface,
  },
  agreementCheckmark: {
    fontSize: 15,
    fontFamily: WeddingFonts.sansSemibold,
    color: WeddingPalette.primary,
    lineHeight: 18,
  },
  agreementLabel: {
    flex: 1,
    fontFamily: WeddingFonts.sans,
    fontSize: 15,
    lineHeight: 22,
    color: WeddingPalette.text,
  },
  agreementLabelOn: {
    color: WeddingPalette.primaryDark,
  },
  continueBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'stretch',
    minHeight: 52,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  continueBtnFirstStep: {
    marginTop: 20,
  },
  continueBtnAfterBack: {
    marginTop: 12,
  },
  continueBtnDimmed: {
    ...(Platform.OS === 'web' ? ({ cursor: 'not-allowed' } as object) : null),
  },
  continueGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  continueGradientDisabled: {
    backgroundColor: WeddingPalette.border,
  },
  continueLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.onAccent,
  },
  continueLabelDisabled: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 16,
    color: WeddingPalette.textMuted,
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
  summaryCard: {
    backgroundColor: WeddingPalette.surface,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: WeddingPalette.border,
    marginBottom: 8,
  },
  summaryPhotoRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryThumb: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  summaryThumbPlaceholder: {
    backgroundColor: WeddingPalette.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryThumbLetter: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 28,
    color: WeddingPalette.primaryDark,
  },
  summaryHead: {
    flex: 1,
    minWidth: 0,
  },
  summaryName: {
    fontFamily: WeddingFonts.displayBold,
    fontSize: 22,
    color: WeddingPalette.text,
  },
  summarySpecialty: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 15,
    color: WeddingPalette.primaryDark,
    marginTop: 4,
  },
  summaryLabel: {
    fontFamily: WeddingFonts.sansSemibold,
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: WeddingPalette.textMuted,
    marginTop: 10,
    marginBottom: 4,
  },
  summaryValue: {
    fontFamily: WeddingFonts.sans,
    fontSize: 15,
    color: WeddingPalette.text,
    lineHeight: 22,
  },
  summaryChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  summaryChip: {
    backgroundColor: WeddingPalette.primaryMuted,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: WeddingPalette.primaryGlow,
  },
  summaryChipText: {
    fontFamily: WeddingFonts.sansMedium,
    fontSize: 12,
    color: WeddingPalette.primaryDark,
  },
  summaryMuted: {
    fontFamily: WeddingFonts.sans,
    fontSize: 15,
    color: WeddingPalette.textMuted,
  },
  summaryPriceLine: {
    fontFamily: WeddingFonts.sans,
    fontSize: 14,
    color: WeddingPalette.textSecondary,
    lineHeight: 22,
  },
  submitBtn: {
    marginTop: 12,
    borderRadius: 18,
    overflow: 'hidden',
    alignSelf: 'stretch',
    minHeight: 54,
    ...(Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null),
  },
  submitBtnDisabled: {
    opacity: 0.7,
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
  reviewFootnote: {
    fontFamily: WeddingFonts.sans,
    fontSize: 13,
    lineHeight: 20,
    color: WeddingPalette.textMuted,
    textAlign: 'center',
    marginTop: 14,
  },
});
