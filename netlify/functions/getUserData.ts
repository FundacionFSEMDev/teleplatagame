import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Permitir CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const userId = event.queryStringParameters?.userId;

    if (!userId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId es requerido' }),
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=total_points,level`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error }),
      };
    }

    const data = await response.json();
    const user = data[0] || { total_points: 0, level: 1 };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(user),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

