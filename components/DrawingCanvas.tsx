import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
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
}

const DrawingCanvas = forwardRef<DrawingCanvasRef, DrawingCanvasProps>(
  ({ canvasWidth = 300, canvasHeight = 400, onCapture }, ref) => {
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState('');
    const viewRef = useRef<View>(null);

    const panResponder = useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentPath(`M${locationX},${locationY}`);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          setCurrentPath((prevPath) => `${prevPath} L${locationX},${locationY}`);
        },
        onPanResponderRelease: () => {
          if (currentPath) {
            setPaths([...paths, currentPath]);
            setCurrentPath('');
          }
        },
      })
    ).current;

    const clear = () => {
      setPaths([]);
      setCurrentPath('');
    };

    const capture = async (): Promise<string | null> => {
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
    };

    useImperativeHandle(ref, () => ({
      clear,
      capture,
    }));

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