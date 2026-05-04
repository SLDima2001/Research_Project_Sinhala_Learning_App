import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, ImageBackground, ScrollView, Dimensions, StatusBar, SafeAreaView } from 'react-native';
import { getStories } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Image Mapping
const storyImages = {
  'story_dutugemunu': require('../assets/images/story_cover_dutugemunu.png'),
  'story_prince_saliya': require('../assets/images/story_cover_prince_saliya.png'),
  'story_deer': require('../assets/images/story_cover_deer.png'),
  'story_andare': require('../assets/images/story_cover_andare.png'),
  'story_gama_duwage_nuwana': require('../assets/images/story_cover_gama_duwage_nuwana.png'),
  'story_mahadanamuththa': require('../assets/images/story_cover_mahadanamuththa.png'),
  'story_sangamiththa_thero': require('../assets/images/story_cover_sangamiththa_thero.png'),
  'story_king_wessanthara': require('../assets/images/story_cover_king_wessanthara.png'),
  'story_mango_tree': require('../assets/images/story_cover_mango_tree.png'),
  'story_parakramabahu': require('../assets/images/story_cover_parakramabahu.png'),
  'default': require('../assets/adaptive-icon.png')
};

export default function DashboardScreen({ navigation }) {
  const [sections, setSections] = useState({ easy: [], medium: [], standard: [] });
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(null);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    const data = await getStories();
    
    const easy = data.filter(s => s.category === 'easy');
    const medium = data.filter(s => s.category === 'medium');
    const standard = data.filter(s => s.category !== 'easy' && s.category !== 'medium');
    
    setSections({ easy, medium, standard });
    setLoading(false);
  };

  const getStoryImage = (id) => {
    return storyImages[id] || storyImages['default'];
  };

  const renderLevelButton = (level, icon, title, sub, color, iconColor) => (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={[styles.pastelCard, { backgroundColor: color }]}
      onPress={() => setSelectedLevel(level)}
    >
      <View style={[styles.iconCircle, { backgroundColor: 'white' }]}>
        <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
      </View>
      <Text style={styles.cleanTitle}>{title}</Text>
      <Text style={styles.cleanSub}>{sub}</Text>
    </TouchableOpacity>
  );

  const renderStoryCard = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={styles.storyCard}
      onPress={() => navigation.navigate('Story', { 
        storyId: item.id, 
        title: item.title,
        difficulty: item.category === 'standard' ? 'hard' : item.category
      })}
    >
      <ImageBackground
        source={getStoryImage(item.id)}
        style={styles.storyBg}
        imageStyle={{ borderRadius: 24 }}
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.storyGradient}
        >
          <View style={styles.storyFooter}>
            <View style={styles.storyTextContainer}>
                <Text style={styles.storyTitle} numberOfLines={2}>{item.title}</Text>
                <Text style={styles.storyTag}>Interactive Story</Text>
            </View>
            <View style={styles.playIconBox}>
              <Ionicons name="play" size={20} color="white" />
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#5D5FEF" />
      </View>
    );
  }

  const currentStories = selectedLevel === 'easy' ? sections.easy : 
                        selectedLevel === 'medium' ? sections.medium : 
                        selectedLevel === 'hard' ? sections.standard : [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FDFEFE" />
      
      {!selectedLevel ? (
        <ScrollView contentContainerStyle={styles.mainScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.headerGroup}>
            <Text style={styles.welcomeText}>Welcome! 👋</Text>
            <Text style={styles.chooseText}>Choose your learning path</Text>
          </View>
          
          <View style={styles.levelGrid}>
            {renderLevelButton('easy', 'leaf', 'Easy', 'Beginner stories', '#E8F5E9', '#43A047')}
            {renderLevelButton('medium', 'star', 'Medium', 'Intermediate tales', '#FFF9C4', '#FBC02D')}
            {renderLevelButton('hard', 'fire', 'Hard', 'Advanced challenges', '#FCE4EC', '#D81B60')}
          </View>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          <View style={styles.subHeader}>
            <TouchableOpacity onPress={() => setSelectedLevel(null)} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={32} color="#333" />
            </TouchableOpacity>
            <Text style={styles.subHeaderText}>
              {selectedLevel.toUpperCase()} MODE
            </Text>
          </View>
          
          <FlatList
            data={currentStories}
            renderItem={renderStoryCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={styles.emptyText}>No stories here yet!</Text>
              </View>
            }
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FDFEFE', 
  },
  mainScroll: {
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  headerGroup: {
    marginBottom: 35,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
    letterSpacing: -1,
  },
  chooseText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
  },
  levelGrid: {
    gap: 18,
  },
  pastelCard: {
    borderRadius: 32,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cleanTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  cleanSub: {
    fontSize: 15,
    color: '#555',
    fontWeight: '600',
    textAlign: 'center',
    opacity: 0.8,
  },
  subHeader: {
    height: 120,
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    letterSpacing: 1.5,
  },
  listContainer: {
    padding: 24,
  },
  storyCard: {
    height: 200,
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: 'white',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  storyBg: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  storyGradient: {
    height: '60%',
    borderRadius: 24,
    justifyContent: 'flex-end',
    padding: 20,
  },
  storyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  storyTextContainer: {
    flex: 1,
    marginRight: 15,
  },
  storyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  storyTag: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  playIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#5D5FEF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  }
});
