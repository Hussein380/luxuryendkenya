import { apiRequest } from './apiClient';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

export interface AuthResponse {
    token: string;
    user: User;
}

export const login = async (email: string, password: string) => {
    const response = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    if (response.success && response.data) {
        // Save token to localStorage
        localStorage.setItem('driveease_token', response.data.token);
        localStorage.setItem('driveease_user', JSON.stringify(response.data.user));
    }

    return response;
};

export const logout = () => {
    localStorage.removeItem('driveease_token');
    localStorage.removeItem('driveease_user');
};

export const getCurrentUser = (): User | null => {
    const user = localStorage.getItem('driveease_user');
    return user ? JSON.parse(user) : null;
};

export const getToken = (): string | null => {
    return localStorage.getItem('driveease_token');
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};

export const isAdmin = (): boolean => {
    const user = getCurrentUser();
    return user?.role === 'admin';
};
