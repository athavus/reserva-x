"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, getCurrentUser, login as apiLogin, setToken, removeToken, getToken, LoginResponse } from "../lib/api";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<User>;
    logout: () => void;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshUser = async () => {
        try {
            const token = getToken();
            if (!token) {
                setUser(null);
                return;
            }
            const userData = await getCurrentUser();
            setUser(userData);
        } catch {
            setUser(null);
            removeToken();
        }
    };

    useEffect(() => {
        refreshUser().finally(() => setIsLoading(false));
    }, []);

    const login = async (email: string, password: string): Promise<User> => {
        const response: LoginResponse = await apiLogin(email, password);
        setToken(response.access_token);
        const userData = await getCurrentUser();
        setUser(userData);
        return userData;
    };

    const logout = () => {
        removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                logout,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
