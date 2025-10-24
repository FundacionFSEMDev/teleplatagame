import { BookOpen, CheckSquare, FileText, Award, PlayCircle, Clock, Smartphone, GraduationCap, Pause, Play, RotateCcw } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const Interactive3DModel = () => {
  const [isPaused, setIsPaused] = useState(false)
  const [currentProgress, setCurrentProgress] = useState(0)
  const timelineRef = useRef<gsap.core.Timeline | null>(null)
  const steps = [
    {
      number: 1,
      title: 'Accede a Mis Cursos',
      description: 'Inicia sesión en la plataforma con tus credenciales y accede a tu panel personal donde encontrarás todos los cursos disponibles.',
      icon: BookOpen,
    },
    {
      number: 2,
      title: 'Selecciona un Curso',
      description: 'Explora el catálogo y elige el curso que más te interese. Cada curso tiene su propio contenido, objetivos y materiales.',
      icon: PlayCircle,
    },
    {
      number: 3,
      title: 'Avanza por los Temas',
      description: 'Estudia el contenido a tu ritmo. Cada tema incluye materiales didácticos, recursos descargables y actividades prácticas.',
      icon: FileText,
    },
    {
      number: 4,
      title: 'Completa las Evaluaciones',
      description: 'Realiza los cuestionarios y actividades para demostrar lo que has aprendido. Puedes repetir las evaluaciones si no las superas.',
      icon: CheckSquare,
    },
    {
      number: 5,
      title: 'Obtén tu Diploma',
      description: 'Al completar todas las actividades y aprobar las evaluaciones, recibirás tu diploma acreditativo descargable.',
      icon: Award,
    }
  ]

  const manuals = [
    {
      language: 'Español',
      flagCode: 'es',
      flagUrl: 'https://flagcdn.com/w320/es.png',
      url: 'https://fundacionsanezequiel.org/wp-content/uploads/2025/10/MANUAL-DE-USUARIO-TELEPLATAFORMA.pdf'
    },
    {
      language: 'English',
      flagCode: 'gb',
      flagUrl: 'https://flagcdn.com/w320/gb.png',
      url: 'https://fundacionsanezequiel.org/wp-content/uploads/2025/10/MANUAL-DE-USUARIO-TELEPLATAFORMA_INGLES.pdf'
    },
    {
      language: 'Français',
      flagCode: 'fr',
      flagUrl: 'https://flagcdn.com/w320/fr.png',
      url: 'https://fundacionsanezequiel.org/wp-content/uploads/2025/10/MANUAL-DE-USUARIO-TELEPLATAFORMA_FRANCES-1.pdf'
    },
    {
      language: 'Português',
      flagCode: 'pt',
      flagUrl: 'https://flagcdn.com/w320/pt.png',
      url: 'https://fundacionsanezequiel.org/wp-content/uploads/2025/10/MANUAL-DE-USUARIO-TELEPLATAFORMA-PORTUGUES.pdf'
    },
    {
      language: 'العربية',
      flagCode: 'sa',
      flagUrl: 'https://flagcdn.com/w320/sa.png',
      url: 'https://fundacionsanezequiel.org/wp-content/uploads/2025/10/MANUAL-DE-USUARIO-TELEPLATAFORMA_ARABE-1.pdf'
    }
  ]

  const features = [
    {
      icon: Clock,
      title: 'A tu ritmo',
      description: 'Disponible 24/7',
    },
    {
      icon: Smartphone,
      title: 'Multidispositivo',
      description: 'Sincronización automática',
    },
    {
      icon: GraduationCap,
      title: 'Certificado oficial',
      description: 'Diploma acreditativo',
    }
  ]

  // Crear timeline GSAP con efecto de ola/wave horizontal
  useEffect(() => {
    const tl = gsap.timeline({ 
      repeat: -1,
      paused: isPaused,
      onUpdate: function() {
        const progress = this.progress() * 100
        setCurrentProgress(progress)
      }
    })

    // Animación de ola que fluye por todos los pasos
    steps.forEach((_, index) => {
      // Activar paso actual con efecto de ola
      tl.to(`.step-circle-${index}`, {
        scale: 1.3,
        backgroundColor: '#2563eb',
        boxShadow: '0 0 25px rgba(93, 0, 8, 0.6)',
        duration: 0.4,
        ease: "back.out(1.7)"
      })
      .to(`.step-content-${index}`, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: "power2.out"
      }, "<0.1")
      .to(`.step-line-${index}`, {
        scaleX: 1,
        backgroundColor: '#2563eb',
        duration: 2.5,
        ease: "none"
      }, "<")
      
      // Desactivar paso y pasar al siguiente
      .to(`.step-circle-${index}`, {
        scale: 1,
        backgroundColor: '#1d4ed8',
        boxShadow: '0 4px 10px rgba(93, 0, 8, 0.3)',
        duration: 0.2,
        ease: "power2.in"
      }, "+=0.1")
      .to(`.step-content-${index}`, {
        opacity: 0.6,
        y: -5,
        duration: 0.2,
        ease: "power2.in"
      }, "<")
    })

    timelineRef.current = tl
    
    return () => {
      tl.kill()
    }
  }, [steps.length])

  // Control de pausa/play
  useEffect(() => {
    if (timelineRef.current) {
      if (isPaused) {
        timelineRef.current.pause()
      } else {
        timelineRef.current.play()
      }
    }
  }, [isPaused])

  const resetAnimation = () => {
    if (timelineRef.current) {
      timelineRef.current.restart()
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header compacto y moderno */}
      <div 
        className="mb-8 p-6 rounded-2xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(93, 0, 8, 0.03) 0%, rgba(255, 255, 255, 0.8) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(93, 0, 8, 0.1)'
        }}
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-[#2563eb] mb-2">
          ¿Cómo funciona la plataforma?
        </h1>
          <p className="text-gray-600">
            Proceso simplificado en 5 pasos para maximizar tu experiencia de aprendizaje
        </p>
        </div>
      </div>

      {/* Timeline horizontal ultra-compacta con efecto de ola */}
      <div 
        className="mb-8 rounded-2xl overflow-hidden relative"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(93, 0, 8, 0.1)'
        }}
      >
        {/* Controles minimalistas */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <button
            onClick={resetAnimation}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm"
            title="Reiniciar"
          >
            <RotateCcw className="w-3.5 h-3.5 text-gray-700" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
            }}
            title={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-white" fill="white" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-white" fill="white" />
            )}
          </button>
        </div>

        <div className="p-6">
          {/* Timeline horizontal con círculos conectados */}
          <div className="relative mb-8">
            {/* Línea de conexión horizontal */}
            <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200" />
            
            {/* Círculos de los pasos */}
            <div className="relative flex justify-between items-start">
        {steps.map((step, index) => {
          const Icon = step.icon
                const isLast = index === steps.length - 1
                
          return (
                  <div key={step.number} className="flex flex-col items-center" style={{ flex: 1 }}>
                    {/* Línea animada entre pasos */}
                    {!isLast && (
                      <div 
                        className={`step-line-${index} absolute top-6 h-0.5`}
                        style={{
                          left: `${(100 / steps.length) * index + (100 / steps.length / 2)}%`,
                          width: `${100 / steps.length}%`,
                          background: '#e5e7eb',
                          transformOrigin: 'left',
                          transform: 'scaleX(0)'
                        }}
                      />
                    )}
                    
                    {/* Círculo del paso */}
                    <div 
                      className={`step-circle-${index} relative z-10 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-lg transition-all duration-300 cursor-pointer`}
                      style={{ 
                        background: 'linear-gradient(135deg, #1d4ed8 0%, #b00016 100%)',
                        boxShadow: '0 4px 10px rgba(93, 0, 8, 0.3)'
                      }}
                    >
                      <span className="text-sm">{step.number}</span>
                      <div 
                        className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center"
                      >
                        <Icon className="w-3.5 h-3.5 text-[#2563eb]" />
                      </div>
                    </div>
                  </div>
                )
              })}
                  </div>
                </div>

          {/* Grid compacto de contenido de pasos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              
              return (
                <div
                  key={step.number}
                  className={`step-content-${index} rounded-xl p-4 transition-all duration-300`}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                    border: '1px solid rgba(93, 0, 8, 0.08)',
                    opacity: 0.6,
                    transform: 'translateY(-5px)'
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(93, 0, 8, 0.1) 0%, rgba(139, 0, 18, 0.1) 100%)'
                      }}
                    >
                      <Icon className="w-4 h-4 text-[#2563eb]" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#2563eb]">
                      {step.number}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>

          {/* Barra de progreso global ultra-minimalista */}
          <div className="mt-4 pt-3 border-t border-gray-100/50">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-gray-400">Progreso</span>
              <span className="text-xs font-mono font-bold text-[#2563eb]">
                {Math.round(currentProgress)}%
              </span>
            </div>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                        style={{ 
                  width: `${currentProgress}%`,
                  background: 'linear-gradient(90deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 0 8px rgba(93, 0, 8, 0.4)'
                        }}
                      />
                    </div>
          </div>
        </div>
      </div>

      {/* Features compactas integradas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="card-drop group"
              style={{ animationDelay: `${(steps.length + index) * 50}ms` }}
            >
              <div
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:shadow-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(93, 0, 8, 0.1)'
                }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <Icon className="w-5 h-5 text-white" />
                  </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-gray-500 leading-tight mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Sección de manuales ultra-compacta */}
      <div 
        className="rounded-2xl p-6 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
              <span>📚</span>
              <span>Manuales de Usuario</span>
          </h2>
            <p className="text-white/80 text-sm">
              Documentación técnica disponible en múltiples idiomas
          </p>
          </div>
        </div>

        {/* Grid compacto de manuales */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {manuals.map((manual, index) => (
            <a
              key={index}
              href={manual.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card-drop group"
              style={{ animationDelay: `${(steps.length + features.length + index) * 50}ms` }}
            >
              <div
                className="flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  minHeight: '100px'
                }}
              >
                <div className="w-16 h-12 mb-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <img 
                    src={manual.flagUrl}
                    alt={`Bandera ${manual.language}`}
                    className="w-full h-full object-cover rounded shadow-md"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-gray-500 mt-1 group-hover:text-[#2563eb] transition-colors">
                    PDF
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Nota optimizada */}
        <div 
          className="mt-4 rounded-xl p-3 text-white text-center"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          <p className="text-xs">
            <strong>💡 Recomendación:</strong> Descarga el manual antes de iniciar tu primer curso
          </p>
        </div>
      </div>
    </div>
  )
}

export default Interactive3DModel

