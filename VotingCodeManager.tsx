/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { VotingCode } from './types';
import { Copy, Check, Trash2, Download, Eye, EyeOff, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VotingCodeManagerProps {
  codes: VotingCode[];
  onDelete: (codeId: string) => Promise<void>;
}

export default function VotingCodeManager({ codes, onDelete }: VotingCodeManagerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUsed, setFilterUsed] = useState<'all' | 'used' | 'unused'>('all');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [deletingCodeId, setDeletingCodeId] = useState<string | null>(null);

  // Filter and search logic
  const filteredCodes = useMemo(() => {
    return codes.filter(code => {
      const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        filterUsed === 'all' || 
        (filterUsed === 'used' && code.used) || 
        (filterUsed === 'unused' && !code.used);
      return matchesSearch && matchesFilter;
    });
  }, [codes, searchQuery, filterUsed]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: codes.length,
      used: codes.filter(c => c.used).length,
      unused: codes.filter(c => !c.used).length,
    };
  }, [codes]);

  const handleCopyCode = (codeStr: string, id: string) => {
    navigator.clipboard.writeText(codeStr);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleExportCodes = () => {
    const csvContent = [
      'Code,Status,Created Date',
      ...filteredCodes.map(c => 
        `"${c.code}","${c.used ? 'USED' : 'AVAILABLE'}","${new Date(c.created_at).toLocaleString()}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voting_codes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
          <span className="block text-2xl font-extrabold text-gold-500 font-mono">{stats.total}</span>
          <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider mt-1">Total Codes</span>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
          <span className="block text-2xl font-extrabold text-emerald-400 font-mono">{stats.unused}</span>
          <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider mt-1">Available</span>
        </div>
        <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-center">
          <span className="block text-2xl font-extrabold text-amber-400 font-mono">{stats.used}</span>
          <span className="block text-[10px] font-mono text-white/40 uppercase tracking-wider mt-1">Redeemed</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search codes..."
              className="w-full bg-black border border-white/10 focus:border-gold-500/40 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none"
              aria-label="Search voting codes"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="flex items-center space-x-2 bg-black border border-white/10 rounded-lg px-3 py-2">
            <Filter className="h-3.5 w-3.5 text-white/40" />
            <select
              value={filterUsed}
              onChange={e => setFilterUsed(e.target.value as any)}
              className="bg-transparent text-xs text-white border-none focus:outline-none cursor-pointer"
              aria-label="Filter codes by status"
            >
              <option value="all">All Codes</option>
              <option value="unused">Available Only</option>
              <option value="used">Redeemed Only</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowCodes(!showCodes)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/[0.02] hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-all cursor-pointer"
            aria-label={showCodes ? 'Hide codes' : 'Show codes'}
          >
            {showCodes ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{showCodes ? 'Hide' : 'Show'}</span>
          </button>
          <button
            onClick={handleExportCodes}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white/[0.02] hover:bg-white/10 border border-white/10 rounded-lg text-xs text-white transition-all cursor-pointer"
            aria-label="Export codes as CSV"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Codes Table */}
      <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <th className="text-left px-4 py-3 font-mono text-white/40 font-bold uppercase tracking-wider">Code</th>
                <th className="text-left px-4 py-3 font-mono text-white/40 font-bold uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-mono text-white/40 font-bold uppercase tracking-wider">Created</th>
                <th className="text-left px-4 py-3 font-mono text-white/40 font-bold uppercase tracking-wider">Redeemed</th>
                <th className="text-center px-4 py-3 font-mono text-white/40 font-bold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredCodes.map((code) => (
                  <motion.tr
                    key={code.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-white">
                      {showCodes ? code.code : '••••••••••••'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-1 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider ${
                        code.used 
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {code.used ? 'Redeemed' : 'Available'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {new Date(code.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white/60">
                      {code.used_at ? new Date(code.used_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-4 py-3 flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleCopyCode(code.code, code.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/40 hover:text-gold-500 transition-colors cursor-pointer"
                        title="Copy code"
                        aria-label={`Copy code ${code.code}`}
                      >
                        {copiedCodeId === code.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                      {!code.used && (
                        <button
                          onClick={async () => {
                            setDeletingCodeId(code.id);
                            await onDelete(code.id);
                            setDeletingCodeId(null);
                          }}
                          disabled={deletingCodeId === code.id}
                          className="p-1.5 hover:bg-rose-500/10 rounded-lg text-white/40 hover:text-rose-400 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete code"
                          aria-label={`Delete code ${code.code}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {filteredCodes.length === 0 && (
          <div className="text-center py-8 text-white/30 font-light">
            <p className="text-xs uppercase tracking-wider">No codes found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
