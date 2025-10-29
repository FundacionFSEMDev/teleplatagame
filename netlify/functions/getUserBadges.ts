import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
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

    // Obtener todos los badges disponibles
    const badgesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/badges?select=*&order=id.asc`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!badgesRes.ok) {
      return {
        statusCode: badgesRes.status,
        headers,
        body: JSON.stringify({ error: 'Error obteniendo badges' }),
      };
    }

    const allBadges = await badgesRes.json();

    // Obtener badges desbloqueados del usuario
    const userBadgesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_badges?user_id=eq.${userId}&select=badge_id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (!userBadgesRes.ok) {
      return {
        statusCode: userBadgesRes.status,
        headers,
        body: JSON.stringify({ error: 'Error obteniendo user_badges' }),
      };
    }

    const userBadges = await userBadgesRes.json();
    const unlockedBadgeIds = new Set(userBadges.map((ub: any) => ub.badge_id));

    // Marcar badges como desbloqueados o bloqueados
    const badgesWithStatus = allBadges.map((badge: any) => ({
      ...badge,
      unlocked: unlockedBadgeIds.has(badge.id),
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(badgesWithStatus),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

