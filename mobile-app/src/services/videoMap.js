const videoMap = {
    // Mapping string IDs to local requires
    "video_1": require('../../assets/videos/1.mp4'),
    "video_2": require('../../assets/videos/2.mp4'),
    "video_3": require('../../assets/videos/3.mp4'),
    "video_4": require('../../assets/videos/4.mp4'),
    "video_5": require('../../assets/videos/5.mp4'),
};

export const getVideoSource = (videoName) => {
    return videoMap[videoName];
};
