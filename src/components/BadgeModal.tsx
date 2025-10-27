import { X } from 'lucide-react';
import 'nes.css/css/nes.min.css';
import staryuIcon from './staryu.png';
import cookIcon from './cook.png';
import allSeeingEyeIcon from './all-seeing-eye.png';

interface BadgeModalProps {
  badge: {
    id: number;
    code: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    unlocked: boolean;
  } | null;
  onClose: () => void;
}

export default function BadgeModal({ badge, onClose }: BadgeModalProps) {
  if (!badge) return null;

  const getRarityColor = (rarity: string) => {
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

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        fontFamily: 'monospace'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          border: '4px solid #333',
          borderRadius: '8px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '8px 8px 0px rgba(0,0,0,0.3)',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '24px',
            color: '#666',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#333';
            e.currentTarget.style.transform = 'scale(1.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#666';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={24} />
        </button>

        {/* Header con icono */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '20px'
          }}
        >
          {/* Icono del badge */}
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: badge.unlocked ? getRarityColor(badge.rarity) : '#e0e0e0',
              border: `4px solid ${badge.unlocked ? getRarityColor(badge.rarity) : '#333'}`,
              borderRadius: '0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '15px',
              filter: badge.unlocked ? 'none' : 'grayscale(100%) brightness(0.7)',
              opacity: badge.unlocked ? 1 : 0.5,
              position: 'relative',
              overflow: 'hidden',
              boxShadow: badge.unlocked ? `0 0 15px ${getRarityColor(badge.rarity)}80` : 'none'
            }}
          >
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
              <div style={{ fontSize: '60px' }}>{badge.icon}</div>
            )}

            {/* Indicador de rareza */}
            {badge.unlocked && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  fontSize: '10px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  color: 'white',
                  padding: '4px 6px',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                }}
              >
                {badge.rarity}
              </div>
            )}
          </div>

          {/* Nombre del badge */}
          <h2
            style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '10px',
              textAlign: 'center'
            }}
          >
            {badge.name}
          </h2>

          {/* Estado: Desbloqueado o Bloqueado */}
          <div
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              backgroundColor: badge.unlocked ? '#10b981' : '#ef4444',
              color: 'white'
            }}
          >
            {badge.unlocked ? '✓ Desbloqueado' : '🔒 Bloqueado'}
          </div>
        </div>

        {/* Descripción */}
        <div
          style={{
            backgroundColor: '#f9f9f9',
            border: '3px solid #333',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}
        >
          <div
            style={{
              fontSize: '12px',
              fontWeight: 'bold',
              marginBottom: '10px',
              color: '#666'
            }}
          >
            DESCRIPCIÓN
          </div>
          <div
            style={{
              fontSize: '14px',
              color: '#333',
              lineHeight: '1.6'
            }}
          >
            {badge.description || 'Sin descripción disponible.'}
          </div>
        </div>

        {/* Información adicional */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px'
          }}
        >
          <div
            style={{
              backgroundColor: '#f9f9f9',
              border: '3px solid #333',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: '#666',
                marginBottom: '5px'
              }}
            >
              CATEGORÍA
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333'
              }}
            >
              {badge.category}
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f9f9f9',
              border: '3px solid #333',
              padding: '12px',
              borderRadius: '8px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                fontSize: '10px',
                color: '#666',
                marginBottom: '5px'
              }}
            >
              RAREZA
            </div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: getRarityColor(badge.rarity),
                textTransform: 'uppercase'
              }}
            >
              {badge.rarity}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
