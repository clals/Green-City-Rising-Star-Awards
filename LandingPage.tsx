/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowRight, ShieldCheck, KeyRound, Award, Ticket, HelpCircle, Crown } from 'lucide-react';
import { useVoting } from './VotingContext';
import CountdownTimer from './CountdownTimer';

import { motion } from 'motion/react';

export default function LandingPage() {
  const { votingState, timeRemaining, settings } = useVoting();
  const [hasVoted] = useState(() => {
    return localStorage.getItem('has_voted_south_zoo') === 'true' || localStorage.getItem('has_voted_green_city') === 'true';
  });
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans overflow-x-hidden relative" id="landing-page-root">
      
      {/* Visual background lights */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold-600/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Main Hero Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 mt-6">
          {/* Logo Crest of the Event and Organizer Board */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center mb-8"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-gold-500/10 rounded-full blur-xl w-24 h-24"></div>
              {/* Outer circular gold border */}
              <div className="w-20 h-20 border-2 border-dashed border-gold-500/30 rounded-full flex items-center justify-center p-2 relative">
                {/* Inner smooth circular gold border */}
                <div className="w-full h-full border border-gold-400/40 rounded-full flex items-center justify-center bg-black/80 overflow-hidden relative">
                  <Crown className="h-8 w-8 text-gold-500 animate-pulse absolute" />
                  <img 
                    src="https://drive.google.com/thumbnail?id=1HId2dJBJXBdwwMRheioAr3nIhFPDHjAd&sz=w300" 
                    alt="South Zoo Events Logo" 
                    className="w-full h-full object-cover rounded-full absolute inset-0 z-10"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </div>
            
            {/* Organizer Credential Tag */}
            <span className="text-[9px] font-mono tracking-[0.3em] text-white/40 uppercase mt-4 block">
              SOUTH ZOO EVENTS
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-full text-xs font-mono tracking-[0.2em] uppercase mb-6"
          >
            <Award className="h-4 w-4 animate-spin-slow" />
            <span>2026 Green City Rising Star Awards</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="text-4xl sm:text-6xl font-light tracking-[0.05em] mb-6 font-serif uppercase leading-tight bg-gradient-to-r from-white via-gold-200 to-gold-400 bg-clip-text text-transparent"
          >
            Express Your Voice.<br />
            <span className="font-semibold text-gold-500 drop-shadow-[0_0_12px_rgba(197,160,89,0.15)]">Vote For Excellence.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-sm sm:text-base text-white/60 leading-relaxed font-light"
          >
            Welcome to the official online voting platform. Review our remarkable nominees, cast your anonymous ballot, and help determine this year&apos;s champions.
          </motion.p>
        </div>

        {/* Live Countdown Clock Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <CountdownTimer
            state={votingState}
            time={timeRemaining}
            openDate={settings.voting_open}
            closeDate={settings.voting_close}
          />
        </motion.div>

        {/* Voting Portal Card */}
        <div className="max-w-md mx-auto mb-16 scroll-mt-24" id="code-section">
          {votingState === 'open' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative overflow-hidden backdrop-blur-md"
            >
              {/* Card Header decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-500 via-gold-300 to-gold-600"></div>

              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                <div className="p-4 bg-gold-500/10 text-gold-500 rounded-2xl">
                  <Award className="h-8 w-8 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white uppercase tracking-wider font-serif">Voting is Open!</h3>
                  <p className="text-xs text-white/50 max-w-sm mx-auto mt-2 leading-relaxed">
                    Cast your ballots for the outstanding creators, performers, and leaders of the Green City Rising Star Awards. No access code required.
                  </p>
                </div>

                {hasVoted ? (
                  <div className="w-full space-y-4 pt-2">
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl font-mono uppercase tracking-wider">
                      ✔ Your ballot has been cast in this session!
                    </div>
                    <button
                      onClick={() => navigate('/vote')}
                      className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 font-semibold py-3 px-6 rounded-full shadow-lg transition-all cursor-pointer text-xs uppercase tracking-wider"
                    >
                      Vote Again / Cast Another Ballot
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => navigate('/vote')}
                    className="w-full flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 text-black font-semibold py-4 px-6 rounded-full shadow-lg shadow-gold-500/20 hover:scale-[1.01] transition-all cursor-pointer mt-4"
                  >
                    <span className="text-xs uppercase tracking-widest font-bold">Cast Your Votes Now</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 text-center"
            >
              <Ticket className="h-8 w-8 text-white/20 mx-auto mb-3" />
              <p className="text-xs uppercase tracking-widest text-white/40 leading-relaxed font-mono">
                {votingState === 'upcoming' 
                  ? 'Voting is not open yet. Check back when the countdown expires!'
                  : 'Voting is officially closed. Stay tuned for the winners ceremony!'}
              </p>
            </motion.div>
          )}
        </div>

        {/* Voting Process / Guidelines Section */}
        <div className="border-t border-white/10 pt-16 mb-16">
          <h2 className="text-lg sm:text-xl font-light text-center text-white mb-10 tracking-[0.2em] uppercase font-serif">
            How The Voting System Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Browse Nominations',
                description: 'View the nominees in each award category to learn about their achievements and impacts.',
              },
              {
                step: '02',
                title: 'Select Favorites',
                description: 'Choose your top candidate in each of the official categories by clicking on their nominee profile.',
              },
              {
                step: '03',
                title: 'Submit Instantly',
                description: 'Cast your ballot instantly. Your selections are recorded 100% anonymously and securely in the system.',
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-gold-500/30 transition-all duration-300"
              >
                <span className="absolute -top-3 -right-3 text-7xl font-extrabold font-mono text-white/[0.02] group-hover:text-gold-500/[0.03] transition-colors duration-300">
                  {card.step}
                </span>
                <span className="block text-[10px] font-mono text-gold-500 font-bold uppercase tracking-widest mb-2">
                  Step {card.step}
                </span>
                <h4 className="text-base font-bold text-white mb-2 font-serif uppercase tracking-wide">{card.title}</h4>
                <p className="text-xs text-white/50 leading-relaxed font-light">{card.description}</p>
              </div>
            ))}
          </div>
        </div>



      </div>
    </div>
  );
}
