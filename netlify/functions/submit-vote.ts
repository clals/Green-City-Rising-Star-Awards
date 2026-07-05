/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

type NetlifyEvent = {
  httpMethod: string;
  body: string | null;
};

type NetlifyResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
};

type Handler = (event: NetlifyEvent) => Promise<NetlifyResponse>;

// Setup DB client securely inside functions via server env variables.
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  try {
    const { selections } = JSON.parse(event.body || '{}');

    if (!selections || Object.keys(selections).length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing ballot selections.' }),
      };
    }

    const { data: settings, error: settError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (settError || !settings) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to retrieve voting schedule limits.' }),
      };
    }

    const now = new Date().getTime();
    const openTime = new Date(settings.voting_open).getTime();
    const closeTime = new Date(settings.voting_close).getTime();

    if (now < openTime) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Voting period has not started yet.' }),
      };
    }

    if (now > closeTime) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Voting has officially closed. Submissions rejected.' }),
      };
    }

    const timestamp = new Date().toISOString();
    const voteRows = Object.entries(selections).map(([category, contestantId]) => ({
      category,
      contestant_id: contestantId,
      timestamp,
    }));

    const { error: insertError } = await supabase
      .from('votes')
      .insert(voteRows);

    if (insertError) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Database failed to register anonymous selections.' }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Your votes were recorded anonymously.' }),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Serverless execution failure.';

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: message }),
    };
  }
};
