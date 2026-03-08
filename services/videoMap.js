const videoMap = {
    // Mapping string IDs to local requires
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
    "deer_intro.mp4": require('../assets/videos/deer intro.mp4'),
    "deer_A.mp4": require('../assets/videos/deer A.mp4'),
    "deer_B.mp4": require('../assets/videos/deer B.mp4'),
    "Andare.mp4": require('../assets/videos/Andare.mp4'),
};

export const getVideoSource = (videoName) => {
    return videoMap[videoName];
};
