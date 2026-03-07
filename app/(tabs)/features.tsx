import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeaturesScreen() {
    const router = useRouter();

    const components = [
        {
            title: 'Handwriting Recognition',
            icon: 'pencil' as const,
            color: '#4CAF50',
            route: '/(tabs)/handwriting',
            description: 'Practice writing Sinhala letters with AI feedback'
        },
        {
            title: 'Storytelling',
            icon: 'book' as const,
            color: '#2196F3',
            route: '/(tabs)/storytelling',
            description: 'Interactive Sinhala stories and quizzes'
        },
        {
            title: 'Voice Feedback',
            icon: 'mic' as const,
            color: '#E91E63',
            route: '/(tabs)/voice-feedback',
            description: 'Realtime interactive pronunciation practice'
        },
        {
            title: 'Text-to-Image',
            icon: 'image' as const,
            color: '#9C27B0',
            route: '/(tabs)/text-to-image',
            description: 'Generate images from Sinhala text'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Modules</Text>
            </View>
            <View style={styles.content}>
                {components.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[styles.card, { borderLeftColor: item.color }]}
                        onPress={() => router.push(item.route as any)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                            <Ionicons name={item.icon} size={32} color={item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.cardTitle}>{item.title}</Text>
                            <Text style={styles.cardDesc}>{item.description}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                ))}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 20,
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
