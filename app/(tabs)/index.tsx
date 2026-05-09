import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ImageBackground 
        source={require('../../assets/images/sinhala_letters_bg.png')} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.name || 'Student'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={[styles.content, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.overlayContainer}>
            <Text style={{ fontSize: 50, fontWeight: 'bold', color: '#9653c4ff', marginBottom: 20, textAlign: 'center' }}>
              Edu Sinhala
            </Text>
            <Text style={{ fontSize: 20, color: '#333', textAlign: 'center', marginBottom: 40 }}>
              Welcome to the Sinhala Learning App!
            </Text>
            <TouchableOpacity
              style={{ backgroundColor: '#ba98e2ff', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 30, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 }}
              onPress={() => router.push('/(tabs)/features')}
            >
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold' }}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
  },
  overlayContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  grid: {
    gap: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 12,
    color: '#666',
  },
});
