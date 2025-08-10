import React, { useState } from 'react';
import { collection, addDoc, doc, getDoc,updateDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../App';


export default function HomePage({ navigateTo, userId, userProfile, appId }) {
    const [privateRoomId, setPrivateRoomId] = useState('');
    const [rounds, setRounds] = useState(5);
    const [isLoading, setIsLoading] = useState(false);

    // Helper function to generate a random room ID
    const generateRoomId = (length = 6) => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const createGame = async (isPrivate) => {
        if (!userId || isLoading) return;
        setIsLoading(true);

        try {
            const collectionPath = `artifacts/${appId}/public/data/games`;
            const playerInitialData = { id: userId, name: userProfile.username, face: userProfile.face, score: 0, roundStatus: 'playing', lastSeen: new Date() };
            const gameData = {
                admin: userId,
                players: [playerInitialData],
                word: '',
                currentRound: 0,
                totalRounds: isPrivate ? rounds : 5,
                roundStartTime: null,
                status: 'waiting',
                createdAt: new Date(),
                lastActivity: new Date(), // Initialize lastActivity timestamp
                isPrivate: isPrivate,
            };

            if (isPrivate) {
                let newId = '';
                let isUnique = false;
                while (!isUnique) {
                    newId = generateRoomId();
                    const gameRef = doc(db, collectionPath, newId);
                    const docSnap = await getDoc(gameRef);
                    if (!docSnap.exists()) {
                        isUnique = true;
                    }
                }
                await setDoc(doc(db, collectionPath, newId), gameData);
                navigateTo('game', newId);
            } else {
                const gameRef = await addDoc(collection(db, collectionPath), gameData);
                navigateTo('game', gameRef.id);
            }

        } catch (error) {
            console.error("Error creating game:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickPlay = async () => {
        if (!userId || isLoading) return;
        setIsLoading(true);

        const collectionPath = `artifacts/${appId}/public/data/games`;
        const q = query(collection(db, collectionPath), where("isPrivate", "==", false), where("status", "==", "waiting"));

        try {
            const querySnapshot = await getDocs(q);
            let openGame = null;

            querySnapshot.forEach((doc) => {
                const game = doc.data();
                if (game.players.length < 6) {
                    openGame = { id: doc.id, ...game };
                }
            });

            if (openGame) {
                const adminPlayer = openGame.players.find(p => p.id === openGame.admin);
                const gameRef = doc(db, collectionPath, openGame.id);

                if (adminPlayer && adminPlayer.lastSeen) {
                    const inactivityDuration = Date.now() - adminPlayer.lastSeen.toMillis();
                    // If admin is inactive for more than 3 minutes (180000 ms)
                    if (inactivityDuration > 180000) {
                        // Kick the old admin and promote the new player
                        const updatedPlayers = openGame.players.filter(p => p.id !== openGame.admin);
                        await updateDoc(gameRef, { 
                            admin: userId,
                            players: updatedPlayers
                        });
                    }
                }
                navigateTo('game', openGame.id);
            } else {
                createGame(false);
            }
        } catch (error) {
            console.error("Error finding quick play game:", error);
            createGame(false);
        } finally {
            setIsLoading(false);
        }
    };
    
    const joinPrivateGame = () => {
        if(privateRoomId.trim()) {
            navigateTo('game', privateRoomId.trim().toUpperCase());
        }
    };

    return (
        <div className="min-h-screen font-sans p-4 sm:p-8 flex flex-col items-center justify-center">
            
            <video autoPlay loop muted playsInline className="bg-vid">
                <source src="/videos/bg_vid.mp4" type="video/mp4" />
            </video>
            <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
                <h1 className="text-5xl font-bold text-gray-800 mb-2" style={{ fontFamily: "'Comic Sans MS', 'Chalkduster', 'cursive'" }}>Hangman</h1>
                <p className="text-gray-600 mb-8">Welcome, <span className="font-bold">{userProfile.username}</span>!</p>
                <div className="space-y-4">
                    <button onClick={() => navigateTo('game', 'single-player')} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all" disabled={isLoading}>Single Player Practice</button>
                    <button onClick={handleQuickPlay} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all" disabled={isLoading}>
                        {isLoading ? 'Finding Game...' : 'Quick Play'}
                    </button>
                    <div className="bg-purple-100 p-4 rounded-lg">
                        <div className="flex items-center justify-center mb-3">
                            <label htmlFor="rounds" className="font-semibold text-purple-800 mr-3">Rounds:</label>
                            <input type="number" id="rounds" value={rounds} onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value) || 1))} className="w-20 text-center font-bold p-1 rounded-md border-purple-300 border-2"/>
                        </div>
                        <button onClick={() => createGame(true)} className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Private Game'}
                        </button>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-300">
                     <h2 className="text-xl font-semibold text-gray-700 mb-4">Join a Private Room</h2>
                     <div className="flex flex-col sm:flex-row gap-2">
                         <input type="text" value={privateRoomId} onChange={(e) => setPrivateRoomId(e.target.value)} placeholder="Enter Room ID" className="flex-grow px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-shadow" />
                         <button onClick={joinPrivateGame} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg shadow-md transform hover:scale-105 transition-transform">Join</button>
                     </div>
                </div>
            </div>
            <footer className="text-center mt-8 text-gray-500 text-sm">Your User ID: {userId}</footer>
        </div>
    );
}