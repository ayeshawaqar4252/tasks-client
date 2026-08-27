"use client";

import { createContext, useEffect, useState, type ReactNode } from "react";
import { getToken, removeToken, setToken } from "../lib/session";
import { api } from "../lib/api";

type AuthContextType = {
    token: string | null;
    user: null;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const storedToken = getToken();

        setTokenState(storedToken);
        setIsLoading(false);
    }, []);

    const signOut = () => {
        removeToken();
        setTokenState(null);
    };
    const signIn = async (email: string, password: string) => {
    const data = await api<{ access_token: string }>("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email,
            password,
        }),
    });

    setToken(data.access_token);
    setTokenState(data.access_token);
};
    return (
        <AuthContext.Provider value={{ token, user: null,isLoading, signIn, signOut, }}>
            {children}
        </AuthContext.Provider>
    );
}