import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { MOCK_OFFICIANTS } from '@/data/mock-officiants';
import type { MatchProfile } from '@/types/match-profile';

export type UserRole = 'couple' | 'officiant';

export type ChatMessage = {
  id: string;
  threadId: string;
  body: string;
  sentAt: string;
  from: 'couple' | 'officiant';
};

export type MessageThread = {
  id: string;
  officiantId: string;
  coupleLabel: string;
  messages: ChatMessage[];
  updatedAt: string;
};

type WeddingContextValue = {
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  officiants: typeof MOCK_OFFICIANTS;
  favoriteIds: Set<string>;
  toggleFavorite: (officiantId: string) => void;
  threads: MessageThread[];
  getThreadById: (id: string) => MessageThread | undefined;
  getOrCreateThreadForOfficiant: (officiantId: string, coupleLabel?: string) => MessageThread;
  sendMessage: (threadId: string, body: string, from: 'couple' | 'officiant') => void;
  coupleDisplayName: string;
  setCoupleDisplayName: (name: string) => void;
  officiantBusinessName: string;
  setOfficiantBusinessName: (name: string) => void;
  matchProfile: MatchProfile | null;
  setMatchProfile: (profile: MatchProfile | null) => void;
};

const WeddingContext = createContext<WeddingContextValue | null>(null);

function nowIso() {
  return new Date().toISOString();
}

function seedThreads(): MessageThread[] {
  const t: MessageThread = {
    id: 'thread-seed-1',
    officiantId: '1',
    coupleLabel: 'Alex & Morgan',
    updatedAt: nowIso(),
    messages: [
      {
        id: 'm1',
        threadId: 'thread-seed-1',
        body: "Hi Clara — we're planning a small garden wedding in May. Are you available the weekend of the 17th?",
        sentAt: nowIso(),
        from: 'couple',
      },
    ],
  };
  return [t];
}

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(() => new Set());
  const [threads, setThreads] = useState<MessageThread[]>(seedThreads);
  const [coupleDisplayName, setCoupleDisplayName] = useState('Alex & Morgan');
  const [officiantBusinessName, setOfficiantBusinessName] = useState('Ceremony Studio');
  const [matchProfile, setMatchProfile] = useState<MatchProfile | null>(null);

  const toggleFavorite = useCallback((officiantId: string) => {
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(officiantId)) next.delete(officiantId);
      else next.add(officiantId);
      return next;
    });
  }, []);

  const getThreadById = useCallback(
    (id: string) => threads.find((t) => t.id === id),
    [threads],
  );

  const getOrCreateThreadForOfficiant = useCallback(
    (officiantId: string, coupleLabel?: string) => {
      let thread = threads.find((t) => t.officiantId === officiantId);
      if (thread) return thread;
      const label = coupleLabel ?? coupleDisplayName;
      const newThread: MessageThread = {
        id: `thread-${officiantId}-${Date.now()}`,
        officiantId,
        coupleLabel: label,
        messages: [],
        updatedAt: nowIso(),
      };
      setThreads((prev) => [newThread, ...prev]);
      return newThread;
    },
    [threads, coupleDisplayName],
  );

  const sendMessage = useCallback((threadId: string, body: string, from: 'couple' | 'officiant') => {
    const trimmed = body.trim();
    if (!trimmed) return;
    const msg: ChatMessage = {
      id: `m-${Date.now()}`,
      threadId,
      body: trimmed,
      sentAt: nowIso(),
      from,
    };
    setThreads((prev) =>
      prev.map((t) =>
        t.id === threadId
          ? { ...t, messages: [...t.messages, msg], updatedAt: msg.sentAt }
          : t,
      ),
    );
  }, []);

  const value = useMemo<WeddingContextValue>(
    () => ({
      role,
      setRole,
      officiants: MOCK_OFFICIANTS,
      favoriteIds,
      toggleFavorite,
      threads,
      getThreadById,
      getOrCreateThreadForOfficiant,
      sendMessage,
      coupleDisplayName,
      setCoupleDisplayName,
      officiantBusinessName,
      setOfficiantBusinessName,
      matchProfile,
      setMatchProfile,
    }),
    [
      role,
      favoriteIds,
      toggleFavorite,
      threads,
      getThreadById,
      getOrCreateThreadForOfficiant,
      sendMessage,
      coupleDisplayName,
      officiantBusinessName,
      matchProfile,
    ],
  );

  return <WeddingContext.Provider value={value}>{children}</WeddingContext.Provider>;
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error('useWedding must be used within WeddingProvider');
  return ctx;
}
