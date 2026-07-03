/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

interface CountdownTimerProps {
  state: 'upcoming' | 'open' | 'closed';
  time: TimeRemaining | null;
  openDate: string;
  closeDate: string;
}

export default function CountdownTimer({ state, time, openDate, closeDate }: CountdownTimerProps) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (state === 'closed') {
    return (
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 text-center max-w-xl mx-auto shadow-xl">
        <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl mb-4">
          <AlertCircle className="h-6 w-6 animate-pulse" />
        </div>
        <h4 className="text-lg font-bold text-white uppercase tracking-wider mb-2 font-serif">Voting Has Closed</h4>
        <p className="text-xs text-white/50 leading-relaxed font-light">
          The voting window officially closed on <span className="text-rose-400 font-semibold">{formatDate(closeDate)}</span>. Thank you for your participation!
        </p>
      </div>
    );
  }

  if (!time) return null;

  const labels = {
    upcoming: 'VOTING OPENS IN',
    open: 'VOTING CLOSES IN',
  };

  return (
    <div className="max-w-xl mx-auto text-center" id="countdown-timer-container">
      <div className="inline-flex items-center space-x-2 bg-white/[0.02] border border-white/10 rounded-full px-4 py-1.5 mb-6">
        <Clock className={`h-4 w-4 ${state === 'open' ? 'text-gold-500 animate-pulse' : 'text-white/30'}`} />
        <span className="text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase">
          {labels[state as 'upcoming' | 'open'] || 'TIME REMAINING'}
        </span>
      </div>

      {/* Countdown Cards */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto mb-6">
        {[
          { label: 'Days', value: time.days },
          { label: 'Hours', value: time.hours },
          { label: 'Mins', value: time.minutes },
          { label: 'Secs', value: time.seconds },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white/[0.02] border border-white/10 rounded-2xl p-3 sm:p-4 shadow-lg backdrop-blur-sm flex flex-col justify-center items-center relative overflow-hidden group"
          >
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-gold-500/35 to-transparent group-hover:via-gold-500 transition-all duration-300"></div>
            
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-gold-500 tracking-tight glow-text drop-shadow-[0_0_8px_rgba(197,160,89,0.15)]">
              {String(item.value).padStart(2, '0')}
            </span>
            <span className="text-[9px] text-white/40 font-mono uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Helper message displaying actual date */}
      <p className="text-[10px] text-white/30 font-mono uppercase tracking-wider">
        {state === 'upcoming' ? (
          <>Starts: <span className="text-white/60 font-semibold">{formatDate(openDate)}</span></>
        ) : (
          <>Deadline: <span className="text-white/60 font-semibold">{formatDate(closeDate)}</span></>
        )}
      </p>
    </div>
  );
}
