import { useEffect, useState } from 'react';
import 'nes.css/css/nes.min.css';
import Badges from './Badges';
import Inventory from './Inventory';
import staryuIcon from './staryu.png';
import cookIcon from './cook.png';
import allSeeingEyeIcon from './all-seeing-eye.png';
import chestIcon from './chest.png';

interface GamificationDashboardProps {
  userData: any;
}

interface Course {
  id: number;
  shortname: string;
  fullname?: string;
  course_name?: string;
  progress: number;
  is_active?: boolean;
}

export default function GamificationDashboard({ userData }: GamificationDashboardProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [displayLevel, setDisplayLevel] = useState(1); // Nivel que se muestra en la UI
  const [xpForNextLevel, setXpForNextLevel] = useState(100);
  const [xpProgress, setXpProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [previousProgress, setPreviousProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpFrom, setLevelUpFrom] = useState(1);
  const [levelUpTo, setLevelUpTo] = useState(2);
  const [isAnimating, setIsAnimating] = useState(false);
  const [hideProgressBar, setHideProgressBar] = useState(false);
  const [showBadgesPage, setShowBadgesPage] = useState(false);
  const [unlockedBadgesFromDB, setUnlockedBadgesFromDB] = useState<any[]>([]);
  const [showInventoryPage, setShowInventoryPage] = useState(false);

  // URLs de funciones serverless (en desarrollo y producción)
  const API_BASE = import.meta.env.VITE_NETLIFY_SITE_URL 
    ? `${import.meta.env.VITE_NETLIFY_SITE_URL}/.netlify/functions` 
    : '/.netlify/functions';

  // Calcular nivel desde puntos
  const calculateLevel = (points: number): number => {
    return Math.floor(Math.sqrt(points / 100)) + 1;
  };

  // Calcular XP info para siguiente nivel
  const calculateXPInfo = (points: number, currentLevel: number) => {
    // Nivel N empieza en: (N-1)² × 100
    // Nivel N termina/Nivel N+1 empieza en: N² × 100
    
    // Puntos donde empezó el nivel actual
    const currentLevelStartXP = Math.pow(currentLevel - 1, 2) * 100;
    // Puntos necesarios para alcanzar el siguiente nivel
    const nextLevelStartXP = Math.pow(currentLevel, 2) * 100;
    // Puntos necesarios para pasar del nivel actual al siguiente
    const xpNeeded = nextLevelStartXP - currentLevelStartXP;
    // Puntos que ya tiene desde que alcanzó el nivel actual
    const xpCurrent = points - currentLevelStartXP;
    
    // Porcentaje: puntos_conseguidos / puntos_necesarios
    const progress = (xpCurrent / xpNeeded) * 100;
    
    return {
      xpForNextLevel: xpNeeded,
      xpProgress: Math.max(0, Math.min(progress, 100))
    };
  };

  // Sincronizar TODAS las tablas con Supabase (via función serverless)
  const syncAllDataWithSupabase = async (
    currentMoodlePoints: number, 
    coursesData: Course[]
  ): Promise<{ points: number; level: number; leveledUp: boolean; oldLevel: number; oldPoints: number }> => {
    if (!userData?.id) {
      console.error('❌ userData.id no disponible para sincronización');
      const level = calculateLevel(currentMoodlePoints);
      return { points: currentMoodlePoints, level, leveledUp: false, oldLevel: level, oldPoints: currentMoodlePoints };
    }

    let oldSupabasePoints = 0;
    let oldLevel = 1;

    try {
      setIsSyncing(true);
      console.log('🔄 Iniciando sincronización completa con Supabase (via serverless)...');

      // Llamar a la función serverless que hace toda la sincronización
      const syncResponse = await fetch(`${API_BASE}/syncUserProgress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          currentMoodlePoints,
          coursesData,
        }),
      });

      if (!syncResponse.ok) {
        throw new Error('Error en sincronización');
      }

      const syncResult = await syncResponse.json();
      
      // Si hay error, usar valores por defecto
      if (syncResult.error) {
        const level = calculateLevel(currentMoodlePoints);
        return { points: currentMoodlePoints, level, leveledUp: false, oldLevel: level, oldPoints: currentMoodlePoints };
      }

      return {
        points: syncResult.points,
        level: syncResult.level,
        leveledUp: syncResult.leveledUp,
        oldLevel: syncResult.oldLevel,
        oldPoints: syncResult.oldPoints,
      };
    } catch (error) {
      console.error('❌ Error en sincronización completa:', error);
      const level = calculateLevel(currentMoodlePoints);
      return { points: currentMoodlePoints, level, leveledUp: false, oldLevel: level, oldPoints: currentMoodlePoints };
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!userData?.moodle_id || !userData?.id) return;

      try {
        setIsLoading(true);

        // 1. Obtener cursos desde Moodle (via función serverless)
        const coursesResponse = await fetch(
          `${API_BASE}/getMoodleCourses?moodleId=${userData.moodle_id}`
        );
        const moodleData = await coursesResponse.json();
        
                 if (moodleData && Array.isArray(moodleData)) {
                   const coursesData = moodleData.map((course: any) => ({
                     id: course.id,
                     shortname: course.shortname,
                     fullname: course.fullname,
                     progress: course.progress || 0
                   }));
                   
                   // Mostrar SOLO cursos activos desde Moodle (para la sección "Cursos Activos")
                   // El sistema de guardado en Supabase sigue igual para el historial
                   setCourses(coursesData);
                   console.log(`📚 Mostrando ${coursesData.length} cursos activos desde Moodle`);
          
          // 3. Calcular puntos desde Moodle (cada 1% = 3 puntos)
          const currentMoodlePoints = coursesData.reduce(
            (sum: number, course: Course) => sum + Math.floor(course.progress * 3), 
            0
          );

          // 4. Sincronizar con Supabase y obtener puntos actualizados
          const syncResult = await syncAllDataWithSupabase(currentMoodlePoints, coursesData);
          
          // 5. Calcular progreso anterior (desde puntos anteriores de Supabase)
          const { xpProgress: oldProgress } = calculateXPInfo(syncResult.oldPoints, syncResult.oldLevel);
          
          // 6. Determinar si hay cambios reales para animar
          const hasRealChanges = syncResult.points > syncResult.oldPoints;
          
          if (hasRealChanges) {
            console.log(`🎬 Hay cambios reales: ${syncResult.oldPoints} → ${syncResult.points} EXP`);
            setPreviousProgress(oldProgress);
          } else {
            console.log(`📊 Sin cambios: ${syncResult.points} EXP (no animación)`);
            // Establecer progreso directamente sin animación
            setPreviousProgress(syncResult.points === syncResult.oldPoints ? 
              calculateXPInfo(syncResult.points, syncResult.level).xpProgress : oldProgress);
          }
          
          // 6. Si subió de nivel, preparar animación LEVEL UP
          if (syncResult.leveledUp) {
            setLevelUpFrom(syncResult.oldLevel);
            setLevelUpTo(syncResult.level);
            console.log(`🎮 Preparando LEVEL UP: ${syncResult.oldLevel} → ${syncResult.level}`);
            
            // IMPORTANTE: Si hay level up, primero animamos hasta 100% del nivel anterior
            setTotalPoints(syncResult.points);
            setCurrentLevel(syncResult.level);
            setDisplayLevel(syncResult.oldLevel); // Mantener nivel anterior en UI hasta después del LEVEL UP
            
            // Calcular xpForNextLevel del NIVEL ANTERIOR para animar hasta 100%
            const oldLevelNextXP = Math.pow(syncResult.oldLevel, 2) * 100;
            const oldLevelStartXP = Math.pow(syncResult.oldLevel - 1, 2) * 100;
            const oldLevelRange = oldLevelNextXP - oldLevelStartXP;
            
            setXpForNextLevel(oldLevelRange);
            setXpProgress(100); // Target es 100% del nivel anterior
            
            console.log(`📊 LEVEL UP: Animando ${oldProgress}% → 100% en nivel ${syncResult.oldLevel}`);
            
            // Establecer progreso anterior para iniciar animación
            setAnimatedProgress(oldProgress);
            
          } else {
            // NO hay level up
            setTotalPoints(syncResult.points);
            setCurrentLevel(syncResult.level);
            setDisplayLevel(syncResult.level);
            
            const { xpForNextLevel: nextLevelXP, xpProgress: progress } = 
              calculateXPInfo(syncResult.points, syncResult.level);
            setXpForNextLevel(nextLevelXP);
            setXpProgress(progress);

            console.log(`✅ UI actualizada: ${syncResult.points} EXP, Nivel ${syncResult.level}`);
            
            if (hasRealChanges) {
              console.log(`📊 Progreso: ${oldProgress}% → ${progress}%`);
              // Solo establecer previousProgress si hay cambios reales
              setAnimatedProgress(oldProgress);
            } else {
              console.log(`📊 Sin cambios: ${progress}% (estado estático)`);
              // Establecer progreso directamente sin animación
              setAnimatedProgress(progress);
            }
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData?.id, userData?.moodle_id]);

  // Animación de la barra de progreso - SOLO cuando hay cambios reales
  useEffect(() => {
    if (isLoading) return;

    const startProgress = previousProgress; // Empezar desde el progreso anterior
    const targetProgress = xpProgress;
    
    // Si no hay cambio significativo, no animar
    if (Math.abs(targetProgress - startProgress) < 0.1) {
      setAnimatedProgress(targetProgress);
      return;
    }

    // IMPORTANTE: Esperar un frame para asegurar que el DOM está renderizado
    // y el usuario puede ver la barra antes de empezar la animación
    const startAnimation = () => {
      console.log(`🎬 Animando barra: ${startProgress}% → ${targetProgress}%`);
      setIsAnimating(true);

      let animationFrame: number;
      const duration = 2000; // 2 segundos
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing suave (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        const currentProgress = startProgress + (targetProgress - startProgress) * eased;
        setAnimatedProgress(currentProgress);

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate);
        } else {
          // Animación completada
          setAnimatedProgress(targetProgress);
          setIsAnimating(false);
          console.log(`✅ Animación completada: ${targetProgress}%`);
        }
      };

      animationFrame = requestAnimationFrame(animate);

      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        setIsAnimating(false);
      };
    };

    // Usar setTimeout para asegurar que el DOM está completamente renderizado
    // y dar tiempo al usuario para ver el estado anterior
    const timeoutId = setTimeout(() => {
      console.log(`👀 Usuario puede ver la barra, iniciando animación en 300ms...`);
      setTimeout(startAnimation, 300);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [xpProgress, previousProgress, isLoading]);

  // Detectar level up cuando la barra llega al 100%
  useEffect(() => {
    if (isLoading) return;
    
    // Si la barra animada llegó al 100% y hay level up pendiente
    if (animatedProgress >= 99.9 && levelUpTo === currentLevel && levelUpFrom < currentLevel && !showLevelUp) {
      console.log(`🎉 LEVEL UP activado! ${levelUpFrom} → ${levelUpTo}`);
      
      // 1. Ocultar la barra de progreso inmediatamente
      setHideProgressBar(true);
      
      // 2. Mostrar LEVEL UP después de un breve delay
      setTimeout(() => {
        setShowLevelUp(true);
        
        // 3. Después de 2 segundos, ocultar LEVEL UP y preparar nueva animación
        setTimeout(() => {
          setShowLevelUp(false);
          
          // 4. Calcular el progreso REAL del nuevo nivel
          const newLevelStartXP = Math.pow(levelUpTo - 1, 2) * 100;
          const newLevelNextXP = Math.pow(levelUpTo, 2) * 100;
          const newLevelRange = newLevelNextXP - newLevelStartXP;
          const currentXPInNewLevel = totalPoints - newLevelStartXP;
          const newLevelProgress = (currentXPInNewLevel / newLevelRange) * 100;
          
          console.log(`🎯 Nuevo nivel ${levelUpTo}: ${totalPoints} EXP, progreso ${newLevelProgress.toFixed(1)}%`);
          
          // 5. Actualizar estados para el nuevo nivel
          setXpForNextLevel(newLevelRange);
          setXpProgress(newLevelProgress);
          setPreviousProgress(0);
          setAnimatedProgress(0);
          setHideProgressBar(false);
          setDisplayLevel(levelUpTo); // Actualizar nivel en UI después del LEVEL UP
          
          // 6. Iniciar animación del nuevo nivel después de un breve delay
          setTimeout(() => {
            if (newLevelProgress > 0) {
              console.log(`🎬 Iniciando animación del nuevo nivel: 0% → ${newLevelProgress.toFixed(1)}%`);
              // La animación se ejecutará automáticamente por el useEffect de animación
            }
          }, 200);
        }, 2000);
      }, 300);
    }
  }, [animatedProgress, levelUpTo, currentLevel, levelUpFrom, isLoading, showLevelUp, totalPoints]);

  // Cargar badges desbloqueados desde la base de datos (via función serverless)
  useEffect(() => {
    const loadUnlockedBadges = async () => {
      if (!userData?.id) return;

      try {
        // Usar función serverless que devuelve todos los badges con status unlocked
        const badgesRes = await fetch(
          `${API_BASE}/getUserBadges?userId=${userData.id}`
        );
        const allBadges = await badgesRes.json();
        
        // Filtrar solo los desbloqueados
        const unlocked = allBadges.filter((badge: any) => badge.unlocked);
        setUnlockedBadgesFromDB(unlocked);
      } catch (error) {
        console.error('Error cargando badges:', error);
      }
    };

    loadUnlockedBadges();
  }, [userData?.id, totalPoints]); // Recargar cuando cambien los puntos

  // Calcular badges desbloqueados
  const badges = [
    { id: 1, code: 'START_ADVENTURE', name: '🎯 Primer Paso', unlocked: totalPoints >= 25 },
    { id: 2, code: 'HALFWAY', name: '⚡ A Mitad', unlocked: totalPoints >= 50 },
    { id: 3, code: 'COMPLETED', name: '🏆 Completado', unlocked: totalPoints >= 100 },
    { id: 4, code: 'DEDICATED', name: '📚 Dedicado', unlocked: courses.filter(c => c.progress > 0).length >= 3 },
    { id: 5, code: 'EXPERT', name: '⭐ Experto', unlocked: displayLevel >= 5 },
  ];

  // Usar badges desde la base de datos si están disponibles, sino los manuales
  const unlockedBadges = unlockedBadgesFromDB.length > 0 ? unlockedBadgesFromDB : badges.filter(b => b.unlocked);

  if (isLoading) {
    return (
      <div style={{
        fontFamily: '"Press Start 2P", cursive',
        textAlign: 'center',
        padding: '40px',
        fontSize: '12px',
        color: '#2563eb'
      }}>
        LOADING...
      </div>
    );
  }

  // Si showBadgesPage es true, renderizar la vista de badges
  if (showBadgesPage) {
    return <Badges userData={userData} onBack={() => setShowBadgesPage(false)} />;
  }

  // Si showInventoryPage es true, renderizar la vista de inventario
  if (showInventoryPage) {
    return <Inventory userData={userData} onBack={() => setShowInventoryPage(false)} />;
  }

  return (
    <div style={{
      fontFamily: '"Press Start 2P", cursive',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      minHeight: '50vh'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        .kenney-scrollbar::-webkit-scrollbar {
          width: 12px;
        }
        
        .kenney-scrollbar::-webkit-scrollbar-track {
          background: #d4d4d4;
          border: 2px solid #333;
        }
        
        .kenney-scrollbar::-webkit-scrollbar-thumb {
          background: #2563eb;
          border: 2px solid #333;
        }
        
        .kenney-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #1d4ed8;
        }

        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes levelUpEntrance {
          0% {
            transform: scale(0.5) translateY(50px);
            opacity: 0;
          }
          20% {
            transform: scale(1.2) translateY(-10px);
            opacity: 1;
          }
          40% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          60% {
            transform: scale(1.05) translateY(-5px);
            opacity: 1;
          }
          80% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
        }

        @keyframes levelUpExit {
          0% {
            transform: scale(1) translateY(0);
            opacity: 1;
          }
          100% {
            transform: scale(1.3) translateY(-30px);
            opacity: 0;
          }
        }

        @keyframes screenFlash {
          0% {
            background: rgba(37, 99, 235, 0);
          }
          50% {
            background: rgba(37, 99, 235, 0.3);
          }
          100% {
            background: rgba(37, 99, 235, 0.95);
          }
        }

        @keyframes arrowBounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-10px) scale(1.1);
          }
        }

        @keyframes numberGlow {
          0%, 100% {
            text-shadow: 6px 6px 0px rgba(0, 0, 0, 0.8), 0 0 20px rgba(37, 99, 235, 0.5);
          }
          50% {
            text-shadow: 6px 6px 0px rgba(0, 0, 0, 0.8), 0 0 40px rgba(37, 99, 235, 0.8);
          }
        }

        .level-up-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(37, 99, 235, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .level-up-content {
          text-align: center;
          animation: levelUpEntrance 1.2s ease-out;
        }

        .level-up-text {
          font-family: 'Press Start 2P', cursive;
          font-size: 36px;
          color: #fff;
          text-shadow: 4px 4px 0px rgba(0, 0, 0, 0.8);
          margin-bottom: 15px;
          letter-spacing: 3px;
        }

        .level-up-arrow {
          font-size: 48px;
          color: #ffd700;
          margin: 10px 0;
          animation: arrowBounce 1s ease-in-out infinite;
        }

        .level-up-number {
          font-family: 'Press Start 2P', cursive;
          font-size: 72px;
          color: #ffd700;
          animation: numberGlow 1.5s ease-in-out infinite;
        }

        .level-up-subtitle {
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          color: #fff;
          margin-top: 15px;
          opacity: 0.8;
          letter-spacing: 1px;
        }
      `}</style>

      {/* Header más legible */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#2563eb',
        color: 'white',
        borderRadius: '0',
        fontSize: '12px',
        boxShadow: '4px 4px 0px rgba(0,0,0,0.3)',
        border: '3px solid #333',
        position: 'relative'
      }}>
        <div style={{ fontSize: '10px', marginBottom: '6px', opacity: 0.8, letterSpacing: '2px' }}>ESTUDIANTE</div>
        <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>{userData?.firstname?.toUpperCase() || 'CARGANDO...'}</div>
        {isSyncing && (
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '16px',
            fontSize: '7px',
            opacity: 0.8,
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>●</span>
            SYNC
          </div>
        )}
      </div>

      {/* Layout 2 columnas en desktop, 1 en mobile */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1.2fr',
        gap: '20px',
        marginBottom: '20px'
      }}
      className="dashboard-grid"
      >
        
        {/* COLUMNA IZQUIERDA - Stats + XP Bar + Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
            {/* Stats más grandes y legibles */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '10px'
          }}>
            {/* EXP */}
            <div style={{
              backgroundColor: 'white',
              border: '3px solid #333',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '6px' }}>EXP</div>
              <div style={{ fontSize: '20px', color: '#2563eb', fontWeight: 'bold' }}>{totalPoints}</div>
            </div>

            {/* LEVEL */}
            <div style={{
              backgroundColor: 'white',
              border: '3px solid #333',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '6px' }}>NIVEL</div>
              <div style={{ fontSize: '20px', color: '#2563eb', fontWeight: 'bold' }}>{currentLevel}</div>
            </div>

            {/* CURSOS */}
            <div style={{
              backgroundColor: 'white',
              border: '3px solid #333',
              padding: '16px 10px',
              textAlign: 'center',
              boxShadow: '3px 3px 0px rgba(0,0,0,0.2)'
            }}>
              <div style={{ fontSize: '9px', color: '#666', marginBottom: '6px' }}>CURSOS</div>
              <div style={{ fontSize: '20px', color: '#2563eb', fontWeight: 'bold' }}>{courses.length}</div>
            </div>
          </div>

          {/* Barra XP más clara y legible */}
          <div style={{
            backgroundColor: 'white',
            border: '3px solid #333',
            padding: '15px',
            boxShadow: '3px 3px 0px rgba(0,0,0,0.2)'
          }}>
                     <div style={{ 
                       fontSize: '10px', 
                       marginBottom: '10px', 
                       color: '#333',
                       display: 'flex',
                       justifyContent: 'space-between',
                       alignItems: 'center'
                     }}>
                       <span>NIVEL {displayLevel}</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ color: '#2563eb' }}>{totalPoints} EXP</span>
                         {isAnimating && (
                           <span style={{ 
                             fontSize: '8px', 
                             color: '#2563eb',
                             animation: 'pulse 1s ease-in-out infinite'
                           }}>
                             ⚡
                           </span>
                         )}
                       </div>
                     </div>
            
            {/* Barra XP pixelart estilo */}
            <div style={{
              position: 'relative',
              height: '32px',
              backgroundColor: '#e0e0e0',
              border: '3px solid #333',
              overflow: 'hidden',
              boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.1)',
              opacity: hideProgressBar ? 0 : 1,
              transition: 'opacity 0.3s ease'
            }}>
              {/* Patrón de fondo pixelado */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.05) 6px, rgba(0,0,0,0.05) 8px)',
                pointerEvents: 'none'
              }} />
              
              {/* Barra roja de progreso - ANIMADA */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${Math.min(animatedProgress, 100)}%`,
                background: 'linear-gradient(180deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                transition: 'none', // Sin transition CSS, usamos JS animation
                boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.3)'
              }} />
              
              {/* Patrón pixelado sobre la barra roja */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: `${Math.min(animatedProgress, 100)}%`,
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.1) 6px, rgba(0,0,0,0.1) 8px)',
                pointerEvents: 'none'
              }} />
              
              {/* Texto XP más grande */}
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                fontSize: '10px',
                color: 'white',
                textShadow: '2px 2px 0px rgba(0,0,0,0.8)',
                zIndex: 10,
                whiteSpace: 'nowrap',
                fontWeight: 'bold'
              }}>
                NIVEL {displayLevel + 1}: {Math.pow(displayLevel, 2) * 100} EXP
              </div>
            </div>
            
            {/* Info adicional */}
            <div style={{
              fontSize: '8px',
              marginTop: '8px',
              color: '#666',
              textAlign: 'center'
            }}>
              Faltan {Math.pow(displayLevel, 2) * 100 - totalPoints} EXP para subir de nivel ({Math.floor(xpProgress)}% completado)
            </div>
          </div>

          {/* Badges más grandes */}
          <div style={{
            backgroundColor: 'white',
            border: '3px solid #333',
            padding: '15px',
            boxShadow: '3px 3px 0px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '10px', marginBottom: '12px', color: '#333' }}>
              LOGROS [{unlockedBadges.length}]
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: unlockedBadges.length === 0 ? '1fr' : 'repeat(5, 1fr)',
              gap: '8px',
              minHeight: '60px'
            }}>
              {unlockedBadges.length === 0 ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  color: '#999',
                  fontSize: '8px',
                  padding: '20px'
                }}>
                  Aún no tienes logros desbloqueados
                </div>
              ) : (
                unlockedBadges.map((badge: any) => (
                <div
                  key={badge.id}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: '#2563eb',
                    border: '3px solid #333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  title={badge.name}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  {badge.code === 'START_ADVENTURE' ? (
                    <img 
                      src={staryuIcon} 
                      alt={badge.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
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
                        objectFit: 'contain',
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
                        objectFit: 'contain',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: '100%',
                      fontSize: '24px'
                    }}>
                      {badge.icon || badge.name.split(' ')[0]}
                    </div>
                  )}
                </div>
                ))
              )}
            </div>
            
            {/* Botón para ver todos los logros */}
            <button
              onClick={() => setShowBadgesPage(true)}
              style={{
                marginTop: '15px',
                width: '100%',
                padding: '10px',
                fontSize: '9px',
                fontWeight: 'bold',
                backgroundColor: '#2563eb',
                color: 'white',
                border: '3px solid #333',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.3)';
              }}
            >
              Ver todos los logros
            </button>
            
            {/* Botón Inventario */}
            <button
              onClick={() => setShowInventoryPage(true)}
              style={{
                marginTop: '10px',
                width: '100%',
                padding: '10px',
                fontSize: '9px',
                fontWeight: 'bold',
                backgroundColor: '#1e40af',
                color: 'white',
                border: '3px solid #333',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.3)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e3a8a';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '4px 4px 0px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1e40af';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '2px 2px 0px rgba(0,0,0,0.3)';
              }}
            >
              <img 
                src={chestIcon} 
                alt="Inventario"
                style={{
                  width: '20px',
                  height: '20px',
                  objectFit: 'contain'
                }}
              />
              Inventario
            </button>
          </div>
        </div>

        {/* COLUMNA DERECHA - Cursos más legibles */}
        <div>
          <div style={{
            backgroundColor: 'white',
            border: '3px solid #333',
            padding: '15px',
            boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
            maxHeight: '500px',
            overflowY: 'auto'
          }}
          className="kenney-scrollbar"
          >
            <div style={{ fontSize: '10px', marginBottom: '15px', color: '#333', position: 'sticky', top: 0, backgroundColor: 'white', paddingBottom: '10px' }}>
              CURSOS ACTIVOS ({courses.length})
            </div>
            
            {courses.length === 0 ? (
              <div style={{ fontSize: '9px', color: '#999', textAlign: 'center', padding: '40px 10px' }}>
                NO HAY CURSOS
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {courses.map(course => (
                  <div
                    key={course.id}
                    style={{
                      backgroundColor: '#f9f9f9',
                      border: '3px solid #333',
                      padding: '12px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateX(4px)';
                      e.currentTarget.style.backgroundColor = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.backgroundColor = '#f9f9f9';
                    }}
                  >
                    <div style={{
                      fontSize: '9px',
                      marginBottom: '8px',
                      color: '#333',
                      lineHeight: '1.4',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      minHeight: '28px'
                    }}>
                      {course.fullname}
                      {course.is_active === false && (
                        <span style={{ fontSize: '7px', color: '#999', marginLeft: '4px' }}>
                          (Historial)
                        </span>
                      )}
                    </div>
                    
                    {/* Barra progreso curso más grande */}
                    <div style={{
                      position: 'relative',
                      height: '24px',
                      backgroundColor: '#e0e0e0',
                      border: '3px solid #333',
                      overflow: 'hidden',
                      boxShadow: 'inset 1px 1px 0px rgba(0,0,0,0.1)'
                    }}>
                      {/* Patrón de fondo */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.05) 4px, rgba(0,0,0,0.05) 6px)',
                        pointerEvents: 'none'
                      }} />
                      
                      {/* Barra de progreso roja */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${Math.min(course.progress, 100)}%`,
                        background: 'linear-gradient(180deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
                        transition: 'width 0.5s ease',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -1px 0 rgba(0,0,0,0.3)'
                      }} />
                      
                      {/* Patrón sobre la barra */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${Math.min(course.progress, 100)}%`,
                        backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.1) 4px, rgba(0,0,0,0.1) 6px)',
                        pointerEvents: 'none'
                      }} />
                      
                      {/* Porcentaje más grande */}
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '9px',
                        color: 'white',
                        textShadow: '1px 1px 0px rgba(0,0,0,0.8)',
                        zIndex: 10,
                        fontWeight: 'bold'
                      }}>
                        {Math.floor(course.progress)}%
                      </div>
                    </div>

                    <div style={{
                      fontSize: '8px',
                      marginTop: '6px',
                      color: '#2563eb',
                      textAlign: 'right',
                      fontWeight: 'bold'
                    }}>
                      +{Math.floor(course.progress * 3)} XP
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer motivacional más legible */}
      <div style={{
        backgroundColor: 'white',
        border: '3px solid #333',
        padding: '16px',
        textAlign: 'center',
        boxShadow: '3px 3px 0px rgba(0,0,0,0.2)',
        fontSize: '9px',
        color: '#2563eb',
        lineHeight: '1.6',
        fontWeight: 'bold',
        letterSpacing: '0.5px'
      }}>
        {totalPoints < 50 && "▸ SIGUE ASI! CADA PASO CUENTA."}
        {totalPoints >= 50 && totalPoints < 100 && "▸ VAS GENIAL! YA ESTAS A MITAD."}
        {totalPoints >= 100 && totalPoints < 200 && "▸ INCREIBLE! ERES DEDICADO."}
        {totalPoints >= 200 && "▸ ERES UNA LEYENDA! SIGUE ASI."}
      </div>

      {/* Overlay de LEVEL UP */}
      {showLevelUp && (
        <div className="level-up-overlay">
          <div className="level-up-content">
            <div className="level-up-text">LEVEL UP!</div>
            <div className="level-up-arrow">⬆️</div>
            <div className="level-up-number">{levelUpTo}</div>
            <div className="level-up-subtitle">NUEVO NIVEL DESBLOQUEADO</div>
          </div>
        </div>
      )}
    </div>
  );
}
