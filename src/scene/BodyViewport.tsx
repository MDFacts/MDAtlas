import { Canvas } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { ACESFilmicToneMapping } from 'three'
import { useAssessmentStore } from '../state/assessmentStore'
import { RotateIcon } from '../ui/icons'
import { HumanBody } from './HumanBody'

export function BodyViewport() {
  const toggleView = useAssessmentStore((state) => state.toggleView)
  const backView = useAssessmentStore((state) => state.backView)

  return (
    <div
      className="relative h-full w-full"
      data-testid="body-viewport"
      style={{
        background:
          'radial-gradient(120% 80% at 50% 0%, #ffffff 0%, #eaf2fc 45%, #dbe8f8 100%)',
      }}
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 2.1, 4.6], fov: 40 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          toneMapping: ACESFilmicToneMapping,
        }}
      >
        {/* Studio three-point rig for soft, clinical modeling of the form. */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[4, 7, 5]}
          intensity={2.0}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0002}
        >
          <orthographicCamera attach="shadow-camera" args={[-4, 4, 5, -4, 0.1, 20]} />
        </directionalLight>
        <directionalLight position={[-5, 3, 2]} intensity={0.7} color="#bcd0ff" />
        <directionalLight position={[0, 3, -6]} intensity={1.0} color="#eaf1ff" />

        {/* Local image-based lighting — no external HDR fetch, works offline. */}
        <Environment resolution={256}>
          <Lightformer intensity={2.2} position={[0, 4, 3]} scale={[10, 10, 1]} color="#ffffff" />
          <Lightformer intensity={1.1} position={[-5, 1, 2]} scale={[6, 8, 1]} color="#dce7ff" />
          <Lightformer intensity={1.0} position={[5, 2, 1]} scale={[6, 8, 1]} color="#ffffff" />
          <Lightformer intensity={1.3} position={[0, 2, -5]} scale={[10, 6, 1]} color="#cfe0f5" />
        </Environment>

        <HumanBody />

        <ContactShadows
          position={[0, 0.01, 0]}
          opacity={0.32}
          scale={9}
          blur={2.6}
          far={4}
          resolution={1024}
          color="#1e3a63"
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
        className="no-print glass absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-ink-soft transition hover:text-brand"
      >
        <RotateIcon width={15} height={15} className="text-brand" />
        {backView ? 'Show front' : 'Show back'}
      </button>
    </div>
  )
}
