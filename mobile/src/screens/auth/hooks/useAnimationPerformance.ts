/**
 * useAnimationPerformance Hook
 *
 * Real-time FPS monitoring for animations
 * Tracks performance and reports issues when FPS drops below 55fps
 *
 * @requirements Req 13 (Performance Monitoring)
 */

import { useEffect } from 'react';
import {
  useSharedValue,
  useAnimatedReaction,
  runOnJS,
} from 'react-native-reanimated';

/**
 * Performance thresholds
 */
const FPS_THRESHOLD = 55; // Minimum acceptable FPS
const RENDER_TIME_THRESHOLD = 16; // 60fps = 16.67ms per frame

/**
 * Track performance issue (runs on JS thread)
 */
const trackPerformanceIssue = (componentName: string, fps: number) => {
  if (__DEV__) {
    console.warn(
      `[Performance Warning] ${componentName}: FPS dropped to ${fps.toFixed(1)}fps`
    );
  }

  // In production, send to analytics/monitoring service
  // Example: Sentry.captureMessage(`Low FPS: ${componentName} - ${fps}fps`);
};

/**
 * Custom hook for monitoring animation performance
 *
 * @param componentName - Name of the component being monitored
 */
export const useAnimationPerformance = (componentName: string) => {
  const frameCount = useSharedValue(0);
  const lastTime = useSharedValue(performance.now());
  const mountTime = useSharedValue(performance.now());

  useEffect(() => {
    const startTime = performance.now();

    // Monitor render time
    const checkRenderTime = () => {
      const renderTime = performance.now() - startTime;

      if (renderTime > RENDER_TIME_THRESHOLD && __DEV__) {
        console.warn(
          `[Performance Warning] ${componentName}: Render time ${renderTime.toFixed(2)}ms (target: ${RENDER_TIME_THRESHOLD}ms)`
        );
      }
    };

    // Check render time on next frame
    requestAnimationFrame(checkRenderTime);

    return () => {
      const totalTime = performance.now() - mountTime.value;

      if (__DEV__) {
        console.log(
          `[Performance] ${componentName}: Total mount time ${totalTime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName]);

  // Real-time FPS monitoring using animated reaction
  useAnimatedReaction(
    () => frameCount.value,
    (current, previous) => {
      'worklet';

      if (previous !== null) {
        const now = performance.now();
        const deltaTime = now - lastTime.value;

        if (deltaTime > 0) {
          const fps = 1000 / deltaTime;

          // Report if FPS drops below threshold
          if (fps < FPS_THRESHOLD) {
            runOnJS(trackPerformanceIssue)(componentName, fps);
          }
        }

        lastTime.value = now;
      }

      frameCount.value = current + 1;
    }
  );

  // Increment frame count on each render
  useEffect(() => {
    frameCount.value += 1;
  });
};

/**
 * Hook for measuring component mount time
 *
 * @param componentName - Name of the component
 * @param targetTime - Target mount time in milliseconds (default: 500ms)
 */
export const useMountPerformance = (
  componentName: string,
  targetTime: number = 500
) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const mountTime = performance.now() - startTime;

      if (mountTime > targetTime) {
        if (__DEV__) {
          console.warn(
            `[Performance Warning] ${componentName}: Mount time ${mountTime.toFixed(2)}ms exceeded target ${targetTime}ms`
          );
        }
      } else if (__DEV__) {
        console.log(
          `[Performance] ${componentName}: Mount time ${mountTime.toFixed(2)}ms`
        );
      }
    };
  }, [componentName, targetTime]);
};
