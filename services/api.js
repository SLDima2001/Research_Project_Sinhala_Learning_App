import axios from 'axios';
import { Platform } from 'react-native';

// Use your computer's local IP address (run 'ipconfig' to find it)
const API_IP = '192.168.1.108';
const API_URL = `http://${API_IP}:5000/api`;

const api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
});

export const getStories = async () => {
    try {
        const response = await api.get('/stories');
        return response.data;
    } catch (error) {
        console.error("Error fetching stories:", error);
        return [];
    }
};

export const getStory = async (id) => {
    try {
        const response = await api.get(`/stories/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching story:", error);
        return null;
    }
};

export const submitQuiz = async (data) => {
    try {
        const response = await api.post('/quiz/submit', data);
        return response.data;
    } catch (error) {
        console.error("Error submitting quiz:", error);
        throw error;
    }
};
