/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { VotingProvider } from './VotingContext';
import Navbar from './Navbar';
import LandingPage from './LandingPage';
import VotingPage from './VotingPage';
import AdminDashboard from './AdminDashboard';

export default function App() {
  return (
    <VotingProvider>
      <Router>
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between selection:bg-gold-500/30 selection:text-gold-200">
          
          {/* Main Navigation - Hidden on Print automatically */}
          <div className="print:hidden">
            <Navbar />
          </div>

          {/* Dynamic Page Outlets */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/vote" element={<VotingPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>

          {/* Luxury Event Footer */}
          <footer className="bg-black border-t border-white/10 py-6 text-center print:hidden">
            <div className="max-w-7xl mx-auto px-4 text-xs text-white/30 font-mono tracking-[0.2em] uppercase">
              <span>© 2026 SOUTH ZOO EVENTS. ALL RIGHTS RESERVED.</span>
              <span className="mx-2 text-white/10">|</span>
              <span className="text-white/20">SECURE ANONYMOUS BALLOT SYSTEM</span>
            </div>
          </footer>
          
        </div>
      </Router>
    </VotingProvider>
  );
}
