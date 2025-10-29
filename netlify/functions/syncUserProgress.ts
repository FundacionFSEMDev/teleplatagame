import { Handler } from '@netlify/functions';

// Calcular nivel desde puntos (MISMA LÓGICA que frontend)
const calculateLevel = (points: number): number => {
  return Math.floor(Math.sqrt(points / 100)) + 1;
};

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

  try {
    const body = JSON.parse(event.body || '{}');
    const { userId, currentMoodlePoints, coursesData } = body;

    if (!userId || !coursesData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'userId y coursesData son requeridos' }),
      };
    }

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

    // Declarar variables fuera del try para que estén disponibles en el catch
    let oldSupabasePoints = 0;
    let oldLevel = 1;

    // 1. Obtener datos actuales de Supabase
    const userResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=total_points,level`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const [supabaseUser] = await userResponse.json();
    oldSupabasePoints = supabaseUser?.total_points || 0;
    oldLevel = supabaseUser?.level || 1;

    // 2. Obtener TODOS los cursos del usuario en Supabase (activos + inactivos)
    const allUserCoursesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/course_progress?user_id=eq.${userId}&select=*`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const existingCourses = await allUserCoursesRes.json();

    // 3. Calcular puntos basado en cursos nuevos y progreso adicional
    let newPoints = 0;
    let progressPoints = 0;

    // 3.1. Filtrar cursos nuevos (no están en Supabase)
    const newCourses = coursesData.filter((course: any) => {
      return !existingCourses.find((ec: any) => ec.moodle_course_id === course.id);
    });

    // 3.2. Filtrar cursos con progreso adicional (existen pero con más progreso)
    const coursesWithProgress = coursesData.filter((course: any) => {
      const existing = existingCourses.find((ec: any) => ec.moodle_course_id === course.id);
      return existing && course.progress > existing.progress;
    });

    // 3.3. Calcular EXP de cursos nuevos
    newPoints = newCourses.reduce((sum: number, course: any) => {
      return sum + Math.floor(course.progress * 3);
    }, 0);

    // 3.4. Calcular EXP de progreso adicional
    progressPoints = coursesWithProgress.reduce((sum: number, course: any) => {
      const existing = existingCourses.find((ec: any) => ec.moodle_course_id === course.id);
      const additionalProgress = course.progress - existing.progress;
      return sum + Math.floor(additionalProgress * 3);
    }, 0);

    // 3.5. Calcular total de puntos
    const totalNewPoints = newPoints + progressPoints;
    const finalPoints = oldSupabasePoints + totalNewPoints;

    // 4. SINCRONIZAR POINTS_HISTORY (SOLO PUNTOS POSITIVOS - PERMANENCIA INFINITA)
    if (totalNewPoints > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/points_history`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          user_id: userId,
          points: totalNewPoints, // SIEMPRE POSITIVO
          reason: `Progreso en cursos: ${newCourses.length} nuevos, ${coursesWithProgress.length} con avance`,
          course_id: null,
          course_name: null,
        }),
      });
    }

    // 5. Calcular nivel DESPUÉS de calcular puntos finales
    const newLevel = calculateLevel(finalPoints);
    const hasLeveledUp = newLevel > oldLevel;

    // 6. Actualizar total_points y level en users
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        total_points: finalPoints,
        level: newLevel,
        last_sync_at: new Date().toISOString(),
      }),
    });

    // 4. SINCRONIZAR COURSE_PROGRESS (SIEMPRE, para todos los cursos)
    let coursesCreated = 0;
    let coursesUpdated = 0;

    for (const course of coursesData) {
      try {
        const existingRes = await fetch(
          `${SUPABASE_URL}/rest/v1/course_progress?user_id=eq.${userId}&moodle_course_id=eq.${course.id}`,
          {
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            },
          }
        );

        if (!existingRes.ok) {
          continue;
        }

        const existing = await existingRes.json();

        if (existing.length > 0) {
          // Actualizar curso existente - MANTENER el progreso más alto
          const existingProgress = existing[0].progress || 0;
          const newProgress = Math.max(existingProgress, course.progress);

          const updateRes = await fetch(
            `${SUPABASE_URL}/rest/v1/course_progress?id=eq.${existing[0].id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': SUPABASE_SERVICE_KEY,
                'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                progress: newProgress, // Solo aumenta, nunca disminuye
                course_name: course.fullname,
                last_synced_at: new Date().toISOString(),
                is_active: true, // Marcar como activo si está en Moodle
              }),
            }
          );

          if (updateRes.ok) {
            coursesUpdated++;
          }
        } else {
          // Crear nuevo curso
          const createRes = await fetch(`${SUPABASE_URL}/rest/v1/course_progress`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              user_id: userId,
              moodle_course_id: course.id,
              course_name: course.fullname,
              progress: course.progress,
              last_synced_at: new Date().toISOString(),
              is_active: true,
            }),
          });

          if (createRes.ok) {
            coursesCreated++;
          }
        }
      } catch (err) {
        // Continuar con el siguiente curso
      }
    }

    // 4.1. Marcar cursos como inactivos si ya no están en Moodle
    const currentCourseIds = coursesData.map((c: any) => c.id);
    const markInactiveRes = await fetch(
      `${SUPABASE_URL}/rest/v1/course_progress?user_id=eq.${userId}&is_active=eq.true`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );

    if (markInactiveRes.ok) {
      const allUserCourses = await markInactiveRes.json();
      const coursesToMarkInactive = allUserCourses.filter(
        (course: any) => !currentCourseIds.includes(course.moodle_course_id)
      );

      for (const course of coursesToMarkInactive) {
        await fetch(`${SUPABASE_URL}/rest/v1/course_progress?id=eq.${course.id}`, {
          method: 'PATCH',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            is_active: false,
            last_synced_at: new Date().toISOString(),
          }),
        });
      }
    }

    // 5. SINCRONIZAR USER_BADGES (desbloquear badges según criterios)
    // Obtener badges disponibles desde Supabase
    const badgesRes = await fetch(`${SUPABASE_URL}/rest/v1/badges?is_active=eq.true`, {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    const allBadges = await badgesRes.json();

    // Obtener badges ya desbloqueados por el usuario
    const userBadgesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/user_badges?user_id=eq.${userId}&select=badge_id`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    );
    const unlockedBadges = await userBadgesRes.json();
    const unlockedBadgeIds = unlockedBadges.map((ub: any) => ub.badge_id);

    // Verificar qué badges se han desbloqueado
    let badgesUnlocked = 0;
    for (const badge of allBadges) {
      // Si ya lo tiene, skip
      if (unlockedBadgeIds.includes(badge.id)) continue;

      let shouldUnlock = false;

      // Criterios de desbloqueo según el code del badge
      switch (badge.code) {
        case 'FIRST_LOGIN':
          shouldUnlock = true; // Siempre al acceder
          break;
        case 'PROGRESS_25':
          shouldUnlock = coursesData.some((c: any) => c.progress >= 25);
          break;
        case 'PROGRESS_50':
          shouldUnlock = coursesData.some((c: any) => c.progress >= 50);
          break;
        case 'PROGRESS_75':
          shouldUnlock = coursesData.some((c: any) => c.progress >= 75);
          break;
        case 'PROGRESS_100':
        case 'FIRST_COURSE':
          shouldUnlock = coursesData.some((c: any) => c.progress === 100);
          break;
        case 'THREE_COURSES':
          shouldUnlock = coursesData.filter((c: any) => c.progress === 100).length >= 3;
          break;
        case 'FIVE_COURSES':
          shouldUnlock = coursesData.filter((c: any) => c.progress === 100).length >= 5;
          break;
        case 'LEVEL_5':
          shouldUnlock = newLevel >= 5;
          break;
        case 'LEVEL_10':
          shouldUnlock = newLevel >= 10;
          break;
        default:
          // Badges basados en points_required
          if (badge.points_required && badge.points_required > 0) {
            shouldUnlock = currentMoodlePoints >= badge.points_required;
          }
      }

      if (shouldUnlock) {
        const unlockRes = await fetch(`${SUPABASE_URL}/rest/v1/user_badges`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id: userId,
            badge_id: badge.id,
          }),
        });

        if (unlockRes.ok) {
          badgesUnlocked++;
        }
      }
    }

    // Retornar los puntos actualizados y si subió de nivel
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        points: finalPoints,
        level: newLevel,
        leveledUp: hasLeveledUp,
        oldLevel: oldLevel,
        oldPoints: oldSupabasePoints,
        coursesCreated,
        coursesUpdated,
        badgesUnlocked,
      }),
    };
  } catch (error: any) {
    // En caso de error, devolver los datos anteriores
    const body = JSON.parse(event.body || '{}');
    const { currentMoodlePoints } = body;
    const level = calculateLevel(currentMoodlePoints || 0);
    const oldPoints = currentMoodlePoints || 0;

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: error.message,
        points: oldPoints,
        level,
        leveledUp: false,
        oldLevel: level,
        oldPoints,
      }),
    };
  }
};

