import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const DIFFICULTIES = [
  {
    key: 'easy',
    label: 'Easy',
    sinhala: 'පහසු',
    icon: 'leaf',
    emoji: '🌱',
    colors: ['#1B5E20', '#4CAF50', '#81C784'],
    cardColor: '#E8F5E9',
    borderColor: '#4CAF50',
    textColor: '#1B5E20',
    tagColor: '#4CAF50',
    description: 'Short story · Simple words · Fewer questions',
    badge: 'BEGINNER',
  },
  {
    key: 'medium',
    label: 'Medium',
    sinhala: 'මධ්‍යම',
    icon: 'star',
    emoji: '⭐',
    colors: ['#E65100', '#FF9800', '#FFB74D'],
    cardColor: '#FFF3E0',
    borderColor: '#FF9800',
    textColor: '#E65100',
    tagColor: '#FF9800',
    description: 'Full story · Moderate vocabulary · Some quizzes',
    badge: 'INTERMEDIATE',
  },
  {
    key: 'hard',
    label: 'Hard',
    sinhala: 'අපහසු',
    icon: 'flame',
    emoji: '🔥',
    colors: ['#B71C1C', '#F44336', '#EF9A9A'],
    cardColor: '#FFEBEE',
    borderColor: '#F44336',
    textColor: '#B71C1C',
    tagColor: '#F44336',
    description: 'All videos · All questions · Full challenge',
    badge: 'ADVANCED',
  },
];

export default function DifficultyScreen({ route, navigation }) {
  const { storyId, title } = route.params;

  // Animated values for each card
  const scaleAnims = useRef(DIFFICULTIES.map(() => new Animated.Value(1))).current;

  const handlePressIn = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  const handleSelect = (difficulty) => {
    navigation.navigate('Story', {
      storyId,
      title,
      difficulty: difficulty.key,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerSubtitle}>CHOOSE YOUR LEVEL</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>{title}</Text>
        </View>
      </View>

      {/* Decorative line */}
      <View style={styles.divider} />

      {/* Instruction */}
      <Text style={styles.instruction}>
        Select a difficulty to start your learning adventure 🎓
      </Text>

      {/* Difficulty Cards */}
      <View style={styles.cardsContainer}>
        {DIFFICULTIES.map((diff, index) => (
          <Animated.View
            key={diff.key}
            style={[styles.cardWrapper, { transform: [{ scale: scaleAnims[index] }] }]}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPressIn={() => handlePressIn(index)}
              onPressOut={() => handlePressOut(index)}
              onPress={() => handleSelect(diff)}
              style={[
                styles.card,
                {
                  backgroundColor: diff.cardColor,
                  borderColor: diff.borderColor,
                },
              ]}
            >
              {/* Left accent bar */}
              <LinearGradient
                colors={diff.colors}
                style={styles.accentBar}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />

              {/* Card Content */}
              <View style={styles.cardBody}>
                {/* Icon + Label row */}
                <View style={styles.cardTopRow}>
                  <View style={[styles.iconCircle, { backgroundColor: diff.borderColor + '22' }]}>
                    <Text style={styles.emoji}>{diff.emoji}</Text>
                  </View>
                  <View style={styles.labelGroup}>
                    <View style={[styles.badgePill, { backgroundColor: diff.tagColor }]}>
                      <Text style={styles.badgeText}>{diff.badge}</Text>
                    </View>
                    <Text style={[styles.cardLabel, { color: diff.textColor }]}>{diff.label}</Text>
                    <Text style={[styles.cardSinhala, { color: diff.textColor + 'CC' }]}>{diff.sinhala}</Text>
                  </View>
                </View>

                {/* Description */}
                <Text style={styles.cardDescription}>{diff.description}</Text>
              </View>

              {/* Arrow */}
              <View style={[styles.arrowContainer, { backgroundColor: diff.borderColor }]}>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Bottom tip */}
      <View style={styles.tipContainer}>
        <Ionicons name="information-circle-outline" size={16} color="#999" />
        <Text style={styles.tipText}>You can always replay with a different difficulty!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF8C00',
    letterSpacing: 2,
    marginBottom: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
    lineHeight: 26,
  },
  divider: {
    height: 1.5,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
    borderRadius: 1,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  cardsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  cardWrapper: {
    borderRadius: 18,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    overflow: 'hidden',
    minHeight: 100,
  },
  accentBar: {
    width: 6,
    alignSelf: 'stretch',
  },
  cardBody: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  emoji: {
    fontSize: 26,
  },
  labelGroup: {
    flex: 1,
  },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginBottom: 3,
  },
  badgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardLabel: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 24,
  },
  cardSinhala: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    lineHeight: 18,
  },
  arrowContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  tipText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
});
