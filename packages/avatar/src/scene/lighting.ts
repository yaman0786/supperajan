/**
 * Lighting configuration presets for the avatar scene.
 * Designed to give the robot that warm orange-metallic body with
 * cool blue eye/chest glow contrast against a dark background.
 */

export interface LightingConfig {
  ambientIntensity: number;
  ambientColor: string;
  keyLightIntensity: number;
  keyLightColor: string;
  keyLightPosition: [number, number, number];
  fillLightIntensity: number;
  fillLightColor: string;
  fillLightPosition: [number, number, number];
  rimLightIntensity: number;
  rimLightColor: string;
  rimLightPosition: [number, number, number];
  eyePointLightIntensity: number;
  eyePointLightColor: string;
  eyePointLightDistance: number;
}

export const AVATAR_LIGHTING_PRESETS = {
  default: {
    ambientIntensity: 0.3,
    ambientColor: '#1a1f2e',
    keyLightIntensity: 1.2,
    keyLightColor: '#fff8f0',
    keyLightPosition: [2, 3, 2] as [number, number, number],
    fillLightIntensity: 0.4,
    fillLightColor: '#e8611a',
    fillLightPosition: [-2, 1, 1] as [number, number, number],
    rimLightIntensity: 0.6,
    rimLightColor: '#00bfff',
    rimLightPosition: [-1, 2, -3] as [number, number, number],
    eyePointLightIntensity: 0.8,
    eyePointLightColor: '#00bfff',
    eyePointLightDistance: 1.5,
  } satisfies LightingConfig,

  speaking: {
    ambientIntensity: 0.35,
    ambientColor: '#1a1f2e',
    keyLightIntensity: 1.4,
    keyLightColor: '#fff8f0',
    keyLightPosition: [2, 3, 2] as [number, number, number],
    fillLightIntensity: 0.5,
    fillLightColor: '#e8611a',
    fillLightPosition: [-2, 1, 1] as [number, number, number],
    rimLightIntensity: 0.8,
    rimLightColor: '#00bfff',
    rimLightPosition: [-1, 2, -3] as [number, number, number],
    eyePointLightIntensity: 1.2,
    eyePointLightColor: '#00bfff',
    eyePointLightDistance: 2.0,
  } satisfies LightingConfig,

  thinking: {
    ambientIntensity: 0.25,
    ambientColor: '#141929',
    keyLightIntensity: 0.9,
    keyLightColor: '#e0e8ff',
    keyLightPosition: [2, 3, 2] as [number, number, number],
    fillLightIntensity: 0.3,
    fillLightColor: '#e8611a',
    fillLightPosition: [-2, 1, 1] as [number, number, number],
    rimLightIntensity: 0.9,
    rimLightColor: '#00bfff',
    rimLightPosition: [-1, 2, -3] as [number, number, number],
    eyePointLightIntensity: 1.0,
    eyePointLightColor: '#00bfff',
    eyePointLightDistance: 1.8,
  } satisfies LightingConfig,
} as const;

export type LightingPreset = keyof typeof AVATAR_LIGHTING_PRESETS;
