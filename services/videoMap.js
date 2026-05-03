const videoMap = {
    // King Dutugemunu Story
    "video_1": require('../assets/videos/1.mp4'),
    "video_2": require('../assets/videos/2.mp4'),
    "video_3": require('../assets/videos/3.mp4'),
    "video_4": require('../assets/videos/4.mp4'),
    "video_5": require('../assets/videos/5.mp4'),
    // Prince Saliya Story
    "saliya_1": require('../assets/videos/saliya 1.mp4'),
    "saliya_2": require('../assets/videos/saliya 2.mp4'),
    "saliya_3": require('../assets/videos/saliya 3.mp4'),
    "saliya_4": require('../assets/videos/saliya 4.mp4'),
    "saliya_5": require('../assets/videos/saliya 5.mp4'),
    "saliya_6": require('../assets/videos/saliya 6.mp4'),
    "saliya_7": require('../assets/videos/saliya 7.mp4'),
    // Deer Story
    "deer_intro.mp4": require('../assets/videos/deer intro.mp4'),
    "deer_A.mp4": require('../assets/videos/deer A.mp4'),
    "deer_B.mp4": require('../assets/videos/deer B.mp4'),
    // Andare Story
    "Andare.mp4": require('../assets/videos/Andare.mp4'),
    // New Easy Stories
    "gama_duwage_nuwana": require('../assets/videos/Gama Duwage Nuwana.mp4'),
    "mahadanamuththa": require('../assets/videos/Mahadanamuththa.mp4'),
    "king_wessanthara": require('../assets/videos/King Wessanthara.mp4'),
    "sangamiththa_thero": require('../assets/videos/Sangamiththa Thero.mp4'),
    "mango_tree_main": require('../assets/videos/Mango Tree Main.mp4'),
    "mango_tree_a": require('../assets/videos/Mango Tree A .mp4'),
    "mango_tree_b": require('../assets/videos/Mango Tree B.mp4'),
    // Parakramabahu Story
    "parakramabahu_main": require('../assets/videos/Parakramabahu Main.mp4'),
    "parakramabahu_a": require('../assets/videos/Parakramabahu Main A.mp4'),
    "parakramabahu_b": require('../assets/videos/Parakramabahu Main B.mp4'),
};

export const getVideoSource = (videoName) => {
    return videoMap[videoName];
};

// ---------------------------------------------------
// Difficulty Video Map
// Maps { storyId, difficulty } → ordered list of video segment IDs
// These IDs match the keys in `videoMap` above AND the segment video_ids
// in the backend stories.json
// ---------------------------------------------------
export const difficultyVideoMap = {
    story_dutugemunu: {
        easy:   ['video_1', 'video_2'],
        medium: ['video_1', 'video_2', 'video_3'],
        hard:   ['video_1', 'video_2', 'video_3', 'video_4', 'video_5'],
    },
    story_prince_saliya: {
        easy:   ['saliya_1', 'saliya_2'],
        medium: ['saliya_1', 'saliya_2', 'saliya_3', 'saliya_4'],
        hard:   ['saliya_1', 'saliya_2', 'saliya_3', 'saliya_4', 'saliya_5', 'saliya_6', 'saliya_7'],
    },
    story_deer: {
        easy:   ['deer_intro.mp4'],
        medium: ['deer_intro.mp4', 'deer_A.mp4'],
        hard:   ['deer_intro.mp4', 'deer_A.mp4', 'deer_B.mp4'],
    },
    story_andare: {
        easy:   ['Andare.mp4'],
        medium: ['Andare.mp4'],
        hard:   ['Andare.mp4'],
    },
    story_gama_duwage_nuwana: {
        easy:   ['gama_duwage_nuwana'],
        medium: ['gama_duwage_nuwana'],
        hard:   ['gama_duwage_nuwana'],
    },
    story_mahadanamuththa: {
        easy:   ['mahadanamuththa'],
        medium: ['mahadanamuththa'],
        hard:   ['mahadanamuththa'],
    },
    story_king_wessanthara: {
        easy:   ['king_wessanthara'],
        medium: ['king_wessanthara'],
        hard:   ['king_wessanthara'],
    },
    story_sangamiththa_thero: {
        easy:   ['sangamiththa_thero'],
        medium: ['sangamiththa_thero'],
        hard:   ['sangamiththa_thero'],
    },
    story_mango_tree: {
        easy:   ['mango_tree_main'],
        medium: ['mango_tree_main', 'mango_tree_a', 'mango_tree_b'],
        hard:   ['mango_tree_main', 'mango_tree_a', 'mango_tree_b'],
    },
    story_parakramabahu: {
        easy:   ['parakramabahu_main'],
        medium: ['parakramabahu_main', 'parakramabahu_a', 'parakramabahu_b'],
        hard:   ['parakramabahu_main', 'parakramabahu_a', 'parakramabahu_b'],
    },
};

/**
 * Get the allowed video IDs for a given story and difficulty.
 * Returns null if no mapping is found (means play all videos).
 */
export const getVideosByDifficulty = (storyId, difficulty) => {
    if (!storyId || !difficulty) return null;
    const storyMap = difficultyVideoMap[storyId];
    if (!storyMap) return null;
    return storyMap[difficulty] || null;
};
