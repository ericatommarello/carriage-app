export type BeliefsKey = 'secular' | 'spiritual' | 'faith' | 'interfaith' | 'open';
export type WeddingSize = 'micro' | 'intimate' | 'full' | 'grand';

export type MatchProfile = {
  vibe: 'warm-intimate' | 'joyful' | 'calm-sacred' | 'unexpected';
  beliefs: BeliefsKey;
  weddingSize: WeddingSize;
  mustHaves: string[];
  location: string;
};

export type MatchableOfficiant = {
  beliefsStyle: BeliefsKey[];
  matchTags: string[];
  typicalSizes: WeddingSize[];
};

export function scoreOfficiantForMatch(o: MatchableOfficiant, p: MatchProfile): number {
  let score = 0;
  if (o.beliefsStyle.includes(p.beliefs)) score += 3;
  for (const tag of p.mustHaves) {
    if (o.matchTags.includes(tag)) score += 2;
  }
  if (o.typicalSizes.includes(p.weddingSize)) score += 1;
  return score;
}

export function sortOfficiantsByMatch<T extends MatchableOfficiant>(officiants: T[], p: MatchProfile): T[] {
  return [...officiants].sort(
    (a, b) => scoreOfficiantForMatch(b, p) - scoreOfficiantForMatch(a, p),
  );
}
