/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type VotePayload = {
  contestant_id: string;
  contestant_name: string;
  category: string;
  vote_code: string;
  timestamp: string;
};

type ValidationResult = { ok: true; payload: VotePayload } | { ok: false; message: string };

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === 'string' && value.trim().length > 0;
};

const parseBody = (body: unknown): unknown | null => {
  if (!body) return null;
  if (typeof body === 'object') return body;
  if (typeof body !== 'string') return null;

  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
};

const validateVotePayload = (data: unknown): ValidationResult => {
  if (!data || typeof data !== 'object') {
    return { ok: false, message: 'Invalid JSON payload.' };
  }

  const candidate = data as Partial<VotePayload>;

  if (!isNonEmptyString(candidate.contestant_id)) {
    return { ok: false, message: 'contestant_id is required.' };
  }
  if (!isNonEmptyString(candidate.contestant_name)) {
    return { ok: false, message: 'contestant_name is required.' };
  }
  if (!isNonEmptyString(candidate.category)) {
    return { ok: false, message: 'category is required.' };
  }
  if (!isNonEmptyString(candidate.vote_code)) {
    return { ok: false, message: 'vote_code is required.' };
  }
  if (!isNonEmptyString(candidate.timestamp) || Number.isNaN(Date.parse(candidate.timestamp))) {
    return { ok: false, message: 'timestamp must be a valid ISO date string.' };
  }

  return {
    ok: true,
    payload: {
      contestant_id: candidate.contestant_id.trim(),
      contestant_name: candidate.contestant_name.trim(),
      category: candidate.category.trim(),
      vote_code: candidate.vote_code.trim(),
      timestamp: candidate.timestamp.trim(),
    },
  };
};

const setCorsHeaders = (res: any): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
};

const extractClientMeta = (req: any): { ip: string; user_agent: string } => {
  const headers = req?.headers || {};
  const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || '';
  const userAgent = headers['user-agent'] || '';

  return {
    ip: String(ip).split(',')[0].trim(),
    user_agent: String(userAgent).trim(),
  };
};

export default async function handler(req: any, res: any): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    res.status(500).json({ success: false, message: 'GOOGLE_SCRIPT_URL is not configured.' });
    return;
  }

  const parsed = parseBody(req.body);
  if (!parsed) {
    res.status(400).json({ success: false, message: 'Invalid JSON payload.' });
    return;
  }

  const validation = validateVotePayload(parsed);
  if (validation.ok === false) {
    res.status(400).json({ success: false, message: validation.message });
    return;
  }

  const metadata = extractClientMeta(req);

  try {
    const upstreamResponse = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...validation.payload,
        ...metadata,
      }),
    });

    const upstreamText = await upstreamResponse.text();
    let upstreamJson: any = null;
    try {
      upstreamJson = upstreamText ? JSON.parse(upstreamText) : null;
    } catch {
      upstreamJson = null;
    }

    if (!upstreamResponse.ok || !upstreamJson?.success) {
      res.status(upstreamResponse.ok ? 400 : 502).json({
        success: false,
        message: upstreamJson?.message || 'Failed to record vote.',
      });
      return;
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(503).json({
      success: false,
      message: 'Unable to record your vote. Please try again.',
    });
  }
}
