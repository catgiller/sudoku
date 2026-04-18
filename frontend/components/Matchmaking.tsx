import React, { useEffect, useState } from 'react';
import { Search, User } from 'lucide-react';
import { Difficulty } from '../types';

interface MatchmakingProps {
    difficulty: Difficulty;
    onMatchFound: (opponentName: string) => void;
}

const OPPONENT_NAMES = ['ShadowNinja', 'SudokuKing99', 'Brainiac', 'LogicMaster', 'PuzzleSolver_X', 'Guest_4829'];

export const Matchmaking: React.FC<MatchmakingProps> = ({ difficulty, onMatchFound }) => {
    const [dots, setDots] = useState('');
    const [status, setStatus] = useState('Searching for opponent');

    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        // Simulate finding a match after a random delay (2-5 seconds)
        const matchDelay = Math.floor(Math.random() * 3000) + 2000;
        
        const matchTimeout = setTimeout(() => {
            setStatus('Opponent found!');
            clearInterval(dotInterval);
            setDots('');
            
            // Wait a brief moment before starting
            setTimeout(() => {
                const randomName = OPPONENT_NAMES[Math.floor(Math.random() * OPPONENT_NAMES.length)];
                onMatchFound(randomName);
            }, 1500);

        }, matchDelay);

        return () => {
            clearInterval(dotInterval);
            clearTimeout(matchTimeout);
        };
    }, [onMatchFound]);

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] space-y-8">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-500 rounded-full blur-xl opacity-20 animate-pulse-fast"></div>
                <div className="relative bg-slate-800 p-6 rounded-full border-2 border-brand-500/50">
                    <Search size={48} className="text-brand-400 animate-pulse" />
                </div>
            </div>
            
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-slate-100">
                    {status}{dots}
                </h2>
                <p className="text-slate-400 uppercase tracking-widest text-sm">
                    Difficulty: <span className="text-brand-400 font-semibold">{difficulty}</span>
                </p>
            </div>

            <div className="flex items-center space-x-8 mt-12 opacity-50">
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-slate-700 p-3 rounded-full">
                        <User size={24} className="text-slate-300" />
                    </div>
                    <span className="text-sm font-medium">You</span>
                </div>
                <div className="text-2xl font-bold text-slate-600">VS</div>
                <div className="flex flex-col items-center space-y-2">
                    <div className="bg-slate-700 p-3 rounded-full animate-pulse">
                        <User size={24} className="text-slate-300" />
                    </div>
                    <span className="text-sm font-medium">???</span>
                </div>
            </div>
        </div>
    );
};
