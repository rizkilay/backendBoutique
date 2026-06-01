import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE = 'https://backend-boutique.vercel.app';

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        if (savedToken) {
            // Vérifier le token auprès du serveur
            fetch(`${API_BASE}/api/auth/me`, {
                headers: { Authorization: `Bearer ${savedToken}` }
            })
                .then(res => res.ok ? res.json() : null)
                .then(userData => {
                    if (userData) {
                        setToken(savedToken);
                        setUser(userData);
                        setIsAuthenticated(true);
                    } else {
                        localStorage.removeItem('authToken');
                    }
                })
                .catch(() => localStorage.removeItem('authToken'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erreur de connexion');
        }

        localStorage.setItem('authToken', data.token);
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        return data.user;
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
    };

    // Helper pour les appels API authentifiés
    const authFetch = (url, options = {}) => {
        return fetch(`${API_BASE}${url}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, token, loading, login, logout, authFetch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
