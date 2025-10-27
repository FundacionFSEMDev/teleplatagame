import { useEffect, useState } from 'react';
import 'nes.css/css/nes.min.css';
import staryuIcon from './staryu.png';
import cookIcon from './cook.png';
import allSeeingEyeIcon from './all-seeing-eye.png';
import BadgeModal from './BadgeModal';

interface BadgesProps {
  userData: any;
  onBack: () => void;
}

interface Badge {
  id: number;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  unlocked: boolean;
}

export default function Badges({ userData, onBack }: BadgesProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const SUPABASE_URL = 'https://zwmmrhiqbdafkvbxzqig.supabase.co';
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg';

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setIsLoading(true);

      // 1. Obtener todos los badges disponibles
      const badgesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/badges?select=*&order=id.asc`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );
      const allBadges = await badgesRes.json();

      // 2. Obtener badges desbloqueados del usuario
      const userBadgesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/user_badges?user_id=eq.${userData.id}&select=badge_id`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );
      const userBadges = await userBadgesRes.json();
      const unlockedBadgeIds = new Set(userBadges.map((ub: any) => ub.badge_id));

      // 3. Marcar badges como desbloqueados o bloqueados
      const badgesWithStatus = allBadges.map((badge: any) => ({
        ...badge,
        unlocked: unlockedBadgeIds.has(badge.id)
      }));

      setBadges(badgesWithStatus);
      console.log('✅ Badges cargados:', badgesWithStatus.length);
    } catch (error) {
      console.error('❌ Error cargando badges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRarityColor = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return '#e0e0e0'; // Gris para bloqueados
    
    switch (rarity) {
      case 'common':
        return '#c0c0c0'; // Gris muy suave
      case 'rare':
        return '#87ceeb'; // Azul celeste
      case 'epic':
        return '#9932cc'; // Morado fuerte
      case 'legendary':
        return '#ff8c00'; // Naranja fuerte
      default:
        return '#c0c0c0';
    }
  };

  const getRarityBorderColor = (rarity: string, unlocked: boolean) => {
    if (!unlocked) return '#333'; // Negro para bloqueados
    return getRarityColor(rarity, true);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      <style>{`
        @keyframes rarityGlow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(192, 192, 192, 0.8),
                        0 0 10px rgba(192, 192, 192, 0.6),
                        0 0 15px rgba(192, 192, 192, 0.4),
                        inset 0 0 10px rgba(192, 192, 192, 0.3);
          }
          50% {
            box-shadow: 0 0 10px rgba(192, 192, 192, 1),
                        0 0 20px rgba(192, 192, 192, 0.8),
                        0 0 30px rgba(192, 192, 192, 0.6),
                        inset 0 0 15px rgba(192, 192, 192, 0.5);
          }
        }
        
        @keyframes rarityGlowRare {
          0%, 100% {
            box-shadow: 0 0 6px rgba(135, 206, 235, 0.9),
                        0 0 12px rgba(135, 206, 235, 0.7),
                        0 0 18px rgba(135, 206, 235, 0.5),
                        inset 0 0 12px rgba(135, 206, 235, 0.35);
          }
          50% {
            box-shadow: 0 0 12px rgba(135, 206, 235, 1),
                        0 0 24px rgba(135, 206, 235, 0.9),
                        0 0 36px rgba(135, 206, 235, 0.7),
                        inset 0 0 18px rgba(135, 206, 235, 0.6);
          }
        }
        
        @keyframes rarityGlowEpic {
          0%, 100% {
            box-shadow: 0 0 7px rgba(153, 50, 204, 0.9),
                        0 0 14px rgba(153, 50, 204, 0.7),
                        0 0 21px rgba(153, 50, 204, 0.5),
                        inset 0 0 14px rgba(153, 50, 204, 0.4);
          }
          50% {
            box-shadow: 0 0 14px rgba(153, 50, 204, 1),
                        0 0 28px rgba(153, 50, 204, 0.9),
                        0 0 42px rgba(153, 50, 204, 0.7),
                        inset 0 0 21px rgba(153, 50, 204, 0.65);
          }
        }
        
        @keyframes rarityGlowLegendary {
          0%, 100% {
            box-shadow: 0 0 8px rgba(255, 140, 0, 0.95),
                        0 0 16px rgba(255, 140, 0, 0.75),
                        0 0 24px rgba(255, 140, 0, 0.55),
                        inset 0 0 16px rgba(255, 140, 0, 0.45);
          }
          50% {
            box-shadow: 0 0 16px rgba(255, 140, 0, 1),
                        0 0 32px rgba(255, 140, 0, 0.95),
                        0 0 48px rgba(255, 140, 0, 0.8),
                        inset 0 0 24px rgba(255, 140, 0, 0.75);
          }
        }
        
        .badge-common {
          animation: rarityGlow 2s ease-in-out infinite;
        }
        
        .badge-rare {
          animation: rarityGlowRare 2s ease-in-out infinite;
        }
        
        .badge-epic {
          animation: rarityGlowEpic 2s ease-in-out infinite;
        }
        
        .badge-legendary {
          animation: rarityGlowLegendary 2s ease-in-out infinite;
        }
      `}</style>
      {/* Container principal */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: 'white',
        border: '4px solid #333',
        boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          padding: '20px',
          borderBottom: '4px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: 'white',
            textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
          }}>
            CENTRO DE LOGROS
          </div>
          <button
            onClick={onBack}
            className="nes-btn is-error"
            style={{
              fontSize: '14px',
              padding: '8px 16px'
            }}
          >
            ← Volver
          </button>
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div style={{
            padding: '60px 20px',
            textAlign: 'center',
            fontSize: '16px',
            color: '#666'
          }}>
            Cargando logros...
          </div>
        ) : (
          <div style={{ padding: '30px' }}>
            {/* Grid de badges */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
              gap: '20px',
              marginBottom: '40px'
            }}>
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={badge.unlocked ? `badge-${badge.rarity}` : ''}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: badge.unlocked ? getRarityColor(badge.rarity, true) : '#f0f0f0',
                    border: `4px solid ${getRarityBorderColor(badge.rarity, badge.unlocked)}`,
                    borderRadius: '0px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    filter: badge.unlocked ? 'none' : 'grayscale(100%) brightness(0.7)',
                    opacity: badge.unlocked ? 1 : 0.5,
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    boxShadow: badge.unlocked ? '4px 4px 0px rgba(0,0,0,0.3)' : '2px 2px 0px rgba(0,0,0,0.2)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  title={badge.name + (badge.description ? ` - ${badge.description}` : '')}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1) translateY(-5px)';
                    e.currentTarget.style.boxShadow = badge.unlocked 
                      ? '6px 6px 0px rgba(0,0,0,0.4)' 
                      : '3px 3px 0px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1) translateY(0)';
                    e.currentTarget.style.boxShadow = badge.unlocked 
                      ? '4px 4px 0px rgba(0,0,0,0.3)' 
                      : '2px 2px 0px rgba(0,0,0,0.2)';
                  }}
                  onClick={() => setSelectedBadge(badge)}
                >
                  {/* Icono del badge */}
                  {badge.code === 'START_ADVENTURE' ? (
                    <img 
                      src={staryuIcon} 
                      alt={badge.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  ) : badge.code === 'BACTERIA_HUNTER' ? (
                    <img 
                      src={cookIcon} 
                      alt={badge.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  ) : badge.code === 'KNOW_IT_ALL' ? (
                    <img 
                      src={allSeeingEyeIcon} 
                      alt={badge.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  ) : (
                    <div style={{ 
                      fontSize: '50px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%'
                    }}>
                      {badge.icon}
                    </div>
                  )}
                  
                  {/* Indicador de bloqueado */}
                  {!badge.unlocked && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '16px'
                    }}>
                      🔒
                    </div>
                  )}

                  {/* Indicador de rareza en la esquina inferior */}
                  {badge.unlocked && (
                    <div style={{
                      position: 'absolute',
                      bottom: '4px',
                      right: '4px',
                      fontSize: '8px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      color: 'white',
                      padding: '2px 4px',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase'
                    }}>
                      {badge.rarity}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Info adicional */}
            <div style={{
              backgroundColor: '#f9f9f9',
              border: '3px solid #333',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: '#333'
              }}>
                ESTADÍSTICAS
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '15px',
                fontSize: '12px'
              }}>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Total Badges</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#333' }}>
                    {badges.length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Desbloqueados</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                    {badges.filter(b => b.unlocked).length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Bloqueados</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#999' }}>
                    {badges.filter(b => !b.unlocked).length}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#666', marginBottom: '4px' }}>Progreso</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>
                    {Math.round((badges.filter(b => b.unlocked).length / badges.length) * 100)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Modal de badge */}
      <BadgeModal 
        badge={selectedBadge} 
        onClose={() => setSelectedBadge(null)} 
      />
    </div>
  );
}
