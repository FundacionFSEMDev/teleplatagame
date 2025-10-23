import { useState } from 'react'
import { ArrowLeft, Send, CheckCircle, AlertCircle } from 'lucide-react'

interface Course {
  id: string
  title: string
  description: string
  icon: any
  level: 'beginner' | 'intermediate' | 'advanced'
  category: string
  skills: string[]
}

interface CourseInterestFormProps {
  course: Course
  onBack: () => void
}

type FormStatus = 'idle' | 'success' | 'error'

const CourseInterestForm: React.FC<CourseInterestFormProps> = ({ course, onBack }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    telefono: '',
    fechaNacimiento: '',
    nacionalidad: '',
    email: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formStatus, setFormStatus] = useState<FormStatus>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'nombre':
        return value.trim() === '' ? 'El nombre es obligatorio' : ''
      case 'apellidos':
        return value.trim() === '' ? 'Los apellidos son obligatorios' : ''
      case 'telefono':
        return value.trim() === '' ? 'El teléfono es obligatorio' : ''
      case 'fechaNacimiento':
        return value.trim() === '' ? 'La fecha de nacimiento es obligatoria' : ''
      case 'nacionalidad':
        return value.trim() === '' ? 'La nacionalidad es obligatoria' : ''
      default:
        return ''
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Validación en tiempo real
    const error = validateField(name, value)
    setErrors(prev => ({ ...prev, [name]: error }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar todos los campos obligatorios
    const newErrors: Record<string, string> = {}
    Object.keys(formData).forEach(key => {
      if (key !== 'email') { // email es opcional
        const error = validateField(key, formData[key as keyof typeof formData])
        if (error) newErrors[key] = error
      }
    })

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar parámetros del template
      const templateParams = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        curso: course.title,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        nacionalidad: formData.nacionalidad,
        email: formData.email || 'No proporcionado'
      }

      // Enviar con EmailJS
      await window.emailjs.send(
        'service_1rdxoab',
        'template_4ip1uwh',
        templateParams
      )

      setFormStatus('success')

      // Resetear formulario
      setFormData({
        nombre: '',
        apellidos: '',
        telefono: '',
        fechaNacimiento: '',
        nacionalidad: '',
        email: ''
      })

      // Redirigir después de 2 segundos
      setTimeout(() => {
        onBack()
      }, 2000)

    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      setFormStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-[#5d0008] hover:text-[#8b0012] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Volver a cursos</span>
        </button>

        <h1 className="text-4xl font-bold text-[#5d0008] mb-4">
          Formulario de Interés
        </h1>
        <p className="text-xl text-gray-600 mb-2">
          {course.title}
        </p>
        <p className="text-gray-500">
          Completa el formulario y nos pondremos en contacto contigo
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {formStatus === 'success' ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              ¡Solicitud enviada con éxito!
            </h2>
            <p className="text-gray-600">
              Nos pondremos en contacto contigo pronto
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d0008] ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nombre"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            {/* Apellidos */}
            <div>
              <label htmlFor="apellidos" className="block text-sm font-semibold text-gray-700 mb-2">
                Apellidos *
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d0008] ${
                  errors.apellidos ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tus apellidos"
              />
              {errors.apellidos && (
                <p className="mt-1 text-sm text-red-600">{errors.apellidos}</p>
              )}
            </div>

            {/* Teléfono */}
            <div>
              <label htmlFor="telefono" className="block text-sm font-semibold text-gray-700 mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d0008] ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+34 600 000 000"
              />
              {errors.telefono && (
                <p className="mt-1 text-sm text-red-600">{errors.telefono}</p>
              )}
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label htmlFor="fechaNacimiento" className="block text-sm font-semibold text-gray-700 mb-2">
                Fecha de nacimiento *
              </label>
              <input
                type="date"
                id="fechaNacimiento"
                name="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d0008] ${
                  errors.fechaNacimiento ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.fechaNacimiento && (
                <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento}</p>
              )}
            </div>

            {/* Nacionalidad */}
            <div>
              <label htmlFor="nacionalidad" className="block text-sm font-semibold text-gray-700 mb-2">
                Nacionalidad *
              </label>
              <input
                type="text"
                id="nacionalidad"
                name="nacionalidad"
                value={formData.nacionalidad}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d0008] ${
                  errors.nacionalidad ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Tu nacionalidad"
              />
              {errors.nacionalidad && (
                <p className="mt-1 text-sm text-red-600">{errors.nacionalidad}</p>
              )}
            </div>

            {/* Email (opcional) */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5d0008]"
                placeholder="tu@email.com"
              />
            </div>

            {/* Mensaje de error general */}
            {formStatus === 'error' && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Error al enviar</h3>
                  <p className="text-sm text-red-600">
                    Ha ocurrido un error al enviar tu solicitud. Por favor, inténtalo de nuevo.
                  </p>
                </div>
              </div>
            )}

            {/* Botón de envío */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#5d0008] to-[#8b0012] text-white py-4 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Enviar solicitud</span>
                </>
              )}
            </button>

            {/* Nota */}
            <p className="text-sm text-gray-500 text-center">
              * Campos obligatorios
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default CourseInterestForm

