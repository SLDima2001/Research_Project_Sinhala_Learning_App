import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import DrawingCanvas, { DrawingCanvasRef } from '@/components/DrawingCanvas';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width - 40;

// ⚠️ IMPORTANT: Replace with your computer's IP address
const API_URL = 'http://192.168.1.108:5000/api';

interface Letter {
  id: number;
  character: string;
  romanized: string;
}

interface Result {
  score: number;
  is_correct: boolean;
  confidence: number;
  feedback: string;
  predicted_letter: string;
}

export default function PracticeScreen() {
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const canvasRef = useRef<DrawingCanvasRef>(null);

  useEffect(() => {
    fetchNewLetter();
  }, []);

  const fetchNewLetter = async () => {
    setIsLoading(true);
    setResult(null);
    if (canvasRef.current) {
      canvasRef.current.clear();
    }

    try {
      const response = await fetch(`${API_URL}/get-random-letter?user_id=student1`);
      const data = await response.json();

      if (data.success) {
        setCurrentLetter(data.letter);
        setSessionId(data.session_id);
      } else {
        Alert.alert('දෝෂයකි (Error)', 'අකුර ලබා ගැනීමට නොහැකි විය');
      }
    } catch (error) {
      Alert.alert(
        'සම්බන්ධතා දෝෂයකි (Connection Error)',
        'API සේවාදායකය සමඟ සම්බන්ධ විය නොහැක.\n\nසත්‍යාපනය කරන්න:\n1. Flask API ක්‍රියාත්මක දැයි\n2. ඔබේ දුරකථනය සහ පරිගණකය එකම WiFi තුළ දැයි\n3. API_URL හි IP ලිපිනය නිවැරදි දැයි'
      );
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setResult(null);
  };

  const submitDrawing = async () => {
    if (!canvasRef.current) {
      Alert.alert('දෝෂයකි', 'Canvas not ready');
      return;
    }

    setIsLoading(true);

    try {
      const imageUri = await canvasRef.current.capture();

      if (!imageUri) {
        Alert.alert('දෝෂයකි', 'චිත්‍රය ග්‍රහණය කිරීමට නොහැකි විය');
        setIsLoading(false);
        return;
      }

      // Use fetch to read the file as base64
      const response = await fetch(imageUri);
      const blob = await response.blob();

      // Convert blob to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          const base64Data = result.split(',')[1]; // Remove data:image/png;base64, prefix
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const apiResponse = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          image: `data:image/png;base64,${base64}`,
        }),
      });

      const data = await apiResponse.json();

      if (data.success) {
        setResult(data);

        const scoreEmoji = data.score >= 90 ? '🌟' : data.score >= 75 ? '👍' : '💪';
        Alert.alert(
          `${scoreEmoji} ප්‍රතිඵලය (Result)`,
          `ලකුණු (Score): ${data.score.toFixed(1)}%\n\n${data.feedback}`,
          [
            {
              text: 'නැවත උත්සාහ කරන්න',
              onPress: clearCanvas,
              style: 'cancel'
            },
            {
              text: 'ඊළඟ අකුර',
              onPress: fetchNewLetter
            },
          ]
        );
      } else {
        Alert.alert('දෝෂයකි', data.error || 'ඇගයීමට නොහැකි විය');
      }
    } catch (error) {
      Alert.alert('දෝෂයකි', 'ඉදිරිපත් කිරීමට නොහැකි විය');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4CAF50';
    if (score >= 75) return '#8BC34A';
    if (score >= 60) return '#FFC107';
    return '#FF9800';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>සිංහල අකුරු පුහුණුව</Text>
        <Text style={styles.subtitle}>Sinhala Handwriting Practice</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {isLoading && !currentLetter ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>පූරණය වෙමින්... (Loading...)</Text>
          </View>
        ) : (
          <>
            {currentLetter && (
              <View style={styles.letterDisplay}>
                <Text style={styles.instructionText}>මෙම අකුර ලියන්න:</Text>
                <View style={styles.letterBox}>
                  <Text style={styles.letterText}>{currentLetter.character}</Text>
                </View>
                <Text style={styles.romanizedText}>({currentLetter.romanized})</Text>
              </View>
            )}

            <View style={styles.canvasWrapper}>
              <Text style={styles.canvasLabel}>මෙහි ලියන්න (Draw here):</Text>
              <DrawingCanvas
                ref={canvasRef}
                canvasWidth={CANVAS_SIZE}
                canvasHeight={CANVAS_SIZE}
              />
            </View>

            {result && (
              <View style={[styles.resultContainer, { backgroundColor: getScoreColor(result.score) }]}>
                <Text style={styles.scoreText}>
                  ලකුණු: {result.score.toFixed(1)}%
                </Text>
                <Text style={styles.confidenceText}>
                  විශ්වාසය: {(result.confidence * 100).toFixed(1)}%
                </Text>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearCanvas}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>🗑️ මකන්න</Text>
                <Text style={styles.buttonSubtext}>Clear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton, isLoading && styles.buttonDisabled]}
                onPress={submitDrawing}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>✓ ඉදිරිපත් කරන්න</Text>
                    <Text style={styles.buttonSubtext}>Submit</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.nextButton]}
                onPress={fetchNewLetter}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>→ ඊළඟ</Text>
                <Text style={styles.buttonSubtext}>Next</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#1976D2',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 5,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  letterDisplay: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginTop: 15,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  letterBox: {
    backgroundColor: '#E3F2FD',
    padding: 20,
    borderRadius: 15,
    minWidth: 120,
    alignItems: 'center',
  },
  letterText: {
    fontSize: 100,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  romanizedText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
  canvasWrapper: {
    alignItems: 'center',
    marginVertical: 15,
  },
  canvasLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  resultContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  confidenceText: {
    fontSize: 16,
    color: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 15,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  clearButton: {
    backgroundColor: '#FF6F00',
  },
  submitButton: {
    backgroundColor: '#2E7D32',
  },
  nextButton: {
    backgroundColor: '#1976D2',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 10,
    marginTop: 2,
  },
});