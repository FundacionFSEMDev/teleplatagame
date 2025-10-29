import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import Lanyard from './components/Lanyard'
import Particles from './components/Particles'
import CoursesList from './CoursesList'
import CourseInterestForm from './CourseInterestForm'
import Interactive3DModel from './Interactive3DModel'
import SupportSection from './SupportSection'
import GamificationCard from './components/GamificationCard'
import GamificationLogin from './components/GamificationLogin'
import GamificationDashboard from './components/GamificationDashboard'

type Section = 'menu' | 'courses' | 'howto' | 'support' | 'gamification' | 'dashboard'

interface Course {
  id: string
  title: string
  description: string
  icon: any
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  skills: string[]
}

function App() {
  const [currentSection, setCurrentSection] = useState<Section>('menu')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [userData, setUserData] = useState<any>(null)

  const handleBackToMenu = () => {
    setCurrentSection('menu')
    setShowCourseForm(false)
    setSelectedCourse(null)
  }

  const handleCourseInterest = (course: Course) => {
    setSelectedCourse(course)
    setShowCourseForm(true)
  }

  const handleBackToCourses = () => {
    setShowCourseForm(false)
    setSelectedCourse(null)
  }

  useEffect(() => {
    // Reset animations on section change
    if (currentSection !== 'menu') {
      const timer = setTimeout(() => {
        const elements = document.querySelectorAll('.content-reveal')
        elements.forEach((el, index) => {
          setTimeout(() => {
            el.classList.add('animate')
          }, index * 100)
        })
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [currentSection])

  return (
    <div className="min-h-screen relative bg-white" style={{ overflow: 'visible' }}>
      {/* Fondo de partículas */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0 }}>
        <Particles
          particleColors={['#d4a5a5', '#e8c4c4', '#ffc8c8']}
          particleCount={250}
          particleSpread={10}
          speed={0.15}
          particleBaseSize={150}
          moveParticlesOnHover={true}
          particleHoverFactor={2.5}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Contenido principal */}
      <main className="min-h-screen flex flex-col relative z-10" style={{ overflow: 'visible', padding: currentSection === 'menu' ? '0' : '1rem 1rem 3rem' }}>
        {currentSection === 'menu' && (
          <>
            {/* Banner de ancho completo limpio */}
            <div 
              className="w-full relative z-20 animate-fade-in"
              style={{
                padding: '1vh 4vw 2vh',
                marginBottom: '-15vh',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Banner limpio sin pista */}
            </div>

            {/* Lanyards únicamente - 100% ancho de pantalla */}
            <div style={{ 
              overflow: 'visible', 
              minHeight: '70vh',
              paddingTop: '9vh',
              paddingBottom: '40vh',
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2.5vw',
              width: '100vw',
              margin: '0',
              padding: '9vh 1.25vw 40vh',
              position: 'relative',
              left: '50%',
              right: '50%',
              marginLeft: '-50vw',
              marginRight: '-50vw',
              boxSizing: 'border-box'
            }}>
              <div 
                style={{ overflow: 'visible', height: 'max(60vh, 500px)', position: 'relative', zIndex: 1, pointerEvents: 'none' }}
              >
                <div
                  style={{ pointerEvents: 'auto' }}
                  onPointerDown={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '100';
                  }}
                  onPointerUp={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '1';
                  }}
                  onPointerCancel={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '1';
                  }}
                >
                  <Lanyard 
                    position={[0, 0, 16]}
                    gravity={[0, -35, 0]}
                    cardType="courses"
                    onRelease={() => setCurrentSection('courses')}
                  />
                </div>
              </div>
              <div 
                style={{ overflow: 'visible', height: 'max(60vh, 500px)', position: 'relative', zIndex: 1, pointerEvents: 'none' }}
              >
                <div
                  style={{ pointerEvents: 'auto' }}
                  onPointerDown={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '100';
                  }}
                  onPointerUp={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '1';
                  }}
                  onPointerCancel={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '1';
                  }}
                >
                  <Lanyard 
                    position={[0, 0, 16]}
                    gravity={[0, -35, 0]}
                    cardType="how-it-works"
                    onRelease={() => setCurrentSection('howto')}
                  />
                </div>
              </div>
              <div 
                style={{ overflow: 'visible', height: 'max(60vh, 500px)', position: 'relative', zIndex: 1, pointerEvents: 'none' }}
              >
                <div
                  style={{ pointerEvents: 'auto' }}
                  onPointerDown={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '100';
                  }}
                  onPointerUp={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '1';
                  }}
                  onPointerCancel={(e) => {
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.style.zIndex = '1';
                  }}
                >
                  <Lanyard 
                    position={[0, 0, 16]}
                    gravity={[0, -35, 0]}
                    cardType="support"
                    onRelease={() => setCurrentSection('support')}
                  />
                </div>
              </div>
            </div>

            {/* Card de Gamificación */}
            <GamificationCard onAccessClick={() => setCurrentSection('gamification')} />
          </>
        )}

        {currentSection === 'courses' && !showCourseForm && (
          <div className="section-transition w-full max-w-7xl mx-auto">
            {/* Botón volver */}
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold">Volver al Menú</span>
            </button>
            <div className="content-slide-up">
              <CoursesList onCourseInterest={handleCourseInterest} />
            </div>
          </div>
        )}

        {currentSection === 'courses' && showCourseForm && selectedCourse && (
          <div className="section-transition w-full max-w-7xl mx-auto">
            <div className="content-slide-up">
              <CourseInterestForm
                course={selectedCourse}
                onBack={handleBackToCourses}
              />
            </div>
          </div>
        )}

        {currentSection === 'howto' && (
          <div className="section-transition w-full max-w-7xl mx-auto">
            {/* Botón volver */}
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold">Volver al Menú</span>
            </button>
            <div className="content-slide-up">
              <Interactive3DModel />
            </div>
          </div>
        )}

        {currentSection === 'support' && (
          <div className="section-transition w-full max-w-7xl mx-auto">
            {/* Botón volver */}
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold">Volver al Menú</span>
            </button>
            <div className="content-slide-up">
              <SupportSection />
            </div>
          </div>
        )}

        {currentSection === 'gamification' && (
          <div className="section-transition w-full max-w-7xl mx-auto">
            {/* Botón volver */}
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold">Volver al Menú</span>
            </button>
            <div className="content-slide-up py-12">
              <GamificationLogin 
                onSuccess={(user) => {
                  setUserData(user);
                  setCurrentSection('dashboard');
                }}
                onViewCourses={() => setCurrentSection('courses')} 
              />
            </div>
          </div>
        )}

        {currentSection === 'dashboard' && (
          <div className="section-transition w-full max-w-7xl mx-auto">
            {/* Botón volver */}
            <button
              onClick={handleBackToMenu}
              className="flex items-center gap-2 mb-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
            >
              <X className="w-5 h-5" />
              <span className="font-semibold">Volver al Menú</span>
            </button>
            <div className="content-slide-up">
              <GamificationDashboard userData={userData} />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App

