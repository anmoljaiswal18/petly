// components/CardStack.tsx
import React, { useState } from "react";
import { Dimensions, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    interpolate, runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring, withTiming
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const SWIPE_THRESHOLD = width * 0.25;

export type StackItem<T> = T & { key: string };

export function CardStack<T>({
  data,
  renderItem,
  onSwipe
}: {
  data: StackItem<T>[];
  renderItem: (item: StackItem<T>) => React.ReactNode;
  onSwipe: (item: StackItem<T>, dir: "left"|"right") => void;
}) {
  const [index, setIndex] = useState(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const topItem = data[index];
  const nextItem = data[index + 1];

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      const dir = translateX.value > SWIPE_THRESHOLD ? "right"
               : translateX.value < -SWIPE_THRESHOLD ? "left"
               : null;

      if (dir) {
        const toX = dir === "right" ? width*1.2 : -width*1.2;
        translateX.value = withTiming(toX, { duration: 180 }, () => {
          runOnJS(onDidSwipe)(dir);
        });
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const onDidSwipe = (dir: "left"|"right") => {
    if (!topItem) return;
    onSwipe(topItem, dir);
    translateX.value = 0; translateY.value = 0;
    setIndex((i) => i + 1);
  };

  const topStyle = useAnimatedStyle(() => {
    const rotate = interpolate(translateX.value, [-width, 0, width], [-12, 0, 12]);
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` }
      ]
    };
  });

  const nextStyle = useAnimatedStyle(() => {
    const scale = interpolate(Math.abs(translateX.value), [0, SWIPE_THRESHOLD], [0.95, 1]);
    return { transform: [{ scale }] };
  });

  return (
    <View className="flex-1 items-center justify-center">
      {nextItem && (
        <Animated.View
          style={[{ position: "absolute", width: "90%" }, nextStyle]}
        >
          {renderItem(nextItem)}
        </Animated.View>
      )}

      {topItem ? (
        <GestureDetector gesture={pan}>
          <Animated.View style={[{ width: "90%" }, topStyle]}>
            {renderItem(topItem)}
            <AnimatedOverlay x={translateX} />
          </Animated.View>
        </GestureDetector>
      ) : (
        <Text>No more pets nearby</Text>
      )}
    </View>
  );
}

function AnimatedOverlay({ x }: { x: Animated.SharedValue<number> }) {
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [0, width*0.2], [0, 1])
  }));
  const nopeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(x.value, [-width*0.2, 0], [1, 0])
  }));
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 20, left: 20, right: 20 }}>
      <Animated.Text
        style={[{ fontSize: 24, fontWeight: "800", color: "green" }, likeStyle]}
      >
        FOLLOW
      </Animated.Text>
      <Animated.Text
        style={[{ fontSize: 24, fontWeight: "800", color: "red", alignSelf: "flex-end" }, nopeStyle]}
      >
        REJECT
      </Animated.Text>
    </View>
  );
}
