/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Trophy, TrendingUp, Users, Award, Search, Filter } from 'lucide-react';
import { Category, Contestant, Vote } from './types';
import { motion } from 'motion/react';
import SafeImage from './SafeImage';

interface AnalyticsChartsProps {
  votes: Vote[];
  contestants: Contestant[];
  categories: Category[];
}

export default function AnalyticsCharts({ votes, contestants, categories }: AnalyticsChartsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.name || 'All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Calculate general stats
  const totalVotes = votes.length;
  
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    categories.forEach(c => {
      stats[c.name] = 0;
    });
    votes.forEach(v => {
      if (stats[v.category] !== undefined) {
        stats[v.category]++;
      } else {
        stats[v.category] = 1;
      }
    });
    return stats;
  }, [votes, categories]);

  // 2. Count votes per contestant
  const contestantVoteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    contestants.forEach(c => {
      counts[c.id] = 0;
    });
    votes.forEach(v => {
      if (counts[v.contestant_id] !== undefined) {
        counts[v.contestant_id]++;
      }
    });
    return counts;
  }, [votes, contestants]);

  // 3. Leading Contestant per category
  const categoryLeaders = useMemo(() => {
    const leaders: Record<string, { contestant: Contestant; votes: number; percentage: number }> = {};
    
    categories.forEach(cat => {
      const catContestants = contestants.filter(c => c.category === cat.name);
      let leadContestant: Contestant | null = null;
      let maxVotes = -1;
      let totalCatVotes = 0;

      catContestants.forEach(cont => {
        const cVotes = contestantVoteCounts[cont.id] || 0;
        totalCatVotes += cVotes;
        if (cVotes > maxVotes) {
          maxVotes = cVotes;
          leadContestant = cont;
        }
      });

      if (leadContestant && maxVotes > 0) {
        leaders[cat.name] = {
          contestant: leadContestant,
          votes: maxVotes,
          percentage: totalCatVotes > 0 ? Math.round((maxVotes / totalCatVotes) * 100) : 0,
        };
      }
    });

    return leaders;
  }, [categories, contestants, contestantVoteCounts]);

  // 4. Compute data for selected category charts
  const selectedCategoryData = useMemo(() => {
    const activeCatName = selectedCategory;
    const catContestants = contestants.filter(c => 
      (activeCatName === 'All' || c.category === activeCatName) &&
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalCatVotes = votes.filter(v => activeCatName === 'All' || v.category === activeCatName).length;

    const list = catContestants.map(c => {
      const cVotes = contestantVoteCounts[c.id] || 0;
      const pct = totalCatVotes > 0 ? (cVotes / totalCatVotes) * 100 : 0;
      return {
        ...c,
        votes: cVotes,
        percentage: pct,
      };
    });

    // Sort descending by votes
    return list.sort((a, b) => b.votes - a.votes);
  }, [selectedCategory, contestants, votes, contestantVoteCounts, searchQuery]);

  // Donut Segment Colors (Luxury Gold & High Contrast Accents)
  const COLORS = [
    '#C5A059', // Classic Gold
    '#DFC084', // Light Champaign Gold
    '#A38042', // Dark Bronze Gold
    '#D4B26F', // Satin Gold
    '#82632B', // Golden Amber
    '#F2E5D0', // Ivory Gold Pearl
    '#EAD3A3', // Pale Gold
  ];

  // 5. Build Donut Chart Data
  const donutSegments = useMemo(() => {
    let cumulativePercent = 0;
    const items = Object.entries(categoryStats).map(([name, count], index) => {
      const pct = totalVotes > 0 ? (count as number) / totalVotes : 0;
      const segment = {
        name,
        count,
        percent: pct * 100,
        startPercent: cumulativePercent,
        color: COLORS[index % COLORS.length],
      };
      cumulativePercent += pct * 100;
      return segment;
    });
    return items;
  }, [categoryStats, totalVotes]);

  return (
    <div className="space-y-8" id="analytics-section">
      {/* 1. High Level Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
          <div className="bg-gold-500/10 border border-gold-500/20 p-3 rounded-xl text-gold-500">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-white/40 font-mono tracking-widest uppercase">Total Votes Cast</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-0.5 block">{totalVotes}</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
          <div className="bg-gold-500/10 border border-gold-500/20 p-3 rounded-xl text-gold-500">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-white/40 font-mono tracking-widest uppercase">Active Categories</span>
            <span className="text-3xl font-extrabold text-white font-mono mt-0.5 block">{categories.length}</span>
          </div>
        </div>

        <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex items-center space-x-4">
          <div className="bg-gold-500/10 border border-gold-500/20 p-3 rounded-xl text-gold-500">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-[10px] text-white/40 font-mono tracking-widest uppercase">Leaderboard Status</span>
            <span className="text-xs font-semibold text-gold-500 flex items-center mt-2.5">
              <TrendingUp className="h-4 w-4 mr-1.5 animate-pulse" /> LIVE SYNC ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* 2. Visual Graphs Panel: Donut + Leaders Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Category Share Donut (Pure SVG) */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
          <h4 className="text-[10px] font-bold text-white/40 tracking-wider font-mono uppercase mb-6 flex items-center justify-between">
            <span>Vote Share by Category</span>
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-ping"></span>
          </h4>

          {totalVotes === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-white/30 font-light">
              <p className="text-xs">No ballots cast yet to compute segments.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {/* Donut SVG Rendering */}
              <div className="relative flex justify-center items-center py-4">
                <svg width="180" height="180" viewBox="0 0 42 42" className="transform -rotate-90">
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#161616" strokeWidth="4.5" />
                  {donutSegments.map((seg, idx) => {
                    const dashArray = `${seg.percent} ${100 - seg.percent}`;
                    const dashOffset = 125 - (seg.startPercent as number); // standard offset logic
                    return (
                      <circle
                        key={idx}
                        cx="21"
                        cy="21"
                        r="15.915"
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth="5"
                        strokeDasharray={dashArray}
                        strokeDashoffset={dashOffset}
                        className="transition-all duration-500 hover:stroke-[6] cursor-pointer"
                        title={`${seg.name}: ${seg.count} votes`}
                      />
                    );
                  })}
                </svg>

                <div className="absolute flex flex-col justify-center items-center text-center">
                  <span className="text-3xl font-extrabold text-white font-mono">{totalVotes}</span>
                  <span className="text-[9px] text-white/40 font-mono tracking-widest uppercase">Ballots</span>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-4 border-t border-white/10 text-[11px]">
                {donutSegments.map((seg, idx) => (
                  <div key={idx} className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }}></span>
                    <span className="text-white/60 truncate flex-1 font-light">{seg.name}</span>
                    <span className="text-white font-mono font-bold">{Math.round(seg.percent)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Categories Leaders Board */}
        <div className="lg:col-span-3 bg-white/[0.02] border border-white/10 rounded-2xl p-6">
          <h4 className="text-[10px] font-bold text-white/40 tracking-wider font-mono uppercase mb-6 flex items-center justify-between">
            <span>Category Leaders</span>
            <Trophy className="h-4 w-4 text-gold-500" />
          </h4>

          {Object.keys(categoryLeaders).length === 0 ? (
            <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 text-white/30 border border-dashed border-white/10 rounded-xl font-light">
              <p className="text-xs">No front-runners emerged yet. Cast votes to update.</p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[340px] overflow-y-auto pr-1">
              {categories.map(cat => {
                const leader = categoryLeaders[cat.name];
                if (!leader) return null;
                return (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/10 hover:border-gold-500/20 transition-all duration-200">
                    <div className="flex items-center space-x-3.5">
                      <SafeImage
                        src={leader.contestant.photo_url}
                        alt={leader.contestant.name}
                        name={leader.contestant.name}
                        className="h-11 w-11 rounded-xl object-cover border border-gold-500/20 shadow-md flex-shrink-0"
                      />
                      <div>
                        <span className="block text-[9px] text-gold-500 font-mono font-bold tracking-wider uppercase">
                          {cat.name}
                        </span>
                        <span className="block text-sm font-bold text-white leading-tight font-serif mt-0.5">
                          {leader.contestant.name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[11px] text-white/40 font-mono font-medium">
                        {leader.votes} {leader.votes === 1 ? 'vote' : 'votes'}
                      </span>
                      <span className="inline-flex px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-500 text-[9px] font-mono font-bold uppercase tracking-wider mt-1 border border-gold-500/20">
                        {leader.percentage}% share
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 3. Drill-down Rankings & Search Filter Bar */}
      <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
          <div>
            <h4 className="text-base font-bold text-white font-serif uppercase tracking-wide">
              Detailed Contestant Rankings
            </h4>
            <p className="text-xs text-white/50 mt-1 font-light">
              Select category filters and search to drill down into voting counts
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Category Selector */}
            <div className="flex items-center space-x-2 bg-black px-3 py-2 rounded-full border border-white/10">
              <Filter className="h-3.5 w-3.5 text-white/40" />
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs text-white focus:outline-none border-none pr-6 cursor-pointer"
              >
                <option value="All" className="bg-black text-white">All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name} className="bg-black text-white">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search nominees..."
                className="bg-black border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-gold-500/40 focus:ring-1 focus:ring-gold-500/25 transition-all duration-200 w-full md:w-auto"
              />
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart (Drill-down list) */}
        {selectedCategoryData.length === 0 ? (
          <div className="text-center py-12 text-white/30 font-light">
            <p className="text-xs">No contestants found matching the search criteria.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {selectedCategoryData.map((cont, index) => (
              <div key={cont.id} className="relative group">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="text-[10px] font-mono font-bold text-white/30 w-4">
                      #{index + 1}
                    </span>
                    <SafeImage
                      src={cont.photo_url}
                      alt={cont.name}
                      name={cont.name}
                      className="h-8 w-8 rounded-lg object-cover border border-white/10 flex-shrink-0"
                    />
                    <div>
                      <span className="font-bold text-white font-serif tracking-wide">{cont.name}</span>
                      {selectedCategory === 'All' && (
                        <span className="ml-2 inline-block px-2 py-0.5 rounded-full bg-gold-500/10 text-gold-500 text-[8px] font-mono tracking-widest uppercase font-bold border border-gold-500/10">
                          {cont.category}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 font-mono">
                    <span className="text-[10px] text-white/40 font-light">
                      {cont.votes} {cont.votes === 1 ? 'vote' : 'votes'}
                    </span>
                    <span className="text-[11px] font-bold text-gold-500">
                      {Math.round(cont.percentage)}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar Container */}
                <div className="h-2 w-full bg-black rounded-full overflow-hidden border border-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${cont.percentage}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 rounded-full relative"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
