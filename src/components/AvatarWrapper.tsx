import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AvatarState, AvatarConfig } from '../types';
import Avatar2D from './Avatar2D';
import Avatar3D from './Avatar3D';

interface AvatarWrapperProps {
  state: AvatarState;
  isAnimating?: boolean;
  config?: AvatarConfig;
}

/**
 * Avatar Wrapper Component
 * Switches between 2D and 3D avatar based on configuration
 */
const AvatarWrapper: React.FC<AvatarWrapperProps> = ({
  state,
  isAnimating = false,
  config = { use3D: false, fallbackTo2D: true },
}) => {
  const [use3D, setUse3D] = React.useState(config.use3D);
  const [modelLoadError, setModelLoadError] = React.useState(false);

  // If 3D is enabled but model fails to load, fallback to 2D
  const shouldUse2D = !use3D || (modelLoadError && config.fallbackTo2D);

  if (shouldUse2D) {
    return <Avatar2D state={state} isAnimating={isAnimating} />;
  }

  return (
    <View style={styles.container}>
      <Avatar3D
        state={state}
        isAnimating={isAnimating}
        modelPath={config.modelPath}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AvatarWrapper;
