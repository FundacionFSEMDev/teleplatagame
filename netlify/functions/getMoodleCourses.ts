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
    const moodleId = event.queryStringParameters?.moodleId;

    if (!moodleId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'moodleId es requerido' }),
      };
    }

    const MOODLE_URL = process.env.MOODLE_URL!;
    const MOODLE_TOKEN = process.env.MOODLE_TOKEN!;

    const coursesResponse = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?` +
      `wstoken=${MOODLE_TOKEN}&` +
      `wsfunction=core_enrol_get_users_courses&` +
      `moodlewsrestformat=json&` +
      `userid=${moodleId}`
    );

    if (!coursesResponse.ok) {
      return {
        statusCode: coursesResponse.status,
        headers,
        body: JSON.stringify({ error: 'Error consultando Moodle' }),
      };
    }

    const moodleData = await coursesResponse.json();

    if (moodleData && Array.isArray(moodleData)) {
      const coursesData = moodleData.map((course: any) => ({
        id: course.id,
        shortname: course.shortname,
        fullname: course.fullname,
        progress: course.progress || 0,
      }));

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(coursesData),
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([]),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

