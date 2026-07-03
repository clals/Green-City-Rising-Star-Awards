/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Category, Contestant, VotingCode, VotingSettings, Vote } from '../types';
import { dbService, isSupabaseConfigured } from '../services/db';

interface VotingContextType {
  categories: Category[];
  contestants: Contestant[];
  votingCodes: VotingCode[];
  settings: VotingSettings;
  isDbConfigured: boolean;
  isLoading: boolean;
  activeCode: VotingCode | null;
  votingState: 'loading' | 'upcoming' | 'open' | 'closed';
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
  } | null;
  
  // Voter actions
  enterVotingCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  logoutVoter: () => void;
  submitVotes: (selections: Record<string, string>) => Promise<{ success: boolean; error?: string }>;
  
  // Admin actions
  refreshData: () => Promise<void>;
  addCategory: (name: string, description?: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addContestant: (contestant: Omit<Contestant, 'id'>) => Promise<void>;
  updateContestant: (id: string, contestant: Partial<Omit<Contestant, 'id'>>) => Promise<void>;
  deleteContestant: (id: string) => Promise<void>;
  generateCodes: (count: number, prefix?: string) => Promise<VotingCode[]>;
  updateSettings: (openDate: string, closeDate: string) => Promise<void>;
  resetVoting: () => Promise<void>;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [votingCodes, setVotingCodes] = useState<VotingCode[]>([]);
  const [settings, setSettings] = useState<VotingSettings>({ voting_open: '', voting_close: '' });
  const [activeCode, setActiveCode] = useState<VotingCode | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [votingState, setVotingState] = useState<'loading' | 'upcoming' | 'open' | 'closed'>('loading');
  const [timeRemaining, setTimeRemaining] = useState<VotingContextType['timeRemaining']>(null);

  // Load active session from sessionStorage if any, so refreshes don't wipe active code
  useEffect(() => {
    const savedCode = sessionStorage.getItem('voter_active_code');
    if (savedCode) {
      try {
        setActiveCode(JSON.parse(savedCode));
      } catch (e) {
        sessionStorage.removeItem('voter_active_code');
      }
    }
  }, []);

  // Fetch all database records
  const refreshData = useCallback(async () => {
    try {
      const [cats, conts, codes, setts] = await Promise.all([
        dbService.getCategories(),
        dbService.getContestants(),
        dbService.getVotingCodes(),
        dbService.getSettings(),
      ]);
      setCategories(cats);
      setContestants(conts);
      setVotingCodes(codes);
      setSettings(setts);
    } catch (error) {
      console.error('Failed to load award database content:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Real-time Countdown Timer & Voting State Calculation
  useEffect(() => {
    if (!settings.voting_open || !settings.voting_close) return;

    const calculateTime = () => {
      const now = new Date().getTime();
      const openTime = new Date(settings.voting_open).getTime();
      const closeTime = new Date(settings.voting_close).getTime();

      if (now < openTime) {
        setVotingState('upcoming');
        const diff = openTime - now;
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          totalMs: diff,
        });
      } else if (now >= openTime && now < closeTime) {
        setVotingState('open');
        const diff = closeTime - now;
        setTimeRemaining({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000),
          totalMs: diff,
        });
      } else {
        setVotingState('closed');
        setTimeRemaining(null);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [settings]);

  // ==========================================
  // VOTER FLOWS
  // ==========================================
  const enterVotingCode = async (codeStr: string) => {
    try {
      const validated = await dbService.validateCode(codeStr);
      if (!validated) {
        return { success: false, error: 'Invalid voting code. Please check for spelling mistakes.' };
      }
      if (validated.used) {
        return { success: false, error: 'This voting code has already been used to cast votes.' };
      }
      setActiveCode(validated);
      sessionStorage.setItem('voter_active_code', JSON.stringify(validated));
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'An error occurred during verification.' };
    }
  };

  const logoutVoter = () => {
    setActiveCode(null);
    sessionStorage.removeItem('voter_active_code');
  };

  const submitVotes = async (selections: Record<string, string>) => {
    if (votingState !== 'open') {
      return { success: false, error: 'Voting is not currently open.' };
    }

    try {
      // Convert selections object to votes rows
      const votesToSubmit = Object.entries(selections).map(([category, contestantId]) => ({
        category,
        contestant_id: contestantId,
      }));

      // 1. Submit Votes (Anonymous)
      await dbService.submitVotes(votesToSubmit);

      // 2. Record local vote session
      localStorage.setItem('has_voted_south_zoo', 'true');

      // 3. Refresh context data
      await refreshData();
      
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, error: err.message || 'Submission failed. Please try again.' };
    }
  };

  // ==========================================
  // ADMINISTRATIVE ACTIONS
  // ==========================================
  const addCategory = async (name: string, description?: string) => {
    setIsLoading(true);
    try {
      await dbService.addCategory(name, description);
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsLoading(true);
    try {
      await dbService.deleteCategory(id);
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const addContestant = async (contestant: Omit<Contestant, 'id'>) => {
    setIsLoading(true);
    try {
      await dbService.addContestant(contestant);
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const updateContestant = async (id: string, updated: Partial<Omit<Contestant, 'id'>>) => {
    setIsLoading(true);
    try {
      await dbService.updateContestant(id, updated);
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContestant = async (id: string) => {
    setIsLoading(true);
    try {
      await dbService.deleteContestant(id);
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const generateCodes = async (count: number, prefix?: string) => {
    setIsLoading(true);
    try {
      const generated = await dbService.generateVotingCodes(count, prefix);
      await refreshData();
      return generated;
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (openDate: string, closeDate: string) => {
    setIsLoading(true);
    try {
      await dbService.updateSettings({ voting_open: openDate, voting_close: closeDate });
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  const resetVoting = async () => {
    setIsLoading(true);
    try {
      await dbService.resetVoting();
      await refreshData();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VotingContext.Provider value={{
      categories,
      contestants,
      votingCodes,
      settings,
      isDbConfigured: isSupabaseConfigured,
      isLoading,
      activeCode,
      votingState,
      timeRemaining,
      
      enterVotingCode,
      logoutVoter,
      submitVotes,
      
      refreshData,
      addCategory,
      deleteCategory,
      addContestant,
      updateContestant,
      deleteContestant,
      generateCodes,
      updateSettings,
      resetVoting,
    }}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}
