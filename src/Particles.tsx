import { useEffect, useRef } from 'react'
import { Renderer, Camera, Transform, Geometry, Program, Mesh } from 'ogl'
import './Particles.css'

interface ParticlesProps {
  particleColors?: string[]
  particleCount?: number
  particleSpread?: number
  speed?: number
  particleBaseSize?: number
  sizeRandomness?: number
  moveParticlesOnHover?: boolean
  particleHoverFactor?: number
  alphaParticles?: boolean
  disableRotation?: boolean
  cameraDistance?: number
}

const Particles: React.FC<ParticlesProps> = ({
  particleColors = ['#2563eb'],
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleBaseSize = 100,
  sizeRandomness = 1,
  moveParticlesOnHover = true,
  particleHoverFactor = 2,
  alphaParticles = false,
  disableRotation = false,
  cameraDistance = 20,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const rendererRef = useRef<Renderer | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    try {
      const canvas = canvasRef.current
      const renderer = new Renderer({ canvas, alpha: true })
      rendererRef.current = renderer
      const gl = renderer.gl
      gl.clearColor(1, 1, 1, 0)

      const camera = new Camera(gl, { fov: 35 })
      camera.position.set(0, 0, cameraDistance)

      const scene = new Transform()

      // Vertex Shader
      const vertex = `
        attribute vec3 position;
        attribute vec3 random;
        
        uniform mat4 modelViewMatrix;
        uniform mat4 projectionMatrix;
        uniform float uTime;
        uniform vec2 uMouse;
        
        varying vec3 vRandom;
        
        void main() {
          vRandom = random;
          
          vec3 pos = position;
          
          // Animación sinusoidal en 3 ejes
          pos.x += sin(uTime * 0.3 + random.x * 10.0) * 0.5;
          pos.y += cos(uTime * 0.2 + random.y * 10.0) * 0.5;
          pos.z += sin(uTime * 0.4 + random.z * 10.0) * 0.3;
          
          // Efecto parallax con mouse
          pos.x += uMouse.x * random.x * 2.0;
          pos.y += uMouse.y * random.y * 2.0;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = ${particleBaseSize.toFixed(1)} * (1.0 + random.x * ${sizeRandomness.toFixed(1)});
        }
      `

      // Fragment Shader
      const fragment = `
        precision highp float;
        
        varying vec3 vRandom;
        
        void main() {
          vec2 uv = gl_PointCoord.xy;
          float dist = length(uv - 0.5);
          
          // Círculo sólido
          if (dist > 0.5) discard;
          
          // Color base
          vec3 color = vec3(${parseInt(particleColors[0].slice(1, 3), 16) / 255}, 
                            ${parseInt(particleColors[0].slice(3, 5), 16) / 255}, 
                            ${parseInt(particleColors[0].slice(5, 7), 16) / 255});
          
          // Variación de color basada en posición
          color += vRandom * 0.1;
          
          float alpha = ${alphaParticles ? '0.6' : '1.0'};
          gl_FragColor = vec4(color, alpha);
        }
      `

      // Crear geometría de partículas
      const numParticles = particleCount
      const positions = new Float32Array(numParticles * 3)
      const randoms = new Float32Array(numParticles * 3)

      for (let i = 0; i < numParticles; i++) {
        const i3 = i * 3
        positions[i3] = (Math.random() - 0.5) * particleSpread
        positions[i3 + 1] = (Math.random() - 0.5) * particleSpread
        positions[i3 + 2] = (Math.random() - 0.5) * particleSpread

        randoms[i3] = Math.random()
        randoms[i3 + 1] = Math.random()
        randoms[i3 + 2] = Math.random()
      }

      const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 3, data: randoms },
      })

      const program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          uMouse: { value: [0, 0] },
        },
        transparent: true,
        depthTest: false,
      })

      const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program })
      particles.setParent(scene)

      // Resize handler
      const handleResize = () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.perspective({
          aspect: window.innerWidth / window.innerHeight,
        })
      }
      handleResize()
      window.addEventListener('resize', handleResize)

      // Mouse move handler
      const handleMouseMove = (e: MouseEvent) => {
        if (moveParticlesOnHover) {
          mousePos.current = {
            x: (e.clientX / window.innerWidth) * 2 - 1,
            y: -(e.clientY / window.innerHeight) * 2 + 1,
          }
        }
      }
      window.addEventListener('mousemove', handleMouseMove)

      // Animation loop
      let animationId: number
      const animate = (time: number) => {
        animationId = requestAnimationFrame(animate)

        // Actualizar tiempo
        program.uniforms.uTime.value = time * 0.001 * speed

        // Actualizar posición del mouse
        if (moveParticlesOnHover) {
          program.uniforms.uMouse.value = [
            mousePos.current.x * particleHoverFactor,
            mousePos.current.y * particleHoverFactor
          ]
        }

        // Rotación de la escena
        if (!disableRotation) {
          scene.rotation.y = time * 0.0001
          scene.rotation.x = Math.sin(time * 0.0001) * 0.1
        }

        renderer.render({ scene, camera })
      }
      animate(0)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
        window.removeEventListener('mousemove', handleMouseMove)
        cancelAnimationFrame(animationId)
        
        // Cleanup WebGL resources
        try {
          geometry.remove()
          program.remove()
          gl.getExtension('WEBGL_lose_context')?.loseContext()
        } catch (e) {
          console.error('Error cleaning up WebGL:', e)
        }
      }
    } catch (error) {
      console.error('Error initializing particles:', error)
      return () => {}
    }
  }, [
    particleColors,
    particleCount,
    particleSpread,
    speed,
    particleBaseSize,
    sizeRandomness,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    disableRotation,
    cameraDistance,
  ])

  return (
    <canvas
      ref={canvasRef}
      className="particles-canvas"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

export default Particles
