import { useState } from 'react'
import { Mail, MessageSquare, ChevronDown, AlertCircle, GraduationCap, HelpCircle, Download, RefreshCw, Smartphone, BookOpen } from 'lucide-react'

const SupportSection = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const supportOptions = [
    {
      title: 'Problemas Técnicos',
      description: 'Errores de plataforma, acceso, carga de contenidos',
      icon: AlertCircle,
      email: 'sistemas@fundacionsanezequiel.org',
      color: 'from-red-500 to-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-500'
    },
    {
      title: 'Dudas Académicas',
      description: 'Contenido de cursos, evaluaciones, materiales',
      icon: GraduationCap,
      email: 'Contactar con el tutor del curso',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500'
    }
  ]

  const faqs = [
    {
      question: '¿Cómo accedo a un curso?',
      answer: 'Para acceder a un curso, primero debes iniciar sesión en la plataforma con tus credenciales. Una vez dentro, dirígete a "Mis Cursos" donde encontrarás todos los cursos en los que estás matriculado. Haz clic en el curso que desees estudiar para acceder al contenido.',
      icon: BookOpen
    },
    {
      question: '¿Qué necesito para aprobar un curso?',
      answer: 'Para aprobar un curso necesitas completar todos los temas, realizar todas las actividades propuestas y superar las evaluaciones con la nota mínima requerida (normalmente un 70%). El progreso se guarda automáticamente, así que puedes avanzar a tu ritmo.',
      icon: GraduationCap
    },
    {
      question: '¿Puedo repetir un cuestionario si no lo apruebo?',
      answer: 'Sí, puedes repetir los cuestionarios tantas veces como necesites hasta alcanzar la nota mínima de aprobado. Sin embargo, ten en cuenta que las preguntas pueden variar en cada intento para asegurar que has comprendido bien el contenido.',
      icon: RefreshCw
    },
    {
      question: '¿Cómo descargo mi diploma?',
      answer: 'Una vez hayas completado todas las actividades y aprobado las evaluaciones del curso, el diploma estará disponible en la sección "Mis Diplomas" de tu perfil. Desde ahí podrás descargarlo en formato PDF. El diploma incluye un código de verificación único.',
      icon: Download
    },
    {
      question: '¿Tengo dudas sobre el contenido del curso, qué hago?',
      answer: 'Si tienes dudas sobre el contenido del curso, puedes contactar directamente con tu tutor a través del sistema de mensajería interno de la plataforma. También puedes consultar los foros del curso donde otros estudiantes y tutores participan activamente.',
      icon: MessageSquare
    },
    {
      question: '¿Puedo acceder a los cursos desde el móvil?',
      answer: 'Sí, la plataforma es completamente responsive y está optimizada para dispositivos móviles. Puedes acceder desde tu smartphone o tablet usando cualquier navegador web moderno. Tu progreso se sincroniza automáticamente entre todos tus dispositivos.',
      icon: Smartphone
    }
  ]

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Título */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-[#5d0008] mb-4">
          Centro de Soporte
        </h1>
        <p className="text-xl text-gray-600">
          Estamos aquí para ayudarte en lo que necesites
        </p>
      </div>

      {/* Opciones de soporte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {supportOptions.map((option, index) => {
          const Icon = option.icon
          return (
            <div
              key={index}
              className={`card-drop bg-white rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl border-2 ${option.borderColor}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${option.color} p-6`}>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
                    <Icon className="w-8 h-8 text-gray-800" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {option.title}
                    </h2>
                    <p className="text-white/90 text-sm">
                      {option.description}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <Mail className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-1">Contacto</h3>
                    {option.email.includes('@') ? (
                      <a
                        href={`mailto:${option.email}`}
                        className="text-[#5d0008] hover:text-[#8b0012] underline transition-colors"
                      >
                        {option.email}
                      </a>
                    ) : (
                      <p className="text-gray-600">{option.email}</p>
                    )}
                  </div>
                </div>

                <div className={`${option.bgColor} rounded-lg p-4 border-l-4 ${option.borderColor}`}>
                  <p className="text-sm text-gray-700">
                    <strong>Tiempo de respuesta:</strong> Normalmente respondemos en menos de 24 horas laborables.
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* FAQs */}
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="flex items-center justify-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-[#5d0008]" />
          <h2 className="text-3xl font-bold text-[#5d0008]">
            Preguntas Frecuentes
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const Icon = faq.icon
            const isOpen = openFaq === index

            return (
              <div
                key={index}
                className={`card-drop border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-[#5d0008] shadow-lg' : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ animationDelay: `${(supportOptions.length + index) * 50}ms` }}
              >
                {/* Pregunta */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isOpen ? 'bg-[#5d0008]' : 'bg-gray-200'
                    }`}>
                      <Icon className={`w-5 h-5 ${isOpen ? 'text-white' : 'text-gray-600'}`} />
                    </div>
                    <h3 className={`font-semibold text-lg ${
                      isOpen ? 'text-[#5d0008]' : 'text-gray-800'
                    }`}>
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 text-gray-400 flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Respuesta */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-6 pt-2">
                    <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-[#5d0008]">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Nota final */}
        <div className="mt-8 bg-gradient-to-r from-[#5d0008] to-[#8b0012] rounded-xl p-6 text-white text-center">
          <p className="text-lg">
            ¿No encuentras la respuesta que buscas?
          </p>
          <p className="text-white/90 text-sm mt-2">
            No dudes en contactar con nuestro equipo de soporte. Estamos aquí para ayudarte.
          </p>
          <a
            href="mailto:sistemas@fundacionsanezequiel.org"
            className="inline-block mt-4 px-6 py-3 bg-white text-[#5d0008] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Contactar con soporte
          </a>
        </div>
      </div>
    </div>
  )
}

export default SupportSection

