import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { AvatarState, EmotionalTone } from '../types';
import { theme } from '../config/theme';

interface AvatarProps {
  state: AvatarState;
  isAnimating?: boolean;
}

/**
 * 3D Avatar Component
 * Futuristic, metallic body with blue neon details
 * Displays facial expressions, gestures, and lip sync
 */
const Avatar: React.FC<AvatarProps> = ({ state, isAnimating = false }) => {
  const glowAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(1)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Glow animation for neon effect
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimation, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Gesture animations based on state
    if (state.gesture === 'wave') {
      Animated.sequence([
        Animated.timing(rotateAnimation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (state.gesture === 'nod') {
      Animated.sequence([
        Animated.timing(scaleAnimation, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnimation, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.gesture]);

  useEffect(() => {
    // Lip sync animation
    if (state.lipSyncActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnimation, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnimation, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [state.lipSyncActive]);

  const glowOpacity = glowAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const rotateValue = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const getExpressionColor = (): string => {
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
    return colors[state.emotionalTone] || colors.neutral;
  };

  return (
    <View style={styles.container}>
      {/* Glow effect */}
      <Animated.View
        style={[
          styles.glow,
          {
            opacity: glowOpacity,
            backgroundColor: getExpressionColor(),
          },
        ]}
      />

      {/* Main avatar body - Metallic with blue neon */}
      <Animated.View
        style={[
          styles.avatarBody,
          {
            transform: [
              { scale: scaleAnimation },
              { rotate: rotateValue },
            ],
          },
        ]}
      >
        {/* Head */}
        <View style={styles.head}>
          {/* Eyes */}
          <View style={styles.eyesContainer}>
            <View style={[styles.eye, { backgroundColor: getExpressionColor() }]} />
            <View style={[styles.eye, { backgroundColor: getExpressionColor() }]} />
          </View>

          {/* Mouth - changes based on expression */}
          <View style={styles.mouthContainer}>
            {state.expression === 'smile' && <View style={styles.smile} />}
            {state.expression === 'neutral' && <View style={styles.neutralMouth} />}
            {state.expression === 'concerned' && <View style={styles.concernedMouth} />}
            {state.expression === 'excited' && <View style={styles.excitedMouth} />}
            {state.expression === 'thinking' && <View style={styles.thinkingMouth} />}
          </View>
        </View>

        {/* Body with neon lines */}
        <View style={styles.body}>
          <View style={[styles.neonLine, { backgroundColor: theme.custom.neonBlue }]} />
          <View style={[styles.neonLine, { backgroundColor: theme.custom.neonBlue }]} />
          <View style={[styles.neonLine, { backgroundColor: theme.custom.neonBlue }]} />
        </View>

        {/* Listening/Speaking indicator */}
        {state.gesture === 'listening' && (
          <View style={styles.listeningIndicator}>
            <Animated.View
              style={[
                styles.soundWave,
                { opacity: glowOpacity },
              ]}
            />
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  glow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    opacity: 0.3,
  },
  avatarBody: {
    width: 150,
    height: 200,
    alignItems: 'center',
  },
  head: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.custom.metallicGray,
    borderWidth: 3,
    borderColor: theme.custom.neonBlue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.custom.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  eyesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '70%',
    marginBottom: 10,
  },
  eye: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: theme.custom.neonBlue,
  },
  mouthContainer: {
    marginTop: 5,
  },
  smile: {
    width: 40,
    height: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderWidth: 2,
    borderColor: theme.custom.neonBlue,
    borderTopWidth: 0,
  },
  neutralMouth: {
    width: 30,
    height: 3,
    backgroundColor: theme.custom.neonBlue,
  },
  concernedMouth: {
    width: 40,
    height: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 2,
    borderColor: theme.custom.neonBlue,
    borderBottomWidth: 0,
  },
  excitedMouth: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.custom.neonBlue,
  },
  thinkingMouth: {
    width: 25,
    height: 3,
    backgroundColor: theme.custom.neonBlue,
    transform: [{ rotate: '10deg' }],
  },
  body: {
    width: 80,
    height: 100,
    backgroundColor: theme.custom.metallicGray,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: theme.custom.neonBlue,
    marginTop: -10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 15,
  },
  neonLine: {
    width: 60,
    height: 2,
    backgroundColor: theme.custom.neonBlue,
    shadowColor: theme.custom.neonBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  listeningIndicator: {
    position: 'absolute',
    bottom: -20,
    width: 60,
    height: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  soundWave: {
    width: 5,
    height: 15,
    backgroundColor: theme.custom.neonBlue,
    borderRadius: 2.5,
  },
});

export default Avatar;
