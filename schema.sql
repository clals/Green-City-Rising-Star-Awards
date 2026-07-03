-- =========================================================================================
-- SUPABASE RELATIONAL DATABASE SCHEMA & ROW-LEVEL SECURITY POLICY SUITE
-- TEMPORARY AWARD VOTING PLATFORM
-- =========================================================================================

-- Enable UUID extension for secure identifiers
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. TABLE DEFINITIONS
-- ==========================================

-- A. Categories Table
create table categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- B. Contestants Table
create table contestants (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  category text not null references categories(name) on delete cascade on update cascade,
  description text not null,
  photo_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- C. Voting Codes Table (One-time tickets)
create table voting_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  used boolean default false not null,
  used_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- D. Votes Table (Anonymous - has no foreign keys back to voting_codes)
create table votes (
  id uuid default gen_random_uuid() primary key,
  contestant_id text not null,
  category text not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);

-- E. Settings Table (Global system configurations)
create table settings (
  id uuid default gen_random_uuid() primary key,
  voting_open timestamp with time zone not null,
  voting_close timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==========================================
-- 2. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable security sheets
alter table categories enable row level security;
alter table contestants enable row level security;
alter table voting_codes enable row level security;
alter table votes enable row level security;
alter table settings enable row level security;

-- A. Categories Policies
create policy "Allow public read access to categories" 
  on categories for select using (true);
create policy "Allow admin write access to categories" 
  on categories for all using (auth.role() = 'authenticated');

-- B. Contestants Policies
create policy "Allow public read access to contestants" 
  on contestants for select using (true);
create policy "Allow admin write access to contestants" 
  on contestants for all using (auth.role() = 'authenticated');

-- C. Voting Codes Policies
create policy "Allow public check of codes" 
  on voting_codes for select using (true);
create policy "Allow admin write access to codes" 
  on voting_codes for all using (auth.role() = 'authenticated');

-- D. Votes Policies (Anonymous Submission Engine)
create policy "Allow anyone to submit votes anonymously" 
  on votes for insert with check (true);
create policy "Only admin can view and count vote tallies" 
  on votes for select using (auth.role() = 'authenticated');
create policy "Only admin can delete votes" 
  on votes for delete using (auth.role() = 'authenticated');

-- E. Settings Policies
create policy "Allow public check of voting schedule" 
  on settings for select using (true);
create policy "Only admin can update settings" 
  on settings for all using (auth.role() = 'authenticated');


-- ==========================================
-- 3. CORE SEED DATA
-- ==========================================

insert into categories (name, description) values
('Best Artist', 'Visual arts, painting, sculpting, and immersive design installations'),
('Best Singer', 'Outstanding solo vocal performance, range, and original songwriting'),
('Best Actor', 'Outstanding lead or supporting performance in a feature theatrical release'),
('Best Actress', 'Outstanding lead or supporting performance in a feature theatrical release'),
('Best Content Creator', 'Influential digital entertainment, education, and lifestyle video curation'),
('Best Startup', 'Innovative tech or green-energy social enterprise founded in the past fiscal year');

insert into contestants (name, category, description, photo_url) values
('Elena Rostova', 'Best Artist', 'Classical oil painter known for her modern landscapes blending dramatic lighting and deep natural shadows.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'),
('Marcus Vance', 'Best Artist', 'Environmental sculptor working exclusively with recycled ocean plastics, glass, and discarded copper wire.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300'),
('Sora Takahashi', 'Best Artist', 'Digital surrealist artist exploring AI-human collaboration, VR sculptures, and generative landscapes.', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300'),
('Aria Chen', 'Best Singer', 'Indie pop vocalist with a beautiful four-octave range and deeply intimate, acoustic-driven songwriting.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300'),
('Damian Vance', 'Best Singer', 'Neo-soul singer and multi-instrumentalist blending classic R&B hooks with spacey analog synthesizers.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300'),
('Julian Sterling', 'Best Actor', 'Dedicated method actor acclaimed for his transformative physical role in the biographical drama "The Foundry".', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300'),
('Chloe Laurent', 'Best Actress', 'Expressive dramatic actress celebrated for her silent, emotionally charged performance in the arthouse film "Echoes".', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300'),
('EcoGrid Systems', 'Best Startup', 'Developing AI-driven decentralized neighborhood micro-grids powered entirely by local solar-battery loops.', 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=300');

-- Pre-populate default voting codes
insert into voting_codes (code) values
('VOTE-GOLD-2026'),
('VOTE-VIP-7788'),
('VOTE-PRESS-4411'),
('VOTE-GUEST-3001'),
('VOTE-CREW-9922');

-- Seed settings (Voting open now, closing in 7 days)
insert into settings (voting_open, voting_close) values
(now(), now() + interval '7 days');
