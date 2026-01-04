import React, { useRef, useState, forwardRef, useImperativeHandle, useCallback, useEffect } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';

interface DrawingCanvasProps {
  canvasWidth?: number;
  canvasHeight?: number;
  onCapture?: (uri: string) => void;
}

export interface DrawingCanvasRef {
  clear: () => void;
  capture: () => Promise<string | null>;
  undo: () => void;
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ canvasWidth = 300, canvasHeight = 400, onCapture }, ref) => {
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const viewRef = useRef<View>(null);
    
    // Use refs to store the latest values without causing re-renders
    const pathsRef = useRef<string[]>([]);
    const currentPathRef = useRef('');

    // Keep refs in sync with state
    useEffect(() => {
      pathsRef.current = paths;
    }, [paths]);

    useEffect(() => {
      currentPathRef.current = currentPath;
    }, [currentPath]);

    // Create PanResponder
    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        
        // When touch starts
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const newPath = `M${locationX},${locationY}`;
          currentPathRef.current = newPath;
          setCurrentPath(newPath);
        },
        
        // When finger moves
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          const newPath = `${currentPathRef.current} L${locationX},${locationY}`;
          currentPathRef.current = newPath;
          setCurrentPath(newPath);
        },
        
        // When finger lifts
        onPanResponderRelease: () => {
          if (currentPathRef.current) {
            // Save the completed path
            const completedPath = currentPathRef.current;
            const newPaths = [...pathsRef.current, completedPath];
            
            setPaths(newPaths);
            pathsRef.current = newPaths;
            
            // Clear current path
            currentPathRef.current = '';
            setCurrentPath('');
          }
        },
      })
    ).current;

    // Clear all paths
    const clear = useCallback(() => {
      setPaths([]);
      setCurrentPath('');
      pathsRef.current = [];
      currentPathRef.current = '';
    }, []);

    // Undo last path
    const undo = useCallback(() => {
      if (pathsRef.current.length > 0) {
        const newPaths = pathsRef.current.slice(0, -1);
        setPaths(newPaths);
        pathsRef.current = newPaths;
      }
    }, []);

    // Capture canvas as image
    const capture = useCallback(async (): Promise<string | null> => {
      try {
        if (viewRef.current) {
          const uri = await captureRef(viewRef, {
            format: 'png',
            quality: 1.0,
          });
          
          if (onCapture) {
            onCapture(uri);
          }
          return uri;
        }
        return null;
      } catch (error) {
        console.error('Error capturing image:', error);
        return null;
      }
    }, [onCapture]);

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      clear,
      capture,
      undo,
    }), [clear, capture, undo]);

    return (
      <View
        ref={viewRef}
        style={[styles.container, { width: canvasWidth, height: canvasHeight }]}
      >
        <View
          style={[styles.canvas, { width: canvasWidth, height: canvasHeight }]}
          {...panResponder.panHandlers}
        >
          <Svg height={canvasHeight} width={canvasWidth}>
            {/* Render all completed paths */}
            {paths.map((path, index) => (
              <Path
                key={`path-${index}`}
                d={path}
                stroke="black"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            
            {/* Render current path being drawn */}
            {currentPath && (
              <Path
                d={currentPath}
                stroke="black"
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
          </Svg>
        </View>
      </View>
    );
  }
);

DrawingCanvas.displayName = 'DrawingCanvas';

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  canvas: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
  },
});

export default DrawingCanvas;