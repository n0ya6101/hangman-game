import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftCircle, ArrowRightCircle } from './Icons';


function CustomizationCanvas({ faceOptions, faceParts }) {
    const canvasRef = useRef(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const scale = window.devicePixelRatio || 1;
        canvas.width = 150 * scale;
        canvas.height = 150 * scale;
        canvas.style.width = '150px';
        canvas.style.height = '150px';
        ctx.scale(scale, scale);
        ctx.clearRect(0, 0, 150, 150);
        ctx.strokeStyle = '#1f2937';
        ctx.fillStyle = '#1f2937';
        ctx.lineWidth = 2;
        const x = 75, y = 75;
        ctx.beginPath();
        ctx.arc(x, y, 45, 0, Math.PI * 2);
        ctx.stroke();
        faceParts.eyes[faceOptions.eyes](ctx, x, y);
        faceParts.mouths[faceOptions.mouths](ctx, x, y);
        faceParts.hats[faceOptions.hats](ctx, x, y - 45);
    }, [faceOptions, faceParts]);
    return <div className="flex justify-center my-4"><canvas ref={canvasRef} /></div>;
}

export default function ProfileSetup({ onProfileSave }) {
    const [username, setUsername] = useState('');
    const [faceOptions, setFaceOptions] = useState({ eyes: 0, mouths: 0, hats: 0 });
    
    const faceParts = {
        eyes: [
            (ctx, x, y) => { ctx.beginPath(); ctx.arc(x - 10, y, 3, 0, Math.PI * 2); ctx.arc(x + 10, y, 3, 0, Math.PI * 2); ctx.fill(); },
            (ctx, x, y) => { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 12, y - 3); ctx.lineTo(x - 7, y + 3); ctx.moveTo(x - 7, y - 3); ctx.lineTo(x - 12, y + 3); ctx.moveTo(x + 12, y - 3); ctx.lineTo(x + 7, y + 3); ctx.moveTo(x + 7, y - 3); ctx.lineTo(x + 12, y + 3); ctx.stroke(); ctx.lineWidth = 2; },
            (ctx, x, y) => { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 12, y); ctx.lineTo(x - 7, y); ctx.moveTo(x + 7, y); ctx.lineTo(x + 12, y); ctx.stroke(); ctx.lineWidth = 2; },
        ],
        mouths: [
            (ctx, x, y) => { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y + 8, 7, 0, Math.PI); ctx.stroke(); ctx.lineWidth = 2; },
            (ctx, x, y) => { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - 8, y + 8); ctx.lineTo(x + 8, y + 8); ctx.stroke(); ctx.lineWidth = 2; },
            (ctx, x, y) => { ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y + 12, 7, Math.PI, Math.PI * 2); ctx.stroke(); ctx.lineWidth = 2; },
        ],
        hats: [
            (ctx, x, y) => {}, 
            (ctx, x, y) => { ctx.beginPath(); ctx.rect(x - 20, y - 30, 40, 12); ctx.rect(x-25, y-18, 50, 6); ctx.fill(); },
            (ctx, x, y) => { ctx.beginPath(); ctx.moveTo(x, y - 45); ctx.lineTo(x + 20, y - 18); ctx.lineTo(x - 20, y - 18); ctx.closePath(); ctx.fill(); },
        ]
    };

    const cycleOption = (part, direction) => {
        setFaceOptions(prev => {
            const max = faceParts[part].length;
            const current = prev[part];
            const next = (current + direction + max) % max;
            return { ...prev, [part]: next };
        });
    };

    const handleSave = () => {
        if (username.trim()) {
            onProfileSave({ username: username.trim(), face: faceOptions });
        } else {
            alert('Please enter a username.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 font-sans p-4 flex flex-col items-center justify-center">
            <div className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4" style={{ fontFamily: "'Comic Sans MS', 'Chalkduster', 'cursive'" }}>Create Your Profile</h1>
                <p className="text-gray-600 mb-8">Customize your character before you play!</p>
                <CustomizationCanvas faceOptions={faceOptions} faceParts={faceParts} />
                <div className="space-y-4 my-8">
                    <div className="flex items-center justify-between"><span className="font-semibold text-lg">Eyes</span><div className="flex items-center gap-2"><button onClick={() => cycleOption('eyes', -1)} className="text-gray-600 hover:text-black"><ArrowLeftCircle /></button><button onClick={() => cycleOption('eyes', 1)} className="text-gray-600 hover:text-black"><ArrowRightCircle /></button></div></div>
                    <div className="flex items-center justify-between"><span className="font-semibold text-lg">Mouth</span><div className="flex items-center gap-2"><button onClick={() => cycleOption('mouths', -1)} className="text-gray-600 hover:text-black"><ArrowLeftCircle /></button><button onClick={() => cycleOption('mouths', 1)} className="text-gray-600 hover:text-black"><ArrowRightCircle /></button></div></div>
                    <div className="flex items-center justify-between"><span className="font-semibold text-lg">Hat</span><div className="flex items-center gap-2"><button onClick={() => cycleOption('hats', -1)} className="text-gray-600 hover:text-black"><ArrowLeftCircle /></button><button onClick={() => cycleOption('hats', 1)} className="text-gray-600 hover:text-black"><ArrowRightCircle /></button></div></div>
                </div>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-shadow mb-6" />
                <button onClick={handleSave} className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg shadow-lg transform hover:scale-105 transition-all">Save and Play!</button>
            </div>
        </div>
    );
}