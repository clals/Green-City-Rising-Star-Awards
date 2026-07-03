import React, { useState, useEffect } from 'react';
import { ImageOff } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  name?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

/**
 * Optimizes Google Drive share links to high-performance direct web thumbnail links.
 * Works for standard /file/d/FILE_ID/view, open?id=FILE_ID, etc.
 */
export function getOptimizedImageUrl(url: string): string {
  if (!url) return '';
  
  const trimmedUrl = url.trim();
  
  // Google Drive Patterns
  // 1. /file/d/FILE_ID/view... or /file/d/FILE_ID/edit...
  const fileDMatch = trimmedUrl.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileDMatch[1]}&sz=w800`;
  }
  
  // 2. open?id=FILE_ID or uc?id=FILE_ID or uc?export=download&id=FILE_ID
  const idQueryMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idQueryMatch && idQueryMatch[1] && (trimmedUrl.includes('drive.google.com') || trimmedUrl.includes('docs.google.com'))) {
    return `https://drive.google.com/thumbnail?id=${idQueryMatch[1]}&sz=w800`;
  }

  // 3. docs.google.com/file/d/FILE_ID
  const docsDMatch = trimmedUrl.match(/docs\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (docsDMatch && docsDMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${docsDMatch[1]}&sz=w800`;
  }

  return trimmedUrl;
}

export default function SafeImage({ src, alt, className = '', name = '', referrerPolicy = 'no-referrer' }: SafeImageProps) {
  const optimizedUrl = getOptimizedImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState(optimizedUrl);
  const [hasError, setHasError] = useState(!optimizedUrl);

  // Sync state if src changes
  useEffect(() => {
    const opt = getOptimizedImageUrl(src);
    setCurrentSrc(opt);
    setHasError(!opt);
  }, [src]);

  // Generate initials for beautiful fallback
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  if (hasError || !currentSrc) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br from-neutral-900 to-neutral-950 text-white select-none border border-white/5 ${className}`}>
        {name ? (
          <div className="flex flex-col items-center space-y-1 p-2 text-center">
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-500 font-serif font-bold text-base tracking-wider shadow-lg">
              {getInitials(name)}
            </div>
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest mt-1">No Image Preview</span>
            <span className="text-[8px] text-white/20 font-sans leading-tight max-w-[85%] truncate">{name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-1">
            <ImageOff className="h-5 w-5 text-gold-500/40" />
            <span className="text-[8px] font-mono text-white/30 tracking-widest uppercase">Missing</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      referrerPolicy={referrerPolicy}
      onError={() => {
        console.warn(`Failed to load image: ${currentSrc}`);
        setHasError(true);
      }}
    />
  );
}
