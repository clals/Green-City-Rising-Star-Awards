/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVoting } from './VotingContext';
import { Award, CheckCircle2, Circle, AlertTriangle, Key, ChevronRight, Check, ShieldCheck, ArrowLeft, Send, Clock } from 'lucide-react';
import ConfettiEffect from './ConfettiEffect';
import SafeImage from './SafeImage';
import { motion, AnimatePresence } from 'motion/react';

export default function VotingPage() {
  const { categories, contestants, submitVotes, votingState, timeRemaining } = useVoting();
  const navigate = useNavigate();

  // Voter choices state: { [categoryName]: contestantId }
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    // AUTO-SAVE: Load draft from sessionStorage on mount
    const saved = sessionStorage.getItem('ballot_draft');
    return saved ? JSON.parse(saved) : {};
  });
  const [activeCategoryIdx, setActiveCategoryIdx] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // AUTO-SAVE: Persist selections to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('ballot_draft', JSON.stringify(selections));
  }, [selections]);

  // TIME WARNING: Show warning when < 5 minutes remaining
  useEffect(() => {
    if (timeRemaining && timeRemaining.totalMs < 300000 && votingState === 'open') {
      setShowTimeWarning(true);
    } else {
      setShowTimeWarning(false);
    }
  }, [timeRemaining, votingState]);

  // Redirect if voting is not open (upcoming or closed)
  useEffect(() => {
    if (votingState !== 'loading' && votingState !== 'open') {
      navigate('/');
    }
  }, [votingState, navigate]);

  if (votingState === 'loading') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center font-sans">
        <p className="text-sm font-mono tracking-widest uppercase animate-pulse">Loading ballot...</p>
      </div>
    );
  }

  const currentCategory = categories[activeCategoryIdx];
  const currentContestants = currentCategory 
    ? contestants.filter(c => c.category === currentCategory.name) 
    : [];

  const handleSelectContestant = (contestantId: string) => {
    if (!currentCategory) return;
    setSelections(prev => ({
      ...prev,
      [currentCategory.name]: contestantId,
    }));
  };

  const handleNextCategory = () => {
    if (activeCategoryIdx < categories.length - 1) {
      setActiveCategoryIdx(prev => prev + 1);
    }
  };

  const handlePrevCategory = () => {
    if (activeCategoryIdx > 0) {
      setActiveCategoryIdx(prev => prev - 1);
    }
  };

  // Check if voter made selections in all categories
  const allCategoriesSelected = categories.every(cat => !!selections[cat.name]);
  const selectedCount = Object.keys(selections).length;

  const handleSubmitBallot = async () => {
    if (!allCategoriesSelected) {
      setErrorMessage('Please select a contestant in every category before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const res = await submitVotes(selections);
    setIsSubmitting(false);

    if (res.success) {
      // CLEAR DRAFT: Remove saved ballot on successful submission
      sessionStorage.removeItem('ballot_draft');
      setSubmitSuccess(true);
    } else {
      setErrorMessage(res.error || 'Failed to submit. Please try again.');
    }
  };

  const getSelectedContestantName = (categoryName: string) => {
    const selectedId = selections[categoryName];
    if (!selectedId) return null;
    return contestants.find(c => c.id === selectedId)?.name;
  };

  // If successful, render the congratulations screen
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans flex items-center justify-center py-12 px-4 relative z-10" id="success-screen-root">
        <ConfettiEffect />
        
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="bg-white/[0.02] border border-white/10 rounded-3xl p-8 sm:p-12 max-w-xl text-center shadow-2xl relative overflow-hidden backdrop-blur-md"
        >
          {/* Accent Gold Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>

          <div className="inline-flex p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full mb-6 shadow-inner animate-pulse">
            <ShieldCheck className="h-10 w-10" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase font-serif tracking-wide mb-4">
            Ballot Submitted!
          </h2>
          <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-8 font-light">
            Thank you for casting your vote. Your selections have been recorded anonymously and securely.
          </p>

          <div className="bg-black border border-white/10 rounded-2xl p-5 mb-8 text-left space-y-2">
            <span className="block text-[10px] font-mono font-bold tracking-widest text-white/40 uppercase pb-2 border-b border-white/10">
              Submitted Ballot Summary
            </span>
            {categories.map(cat => (
              <div key={cat.id} className="flex justify-between items-center py-1 text-xs">
                <span className="text-white/40 font-light">{cat.name}:</span>
                <span className="font-semibold text-gold-500">{getSelectedContestantName(cat.name)}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-3 px-6 rounded-full shadow-lg shadow-gold-500/10 transition-all cursor-pointer text-xs uppercase tracking-wider"
          >
            Return to Portal Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans py-12 px-4 sm:px-6 lg:px-8 relative" id="voting-ballot-root">
      
      {/* background blurs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto">
        
        {/* TIME WARNING BANNER - Show when < 5 minutes remaining */}
        <AnimatePresence>
          {showTimeWarning && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-xl flex items-start space-x-3"
            >
              <Clock className="h-5 w-5 flex-shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-sm font-semibold">⏰ Voting Closing Soon!</p>
                <p className="text-xs text-amber-300/80 mt-1">
                  You have less than 5 minutes to submit your ballot. Your draft has been saved automatically.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stepper Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center space-x-2 text-[10px] text-gold-500 font-mono tracking-widest uppercase">
              <Award className="h-3.5 w-3.5" />
              <span>Public Ballot</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 uppercase font-serif tracking-wide">
              Cast Your Official Ballots
            </h1>
          </div>

          {/* Stepper dots */}
          <div className="flex items-center space-x-1.5 bg-white/[0.02] border border-white/10 rounded-full px-4 py-2">
            <span className="text-[10px] font-mono font-bold text-white/40 mr-2 uppercase tracking-wider">
              Progress: {selectedCount}/{categories.length} Completed
            </span>
            <div className="flex space-x-1">
              {categories.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeCategoryIdx 
                      ? 'w-4 bg-gold-500' 
                      : selections[categories[idx].name] 
                        ? 'w-1.5 bg-emerald-500' 
                        : 'w-1.5 bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Categories Carousel Tab Ribbon */}
        <div className="flex overflow-x-auto pb-4 mb-8 border-b border-white/10 scrollbar-none gap-2">
          {categories.map((cat, idx) => {
            const hasSelected = !!selections[cat.name];
            const isActive = idx === activeCategoryIdx;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryIdx(idx)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gold-500 text-black border-gold-500 shadow-lg shadow-gold-500/10'
                    : hasSelected
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-white/[0.02] text-white/40 border-white/10 hover:text-white hover:border-gold-500/30'
                }`}
              >
                {hasSelected ? <Check className="h-3.5 w-3.5" /> : <Award className="h-3.5 w-3.5" />}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Main Section: 2 Columns on desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Contestants Selection Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Active Category Meta */}
            {currentCategory && (
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 relative overflow-hidden">
                {/* side gradient highlight */}
                <div className="absolute top-0 left-0 bottom-0 w-1 bg-gold-500"></div>
                <h2 className="text-lg font-bold text-white uppercase font-serif tracking-wide">{currentCategory.name}</h2>
                <p className="text-xs text-white/50 mt-1 font-light">{currentCategory.description || 'Cast your ballot for this official category.'}</p>
              </div>
            )}

            {/* Contestant Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentContestants.length === 0 ? (
                <div className="col-span-full py-16 text-center text-white/30 border border-dashed border-white/10 rounded-2xl">
                  <p className="text-xs uppercase tracking-wider font-mono">No contestants found in this category.</p>
                </div>
              ) : (
                currentContestants.map(cont => {
                  const isSelected = selections[currentCategory?.name] === cont.id;
                  return (
                    <div
                      key={cont.id}
                      onClick={() => handleSelectContestant(cont.id)}
                      className={`group border rounded-2xl overflow-hidden cursor-pointer flex flex-col justify-between h-full hover:border-gold-500/30 transition-all duration-300 relative ${
                        isSelected 
                          ? 'bg-gold-500/[0.03] border-gold-500 shadow-xl shadow-gold-500/5' 
                          : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.04]'
                      }`}
                    >
                      {/* Photo wrapper */}
                      <div className="aspect-square w-full relative overflow-hidden bg-black">
                        <SafeImage
                          src={cont.photo_url}
                          alt={cont.name}
                          name={cont.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        {/* selection float badge */}
                        <div className="absolute top-3 right-3">
                          <span className={`flex p-1.5 rounded-full shadow-lg transition-colors duration-200 ${
                            isSelected 
                              ? 'bg-gold-500 text-black' 
                              : 'bg-black/60 text-white/30 backdrop-blur-sm'
                          }`}>
                            {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                          </span>
                        </div>
                      </div>

                      {/* Content panel */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-extrabold text-white text-base tracking-wide leading-snug group-hover:text-gold-500 transition-colors duration-200 font-serif">
                            {cont.name}
                          </h4>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                          <span className="text-[9px] font-mono tracking-wider text-white/30 uppercase">
                            Nominee ID: {cont.id.slice(0, 8)}...
                          </span>
                          {isSelected && (
                            <span className="text-[10px] text-gold-500 font-bold uppercase tracking-wider flex items-center font-mono">
                              Selected <Check className="h-3 w-3 ml-1" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Stepper buttons footer */}
            <div className="flex items-center justify-between pt-4">
              <button
                onClick={handlePrevCategory}
                disabled={activeCategoryIdx === 0}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Previous</span>
              </button>

              <button
                onClick={handleNextCategory}
                disabled={activeCategoryIdx === categories.length - 1}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right Sidebar: Ballot summary & Submission Trigger (1 Col) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 sticky top-24 shadow-2xl backdrop-blur-md">
              <h3 className="text-[10px] font-semibold tracking-widest font-mono text-white/40 uppercase mb-4 pb-3 border-b border-white/10 flex items-center justify-between">
                <span>Checklist</span>
                <span className="text-gold-500 font-bold">{selectedCount}/{categories.length}</span>
              </h3>

              <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-1">
                {categories.map(cat => {
                  const contestantId = selections[cat.name];
                  const chosenName = contestantId ? contestants.find(c => c.id === contestantId)?.name : null;
                  return (
                    <div key={cat.id} className="text-xs space-y-1">
                      <div className="flex justify-between items-center text-white/40">
                        <span className="font-medium truncate flex-1 font-serif text-[11px]">{cat.name}</span>
                        {chosenName ? (
                          <span className="text-emerald-400 font-bold text-[9px] font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded-full ml-2">Selected</span>
                        ) : (
                          <span className="text-white/20 font-mono text-[9px] uppercase ml-2">Pending</span>
                        )}
                      </div>
                      {chosenName && (
                        <p className="font-bold text-white pl-3 border-l border-gold-500/40 truncate text-[11px]">
                          {chosenName}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Warning Banner */}
              <div className="bg-gold-500/5 border border-gold-500/10 text-[10px] text-white/50 rounded-xl p-4 flex items-start space-x-2.5 mb-6 leading-relaxed">
                <AlertTriangle className="h-4 w-4 text-gold-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Submission is Final</strong>: Once submitted, your choices are locked in. Your selections are recorded completely anonymously and securely.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/5 border border-rose-500/15 text-rose-400 text-xs rounded-xl mb-4 leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleSubmitBallot}
                disabled={!allCategoriesSelected || isSubmitting}
                className="w-full flex items-center justify-center space-x-2 bg-gold-500 hover:bg-gold-600 disabled:bg-white/5 disabled:border-white/10 disabled:text-white/20 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-full shadow-lg shadow-gold-500/20 transition-all border border-transparent disabled:border-white/10 text-xs uppercase tracking-wider cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{isSubmitting ? 'Casting Ballot...' : 'Submit Ballot'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
