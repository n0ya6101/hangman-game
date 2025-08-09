import React, { useEffect, useRef } from 'react';




export default function HangmanCanvas({ incorrectGuesses, isGameOver = false, playerWon = false }) {
    const canvasRef = useRef(null);

    // ADDED: Confetti effect on win
    useEffect(() => {
        if (playerWon && window.confetti) {
            window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        }
    }, [playerWon]);

    useEffect(() => {
        const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext('2d');
        const scale = window.devicePixelRatio || 1; canvas.width = 300 * scale; canvas.height = 350 * scale;
        canvas.style.width = '300px'; canvas.style.height = '350px'; ctx.scale(scale, scale);
        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.lineCap = 'round'; ctx.lineWidth = 3;
            drawWaterAndIsland(ctx, isGameOver && playerWon); 
            drawManAndBalloons(ctx, incorrectGuesses, isGameOver, playerWon);
        }; draw();
    }, [incorrectGuesses, isGameOver, playerWon]);
    
    const drawWaterAndIsland = (ctx, showIsland) => {
        const waterGradient = ctx.createLinearGradient(0, 300, 0, 350);
        waterGradient.addColorStop(0, '#38bdf8');
        waterGradient.addColorStop(1, '#0284c7');
        ctx.fillStyle = waterGradient;
        ctx.fillRect(0, 310, 300, 40);
        ctx.strokeStyle = '#7dd3fc';
        ctx.lineWidth = 1.5;
        for(let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(i * 30, 320 + (i%2 * 5));
            ctx.bezierCurveTo(i*30 + 10, 315 + (i%2 * 5), i*30 + 20, 325 + (i%2 * 5), i*30 + 30, 320 + (i%2 * 5));
            ctx.stroke();
        }
        if (showIsland) {
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.ellipse(150, 335, 80, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#a16207';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(180, 325);
            ctx.bezierCurveTo(175, 290, 190, 280, 185, 260);
            ctx.stroke();
            ctx.fillStyle = '#16a34a';
            for(let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(185, 260, 30, 10, (i * Math.PI * 2) / 5, 0, Math.PI);
                ctx.fill();
            }
        }
    };
    
    const drawManAndBalloons = (ctx, incorrectGuesses, isGameOver, playerWon) => {
        const balloonsLeft = 6 - incorrectGuesses;
        const startY = 50;
        const dropPerGuess = 38;
        const currentY = startY + incorrectGuesses * dropPerGuess;
        const balloonColors = ['#ef4444', '#f97316', '#84cc16', '#22c55e', '#3b82f6', '#8b5cf6'];
        const manX = 150, manY = currentY + 50;

        if (isGameOver && !playerWon) {
            drawDrowningMan(ctx, manX, 330);
        } else if (isGameOver && playerWon) {
            drawHappyMan(ctx, 140, 295);
        } else {
            drawMan(ctx, manX, manY);
            drawBalloons(ctx, manX, manY, balloonsLeft, balloonColors);
        }
    };

    const drawBalloons = (ctx, x, y, count, colors) => {
        const r = 18, pos = [{ x: -20, y: -10 }, { x: 20, y: -10 }, { x: 0, y: -30 }, { x: -35, y: -35 }, { x: 35, y: -35 }, { x: 15, y: -50 }];
        // MODIFIED: Balloon strings now originate from the hand
        const handX = x - 18;
        const handY = y + 18;
        for (let i = 0; i < count; i++) {
            ctx.strokeStyle = '#4b5563'; ctx.beginPath();
            ctx.moveTo(handX, handY); 
            ctx.lineTo(x + pos[i].x, y + pos[i].y); ctx.stroke();
            ctx.fillStyle = colors[i]; ctx.beginPath(); ctx.arc(x + pos[i].x, y + pos[i].y - r, r, 0, Math.PI * 2); ctx.fill();
        }
    };

    const drawMan = (ctx, x, y) => {
        ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + 15); ctx.lineTo(x, y + 50); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + 25); ctx.lineTo(x - 20, y + 15); ctx.moveTo(x, y + 25); ctx.lineTo(x + 20, y + 35); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x, y + 50); ctx.lineTo(x - 15, y + 75); ctx.moveTo(x, y + 50); ctx.lineTo(x + 15, y + 75); ctx.stroke();
    };
    
    const drawDrowningMan = (ctx, x, y) => {
        ctx.strokeStyle = '#1f2937'; ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 15, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 25, y - 5); ctx.lineTo(x - 15, y - 15);
        ctx.moveTo(x + 25, y - 5); ctx.lineTo(x + 15, y - 15);
        ctx.stroke();
    };

    const drawHappyMan = (ctx, x, y) => { drawMan(ctx, x, y); ctx.beginPath(); ctx.arc(x, y + 5, 8, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); };
    return <canvas ref={canvasRef} />;
}