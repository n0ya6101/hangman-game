import React, { useState, useEffect, useRef } from 'react';
import {  db } from '../App'; 
import { doc, onSnapshot, updateDoc, arrayUnion, writeBatch } from 'firebase/firestore';
import HangmanCanvas from './HangmanCanvas';
import WordDisplay from './WordDisplay';
import Keyboard from './Keyboard'; 
import Podium from './Podium';
import { HomeIcon } from './Icon';
import { CopyIcon } from './Icon'; 


export default function GamePage({ navigateTo, gameId, userId, userProfile, appId }) {
    const [game, setGame] = useState(null);
    const [showExitModal, setShowExitModal] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [notification, setNotification] = useState('');
    const [isEndingRound, setIsEndingRound] = useState(false);
    const timerRef = useRef(null);

    const isSinglePlayer = gameId === 'single-player';
    const wordList = [
        "APPLE", "BANANA", "ORANGE", "GRAPE", "STRAWBERRY", "WATERMELON", "PINEAPPLE", "MANGO",
        "CARROT", "BROCCOLI", "CUCUMBER", "TOMATO", "POTATO", "ONION", "GARLIC", "LETTUCE",
        "COMPUTER", "KEYBOARD", "MONITOR", "SOFTWARE", "HARDWARE", "INTERNET", "DATABASE", "ALGORITHM",
        "JAVASCRIPT", "PYTHON", "REACT", "ANGULAR", "VUE", "NODEJS", "HTML", "CSS",
        "ELEPHANT", "TIGER", "LION", "GIRAFFE", "ZEBRA", "MONKEY", "KANGAROO", "PENGUIN",
        "GUITAR", "PIANO", "DRUMS", "VIOLIN", "TRUMPET", "FLUTE", "SAXOPHONE", "HARMONICA",
        "MOUNTAIN", "OCEAN", "RIVER", "FOREST", "DESERT", "VOLCANO", "ISLAND", "BEACH"
    ];
    const isAdmin = !isSinglePlayer && game && game.admin === userId;

    const startNewSinglePlayerGame = () => {
        setGame({
            admin: userId,
            players: [{ id: userId, name: userProfile.username, face: userProfile.face, score: 0, roundStatus: 'playing', guesses: [], incorrectGuesses: 0 }],
            word: wordList[Math.floor(Math.random() * wordList.length)],
            status: 'playing',
            isSinglePlayer: true,
            playerResult: null,
        });
    };

    useEffect(() => {
        if (isSinglePlayer) {
            startNewSinglePlayerGame();
        } else {
            if (!gameId || !userId || !appId) return;
            const gameRef = doc(db, `artifacts/${appId}/public/data/games`, gameId);
            const unsubscribe = onSnapshot(gameRef, async (snapshot) => {
                if (snapshot.exists()) {
                    const gameData = snapshot.data();
                    setGame(gameData);
                    setIsEndingRound(false); // Reset on new data
                    const isPlayer = gameData.players.some(p => p.id === userId);
                    if (!isPlayer) {
                        await updateDoc(gameRef, { players: arrayUnion({ id: userId, name: userProfile.username, face: userProfile.face, score: 0, roundStatus: 'playing', guesses: [], incorrectGuesses: 0 }) });
                    }
                } else {
                    navigateTo('home');
                }
            });
            return () => unsubscribe();
        }
    }, [gameId, userId, appId, navigateTo, isSinglePlayer, userProfile]);

    useEffect(() => {
        if (game?.status === 'playing' && game.roundStartTime) {
            clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
                const elapsed = (Date.now() - game.roundStartTime.toMillis()) / 1000;
                const remaining = Math.max(0, 30 - elapsed);
                setTimeLeft(remaining);
                if (remaining === 0) clearInterval(timerRef.current);
            }, 500);
        }
        return () => clearInterval(timerRef.current);
    }, [game?.status, game?.roundStartTime]);
    
    const showNotification = (message) => {
        setNotification(message);
        setTimeout(() => setNotification(''), 2000);
    };

    const handleCopyRoomId = () => {
        const dummy = document.createElement('textarea');
        document.body.appendChild(dummy);
        dummy.value = gameId;
        dummy.select();
        document.execCommand('copy');
        document.body.removeChild(dummy);
        showNotification('Room ID copied!');
    };
    
    const getGameRef = () => doc(db, `artifacts/${appId}/public/data/games`, gameId);

    const startNextRound = async () => {
        if (!isAdmin) return;
        setIsEndingRound(false); // Reset for the new round
        const gameRef = getGameRef();
        const isGameOver = game.currentRound >= game.totalRounds;
        if (isGameOver) {
            await updateDoc(gameRef, { status: 'finished' });
        } else {
            const batch = writeBatch(db);
            const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
            const playersWithResetState = game.players.map(p => ({ ...p, roundStatus: 'playing', guesses: [], incorrectGuesses: 0 }));
            batch.update(gameRef, { word: randomWord, status: 'playing', currentRound: game.currentRound + 1, roundStartTime: new Date(), players: playersWithResetState });
            await batch.commit();
        }
    };
    
    useEffect(() => {
        if (isSinglePlayer || !game || game.status !== 'playing' || !isAdmin || isEndingRound) return;
        
        const allPlayersFinished = game.players.every(p => p.roundStatus !== 'playing');
        const timerExpired = timeLeft <= 0;

        if (allPlayersFinished || timerExpired) {
            setIsEndingRound(true); // Prevent multiple triggers
            setTimeout(() => {
                startNextRound();
            }, 3000);
        }
    }, [game, timeLeft, isAdmin, isSinglePlayer, isEndingRound]);

    const startGame = async () => {
        if (!isAdmin) return;
        const gameRef = getGameRef();
        const playersWithResetScores = game.players.map(p => ({ ...p, score: 0 }));
        await updateDoc(gameRef, { players: playersWithResetScores, currentRound: 0 });
        startNextRound();
    };

    const handleGuess = async (letter) => {
        if (isSinglePlayer) {
            if (game.status !== 'playing') return;
            const me = game.players[0];
            if (me.guesses.includes(letter)) return;
            const newGuesses = [...me.guesses, letter];
            let newIncorrectGuesses = me.incorrectGuesses;
            if (!game.word.includes(letter)) newIncorrectGuesses++;
            const wordIsGuessed = game.word.split('').every(l => newGuesses.includes(l));
            const isLoser = newIncorrectGuesses >= 6;
            let newStatus = game.status, playerResult = null;
            if (wordIsGuessed) { newStatus = 'finished'; playerResult = 'won'; } 
            else if (isLoser) { newStatus = 'finished'; playerResult = 'lost'; }
            setGame(g => ({...g, status: newStatus, playerResult, players: [{...g.players[0], guesses: newGuesses, incorrectGuesses: newIncorrectGuesses}]}));
        } else {
            const me = game.players.find(p => p.id === userId);
            if (!game || game.status !== 'playing' || me.roundStatus !== 'playing' || me.guesses.includes(letter)) return;
            const newGuesses = [...me.guesses, letter];
            let newIncorrectGuesses = me.incorrectGuesses;
            if (!game.word.includes(letter)) newIncorrectGuesses++;
            const wordIsGuessed = game.word.split('').every(l => newGuesses.includes(l));
            const isLoser = newIncorrectGuesses >= 6;
            let newRoundStatus = me.roundStatus, scoreToAdd = 0;
            if (wordIsGuessed) { newRoundStatus = 'won'; scoreToAdd = Math.max(0, (6 - newIncorrectGuesses) * 10); } 
            else if (isLoser) { newRoundStatus = 'lost'; }
            const updatedPlayers = game.players.map(p => p.id === userId ? { ...p, guesses: newGuesses, incorrectGuesses: newIncorrectGuesses, roundStatus: newRoundStatus, score: p.score + scoreToAdd } : p);
            await updateDoc(getGameRef(), { players: updatedPlayers });
        }
    };
    
    const resetGame = async () => {
        if (!isAdmin) return;
        const gameRef = getGameRef();
        const playersWithResetScores = game.players.map(p => ({ ...p, score: 0, roundStatus: 'playing', guesses: [], incorrectGuesses: 0 }));
        await updateDoc(gameRef, { status: 'waiting', currentRound: 0, word: '', roundStartTime: null, players: playersWithResetScores });
    };

    if (!game) return <div className="flex items-center justify-center h-screen bg-slate-100"><div className="text-2xl font-bold animate-pulse">Loading Game...</div></div>;
    
    const me = isSinglePlayer ? game.players[0] : game.players.find(p => p.id === userId);
    const sortedPlayers = isSinglePlayer ? game.players : [...game.players].sort((a, b) => b.score - a.score);

    return (
        <div className="min-h-screen bg-gradient-to-b from-sky-400 to-blue-600 font-sans p-4 relative">
            {notification && <div className="absolute top-5 right-5 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-bounce">{notification}</div>}
            <button onClick={() => setShowExitModal(true)} className="absolute top-4 left-4 bg-white/70 hover:bg-white text-gray-700 p-3 rounded-full shadow-lg transition-all transform hover:scale-110"><HomeIcon /></button>
            {showExitModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-sm mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Exit Game?</h2><p className="text-gray-600 mb-6">Are you sure you want to leave?</p>
                        <div className="flex justify-center gap-4"><button onClick={() => navigateTo('home')} className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition">Yes, Exit</button><button onClick={() => setShowExitModal(false)} className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-400 transition">No, Stay</button></div>
                    </div>
                </div>
            )}
            <div className="max-w-4xl mx-auto mt-16">
                <div className={`grid grid-cols-1 ${!isSinglePlayer && 'md:grid-cols-3'} gap-8`}>
                    {!isSinglePlayer && (
                        <div className="md:col-span-1 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{fontFamily: "'Comic Sans MS', 'cursive'"}}>Round {game.currentRound} of {game.totalRounds}</h2>
                            {game.isPrivate && (
                                <div className="mb-4">
                                    <p className="font-semibold text-gray-700">Room ID:</p>
                                    <div className="flex items-center gap-2 bg-gray-200 p-2 rounded-lg">
                                        <span className="text-sm text-gray-600 truncate">{gameId}</span>
                                        <button onClick={handleCopyRoomId} className="ml-auto text-gray-500 hover:text-blue-600"><CopyIcon /></button>
                                    </div>
                                </div>
                            )}
                            <h3 className="font-semibold text-gray-700 mb-2">Leaderboard:</h3>
                            <ul className="space-y-2">
                                {sortedPlayers.map(p => (
                                    <li key={p.id} className={`flex items-center gap-3 p-2 rounded-lg ${p.id === userId ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                        <span className="font-bold text-lg text-purple-700 w-8">{p.score}</span>
                                        <span className="font-medium text-gray-700">{p.name}</span>
                                        {p.roundStatus === 'won' && <span className="ml-auto text-green-500 font-bold">✓</span>}
                                        {p.roundStatus === 'lost' && <span className="ml-auto text-red-500 font-bold">✗</span>}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className={`${isSinglePlayer ? 'col-span-1' : 'md:col-span-2'} bg-white/60 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center`}>
                        {game.status === 'waiting' && !isSinglePlayer && (
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-700 mb-4">Waiting for players...</h2>
                                {isAdmin && <button onClick={startGame} disabled={game.isPrivate && game.players.length < 1} className="bg-green-500 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed">{game.isPrivate && game.players.length < 1 ? 'Need 1+ Player' : 'Start Game!'}</button>}
                            </div>
                        )}
                        {game.status === 'playing' && me && (
                            <>
                                {!isSinglePlayer && <div className="w-full text-center mb-4">
                                    <div className="text-2xl font-bold text-red-600">{Math.ceil(timeLeft)}s</div>
                                    <div className="w-full bg-gray-300 rounded-full h-2.5"><div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / 30) * 100}%` }}></div></div>
                                </div>}
                                <HangmanCanvas incorrectGuesses={me.incorrectGuesses} isGameOver={isSinglePlayer ? game.status === 'finished' : me.roundStatus !== 'playing'} playerWon={isSinglePlayer ? game.playerResult === 'won' : me.roundStatus === 'won'} />
                                <WordDisplay word={game.word} guesses={me.guesses} />
                                {isSinglePlayer ? <Keyboard onGuess={handleGuess} guesses={me.guesses} /> : (me.roundStatus === 'playing' ? <Keyboard onGuess={handleGuess} guesses={me.guesses} /> : <div className="text-xl font-bold mt-4 h-12">{me.roundStatus === 'won' ? 'You got it!' : 'Better luck next round!'}</div>)}
                            </>
                        )}
                         {game.status === 'finished' && isSinglePlayer && (
                            <div className="text-center flex flex-col items-center">
                                <h2 className="text-4xl font-bold mt-4 mb-2 text-white">{game.playerResult === 'won' ? 'You Win!' : 'You Lose!'}</h2>
                                <p className="text-xl text-gray-200 mb-4">The word was: <span className="font-bold text-white">{game.word}</span></p>
                                <button onClick={startNewSinglePlayerGame} className="mt-6 bg-blue-500 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transform hover:scale-105 transition-all">New Game</button>
                            </div>
                        )}
                        {game.status === 'finished' && !isSinglePlayer && (
                             <Podium players={sortedPlayers} onPlayAgain={resetGame} isAdmin={isAdmin} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}