import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HandwritingScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Handwriting Component</Text>
            <Text style={styles.subtitle}>Coming soon...</Text>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#4CAF50' },
    subtitle: { fontSize: 16, color: '#666', marginTop: 10 }
});
