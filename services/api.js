import axios from 'axios';
import { Config } from '../constants/Config';

const api = axios.create({
  baseURL: Config.API_BASE_URL + '/api',
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
