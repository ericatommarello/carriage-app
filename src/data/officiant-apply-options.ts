export type CeremonyStyleOption = {
  id: string;
  label: string;
  /** Values stored in `beliefs_style` (see BeliefsKey-like vocabulary + quaker). */
  beliefs?: string[];
  /** Values stored in `ceremony_tags`. */
  ceremony?: string[];
};

export const CEREMONY_STYLE_OPTIONS: CeremonyStyleOption[] = [
  { id: 'secular', label: 'Secular & non-religious', beliefs: ['secular'] },
  { id: 'interfaith', label: 'Interfaith & blended', beliefs: ['interfaith'] },
  { id: 'faith', label: 'Catholic & traditional faith', beliefs: ['faith'] },
  { id: 'spiritual', label: 'Spiritual but non-denominational', beliefs: ['spiritual'] },
  { id: 'quaker', label: 'Quaker & meeting-style', beliefs: ['quaker'] },
  { id: 'elopements', label: 'Elopements & micro weddings', ceremony: ['elopements'] },
  { id: 'destination', label: 'Destination weddings', ceremony: ['destination'] },
  { id: 'outdoor', label: 'Outdoor & nature settings', ceremony: ['outdoor'] },
  { id: 'lgbtq-affirming', label: 'LGBTQ+ affirming', ceremony: ['lgbtq-affirming'] },
  { id: 'bilingual', label: 'Bilingual ceremonies', ceremony: ['bilingual'] },
  { id: 'vow-writing', label: 'Vow writing help', ceremony: ['vow-writing'] },
  { id: 'mic-coaching', label: 'Mic & voice coaching', ceremony: ['mic-coaching'] },
  { id: 'military', label: 'Military honors', ceremony: ['military'] },
  { id: 'large-venue', label: 'Large venue experience', ceremony: ['large-venue'] },
];

export const TRAVEL_RADIUS_OPTIONS = [
  'Local only',
  'Within 50 miles',
  'Within 150 miles',
  'I travel anywhere',
] as const;

export type TravelRadiusOption = (typeof TRAVEL_RADIUS_OPTIONS)[number];

export function splitStyleSelections(selectedIds: string[]) {
  const beliefs = new Set<string>();
  const ceremony = new Set<string>();
  const idSet = new Set(selectedIds);
  for (const opt of CEREMONY_STYLE_OPTIONS) {
    if (!idSet.has(opt.id)) continue;
    opt.beliefs?.forEach((b) => beliefs.add(b));
    opt.ceremony?.forEach((c) => ceremony.add(c));
  }
  return { beliefsStyle: [...beliefs], ceremonyTags: [...ceremony] };
}
