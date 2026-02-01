import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer, TextureLoader } from 'expo-three';
import {
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  AnimationMixer,
  Clock,
  Color,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AvatarState, EmotionalTone } from '../types';
import { theme } from '../config/theme';

interface Avatar3DProps {
  state: AvatarState;
  isAnimating?: boolean;
  modelPath?: string; // Path to GLB file
}

/**
 * Avatar3D Component
 * Loads and displays 3D GLB avatar models
 * Supports animations, gestures, and emotional expressions
 */
const Avatar3D: React.FC<Avatar3DProps> = ({
  state,
  isAnimating = false,
  modelPath,
}) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const mixerRef = useRef<AnimationMixer | null>(null);
  const clockRef = useRef(new Clock());
  const sceneRef = useRef<Scene | null>(null);
  const modelRef = useRef<any>(null);

  const getEmotionalColor = (tone: EmotionalTone): string => {
    const colors: Record<EmotionalTone, string> = {
      happy: '#FFD700',
      sad: '#4169E1',
      excited: '#FF1493',
      calm: '#00CED1',
      concerned: '#FF6347',
      neutral: theme.custom.neonBlue,
      empathetic: '#9370DB',
      supportive: '#32CD32',
    };
    return colors[tone] || colors.neutral;
  };

  const onContextCreate = async (gl: any) => {
    // Create renderer
    const renderer = new Renderer({ gl });
    renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background

    // Create scene
    const scene = new Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new PerspectiveCamera(
      75,
      gl.drawingBufferWidth / gl.drawingBufferHeight,
      0.1,
      1000
    );
    camera.position.set(0, 1, 2);
    camera.lookAt(0, 0.5, 0);

    // Add lights
    const ambientLight = new AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 2, 2);
    scene.add(directionalLight);

    // Add neon blue rim light for futuristic look
    const rimLight = new DirectionalLight(new Color(theme.custom.neonBlue), 0.5);
    rimLight.position.set(-1, 1, -1);
    scene.add(rimLight);

    // Load GLB model
    if (modelPath) {
      try {
        const loader = new GLTFLoader();
        const gltf = await new Promise<any>((resolve, reject) => {
          loader.load(
            modelPath,
            (result) => resolve(result),
            undefined,
            (error) => reject(error)
          );
        });

        const model = gltf.scene;
        modelRef.current = model;
        scene.add(model);

        // Setup animations if available
        if (gltf.animations && gltf.animations.length > 0) {
          mixerRef.current = new AnimationMixer(model);
          // Play first animation by default
          const action = mixerRef.current.clipAction(gltf.animations[0]);
          action.play();
        }

        // Center the model
        model.position.set(0, 0, 0);

        setIsModelLoaded(true);
      } catch (error) {
        console.error('Error loading GLB model:', error);
      }
    }

    // Animation loop
    const render = () => {
      requestAnimationFrame(render);

      // Update animations
      if (mixerRef.current) {
        const delta = clockRef.current.getDelta();
        mixerRef.current.update(delta);
      }

      // Apply avatar state transformations
      if (modelRef.current) {
        applyAvatarState(modelRef.current, state);
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    render();
  };

  const applyAvatarState = (model: any, avatarState: AvatarState) => {
    // Apply gesture animations
    switch (avatarState.gesture) {
      case 'wave':
        model.rotation.y = Math.sin(Date.now() * 0.003) * 0.3;
        break;
      case 'nod':
        model.rotation.x = Math.sin(Date.now() * 0.005) * 0.2;
        break;
      case 'idle':
        // Subtle idle animation
        model.position.y = Math.sin(Date.now() * 0.001) * 0.05;
        break;
    }

    // Apply lip sync scale animation
    if (avatarState.lipSyncActive) {
      const scale = 1 + Math.sin(Date.now() * 0.01) * 0.05;
      model.scale.set(scale, scale, scale);
    } else {
      model.scale.set(1, 1, 1);
    }

    // Apply emotional color tint to model materials
    const emotionalColor = new Color(getEmotionalColor(avatarState.emotionalTone));
    model.traverse((child: any) => {
      if (child.isMesh && child.material) {
        // Add subtle color tint based on emotion
        child.material.emissive = emotionalColor;
        child.material.emissiveIntensity = 0.3;
      }
    });
  };

  return (
    <View style={styles.container}>
      <GLView
        style={styles.glView}
        onContextCreate={onContextCreate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glView: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar3D;
