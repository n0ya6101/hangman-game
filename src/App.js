import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { setLogLevel } from 'firebase/app';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import ProfileSetup from './components/ProfileSetup';

// --- Confetti Library ---
const confettiScript = document.createElement('script');
confettiScript.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js";
document.head.appendChild(confettiScript);

// --- Firebase Configuration ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID
};

// --- App Initialization ---
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
setLogLevel('debug');

export default function App() {
    const [page, setPage] = useState('home');
    const [gameId, setGameId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-word-game-hub';

    useEffect(() => {
        const savedProfile = localStorage.getItem('hangmanUserProfile');
        if (savedProfile) {
            setUserProfile(JSON.parse(savedProfile));
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Authentication failed:", error);
                }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribe();
    }, []);

    const navigateTo = (page, id = null) => {
        setPage(page);
        setGameId(id);
    };
    
    const handleProfileSave = (profile) => {
        localStorage.setItem('hangmanUserProfile', JSON.stringify(profile));
        setUserProfile(profile);
    };

    if (!isAuthReady) {
        return <div className="flex items-center justify-center h-screen bg-slate-100 text-gray-800 font-sans"><div className="text-2xl font-bold animate-pulse">Loading Just a Moment...</div></div>;
    }
    
    if (!userProfile) {
        return <ProfileSetup onProfileSave={handleProfileSave} />;
    }

    switch (page) {
        case 'game':
            return <GamePage navigateTo={navigateTo} gameId={gameId} userId={userId} userProfile={userProfile} appId={appId} />;
        case 'home':
        default:
            return <HomePage navigateTo={navigateTo} userId={userId} userProfile={userProfile} appId={appId} />;
    }
}
