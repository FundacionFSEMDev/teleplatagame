import { useState, useMemo } from 'react'
import { Search, Filter, BookOpen, Laptop, Utensils, Users, Briefcase, Code, Shield, MessageCircle, Home, Lightbulb, Heart, Building } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  icon: any
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  skills: string[]
}

interface CoursesListProps {
  onCourseInterest: (course: Course) => void
}

const CoursesList: React.FC<CoursesListProps> = ({ onCourseInterest }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const courses: Course[] = [
    {
      id: '12',
      title: 'Manipulador de Alimentos',
      description: 'Aprende las normas básicas de higiene y seguridad alimentaria necesarias para trabajar en el sector de la alimentación.',
      icon: Utensils,
      level: 'beginner',
      category: 'Hostelería',
      skills: ['Higiene alimentaria', 'Seguridad', 'Normativa', 'Prevención']
    },
    {
      id: '1',
      title: 'Alfabetización Digital',
      description: 'Introducción al uso de ordenadores, internet y herramientas digitales básicas para el día a día.',
      icon: Laptop,
      level: 'beginner',
      category: 'Tecnología',
      skills: ['Informática básica', 'Internet', 'Email', 'Navegación web']
    },
    {
      id: '2',
      title: 'Alimentación en atención a personas dependientes',
      description: 'Conocimientos sobre nutrición y alimentación para el cuidado de personas con dependencia.',
      icon: Heart,
      level: 'intermediate',
      category: 'Cuidados',
      skills: ['Nutrición', 'Dietas', 'Cuidados', 'Salud']
    },
    {
      id: '3',
      title: 'Atención al Cliente',
      description: 'Desarrolla habilidades para ofrecer un servicio de calidad y gestionar la relación con clientes.',
      icon: Users,
      level: 'beginner',
      category: 'Comercial',
      skills: ['Comunicación', 'Servicio', 'Resolución de conflictos', 'Empatía']
    },
    {
      id: '4',
      title: 'Búsqueda de Empleo',
      description: 'Estrategias y herramientas para buscar trabajo de forma efectiva y preparar entrevistas laborales.',
      icon: Briefcase,
      level: 'beginner',
      category: 'Empleo',
      skills: ['CV', 'Entrevistas', 'Búsqueda activa', 'Networking']
    },
    {
      id: '5',
      title: 'Competencias Digitales Avanzadas',
      description: 'Profundiza en herramientas digitales avanzadas como hojas de cálculo, bases de datos y presentaciones.',
      icon: Code,
      level: 'advanced',
      category: 'Tecnología',
      skills: ['Excel avanzado', 'Bases de datos', 'Presentaciones', 'Automatización']
    },
    {
      id: '6',
      title: 'Competencias Digitales Básicas',
      description: 'Aprende a usar procesadores de texto, correo electrónico y herramientas de comunicación online.',
      icon: Laptop,
      level: 'beginner',
      category: 'Tecnología',
      skills: ['Word', 'Email', 'Videoconferencias', 'Almacenamiento en la nube']
    },
    {
      id: '7',
      title: 'Comunicación en atención a personas dependientes',
      description: 'Técnicas de comunicación efectiva para el trato con personas mayores o con dependencia.',
      icon: MessageCircle,
      level: 'intermediate',
      category: 'Cuidados',
      skills: ['Comunicación', 'Escucha activa', 'Empatía', 'Trato personalizado']
    },
    {
      id: '8',
      title: 'Cultura Laboral',
      description: 'Conoce los derechos y deberes laborales, contratos, nóminas y funcionamiento del mercado laboral.',
      icon: Building,
      level: 'beginner',
      category: 'Empleo',
      skills: ['Derechos laborales', 'Contratos', 'Nóminas', 'Legislación']
    },
    {
      id: '9',
      title: 'Empleo Doméstico',
      description: 'Formación específica para el trabajo en el hogar: limpieza, organización y tareas domésticas.',
      icon: Home,
      level: 'beginner',
      category: 'Servicios',
      skills: ['Limpieza', 'Organización', 'Planificación', 'Técnicas domésticas']
    },
    {
      id: '10',
      title: 'Emprendimiento',
      description: 'Desarrolla tu idea de negocio, aprende a crear un plan empresarial y gestionar tu propio proyecto.',
      icon: Lightbulb,
      level: 'intermediate',
      category: 'Empresa',
      skills: ['Plan de negocio', 'Gestión', 'Finanzas', 'Marketing']
    },
    {
      id: '11',
      title: 'Habilidades Sociales',
      description: 'Mejora tu capacidad de relacionarte, trabajar en equipo y comunicarte de forma efectiva.',
      icon: Users,
      level: 'beginner',
      category: 'Desarrollo personal',
      skills: ['Comunicación', 'Trabajo en equipo', 'Liderazgo', 'Asertividad']
    },
    {
      id: '13',
      title: 'Seguridad Digital en Empresas',
      description: 'Protege la información de tu empresa y aprende sobre ciberseguridad básica en el entorno laboral.',
      icon: Shield,
      level: 'intermediate',
      category: 'Tecnología',
      skills: ['Ciberseguridad', 'Protección de datos', 'Contraseñas', 'Prevención']
    }
  ]

  const levelLabels = {
    all: 'Todos los niveles',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado'
  }

  const levelColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800'
  }

  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesLevel = levelFilter === 'all' || course.level === levelFilter

      return matchesSearch && matchesLevel
    })
  }, [searchQuery, levelFilter, courses])

  return (
    <div className="max-w-7xl mx-auto">
      {/* Título */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#2563eb] mb-4">
          Catálogo de Cursos
        </h1>
        <p className="text-xl text-gray-600">
          Explora nuestra oferta formativa y encuentra el curso perfecto para ti
        </p>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar cursos por nombre, categoría o habilidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent"
            />
          </div>

          {/* Filtro por nivel */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value as any)}
              className="pl-12 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb] focus:border-transparent appearance-none bg-white cursor-pointer"
            >
              <option value="all">Todos los niveles</option>
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          {filteredCourses.length} {filteredCourses.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
        </div>
      </div>

      {/* Grid de cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, index) => {
          const Icon = course.icon
          const isFunctional = course.id === '12'

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl card-drop"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Header del curso */}
              <div className="bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#2563eb]" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${levelColors[course.level]}`}>
                    {levelLabels[course.level]}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  {course.title}
                </h3>
              </div>

              {/* Contenido del curso */}
              <div className="p-6">
                <p className="text-gray-600 mb-4 min-h-[60px]">
                  {course.description}
                </p>

                {/* Categoría */}
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-500">{course.category}</span>
                </div>

                {/* Habilidades */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Botón */}
                {isFunctional ? (
                  <button
                    onClick={() => onCourseInterest(course)}
                    className="w-full bg-gradient-to-r from-[#2563eb] to-[#1d4ed8] text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Me interesa
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                  >
                    En construcción 🚧
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Mensaje cuando no hay resultados */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No se encontraron cursos
          </h3>
          <p className="text-gray-500">
            Intenta ajustar tu búsqueda o filtros
          </p>
        </div>
      )}
    </div>
  )
}

export default CoursesList

