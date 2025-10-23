/**
 * 📚 SCRIPT: Ver mis cursos y progreso en Moodle
 */

const MOODLE_URL = 'https://formacion.fundacionsanezequiel.org';
const MOODLE_TOKEN = '81ca76859196a70d00b4683c7270e76c';
const MY_EMAIL = 'sistemas@fundacionsanezequiel.org'; // Tu email

async function moodleRequest(wsfunction, params = {}) {
  const url = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
  url.searchParams.append('wstoken', MOODLE_TOKEN);
  url.searchParams.append('wsfunction', wsfunction);
  url.searchParams.append('moodlewsrestformat', 'json');
  
  Object.keys(params).forEach(key => {
    url.searchParams.append(key, params[key]);
  });

  const response = await fetch(url.toString());
  return await response.json();
}

async function checkMyCourses() {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   📚 MIS CURSOS Y PROGRESO           ║');
  console.log('╚═══════════════════════════════════════╝\n');

  // 1. Buscar mi usuario por email
  console.log('🔍 Buscando usuario...');
  const userData = await moodleRequest('core_user_get_users', {
    'criteria[0][key]': 'email',
    'criteria[0][value]': MY_EMAIL
  });

  if (!userData.users || userData.users.length === 0) {
    console.log('❌ Usuario no encontrado');
    return;
  }

  const user = userData.users[0];
  console.log(`✅ Usuario: ${user.firstname} ${user.lastname} (ID: ${user.id})\n`);

  // 2. Obtener cursos
  console.log('📚 Obteniendo cursos...\n');
  const courses = await moodleRequest('core_enrol_get_users_courses', {
    userid: user.id
  });

  if (!courses || courses.length === 0) {
    console.log('⚠️ No hay cursos matriculados');
    return;
  }

  console.log(`📊 TOTAL DE CURSOS: ${courses.length}`);
  console.log('═'.repeat(60) + '\n');

  // 3. Mostrar cada curso con progreso
  let totalPoints = 0;
  courses.forEach((course, index) => {
    const progress = course.progress || 0;
    const points = Math.floor(progress * 3);
    totalPoints += points;

    console.log(`${index + 1}. ${course.fullname}`);
    console.log(`   ID: ${course.id} | Shortname: ${course.shortname}`);
    console.log(`   Progreso: ${progress}% → ${points} EXP`);
    
    // Barra visual
    const barLength = 30;
    const filled = Math.floor((progress / 100) * barLength);
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
    console.log(`   [${bar}]`);
    console.log('');
  });

  console.log('═'.repeat(60));
  console.log(`\n🎯 TOTAL EXP: ${totalPoints}`);
  console.log(`⭐ NIVEL: ${Math.floor(Math.sqrt(totalPoints / 100)) + 1}`);
  console.log(`🏆 Cursos completados: ${courses.filter(c => c.progress === 100).length}`);
  console.log('');
}

checkMyCourses();

