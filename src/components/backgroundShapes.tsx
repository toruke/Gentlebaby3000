import React, { useEffect } from 'react';
import { View, StyleProp, ViewStyle, Dimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

interface BackgroundShapesProps {
  style?: StyleProp<ViewStyle>;
}

const BackgroundShapes: React.FC<BackgroundShapesProps> = ({ style }) => {
  const progress1 = useSharedValue(0);
  const progress2 = useSharedValue(0);
  const progress3 = useSharedValue(0);

  useEffect(() => {
    progress1.value = withRepeat(withTiming(1, { duration: 14000 }), -1, true);
    progress2.value = withRepeat(withTiming(1, { duration: 16000 }), -1, true);
    progress3.value = withRepeat(withTiming(1, { duration: 18000 }), -1, true);
  }, [progress1, progress2, progress3]);

  const animatedStyle1 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress1.value, [0, 1], [-5, 5]) },
      { translateY: interpolate(progress1.value, [0, 1], [-12, 12]) },
      { scale: interpolate(progress1.value, [0, 1], [1, 1.05]) },
    ],
  }));

  const animatedStyle2 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress2.value, [0, 1], [5, -5]) },
      { translateY: interpolate(progress2.value, [0, 1], [10, -10]) },
      { scale: interpolate(progress2.value, [0, 1], [1.02, 0.98]) },
    ],
  }));

  const animatedStyle3 = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(progress3.value, [0, 1], [-8, 8]) },
      { scale: interpolate(progress3.value, [0, 1], [1, 1.03]) },
    ],
  }));

  const animatedStyle4 = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(progress1.value, [0, 1], [-10, 10]) },
      { translateY: interpolate(progress1.value, [0, 1], [5, -5]) },
      { scale: interpolate(progress1.value, [0, 1], [1, 1.02]) },
    ],
  }));

  return (
    <View style={[{ flex: 1 }, style]}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, animatedStyle1]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path
            d="M50 150 Q20 60 130 40 Q260 30 280 120 Q300 200 200 230 Q100 260 50 150 Z"
            fill="#C8E6FF"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, animatedStyle2]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path
            d="M100 400 Q50 300 200 320 Q350 340 360 460 Q370 580 240 560 Q150 540 100 400 Z"
            fill="#FFD6E0"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', top: 0, left: 0 }, animatedStyle3]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path
            d="M250 650 Q220 600 300 580 Q380 560 390 640 Q400 720 320 740 Q260 750 250 650 Z"
            fill="#D4F0FF"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>

      <Animated.View style={[{ position: 'absolute', bottom: 0, left: 0 }, animatedStyle4]}>
        <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <Path
            d="M50 700 Q30 650 120 640 Q200 630 180 700 Q160 760 80 750 Q40 740 50 700 Z"
            fill="#FFD6E0"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>
    </View>
  );
};

export default BackgroundShapes;