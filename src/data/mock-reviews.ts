export type PlaceholderReview = {
  id: string;
  author: string;
  stars: number;
  quote: string;
};

const TEMPLATES: Omit<PlaceholderReview, 'id'>[] = [
  {
    author: 'Jordan & Casey',
    stars: 5,
    quote: 'Warm, funny, and made our ceremony feel truly ours.',
  },
  {
    author: 'Riley M.',
    stars: 5,
    quote: 'Guests still ask how we found someone so genuine.',
  },
  {
    author: 'Sam & Devon',
    stars: 4,
    quote: 'Calm energy on a chaotic day — exactly what we needed.',
  },
];

export function getPlaceholderReviews(officiantId: string): PlaceholderReview[] {
  return TEMPLATES.map((t, i) => ({ ...t, id: `${officiantId}-review-${i}` }));
}
