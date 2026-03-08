import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// API Base URL - Update this to your backend URL
// Use your computer's IP address (not localhost) when testing on physical device/emulator
const API_URL = 'http://192.168.1.108:5002/api/auth';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
    register: (email: string, password: string, name?: string) => Promise<{ success: boolean; message?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check authentication status on app launch
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            setIsLoading(true);
            const token = await SecureStore.getItemAsync(TOKEN_KEY);

            if (!token) {
                setUser(null);
                setIsLoading(false);
                return;
            }

            // Verify token with backend
            const response = await axios.get(`${API_URL}/verify`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.data.success && response.data.user) {
                setUser(response.data.user);
            } else {
                // Invalid token, clear it
                await SecureStore.deleteItemAsync(TOKEN_KEY);
                setUser(null);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // Clear invalid token
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/login`, {
                email: email.trim().toLowerCase(),
                password,
            });

            if (response.data.success && response.data.token) {
                // Store token
                await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message || 'Login failed' };
            }
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, name?: string): Promise<{ success: boolean; message?: string }> => {
        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/register`, {
                email: email.trim().toLowerCase(),
                password,
                name: name?.trim(),
            });

            if (response.data.success && response.data.token) {
                // Store token
                await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message || 'Registration failed' };
            }
        } catch (error: any) {
            console.error('Registration error:', error);
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            return { success: false, message };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setIsLoading(true);
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AuthContextType = {
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkAuth,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
