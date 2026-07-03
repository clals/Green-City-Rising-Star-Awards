/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Contestant {
  id: string;
  name: string;
  category: string; // matches Category name or ID
  description: string;
  photo_url: string;
}

export interface VotingCode {
  id: string;
  code: string;
  used: boolean;
  used_at: string | null;
  created_at: string;
}

export interface Vote {
  id?: string;
  contestant_id: string;
  category: string;
  timestamp: string;
}

export interface VotingSettings {
  id?: string;
  voting_open: string;  // ISO timestamp string
  voting_close: string; // ISO timestamp string
}

export interface VoteCountResult {
  contestant_id: string;
  contestant_name: string;
  category: string;
  photo_url: string;
  votes: number;
}
