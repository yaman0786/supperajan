'use client';

import { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { AvatarAnimationState, EmotionState } from '@supperajan/types';
import { AvatarStateMachine, createIdleBehaviorState, updateIdleBehavior } from '@supperajan/avatar';
import { DEFAULT_AVATAR_BEHAVIOR } from '@supperajan/config';
import { LipSyncController } from '@supperajan/avatar/behaviors';

interface RobotAvatarProps {
  animationState: AvatarAnimationState;
  emotionState: EmotionState;
  audioLevel: number;
}

/**
 * Procedurally rendered robot avatar faithfully built from the uploaded reference:
 *  - Rounded orange helmet head (sphere-dominant)
 *  - Concentric-ring glowing blue circular eyes (iconic design)
 *  - Circular chest orb (large, glowing cyan)
 *  - Blue glowing side-ear discs on the helmet
 *  - Two thin silver antennas
 *  - Rounded, compact torso with open-arms welcome pose
 *  - Ball-joint shoulders, rounded arm segments, finger-stub hands
 *  - Rounded leg segments, silver metallic feet
 *
 * Behavior hooks are already wired. A rigged GLB asset can replace the
 * procedural geometry in Phase 4 by swapping the mesh subtree while
 * keeping all animation logic intact.
 */
export function RobotAvatar({ animationState, emotionState, audioLevel }: RobotAvatarProps) {
  const rootRef   = useRef<THREE.Group>(null);
  const bodyRef   = useRef<THREE.Group>(null);
  const headRef   = useRef<THREE.Group>(null);
  const leftArmRef  = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Eye inner-ring refs for glow animation
  const eyeInnerLRef = useRef<THREE.Mesh>(null);
  const eyeInnerRRef = useRef<THREE.Mesh>(null);
  // Chest orb
  const chestOrbRef  = useRef<THREE.Mesh>(null);
  const chestLightRef = useRef<THREE.PointLight>(null);
  // Ear discs
  const earLRef = useRef<THREE.Mesh>(null);
  const earRRef = useRef<THREE.Mesh>(null);
  // Mouth/chin glow strip
  const mouthGlowRef = useRef<THREE.Mesh>(null);

  const stateMachineRef = useRef(new AvatarStateMachine());
  const idleStateRef    = useRef(createIdleBehaviorState(Date.now(), DEFAULT_AVATAR_BEHAVIOR));
  const lipSyncRef      = useRef(new LipSyncController('amplitude'));

  useEffect(() => {
    stateMachineRef.current.transitionTo(animationState);
    stateMachineRef.current.setEmotion(emotionState);
  }, [animationState, emotionState]);

  useEffect(() => {
    lipSyncRef.current.updateFromAmplitude(audioLevel);
  }, [audioLevel]);

  // ─── Shared materials ────────────────────────────────────────────────────
  const mat = useMemo(() => ({
    body: new THREE.MeshStandardMaterial({
      color: '#D4640E',
      metalness: 0.55,
      roughness: 0.38,
      envMapIntensity: 0.7,
    }),
    bodyDark: new THREE.MeshStandardMaterial({
      color: '#A04A08',
      metalness: 0.6,
      roughness: 0.4,
    }),
    helmet: new THREE.MeshStandardMaterial({
      color: '#C45C0C',
      metalness: 0.5,
      roughness: 0.35,
      envMapIntensity: 0.8,
    }),
    visor: new THREE.MeshStandardMaterial({
      color: '#0A0C14',
      metalness: 0.2,
      roughness: 0.05,
      transparent: true,
      opacity: 0.95,
    }),
    eyeOuter: new THREE.MeshStandardMaterial({
      color: '#0A0C14',
      metalness: 0.1,
      roughness: 0.1,
    }),
    eyeRing: new THREE.MeshStandardMaterial({
      color: '#4DD8FF',
      emissive: '#00BFFF',
      emissiveIntensity: 1.2,
      metalness: 0.1,
      roughness: 0.1,
    }),
    eyeInner: new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: '#80EAFF',
      emissiveIntensity: 2.0,
      metalness: 0.0,
      roughness: 0.0,
    }),
    chestOrb: new THREE.MeshStandardMaterial({
      color: '#00CFFF',
      emissive: '#00BFFF',
      emissiveIntensity: 1.5,
      transparent: true,
      opacity: 0.92,
      metalness: 0.05,
      roughness: 0.05,
    }),
    ear: new THREE.MeshStandardMaterial({
      color: '#00BFFF',
      emissive: '#00BFFF',
      emissiveIntensity: 1.4,
      transparent: true,
      opacity: 0.9,
      metalness: 0.1,
      roughness: 0.1,
    }),
    earFrame: new THREE.MeshStandardMaterial({
      color: '#1A1A2A',
      metalness: 0.7,
      roughness: 0.3,
    }),
    mouthGlow: new THREE.MeshStandardMaterial({
      color: '#00BFFF',
      emissive: '#00BFFF',
      emissiveIntensity: 1.0,
      transparent: true,
      opacity: 0.85,
    }),
    silver: new THREE.MeshStandardMaterial({
      color: '#7A8090',
      metalness: 0.85,
      roughness: 0.2,
    }),
    joint: new THREE.MeshStandardMaterial({
      color: '#2A2E3A',
      metalness: 0.7,
      roughness: 0.35,
    }),
    antennaPole: new THREE.MeshStandardMaterial({
      color: '#9090A0',
      metalness: 0.9,
      roughness: 0.15,
    }),
    stripe: new THREE.MeshStandardMaterial({
      color: '#C8B880',
      metalness: 0.6,
      roughness: 0.3,
    }),
  }), []);

  useFrame((_, delta) => {
    if (!rootRef.current) return;
    const now = Date.now();
    const currentState = stateMachineRef.current.getCurrentAnimationState();

    // ── Idle behavior ─────────────────────────────────────────────────────
    const { state: newIdle, breathOffset, swayX, shouldBlink } =
      updateIdleBehavior(idleStateRef.current, DEFAULT_AVATAR_BEHAVIOR, now);
    idleStateRef.current = newIdle;

    // Gentle floating
    rootRef.current.position.y = breathOffset * 6;
    rootRef.current.rotation.z = swayX * 0.2;

    // ── Head movement by state ─────────────────────────────────────────────
    if (headRef.current) {
      let tRx = 0, tRy = 0, tRz = 0;
      switch (currentState) {
        case 'thinking':
          tRx = 0.06; tRy = Math.sin(now * 0.0007) * 0.07; break;
        case 'listening':
          tRz = 0.07; tRy = -0.05; break;
        case 'curious':
          tRz = 0.12; tRy = Math.sin(now * 0.0009) * 0.06; break;
        case 'surprised':
          tRx = -0.14; break;
        case 'happy':
          tRx = -0.04; tRy = Math.sin(now * 0.0018) * 0.05; break;
        case 'empathetic':
          tRz = 0.07; tRx = 0.03; break;
        case 'excited':
          tRy = Math.sin(now * 0.004) * 0.12; break;
      }
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, tRx, delta * 3.5);
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, tRy, delta * 3.5);
      headRef.current.rotation.z = THREE.MathUtils.lerp(headRef.current.rotation.z, tRz, delta * 3.5);
    }

    // ── Arms: open-arms idle, gesture on emotion ──────────────────────────
    if (leftArmRef.current && rightArmRef.current) {
      let lArmRz = -0.55; // open-arm resting pose (mirroring the reference)
      let rArmRz =  0.55;
      let lArmRx = 0;
      let rArmRx = 0;

      switch (currentState) {
        case 'happy': case 'excited':
          lArmRz = -0.75 + Math.sin(now * 0.003) * 0.1;
          rArmRz =  0.75 - Math.sin(now * 0.003) * 0.1;
          break;
        case 'empathetic':
          lArmRz = -0.3; rArmRz = 0.3; lArmRx = 0.2; rArmRx = 0.2; break;
        case 'thinking':
          lArmRz = -0.2; rArmRz = 0.1; rArmRx = -0.6; break;
        case 'waving':
          lArmRz = -1.1 + Math.sin(now * 0.006) * 0.25; rArmRz = 0.55; break;
      }
      leftArmRef.current.rotation.z  = THREE.MathUtils.lerp(leftArmRef.current.rotation.z,  lArmRz, delta * 4);
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, rArmRz, delta * 4);
      leftArmRef.current.rotation.x  = THREE.MathUtils.lerp(leftArmRef.current.rotation.x,  lArmRx, delta * 4);
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, rArmRx, delta * 4);
    }

    // ── Eye glow ──────────────────────────────────────────────────────────
    if (eyeInnerLRef.current && eyeInnerRRef.current) {
      let targetEI = 2.0;
      if      (currentState === 'listening')  targetEI = 3.5 + Math.sin(now * 0.005) * 0.8;
      else if (currentState === 'thinking')   targetEI = 1.6 + Math.sin(now * 0.003) * 0.5;
      else if (currentState === 'alert')      targetEI = 4.0 + Math.sin(now * 0.012) * 1.0;
      else if (currentState === 'excited')    targetEI = 3.5;
      else if (currentState === 'happy')      targetEI = 3.0;
      else if (currentState === 'sleeping')   targetEI = 0.1;

      const blinkY = shouldBlink ? 0.04 : 1.0;
      eyeInnerLRef.current.scale.y = THREE.MathUtils.lerp(eyeInnerLRef.current.scale.y, blinkY, delta * 25);
      eyeInnerRRef.current.scale.y = THREE.MathUtils.lerp(eyeInnerRRef.current.scale.y, blinkY, delta * 25);

      const m = eyeInnerLRef.current.material as THREE.MeshStandardMaterial;
      const m2 = eyeInnerRRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity  = THREE.MathUtils.lerp(m.emissiveIntensity,  targetEI, delta * 5);
      m2.emissiveIntensity = THREE.MathUtils.lerp(m2.emissiveIntensity, targetEI, delta * 5);

      // Outer ring matches
      const rm = mat.eyeRing;
      rm.emissiveIntensity = THREE.MathUtils.lerp(rm.emissiveIntensity, targetEI * 0.65, delta * 4);
    }

    // ── Ear glow ──────────────────────────────────────────────────────────
    if (earLRef.current && earRRef.current) {
      let earEI = 1.4;
      if (currentState === 'listening') earEI = 2.5 + Math.sin(now * 0.004) * 0.5;
      if (currentState === 'alert')     earEI = 3.0;
      if (currentState === 'sleeping')  earEI = 0.1;
      const em = earLRef.current.material as THREE.MeshStandardMaterial;
      const em2 = earRRef.current.material as THREE.MeshStandardMaterial;
      em.emissiveIntensity  = THREE.MathUtils.lerp(em.emissiveIntensity,  earEI, delta * 4);
      em2.emissiveIntensity = THREE.MathUtils.lerp(em2.emissiveIntensity, earEI, delta * 4);
    }

    // ── Chest orb ──────────────────────────────────────────────────────────
    if (chestOrbRef.current && chestLightRef.current) {
      let speed = 0.5, base = 1.2, peak = 2.0;
      switch (currentState) {
        case 'listening': speed = 2.0; base = 1.5; peak = 2.8; break;
        case 'thinking':  speed = 1.1; base = 1.2; peak = 2.0; break;
        case 'speaking':  speed = audioLevel * 10 + 1.5; base = 1.6; peak = 3.0; break;
        case 'excited':   speed = 4.0; base = 1.8; peak = 3.2; break;
        case 'alert':     speed = 6.0; base = 1.8; peak = 3.5; break;
        case 'sleeping':  speed = 0.2; base = 0.1; peak = 0.2; break;
        case 'happy':     speed = 1.5; base = 1.5; peak = 2.5; break;
      }
      const pulse = (Math.sin(now * speed * 0.001 * Math.PI * 2) + 1) / 2;
      const orbEI = base + pulse * (peak - base);
      const orbM = chestOrbRef.current.material as THREE.MeshStandardMaterial;
      orbM.emissiveIntensity = orbEI;
      chestLightRef.current.intensity = orbEI * 0.6;
    }

    // ── Mouth glow ────────────────────────────────────────────────────────
    if (mouthGlowRef.current) {
      let mEI = currentState === 'speaking' ? 1.8 + audioLevel * 3 : 0.7;
      if (currentState === 'happy' || currentState === 'excited') mEI = 1.4;
      const mm = mouthGlowRef.current.material as THREE.MeshStandardMaterial;
      mm.emissiveIntensity = THREE.MathUtils.lerp(mm.emissiveIntensity, mEI, delta * 6);
    }

    // Lip sync
    lipSyncRef.current.updateFromAmplitude(audioLevel);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Scene graph (matches the reference image geometry)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <group ref={rootRef} position={[0, -0.6, 0]}>

      {/* ── TORSO ───────────────────────────────────────────────────────── */}
      <group ref={bodyRef} position={[0, 0, 0]}>
        {/* Main torso — rounded box */}
        <mesh material={mat.body} castShadow>
          <boxGeometry args={[0.72, 0.82, 0.5, 3, 3, 3]} />
        </mesh>
        {/* Torso front bevel/trim — the heart-shaped chest plate */}
        <mesh position={[0, 0.05, 0.252]} material={mat.bodyDark}>
          <boxGeometry args={[0.5, 0.6, 0.01]} />
        </mesh>

        {/* ── CHEST ORB (large cyan circle) ───────────────────────────── */}
        <mesh ref={chestOrbRef} position={[0, 0.06, 0.27]} material={mat.chestOrb} castShadow>
          <sphereGeometry args={[0.155, 32, 32]} />
        </mesh>
        {/* Orb frame ring */}
        <mesh position={[0, 0.06, 0.262]}>
          <torusGeometry args={[0.162, 0.018, 12, 48]} />
          <primitive object={mat.joint} />
        </mesh>
        <pointLight
          ref={chestLightRef}
          position={[0, 0.06, 0.7]}
          color="#00CFFF"
          intensity={1.0}
          distance={2.5}
          decay={2}
        />

        {/* ── SHOULDER CONNECTORS (ball joints) ───────────────────────── */}
        <mesh position={[-0.42, 0.32, 0]} material={mat.joint} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
        </mesh>
        <mesh position={[0.42, 0.32, 0]} material={mat.joint} castShadow>
          <sphereGeometry args={[0.1, 16, 16]} />
        </mesh>

        {/* ── LEFT ARM ─────────────────────────────────────────────────── */}
        <group ref={leftArmRef} position={[-0.46, 0.28, 0]} rotation={[0, 0, -0.55]}>
          {/* Upper arm */}
          <mesh position={[0, -0.22, 0]} material={mat.body} castShadow>
            <capsuleGeometry args={[0.1, 0.28, 8, 16]} />
          </mesh>
          {/* Elbow joint */}
          <mesh position={[0, -0.46, 0]} material={mat.joint}>
            <sphereGeometry args={[0.095, 12, 12]} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -0.65, 0]} material={mat.body} castShadow>
            <capsuleGeometry args={[0.085, 0.22, 8, 16]} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.88, 0]} material={mat.body} castShadow>
            <sphereGeometry args={[0.1, 12, 12]} />
          </mesh>
          {/* Finger stubs (3 per hand, as in reference) */}
          {[-0.06, 0, 0.06].map((x, i) => (
            <mesh key={i} position={[x, -1.0, 0.04]} material={mat.bodyDark}>
              <capsuleGeometry args={[0.022, 0.07, 4, 8]} />
            </mesh>
          ))}
        </group>

        {/* ── RIGHT ARM ────────────────────────────────────────────────── */}
        <group ref={rightArmRef} position={[0.46, 0.28, 0]} rotation={[0, 0, 0.55]}>
          <mesh position={[0, -0.22, 0]} material={mat.body} castShadow>
            <capsuleGeometry args={[0.1, 0.28, 8, 16]} />
          </mesh>
          <mesh position={[0, -0.46, 0]} material={mat.joint}>
            <sphereGeometry args={[0.095, 12, 12]} />
          </mesh>
          <mesh position={[0, -0.65, 0]} material={mat.body} castShadow>
            <capsuleGeometry args={[0.085, 0.22, 8, 16]} />
          </mesh>
          <mesh position={[0, -0.88, 0]} material={mat.body} castShadow>
            <sphereGeometry args={[0.1, 12, 12]} />
          </mesh>
          {[-0.06, 0, 0.06].map((x, i) => (
            <mesh key={i} position={[x, -1.0, 0.04]} material={mat.bodyDark}>
              <capsuleGeometry args={[0.022, 0.07, 4, 8]} />
            </mesh>
          ))}
        </group>

        {/* ── HIP CONNECTOR ────────────────────────────────────────────── */}
        <mesh position={[0, -0.46, 0]} material={mat.joint}>
          <boxGeometry args={[0.5, 0.12, 0.36]} />
        </mesh>

        {/* ── LEGS ─────────────────────────────────────────────────────── */}
        {/* Left leg */}
        <mesh position={[-0.18, -0.72, 0]} material={mat.body} castShadow>
          <capsuleGeometry args={[0.115, 0.28, 8, 16]} />
        </mesh>
        {/* Left knee joint */}
        <mesh position={[-0.18, -0.94, 0]} material={mat.joint}>
          <sphereGeometry args={[0.1, 12, 12]} />
        </mesh>
        {/* Left shin */}
        <mesh position={[-0.18, -1.16, 0]} material={mat.body} castShadow>
          <capsuleGeometry args={[0.1, 0.22, 8, 16]} />
        </mesh>
        {/* Right leg */}
        <mesh position={[0.18, -0.72, 0]} material={mat.body} castShadow>
          <capsuleGeometry args={[0.115, 0.28, 8, 16]} />
        </mesh>
        <mesh position={[0.18, -0.94, 0]} material={mat.joint}>
          <sphereGeometry args={[0.1, 12, 12]} />
        </mesh>
        <mesh position={[0.18, -1.16, 0]} material={mat.body} castShadow>
          <capsuleGeometry args={[0.1, 0.22, 8, 16]} />
        </mesh>

        {/* ── FEET (silver, wider, as in reference) ────────────────────── */}
        <mesh position={[-0.18, -1.37, 0.06]} material={mat.silver} castShadow>
          <boxGeometry args={[0.26, 0.12, 0.36]} />
        </mesh>
        <mesh position={[0.18, -1.37, 0.06]} material={mat.silver} castShadow>
          <boxGeometry args={[0.26, 0.12, 0.36]} />
        </mesh>
      </group>

      {/* ── NECK ─────────────────────────────────────────────────────────── */}
      <mesh position={[0, 0.46, 0]} material={mat.joint}>
        <cylinderGeometry args={[0.1, 0.13, 0.12, 16]} />
      </mesh>

      {/* ── HEAD GROUP ───────────────────────────────────────────────────── */}
      <group ref={headRef} position={[0, 0.86, 0]}>

        {/* Helmet — dominant sphere shape (reference has oval/rounded helmet) */}
        <mesh material={mat.helmet} castShadow>
          <sphereGeometry args={[0.42, 40, 40]} />
        </mesh>

        {/* Crown stripe (the gold/tan band across the top of the reference) */}
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.3, 0.035, 8, 48, Math.PI]} />
          <primitive object={mat.stripe} />
        </mesh>

        {/* ── VISOR PANEL (black inset) ────────────────────────────────── */}
        <mesh position={[0, -0.02, 0.36]} material={mat.visor}>
          <boxGeometry args={[0.6, 0.28, 0.04]} />
        </mesh>

        {/* ── LEFT EYE (concentric rings) ──────────────────────────────── */}
        <group position={[-0.165, 0.0, 0.37]}>
          {/* Outer dark socket */}
          <mesh material={mat.eyeOuter}>
            <circleGeometry args={[0.1, 32]} />
          </mesh>
          {/* Outer glow ring */}
          <mesh position={[0, 0, 0.005]}>
            <torusGeometry args={[0.085, 0.016, 8, 32]} />
            <primitive object={mat.eyeRing} />
          </mesh>
          {/* Middle ring */}
          <mesh position={[0, 0, 0.008]}>
            <torusGeometry args={[0.052, 0.011, 8, 32]} />
            <primitive object={mat.eyeRing} />
          </mesh>
          {/* Inner bright core — blinks */}
          <mesh ref={eyeInnerLRef} position={[0, 0, 0.012]} material={mat.eyeInner}>
            <circleGeometry args={[0.028, 24]} />
          </mesh>
          {/* Eye point light */}
          <pointLight position={[0, 0, 0.3]} color="#00BFFF" intensity={1.0} distance={1.8} decay={2} />
        </group>

        {/* ── RIGHT EYE (concentric rings) ─────────────────────────────── */}
        <group position={[0.165, 0.0, 0.37]}>
          <mesh material={mat.eyeOuter}>
            <circleGeometry args={[0.1, 32]} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <torusGeometry args={[0.085, 0.016, 8, 32]} />
            <primitive object={mat.eyeRing} />
          </mesh>
          <mesh position={[0, 0, 0.008]}>
            <torusGeometry args={[0.052, 0.011, 8, 32]} />
            <primitive object={mat.eyeRing} />
          </mesh>
          <mesh ref={eyeInnerRRef} position={[0, 0, 0.012]} material={mat.eyeInner}>
            <circleGeometry args={[0.028, 24]} />
          </mesh>
          <pointLight position={[0, 0, 0.3]} color="#00BFFF" intensity={1.0} distance={1.8} decay={2} />
        </group>

        {/* ── MOUTH / CHIN GLOW (curved strip below visor) ─────────────── */}
        <mesh ref={mouthGlowRef} position={[0, -0.19, 0.39]} material={mat.mouthGlow}>
          <boxGeometry args={[0.22, 0.032, 0.015]} />
        </mesh>

        {/* ── EAR DISCS (blue glowing side pieces) ─────────────────────── */}
        {/* Left ear frame */}
        <mesh position={[-0.42, 0.0, 0.0]} rotation={[0, Math.PI / 2, 0]} material={mat.earFrame}>
          <cylinderGeometry args={[0.115, 0.115, 0.06, 24]} />
        </mesh>
        {/* Left ear glow disc */}
        <mesh ref={earLRef} position={[-0.455, 0.0, 0.0]} rotation={[0, Math.PI / 2, 0]} material={mat.ear}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 24]} />
        </mesh>
        <pointLight position={[-0.6, 0, 0]} color="#00BFFF" intensity={0.6} distance={1.2} decay={2} />

        {/* Right ear frame */}
        <mesh position={[0.42, 0.0, 0.0]} rotation={[0, Math.PI / 2, 0]} material={mat.earFrame}>
          <cylinderGeometry args={[0.115, 0.115, 0.06, 24]} />
        </mesh>
        {/* Right ear glow disc */}
        <mesh ref={earRRef} position={[0.455, 0.0, 0.0]} rotation={[0, Math.PI / 2, 0]} material={mat.ear}>
          <cylinderGeometry args={[0.09, 0.09, 0.02, 24]} />
        </mesh>
        <pointLight position={[0.6, 0, 0]} color="#00BFFF" intensity={0.6} distance={1.2} decay={2} />

        {/* ── ANTENNAS (two thin rods, as in reference) ─────────────────── */}
        {/* Left antenna */}
        <mesh position={[-0.16, 0.52, 0]} material={mat.antennaPole} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
        </mesh>
        <mesh position={[-0.16, 0.69, 0]} material={mat.silver}>
          <sphereGeometry args={[0.022, 8, 8]} />
        </mesh>
        {/* Right antenna */}
        <mesh position={[0.16, 0.52, 0]} material={mat.antennaPole} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.32, 8]} />
        </mesh>
        <mesh position={[0.16, 0.69, 0]} material={mat.silver}>
          <sphereGeometry args={[0.022, 8, 8]} />
        </mesh>
      </group>

      {/* ── GROUND SHADOW ────────────────────────────────────────────────── */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[4, 4]} />
        <shadowMaterial opacity={0.22} />
      </mesh>
    </group>
  );
}
