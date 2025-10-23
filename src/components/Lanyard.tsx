/* eslint-disable react/no-unknown-property */
import { useEffect, useRef, useState } from 'react';
import { Canvas, extend, useFrame } from '@react-three/fiber';
import { useGLTF, useTexture, Environment, Lightformer } from '@react-three/drei';
import { BallCollider, CuboidCollider, Physics, RigidBody, useRopeJoint, useSphericalJoint } from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { BookOpen, HelpCircle, Headphones } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

// replace with your own imports, see the usage snippet for details
// @ts-ignore
import cardGLB from './card.glb';
import lanyard from './lanyard.png';

import * as THREE from 'three';
import './Lanyard.css';

extend({ MeshLineGeometry, MeshLineMaterial });

type CardType = 'courses' | 'how-it-works' | 'support';

interface LanyardProps {
  position?: [number, number, number];
  gravity?: [number, number, number];
  fov?: number;
  transparent?: boolean;
  cardType?: CardType;
  onRelease?: () => void;
}

// Función para crear textura desde icono SVG - misma posición que el ícono original
const createIconTexture = (cardType: CardType) => {
  const iconMap = {
    'courses': BookOpen,
    'how-it-works': HelpCircle,
    'support': Headphones
  };

  const textMap = {
    'courses': ['cursos', 'Lista de'],
    'how-it-works': ['funciona?', '¿Cómo'],
    'support': ['Soporte']
  };

  const Icon = iconMap[cardType];
  const text = textMap[cardType];
  const iconSize = 400;
  const svgString = renderToStaticMarkup(
    <Icon size={iconSize} strokeWidth={2.5} color="#5d0008" />
  );

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Fondo blanco
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1024, 1024);

  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise<THREE.Texture>((resolve) => {
    img.onload = () => {
      // Posicionar el ícono en la esquina inferior izquierda y voltearlo
      const x = 80;
      const y = 1024 - iconSize - 60; // Bajado un poco más
      
      // Guardar estado y voltear verticalmente
      ctx.save();
      ctx.translate(x + iconSize / 2, y + iconSize / 2);
      ctx.scale(1, -1); // Flip vertical
      ctx.translate(-iconSize / 2, -iconSize / 2);
      ctx.drawImage(img, 0, 0, iconSize, iconSize);
      ctx.restore();
      
      // Añadir texto en la parte SUPERIOR del canvas para que aparezca abajo al invertir
      let textY = 400; // Posición inicial
      const lineHeight = 80; // Espacio entre líneas aumentado
      ctx.fillStyle = '#5d0008';
      ctx.font = '900 70px Arial Black, Arial, sans-serif';
      ctx.textAlign = 'left';
      
      // Dibujar cada línea de texto
      text.forEach((line: string, index: number) => {
        ctx.save();
        ctx.translate(x, textY + (index * lineHeight));
        ctx.scale(1, -1); // Flip vertical igual que el ícono
        ctx.fillText(line, 0, 0);
        ctx.restore();
      });
      
      URL.revokeObjectURL(url);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      resolve(texture);
    };
    img.src = url;
  });
};

export default function Lanyard({ position = [0, 0, 30], gravity = [0, -40, 0], fov = 20, transparent = true, cardType = 'courses', onRelease }: LanyardProps) {
  return (
    <div className="lanyard-wrapper">
      <Canvas
        camera={{ position: position, fov: fov }}
        gl={{ alpha: transparent }}
        onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x000000), transparent ? 0 : 1)}
      >
        <ambientLight intensity={Math.PI} />
        <Physics gravity={gravity} timeStep={1 / 60}>
          <Band cardType={cardType} onRelease={onRelease} />
        </Physics>
        <Environment blur={0.75}>
          <Lightformer
            intensity={2}
            color="white"
            position={[0, -1, 5]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[-1, -1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={3}
            color="white"
            position={[1, 1, 1]}
            rotation={[0, 0, Math.PI / 3]}
            scale={[100, 0.1, 1]}
          />
          <Lightformer
            intensity={10}
            color="white"
            position={[-10, 0, 14]}
            rotation={[0, Math.PI / 2, Math.PI / 3]}
            scale={[100, 10, 1]}
          />
        </Environment>
      </Canvas>
    </div>
  );
}

function Band({ maxSpeed = 50, minSpeed = 0, cardType = 'courses', onRelease }: { maxSpeed?: number; minSpeed?: number; cardType?: CardType; onRelease?: () => void }) {
  const band = useRef<any>();
  const fixed = useRef<any>();
  const j1 = useRef<any>();
  const j2 = useRef<any>();
  const j3 = useRef<any>();
  const card = useRef<any>();
  
  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();
  
  const segmentProps = { type: 'dynamic' as const, canSleep: true, colliders: false as const, angularDamping: 4, linearDamping: 4 };
  const { nodes, materials }: any = useGLTF(cardGLB);
  const texture = useTexture(lanyard);
  const [iconTexture, setIconTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    createIconTexture(cardType).then(setIconTexture);
  }, [cardType]);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<any>(false);
  const [hovered, hover] = useState(false);
  const [isSmall, setIsSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 1024);
  const prevDragged = useRef<any>(false);
  const [showWarning, setShowWarning] = useState(false);
  const warningRef = useRef<any>();

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.5, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => void (document.body.style.cursor = 'auto');
    }
  }, [hovered, dragged]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmall(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Detectar cuando el usuario suelta la tarjeta
  useEffect(() => {
    if (prevDragged.current && !dragged && onRelease) {
      onRelease();
    }
    prevDragged.current = dragged;
  }, [dragged, onRelease]);

  useFrame((state, delta) => {
    if (dragged) {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach((ref: any) => ref.current?.wakeUp());
      
      // Límites de arrastre (ajustables)
      const MIN_Y = -1.5; // Límite inferior (más negativo = más abajo)
      const MAX_Y = 2;  // Límite superior
      
      let targetX = vec.x - dragged.x;
      let targetY = vec.y - dragged.y;
      let targetZ = vec.z - dragged.z;
      
      // Aplicar límites con efecto de vibración
      let isAtLimit = false;
      if (targetY < MIN_Y) {
        targetY = MIN_Y + Math.sin(Date.now() * 0.05) * 0.02; // Vibración sutil
        isAtLimit = true;
      } else if (targetY > MAX_Y) {
        targetY = MAX_Y + Math.sin(Date.now() * 0.05) * 0.02;
        isAtLimit = true;
      }
      
      // Mostrar warning cuando alcanza el límite
      if (isAtLimit && !showWarning) {
        setShowWarning(true);
      } else if (!isAtLimit && showWarning) {
        setShowWarning(false);
      }
      
      card.current?.setNextKinematicTranslation({ x: targetX, y: targetY, z: targetZ });
    } else {
      // Ocultar warning cuando no está arrastrando
      if (showWarning) setShowWarning(false);
    }
    
    // Animar el sprite de warning con efecto bounce
    if (warningRef.current && showWarning) {
      const bounce = Math.sin(state.clock.elapsedTime * 10) * 0.1 + 1;
      warningRef.current.scale.set(2 * bounce, 1 * bounce, 1);
    }
    if (fixed.current) {
      [j1, j2].forEach((ref: any) => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // Crear textura para el texto "Suelta!"
  const createWarningTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    
    // Fondo transparente (no dibujar nada)
    ctx.clearRect(0, 0, 512, 256);
    
    // Texto en color #5d0008
    ctx.fillStyle = '#5d0008';
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('¡Suelta!', 256, 128);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  };

  const [warningTexture] = useState(() => createWarningTexture());

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[2, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          <group
            scale={2.25}
            position={[0, -1.2, -0.05]}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial
                map={iconTexture || materials.base.map}
                map-anisotropy={16}
                clearcoat={1}
                clearcoatRoughness={0.15}
                roughness={0.9}
                metalness={0.8}
              />
            </mesh>
            {/* Área invisible para capturar eventos en toda la tarjeta */}
            <mesh
              position={[0.35, 0.4, 0.05]}
              onPointerOver={() => hover(true)}
              onPointerOut={() => hover(false)}
              onPointerUp={(e: any) => (e.target.releasePointerCapture(e.pointerId), drag(false))}
              onPointerDown={(e: any) => (
                e.target.setPointerCapture(e.pointerId),
                drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())))
              )}
            >
              <planeGeometry args={[0.9, 1.3]} />
              <meshBasicMaterial transparent opacity={0} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="#5d0008"
          depthTest={false}
          resolution={isSmall ? [1000, 2000] : [1000, 1000]}
          useMap={false}
          lineWidth={1}
        />
      </mesh>
      
      {/* Texto de advertencia "Suelta!" - Posición fija esquina superior derecha */}
      {showWarning && (
        <sprite 
          ref={warningRef}
          position={[1.8, 1.8, 0]}
          scale={[2, 1, 1]}
        >
          <spriteMaterial 
            map={warningTexture} 
            transparent 
            depthTest={false}
          />
        </sprite>
      )}
    </>
  );
}

