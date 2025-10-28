import { useEffect, useState } from 'react';
import 'nes.css/css/nes.min.css';
import slotWeapon from './slot_weapon.png';
import slotHead from './slot_head.png';
import slotChest from './slot_chest.png';
import slotGloves from './slot_gloves.png';
import slotPants from './slot_pants.png';
import slotBoots from './slot_boots.png';
import slotRing from './slot_ring.png';
import inventorySlot from './inventory_slot.png';

interface InventoryProps {
  userData: any;
  onBack: () => void;
}

interface UserItem {
  id: number;
  item_id: number;
  quantity: number;
  equipped: boolean;
  items: {
    id: number;
    code: string;
    name: string;
    description: string;
    icon_url: string;
    type: string;
    rarity: string;
    attack: number;
    defense: number;
    hp: number;
    speed: number;
    wisdom: number;
    crit_chance: number;
  };
}

interface UserStats {
  attack: number;
  defense: number;
  hp: number;
  speed: number;
  wisdom: number;
  crit_chance: number;
}

export default function Inventory({ userData, onBack }: InventoryProps) {
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<UserItem | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  // Calcular posición del modal evitando salirse de la pantalla
  const getTooltipPosition = () => {
    const tooltipWidth = 320; // maxWidth del tooltip
    const tooltipHeight = 200; // altura estimada
    const padding = 10; // padding desde los bordes
    
    // Por defecto, poner a la izquierda del cursor
    let x = mousePos.x - tooltipWidth - 30;
    let y = mousePos.y + 20;
    
    // Solo si se sale por la izquierda, poner a la derecha
    if (x < padding) {
      x = mousePos.x + 30;
    }
    
    // Si se sale por abajo, poner arriba del cursor
    if (y + tooltipHeight > window.innerHeight - padding) {
      y = mousePos.y - tooltipHeight - 20;
    }
    
    // Asegurar que no se salga por arriba
    y = Math.max(padding, y);
    
    return { x, y };
  };

  const SUPABASE_URL = 'https://zwmmrhiqbdafkvbxzqig.supabase.co';
  const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bW1yaGlxYmRhZmt2Ynh6cWlnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTA5MzU5NywiZXhwIjoyMDc2NjY5NTk3fQ.poF7hPheoGYmdG3nR1uztIZToMjT03tmCnoX50Uk9mg';

  useEffect(() => {
    loadUserItems();
    loadUserStats();
  }, []);

  // Escuchar movimientos del mouse globalmente
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (hoveredItem) {
        setMousePos({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [hoveredItem]);


  const loadUserItems = async () => {
    try {
      setIsLoading(true);

      // Cargar items del usuario con la información completa de items
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_items?user_id=eq.${userData.id}&select=*,items(*)&order=equipped.desc`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );
      const items = await response.json();
      setUserItems(items);
      console.log('✅ Items cargados:', items.length);
    } catch (error) {
      console.error('❌ Error cargando items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/rest/v1/user_stats?user_id=eq.${userData.id}`,
        {
          headers: {
            'apikey': SUPABASE_SERVICE_KEY,
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          }
        }
      );
      const stats = await response.json();
      if (stats.length > 0) {
        setUserStats(stats[0]);
      }
    } catch (error) {
      console.error('❌ Error cargando stats:', error);
    }
  };

  const getEquippedItem = (code?: string) => {
    if (code) {
      // Buscar por código específico (para slots específicos)
      return userItems.find(item => item.equipped && item.items.code === code);
    } else {
      // Buscar el primer item equipado (por defecto)
      return userItems.find(item => item.equipped);
    }
  };

  // Calcular stats totales del usuario (stats base + items equipados)
  const calculateTotalStats = () => {
    if (!userStats) return { attack: 0, defense: 0, hp: 0, speed: 0, wisdom: 0, crit_chance: 0 };
    
    const equippedItems = userItems.filter(item => item.equipped);
    
    return equippedItems.reduce((totals, item) => {
      return {
        attack: totals.attack + item.items.attack,
        defense: totals.defense + item.items.defense,
        hp: totals.hp + item.items.hp,
        speed: totals.speed + item.items.speed,
        wisdom: totals.wisdom + item.items.wisdom,
        crit_chance: totals.crit_chance + item.items.crit_chance,
      };
    }, { 
      attack: userStats.attack, 
      defense: userStats.defense, 
      hp: userStats.hp, 
      speed: userStats.speed, 
      wisdom: userStats.wisdom, 
      crit_chance: userStats.crit_chance 
    });
  };

  const totalStats = calculateTotalStats();

  const Slot = ({ slotCode, slotImage }: { slotCode?: string; slotImage: any }) => {
    const equippedItem = getEquippedItem(slotCode);
    
    return (
      <div style={{
        width: '120px',
        height: '120px',
        backgroundImage: `url(${slotImage})`,
        backgroundSize: '120px 120px',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 0',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        flexShrink: 0
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      >
        {equippedItem && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
                         fontSize: '18px'
           }}>
             {equippedItem.items.icon_url ? (
               <span>{equippedItem.items.icon_url}</span>
             ) : (
               <span>{equippedItem.items.name.split(' ')[0]}</span>
             )}
           </div>
         )}
       </div>
     );
   };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        .inventory-slider {
          transition: transform 0.4s ease-in-out;
        }
      `}</style>
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'monospace'
      }}>
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
            INVENTARIO
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
            Cargando inventario...
          </div>
        ) : (
          <div style={{
            display: 'flex',
            gap: '20px',
            padding: '30px'
          }}>
            {/* COLUMNA IZQUIERDA - EQUIPAMIENTO (33%) */}
            <div style={{
              width: '33%',
              backgroundColor: '#f9f9f9',
              border: '3px solid #333',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center',
                color: '#333'
              }}>
                EQUIPAMIENTO
              </h3>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '120px 120px 120px',
                  gridTemplateRows: '120px 120px 120px',
                  gap: '0px'
                }}>
                {/* Fila 1 */}
                <Slot slotCode="STUDENT_HAT" slotImage={slotHead} />
                <Slot slotCode="STUDENT_CHEST" slotImage={slotChest} />
                <Slot slotCode="STUDENT_GLOVES" slotImage={slotGloves} />
                
                {/* Fila 2 */}
                <Slot slotCode="STUDENT_PANTS" slotImage={slotPants} />
                <Slot slotCode="STUDENT_BOOTS" slotImage={slotBoots} />
                <Slot slotCode="STUDENT_RING" slotImage={slotRing} />
                
                {/* Fila 3 */}
                <div style={{ gridColumn: '2 / 4' }}>
                  <Slot slotCode="USED_BOOK" slotImage={slotWeapon} />
                </div>
                </div>
              </div>

                                                            {/* Stats del usuario */}
                 <div style={{
                   marginTop: '40px',
                  padding: '15px',
                  backgroundColor: '#fff',
                  border: '2px solid #333',
                  borderRadius: '5px',
                  fontFamily: '"Press Start 2P", "Courier New", monospace',
                  imageRendering: 'pixelated'
                }}>
                  <h4 style={{
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    textAlign: 'center',
                    color: '#333',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    lineHeight: '2'
                  }}>
                    ESTADÍSTICAS
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', lineHeight: '2' }}>
                      <span>⚔️ ATK:</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{totalStats.attack}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', lineHeight: '2' }}>
                      <span>🛡️ DEF:</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{totalStats.defense}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', lineHeight: '2' }}>
                      <span>❤️ HP:</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{totalStats.hp}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', lineHeight: '2' }}>
                      <span>⚡ SPD:</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{totalStats.speed}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', lineHeight: '2' }}>
                      <span>🧠 WIS:</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{totalStats.wisdom}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', lineHeight: '2' }}>
                      <span>💥 CRT:</span>
                      <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{totalStats.crit_chance}%</span>
                    </div>
                  </div>
                </div>
            </div>

            {/* COLUMNA DERECHA - INVENTARIO (66%) */}
            <div style={{
              width: '66%',
              backgroundColor: '#f9f9f9',
              border: '3px solid #333',
              padding: '20px',
              borderRadius: '8px'
            }}>
              <h3 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center',
                color: '#333'
              }}>
                INVENTARIO
              </h3>
              
                             {/* Contenedor con overflow hidden para el slider */}
               <div style={{
                 overflow: 'hidden',
                 marginBottom: '20px',
                 width: '100%',
                 maxWidth: '720px', // 6 columnas x 120px
                 height: '600px' // 5 filas x 120px
               }}>
                                   {/* Grid de inventario - 6 columnas x 5 filas con animación */}
                  <div 
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      transform: `translateX(-${(currentPage - 1) * 720}px)`,
                      width: '7200px'
                    }}
                    className="inventory-slider"
                  >
                    {/* Crear 10 páginas */}
                    {Array.from({ length: 10 }, (_, pageIndex) => (
                      <div
                        key={pageIndex}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(6, 120px)',
                          gap: '0px',
                          marginBottom: pageIndex < 9 ? '0px' : '0px'
                        }}
                      >
                        {Array.from({ length: 30 }, (_, slotIndex) => {
                          const globalIndex = pageIndex * 30 + slotIndex;
                          // Obtener el item correspondiente a este slot (solo items no equipados)
                          const unequippedItems = userItems.filter(i => !i.equipped);
                          const item = unequippedItems[globalIndex];
                          
                          // Función para obtener el icono placeholder según el código del item
                          const getItemIcon = (itemCode: string) => {
                            switch (itemCode) {
                              case 'STUDENT_HAT':
                                return '🧢';
                              case 'STUDENT_CHEST':
                                return '👕';
                              case 'STUDENT_GLOVES':
                                return '🧤';
                              case 'STUDENT_PANTS':
                                return '👖';
                              case 'STUDENT_BOOTS':
                                return '👢';
                              case 'STUDENT_RING':
                                return '💍';
                              case 'USED_BOOK':
                                return '📚';
                              default:
                                return null;
                            }
                          };
                          
                          return (
                            <div
                              key={globalIndex}
                              style={{
                                width: '120px',
                                height: '120px',
                                backgroundImage: `url(${inventorySlot})`,
                                backgroundSize: '120px 120px',
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: '0 0',
                                position: 'relative',
                                cursor: item ? 'pointer' : 'default',
                                transition: 'transform 0.2s ease',
                                flexShrink: 0
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'scale(1.05)';
                                if (item) {
                                  setHoveredItem(item);
                                  // Inicializar posición del tooltip
                                  setMousePos({ x: e.clientX, y: e.clientY });
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'scale(1)';
                                setHoveredItem(null);
                                setMousePos({ x: 0, y: 0 });
                              }}
                            >
                              {/* Mostrar el icono del item si existe */}
                              {item && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  transform: 'translate(-50%, -50%)',
                                  fontSize: '48px',
                                  pointerEvents: 'none',
                                  textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                                }}>
                                  {getItemIcon(item.items.code)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
               </div>

              {/* Paginación */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '15px'
              }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  style={{
                    fontSize: '24px',
                    background: currentPage === 1 ? '#ccc' : '#2563eb',
                    color: 'white',
                    border: '3px solid #333',
                    padding: '8px 16px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ←
                </button>
                
                <span style={{
                  fontSize: '16px',
                  fontWeight: 'bold',
                  color: '#333'
                }}>
                  Página {currentPage} de 10
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(10, prev + 1))}
                  disabled={currentPage === 10}
                  style={{
                    fontSize: '24px',
                    background: currentPage === 10 ? '#ccc' : '#2563eb',
                    color: 'white',
                    border: '3px solid #333',
                    padding: '8px 16px',
                    cursor: currentPage === 10 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Modal de item */}
      {hoveredItem && (() => {
        const position = getTooltipPosition();
        return (
          <div
            style={{
              position: 'fixed',
              left: `${position.x}px`,
              top: `${position.y}px`,
              pointerEvents: 'none',
              zIndex: 10000,
              backgroundColor: '#0a0a0a',
              border: '2px solid #4a9eff',
              borderRadius: '6px',
              padding: '16px 20px',
              minWidth: '280px',
              maxWidth: '350px',
              fontFamily: 'monospace',
              boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 0 1px rgba(74, 158, 255, 0.3)',
            }}
          >
          {/* Nombre del item */}
          <div style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: '#4a9eff',
            marginBottom: '10px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '0 0 10px rgba(74, 158, 255, 0.5)'
          }}>
            {hoveredItem.items.name}
          </div>

          {/* Descripción */}
          <div style={{
            fontSize: '12px',
            color: '#c0c0c0',
            marginBottom: '12px',
            lineHeight: '1.5'
          }}>
            {hoveredItem.items.description}
          </div>

          {/* Stats */}
          {(hoveredItem.items.attack > 0 || 
            hoveredItem.items.defense > 0 || 
            hoveredItem.items.hp > 0 || 
            hoveredItem.items.speed > 0 || 
            hoveredItem.items.wisdom > 0 || 
            hoveredItem.items.crit_chance > 0) && (
            <div style={{ 
              borderTop: '1px solid #333', 
              paddingTop: '10px',
              marginTop: '10px'
            }}>
              {hoveredItem.items.attack > 0 && (
                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#fff' }}>
                  <span style={{ color: '#ff6b6b' }}>ATK:</span>
                  <span style={{ fontWeight: 'bold', color: '#4ecdc4' }}>+{hoveredItem.items.attack}</span>
                </div>
              )}
              {hoveredItem.items.defense > 0 && (
                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#fff' }}>
                  <span style={{ color: '#4ecdc4' }}>DEF:</span>
                  <span style={{ fontWeight: 'bold', color: '#45b7d1' }}>+{hoveredItem.items.defense}</span>
                </div>
              )}
              {hoveredItem.items.hp > 0 && (
                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#fff' }}>
                  <span style={{ color: '#ff6b6b' }}>HP:</span>
                  <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>+{hoveredItem.items.hp}</span>
                </div>
              )}
              {hoveredItem.items.speed > 0 && (
                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#fff' }}>
                  <span style={{ color: '#feca57' }}>SPD:</span>
                  <span style={{ fontWeight: 'bold', color: '#feca57' }}>+{hoveredItem.items.speed}</span>
                </div>
              )}
              {hoveredItem.items.wisdom > 0 && (
                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#fff' }}>
                  <span style={{ color: '#a29bfe' }}>WIS:</span>
                  <span style={{ fontWeight: 'bold', color: '#a29bfe' }}>+{hoveredItem.items.wisdom}</span>
                </div>
              )}
              {hoveredItem.items.crit_chance > 0 && (
                <div style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', color: '#fff' }}>
                  <span style={{ color: '#fd79a8' }}>CRT:</span>
                  <span style={{ fontWeight: 'bold', color: '#fd79a8' }}>+{hoveredItem.items.crit_chance}%</span>
                </div>
              )}
            </div>
          )}
        </div>
        );
      })()}
    </>
  );
}
