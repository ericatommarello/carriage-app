import type { BeliefsKey, WeddingSize } from '@/types/match-profile';

export type OfficiantPricing = {
  micro: number; // elopement, under 30 guests
  intimate: number; // 30–75
  full: number; // 75–150
  grand: number; // 150+
};

export type Officiant = {
  id: string;
  name: string;
  title: string;
  location: string;
  yearsExperience: number;
  pricing: OfficiantPricing;
  rating: number;
  reviewCount: number;
  bio: string;
  tags: string[];
  imageColor: string;
  /** Placeholder face; distinct `img` per celebrant in seed data. */
  photoUrl: string;
  beliefsStyle: BeliefsKey[];
  matchTags: string[];
  typicalSizes: WeddingSize[];
};

/** Price for browse badge: couple’s wedding size when matched, else micro (elopement). */
export function priceForWeddingSize(pricing: OfficiantPricing, weddingSize: WeddingSize | null | undefined): number {
  const tier: WeddingSize = weddingSize ?? 'micro';
  return pricing[tier];
}

export const MOCK_OFFICIANTS: Officiant[] = [
  {
    id: '1',
    name: 'Reverend Clara Lin',
    title: 'Interfaith & secular ceremonies',
    location: 'San Francisco Bay Area',
    yearsExperience: 12,
    pricing: { micro: 425, intimate: 685, full: 995, grand: 1325 },
    rating: 4.98,
    reviewCount: 127,
    bio: 'Warm, personal ceremonies that honor your story—whether spiritual, secular, or blended families.',
    tags: ['Bilingual EN/CN', 'LGBTQ+ affirming', 'Elopements'],
    imageColor: '#E8B4B8',
    photoUrl: 'https://i.pravatar.cc/300?img=12',
    beliefsStyle: ['secular', 'interfaith', 'spiritual'],
    matchTags: ['lgbtq-affirming', 'bilingual', 'interfaith'],
    typicalSizes: ['micro', 'intimate'],
  },
  {
    id: '2',
    name: 'James Okonkwo',
    title: 'Celebrant & vow coach',
    location: 'Los Angeles, CA',
    yearsExperience: 8,
    pricing: { micro: 465, intimate: 695, full: 1025, grand: 1385 },
    rating: 4.95,
    reviewCount: 84,
    bio: 'Former theatre director; I help couples craft vows that sound like you, not a template.',
    tags: ['Custom vows', 'Mic coaching', 'Large venues'],
    imageColor: '#D4C4B0',
    photoUrl: 'https://i.pravatar.cc/300?img=28',
    beliefsStyle: ['open', 'spiritual'],
    matchTags: ['vow-writing', 'mic-coaching', 'outdoor'],
    typicalSizes: ['full', 'grand'],
  },
  {
    id: '3',
    name: 'Sofia Morales',
    title: 'Catholic & mixed-tradition',
    location: 'Austin, TX',
    yearsExperience: 15,
    pricing: { micro: 395, intimate: 575, full: 840, grand: 1175 },
    rating: 4.99,
    reviewCount: 203,
    bio: 'Respectful navigation of church requirements while keeping the focus on your partnership.',
    tags: ['Premarital prep', 'Destination',       'Small chapels'],
    imageColor: '#C9B8C3',
    photoUrl: 'https://i.pravatar.cc/300?img=41',
    beliefsStyle: ['faith', 'interfaith'],
    matchTags: ['interfaith', 'destination', 'lgbtq-affirming'],
    typicalSizes: ['intimate', 'full'],
  },
  {
    id: '4',
    name: 'Theo & Sam (Co-officiants)',
    title: 'Quaker-inspired gatherings',
    location: 'Portland, OR',
    yearsExperience: 6,
    pricing: { micro: 495, intimate: 745, full: 1085, grand: 1395 },
    rating: 5.0,
    reviewCount: 41,
    bio: 'We specialize in intentional, community-forward ceremonies with room for silence and laughter.',
    tags: ['Outdoor', 'Non-traditional', 'Weekday weddings'],
    imageColor: '#B8C4C0',
    photoUrl: 'https://i.pravatar.cc/300?img=55',
    beliefsStyle: ['secular', 'spiritual', 'open'],
    matchTags: ['outdoor', 'lgbtq-affirming', 'vow-writing'],
    typicalSizes: ['micro', 'intimate'],
  },
  {
    id: '5',
    name: 'Minister Diane Roth',
    title: 'Traditional Protestant',
    location: 'Chicago, IL',
    yearsExperience: 22,
    pricing: { micro: 335, intimate: 515, full: 775, grand: 1095 },
    rating: 4.92,
    reviewCount: 316,
    bio: 'Clear, dignified services with optional scripture and unity rituals your families will recognize.',
    tags: ['Church liaison', 'Rehearsal included', 'Military honors'],
    imageColor: '#D8C8CE',
    photoUrl: 'https://i.pravatar.cc/300?img=68',
    beliefsStyle: ['faith', 'spiritual'],
    matchTags: ['military', 'interfaith', 'vow-writing'],
    typicalSizes: ['full', 'grand'],
  },
];
