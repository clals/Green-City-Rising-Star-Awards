/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Trophy, ShieldCheck, LogOut, Vote, Award, Menu, X } from 'lucide-react';
import { useVoting } from '../context/VotingContext';

export default function Navbar() {
  const { isDbConfigured } = useVoting();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <nav className="border-b border-white/10 bg-[#0a0a0a]/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group" id="nav-logo-link">
              <div className="w-10 h-10 bg-gold-500 rounded-full flex items-center justify-center shadow-lg shadow-gold-500/10 group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                <img 
                  src="https://drive.google.com/thumbnail?id=1HId2dJBJXBdwwMRheioAr3nIhFPDHjAd&sz=w100" 
                  alt="South Zoo Events Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      const fallback = parent.querySelector('.fallback-icon');
                      if (fallback) fallback.classList.remove('hidden');
                    }
                  }}
                />
                <Trophy className="h-5 w-5 text-[#0a0a0a] fallback-icon hidden" />
              </div>
              <div>
                <span className="text-base font-light tracking-[0.1em] text-white uppercase font-serif flex items-center">
                  Green City<span className="text-gold-500 font-medium ml-1.5">Rising Stars</span>
                </span>
                <span className="block text-[9px] text-white/40 tracking-[0.25em] uppercase font-sans">
                  Online Voting Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-xs tracking-wider uppercase transition-colors duration-200 ${
                location.pathname === '/' ? 'text-gold-500 font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              Home
            </Link>

            <Link
              to="/vote"
              className={`text-xs tracking-wider uppercase transition-colors duration-200 ${
                location.pathname === '/vote' ? 'text-gold-500 font-semibold' : 'text-white/60 hover:text-white'
              }`}
            >
              Vote Panel
            </Link>



            {/* Admin Switch */}
            <Link
              to={isAdminPath ? "/" : "/admin"}
              className={`flex items-center space-x-2 px-5 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                isAdminPath
                  ? 'bg-gold-500 hover:bg-gold-600 text-black font-semibold'
                  : 'border border-gold-500/40 hover:bg-gold-500/10 text-white'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{isAdminPath ? 'Exit Admin' : 'Admin Panel'}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-400 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10 px-4 pt-2 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-wider uppercase text-white/70 hover:text-white px-3 py-2 rounded-md"
          >
            Home
          </Link>
          <Link
            to="/vote"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm tracking-wider uppercase text-white/70 hover:text-white px-3 py-2 rounded-md"
          >
            Vote Panel
          </Link>



          <Link
            to={isAdminPath ? "/" : "/admin"}
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-center space-x-2 w-full px-4 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              isAdminPath
                ? 'bg-gold-500 text-black hover:bg-gold-600'
                : 'border border-gold-500/40 hover:bg-gold-500/10 text-white'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{isAdminPath ? 'Exit Admin Dashboard' : 'Secure Admin Access'}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
