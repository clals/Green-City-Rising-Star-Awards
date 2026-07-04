/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VotingCode } from './types';

/**
 * Comprehensive voting code lifecycle tracking.
 * Tracks code usage, voter sessions, and redemption patterns.
 */
export interface CodeSessionTrack {
  code_id: string;
  code_string: string;
  voter_session_id: string; // anonymous session hash
  entered_at: string; // ISO timestamp
  ballot_submitted_at: string | null; // ISO timestamp when vote was cast
  ballot_submission_succeeded: boolean;
  error_message: string | null; // if submission failed
  device_fingerprint?: string; // for fraud detection (optional)
}

export class VotingCodeTracker {
  private static readonly STORAGE_KEY = 'voting_code_sessions';
  private static readonly MAX_SESSIONS = 1000; // prevent unbounded growth

  /**
   * Record when a voter enters a voting code
   */
  static trackCodeEntry(codeId: string, codeString: string, voterSessionId: string): void {
    const sessions = this.getCodeSessions();
    const entry: CodeSessionTrack = {
      code_id: codeId,
      code_string: codeString,
      voter_session_id: voterSessionId,
      entered_at: new Date().toISOString(),
      ballot_submitted_at: null,
      ballot_submission_succeeded: false,
      error_message: null,
    };
    sessions.push(entry);
    
    // Prevent unbounded growth
    if (sessions.length > this.MAX_SESSIONS) {
      sessions.shift(); // remove oldest
    }
    
    this.saveCodeSessions(sessions);
  }

  /**
   * Update when a voter successfully submits their ballot
   */
  static trackBallotSubmission(
    voterSessionId: string,
    succeeded: boolean,
    errorMsg?: string
  ): void {
    const sessions = this.getCodeSessions();
    const matchingSession = sessions.find(s => s.voter_session_id === voterSessionId);
    
    if (matchingSession) {
      matchingSession.ballot_submitted_at = new Date().toISOString();
      matchingSession.ballot_submission_succeeded = succeeded;
      matchingSession.error_message = errorMsg || null;
      this.saveCodeSessions(sessions);
    }
  }

  /**
   * Get usage statistics for a specific code
   */
  static getCodeStats(codeId: string): {
    entry_count: number;
    successful_submissions: number;
    failed_submissions: number;
    avg_time_to_submission_ms: number;
    last_used: string | null;
  } {
    const sessions = this.getCodeSessions();
    const codeSessions = sessions.filter(s => s.code_id === codeId);
    
    const successfulSubmissions = codeSessions.filter(s => s.ballot_submitted_at && s.ballot_submission_succeeded);
    const failedSubmissions = codeSessions.filter(s => s.ballot_submitted_at && !s.ballot_submission_succeeded);
    
    const submissionTimes = successfulSubmissions
      .map(s => {
        const enteredAt = new Date(s.entered_at).getTime();
        const submittedAt = new Date(s.ballot_submitted_at!).getTime();
        return submittedAt - enteredAt;
      })
      .filter(t => t > 0);
    
    const avgTime = submissionTimes.length > 0
      ? submissionTimes.reduce((a, b) => a + b, 0) / submissionTimes.length
      : 0;
    
    return {
      entry_count: codeSessions.length,
      successful_submissions: successfulSubmissions.length,
      failed_submissions: failedSubmissions.length,
      avg_time_to_submission_ms: Math.round(avgTime),
      last_used: codeSessions.length > 0 ? codeSessions[codeSessions.length - 1].entered_at : null,
    };
  }

  /**
   * Detect potential code reuse abuse
   * Returns codes that have been entered multiple times in a short period
   */
  static detectCodeAbusePatterns(timeWindowMinutes: number = 10): Array<{
    code_id: string;
    code_string: string;
    entry_count: number;
    time_span_minutes: number;
  }> {
    const sessions = this.getCodeSessions();
    const codeMap = new Map<string, CodeSessionTrack[]>();
    
    sessions.forEach(s => {
      if (!codeMap.has(s.code_id)) {
        codeMap.set(s.code_id, []);
      }
      codeMap.get(s.code_id)!.push(s);
    });
    
    const abusivePatterns: Array<{
      code_id: string;
      code_string: string;
      entry_count: number;
      time_span_minutes: number;
    }> = [];
    
    codeMap.forEach((codeSessions, codeId) => {
      if (codeSessions.length < 2) return;
      
      const sortedByTime = codeSessions.sort(
        (a, b) => new Date(a.entered_at).getTime() - new Date(b.entered_at).getTime()
      );
      
      const firstTime = new Date(sortedByTime[0].entered_at).getTime();
      const lastTime = new Date(sortedByTime[sortedByTime.length - 1].entered_at).getTime();
      const spanMinutes = (lastTime - firstTime) / (1000 * 60);
      
      if (spanMinutes <= timeWindowMinutes && sortedByTime.length > 1) {
        abusivePatterns.push({
          code_id: codeId,
          code_string: sortedByTime[0].code_string,
          entry_count: sortedByTime.length,
          time_span_minutes: Math.round(spanMinutes),
        });
      }
    });
    
    return abusivePatterns;
  }

  /**
   * Export audit log for analysis
   */
  static exportAuditLog(): string {
    const sessions = this.getCodeSessions();
    const csvLines = [
      'Code,Voter Session ID,Entered At,Ballot Submitted At,Success,Error Message',
      ...sessions.map(s => {
        const entered = new Date(s.entered_at).toLocaleString();
        const submitted = s.ballot_submitted_at ? new Date(s.ballot_submitted_at).toLocaleString() : '—';
        const status = s.ballot_submission_succeeded ? 'SUCCESS' : (s.ballot_submitted_at ? 'FAILED' : 'PENDING');
        const error = s.error_message || '—';
        return `"${s.code_string}","${s.voter_session_id}","${entered}","${submitted}","${status}","${error}"`;
      })
    ];
    return csvLines.join('\n');
  }

  /**
   * Clear all tracking data (e.g., on voting reset)
   */
  static clearAllSessions(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  // Private helpers
  private static getCodeSessions(): CodeSessionTrack[] {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return [];
      const stored = window.localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load code sessions:', e);
      return [];
    }
  }

  private static saveCodeSessions(sessions: CodeSessionTrack[]): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sessions));
    } catch (e) {
      console.error('Failed to save code sessions:', e);
    }
  }
}
