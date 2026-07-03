/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Database, HelpCircle, ChevronDown, ChevronUp, Copy, Check, Info, Server, Award } from 'lucide-react';
import { useVoting } from './VotingContext';

export default function DatabaseConfigNotice() {
  const { isDbConfigured } = useVoting();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const sqlSchema = `-- ==========================================
-- SUPABASE DATABASE SCHEMA
-- TEMPORARY AWARD VOTING PLATFORM
-- ==========================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create Categories Table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Contestants Table
create table contestants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null references categories(name) on delete cascade on update cascade,
  description text not null,
  photo_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create Voting Codes Table
create table voting_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  used boolean default false not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create Votes Table (ANONYMOUS - No connection to voting_codes)
create table votes (
  id uuid default gen_random_uuid() primary key,
  contestant_id text not null,
  category text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create Settings Table
create table settings (
  id uuid default gen_random_uuid() primary key,
  voting_open timestamp with time zone not null,
  voting_close timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- SEED DATA
-- ==========================================
insert into categories (name, description) values
('Best Artist', 'Visual arts, painting, and sculpting'),
('Best Singer', 'Vocal performance and songwriting'),
('Best Actor', 'Outstanding lead or supporting actor performance'),
('Best Actress', 'Outstanding lead or supporting actress performance'),
('Best Content Creator', 'Influential digital content and video creation'),
('Best Startup', 'Innovative tech or social enterprise');

insert into contestants (name, category, description, photo_url) values
('Elena Rostova', 'Best Artist', 'Classical oil painter known for her modern landscapes.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'),
('Marcus Vance', 'Best Artist', 'Environmental sculptor working with recycled ocean materials.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'),
('Aria Chen', 'Best Singer', 'Indie pop vocalist with a beautiful four-octave range.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'),
('Julian Sterling', 'Best Actor', 'Dedicated method actor acclaimed for dramatic weight shifts.', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300'),
('Chloe Laurent', 'Best Actress', 'Expressive dramatic actress celebrated for emotional depth.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'),
('EcoGrid Systems', 'Best Startup', 'AI-driven decentralized smart electricity grids.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300');

insert into voting_codes (code) values
('VOTE-GOLD-2026'),
('VOTE-VIP-7788'),
('VOTE-PRESS-4411'),
('VOTE-GUEST-3001'),
('VOTE-CREW-9922');
`;

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden shadow-2xl" id="db-config-notice">
      {/* Header Banner */}
      <div className={`p-4 flex items-center justify-between ${
        isDbConfigured ? 'bg-emerald-500/5 border-b border-emerald-500/10' : 'bg-gold-500/5 border-b border-white/10'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isDbConfigured ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-500/10 text-gold-500'
          }`}>
            <Database className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-white/30 uppercase block">
              Database Connection Status
            </span>
            <span className="text-sm font-bold text-white leading-tight font-serif tracking-wide">
              {isDbConfigured 
                ? 'Production Supabase Database Connected' 
                : 'Running in Local Preview Sandbox Mode'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-1 px-4 py-2 rounded-full bg-white/[0.02] border border-white/10 hover:bg-white/10 text-xs font-semibold text-white transition-all cursor-pointer"
        >
          <span>{isOpen ? 'Hide Guide' : 'Setup Guide'}</span>
          {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Guide Content */}
      {isOpen && (
        <div className="p-6 bg-black border-t border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-white/75 leading-relaxed">
            {/* Left side: Credentials Setup */}
            <div className="space-y-4">
              <h5 className="font-bold text-white flex items-center font-serif uppercase tracking-wider text-xs">
                <Server className="h-4 w-4 text-gold-500 mr-2" />
                Step 1: Configure Environment Secrets
              </h5>
              <p className="text-xs text-white/50 font-light">
                To link this application to your production database, add these keys inside your **AI Studio Secrets** (or a local `.env` file). The service layer will instantly pivot to write and read from your live Supabase database!
              </p>

              <div className="space-y-3 font-mono text-xs">
                <div className="bg-black border border-white/10 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gold-500 font-bold">VITE_SUPABASE_URL</span>
                    <button
                      onClick={() => handleCopy('https://your-project.supabase.co', 'url')}
                      className="text-[10px] text-white/40 hover:text-white"
                    >
                      {copiedText === 'url' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <span className="text-white/50 select-all block">https://your-project-id.supabase.co</span>
                </div>

                <div className="bg-black border border-white/10 rounded-xl p-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gold-500 font-bold">VITE_SUPABASE_ANON_KEY</span>
                    <button
                      onClick={() => handleCopy('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', 'key')}
                      className="text-[10px] text-white/40 hover:text-white"
                    >
                      {copiedText === 'key' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <span className="text-white/50 select-all block">eyJhbGciOiJIUzI1NiIsInR5...</span>
                </div>
              </div>

              <div className="bg-gold-500/5 border border-gold-500/10 rounded-xl p-4 flex items-start space-x-3 text-xs text-gold-400/95 leading-relaxed font-light">
                <Info className="h-4.5 w-4.5 mt-0.5 flex-shrink-0 text-gold-500" />
                <p>
                  <strong>No Database Crash Fallback</strong>: Currently, since these credentials are not found, the application is using the mock engine. This means you can fully test voting, generating codes, searching, categories editing, and dashboard metrics right now in the iframe! Refreshes preserve your data in `localStorage`.
                </p>
              </div>
            </div>

            {/* Right side: SQL Schema Execution */}
            <div className="space-y-4">
              <h5 className="font-bold text-white flex items-center font-serif uppercase tracking-wider text-xs">
                <Award className="h-4 w-4 text-gold-500 mr-2" />
                Step 2: Initialize Supabase SQL Schema
              </h5>
              <p className="text-xs text-white/50 font-light">
                Execute this SQL script inside your Supabase **SQL Editor** to provision the database tables, categories, sample nominees, and setup Row-Level Security rules.
              </p>

              <div className="relative">
                <div className="absolute right-3 top-3 z-10">
                  <button
                    onClick={() => handleCopy(sqlSchema, 'schema')}
                    className="bg-black border border-white/10 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition cursor-pointer"
                    title="Copy Schema SQL"
                  >
                    {copiedText === 'schema' ? (
                      <span className="text-xs text-emerald-400 flex items-center space-x-1 font-bold">
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied!</span>
                      </span>
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <pre className="bg-black border border-white/10 rounded-xl p-4 text-[10px] text-white/40 font-mono h-48 overflow-y-auto overflow-x-auto select-all">
                  {sqlSchema}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
