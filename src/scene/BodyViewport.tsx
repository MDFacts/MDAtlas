import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useAssessmentStore } from '../state/assessmentStore'
import { HumanBody } from './HumanBody'

export function BodyViewport() {
  const toggleView = useAssessmentStore((state) => state.toggleView)
  const backView = useAssessmentStore((state) => state.backView)

  return (
    <div className="relative h-full w-full" data-testid="body-viewport">
      <Canvas camera={{ position: [0, 2.1, 4.4], fov: 42 }} gl={{ preserveDrawingBuffer: true }}>
        <color attach="background" args={['#0b1220']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 6, 5]} intensity={1.1} />
        <directionalLight position={[-4, 3, -4]} intensity={0.35} />
        <HumanBody />
        <OrbitControls
          target={[0, 1.9, 0]}
          enablePan={false}
          minDistance={1.4}
          maxDistance={8}
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
