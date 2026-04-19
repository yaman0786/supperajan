'use client';

import { Suspense, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Stars } from '@react-three/drei';
import { RobotAvatar } from './RobotAvatar';
import { useAssistantStore } from '@/store/assistant.store';

/**
 * 3D scene container for the robot avatar.
 *
 * Camera: slightly elevated, zoomed to a comfortable portrait view.
 * Performance: DPR capped at 2 to prevent over-rendering on high-density displays.
 * Background: transparent, falls through to the CSS gradient background.
 */
export function AvatarStage() {
  const avatarState = useAssistantStore((s) => s.avatarState);
  const emotionState = useAssistantStore((s) => s.emotionState);
  const audioLevel = useAssistantStore((s) => s.audioLevel);

  return (
    <div className="relative h-full w-full" aria-label="3D avatar stage">
      <Canvas
        camera={{ position: [0, 0.2, 4], fov: 40, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
        gl={{ antialias: true, alpha: true }}
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>
          {/* Ambient + directional lighting */}
          <ambientLight intensity={0.3} color="#1a1f2e" />
          <directionalLight
            position={[2, 3, 2]}
            intensity={1.2}
            color="#fff8f0"
            castShadow
          />
          <pointLight
            position={[-2, 1, 1]}
            intensity={0.4}
            color="#e8611a"
          />
          <pointLight
            position={[-1, 2, -3]}
            intensity={0.6}
            color="#00bfff"
          />

          {/* Background stars for atmosphere */}
          <Stars
            radius={80}
            depth={40}
            count={800}
            factor={3}
            saturation={0}
            fade
            speed={0.3}
          />

          {/* The robot avatar */}
          <RobotAvatar
            animationState={avatarState}
            emotionState={emotionState}
            audioLevel={audioLevel}
          />

          {/* Orbit controls — limited to gentle horizontal rotation on desktop */}
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI * 0.35}
            maxPolarAngle={Math.PI * 0.65}
            minAzimuthAngle={-Math.PI * 0.2}
            maxAzimuthAngle={Math.PI * 0.2}
            rotateSpeed={0.3}
            target={[0, 0.1, 0]}
          />

          {/* Environment preset for reflections */}
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* Voice activity ring overlay */}
      {audioLevel > 0.02 && (
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-400 opacity-40"
          style={{
            width: `${220 + audioLevel * 200}px`,
            height: `${220 + audioLevel * 200}px`,
            transition: 'width 0.05s, height 0.05s',
          }}
        />
      )}
    </div>
  );
}
