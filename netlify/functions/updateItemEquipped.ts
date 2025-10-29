import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { itemId, equipped } = body;

    if (itemId === undefined || equipped === undefined) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'itemId y equipped son requeridos' }),
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

    const response = await fetch(`${SUPABASE_URL}/rest/v1/user_items?id=eq.${itemId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ equipped }),
    });

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error }),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

