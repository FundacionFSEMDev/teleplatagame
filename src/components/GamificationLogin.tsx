import { useState } from 'react';
import { Mail, Loader2, AlertCircle, XCircle } from 'lucide-react';

interface GamificationLoginProps {
  onSuccess: (userData: any) => void;
  onViewCourses: () => void;
}

export default function GamificationLogin({ onSuccess, onViewCourses }: GamificationLoginProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorType, setErrorType] = useState<'not_registered' | 'not_enrolled' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowErrorModal(false);
    setErrorType(null);

    try {
      // PASO 1: Verificar en Moodle
      const moodleResponse = await fetch(
        `https://formacion.fundacionsanezequiel.org/webservice/rest/server.php?` +
        `wstoken=81ca76859196a70d00b4683c7270e76c&` +
        `wsfunction=core_user_get_users&` +
        `moodlewsrestformat=json&` +
        `criteria[0][key]=email&` +
        `criteria[0][value]=${encodeURIComponent(email)}`
      );

      const moodleData = await moodleResponse.json();

      // CASO 1: Usuario SÍ existe en Moodle
      if (moodleData.users && moodleData.users.length > 0) {
        const moodleUser = moodleData.users[0];

        // PASO 2: Verificar en Supabase
        const supabaseCheckResponse = await fetch(
          `https://zwmmrhiqbdafkvbxzqig.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg'
            }
          }
        );

        const supabaseUsers = await supabaseCheckResponse.json();

        // CASO 2: SÍ en Moodle, NO en Supabase → Crear
        if (supabaseUsers.length === 0) {
          const insertResponse = await fetch(
            'https://zwmmrhiqbdafkvbxzqig.supabase.co/rest/v1/users',
            {
              method: 'POST',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
              },
              body: JSON.stringify({
                moodle_id: moodleUser.id,
                email: moodleUser.email,
                username: moodleUser.username || null,
                firstname: moodleUser.firstname,
                lastname: moodleUser.lastname,
                is_active: true
              })
            }
          );

          if (insertResponse.ok) {
            const insertedUser = await insertResponse.json();
            // Ir al dashboard
            onSuccess({
              ...insertedUser[0],
              moodleUser
            });
            return;
          }
        } else {
          // SÍ en Moodle, SÍ en Supabase → Actualizar
          const existingUser = supabaseUsers[0];
          
          await fetch(
            `https://zwmmrhiqbdafkvbxzqig.supabase.co/rest/v1/users?id=eq.${existingUser.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                is_active: true,
                firstname: moodleUser.firstname,
                lastname: moodleUser.lastname,
                last_sync_at: new Date().toISOString()
              })
            }
          );

          // Ir al dashboard
          onSuccess({
            ...existingUser,
            moodleUser
          });
          return;
        }

      } else {
        // CASO 3: Usuario NO existe en Moodle
        
        // Verificar si existe en Supabase para marcarlo como inactivo
        const supabaseCheckResponse = await fetch(
          `https://zwmmrhiqbdafkvbxzqig.supabase.co/rest/v1/users?email=eq.${encodeURIComponent(email)}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
              'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg'
            }
          }
        );

        const supabaseUsers = await supabaseCheckResponse.json();

        if (supabaseUsers.length > 0) {
          // NO en Moodle, SÍ en Supabase → Marcar inactivo + Modal "no matriculado"
          const existingUser = supabaseUsers[0];
          
          await fetch(
            `https://zwmmrhiqbdafkvbxzqig.supabase.co/rest/v1/users?id=eq.${existingUser.id}`,
            {
              method: 'PATCH',
              headers: {
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                is_active: false
              })
            }
          );

          setErrorType('not_enrolled');
          setShowErrorModal(true);
        } else {
          // NO en Moodle, NO en Supabase → Modal "no registrado"
          setErrorType('not_registered');
          setShowErrorModal(true);
        }
      }

    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="max-w-md mx-auto">
        {/* Card de login */}
        <div
          className="relative rounded-2xl p-8 backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: '0 25px 50px -12px rgba(93, 0, 8, 0.2)',
            border: '2px solid rgba(93, 0, 8, 0.1)'
          }}
        >
          {/* Icono y título */}
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: '0 10px 25px -5px rgba(93, 0, 8, 0.4)'
              }}
            >
              <Mail size={32} color="white" />
            </div>
            <h2 className="text-2xl font-bold text-center" style={{ color: '#2563eb' }}>
              Accede con tu Email
            </h2>
            <p className="text-gray-600 text-center mt-2">
              Introduce el email que usas en Moodle
            </p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#2563eb' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-email@ejemplo.com"
                required
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-all"
                style={{
                  borderColor: '#e5e7eb',
                  backgroundColor: isLoading ? '#f3f4f6' : 'white'
                }}
                onFocus={(e) => e.target.style.borderColor = '#2563eb'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2"
              style={{
                background: isLoading 
                  ? '#9ca3af' 
                  : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                boxShadow: isLoading 
                  ? 'none' 
                  : '0 10px 25px -5px rgba(93, 0, 8, 0.4)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transform: isLoading ? 'scale(1)' : 'scale(1)',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.transform = 'translateY(0)')}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Verificando...
                </>
              ) : (
                'Acceder a mis Logros'
              )}
            </button>
          </form>

          {/* Info adicional */}
          <div className="mt-6 p-4 rounded-lg" style={{ background: 'rgba(93, 0, 8, 0.05)' }}>
            <p className="text-sm text-gray-600 text-center">
              <AlertCircle size={16} className="inline mr-1" style={{ color: '#2563eb' }} />
              Solo para alumnos matriculados en la plataforma
            </p>
          </div>
        </div>
      </div>

      {/* Modales de error */}
      {showErrorModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowErrorModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-8 max-w-md w-full"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono de error */}
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
              >
                <XCircle size={48} color="#ef4444" />
              </div>
            </div>

            {/* Mensaje según tipo de error */}
            {errorType === 'not_registered' ? (
              <>
                <h3 className="text-2xl font-bold text-center mb-4" style={{ color: '#2563eb' }}>
                  ¡Ups! No estás registrado
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Parece que no estás registrado en nuestros datacenters.
                  <br />
                  <strong>¿Te interesa formarte?</strong>
                </p>
              </>
            ) : (
              <>
                <h3 className="text-2xl font-bold text-center mb-4" style={{ color: '#2563eb' }}>
                  No estás matriculado
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Tu cuenta no está activa o no estás matriculado en ningún curso actualmente.
                  <br />
                  <strong>¿Quieres ver nuestra oferta formativa?</strong>
                </p>
              </>
            )}

            {/* Botones */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowErrorModal(false);
                  onViewCourses();
                }}
                className="w-full py-3 rounded-lg font-bold text-white transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 10px 25px -5px rgba(93, 0, 8, 0.4)'
                }}
              >
                📚 Ver Oferta Formativa
              </button>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-all duration-300"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

