import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  Dimensions,
  Platform,
  TextInput,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/AuthContext';
import { saveGameScore } from '@/services/progressService';

const { width } = Dimensions.get('window');

const SINHALA_WORDS = [
  'බල්ලා', 'බළලා', 'ගස', 'මල', 'අහස', 'හිරු', 'චන්දය', 'තරු',
  'ගෙදර', 'බස්', 'කාර්', 'පාසල', 'පුටුව', 'මේසය', 'පොත',
  'පන්සල', 'මිනිසා', 'ළමයා', 'එළුවා', 'බුකුටා'
];

// ⚠️ IMPORTANT: REPLACE WITH YOUR COMPUTER'S IP ADDRESS
// To find your IP:
// - Windows: Open CMD and type 'ipconfig', look for IPv4 Address
// - Mac/Linux: Open Terminal and type 'ifconfig', look for inet
// Example: const API_URL = 'http://192.168.1.100:5001';
const API_IP = '192.168.1.108'; // Matches practice.tsx IP
const API_URL = Platform.OS === 'android' && !API_IP.startsWith('192') ? 'http://10.0.2.2:5000' : `http://${API_IP}:5000`;

export default function HomeScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [detectedText, setDetectedText] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'capture' | 'manual_input' | 'processing' | 'result' | 'game'>('capture');
  const [gameWord, setGameWord] = useState('');
  const [gameImage, setGameImage] = useState<string | null>(null);
  const [gameOptions, setGameOptions] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  // Score tracking
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionTotal, setSessionTotal] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  const saveSessionScore = async (correct: number, total: number) => {
    if (!user?.id || total === 0) return;
    await saveGameScore(user.id, {
      module: 'text_to_image',
      score: correct * 10,
      maxScore: total * 10,
      correct,
      total,
      completedAt: new Date().toISOString(),
    });
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading camera...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <ThemedText type="title" style={styles.title}>
            📸 කැමරා අවසර අවශ්‍යයි
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Camera Permission Needed
          </ThemedText>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={requestPermission}
          >
            <ThemedText style={styles.buttonText}>
              අවසර දෙන්න / Grant Permission
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
        });

        if (!photo) {
          Alert.alert('දෝෂයක්', 'Failed to capture photo');
          return;
        }

        setCapturedImage(photo.uri);
        setShowCamera(false);
        processImage(photo.uri);
      } catch (error) {
        Alert.alert('දෝෂයක්', 'Failed to take picture');
        console.error(error);
      }
    }
  };

  const processImage = async (imageUri: string) => {
    setLoading(true);
    setStep('processing');
    setDetectedText('');
    setGeneratedImage(null);
    setConfidence(0);

    try {
      // Use the combined endpoint for better performance
      const formData = new FormData();
      const fileType = imageUri.split('.').pop() || 'jpg';

      formData.append('file', {
        uri: imageUri,
        type: `image/${fileType}`,
        name: `photo.${fileType}`,
      } as any);

      console.log('Sending request to:', `${API_URL}/api/ti/ocr-and-generate`);

      const response = await fetch(`${API_URL}/api/ti/ocr-and-generate`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.success) {
        if (data.error === 'unknown_class') {
          Alert.alert('හඳුනාගත නොහැක', 'මෙම වචනය හඳුනාගත නොහැක. කරුණාකර එය Type කරන්න.\n(Unknown word, please type it manualy)');
          setStep('manual_input');
          setDetectedText('');
          return;
        }
        throw new Error(data.detail || data.error || 'Processing failed');
      }

      // Set detected text and confidence
      setDetectedText(data.detected_text || '');
      setConfidence(data.confidence || 0);

      // Set generated image
      if (data.image) {
        setGeneratedImage(`data:image/jpeg;base64,${data.image}`);
        setStep('result');

        // Show success message
        Alert.alert(
          'සාර්ථකයි! 🎉',
          `හඳුනාගත් වචනය: ${data.detected_text}\nවිශ්වාසය: ${(data.confidence * 100).toFixed(1)}%`
        );
      } else {
        throw new Error('No image generated');
      }

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Processing error:', errorMsg);

      Alert.alert(
        'සම්බන්ධතා දෝෂයක්',
        `Cannot reach server:\n\n` +
        `1. Make sure backend is running\n` +
        `2. Check IP address: ${API_URL}\n` +
        `3. Phone and computer on same WiFi\n\n` +
        `Error: ${errorMsg}`
      );
      setStep('capture');
      setCapturedImage(null);
    } finally {
      setLoading(false);
    }
  };

  const regenerateImage = async () => {
    if (!detectedText.trim()) {
      Alert.alert('අවවාදයයි', 'කරුණාකර වචනයක් ඇතුළත් කරන්න (Please enter a word)');
      return;
    }

    setLoading(true);
    setGeneratedImage(null);

    try {
      console.log('Regenerating for:', detectedText);
      const response = await fetch(`${API_URL}/api/ti/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: detectedText, randomize: true }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      if (data.image) {
        setGeneratedImage(`data:image/jpeg;base64,${data.image}`);
        setStep('result');
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Generation error:', errorMsg);
      Alert.alert(
        'සම්බන්ධතා දෝෂයක්',
        `Image generation failed:\n\n` +
        `1. Make sure backend is running\n` +
        `2. Check IP address: ${API_URL}\n` +
        `Error: ${errorMsg}`
      );
    } finally {
      setLoading(false);
    }
  };

  const startMiniGame = async () => {
    setLoading(true);
    setStep('processing');

    const randomWord = SINHALA_WORDS[Math.floor(Math.random() * SINHALA_WORDS.length)];
    setGameWord(randomWord);

    const others = SINHALA_WORDS.filter(w => w !== randomWord);
    const shuffledOthers = others.sort(() => 0.5 - Math.random()).slice(0, 3);
    const options = [...shuffledOthers, randomWord].sort(() => 0.5 - Math.random());
    setGameOptions(options);
    setGameStatus('playing');

    try {
      console.log('Generating game image for:', randomWord);
      const response = await fetch(`${API_URL}/api/ti/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: randomWord, randomize: true }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      if (data.image) {
        setGameImage(`data:image/jpeg;base64,${data.image}`);
        setStep('game');
      } else {
        throw new Error('No image returned');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      console.error('Game image generation error:', errorMsg);
      Alert.alert('Error', 'Failed to load game. Returning to previous step.');
      setStep('result');
    } finally {
      setLoading(false);
    }
  };

  const handleGameAnswer = (option: string) => {
    if (gameStatus !== 'playing') return;
    const newTotal = sessionTotal + 1;
    if (option === gameWord) {
      setGameStatus('won');
      const newCorrect = sessionCorrect + 1;
      setSessionCorrect(newCorrect);
      setSessionTotal(newTotal);
    } else {
      setGameStatus('lost');
      setSessionTotal(newTotal);
    }
  };

  const handleBackFromGame = async () => {
    await saveSessionScore(sessionCorrect, sessionTotal);
    setStep('result');
  };

  const reset = () => {
    setCapturedImage(null);
    setDetectedText('');
    setGeneratedImage(null);
    setConfidence(0);
    setSessionCorrect(0);
    setSessionTotal(0);
    setStep('manual_input');
  };

  if (showCamera) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.cameraContainer}>
          <CameraView style={styles.camera} ref={cameraRef} facing="back" />
          <ThemedView style={styles.cameraOverlay}>
            <ThemedView style={styles.instructionBox}>
              <ThemedText style={styles.cameraInstruction}>
                📝 කඩදාසියේ ලියා ඇති සිංහල වචනය අනුව කැමරාව සකස් කරන්න
              </ThemedText>
              <ThemedText style={styles.cameraInstructionEn}>
                Align camera with Sinhala text on paper
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.frameGuide} />
          </ThemedView>
          <ThemedView style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={takePicture}
            >
              <ThemedText style={styles.captureButtonIcon}>📷</ThemedText>
              <ThemedText style={styles.captureButtonText}>
                ඡායාරූපය ගන්න
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCamera(false)}
            >
              <ThemedText style={styles.buttonText}>❌ අවලංගු</ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </View>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          සිංහල පෙළ රූප උත්පාදකය
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Sinhala Text to Image Generator
        </ThemedText>

        {step === 'capture' && !capturedImage && (
          <ThemedView style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: '#2563eb' }]}
              onPress={() => {
                setStep('manual_input');
                setDetectedText('');
              }}
            >
              <ThemedText style={styles.buttonText}>
                ⌨️ වචනයක් ලියන්න
              </ThemedText>
              <ThemedText style={styles.buttonSubtext}>
                Type a Word
              </ThemedText>
            </TouchableOpacity>

            <ThemedView style={styles.instructionsCard}>
              <ThemedText type="defaultSemiBold" style={styles.instructionTitle}>
                භාවිතා කරන ආකාරය:
              </ThemedText>
              <ThemedView style={styles.instructionStep}>
                <ThemedText style={styles.stepNumber}>1.</ThemedText>
                <ThemedText style={styles.stepText}>
                  සිංහල වචනයක් යතුරුලියනය කරන්න
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.instructionStep}>
                <ThemedText style={styles.stepNumber}>2.</ThemedText>
                <ThemedText style={styles.stepText}>
                  ඔබගේ රූපය ජනනය වේ!
                </ThemedText>
              </ThemedView>

              <ThemedView style={styles.supportedWordsBox}>
                <ThemedText type="defaultSemiBold" style={styles.supportedWordsTitle}>
                  සහාය දක්වන වචන:
                </ThemedText>
                <ThemedText style={styles.supportedWords}>
                  බල්ලා, බළලා, ගස, මල, අහස, හිරු, චන්දය, තරු, ගෙදර, බස්, කාර්, පාසල, පුටුව, මේසය, පොත, පන්සල, මිනිසා, ළමයා, එළුවා, බුකුටා
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
        )}

        {step === 'manual_input' && (
          <ThemedView style={styles.inputContainer}>
            <ThemedText style={styles.instructionTitle}>සිංහල වචනය ඇතුළත් කරන්න:</ThemedText>
            <TextInput
              style={styles.mainInput}
              value={detectedText}
              onChangeText={setDetectedText}
              placeholder="උදා: ගස"
              placeholderTextColor="#999"
              autoFocus
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.primaryButton, { flex: 1 }]}
                onPress={regenerateImage}
              >
                <ThemedText style={styles.buttonText}>Generate 🎨</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
        )}

        {step === 'processing' && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#9333ea" />
            <ThemedText style={styles.loadingText}>
              සැකසෙමින් පවතී... ✨
            </ThemedText>
            <ThemedText style={styles.loadingSubtext}>
              {gameImage && !detectedText ? 'Loading game...' : detectedText ? 'Generating image...' : 'Recognizing text...'}
            </ThemedText>
          </ThemedView>
        )}



        {detectedText && step !== 'processing' && step !== 'game' && (
          <ThemedView style={styles.resultCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              📝 හඳුනාගත් පෙළ:
            </ThemedText>
            <ThemedView style={styles.detectedTextBox}>
              <TextInput
                style={styles.detectedTextInput}
                value={detectedText}
                onChangeText={setDetectedText}
                placeholder="වචනය මෙහි ලියන්න"
                placeholderTextColor="#666"
              />
              <TouchableOpacity style={styles.regenerateButton} onPress={regenerateImage}>
                <ThemedText style={styles.regenerateButtonText}>🔄 රූපය අලුත් කරන්න</ThemedText>
              </TouchableOpacity>
              <ThemedText style={styles.confidenceText}>
                විශ්වාසය: ${(confidence * 100).toFixed(1)}% (Editing allowed)
              </ThemedText>
            </ThemedView>
          </ThemedView>
        )}

        {generatedImage && step === 'result' && (
          <ThemedView style={styles.resultCard}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              🎨 උත්පාදිත රූපය:
            </ThemedText>
            <Image
              source={{ uri: generatedImage }}
              style={styles.generatedImage}
            />
          </ThemedView>
        )}

        {step === 'game' && gameImage && (
          <ThemedView style={styles.gameWrapper}>
            {/* Always-visible back button + score */}
            <View style={styles.gameHeader}>
              <TouchableOpacity style={styles.gameBackBtn} onPress={handleBackFromGame}>
                <ThemedText style={styles.gameBackText}>← ආපසු</ThemedText>
              </TouchableOpacity>
              <View style={styles.gameScoreBadge}>
                <ThemedText style={styles.gameScoreText}>✅ {sessionCorrect} / {sessionTotal}</ThemedText>
              </View>
            </View>

            <ThemedText type="subtitle" style={styles.gameTitle}>
              🎮 කුඩා ක්‍රීඩාව (Mini Game)
            </ThemedText>
            <ThemedText style={styles.gameInstruction}>
              මෙම රූපය කුමක්දැයි තෝරන්න
            </ThemedText>
            <ThemedText style={styles.gameInstructionEn}>
              (Select the correct word for this image)
            </ThemedText>

            <Image
              source={{ uri: gameImage }}
              style={styles.gamePrimaryImage}
            />

            <View style={styles.optionsGrid}>
              {gameOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    gameStatus !== 'playing' && option === gameWord && styles.correctOption,
                    gameStatus === 'lost' && option !== gameWord && styles.wrongOption,
                  ]}
                  onPress={() => handleGameAnswer(option)}
                >
                  <ThemedText style={styles.optionText}>{option}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {gameStatus === 'won' && (
              <ThemedText style={styles.wonText}>🎉 නිවැරදියි! +10 ලකුණු! (Correct!)</ThemedText>
            )}
            {gameStatus === 'lost' && (
              <ThemedText style={styles.lostText}>😢 වැරදියි. නිවැරදි: {gameWord}</ThemedText>
            )}

            {gameStatus !== 'playing' && (
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                <TouchableOpacity
                  style={[styles.playAgainButton, { flex: 1 }]}
                  onPress={startMiniGame}
                >
                  <ThemedText style={styles.playAgainText}>🔄 තවත් (Try Another)</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.playAgainButton, { flex: 1, backgroundColor: '#64748b' }]}
                  onPress={handleBackFromGame}
                >
                  <ThemedText style={styles.playAgainText}>↩️ ආපසු (Back)</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </ThemedView>
        )}

        {(generatedImage) && !loading && step !== 'game' && (
          <View style={{ gap: 15, marginTop: 20 }}>
            <TouchableOpacity style={styles.gameActionButton} onPress={startMiniGame}>
              <ThemedText style={styles.buttonText}>
                🎮 කුඩා ක්‍රීඩාවක් කරමු
              </ThemedText>
              <ThemedText style={styles.buttonSubtext}>
                Play a Mini Game
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={reset}>
              <ThemedText style={styles.buttonText}>
                🔄 නව රූපයක් උත්පාදනය කරන්න
              </ThemedText>
              <ThemedText style={styles.buttonSubtext}>
                Start Over
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  gameBackBtn: {
    backgroundColor: '#6b7280',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  gameBackText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  gameScoreBadge: {
    backgroundColor: '#9333ea',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  gameScoreText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 30,
  },
  buttonContainer: {
    gap: 20,
  },
  primaryButton: {
    backgroundColor: '#9333ea',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonSubtext: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  instructionsCard: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    padding: 20,
    borderRadius: 16,
    gap: 12,
  },
  instructionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9333ea',
  },
  stepText: {
    fontSize: 16,
    flex: 1,
  },
  supportedWordsBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(147, 51, 234, 0.2)',
  },
  supportedWordsTitle: {
    fontSize: 14,
    marginBottom: 6,
    color: '#9333ea',
  },
  supportedWords: {
    fontSize: 13,
    lineHeight: 20,
    opacity: 0.8,
  },
  cameraContainer: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  instructionBox: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraInstruction: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cameraInstructionEn: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
  frameGuide: {
    borderWidth: 3,
    borderColor: 'white',
    borderStyle: 'dashed',
    borderRadius: 12,
    height: 200,
    opacity: 0.6,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 40,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  captureButton: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 100,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  captureButtonIcon: {
    fontSize: 36,
  },
  captureButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  cancelButton: {
    backgroundColor: '#ef4444',
    padding: 16,
    borderRadius: 50,
    width: 90,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#f97316',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    fontSize: 14,
    opacity: 0.7,
  },
  resultCard: {
    backgroundColor: 'rgba(147, 51, 234, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  detectedTextBox: {
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9333ea',
    alignItems: 'center',
  },
  detectedText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  confidenceText: {
    fontSize: 16,
    opacity: 0.7,
    fontWeight: '600',
  },
  generatedImage: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    resizeMode: 'contain',
  },
  detectedTextInput: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  regenerateButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
  },
  regenerateButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    gap: 20,
    marginTop: 20,
  },
  mainInput: {
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#9333ea',
    borderRadius: 12,
    padding: 16,
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  gameActionButton: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  gameWrapper: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    padding: 16,
    borderRadius: 16,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  gameTitle: {
    fontSize: 22,
    marginBottom: 5,
    color: '#10b981',
  },
  gamePrimaryImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'contain',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  gameInstruction: {
    fontSize: 16,
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  gameInstructionEn: {
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    opacity: 0.7,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  optionButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    width: '48%',
    alignItems: 'center',
  },
  correctOption: {
    backgroundColor: '#dcfce7',
    borderColor: '#22c55e',
  },
  wrongOption: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  optionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#334155',
  },
  wonText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#22c55e',
    textAlign: 'center',
  },
  lostText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ef4444',
    textAlign: 'center',
  },
  playAgainButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  playAgainText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});