import { useState } from 'react';
import { Trophy, Sparkles, TrendingUp } from 'lucide-react';

interface GamificationCardProps {
  onAccessClick?: () => void;
}

export default function GamificationCard({ onAccessClick }: GamificationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="w-full flex justify-center items-center py-20 relative">
      {/* Partículas de fondo animadas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          >
            <Sparkles 
              className="text-[#2563eb] opacity-20" 
              size={12 + Math.random() * 12}
            />
          </div>
        ))}
      </div>

      {/* Card principal */}
      <div
        className="relative max-w-2xl w-full mx-4 transform transition-all duration-500"
        style={{
          transform: isHovered ? 'translateY(-10px) scale(1.02)' : 'translateY(0) scale(1)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect */}
        <div
          className="absolute inset-0 rounded-2xl blur-xl transition-all duration-500"
          style={{
            background: 'radial-gradient(circle at center, rgba(93, 0, 8, 0.3), transparent 70%)',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            opacity: isHovered ? 1 : 0.6,
          }}
        />

        {/* Borde animado */}
        <div
          className="absolute inset-0 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(45deg, #2563eb, transparent, #2563eb)',
            backgroundSize: '200% 200%',
            animation: 'gradientFlow 3s ease infinite',
            padding: '2px',
          }}
        >
          <div className="w-full h-full rounded-2xl bg-white" />
        </div>

        {/* Contenido del card */}
        <div
          className="relative rounded-2xl p-8 backdrop-blur-md"
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            boxShadow: isHovered 
              ? '0 25px 50px -12px rgba(93, 0, 8, 0.4)' 
              : '0 10px 25px -5px rgba(93, 0, 8, 0.2)',
          }}
        >
          {/* Icono y título */}
          <div className="flex flex-col items-center mb-6">
            <div
              className="relative mb-4 transition-all duration-500"
              style={{
                transform: isHovered ? 'scale(1.1) rotate(5deg)' : 'scale(1) rotate(0deg)',
              }}
            >
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: '#2563eb',
                  opacity: isHovered ? 0.4 : 0.2,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <Trophy
                size={64}
                className="relative z-10"
                style={{ color: '#2563eb' }}
                strokeWidth={1.5}
              />
            </div>

            <h2
              className="text-3xl md:text-4xl font-bold text-center mb-2 tracking-tight"
              style={{ color: '#2563eb' }}
            >
              ¿LISTO PARA SUBIR
            </h2>
            <h2
              className="text-3xl md:text-4xl font-bold text-center mb-4 tracking-tight"
              style={{ color: '#2563eb' }}
            >
              DE NIVEL?
            </h2>
          </div>

          {/* Descripción */}
          <p className="text-center text-gray-700 text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Consulta tu <strong style={{ color: '#2563eb' }}>experiencia acumulada</strong>,{' '}
            <strong style={{ color: '#2563eb' }}>logros desbloqueados</strong> y posición global en el{' '}
            <strong style={{ color: '#2563eb' }}>ranking de estudiantes</strong>
          </p>

          {/* Features mini cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { icon: Trophy, text: 'Logros' },
              { icon: TrendingUp, text: 'Ranking' },
              { icon: Sparkles, text: 'Experiencia' },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-3 rounded-xl transition-all duration-300"
                style={{
                  background: isHovered 
                    ? 'rgba(93, 0, 8, 0.05)' 
                    : 'rgba(93, 0, 8, 0.02)',
                  border: '1px solid rgba(93, 0, 8, 0.1)',
                }}
              >
                <feature.icon
                  size={24}
                  style={{ color: '#2563eb' }}
                  className="mb-2"
                />
                <span className="text-sm font-medium" style={{ color: '#2563eb' }}>
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          {/* Botón principal */}
          <button
            onClick={onAccessClick}
            className="w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 relative overflow-hidden group"
            style={{
              background: isHovered 
                ? 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)' 
                : '#2563eb',
              color: 'white',
              boxShadow: isHovered 
                ? '0 10px 30px -5px rgba(93, 0, 8, 0.6)' 
                : '0 4px 15px -3px rgba(93, 0, 8, 0.4)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            {/* Brillo animado en hover */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                animation: 'shine 1.5s ease-in-out infinite',
              }}
            />
            
            <span className="relative z-10 flex items-center justify-center gap-2">
              ACCEDER A MI CENTRO DE LOGROS
              <Trophy size={20} className="animate-bounce" />
            </span>
          </button>

          {/* Texto informativo */}
          <p className="text-center text-gray-500 text-sm mt-4">
            🔑 Para alumnos ya matriculados en algun curso
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.5;
          }
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.4;
          }
        }

        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}

