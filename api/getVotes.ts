/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

type SheetVote = {
  contestant_id: string;
  category: string;
  timestamp?: string;
};

const setCorsHeaders = (res: any): void => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
};

const withActionParam = (baseUrl: string): string => {
  const url = new URL(baseUrl);
  url.searchParams.set('action', 'getVotes');
  return url.toString();
};

const sanitizeVotes = (votes: unknown): SheetVote[] => {
  if (!Array.isArray(votes)) return [];

  return votes
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const record = item as Record<string, unknown>;
      return {
        contestant_id: typeof record.contestant_id === 'string' ? record.contestant_id.trim() : '',
        category: typeof record.category === 'string' ? record.category.trim() : '',
        timestamp: typeof record.timestamp === 'string' ? record.timestamp : '',
      };
    })
    .filter((vote) => vote.contestant_id && vote.category);
};

export default async function handler(req: any, res: any): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(200).send('');
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
    return;
  }

  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  if (!scriptUrl) {
    res.status(500).json({ success: false, message: 'GOOGLE_SCRIPT_URL is not configured.' });
    return;
  }

  try {
    const upstreamResponse = await fetch(withActionParam(scriptUrl), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    const text = await upstreamResponse.text();
    let json: any = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }

    if (!upstreamResponse.ok || !json?.success) {
      res.status(upstreamResponse.ok ? 400 : 502).json({
        success: false,
        message: json?.message || 'Failed to fetch votes.',
      });
      return;
    }

    const votes = sanitizeVotes(json.votes);
    res.status(200).json({ success: true, votes });
  } catch {
    res.status(503).json({
      success: false,
      message: 'Unable to fetch votes right now.',
    });
  }
}
