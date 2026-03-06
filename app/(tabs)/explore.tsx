import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

const API_URL = 'http://192.168.1.108:5000/api';

interface LetterInfo {
  id: number;
  character: string;
  romanized: string;
}

export default function ExploreScreen() {
  const [letters, setLetters] = useState<LetterInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    checkApiStatus();
    fetchAllLetters();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch(`${API_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      setApiStatus(data.status === 'healthy' ? 'online' : 'offline');
    } catch (_error) {
      setApiStatus('offline');
    }
  };

  const fetchAllLetters = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/get-all-letters`);
      const data = await response.json();

      if (data.success) {
        setLetters(data.letters);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    Alert.alert('පරීක්ෂා කරමින්...', 'API සම්බන්ධතාවය පරීක්ෂා කරමින්');
    await checkApiStatus();

    if (apiStatus === 'online') {
      Alert.alert('✓ සාර්ථකයි!', 'API සේවාදායකය සමඟ සම්බන්ධ වී ඇත');
    } else {
      Alert.alert(
        '✗ අසාර්ථකයි',
        'API සේවාදායකය සමඟ සම්බන්ධ විය නොහැක.\n\nසත්‍යාපනය කරන්න:\n1. Flask API ක්‍රියාත්මක දැයි\n2. දුරකථනය සහ පරිගණකය එකම WiFi තුළ දැයි'
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>සිංහල අකුරු පුහුණුව</Text>
        <Text style={styles.subtitle}>Sinhala Handwriting Practice App</Text>
      </View>

      {/* API Status Card */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          API තත්ත්වය (API Status)
        </ThemedText>
        <View style={styles.statusRow}>
          <View style={[
            styles.statusDot,
            { backgroundColor: apiStatus === 'online' ? '#4CAF50' : apiStatus === 'offline' ? '#F44336' : '#FFC107' }
          ]} />
          <Text style={styles.statusText}>
            {apiStatus === 'online' ? 'සම්බන්ධිතයි (Connected)' :
              apiStatus === 'offline' ? 'විසන්ධිතයි (Disconnected)' :
                'පරීක්ෂා කරමින්... (Checking...)'}
          </Text>
        </View>
        <TouchableOpacity style={styles.testButton} onPress={testConnection}>
          <Text style={styles.testButtonText}>සම්බන්ධතාවය පරීක්ෂා කරන්න</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* About Card */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          යෙදුම ගැන (About App)
        </ThemedText>
        <ThemedText style={styles.cardText}>
          මෙම යෙදුම සිංහල අකුරු ලිවීමේ කුසලතා වර්ධනය කිරීම සඳහා නිර්මාණය කර ඇත. AI මගින් ඔබේ අකුරු ලිවීම් තක්සේරු කර ලකුණු ලබා දෙයි.
        </ThemedText>
        <ThemedText style={styles.cardText}>
          This app is designed to improve Sinhala handwriting skills. AI evaluates your handwriting and provides scores.
        </ThemedText>
      </ThemedView>

      {/* Letters Card */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          පුහුණු අකුරු ({letters.length})
        </ThemedText>
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.lettersGrid}>
            {letters.slice(0, 20).map((letter) => (
              <View key={letter.id} style={styles.letterItem}>
                <Text style={styles.letterChar}>{letter.character}</Text>
                <Text style={styles.letterRoman}>{letter.romanized}</Text>
              </View>
            ))}
          </View>
        )}
        {letters.length > 20 && (
          <Text style={styles.moreText}>සහ තවත් {letters.length - 20}...</Text>
        )}
      </ThemedView>

      {/* Features Card */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          විශේෂාංග (Features)
        </ThemedText>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>✏️</Text>
          <ThemedText style={styles.featureText}>
            අකුරු ලිවීම සඳහා ස්පර්ශ කළ හැකි canvas
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🤖</Text>
          <ThemedText style={styles.featureText}>
            AI මගින් ස්වයංක්‍රීය අකුරු හඳුනා ගැනීම
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>📊</Text>
          <ThemedText style={styles.featureText}>
            තත්‍ය කාලීන ලකුණු සහ ප්‍රතිපෝෂණ
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Text style={styles.featureIcon}>🎯</Text>
          <ThemedText style={styles.featureText}>
            අහඹු අකුර පැවරීම
          </ThemedText>
        </View>
      </ThemedView>

      {/* Instructions Card */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          භාවිතය (How to Use)
        </ThemedText>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>1.</Text>
          <ThemedText style={styles.instructionText}>
            Home screen එකේ පෙන්වන අකුර බලන්න
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>2.</Text>
          <ThemedText style={styles.instructionText}>
            Canvas එකේ අඟිල්ලෙන් එම අකුර ලියන්න
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>3.</Text>
          <ThemedText style={styles.instructionText}>
            &quot;ඉදිරිපත් කරන්න&quot; බොත්තම ඔබන්න
          </ThemedText>
        </View>
        <View style={styles.instructionItem}>
          <Text style={styles.instructionNumber}>4.</Text>
          <ThemedText style={styles.instructionText}>
            ඔබේ ලකුණු සහ ප්‍රතිපෝෂණ බලන්න
          </ThemedText>
        </View>
      </ThemedView>

      {/* API Info Card */}
      <ThemedView style={styles.card}>
        <ThemedText type="subtitle" style={styles.cardTitle}>
          තාක්ෂණික තොරතුරු
        </ThemedText>
        <Text style={styles.infoText}>API URL: {API_URL}</Text>
        <Text style={styles.infoText}>Frontend: React Native (Expo)</Text>
        <Text style={styles.infoText}>Backend: Flask (Python)</Text>
        <Text style={styles.infoText}>Model: CNN (Mock Mode)</Text>
      </ThemedView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          සිංහල අකුරු පුහුණුව v1.0.0
        </Text>
        <Text style={styles.footerText}>
          © 2024 All Rights Reserved
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 30,
    backgroundColor: '#1976D2',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: '#E3F2FD',
    marginTop: 5,
  },
  card: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  cardTitle: {
    marginBottom: 15,
    fontSize: 18,
    fontWeight: 'bold',
  },
  cardText: {
    marginBottom: 10,
    lineHeight: 22,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '500',
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  lettersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  letterItem: {
    width: '18%',
    aspectRatio: 1,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  letterChar: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  letterRoman: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  moreText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
    fontSize: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
    marginRight: 10,
    width: 25,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    fontFamily: 'monospace',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
});