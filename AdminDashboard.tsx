/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useVoting } from './VotingContext';
import { dbService } from './db';
import { 
  ShieldCheck, Lock, Eye, EyeOff, Users, Award, Trophy, Settings, 
  Plus, Trash2, Edit3, RefreshCw, FileSpreadsheet, FileText, Check, 
  AlertCircle, Calendar, X, Upload, Loader
} from 'lucide-react';
import AnalyticsCharts from './AnalyticsCharts';
import SafeImage from './SafeImage';
import { motion, AnimatePresence } from 'motion/react';
import { Category, Contestant } from './types';

export default function AdminDashboard() {
  const {
    categories, contestants, votingCodes, settings, refreshData,
    addCategory, deleteCategory, addContestant, updateContestant, deleteContestant,
    updateSettings, resetVoting
  } = useVoting();

  // Authentication Lock State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState<string | null>(null);
  const [showPasscode, setShowPasscode] = useState(false);

  // Active Admin Panel Tab
  const [activeTab, setActiveTab] = useState<'analytics' | 'candidates' | 'categories' | 'settings'>('analytics');

  // Local Action States
  const [votes, setVotes] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 2. Candidate Manager (CRUD) Forms State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState<Contestant | null>(null);
  const [candName, setCandName] = useState('');
  const [candCategory, setCandCategory] = useState('');
  const [candDescription, setCandDescription] = useState('');
  const [candPhotoUrl, setCandPhotoUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // 3. Category Manager State
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // 4. Settings Form State
  const [setOpenDate, setSetOpenDate] = useState('');
  const [setCloseDate, setSetCloseDate] = useState('');
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // 5. Destructive safety state
  const [resetConfirmInput, setResetConfirmInput] = useState('');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetFinishedNotice, setResetFinishedNotice] = useState(false);

  // Load votes separately for analytics rendering
  const loadVotes = async () => {
    try {
      const v = await dbService.getVotes();
      setVotes(v);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadVotes();
    }
  }, [isAuthenticated, votingCodes]);

  // Handle local passkey authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'Southzoo@2026') {
      setIsAuthenticated(true);
      setPasscodeError(null);
    } else {
      setPasscodeError('Access Denied. Invalid administrative passkey.');
    }
  };

  // Pre-load dates inside settings form
  useEffect(() => {
    if (settings.voting_open && settings.voting_close) {
      // Convert to local datetime-local value format
      const toLocalDateVal = (isoStr: string) => {
        const d = new Date(isoStr);
        // adjust offset
        const tzOffset = d.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(d.getTime() - tzOffset)).toISOString().slice(0, 16);
        return localISOTime;
      };
      setSetOpenDate(toLocalDateVal(settings.voting_open));
      setSetCloseDate(toLocalDateVal(settings.voting_close));
    }
  }, [settings]);

  // Calculate contestant statistics for deletions
  const getContestantStats = (categoryName: string) => {
    const categoryContestants = contestants.filter(c => c.category === categoryName);
    const categoryVotes = votes.filter(v => v.category === categoryName).length;
    return {
      nomineeCount: categoryContestants.length,
      voteCount: categoryVotes,
    };
  };

  // Sync state for editing contestants
  const openCandidateModal = (cand: Contestant | null = null) => {
    if (cand) {
      setEditingCandidate(cand);
      setCandName(cand.name);
      setCandCategory(cand.category);
      setCandDescription(cand.description);
      setCandPhotoUrl(cand.photo_url);
    } else {
      setEditingCandidate(null);
      setCandName('');
      setCandCategory(categories[0]?.name || '');
      setCandDescription('Nominee Profile');
      setCandPhotoUrl('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300');
    }
    setUploadError(null);
    setUploadProgress(0);
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candName || !candCategory || !candDescription || !candPhotoUrl) {
      alert('Please fill out all fields.');
      return;
    }

    if (editingCandidate) {
      // Update
      await updateContestant(editingCandidate.id, {
        name: candName,
        category: candCategory,
        description: candDescription,
        photo_url: candPhotoUrl,
      });
    } else {
      // Add
      await addContestant({
        name: candName,
        category: candCategory,
        description: candDescription,
        photo_url: candPhotoUrl,
      });
    }
    setIsCandidateModalOpen(false);
  };

  // Handle image file upload with validation and progress
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);
    setUploadProgress(0);

    try {
      const uploadedUrl = await dbService.uploadImage(file, {
        maxFileSizeMb: 5,
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        onProgress: (percent) => setUploadProgress(percent),
      });
      setCandPhotoUrl(uploadedUrl);
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(errorMsg);
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Add category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    await addCategory(newCatName, newCatDesc);
    setNewCatName('');
    setNewCatDesc('');
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const openISO = new Date(setOpenDate).toISOString();
      const closeISO = new Date(setCloseDate).toISOString();
      await updateSettings(openISO, closeISO);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err) {
      alert('Invalid date-time configuration.');
    }
  };

  // Reset voting handler
  const handleTriggerReset = async () => {
    if (resetConfirmInput !== 'RESET') {
      alert('Verification mismatch. Wiping aborted.');
      return;
    }
    await resetVoting();
    localStorage.removeItem('has_voted_south_zoo');
    localStorage.removeItem('has_voted_green_city');
    setVotes([]);
    setResetConfirmInput('');
    setResetConfirmOpen(false);
    setResetFinishedNotice(true);
    setTimeout(() => setResetFinishedNotice(false), 5000);
  };

  // Refresh
  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    await loadVotes();
    setIsRefreshing(false);
  };

  // Export Rankings as CSV file
  const handleExportCSV = () => {
    let csvContent = 'Category,Contestant,Nominee ID,Description,Vote Count\n';
    categories.forEach(cat => {
      const catConts = contestants.filter(c => c.category === cat.name);
      catConts.forEach(cont => {
        const cVotes = votes.filter(v => v.contestant_id === cont.id).length;
        // sanitize fields
        const nameSan = cont.name.replace(/"/g, '""');
        const descSan = cont.description.replace(/"/g, '""');
        const catSan = cat.name.replace(/"/g, '""');
        csvContent += `"${catSan}","${nameSan}","${cont.id}","${descSan}",${cVotes}\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `green_city_rising_star_awards_results_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Printable PDF Results Gate
  const handleExportPDF = () => {
    window.print();
  };

  // Render Lock Gate
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4" id="admin-lock-root">
        
        {/* backdrop circles */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gold-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-white/[0.02] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600"></div>

          <div className="text-center mb-8">
            <div className="inline-flex p-3.5 bg-gold-500/10 border border-gold-500/20 text-gold-500 rounded-2xl mb-4 shadow-inner animate-pulse">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-xl font-extrabold text-white uppercase font-serif tracking-wide">Organizers Gate</h2>
            <p className="text-xs text-white/50 mt-1 font-light">Please enter the passcode to access results and settings</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="admin-passcode" className="block text-[10px] font-mono tracking-widest text-white/40 uppercase mb-2">
                Secret Passkey
              </label>
              <div className="relative">
                <input
                  id="admin-passcode"
                  type={showPasscode ? 'text' : 'password'}
                  value={passcode}
                  onChange={e => setPasscode(e.target.value)}
                  placeholder="Enter passcode..."
                  className="w-full bg-black border border-white/10 hover:border-white/20 focus:border-gold-500/40 rounded-xl px-4 py-3 text-sm text-center text-white font-mono tracking-widest focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3.5 top-3.5 text-white/40 hover:text-white"
                >
                  {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {passcodeError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{passcodeError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-3 px-4 rounded-full shadow-lg transition-all text-xs uppercase tracking-wider cursor-pointer"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="bg-black/60 border border-white/10 rounded-xl p-3 text-center text-[11px] text-white/40 mt-6 leading-relaxed">
            💡 For evaluating inside AI Studio, type <span className="text-gold-500 font-bold font-mono">Southzoo@2026</span> to unlock.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans py-8 px-4 sm:px-6 lg:px-8 relative" id="admin-dashboard-container">
      
      {/* Printable Area - styling overrides are injected in print view */}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block (Hidden on Print automatically via utility) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10 print:hidden">
          <div>
            <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-gold-500 tracking-wider uppercase">
              <ShieldCheck className="h-4 w-4" />
              <span>Administrative Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 uppercase font-serif tracking-wider">
              Organizers Command Center
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-1.5 bg-white/[0.02] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Refreshing...' : 'Sync Data'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 bg-white/[0.02] hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-1.5 bg-gold-500 hover:bg-gold-600 px-4 py-2 rounded-full text-xs font-semibold text-black transition-all cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Print Results / PDF</span>
            </button>
          </div>
        </div>

        {/* Dashboard Menu Tabs (Hidden on Print) */}
        <div className="flex overflow-x-auto pb-1 border-b border-white/10 gap-2 print:hidden">
          {[
            { id: 'analytics', label: 'Analytics Insights', icon: Trophy },
            { id: 'candidates', label: 'Manage Nominees', icon: Users },
            { id: 'categories', label: 'Award Categories', icon: Award },
            { id: 'settings', label: 'Period & Safety', icon: Settings },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full text-[10px] uppercase font-bold tracking-wider whitespace-nowrap border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gold-500 text-black border-gold-500 font-bold shadow-lg shadow-gold-500/10'
                    : 'bg-white/[0.02] text-white/50 border-white/10 hover:text-white hover:border-gold-500/30'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================================= */}
        {/* PRINT VIEW HEADER (Only visible when printing) */}
        {/* ========================================================================================= */}
        <div className="hidden print:block text-black p-4 space-y-2 border-b-2 border-black">
          <h1 className="text-3xl font-extrabold uppercase tracking-wide text-center">2026 GREEN CITY RISING STAR AWARDS OFFICIAL RESULTS</h1>
          <p className="text-sm font-mono text-center">Generated on: {new Date().toLocaleString()}</p>
          <p className="text-xs text-center font-serif italic">Total recorded ballots: {votes.length}</p>
        </div>

        {/* ========================================================================================= */}
        {/* TAB CONTENTS CONTAINER */}
        {/* ========================================================================================= */}
        <div className="space-y-8">
          
          {/* TAB 1: ANALYTICS (Rendered on both screen and print) */}
          {(activeTab === 'analytics' || window.matchMedia('print').matches) && (
            <div className={`${activeTab !== 'analytics' ? 'hidden print:block' : ''}`}>
              <AnalyticsCharts
                votes={votes}
                contestants={contestants}
                categories={categories}
              />
            </div>
          )}

          {/* TAB 3: MANAGE NOMINEES (CRUD) (Hidden on print) */}
          {activeTab === 'candidates' && (
            <div className="space-y-6 print:hidden">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-white uppercase font-serif tracking-wide">Award Nominees Ledger</h3>
                  <p className="text-xs text-white/50 font-light">Total registered profiles: {contestants.length}</p>
                </div>

                <button
                  onClick={() => openCandidateModal()}
                  className="flex items-center space-x-1.5 bg-gold-500 hover:bg-gold-600 text-black font-semibold px-4 py-2 rounded-full text-xs uppercase tracking-wider cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Nominee</span>
                </button>
              </div>

              {/* Nominees Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {contestants.map(cont => (
                  <div key={cont.id} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-gold-500/30 transition duration-300">
                    <div className="aspect-video w-full relative bg-black">
                      <SafeImage
                        src={cont.photo_url}
                        alt={cont.name}
                        name={cont.name}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-0.5 text-[9px] font-mono tracking-wider text-gold-500 uppercase">
                        {cont.category}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h4 className="font-extrabold text-white text-base leading-snug font-serif">{cont.name}</h4>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <span className="text-[9px] font-mono text-white/30">ID: {cont.id.slice(0, 8)}...</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openCandidateModal(cont)}
                            className="p-1.5 hover:bg-white/10 rounded-full text-white/40 hover:text-gold-500 transition-colors cursor-pointer"
                            title="Edit Nominee"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Are you sure you want to remove nominee ${cont.name}?`)) {
                                await deleteContestant(cont.id);
                              }
                            }}
                            className="p-1.5 hover:bg-rose-500/10 rounded-full text-white/40 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete Nominee"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 4: AWARD CATEGORIES (CRUD) (Hidden on print) */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 print:hidden">
              
              {/* Add Category Form */}
              <div className="lg:col-span-1 bg-white/[0.02] border border-white/10 rounded-2xl p-6 self-start space-y-4">
                <h3 className="text-base font-bold text-white flex items-center font-serif uppercase tracking-wider">
                  <Award className="h-4 w-4 text-gold-500 mr-2" />
                  Define Category
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Add award categories instantly. These will immediately render as sections inside voter ballots.
                </p>

                <form onSubmit={handleAddCategory} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Category Name</label>
                    <input
                      type="text"
                      required
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="e.g. Best Sound Design"
                      className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Brief Criteria</label>
                    <textarea
                      value={newCatDesc}
                      onChange={e => setNewCatDesc(e.target.value)}
                      placeholder="e.g. Recognizing achievements in audio engineering..."
                      rows={3}
                      className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-2.5 rounded-full text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Add Category
                  </button>
                </form>
              </div>

              {/* Categories list */}
              <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
                <h3 className="text-base font-bold text-white mb-4 uppercase font-serif tracking-wider">Official Categories Ledger</h3>
                
                <div className="space-y-3">
                  {categories.map(cat => {
                    const stats = getContestantStats(cat.name);
                    return (
                      <div key={cat.id} className="flex justify-between items-start p-3.5 rounded-xl bg-white/[0.02] border border-white/10">
                        <div className="flex-1">
                          <span className="block font-bold text-white text-sm font-serif">{cat.name}</span>
                          <span className="block text-xs text-white/55 mt-1 font-light">{cat.description || 'No criteria specified.'}</span>
                          {/* DELETION WARNING: Show stats before deletion */}
                          <div className="mt-3 flex gap-4 text-[10px] font-mono text-white/40">
                            <span>📋 {stats.nomineeCount} nominee{stats.nomineeCount !== 1 ? 's' : ''}</span>
                            <span>🗳️ {stats.voteCount} vote{stats.voteCount !== 1 ? 's' : ''}</span>
                          </div>
                        </div>

                        <button
                          onClick={async () => {
                            // ENHANCED WARNING: Show nominees and votes before deletion
                            const stats = getContestantStats(cat.name);
                            const warning = stats.voteCount > 0 
                              ? `⚠️ WARNING: This will delete ${stats.nomineeCount} nominee(s) and ${stats.voteCount} associated vote(s). This action cannot be undone.`
                              : `Are you sure you want to delete category "${cat.name}"? This will delete ${stats.nomineeCount} nominee(s).`;
                            
                            if (confirm(warning)) {
                              await deleteCategory(cat.id);
                            }
                          }}
                          className="text-white/40 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-full transition-colors cursor-pointer flex-shrink-0 ml-3"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: SYSTEM TIMERS & SAFETY SETTINGS (Hidden on print) */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print:hidden">
              
              {/* Date timers box */}
              <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center font-serif uppercase tracking-wider">
                  <Calendar className="h-4 w-4 text-gold-500 mr-2" />
                  Voting Period Scheduling
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Define exact opening and closing windows. Homepage timers and code validation gates dynamically lock based on these times.
                </p>

                <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Opening Date-Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={setOpenDate}
                      onChange={e => setSetOpenDate(e.target.value)}
                      className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Closing Date-Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={setCloseDate}
                      onChange={e => setSetCloseDate(e.target.value)}
                      className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    />
                  </div>

                  {settingsSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center">
                      <Check className="h-4 w-4 mr-1.5" />
                      <span>Voting period scheduled successfully!</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full bg-gold-500 hover:bg-gold-600 text-black font-semibold py-2.5 rounded-full text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Schedule Period
                  </button>
                </form>
              </div>

              {/* Secure Safety Wipe box */}
              <div className="bg-white/[0.02] border border-rose-950/40 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-rose-400 flex items-center font-serif uppercase tracking-wider">
                  <AlertCircle className="h-4 w-4 text-rose-500 mr-2" />
                  Secure System Factory Wipe
                </h3>
                <p className="text-xs text-white/50 leading-relaxed font-light">
                  Resetting clears all registered voting selections. This allows voters to cast their ballots again. This action is irreversible.
                </p>

                {resetFinishedNotice && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center">
                    <Check className="h-4 w-4 mr-1.5" />
                    <span>System has been safely wiped and reset!</span>
                  </div>
                )}

                {resetConfirmOpen ? (
                  <div className="bg-rose-500/5 border border-rose-500/25 p-4 rounded-xl space-y-3">
                    <span className="block text-[10px] font-mono font-bold text-rose-400 uppercase tracking-widest">⚠️ CRITICAL SAFETY WALL:</span>
                    <p className="text-[11px] text-white/50 leading-normal font-light">
                      To confirm complete deletion, type <span className="font-bold text-white font-mono uppercase bg-black px-1 py-0.5 rounded">RESET</span> in the validation line below.
                    </p>
                    
                    <input
                      type="text"
                      value={resetConfirmInput}
                      onChange={e => setResetConfirmInput(e.target.value)}
                      placeholder="Type RESET..."
                      className="w-full bg-black border border-rose-500/20 focus:border-rose-500 rounded-lg px-3 py-2 text-xs font-mono text-center text-white focus:outline-none"
                    />

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={handleTriggerReset}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2 rounded-full text-xs transition cursor-pointer"
                      >
                        Wipe Ballots
                      </button>
                      <button
                        onClick={() => {
                          setResetConfirmOpen(false);
                          setResetConfirmInput('');
                        }}
                        className="flex-1 bg-white/[0.02] hover:bg-white/10 text-white/50 py-2 rounded-full text-xs transition border border-white/10 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setResetConfirmOpen(true)}
                    className="w-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 font-semibold py-2.5 rounded-full text-xs tracking-wider uppercase transition-all cursor-pointer"
                  >
                    Initiate Voting Reset
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>

      {/* ========================================================================================= */}
      {/* ADD/EDIT NOMINEE MODAL (Hidden on print) */}
      {/* ========================================================================================= */}
      <AnimatePresence>
        {isCandidateModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 print:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0c] border border-white/10 max-w-md w-full rounded-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setIsCandidateModalOpen(false)}
                className="absolute top-4 right-4 text-white/40 hover:text-white cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="text-base font-bold text-white mb-6 uppercase font-serif tracking-wider">
                {editingCandidate ? `Edit Nominee Profile` : `Add Award Nominee`}
              </h3>

              <form onSubmit={handleSaveCandidate} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={candName}
                    onChange={e => setCandName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Award Category</label>
                  <select
                    value={candCategory}
                    onChange={e => setCandCategory(e.target.value)}
                    className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name} className="bg-black text-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Description</label>
                  <textarea
                    value={candDescription}
                    onChange={e => setCandDescription(e.target.value)}
                    placeholder="Brief bio or achievements"
                    rows={2}
                    className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Photo Upload</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <label className="flex-1 flex items-center justify-center px-3 py-2 bg-black border border-white/10 hover:border-gold-500/40 rounded-lg cursor-pointer transition-colors">
                        <Upload className="h-3.5 w-3.5 mr-1.5" />
                        <span className="text-[10px] text-white font-mono uppercase tracking-wider">Choose File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={isUploadingImage}
                          className="hidden"
                        />
                      </label>
                    </div>
                    
                    {isUploadingImage && (
                      <div className="flex items-center space-x-2">
                        <Loader className="h-3.5 w-3.5 animate-spin text-gold-500" />
                        <span className="text-[10px] text-gold-400">Uploading... {uploadProgress}%</span>
                      </div>
                    )}
                    
                    {uploadError && (
                      <div className="p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] rounded-lg flex items-start space-x-1.5">
                        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono tracking-wider text-white/40 uppercase mb-1">Photo URL (or use uploaded image above)</label>
                  <input
                    type="url"
                    value={candPhotoUrl}
                    onChange={e => setCandPhotoUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... "
                    className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                  />
                  {candPhotoUrl && (
                    <div className="mt-2.5 flex items-center space-x-3 bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                      <div className="w-16 h-12 rounded-lg overflow-hidden bg-black relative flex-shrink-0">
                        <SafeImage
                          src={candPhotoUrl}
                          alt="Live Preview"
                          name={candName || "Preview"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block text-[9px] font-mono text-gold-500 uppercase font-bold tracking-wider">Live Preview</span>
                        <span className="block text-[8px] text-white/40 truncate">{candPhotoUrl}</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 pt-4">
                  <button
                    type="submit"
                    disabled={isUploadingImage}
                    className="flex-1 bg-gold-500 hover:bg-gold-600 text-black font-semibold py-2.5 rounded-full text-xs uppercase cursor-pointer disabled:opacity-50 transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCandidateModalOpen(false)}
                    disabled={isUploadingImage}
                    className="flex-1 bg-white/[0.02] hover:bg-white/10 border border-white/10 text-white/50 py-2.5 rounded-full text-xs uppercase cursor-pointer disabled:opacity-50 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
