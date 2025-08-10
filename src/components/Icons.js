import React from 'react';
import { ReactComponent as GoldMedalSVG } from './images/gold.svg';
import { ReactComponent as SilverMedalSVG } from './images/silver.svg';
import { ReactComponent as BronzeMedalSVG } from './images/bronze.svg';


export const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
);

export const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
);

export const ArrowLeftCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 8l-4 4 4 4" /><path d="M16 12H8" /></svg>
);

export const ArrowRightCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 16l4-4-4-4" /><path d="M8 12h8" /></svg>
);

export const GoldMedalIcon = ({ className }) => (
    <GoldMedalSVG className={className} />
);

export const SilverMedalIcon = ({ className }) => (
    <SilverMedalSVG className={className} />
);

export const BronzeMedalIcon = ({ className }) => (
    <BronzeMedalSVG className={className} />
);

export const AnimatedTimer = ({ timeLeft }) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (timeLeft / 30) * circumference;
    const color = timeLeft <= 10 ? 'stroke-red-500' : 'stroke-green-500';

    return (
        <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 40 40">
                <circle
                    className="stroke-current text-gray-300"
                    strokeWidth="4"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                />
                <circle
                    className={`stroke-current ${color} transition-all duration-500`}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="20"
                    cy="20"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white">
                {Math.ceil(timeLeft)}s
            </span>
        </div>
    );
};