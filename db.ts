/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';
import { Category, Contestant, VotingCode, Vote, VotingSettings, VoteCountResult } from './types';

// Read credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Determine if we can run in production Supabase mode
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: any = null;
if (isSupabaseConfigured) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
  }
}

// Default/Seed Data for the local fallback
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Bongofleva', description: 'Bongofleva - Music category for outstanding Swahili vocal performance and hooks' },
  { id: 'cat-2', name: 'Singeli', description: 'Singeli - Music category celebrating high-bpm rapid lyricists and hyper-speed beats' },
  { id: 'cat-3', name: 'Dancers (Group)', description: 'Choreographed dance crews delivering synchronized spectacular routines' },
  { id: 'cat-4', name: 'Dancers (Personal)', description: 'Outstanding solo dancers, viral creators, and fusion performers' },
  { id: 'cat-5', name: 'Models', description: 'Avant-garde runway, fashion modeling, and design trendsetters' },
  { id: 'cat-6', name: 'MC', description: 'Elite Masters of Ceremonies, hosting galas and premium events' },
  { id: 'cat-7', name: 'Dj', description: 'Outstanding turntable mastery, deep Afro-house sets, and live crowd controls' },
  { id: 'cat-8', name: 'Ubunifu', description: 'Creative design, modern high-street silhouette, and luxury fabrics' },
  { id: 'cat-9', name: 'Comedian', description: 'Side-splitting stand-up, localized satire, and witty storytelling' },
];

const DEFAULT_CONTESTANTS: Contestant[] = [
  // Bongofleva
  {
    id: 'bongo-1',
    name: 'Alo Star',
    category: 'Bongofleva',
    description: 'Energetic Bongofleva vocal artist famous for melodic hooks, rhythmic Swahili storytelling, and record-breaking club anthems.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/ALOSTAR%20-SWALA%20(Music).PNG'
  },
  {
    id: 'bongo-2',
    name: 'Malon Boy',
    category: 'Bongofleva',
    description: 'Rousing lyricist and singer blending traditional East African sounds with contemporary Afrobeat rhythms.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/MALON%20BOY%20(MUSIC).JPG'
  },
  {
    id: 'bongo-3',
    name: 'Remedy Africa',
    category: 'Bongofleva',
    description: 'Pioneering producer-singer delivering soulful harmonies, acoustic depth, and inspiring pan-African themes.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/REMEDYAFRICAN.jpg'
  },
  {
    id: 'bongo-4',
    name: 'Romeo Samdezy',
    category: 'Bongofleva',
    description: 'Romantic ballad vocalist capturing hearts with powerful ranges, intimate acoustic singles, and majestic live shows.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Romeo%20samdezy%20(MUSIC).JPG'
  },
  // Singeli
  {
    id: 'singeli-1',
    name: 'Arrow Music',
    category: 'Singeli',
    description: 'High-bpm Singeli pioneer pushing rapid lyricism and hyper-speed beats to the mainstages of East African festivals.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/ARROW%20MUSIC%20(Singeri).png'
  },
  {
    id: 'singeli-2',
    name: 'Side Sela',
    category: 'Singeli',
    description: 'Known for witty socio-conscious rhymes, fast syncopations, and magnetic stage presence representing street culture.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/SIDE%20SELA%20(Singeri).png'
  },
  // Dancers (Group)
  {
    id: 'dc-group-1',
    name: 'Eyes Power Dancer',
    category: 'Dancers (Group)',
    description: 'A highly coordinated crew delivering breathtaking synchronized street dances, acrobatic flips, and intense dramatic routines.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/972A0677.jpg'
  },
  {
    id: 'dc-group-2',
    name: 'The African fighter dancers',
    category: 'Dancers (Group)',
    description: 'Dynamic traditional-meets-modern dance theatre depicting historical tales through explosive physical choreography.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/THE%20AFRICAN%20FIGHTER%20DANCERS%20.jpg'
  },
  // Dancers (Personal)
  {
    id: 'dc-pers-1',
    name: 'Mtoto wa mkoani',
    category: 'Dancers (Personal)',
    description: 'Vibrant solo performer beloved for expressive face-work, flexible movements, and popular viral social media challenges.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/MTOTO%20WA%20MKOANI%20(DANCE).jpg'
  },
  {
    id: 'dc-pers-2',
    name: 'Khan Minji Dancer',
    category: 'Dancers (Personal)',
    description: 'Graceful contemporary-fusion dancer blending modern ballet, Afro-dance elements, and theatrical street styles.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260703-WA0013.jpg'
  },
  // Models
  {
    id: 'model-1',
    name: 'Jay savage',
    category: 'Models',
    description: 'Avant-garde runway model and trendsetter pushing high-fashion boundaries in editorial campaigns worldwide.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/SAVAGE%20MODEL.JPG'
  },
  {
    id: 'model-2',
    name: 'Amelvano model',
    category: 'Models',
    description: 'Elite editorial model celebrated for architectural poses, haute couture runway walks, and magnetic presence.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Amelvano%20model.jpg'
  },
  // MC
  {
    id: 'mc-1',
    name: 'Mc Abby Events',
    category: 'MC',
    description: 'Dynamic and charismatic Master of Ceremonies, hosting high-profile corporate galas, premium weddings, and live events.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Mc%20Abby%20Events.jpg'
  },
  {
    id: 'mc-2',
    name: 'Mc Rozalia Events',
    category: 'MC',
    description: 'Elegant and witty stage general known for keeping audiences thoroughly engaged, high energetic tempos, and stellar coordination.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/MC%20ROZALIA%20EVENT.jpg'
  },
  // Dj
  {
    id: 'dj-1',
    name: 'Dj Focus',
    category: 'Dj',
    description: 'Turntablist wizard and crowd favorite, renowned for seamless cross-genre mixing, custom vocal drops, and ultimate club energy.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/DJ%20FOCUS%20MISONDO.jpg'
  },
  {
    id: 'dj-2',
    name: 'Dj Msigwa',
    category: 'Dj',
    description: 'Afro-house specialist and audio selector crafting atmospheric deep tribal sets and radio-wave host mixes.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260703-WA0015.jpg'
  },
  // Ubunifu
  {
    id: 'ubu-1',
    name: 'Patrick Colors',
    category: 'Ubunifu',
    description: 'Bold, modern clothing designer celebrating African fabrics through contemporary high-street silhouettes and vibrant custom prints.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260204-WA0016(1).jpg'
  },
  {
    id: 'ubu-2',
    name: 'Martha Stylish',
    category: 'Ubunifu',
    description: 'Bridal and luxury evening-wear designer recognized for intricate hand-stitched detailing, silk drapes, and high glamour.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Martha%20Stylish%20.jpg'
  },
  // Comedian
  {
    id: 'com-1',
    name: 'Nick tr Jr',
    category: 'Comedian',
    description: 'Witty stand-up comic and physical impressionist, capturing everyday humor and turning it into side-splitting viral sketches.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/IMG-20260703-WA0014.jpg'
  },
  {
    id: 'com-2',
    name: 'Konde Boy wa Mbeya',
    category: 'Comedian',
    description: 'Renowned for hilarious storytelling, local dialect comedy, and high-energy satirical parodies.',
    photo_url: 'https://tvsswylaikjinmaqhrql.supabase.co/storage/v1/object/public/images/Screenshot_20260703_210551_Instagram%20Lite.jpg'
  }
];

const DEFAULT_CODES: VotingCode[] = [
  { id: 'code-1', code: 'VOTE-GOLD-2026', used: false, used_at: null, created_at: new Date().toISOString() },
  { id: 'code-2', code: 'VOTE-VIP-7788', used: false, used_at: null, created_at: new Date().toISOString() },
  { id: 'code-3', code: 'VOTE-PRESS-4411', used: false, used_at: null, created_at: new Date().toISOString() },
  { id: 'code-4', code: 'VOTE-GUEST-3001', used: false, used_at: null, created_at: new Date().toISOString() },
  { id: 'code-5', code: 'VOTE-CREW-9922', used: false, used_at: null, created_at: new Date().toISOString() },
  { id: 'code-6', code: 'VOTE-USED-1111', used: true, used_at: new Date(Date.now() - 3600000).toISOString(), created_at: new Date().toISOString() },
];

const DEFAULT_VOTE_SEEDS = () => {
  // Fresh clean start - no simulated votes
  return [];
};

// Helper for localStorage keys
const KEYS = {
  CATEGORIES: 'award_categories_v3',
  CONTESTANTS: 'award_contestants_v3',
  CODES: 'award_voting_codes_v4',
  VOTES: 'award_votes_v4',
  SETTINGS: 'award_settings_v2026_july',
};

// Local storage initializations
// Memory cache fallback for environment constraints (e.g. sandboxed iframe blocking localStorage)
const memoryCache: Record<string, string> = {};

const getLocalData = <T>(key: string, defaultValue: T): T => {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      try {
        localStorage.setItem(key, JSON.stringify(defaultValue));
      } catch (e) {
        memoryCache[key] = JSON.stringify(defaultValue);
      }
      return defaultValue;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn(`localStorage access failed for key "${key}", using memory cache fallback:`, err);
    if (!(key in memoryCache)) {
      memoryCache[key] = JSON.stringify(defaultValue);
    }
    return JSON.parse(memoryCache[key]);
  }
};

const setLocalData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`localStorage write failed for key "${key}", updating memory cache:`, err);
    memoryCache[key] = JSON.stringify(value);
  }
};

/**
 * Resizes an image file while preserving aspect ratio
 * Uses try-finally to ensure ObjectURL cleanup
 * Non-blocking via canvas operations
 */
async function resizeImageFile(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
): Promise<Blob> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          let { width, height } = img;
          let targetWidth = width;
          let targetHeight = height;

          // calculate new size while preserving aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const ratio = Math.min(widthRatio, heightRatio);
            targetWidth = Math.round(width * ratio);
            targetHeight = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas not supported'));
            return;
          }
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          canvas.toBlob((blob) => {
            if (!blob) reject(new Error('Failed to create blob from canvas'));
            else resolve(blob as Blob);
          }, 'image/jpeg', quality);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for resizing'));
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

interface UploadOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxFileSizeMb?: number;
  onProgress?: (percent: number) => void;
}

// Primary DB Service Export Object
export const dbService = {
  // ==========================================
  // CATEGORIES SERVICES
  // ==========================================
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('categories').select('*').order('name');
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getCategories failed, falling back to local storage:", err);
      }
    }
    return getLocalData<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
  },

  async addCategory(name: string, description?: string): Promise<Category> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('categories').insert([{ name, description }]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase addCategory failed, falling back to local storage:", err);
      }
    }
    const categories = getLocalData<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name,
      description,
    };
    categories.push(newCategory);
    setLocalData(KEYS.CATEGORIES, categories);
    return newCategory;
  },

  async deleteCategory(id: string): Promise<void> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error } = await supabaseClient.from('categories').delete().eq('id', id);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn("Supabase deleteCategory failed, falling back to local storage:", err);
      }
    }
    const categories = getLocalData<Category[]>(KEYS.CATEGORIES, DEFAULT_CATEGORIES);
    const updated = categories.filter(c => c.id !== id);
    setLocalData(KEYS.CATEGORIES, updated);
  },

  // ==========================================
  // CONTESTANTS SERVICES
  // ==========================================
  async getContestants(): Promise<Contestant[]> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('contestants').select('*');
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getContestants failed, falling back to local storage:", err);
      }
    }
    return getLocalData<Contestant[]>(KEYS.CONTESTANTS, DEFAULT_CONTESTANTS);
  },

  async addContestant(contestant: Omit<Contestant, 'id'>): Promise<Contestant> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('contestants').insert([contestant]).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase addContestant failed, falling back to local storage:", err);
      }
    }
    const contestants = getLocalData<Contestant[]>(KEYS.CONTESTANTS, DEFAULT_CONTESTANTS);
    const newContestant: Contestant = {
      id: `cont-${Date.now()}`,
      ...contestant,
    };
    contestants.push(newContestant);
    setLocalData(KEYS.CONTESTANTS, contestants);
    return newContestant;
  },

  async updateContestant(id: string, contestant: Partial<Omit<Contestant, 'id'>>): Promise<Contestant> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('contestants').update(contestant).eq('id', id).select().single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase updateContestant failed, falling back to local storage:", err);
      }
    }
    const contestants = getLocalData<Contestant[]>(KEYS.CONTESTANTS, DEFAULT_CONTESTANTS);
    const index = contestants.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Contestant not found');
    contestants[index] = { ...contestants[index], ...contestant };
    setLocalData(KEYS.CONTESTANTS, contestants);
    return contestants[index];
  },

  async deleteContestant(id: string): Promise<void> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error } = await supabaseClient.from('contestants').delete().eq('id', id);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn("Supabase deleteContestant failed, falling back to local storage:", err);
      }
    }
    const contestants = getLocalData<Contestant[]>(KEYS.CONTESTANTS, DEFAULT_CONTESTANTS);
    const updated = contestants.filter(c => c.id !== id);
    setLocalData(KEYS.CONTESTANTS, updated);
  },

  // ==========================================
  // VOTING CODES SERVICES
  // ==========================================
  async validateCode(codeString: string): Promise<VotingCode | null> {
    const sanitizedCode = codeString.trim().toUpperCase();
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('voting_codes')
          .select('*')
          .eq('code', sanitizedCode)
          .maybeSingle();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase validateCode failed, falling back to local storage:", err);
      }
    }
    const codes = getLocalData<VotingCode[]>(KEYS.CODES, DEFAULT_CODES);
    const found = codes.find(c => c.code.toUpperCase() === sanitizedCode);
    return found || null;
  },

  async markCodeAsUsed(codeId: string): Promise<void> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { error } = await supabaseClient
          .from('voting_codes')
          .update({ used: true, used_at: new Date().toISOString() })
          .eq('id', codeId);
        if (error) throw error;
        return;
      } catch (err) {
        console.warn("Supabase markCodeAsUsed failed, falling back to local storage:", err);
      }
    }
    const codes = getLocalData<VotingCode[]>(KEYS.CODES, DEFAULT_CODES);
    const index = codes.findIndex(c => c.id === codeId);
    if (index !== -1) {
      codes[index].used = true;
      codes[index].used_at = new Date().toISOString();
      setLocalData(KEYS.CODES, codes);
    }
  },

  async generateVotingCodes(count: number, prefix: string = 'VOTE'): Promise<VotingCode[]> {
    const newCodes: Omit<VotingCode, 'id' | 'created_at'>[] = [];
    
    // Generate unique random alphanumeric code strings
    for (let i = 0; i < count; i++) {
      const randStr = Math.random().toString(36).substring(2, 6).toUpperCase();
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const codeString = `${prefix}-${randStr}-${randNum}`;
      newCodes.push({
        code: codeString,
        used: false,
        used_at: null,
      });
    }

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient
          .from('voting_codes')
          .insert(newCodes.map(c => ({ ...c, created_at: new Date().toISOString() })))
          .select();
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase generateVotingCodes failed, falling back to local storage:", err);
      }
    }
    const codes = getLocalData<VotingCode[]>(KEYS.CODES, DEFAULT_CODES);
    const generated: VotingCode[] = newCodes.map((c, i) => ({
      id: `code-${Date.now()}-${i}`,
      ...c,
      created_at: new Date().toISOString()
    }));
    const updated = [...codes, ...generated];
    setLocalData(KEYS.CODES, updated);
    return generated;
  },

  // ==========================================
  // Image Upload (Supabase Storage with validation)
  // ==========================================
  /**
   * Upload image with client-side validation and resizing
   * - Validates file type and size before upload
   * - Resizes image to reduce bandwidth
   * - Provides progress callback for UI feedback
   * - Ensures ObjectURL cleanup
   * - Rejects oversized files to prevent OOM on data URL fallback
   */
  async uploadImage(file: File, options?: UploadOptions): Promise<string> {
    if (!file) throw new Error('No file provided');
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error(`Invalid file type: ${file.type}. Only images are allowed.`);
    }
    
    // Validate file size
    const maxFileSizeMb = options?.maxFileSizeMb ?? 5;
    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;
    if (file.size > maxFileSizeBytes) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum is ${maxFileSizeMb}MB.`);
    }

    options?.onProgress?.(10);

    const maxW = options?.maxWidth ?? 1200;
    const maxH = options?.maxHeight ?? 1200;
    const quality = options?.quality ?? 0.8;

    // Normalize filename
    const fileExt = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const folderPath = 'contestants';
    const storagePath = `${folderPath}/${safeName}`;

    // Resize image to reduce upload size
    let uploadBlob: Blob;
    try {
      uploadBlob = await resizeImageFile(file, maxW, maxH, quality);
      options?.onProgress?.(40);
    } catch (err) {
      console.warn('Image resize failed, using original file blob', err);
      uploadBlob = file;
      options?.onProgress?.(40);
    }

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const bucket = 'images';
        // Supabase Storage upload expects a File/Blob
        const { error: uploadError } = await supabaseClient.storage
          .from(bucket)
          .upload(storagePath, uploadBlob as any, { contentType: 'image/jpeg', upsert: false });

        if (uploadError) throw uploadError;

        options?.onProgress?.(75);

        const { data: urlData, error: urlErr } = await supabaseClient.storage
          .from(bucket)
          .getPublicUrl(storagePath);

        if (urlErr) throw urlErr;
        options?.onProgress?.(100);
        return urlData.publicUrl;
      } catch (err) {
        console.warn('Supabase upload failed:', err);
        // Don't fall back to data URL - reject instead to prevent OOM
        throw new Error('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
      }
    }

    // No Supabase configured - cannot proceed without storage
    throw new Error('Image storage not configured. Please configure Supabase environment variables.');
  },

  async getVotingCodes(): Promise<VotingCode[]> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('voting_codes').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getVotingCodes failed, falling back to local storage:", err);
      }
    }
    return getLocalData<VotingCode[]>(KEYS.CODES, DEFAULT_CODES);
  },

  // ==========================================
  // VOTING SETTINGS SERVICES
  // ==========================================
  async getSettings(): Promise<VotingSettings> {
    const defaultSettings: VotingSettings = {
      voting_open: '2026-07-01T00:00:00.000Z', // open since July 1st, 2026
      voting_close: '2026-07-16T23:59:59.000Z', // closes July 16, 2026
    };

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('settings').select('*').limit(1).maybeSingle();
        if (error) throw error;
        if (!data) {
          // Insert default setting
          const { data: inserted, error: insError } = await supabaseClient
            .from('settings')
            .insert([defaultSettings])
            .select()
            .single();
          if (insError) throw insError;
          return inserted;
        }
        return data;
      } catch (err) {
        console.warn("Supabase getSettings failed, falling back to local storage:", err);
      }
    }
    return getLocalData<VotingSettings>(KEYS.SETTINGS, defaultSettings);
  },

  async updateSettings(settings: VotingSettings): Promise<VotingSettings> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        // Get first setting record if any, otherwise insert
        const current = await this.getSettings();
        const { data, error } = await supabaseClient
          .from('settings')
          .update({ voting_open: settings.voting_open, voting_close: settings.voting_close })
          .eq('id', current.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } catch (err) {
        console.warn("Supabase updateSettings failed, falling back to local storage:", err);
      }
    }
    setLocalData(KEYS.SETTINGS, settings);
    return settings;
  },

  // ==========================================
  // VOTES SUBMISSION & ANALYTICS
  // ==========================================
  async submitVotes(votes: Omit<Vote, 'id' | 'timestamp'>[]): Promise<void> {
    if (!Array.isArray(votes) || votes.length === 0) {
      throw new Error('No votes provided for submission.');
    }

    const contestants = await this.getContestants();
    const contestantNameById = new Map(contestants.map((c) => [c.id, c.name]));
    const ballotCodePrefix = `BALLOT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    for (let i = 0; i < votes.length; i++) {
      const vote = votes[i];
      const contestantId = vote.contestant_id?.trim();
      const category = vote.category?.trim();

      if (!contestantId || !category) {
        throw new Error('Unable to record your vote. Please try again.');
      }

      const contestantName = contestantNameById.get(contestantId) || contestantId;
      const payload = {
        contestant_id: contestantId,
        contestant_name: contestantName,
        category,
        vote_code: `${ballotCodePrefix}-${i + 1}`,
        timestamp: new Date().toISOString(),
      };

      let response: Response;
      try {
        response = await fetch('/api/submitVote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
      } catch {
        throw new Error('Unable to record your vote. Please try again.');
      }

      let json: any = null;
      try {
        json = await response.json();
      } catch {
        json = null;
      }

      if (!response.ok || !json?.success) {
        const message = json?.message || 'Unable to record your vote. Please try again.';
        throw new Error(message);
      }
    }
  },

  async getVotes(): Promise<Vote[]> {
    try {
      const response = await fetch('/api/getVotes', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.success && Array.isArray(data.votes)) {
        return data.votes;
      }
    } catch (err) {
      console.warn('Vercel getVotes API failed, falling back to existing data source:', err);
    }

    if (isSupabaseConfigured && supabaseClient) {
      try {
        const { data, error } = await supabaseClient.from('votes').select('*');
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.warn("Supabase getVotes failed, falling back to local storage:", err);
      }
    }
    return getLocalData<Vote[]>(KEYS.VOTES, DEFAULT_VOTE_SEEDS());
  },

  async resetVoting(): Promise<void> {
    if (isSupabaseConfigured && supabaseClient) {
      try {
        // Delete all votes and reset code flags
        const { error: voteErr } = await supabaseClient.from('votes').delete().neq('id', 'placeholder-uuid');
        if (voteErr) throw voteErr;
        const { error: codeErr } = await supabaseClient.from('voting_codes').update({ used: false, used_at: null }).neq('id', 'placeholder-uuid');
        if (codeErr) throw codeErr;
        return;
      } catch (err) {
        console.warn("Supabase resetVoting failed, falling back to local storage:", err);
      }
    }
    // Clear votes and reset default codes
    setLocalData<Vote[]>(KEYS.VOTES, []);
    const resetCodes = DEFAULT_CODES.map(c => ({ ...c, used: false, used_at: null }));
    setLocalData<VotingCode[]>(KEYS.CODES, resetCodes);
  }
};
