import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { useAssessmentStore } from '../state/assessmentStore'
import { HumanBody } from './HumanBody'

export function BodyViewport() {
  const toggleView = useAssessmentStore((state) => state.toggleView)
  const backView = useAssessmentStore((state) => state.backView)

  return (
    <div className="relative h-full w-full" data-testid="body-viewport">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.1, 4.6], fov: 40 }}
        gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: ACESFilmicToneMapping }}
      >
        <color attach="background" args={['#0a1017']} />
        <fog attach="fog" args={['#0a1017', 8, 16]} />

        {/* Studio three-point rig for soft, clinical modeling of the form. */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={2.1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
        >
          <orthographicCamera attach="shadow-camera" args={[-4, 4, 5, -4, 0.1, 20]} />
        </directionalLight>
        <directionalLight position={[-5, 3, 2]} intensity={0.6} color="#9db6ff" />
        <directionalLight position={[0, 3, -6]} intensity={1.1} color="#dce6ff" />

        {/* Local image-based lighting — no external HDR fetch, works offline. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.4} position={[0, 4, 3]} scale={[10, 10, 1]} color="#ffffff" />
          <Lightformer intensity={1.2} position={[-5, 1, 2]} scale={[6, 8, 1]} color="#cdd9ff" />
          <Lightformer intensity={1.0} position={[5, 2, 1]} scale={[6, 8, 1]} color="#ffffff" />
          <Lightformer intensity={1.6} position={[0, 2, -5]} scale={[10, 6, 1]} color="#aebfe0" />
        </Environment>

        <HumanBody />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.55}
          scale={9}
          blur={2.4}
          far={4}
          resolution={1024}
          color="#000000"
        />

        <OrbitControls
          target={[0, 1.9, 0]}
          enablePan={false}
          minDistance={1.6}
          maxDistance={8}
          minPolarAngle={0.2}
          maxPolarAngle={Math.PI - 0.2}
        />
      </Canvas>

      <button
        type="button"
        onClick={toggleView}
        className="no-print absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-slate-800/80 px-4 py-1.5 text-sm text-slate-200 backdrop-blur hover:bg-slate-700"
      >
        {backView ? 'Show front' : 'Show back'}
      </button>
    </div>
  )
}
