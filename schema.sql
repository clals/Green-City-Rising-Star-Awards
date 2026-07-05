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
('Bongofleva', 'Bongofleva - Music category for outstanding Swahili vocal performance and hooks'),
('Singeli', 'Singeli - Music category celebrating high-bpm rapid lyricists and hyper-speed beats'),
('Dancers (Group)', 'Choreographed dance crews delivering synchronized spectacular routines'),
('Dancers (Personal)', 'Outstanding solo dancers, viral creators, and fusion performers'),
('Models', 'Avant-garde runway, fashion modeling, and design trendsetters'),
('MC', 'Elite Masters of Ceremonies, hosting galas and premium events'),
('Dj', 'Outstanding turntable mastery, deep Afro-house sets, and live crowd controls'),
('Ubunifu', 'Creative design, modern high-street silhouette, and luxury fabrics'),
('Comedian', 'Side-splitting stand-up, localized satire, and witty storytelling');

insert into contestants (name, category, description, photo_url) values
('Alo Star', 'Bongofleva', 'Energetic Bongofleva vocal artist famous for melodic hooks, rhythmic Swahili storytelling, and record-breaking club anthems.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/ALOSTAR%20-SWALA%20(Music).PNG'),
('Malon Boy', 'Bongofleva', 'Rousing lyricist and singer blending traditional East African sounds with contemporary Afrobeat rhythms.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/MALON%20BOY%20(MUSIC).JPG'),
('Remedy Africa', 'Bongofleva', 'Pioneering producer-singer delivering soulful harmonies, acoustic depth, and inspiring pan-African themes.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/REMEDYAFRICAN.jpg'),
('Romeo Samdezy', 'Bongofleva', 'Romantic ballad vocalist capturing hearts with powerful ranges, intimate acoustic singles, and majestic live shows.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Romeo%20samdezy%20(MUSIC).JPG'),
('Arrow Music', 'Singeli', 'High-bpm Singeli pioneer pushing rapid lyricism and hyper-speed beats to the mainstages of East African festivals.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/ARROW%20MUSIC%20(Singeri).png'),
('Side Sela', 'Singeli', 'Known for witty socio-conscious rhymes, fast syncopations, and magnetic stage presence representing street culture.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/SIDE%20SELA%20(Singeri).png'),
('Eyes Power Dancer', 'Dancers (Group)', 'A highly coordinated crew delivering breathtaking synchronized street dances, acrobatic flips, and intense dramatic routines.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/972A0677.jpg'),
('The African fighter dancers', 'Dancers (Group)', 'Dynamic traditional-meets-modern dance theatre depicting historical tales through explosive physical choreography.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/THE%20AFRICAN%20FIGHTER%20DANCERS%20.jpg'),
('Mtoto wa mkoani', 'Dancers (Personal)', 'Vibrant solo performer beloved for expressive face-work, flexible movements, and popular viral social media challenges.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/MTOTO%20WA%20MKOANI%20(DANCE).jpg'),
('Khan Minji Dancer', 'Dancers (Personal)', 'Graceful contemporary-fusion dancer blending modern ballet, Afro-dance elements, and theatrical street styles.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260703-WA0013.jpg'),
('Jay savage', 'Models', 'Avant-garde runway model and trendsetter pushing high-fashion boundaries in editorial campaigns worldwide.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/SAVAGE%20MODEL.JPG'),
('Amelvano model', 'Models', 'Elite editorial model celebrated for architectural poses, haute couture runway walks, and magnetic presence.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Amelvano%20model.jpg'),
('Mc Abby Events', 'MC', 'Dynamic and charismatic Master of Ceremonies, hosting high-profile corporate galas, premium weddings, and live events.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Mc%20Abby%20Events.jpg'),
('Mc Rozalia Events', 'MC', 'Elegant and witty stage general known for keeping audiences thoroughly engaged, high energetic tempos, and stellar coordination.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/MC%20ROZALIA%20EVENT.jpg'),
('Dj Focus', 'Dj', 'Turntablist wizard and crowd favorite, renowned for seamless cross-genre mixing, custom vocal drops, and ultimate club energy.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/DJ%20FOCUS%20MISONDO.jpg'),
('Dj Msigwa', 'Dj', 'Afro-house specialist and audio selector crafting atmospheric deep tribal sets and radio-wave host mixes.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260703-WA0015.jpg'),
('Patrick Colors', 'Ubunifu', 'Bold, modern clothing designer celebrating African fabrics through contemporary high-street silhouettes and vibrant custom prints.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260204-WA0016(1).jpg'),
('Martha Stylish', 'Ubunifu', 'Bridal and luxury evening-wear designer recognized for intricate hand-stitched detailing, silk drapes, and high glamour.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Martha%20Stylish%20.jpg'),
('Nick tr Jr', 'Comedian', 'Witty stand-up comic and physical impressionist, capturing everyday humor and turning it into side-splitting viral sketches.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260703-WA0014.jpg'),
('Konde Boy wa Mbeya', 'Comedian', 'Renowned for hilarious storytelling, local dialect comedy, and high-energy satirical parodies.', 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Screenshot_20260703_210551_Instagram%20Lite.jpg');

-- Seed settings (Voting open from July 1 through July 16, 2026)
insert into settings (voting_open, voting_close) values
('2026-07-01T00:00:00.000Z', '2026-07-16T23:59:59.000Z');
